import type { Pool } from 'pg';

export interface DependencyCheck {
  name: string;
  status: 'up' | 'down';
  latencyMs: number | null;
}

export async function checkDatabase(pool: Pool): Promise<DependencyCheck> {
  const startedAt = process.hrtime.bigint();

  try {
    await pool.query('select 1');
    return {
      name: 'postgresql',
      status: 'up',
      latencyMs: elapsedMilliseconds(startedAt),
    };
  } catch {
    return {
      name: 'postgresql',
      status: 'down',
      latencyMs: null,
    };
  }
}

function elapsedMilliseconds(startedAt: bigint): number {
  return Number((process.hrtime.bigint() - startedAt) / 1_000_000n);
}
