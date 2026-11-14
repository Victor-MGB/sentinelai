# SentinelAI

SentinelAI is an AI-assisted reliability and incident response platform for
cloud-native engineering teams. It correlates alerts, metrics, logs, traces,
and deployment events into a single incident view, then produces evidence-backed
root-cause hypotheses so teams can detect, diagnose, and resolve production
issues faster.

> Status: Phase 2 implementation. The frontend application shell and backend
> foundation are running. The product scope is defined in [PRD.md](PRD.md).

## Why SentinelAI

Modern engineering teams have more telemetry than they can use and more alerts
than they can act on. Signals live in separate tools, incident context is
rebuilt by hand under pressure, and postmortems are written from memory. The
result is alert fatigue, long mean time to resolution (MTTR), and preventable
reliability risk.

SentinelAI turns fragmented observability data into a correlated incident
narrative with clear evidence and recommended next steps.

## Who it is for

- Engineering managers who need visibility into reliability trends and team load.
- Backend developers who need fast root-cause context for the services they own.
- DevOps engineers who need deployment and configuration changes tied to incidents.
- Site reliability engineers who need noise reduction, correlation, and SLO insight.

## MVP scope

- OpenTelemetry-first ingestion for metrics, logs, traces, and alert webhooks.
- Service catalog with ownership and dependency mapping.
- Alert deduplication and incident correlation with noise reduction.
- Incident timeline and context assembly across integrated tools.
- AI-generated root-cause hypotheses with linked evidence.
- Natural-language incident assistant.
- Deployment and release event correlation.
- Slack, PagerDuty, and email notifications.
- SLO and error-budget visibility.
- Postmortem draft generation.
- Manager reliability dashboard.
- Role-based access control and audit logging.

See [PRD.md](PRD.md) for the full requirements, non-goals, and success criteria.

## Documentation

- [PRD.md](PRD.md): product problem, customers, users, MVP scope, and success criteria.
- [docs/USER_FLOWS.md](docs/USER_FLOWS.md): actors, use-case model, journey map, and detailed flows.
- [docs/USER_STORIES.md](docs/USER_STORIES.md): epics, story map, backlog, and traceability.
- [docs/ACCEPTANCE_CRITERIA.md](docs/ACCEPTANCE_CRITERIA.md): testable criteria for every major workflow.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): system architecture, API boundaries, modules, data, AI, security, and data flow.
- [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md): entity model, tables, constraints, indexes, tenancy, and retention.
- [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md): REST contract, authentication, errors, pagination, and webhooks.
- [docs/FOUNDATION_REVIEW.md](docs/FOUNDATION_REVIEW.md): foundation verification, findings, and Phase 2 scope.
- [docs/diagrams/](docs/diagrams/): standalone Mermaid sources for the architecture and database diagrams.

## Repository layout

```text
sentinelai/
├── README.md                        # Project overview
├── PRD.md                           # Product requirements document
├── docs/
│   ├── USER_FLOWS.md                # Journeys and use-case model
│   ├── USER_STORIES.md              # Epics and user stories
│   ├── ACCEPTANCE_CRITERIA.md       # Workflow acceptance criteria
│   ├── ARCHITECTURE.md              # System architecture and data flow
│   ├── DATABASE_SCHEMA.md           # Database entities, tables, and retention
│   └── diagrams/                    # Mermaid architecture and ERD sources
├── apps/
│   ├── api/                         # Fastify API and BullMQ worker
│   │   ├── drizzle/                 # Generated PostgreSQL migrations
│   │   ├── scripts/                 # Persistence and queue verification
│   │   ├── test/                    # Vitest fixtures, unit, and integration tests
│   │   ├── Dockerfile               # API and worker container image
│   │   └── src/                     # Config, infrastructure, modules, plugins
│   └── web/                         # Next.js App Router frontend
│       ├── app/                     # Routes, layouts, loading and error boundaries
│       ├── components/              # Shared UI primitives and layout components
│       ├── features/                # Feature-scoped client components
│       ├── lib/                     # Navigation, sample data, and utilities
│       └── Dockerfile               # Frontend container image
├── infra/postgres/init/             # Local PostgreSQL initialization SQL
├── scripts/                         # Environment and connectivity checks
├── .github/workflows/ci.yml         # Lint, typecheck, and test pipeline
├── compose.yaml                     # PostgreSQL, Redis, API, worker, and web stack
├── package.json                     # Root workspace and development scripts
├── tsconfig.json                    # TypeScript configuration
├── eslint.config.mjs                # ESLint configuration
├── .prettierrc.json                 # Prettier configuration
├── .env.example                     # Local environment template
├── .gitignore                       # Ignored files and directories
└── LICENSE                          # MIT license
```

