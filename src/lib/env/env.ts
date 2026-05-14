import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().trim().min(1, 'VITE_API_URL is required'),
  MODE: z.string().optional(),
  DEV: z.boolean().optional(),
  PROD: z.boolean().optional(),
});

export type AppEnv = {
  apiUrl: string;
  mode: string;
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
};

let cachedEnv: AppEnv | null = null;

type EnvSource = Partial<{
  VITE_API_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
}>;

export function parseAppEnv(source: EnvSource): AppEnv {
  if (!source.VITE_API_URL?.trim()) {
    throw new Error('VITE_API_URL is required');
  }

  const parsed = envSchema.parse(source);
  const mode = parsed.MODE ?? 'production';

  return {
    apiUrl: parsed.VITE_API_URL.replace(/\/+$/, ''),
    mode,
    isDev: parsed.DEV ?? mode === 'development',
    isProd: parsed.PROD ?? mode === 'production',
    isTest: mode === 'test',
  };
}

export function getAppEnv() {
  cachedEnv ??= parseAppEnv(import.meta.env);

  return cachedEnv;
}
