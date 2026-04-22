import { describe, expect, it } from 'vitest';
import { parseAppEnv } from '../env';

describe('parseAppEnv', () => {
  it('parses the required app env values', () => {
    expect(
      parseAppEnv({
        VITE_API_URL: 'http://localhost:8080/',
        MODE: 'development',
        DEV: true,
        PROD: false,
      })
    ).toEqual({
      apiUrl: 'http://localhost:8080',
      mode: 'development',
      isDev: true,
      isProd: false,
      isTest: false,
    });
  });

  it('throws when VITE_API_URL is missing', () => {
    expect(() => parseAppEnv({ MODE: 'test' })).toThrowError(
      'VITE_API_URL is required'
    );
  });

  it('derives mode flags when optional DEV and PROD values are omitted', () => {
    expect(
      parseAppEnv({
        VITE_API_URL: 'http://localhost:8080/',
      })
    ).toEqual({
      apiUrl: 'http://localhost:8080',
      mode: 'production',
      isDev: false,
      isProd: true,
      isTest: false,
    });
  });
});