## Getting started

The repository contains a Next.js frontend in `apps/web`, a Fastify API and
BullMQ worker in `apps/api`, and the local development environment for
PostgreSQL with pgvector and Redis.

Prerequisites: Node.js 20+, npm 10+, Git, and Docker with Compose v2.

```bash
git clone https://github.com/Victor-MGB/sentinelai.git
cd sentinelai
npm install
npm run setup
npm run db:migrate
npm run dev:api
npm run dev:worker
npm run dev:web
```

`npm run setup` creates `.env` from `.env.example` when needed, starts
PostgreSQL and Redis, and verifies configuration and connectivity. Local
services bind to `localhost:55432` (PostgreSQL) and `localhost:56379` (Redis).
Change the ports in `.env` if they conflict with existing services.

`npm run dev:api` starts the Fastify API at `http://localhost:3001` with health
checks under `/api/v1/health` and interactive OpenAPI documentation at
`http://localhost:3001/docs`. `npm run dev:worker` processes BullMQ jobs and
handles retries plus dead-letter delivery. `npm run dev:web` starts the Next.js
frontend at `http://localhost:3000`; the demo workspace is available at
`http://localhost:3000/app/acme`.

To run the entire production-style stack in containers instead of local Node
processes:

```bash
npm run stack:up      # Build and start PostgreSQL, Redis, migrations, API, worker, and web
npm run stack:logs    # Follow logs from every service
npm run stack:down    # Stop the stack while preserving data
```

The stack is available at `http://localhost:3000` (web), `http://localhost:3001`
(API), and `http://localhost:3001/docs` (OpenAPI UI). The migration service runs
once before the API and worker start. If those ports are already in use, override
the host mappings: `API_PORT=3101 WEB_PORT=3100 npm run stack:up`.

Integration tests require PostgreSQL and Redis. Run `npm run infra:up` and
`npm run db:migrate` before the first integration test run.

Useful commands:

```bash
npm run dev:api       # Start the Fastify API in development mode
npm run dev:worker    # Start the BullMQ worker in development mode
npm run dev:web       # Start the Next.js frontend in development mode
npm run db:generate   # Generate a Drizzle migration from the schema
npm run db:migrate    # Apply pending Drizzle migrations
npm run test:unit     # Run unit tests with Vitest
npm run test:integration # Run integration tests against local PostgreSQL and Redis
npm run test:coverage # Run the test suite with coverage
npm run verify:persistence # Verify PostgreSQL persistence and transactions
npm run verify:queue  # Verify queue processing, retries, and dead letters
npm run build:web     # Build the frontend for production
npm run lint:web      # Lint the frontend with Next.js ESLint rules
npm run typecheck:web # Type-check the frontend
npm run infra:up      # Start PostgreSQL and Redis and wait for health
npm run infra:down    # Stop services while preserving data
npm run infra:reset   # Stop services and delete local volumes
npm run stack:up      # Build and start the complete Docker Compose stack
npm run verify        # Re-run environment, database, and Redis checks
npm run check         # Typecheck, lint, and format check for all workspaces
npm run lint:fix      # Apply ESLint fixes
npm run format        # Apply Prettier formatting
```

## Contributing

Contributions follow the workflow documented in `docs/`. Use `npm run check`
before opening a pull request, and keep acceptance criteria as the source of
truth for story completion.

## License

Released under the [MIT License](LICENSE).
