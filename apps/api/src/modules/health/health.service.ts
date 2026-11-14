import type { Redis } from 'ioredis';
import type { Pool } from 'pg';

import { checkDatabase } from '../../infrastructure/database/health.js';
import { checkRedis } from '../../infrastructure/queue/connection.js';

export interface DependencyCheck {
  name: string;
  status: 'up' | 'down';
  latencyMs: number | null;
}

export interface HealthStatus {
  status: 'ok' | 'degraded';
  version: string;
  uptimeSeconds: number;
}

export interface ReadinessStatus {
  status: 'ready' | 'not_ready';
  checks: DependencyCheck[];
}

export class HealthService {
  private readonly startedAt = Date.now();

  constructor(
    private readonly pool: Pool,
    private readonly redis: Redis,
    private readonly version: string,
  ) {}

  async getStatus(): Promise<HealthStatus> {
    const checks = await this.runChecks();

    return {
      status: checks.every((check) => check.status === 'up') ? 'ok' : 'degraded',
      version: this.version,
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
    };
  }

  getLiveness(): { status: 'alive' } {
    return { status: 'alive' };
  }

  async getReadiness(): Promise<ReadinessStatus> {
    const checks = await this.runChecks();
    const ready = checks.every((check) => check.status === 'up');

    return {
      status: ready ? 'ready' : 'not_ready',
      checks,
    };
  }

  private async runChecks(): Promise<DependencyCheck[]> {
    return Promise.all([checkDatabase(this.pool), checkRedis(this.redis)]);
  }
}
