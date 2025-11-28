import type { ProcessedMapData } from '@tensrai/shared';
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

import { api, apiClient } from '../api';

export interface LoadMapAssetsOptions {
  mapId: string;
  cacheEnabled?: boolean;
  timeout?: number;
  useOptimizedParser?: boolean;
  pgmQuality?: number;
  retryFailedOperations?: boolean;
  maxRetries?: number;
}

// ... (keep cache config and state)

export async function loadMapAssets(
  options: LoadMapAssetsOptions
): Promise<ProcessedMapDataWithBitmap> {
  const { mapId, cacheEnabled = true, timeout = CACHE_CONFIG.DEFAULT_TIMEOUT } = options;
  const cacheKey = `map_${mapId}`;

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
      // 1. Load Metadata from API
      const mapData = await apiClient.get<any>(`maps/${mapId}`);

      if (!mapData.success || !mapData.data) {
        throw new Error('Failed to load map metadata');
      }

      const { metadata, features } = mapData.data;

      // 2. Load PGM Image from API
      const pgmResponse = await api.get(`maps/${mapId}/image`, {
        timeout,
        retry: options.retryFailedOperations ? (options.maxRetries ?? 3) : 0,
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
            yaml: metadata,
            useOptimized: options.useOptimizedParser ?? pgmBuffer.byteLength > 5 * 1024 * 1024,
            pgmQuality: options.pgmQuality,
          } as MapWorkerRequest,
          [pgmBuffer]
        );
      });

      const meta = {
        width: result.width,
        height: result.height,
        resolution: metadata.resolution,
        origin: metadata.origin,
        occupiedThresh: metadata.occupied_thresh ?? 0.65,
        freeThresh: metadata.free_thresh ?? 0.196,
      };

      const processedData: ProcessedMapDataWithBitmap = {
        imageData: {
          width: result.width,
          height: result.height,
          data: new Uint8ClampedArray(0),
        },
        meta,
        imageBitmap: result.bitmap,
        features, // Pass features through
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
