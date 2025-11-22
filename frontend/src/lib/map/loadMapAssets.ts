import type { MapYamlMetadata, ProcessedMapData } from '@tensrai/shared';
import { load } from 'js-yaml';

export interface LoadMapAssetsOptions {
  yamlPath: string;
  basePath?: string;
  cacheEnabled?: boolean;
  timeout?: number;
  useOptimizedParser?: boolean;
  pgmQuality?: number;
  chunkSize?: number;
  progressCallback?: (progress: number) => void;
  retryFailedOperations?: boolean;
  maxRetries?: number;
}

const CACHE_CONFIG = {
  MAX_SIZE: 10,
  DEFAULT_TIMEOUT: 30000,
};

// Module-level cache state
const cache = new Map<string, { promise: Promise<ProcessedMapData>; timestamp: number }>();
const accessOrder = new Map<string, number>();
let counter = 0;

function getFromCache(key: string): Promise<ProcessedMapData> | undefined {
  const entry = cache.get(key);
  if (entry) {
    counter++;
    accessOrder.set(key, counter);
    return entry.promise;
  }
  return undefined;
}

function evictOldest(): void {
  let oldestKey: string | undefined;
  let oldestAccess = Infinity;

  for (const [key, accessTime] of Array.from(accessOrder.entries())) {
    if (accessTime < oldestAccess) {
      oldestAccess = accessTime;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    deleteFromCache(oldestKey);
  }
}

function addToCache(key: string, promise: Promise<ProcessedMapData>): void {
  if (cache.size >= CACHE_CONFIG.MAX_SIZE) {
    evictOldest();
  }

  cache.set(key, { promise, timestamp: Date.now() });
  counter++;
  accessOrder.set(key, counter);
}

function deleteFromCache(key: string): boolean {
  const deleted = cache.delete(key);
  accessOrder.delete(key);
  return deleted;
}

function clearCache(): void {
  cache.clear();
  accessOrder.clear();
  counter = 0;
}

function getCacheKeys(): string[] {
  return Array.from(cache.keys());
}

function getCacheSize(): number {
  return cache.size;
}

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create a fetch with timeout and retry logic
 */
async function fetchWithRetry(
  url: string,
  options: { timeout: number; maxRetries?: number; retryDelay?: number }
): Promise<Response> {
  const { timeout, maxRetries = 3, retryDelay = 1000 } = options;
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries + 1; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error('Unknown fetch error');

      // Don't retry on certain error types
      if (
        error instanceof Error &&
        (error.name === 'AbortError' ||
          error.message.includes('404') ||
          error.message.includes('403'))
      ) {
        throw lastError;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`Failed to fetch after ${maxRetries} retries: ${lastError.message}`);
      }

      // Wait before retry with exponential backoff
      await delay(retryDelay * 2 ** attempt);
    }
  }

  throw new Error('Failed to fetch: Unknown error');
}

import type { MapWorkerRequest, MapWorkerResponse } from './map.worker';
import MapWorker from './map.worker?worker';

export interface ProcessedMapDataWithBitmap extends ProcessedMapData {
  imageBitmap?: ImageBitmap;
}

let mapWorker: Worker | null = null;

function getMapWorker(): Worker {
  if (!mapWorker) {
    mapWorker = new MapWorker();
  }
  return mapWorker;
}

