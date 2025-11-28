/**
 * Retrieves an environment variable safely.
 *
 * @param key The environment variable key.
 * @param fallback A fallback value if the variable is missing.
 * @returns The environment variable value or the fallback.
 * @throws Error if the variable is missing and no fallback is provided.
 */
export const getEnv = (key: string, fallback?: string): string => {
  let value: string | undefined;

  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    value = process.env[key];
  }

  // Browser/Vite environment
  // Note: Vite replaces import.meta.env.KEY at build time.
  // Dynamic access like import.meta.env[key] works in development but might not in production
  // if not explicitly configured. However, for a shared utility, we can try accessing it
  // if the environment supports it.
  // We use a safe check for import.meta
  else if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    value = (import.meta as any).env[key] || (import.meta as any).env[`VITE_${key}`];
  }

  if (value !== undefined && value !== '') {
    return value;
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Missing environment variable ${key}`);
};
