# Architecture Diagrams

This directory contains the standalone Mermaid sources for the diagrams embedded
in [ARCHITECTURE.md](../ARCHITECTURE.md) and
[DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md). Keeping the sources here makes them
easy to review, version, and export without editing the documents.

| Diagram | Purpose |
| --- | --- |
| `system-context.mmd` | C4-style system context: users, telemetry sources, integrations, and SentinelAI. |
| `containers.mmd` | Container view: Next.js, Fastify API, workers, AI, MCP, data stores, and external systems. |
| `frontend.mmd` | Next.js rendering, data access, SSE, and error boundaries. |
| `backend-modules.mmd` | Layering and module structure of the modular monolith. |
| `queue-topology.mmd` | BullMQ queues, producers, consumers, and dead-letter handling. |
| `ingestion-pipeline.mmd` | Log ingestion from API key authentication through indexing and incident correlation. |
| `ai-rag-mcp.mmd` | AI recommendation flow through RAG retrieval, MCP tools, model output, and validation. |
| `security-zones.mmd` | Trust zones from the public internet to application, data, and restricted egress. |
| `error-handling.mmd` | Request and job error decision flow, retries, and dead-letter handling. |
| `data-flow.mmd` | End-to-end data movement across ingestion, processing, storage, and outputs. |
| `deployment.mmd` | Production deployment topology, subnets, HA data services, and external providers. |
| `erd.mmd` | Core and supporting database entities, tenancy relationships, and ownership links. |

## Rendering

GitHub renders the Mermaid blocks embedded in `ARCHITECTURE.md`. To export a
standalone SVG or PNG:

```bash
npx @mermaid-js/mermaid-cli -i system-context.mmd -o system-context.svg
```

Alternatively, use any Mermaid-compatible editor or the Mermaid Live Editor.
When a diagram changes, update both the `.mmd` source and the embedded copy in
`ARCHITECTURE.md` or `DATABASE_SCHEMA.md`.
