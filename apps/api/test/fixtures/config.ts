import { loadEnv, type AppConfig } from '../../src/config/env.js';

export function createTestConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    ...loadEnv(),
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
    BODY_LIMIT_BYTES: 1024,
    RATE_LIMIT_MAX: 10_000,
    RATE_LIMIT_WINDOW_SECONDS: 60,
    ...overrides,
  };
}
