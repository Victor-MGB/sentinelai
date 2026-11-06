# SentinelAI User Stories

| Field | Value |
| --- | --- |
| Document | User stories and story map |
| Version | 0.1 |
| Status | Draft for review |
| Last updated | 2026-11-06 |
| Related documents | [PRD](../PRD.md), [User flows](USER_FLOWS.md), [Acceptance criteria](ACCEPTANCE_CRITERIA.md) |

---

## 1. Purpose

This document turns the SentinelAI product requirements into an implementable,
traceable backlog. Each story expresses a user need, states the value, and links
to the workflow and acceptance criteria that prove it is complete.

### Writing conventions

- Format: "As a `<persona>`, I want `<capability>`, so that `<outcome>`."
- Every story is independently testable and small enough to deliver in one
  iteration.
- Priorities use MoSCoW. **Must** maps to PRD P0; **Should** maps to PRD P1.
- Story IDs are stable and referenced by the acceptance criteria document.
- A story is not complete until its linked acceptance criteria pass in an
  automated or documented test.

### Definition of ready

A story is ready for implementation when it has:

1. A clear persona, capability, and outcome.
2. A linked workflow and acceptance criteria.
3. Defined permissions and tenant scope.
4. Defined error and empty states.
5. A test approach and any required test data.
6. No unresolved product decision that would change the implementation.

### Definition of done

A story is done when:

1. All linked acceptance criteria pass.
2. Authorization and tenant-isolation checks are covered by tests.
3. Audit events are emitted where required.
4. Error, loading, empty, and success states are implemented.
5. Accessibility checks pass for the affected UI.
6. Documentation and API references are updated.
7. Product and engineering sign off in the demo.

---

## 2. Personas

| Persona | Description | Primary journeys |
| --- | --- | --- |
| Visitor | A person evaluating SentinelAI who has not registered. | Registration, login, password recovery |
| Organization owner | The accountable owner of a SentinelAI tenant. | Organization creation, members, billing, settings |
| Admin | A platform, DevOps, or SRE lead who configures the workspace. | Invitations, projects, environments, API keys |
| Backend developer | A service owner who responds to incidents affecting their code. | Login, investigation, AI recommendations, resolution |
| DevOps engineer | Owns delivery pipelines and change correlation. | Projects, environments, API keys, ingestion, deployment correlation |
| SRE | Owns reliability targets, incident command, and postmortems. | Investigation, recommendations, approval, resolution |
| Engineering manager | Needs reliability visibility and team load. | Login, dashboards, incident summaries, reports |
| Viewer | A stakeholder with read-only access. | Login, incident read-only view, dashboards |
| Ingestion client | An OpenTelemetry collector or service sending telemetry. | API key use, log ingestion |
| Approver | A responder or admin authorized to approve sensitive actions. | Human approval |

---

## 3. Story map

| Journey stage | Onboard | Configure | Operate | Learn |
| --- | --- | --- | --- | --- |
| Identity | US-001 to US-006 registration; US-010 to US-014 login; US-020 to US-024 password recovery | | | |
| Organization | US-030 to US-034 organization creation | US-040 to US-046 invitations | | |
| Structure | | US-050 to US-054 projects; US-060 to US-064 environments | | |
| Data connection | | US-070 to US-075 API keys; US-080 to US-086 log ingestion | | |
| Detection | | US-096 threshold configuration | US-090 to US-096 incident creation | |
| Diagnosis | | | US-100 to US-107 investigation; US-110 to US-117 AI recommendations | |
| Control | | | US-120 to US-125 human approval | |
| Closure | | | US-130 to US-136 resolution | Postmortem and reliability reporting |
| Cross-cutting | US-140 to US-147 security, audit, accessibility, and observability | | | |

---

## 4. Epics and stories

### 4.1 Epic E1: Registration

