import { buildApp } from '../../src/app.js';
import type { AppConfig } from '../../src/config/env.js';
import { createTestConfig } from './config.js';

export type TestApp = Awaited<ReturnType<typeof buildApp>>;

export async function buildTestApp(overrides: Partial<AppConfig> = {}): Promise<TestApp> {
  return buildApp({ config: createTestConfig(overrides) });
}
