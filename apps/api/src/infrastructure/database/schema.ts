import { sql } from 'drizzle-orm';
import { index, integer, jsonb, pgSchema, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const platformSchema = pgSchema('platform');

export const jobRuns = platformSchema.table(
  'job_runs',
  {
    id: text('id').primaryKey(),
    queue: text('queue').notNull(),
    jobName: text('job_name').notNull(),
    jobId: text('job_id').notNull(),
    status: text('status').notNull().default('queued'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
    result: jsonb('result').$type<Record<string, unknown> | null>(),
    error: text('error'),
    attempts: integer('attempts').notNull().default(0),
    startedAt: timestamp('started_at', { withTimezone: true, precision: 6 }),
    finishedAt: timestamp('finished_at', { withTimezone: true, precision: 6 }),
    createdAt: timestamp('created_at', { withTimezone: true, precision: 6 }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, precision: 6 }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('job_runs_job_id_key').on(table.jobId),
    index('job_runs_status_created_at_idx').on(table.status, table.createdAt),
  ],
);

export const outboxEvents = platformSchema.table(
  'outbox_events',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id'),
    aggregateType: text('aggregate_type').notNull(),
    aggregateId: text('aggregate_id').notNull(),
    eventType: text('event_type').notNull(),
    eventVersion: integer('event_version').notNull().default(1),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),
    occurredAt: timestamp('occurred_at', { withTimezone: true, precision: 6 })
      .notNull()
      .defaultNow(),
    availableAt: timestamp('available_at', { withTimezone: true, precision: 6 })
      .notNull()
      .defaultNow(),
    publishedAt: timestamp('published_at', { withTimezone: true, precision: 6 }),
    attempts: integer('attempts').notNull().default(0),
    lastError: text('last_error'),
    createdAt: timestamp('created_at', { withTimezone: true, precision: 6 }).notNull().defaultNow(),
  },
  (table) => [
    index('outbox_events_unpublished_idx')
      .on(table.availableAt)
      .where(sql`${table.publishedAt} is null`),
    index('outbox_events_org_occurred_idx').on(table.orgId, table.occurredAt),
  ],
);

export const idempotencyKeys = platformSchema.table(
  'idempotency_keys',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id'),
    scope: text('scope').notNull(),
    key: text('key').notNull(),
    requestFingerprint: text('request_fingerprint').notNull(),
    status: text('status').notNull(),
    responseStatus: integer('response_status'),
    responseBody: jsonb('response_body').$type<Record<string, unknown> | null>(),
    expiresAt: timestamp('expires_at', { withTimezone: true, precision: 6 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, precision: 6 }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idempotency_keys_org_scope_key_key').on(table.orgId, table.scope, table.key),
    index('idempotency_keys_expires_at_idx').on(table.expiresAt),
  ],
);

export type JobRunRow = typeof jobRuns.$inferSelect;
export type NewJobRunRow = typeof jobRuns.$inferInsert;