**Goal:** Let a new user create a verified account with minimal friction.
**Use case:** UC-01 Registration · **Flow:** UF-01 · **Priority:** Must

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-001 | Visitor | As a visitor, I want to create an account with my name, work email, and password, so that I can access SentinelAI. | Must | AC-REG-01, AC-REG-02 |
| US-002 | Visitor | As a visitor, I want to verify my email address, so that my account is trusted and recoverable. | Must | AC-REG-03, AC-REG-04 |
| US-003 | Visitor | As a visitor, I want to resend a verification email when the first one does not arrive, so that I am not blocked from onboarding. | Must | AC-REG-05 |
| US-004 | Invited visitor | As an invited visitor, I want my registration to connect to my pending invitation, so that I join the right organization after verifying. | Must | AC-REG-06 |
| US-005 | Visitor | As a visitor, I want to see password requirements before I submit, so that I succeed on the first attempt. | Must | AC-REG-02 |
| US-006 | Security-conscious owner | As a security-conscious owner, I want passwords stored securely and never exposed, so that my organization's accounts are protected. | Must | AC-REG-07, AC-REG-08, AC-REG-09 |

### 4.2 Epic E2: Login and session

**Goal:** Provide secure, predictable access to the right organization.
**Use case:** UC-02 Login · **Flow:** UF-02 · **Priority:** Must

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-010 | Registered user | As a registered user, I want to log in with my email and password, so that I can access my organization. | Must | AC-AUTH-01, AC-AUTH-02 |
| US-011 | Registered user | As a registered user, I want my session to persist securely and be able to log out, so that I can work without re-authenticating constantly. | Must | AC-AUTH-03, AC-AUTH-04 |
| US-012 | Multi-org user | As a user who belongs to multiple organizations, I want to choose an organization after login, so that I work in the correct tenant. | Must | AC-AUTH-05 |
| US-013 | Registered user | As a registered user, I want safe, non-revealing error messages and rate limiting, so that my account is not exposed to credential attacks. | Must | AC-AUTH-06, AC-AUTH-07 |
| US-014 | Registered user | As a registered user, I want to return to the page I requested after my session expires, so that I do not lose my place. | Should | AC-AUTH-08 |

### 4.3 Epic E3: Password recovery

**Goal:** Restore account access without leaking account existence.
**Use case:** UC-03 Recover password · **Flow:** UF-03 · **Priority:** Must

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-020 | Visitor | As a visitor, I want to request a password reset without revealing whether an account exists, so that account privacy is preserved. | Must | AC-PWD-01, AC-PWD-02 |
| US-021 | Registered user | As a registered user, I want to set a new password through a single-use link, so that I can regain access safely. | Must | AC-PWD-03, AC-PWD-04 |
| US-022 | Registered user | As a registered user, I want clear recovery when my reset link is expired or already used, so that I can request a new one. | Must | AC-PWD-05 |
| US-023 | Registered user | As a registered user, I want other sessions revoked after a password reset, so that a compromised session cannot continue. | Must | AC-PWD-06 |
| US-024 | Registered user | As a registered user, I want confirmation that my password changed, so that I know the reset succeeded. | Should | AC-PWD-07, AC-PWD-08, AC-PWD-09 |

### 4.4 Epic E4: Organization creation

**Goal:** Establish an isolated tenant with clear ownership.
**Use case:** UC-04 Create organization · **Flow:** UF-04 · **Priority:** Must

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-030 | Registered user | As a registered user, I want to create an organization, so that my team has a dedicated workspace. | Must | AC-ORG-01, AC-ORG-02 |
| US-031 | Registered user | As a registered user, I want a unique URL-safe organization slug, so that my workspace has a stable identity. | Must | AC-ORG-03 |
| US-032 | Owner | As an owner, I want to become the organization owner with a default team, so that someone is accountable from day one. | Must | AC-ORG-04, AC-ORG-05 |
| US-033 | Admin | As an admin, I want a setup checklist after creation, so that I know the next steps to reach first value. | Should | AC-ORG-06 |
| US-034 | Owner | As an owner, I want to review organization defaults for retention and data region, so that I understand how our data is handled. | Should | AC-ORG-07, AC-ORG-08 |

### 4.5 Epic E5: Team invitation