export async function loadMapAssets(
  options: LoadMapAssetsOptions
): Promise<ProcessedMapDataWithBitmap> {
  const {
    yamlPath,
    basePath = '',
    cacheEnabled = true,
    timeout = CACHE_CONFIG.DEFAULT_TIMEOUT,
  } = options;
  const cacheKey = `${basePath}${yamlPath}`;

  // Check cache first
  if (cacheEnabled) {
    const cachedPromise = getFromCache(cacheKey);
    if (cachedPromise) {
      return cachedPromise as Promise<ProcessedMapDataWithBitmap>;
    }
  }

  // Create loading promise
  const loadingPromise = (async () => {
    try {
      // 1. Load YAML
      const yamlUrl = resolvePath(yamlPath, basePath);
      const yamlResponse = await fetchWithRetry(yamlUrl, {
        timeout,
        maxRetries: options.retryFailedOperations ? (options.maxRetries ?? 3) : 0,
        retryDelay: 1000,
      });

      if (!yamlResponse.ok) throw new Error(`Failed to load YAML: ${yamlResponse.status}`);
      const yamlText = await yamlResponse.text();
      const yamlMetadata = load(yamlText) as MapYamlMetadata;
      validateYamlMetadata(yamlMetadata);

      const pgmUrl = resolvePath(yamlMetadata.image, yamlPath);
      const pgmResponse = await fetchWithRetry(pgmUrl, {
        timeout,
        maxRetries: options.retryFailedOperations ? (options.maxRetries ?? 3) : 0,
        retryDelay: 1000,
      });

      if (!pgmResponse.ok) throw new Error(`Failed to load PGM: ${pgmResponse.status}`);
      const pgmBuffer = await pgmResponse.arrayBuffer();

      const worker = getMapWorker();

      const result = await new Promise<MapWorkerResponse>((resolve, reject) => {
        const handleMessage = (e: MessageEvent<MapWorkerResponse>) => {
          if (e.data.type === 'MAP_PROCESSED') {
            worker.removeEventListener('message', handleMessage);
            if (e.data.error) reject(new Error(e.data.error));
            else resolve(e.data);
          }
        };

        worker.addEventListener('message', handleMessage);

        worker.postMessage(
          {
            type: 'PROCESS_MAP',
            pgmBuffer,
            yaml: yamlMetadata,
            useOptimized: options.useOptimizedParser ?? pgmBuffer.byteLength > 5 * 1024 * 1024,
            pgmQuality: options.pgmQuality,
          } as MapWorkerRequest,
          [pgmBuffer]
        );
      });

      const meta = {
        width: result.width,
        height: result.height,
        resolution: yamlMetadata.resolution,
        origin: yamlMetadata.origin,
        occupiedThresh: yamlMetadata.occupied_thresh ?? 0.65,
        freeThresh: yamlMetadata.free_thresh ?? 0.196,
      };

      const processedData: ProcessedMapDataWithBitmap = {
        imageData: {
          width: result.width,
          height: result.height,
          data: new Uint8ClampedArray(0),
        },
        meta,
        imageBitmap: result.bitmap,
      };

      return processedData;
    } catch (error) {
      deleteFromCache(cacheKey);
      throw error;
    }
  })();

  if (cacheEnabled) {
    addToCache(cacheKey, loadingPromise);
  }

  return loadingPromise;
}

function resolvePath(path: string, basePath: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const origin =
    typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost';

  let viteBase = '/';
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
      viteBase = import.meta.env.BASE_URL;
    }
  } catch {
    viteBase = '/';
  }

  const normalizedBase = viteBase.endsWith('/') ? viteBase : `${viteBase}/`;
  const baseOrigin =
    origin.replace(/\/$/, '') +
    (normalizedBase.startsWith('/') ? normalizedBase : `/${normalizedBase}`);

  const absoluteFromRoot = (relativePath: string) => {
    const cleaned = relativePath.replace(/^\/+/, '');
    return new URL(cleaned, baseOrigin).href;
  };

  if (path.startsWith('/')) {
    return absoluteFromRoot(path);
  }

  const baseUrl = basePath
    ? basePath.startsWith('http://') || basePath.startsWith('https://')
      ? basePath
      : absoluteFromRoot(basePath)
    : baseOrigin;

  const baseDir = baseUrl.endsWith('/')
    ? baseUrl
    : `${baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1)}`;

  return new URL(path, baseDir).href;
}

function validateYamlMetadata(metadata: MapYamlMetadata): void {
  if (!metadata.image) {
    throw new Error('Map YAML missing required "image" field');
  }

  if (typeof metadata.resolution !== 'number' || metadata.resolution <= 0) {
    throw new Error('Map YAML requires valid "resolution" > 0');
  }

  if (!Array.isArray(metadata.origin) || metadata.origin.length !== 3) {
    throw new Error('Map YAML requires "origin" as [x, y, yaw]');
  }

  metadata.origin.forEach((val, idx) => {
    if (typeof val !== 'number') {
      throw new Error(`Map YAML origin[${idx}] must be a number`);
    }
  });
}

export function clearMapAssetCache(): void {
  clearCache();
}

export function evictFromCache(yamlPath: string, basePath: string = ''): void {
  const cacheKey = `${basePath}${yamlPath}`;
  deleteFromCache(cacheKey);
}

export function getCacheStats(): { size: number; keys: string[]; maxSize: number } {
  return {
    size: getCacheSize(),
    maxSize: CACHE_CONFIG.MAX_SIZE,
    keys: getCacheKeys(),
  };
}

export { loadMapAssets as default };
