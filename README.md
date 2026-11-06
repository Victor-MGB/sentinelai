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

## Repository layout

```text
sentinelai/
├── README.md      # Project overview
├── PRD.md         # Product requirements document
├── docs/          # Supporting documentation
├── .gitignore     # Ignored files and directories
└── LICENSE        # MIT license
```

## Getting started

There is no application code yet. To work with the documentation locally:

```bash
git clone https://github.com/Victor-MGB/sentinelai.git
cd sentinelai
```

## Contributing

Contributions will follow the workflow documented in `docs/` once the project
moves beyond the planning stage. For now, open an issue to discuss proposed
changes to the product requirements.

## License

Released under the [MIT License](LICENSE).