**Goal:** Add teammates with the right role, team, and tenant scope.
**Use case:** UC-05 Invite team members · **Flow:** UF-05 · **Priority:** Must

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-040 | Admin | As an admin, I want to invite multiple teammates by email with a role, so that onboarding is fast. | Must | AC-INVITE-01, AC-INVITE-02 |
| US-041 | Admin | As an admin, I want to resend or revoke an invitation, so that I can correct mistakes and control access. | Must | AC-INVITE-03, AC-INVITE-04 |
| US-042 | Invitee | As an invitee, I want the invitation bound to my email and organization, so that I cannot join the wrong tenant. | Must | AC-INVITE-05, AC-INVITE-06 |
| US-043 | Admin | As an admin, I want role and team scope enforced, so that no one receives more access than intended. | Must | AC-INVITE-07 |
| US-044 | Owner | As an owner, I want seat limits and duplicate checks, so that I do not create unnecessary or invalid memberships. | Must | AC-INVITE-08 |
| US-045 | Multi-org member | As a member of multiple organizations, I want to switch between them, so that I can work across teams. | Should | AC-INVITE-09 |
| US-046 | Admin | As an admin, I want to see invitation status, so that I know who has accepted and who needs a reminder. | Should | AC-INVITE-10 |

### 4.6 Epic E6: Project creation

**Goal:** Group services, telemetry, and incidents into a coherent product area.
**Use case:** UC-06 Create project · **Flow:** UF-06 · **Priority:** Must

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-050 | Admin | As an admin, I want to create a project with a name, key, and description, so that we can organize our services. | Must | AC-PROJ-01, AC-PROJ-02 |
| US-051 | Admin | As an admin, I want project keys to be unique within my organization, so that references are unambiguous. | Must | AC-PROJ-03 |
| US-052 | Admin | As an admin, I want to assign an owning team, so that incidents have a clear escalation path. | Must | AC-PROJ-04 |
| US-053 | Admin | As an admin, I want to archive a project, so that we stop ingestion without losing historical context. | Should | AC-PROJ-05, AC-PROJ-06 |
| US-054 | Viewer | As a viewer, I want project visibility to follow my team scope, so that I only see relevant data. | Must | AC-PROJ-07, AC-PROJ-08 |

### 4.7 Epic E7: Environment creation

**Goal:** Separate telemetry and incidents by deployment stage with production
guardrails.
**Use case:** UC-07 Create environment · **Flow:** UF-07 · **Priority:** Must

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-060 | Admin | As an admin, I want to create environments under a project, so that development, staging, and production data stay separate. | Must | AC-ENV-01, AC-ENV-02 |
| US-061 | Admin | As an admin, I want production environments to have protection defaults, so that we do not accidentally disrupt production monitoring. | Must | AC-ENV-03, AC-ENV-04 |
| US-062 | DevOps engineer | As a DevOps engineer, I want API keys and incident filters scoped by environment, so that production signals are not mixed with test noise. | Must | AC-ENV-05 |
| US-063 | Admin | As an admin, I want safe environment archiving, so that removing a stale environment does not silently break ingestion. | Must | AC-ENV-06, AC-ENV-07 |
| US-064 | SRE | As an SRE, I want to set environment criticality, so that severity and notifications reflect business impact. | Should | AC-ENV-08 |

### 4.8 Epic E8: API key generation

**Goal:** Authorize ingestion with least-privilege, auditable credentials.
**Use case:** UC-08 Generate API key · **Flow:** UF-08 · **Priority:** Must

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-070 | Admin | As an admin, I want to generate a key scoped to an environment and signal type, so that ingestion follows least privilege. | Must | AC-KEY-01, AC-KEY-02 |
| US-071 | Admin | As an admin, I want the secret shown only once, so that it is not exposed later in the UI or logs. | Must | AC-KEY-03 |
| US-072 | Admin | As an admin, I want to rotate a key with an overlap window, so that I can change credentials without dropping telemetry. | Must | AC-KEY-04 |
| US-073 | Admin | As an admin, I want to revoke a compromised key immediately, so that unauthorized ingestion stops. | Must | AC-KEY-05 |
| US-074 | Admin | As an admin, I want keys to expire, so that stale credentials do not remain valid indefinitely. | Must | AC-KEY-06 |
| US-075 | Security reviewer | As a security reviewer, I want key usage and changes audited without secret material, so that I can investigate misuse. | Must | AC-KEY-07, AC-KEY-08, AC-KEY-09 |

