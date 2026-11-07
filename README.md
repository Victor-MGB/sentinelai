# SentinelAI

SentinelAI is an AI-assisted reliability and incident response platform for
cloud-native engineering teams. It correlates alerts, metrics, logs, traces,
and deployment events into a single incident view, then produces evidence-backed
root-cause hypotheses so teams can detect, diagnose, and resolve production
issues faster.

> Status: Pre-implementation. The product scope is defined in
> [PRD.md](PRD.md).

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
├── infra/postgres/init/             # Local PostgreSQL initialization SQL
├── scripts/                         # Environment and connectivity checks
├── compose.yaml                     # PostgreSQL and Redis for local development
├── package.json                     # Root workspace and development scripts
├── tsconfig.json                    # TypeScript configuration
├── eslint.config.mjs                # ESLint configuration
├── .prettierrc.json                 # Prettier configuration
├── .env.example                     # Local environment template
├── .gitignore                       # Ignored files and directories
└── LICENSE                          # MIT license
```

## Getting started

There is no application code yet. The local development environment provides
Node.js tooling, PostgreSQL with pgvector, and Redis.

Prerequisites: Node.js 20+, npm 10+, Git, and Docker with Compose v2.

```bash
git clone https://github.com/Victor-MGB/sentinelai.git
cd sentinelai
npm install
npm run setup
```

`npm run setup` creates `.env` from `.env.example` when needed, starts
PostgreSQL and Redis, and verifies configuration and connectivity. Local
services bind to `localhost:55432` (PostgreSQL) and `localhost:56379` (Redis).
Change the ports in `.env` if they conflict with existing services.

Useful commands:

```bash
npm run infra:up      # Start PostgreSQL and Redis and wait for health
npm run infra:down    # Stop services while preserving data
npm run infra:reset   # Stop services and delete local volumes
npm run verify        # Re-run environment, database, and Redis checks
npm run check         # Typecheck, lint, and format check
npm run lint:fix      # Apply ESLint fixes
npm run format        # Apply Prettier formatting
```

## Contributing

Contributions will follow the workflow documented in `docs/` once the project
moves beyond the planning stage. For now, open an issue to discuss proposed
changes to the product requirements.

## License

Released under the [MIT License](LICENSE).
