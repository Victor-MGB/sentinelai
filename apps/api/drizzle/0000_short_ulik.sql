CREATE SCHEMA "platform";
--> statement-breakpoint
CREATE TABLE "platform"."idempotency_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text,
	"scope" text NOT NULL,
	"key" text NOT NULL,
	"request_fingerprint" text NOT NULL,
	"status" text NOT NULL,
	"response_status" integer,
	"response_body" jsonb,
	"expires_at" timestamp (6) with time zone NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."job_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"queue" text NOT NULL,
	"job_name" text NOT NULL,
	"job_id" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"payload" jsonb NOT NULL,
	"result" jsonb,
	"error" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp (6) with time zone,
	"finished_at" timestamp (6) with time zone,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform"."outbox_events" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text,
	"aggregate_type" text NOT NULL,
	"aggregate_id" text NOT NULL,
	"event_type" text NOT NULL,
	"event_version" integer DEFAULT 1 NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"available_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp (6) with time zone,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idempotency_keys_org_scope_key_key" ON "platform"."idempotency_keys" USING btree ("org_id","scope","key");--> statement-breakpoint
CREATE INDEX "idempotency_keys_expires_at_idx" ON "platform"."idempotency_keys" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "job_runs_job_id_key" ON "platform"."job_runs" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_runs_status_created_at_idx" ON "platform"."job_runs" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "outbox_events_unpublished_idx" ON "platform"."outbox_events" USING btree ("available_at") WHERE "platform"."outbox_events"."published_at" is null;--> statement-breakpoint
CREATE INDEX "outbox_events_org_occurred_idx" ON "platform"."outbox_events" USING btree ("org_id","occurred_at");