### 4.9 Epic E9: Log ingestion

**Goal:** Accept logs reliably, safely, and with fast visibility.
**Use case:** UC-09 Ingest logs · **Flow:** UF-09 · **Priority:** Must

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-080 | DevOps engineer | As a DevOps engineer, I want to send logs using OTLP or a documented JSON format, so that I can integrate existing collectors. | Must | AC-INGEST-01, AC-INGEST-02 |
| US-081 | Ingestion client | As an ingestion client, I want clear authentication and scope errors, so that misconfiguration is easy to fix. | Must | AC-INGEST-03, AC-INGEST-04 |
| US-082 | DevOps engineer | As a DevOps engineer, I want per-record validation results, so that valid logs are not lost because of a few bad records. | Must | AC-INGEST-05 |
| US-083 | Ingestion client | As an ingestion client, I want idempotent retries, so that network failures do not create duplicate logs. | Must | AC-INGEST-06 |
| US-084 | Ingestion client | As an ingestion client, I want rate limits and backpressure with retry guidance, so that I can behave correctly under load. | Must | AC-INGEST-07, AC-INGEST-08 |
| US-085 | Admin | As an admin, I want an ingestion health view, so that I can confirm data is flowing and diagnose failures. | Must | AC-INGEST-09 |
| US-086 | Backend developer | As a backend developer, I want to search ingested logs and see correlated incidents, so that I can investigate quickly. | Must | AC-INGEST-10, AC-INGEST-11 |

### 4.10 Epic E10: Incident creation

**Goal:** Create one clear, owned incident for a production problem.
**Use case:** UC-10 Create incident · **Flow:** UF-10 · **Priority:** Must

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-090 | SRE | As an SRE, I want SentinelAI to create an incident from correlated alerts and logs, so that I do not have to assemble the initial context manually. | Must | AC-INC-CREATE-01, AC-INC-CREATE-02 |
| US-091 | SRE | As an SRE, I want new related signals attached to an existing incident, so that I do not receive duplicate incident records. | Must | AC-INC-CREATE-03 |
| US-092 | Responder | As a responder, I want to create an incident manually, so that I can track a problem that automation did not detect. | Must | AC-INC-CREATE-04 |
| US-093 | Engineering manager | As an engineering manager, I want incidents assigned to the owning team with a severity, so that accountability is clear. | Must | AC-INC-CREATE-05, AC-INC-CREATE-06 |
| US-094 | Responder | As a responder, I want notifications through Slack, PagerDuty, and email, so that I find out in the tools I already use. | Must | AC-INC-CREATE-07, AC-INC-CREATE-08 |
| US-095 | SRE | As an SRE, I want to merge or split incidents, so that correlation mistakes are easy to correct. | Must | AC-INC-CREATE-09 |
| US-096 | Admin | As an admin, I want to tune correlation thresholds, so that low-confidence signals are reviewed instead of paging the team. | Should | AC-INC-CREATE-10 |

### 4.11 Epic E11: Incident investigation

**Goal:** Give responders a single, trustworthy view of what happened.
**Use case:** UC-11 Investigate incident · **Flow:** UF-11 · **Priority:** Must

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-100 | Responder | As a responder, I want a unified incident timeline, so that I do not have to switch between tools. | Must | AC-INC-INVEST-01, AC-INC-INVEST-02 |
| US-101 | Responder | As a responder, I want to filter the timeline by time, service, and signal type, so that I can focus under pressure. | Must | AC-INC-INVEST-03 |
| US-102 | Responder | As a responder, I want evidence links to the original logs, traces, and dashboards, so that I can verify claims. | Must | AC-INC-INVEST-04, AC-INC-INVEST-05 |
| US-103 | Responder | As a responder, I want to ask the incident assistant plain-language questions, so that I can gather context without writing queries. | Must | AC-INC-INVEST-06 |
| US-104 | Responder | As a responder, I want to add notes and mention collaborators, so that the incident record reflects our reasoning. | Must | AC-INC-INVEST-07 |
| US-105 | Backend developer | As a backend developer, I want to see service ownership and dependencies, so that I know who to involve and what may be affected. | Must | AC-INC-INVEST-08 |
| US-106 | DevOps engineer | As a DevOps engineer, I want deployments and config changes on the timeline, so that I can test a change-related hypothesis. | Must | AC-INC-INVEST-09 |
| US-107 | Responder | As a responder, I want to update incident status safely, so that everyone shares the same picture. | Must | AC-INC-INVEST-10, AC-INC-INVEST-11 |

