# SentinelAI Foundation Review

| Field | Value |
| --- | --- |
| Document | Foundation review and Phase 2 baseline |
| Version | 1.0 |
| Status | Approved for Phase 2 planning |
| Last updated | 2026-11-07 |
| Related documents | [PRD](../PRD.md), [User flows](USER_FLOWS.md), [User stories](USER_STORIES.md), [Acceptance criteria](ACCEPTANCE_CRITERIA.md), [Architecture](ARCHITECTURE.md), [Database schema](DATABASE_SCHEMA.md), [API specification](API_SPECIFICATION.md) |

---

## 1. Purpose

This review confirms that the product, workflow, architecture, data, API, and
security foundations are complete and internally consistent enough to begin
Phase 2 implementation. It records verification evidence, known gaps, and the
agreed Phase 2 scope.

## 2. Scope reviewed

| Area | Document | Result |
| --- | --- | --- |
| Product scope, personas, success criteria, non-goals | `PRD.md` | Pass |
| Actors, journeys, use cases, state models | `docs/USER_FLOWS.md` | Pass |
| Epics, stories, priorities, traceability | `docs/USER_STORIES.md` | Pass |
| Testable acceptance criteria | `docs/ACCEPTANCE_CRITERIA.md` | Pass |
| System architecture, modules, AI/RAG/MCP, security | `docs/ARCHITECTURE.md` | Pass |
| Entity model, tables, constraints, tenancy, retention | `docs/DATABASE_SCHEMA.md` | Pass |
| REST contract, errors, auth, pagination, webhooks | `docs/API_SPECIFICATION.md` | Pass |
| Local development environment | `package.json`, `compose.yaml`, `scripts/`, `infra/` | Pass |

## 3. Verification evidence

| Check | Result |
| --- | --- |
| Document set present and cross-linked | Pass; all six foundation documents are indexed from `README.md`. |
| Unresolved `TBD`/`TODO`/`FIXME`/placeholder markers | None found. |
| Epics | 15 (E1–E15). |
| User stories | 95 (US-001–US-147, gapped numbering). |
| Acceptance criteria | 133 (AC-X, AC-REG, AC-AUTH, AC-PWD, AC-ORG, AC-INVITE, AC-PROJ, AC-ENV, AC-KEY, AC-INGEST, AC-INC-CREATE, AC-INC-INVEST, AC-AI, AC-APPROVE, AC-RESOLVE). |
| User flows | 14 (UF-01–UF-14). |
| API specification structure | 12 groups, balanced code fences, no `CHUNK-` markers, all referenced error codes documented, all referenced AC IDs defined. |
| Fresh environment setup | `npm run infra:reset && npm run setup` passes with PostgreSQL and Redis connectivity verified. |
| Static checks | `npm run check` and `docker compose config --quiet` pass. |

## 4. Architecture and security review

- The modular monolith, REST boundary, queue topology, worker pipeline, AI
  service, RAG retrieval, and MCP execution model are defined with explicit
  module dependency rules.
- Tenant isolation is enforced through composite tenant foreign keys, repository
  scoping, mandatory `org_id` predicates in ClickHouse, and optional PostgreSQL
  RLS as defense-in-depth.
- Authentication uses server-side sessions; ingestion uses hashed, scoped,
  expiring API keys; service-to-service calls use mTLS or signed tokens.
- Audit is append-only and retention-bound; approval decisions are immutable;
  sensitive values are redacted before logs, audit, and AI prompts.
- AI guardrails treat telemetry as untrusted, validate structured output, bound
  tool arguments, and require human approval for writes.
- Error handling uses RFC 9457 Problem Details with stable codes, trace IDs, and
  no secret or internal detail leakage.

**Verdict:** the security model is sufficient for private-beta scope. Formal
certifications and enterprise identity remain post-MVP as stated in the PRD.

## 5. Findings and follow-ups

| ID | Finding | Impact | Disposition |
| --- | --- | --- | --- |
| FR-01 | The documents define release phases but no explicit "Phase 2"; the implementation backlog is derived from epics E1–E15 plus platform workstreams. | Planning | Resolved by this review; Phase 2 = MVP implementation. |
| FR-02 | Local Compose provides PostgreSQL and Redis only; ClickHouse and object storage are not yet provisioned. | Ingestion and evidence work | Add an infrastructure issue; provision before E9/E11 integration. |
| FR-03 | The embedding model and dimension are open decisions; schema defaults to `vector(1536)`. | Knowledge/RAG work | Pin before the knowledge migration; tracked in E12. |
| FR-04 | Notification delivery tables and integration installations are not modeled yet. | Notifications work | Add when the Notifications module starts; tracked in E10/E14. |
| FR-05 | PostgreSQL RLS is described as optional defense-in-depth; application scoping plus composite tenant keys are authoritative. | Security | Accept for MVP; add RLS tests only if enabled. |
| FR-06 | ClickHouse ingestion-health read model is deferred. | Ingestion health UI | Track with E9. |
| FR-07 | GitHub Projects v2 board requires the `project` token scope, absent from the current CLI login. | Backlog visibility | Deferred until `gh auth refresh -s project` is completed; issues and milestone are created regardless. |

## 6. Phase 2 scope

Phase 2 is the implementation of the private-beta MVP: all P0 scope and selected
P1 stories from the PRD, delivered as vertical slices.

| Workstream | Epics / scope |
| --- | --- |
| Platform foundations | API skeleton, configuration, observability, migrations, CI, ClickHouse and object storage |
| Identity and access | E1 registration, E2 login/session, E3 password recovery |
| Tenancy and configuration | E4 organizations, E5 invitations, E6 projects, E7 environments, E8 API keys |
| Telemetry | E9 log ingestion, correlation, search |
| Incident lifecycle | E10 creation, E11 investigation, E14 resolution |
| Intelligence and control | E12 AI recommendations, E13 human approval |
| Cross-cutting | E15 security, audit, accessibility, observability, retention |

## 7. Open decisions carried into Phase 2

1. Pin the embedding model and dimension before the knowledge migration.
2. Decide whether per-document knowledge ACL normalization is needed for beta.
3. Confirm audit partitioning remains deferred for beta volume.
4. Confirm ClickHouse and object storage hosting for local and beta environments.
5. Confirm the first deployment integration beyond GitHub Actions and Argo CD.

## 8. Approval

The foundation is approved for Phase 2 implementation. Acceptance criteria remain
the source of truth for story completion, and any scope change must update the
PRD, user stories, and acceptance criteria together.