### 4.12 Epic E12: AI recommendations

**Goal:** Accelerate diagnosis with transparent, evidence-backed AI.
**Use case:** UC-12 Generate AI recommendations · **Flow:** UF-12 · **Priority:** Must

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-110 | Responder | As a responder, I want ranked root-cause hypotheses, so that I can prioritize the most likely explanation. | Must | AC-AI-01, AC-AI-02 |
| US-111 | Responder | As a responder, I want every hypothesis linked to evidence with a confidence level, so that I can decide whether to trust it. | Must | AC-AI-03, AC-AI-04 |
| US-112 | Responder | As a responder, I want recommended next steps, so that I know what to check or do next. | Must | AC-AI-05 |
| US-113 | Responder | As a responder, I want the system to say when evidence is insufficient, so that I am not misled by a guess. | Must | AC-AI-06 |
| US-114 | Responder | As a responder, I want to accept, reject, or correct a recommendation with a reason, so that the system learns and the record stays accurate. | Must | AC-AI-07 |
| US-115 | Responder | As a responder, I want to refresh recommendations as new evidence arrives, so that the diagnosis stays current. | Should | AC-AI-08 |
| US-116 | Security reviewer | As a security reviewer, I want AI prompts to treat telemetry as untrusted data, so that malicious log content cannot change model behaviour. | Must | AC-AI-09 |
| US-117 | Privacy owner | As a privacy owner, I want sensitive data redacted before AI processing, so that logs and secrets are not sent to the model. | Must | AC-AI-10, AC-AI-11 |

### 4.13 Epic E13: Human approval

**Goal:** Keep humans accountable for sensitive AI-driven actions.
**Use case:** UC-13 Approve recommendation · **Flow:** UF-13 · **Priority:** Must

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-120 | Responder | As a responder, I want to request approval for a sensitive recommendation, so that it is reviewed before use. | Must | AC-APPROVE-01, AC-APPROVE-02 |
| US-121 | Approver | As an approver, I want to approve or reject with a reason, so that the decision is explicit and reviewable. | Must | AC-APPROVE-03, AC-APPROVE-04 |
| US-122 | Owner | As an owner, I want four-eyes approval for sensitive actions, so that no one can approve their own request. | Must | AC-APPROVE-05 |
| US-123 | Approver | As an approver, I want approvals to expire, so that stale decisions cannot be executed later. | Must | AC-APPROVE-06 |
| US-124 | Auditor | As an auditor, I want every approval decision recorded with actor and timestamp, so that I can reconstruct what happened. | Must | AC-APPROVE-07, AC-APPROVE-08 |
| US-125 | Responder | As a responder, I want approved non-destructive actions to execute reliably, so that approval actually moves the incident forward. | Must | AC-APPROVE-09, AC-APPROVE-10 |

### 4.14 Epic E14: Incident resolution

**Goal:** Close incidents consistently, communicate, and capture learning.
**Use case:** UC-14 Resolve incident · **Flow:** UF-14 · **Priority:** Must

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-130 | Responder | As a responder, I want to resolve an incident with a category and summary, so that the record explains how it ended. | Must | AC-RESOLVE-01, AC-RESOLVE-02 |
| US-131 | SRE | As an SRE, I want a resolution checklist and warnings, so that I do not close an incident with unresolved critical work. | Must | AC-RESOLVE-03, AC-RESOLVE-04 |
| US-132 | Responder | As a responder, I want notifications and paging incidents resolved automatically, so that stakeholders are not left with stale alerts. | Must | AC-RESOLVE-05, AC-RESOLVE-06 |
| US-133 | Responder | As a responder, I want to reopen an incident within a short window, so that false or premature resolutions are recoverable. | Must | AC-RESOLVE-07 |
| US-134 | Engineering manager | As an engineering manager, I want MTTR and MTTD captured automatically, so that reliability reporting is trustworthy. | Must | AC-RESOLVE-08 |
| US-135 | SRE | As an SRE, I want a postmortem draft generated from the timeline, so that writing takes minutes instead of hours. | Should | AC-RESOLVE-09 |
| US-136 | SRE | As an SRE, I want follow-up tasks captured from resolution, so that prevention work is not forgotten. | Should | AC-RESOLVE-10, AC-RESOLVE-11 |

### 4.15 Epic E15: Cross-cutting requirements

**Goal:** Make every workflow secure, auditable, accessible, and observable.

| ID | Persona | User story | Priority | AC |
| --- | --- | --- | --- | --- |
| US-140 | Owner | As an owner, I want server-side role and team-scope enforcement, so that permissions cannot be bypassed in the UI. | Must | AC-X-01 |
| US-141 | Auditor | As an auditor, I want a complete audit trail of sensitive actions, so that I can investigate changes and access. | Must | AC-X-02 |
| US-142 | Security reviewer | As a security reviewer, I want tenant data isolated, so that one organization can never read another's data. | Must | AC-X-03 |
| US-143 | Responder | As a responder, I want notification preferences per team and severity, so that the right people are alerted. | Should | AC-X-04 |
| US-144 | All users | As a user, I want keyboard-accessible, screen-reader-friendly workflows, so that I can use SentinelAI regardless of ability. | Must | AC-X-05 |
| US-145 | All users | As a user, I want clear, actionable error states, so that I can recover without contacting support. | Must | AC-X-06 |
| US-146 | Operator | As an operator, I want structured logs, metrics, and traces without sensitive payloads, so that I can operate the platform safely. | Must | AC-X-07 |
| US-147 | Privacy owner | As a privacy owner, I want retention, export, and deletion controls documented and enforced, so that we meet our data obligations. | Must | AC-X-08 |

---

## 5. Expanded stories for high-risk workflows

The following examples show the level of detail expected during refinement. The
full test conditions are in [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md).

### US-090: Automatic incident creation

> As an SRE, I want SentinelAI to create an incident from correlated alerts and
> logs, so that I do not have to assemble the initial context manually.

**Context:** Signals arrive continuously. The correlation engine must avoid both
noise and missed incidents.

**In scope**

- Group signals by time, service, dependency, labels, and severity.
- Create an incident only when the configured threshold is met.
- Attach all contributing signals as evidence.
- Resolve owner and team from the service catalog.
- Notify through configured channels with retry.
- Record detection metrics.

**Out of scope**

- Paging a human for low-confidence groups; those go to a triage queue.
- Any remediation action.

**Test notes**

- Test duplicate alert storms, signals across related services, missing
  ownership, notification outage, and late-arriving evidence.
- Verify no duplicate incident is created for the same correlation group.

### US-110: Ranked root-cause hypotheses

> As a responder, I want ranked root-cause hypotheses, so that I can prioritize
> the most likely explanation.

**Context:** The AI must be useful without being misleading or opaque.

**In scope**

- Generate one to three hypotheses.
- Rank by evidence strength, recency, and service relevance.
- Provide a confidence label and rationale.
- Link each claim to evidence that the responder can open.
- State when there is not enough evidence.
- Store model metadata and generation time.

**Out of scope**

- Automatic remediation.
- Claims without evidence.
- Using one customer's data to answer another customer's query.

**Test notes**

- Test ambiguous incidents, conflicting evidence, stale telemetry, prompt
  injection in log content, and redaction of secrets and PII.
- Verify that unlinked model output is rejected by the evidence validator.

### US-120: Request approval for a sensitive recommendation

> As a responder, I want to request approval for a sensitive recommendation, so
> that it is reviewed before use.

**Context:** Approval introduces human control without blocking routine work.

**In scope**

- Define which actions require approval: publishing a hypothesis, notifying
  stakeholders, creating an external ticket, and publishing a postmortem.
- Assign an eligible approver who is not the requester.
- Notify the approver and track pending state.
- Capture decision, reason, actor, and timestamp.
- Allow expiry, cancellation, rejection, and supersession.

**Out of scope**

- Approving production remediation, rollback, or auto-scaling. These are not v1
  capabilities.

**Test notes**

- Test self-approval prevention, approver permission loss, expiry, duplicate
  requests, and external integration failure after approval.

---

## 6. Traceability matrix

| Epic | Use cases | Flows | Stories | Acceptance criteria |
| --- | --- | --- | --- | --- |
| E1 Registration | UC-01 | UF-01 | US-001 to US-006 | AC-REG-01 to AC-REG-09 |
| E2 Login | UC-02 | UF-02 | US-010 to US-014 | AC-AUTH-01 to AC-AUTH-08 |
| E3 Password recovery | UC-03 | UF-03 | US-020 to US-024 | AC-PWD-01 to AC-PWD-09 |
| E4 Organization | UC-04 | UF-04 | US-030 to US-034 | AC-ORG-01 to AC-ORG-08 |
| E5 Invitations | UC-05 | UF-05 | US-040 to US-046 | AC-INVITE-01 to AC-INVITE-10 |
| E6 Projects | UC-06 | UF-06 | US-050 to US-054 | AC-PROJ-01 to AC-PROJ-08 |
| E7 Environments | UC-07 | UF-07 | US-060 to US-064 | AC-ENV-01 to AC-ENV-08 |
| E8 API keys | UC-08 | UF-08 | US-070 to US-075 | AC-KEY-01 to AC-KEY-09 |
| E9 Log ingestion | UC-09 | UF-09 | US-080 to US-086 | AC-INGEST-01 to AC-INGEST-11 |
| E10 Incident creation | UC-10 | UF-10 | US-090 to US-096 | AC-INC-CREATE-01 to AC-INC-CREATE-10 |
| E11 Investigation | UC-11 | UF-11 | US-100 to US-107 | AC-INC-INVEST-01 to AC-INC-INVEST-11 |
| E12 AI recommendations | UC-12 | UF-12 | US-110 to US-117 | AC-AI-01 to AC-AI-11 |
| E13 Human approval | UC-13 | UF-13 | US-120 to US-125 | AC-APPROVE-01 to AC-APPROVE-10 |
| E14 Resolution | UC-14 | UF-14 | US-130 to US-136 | AC-RESOLVE-01 to AC-RESOLVE-11 |
| E15 Cross-cutting | All | All | US-140 to US-147 | AC-X-01 to AC-X-08 |

---

## 7. Prioritization summary

### Must-have (MVP / P0)

Registration and verification, login and session security, password recovery,
organization creation, team invitations, project and environment creation,
scoped API keys, log ingestion, automatic and manual incident creation,
investigation timeline, AI hypotheses with evidence, human approval, incident
resolution, RBAC, audit, and tenant isolation.

### Should-have (P1)

Setup checklist, multi-organization switching, invitation status reporting,
project archiving, environment criticality, key rotation overlap, correlation
threshold tuning, recommendation refresh, notification preferences, postmortem
drafting, follow-up tasks, and manager reporting.

### Could-have (post-MVP)

Recommendation sharing to external channels, richer export options, advanced
correlation tuning per service, and additional deployment integrations.

### Won't-have (v1)

Autonomous remediation, AI code fixes, long-term telemetry storage, proprietary
agents, self-hosted deployment, enterprise SSO/SCIM, on-call scheduling, ChatOps
write actions, mobile app, cost optimization, synthetic monitoring, broad
integration marketplace, and formal compliance certifications. See
[PRD section 8](../PRD.md#8-features-excluded-from-version-1).

---

## 8. Backlog quality checks

Before a story enters a sprint, confirm:

- [ ] The persona is one of the defined personas.
- [ ] The outcome describes user value, not an implementation detail.
- [ ] The story links to a flow and at least one acceptance criterion.
- [ ] Permissions and tenant scope are specified.
- [ ] Error, empty, loading, and success states are defined.
- [ ] The audit event and observability requirements are identified.
- [ ] The test approach is feasible with available test data.
- [ ] The story is small enough to complete within one iteration.
