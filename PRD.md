# SentinelAI Product Requirements Document (PRD)

| Field | Value |
| --- | --- |
| Product | SentinelAI |
| Document status | Draft for review |
| Version | 0.1 |
| Owner | Product |
| Last updated | 2026-11-06 |
| Target milestone | Private beta (MVP) |

---

## 1. Executive summary

SentinelAI is an AI-assisted reliability and incident response platform for
cloud-native engineering teams. It ingests alerts, metrics, logs, traces, and
deployment events; correlates related signals into a single incident; and gives
responders an evidence-backed explanation of what changed, what broke, and where
to look next.

The MVP is intentionally focused on the highest-cost part of the incident
lifecycle: the time between "something is wrong" and "we know what to fix." It
does not replace observability storage, on-call scheduling, or autonomous
remediation. It sits above existing tools, reduces alert noise, assembles
context automatically, and uses AI to accelerate diagnosis with verifiable
evidence.

---

## 2. Problem statement

Cloud-native systems generate more telemetry than engineers can interpret
during an incident. A single customer-facing failure can produce dozens of
duplicate alerts across metrics, logs, traces, and infrastructure monitors. The
context needed to diagnose the failure is spread across an observability
platform, a deployment pipeline, a source repository, a chat channel, and
tribal knowledge held by a few senior engineers.

As a result:

- Responders spend the most valuable minutes of an incident gathering context
  instead of fixing the problem.
- Alert fatigue causes real incidents to be missed or acknowledged late.
- Root-cause analysis depends on who is on call, not on the quality of the data.
- Postmortems are written from memory, so repeat failures are not reliably
  prevented.
- Engineering leaders lack a trustworthy view of reliability trends, incident
  impact, and operational load.

Existing observability tools are excellent at storing and visualizing signals,
but they are not designed to assemble a diagnosis. Existing AIOps tools are
often expensive, opaque, difficult to tune, and disconnected from the
developer workflow. SentinelAI closes that gap with a transparent,
evidence-first incident layer that works with the tools teams already use.

### Core problem

> Engineering teams can see that production is failing, but they cannot quickly
> understand why. SentinelAI reduces the time and effort required to turn noisy
> telemetry into an actionable, evidence-backed incident diagnosis.

---

## 3. Target customers

### Primary market

Mid-market and enterprise technology companies that run production workloads on
cloud-native infrastructure (Kubernetes, containers, managed cloud services) and
already invest in observability.

Typical characteristics:

- 20-500 engineers, with at least one dedicated platform, SRE, or DevOps group.
- Operates customer-facing services with uptime and latency commitments.
- Uses a mix of metrics, logs, traces, and alerting tools.
- Experiences regular alert noise and a meaningful on-call burden.
- Has executive pressure to improve reliability without growing headcount
  proportionally.

### Buyer personas

| Buyer | Primary motivation |
| --- | --- |
| VP of Engineering / CTO | Reduce reliability risk and incident cost while improving engineering efficiency. |
| Head of Platform / SRE | Reduce toil, improve MTTR, and standardize incident response. |
| Director of DevOps | Connect deployment velocity to production stability. |

### Secondary market

- Smaller digital-native companies (10-20 engineers) without a dedicated SRE
  function, where founders and senior engineers act as first responders.
- Managed service providers and consultancies that operate production systems
  on behalf of multiple customers, where per-tenant incident context is valuable.

### Customer qualification criteria

A strong early customer:

- Has at least 10 production services and a non-trivial alert volume.
- Can provide 90 days of historical incident and telemetry data.
- Has an owner empowered to adopt a new tool and integrate it with Slack and
  PagerDuty.
- Agrees to participate in feedback sessions and share anonymized outcome data.

---

## 4. Primary users

### 4.1 Engineering managers

**Context:** Accountable for delivery, reliability, and team health but not
usually on the incident bridge.

**Needs:**

- A trustworthy view of incident volume, severity, MTTR, and repeat failures.
- Visibility into which services and teams carry the most operational load.
- Evidence that reliability investments are reducing risk.
- Fast, accurate incident summaries for stakeholders.

**Success for this user:** Can answer "How reliable were we this month, where
are we fragile, and is the team overloaded?" in minutes without asking engineers
to assemble a report.

### 4.2 Backend developers

**Context:** Own one or more services and are frequently paged or pulled into
incidents affecting their code.

**Needs:**

- Fast identification of the failing service, endpoint, and dependency.
- Correlation between a recent change and the incident.
- Direct links to the relevant logs, traces, dashboards, and commits.
- Clear next steps without needing to learn every observability query language.

**Success for this user:** Can move from alert to a plausible root cause and
owning code path in under five minutes.

### 4.3 DevOps engineers

**Context:** Responsible for delivery pipelines, infrastructure changes, and
environment consistency.

**Needs:**

- Correlation of incidents with deployments, config changes, and
  infrastructure events.
- Confidence about whether a rollback or revert is likely to help.
- Integration with existing CI/CD and alerting workflows.
- Low operational overhead for adopting and maintaining the platform.

**Success for this user:** Can determine whether a change caused an incident and
act on it without cross-referencing multiple systems manually.

### 4.4 Site reliability engineers (SREs)

**Context:** Own reliability targets, incident command, and the response process.

**Needs:**

- Aggressive noise reduction and deduplication across alert sources.
- A single, shared incident timeline with all relevant context.
- SLO and error-budget visibility tied to real incidents.
- AI hypotheses that cite evidence and are safe to trust under pressure.
- Postmortem drafts that preserve the timeline and contributing factors.

**Success for this user:** Runs smaller, calmer incidents; spends less time
correlating signals and more time resolving and preventing recurrences.

---

## 5. Major user problems

| ID | Problem | Who feels it | Impact |
| --- | --- | --- | --- |
| P1 | Alert fatigue from duplicate and low-value alerts | SRE, on-call engineers | Missed incidents, burnout, slow acknowledgement |
| P2 | Context is scattered across tools | All responders | Long time to diagnose, repeated manual work |
| P3 | Root-cause analysis depends on scarce expertise | Backend, SRE | Inconsistent outcomes, knowledge bottlenecks |
| P4 | Change-to-incident correlation is manual | DevOps, backend | Slower rollback decisions, repeated regressions |
| P5 | Incident communication is ad hoc | Managers, responders | Stakeholder confusion, duplicated updates |
| P6 | Postmortems are incomplete or skipped | SRE, managers | Repeat failures, weak prevention |
| P7 | Reliability reporting is manual and stale | Engineering managers | Poor prioritization, unclear ROI |
| P8 | Existing AIOps tools are opaque or hard to tune | Buyers, SRE | Low trust, high cost, abandoned deployments |
| P9 | Tool sprawl increases cost and cognitive load | All | Slower onboarding, higher operational overhead |

### Problem priorities for v1

1. **P1 and P2** are the core wedge: reduce noise and assemble context.
2. **P3 and P4** are the AI differentiators: explain likely cause and connect it
   to change.
3. **P5 and P6** are retention features: make the incident record useful after
   resolution.
4. **P7** is the buyer-facing value: make reliability measurable.
5. **P8 and P9** are product principles: transparency, evidence, and
   integration over replacement.

---

## 6. Product vision, goals, and non-goals

### Vision

Make every production incident understandable, actionable, and short.

### Product principles

- **Evidence over assertion.** Every AI claim links to the telemetry or event
  that supports it.
- **Integrate, do not replace.** SentinelAI works with the observability,
  deployment, and on-call tools customers already use.
- **Reduce work, not just add insight.** Every feature must remove a manual step
  from the incident workflow.
- **Trust is earned.** Confidence, uncertainty, and missing evidence are shown
  explicitly.
- **Fast time to value.** A team should see useful correlation within its first
  onboarding session.

### MVP goals

- Reduce alert volume presented to responders by at least 40%.
- Reduce median time to diagnose by at least 30% versus the customer's baseline.
- Produce root-cause hypotheses that responders rate as useful in at least 70%
  of evaluated incidents.
- Make the incident timeline and postmortem draft useful without manual
  reconstruction.
- Prove that teams return to the product week after week.

### Non-goals for v1

- Replacing the customer's observability platform or becoming a system of record
  for long-term telemetry.
- Executing remediation, rollbacks, or infrastructure changes automatically.
- Generating and merging code fixes.
- Managing on-call schedules and escalations; integrate with existing providers.
- Supporting every monitoring or cloud vendor at launch.

---

## 7. MVP features

Priority definitions:

- **P0:** Required to launch the private beta.
- **P1:** Required for general availability; may ship during beta if capacity
  allows.

### 7.1 Feature summary

| ID | Feature | Priority | Problem addressed |
| --- | --- | --- | --- |
| F1 | OpenTelemetry-first ingestion and alert webhooks | P0 | P2, P9 |
| F2 | Service catalog and ownership map | P0 | P2, P3 |
| F3 | Alert deduplication and incident correlation | P0 | P1, P2 |
| F4 | Unified incident timeline and context | P0 | P2, P5 |
| F5 | AI root-cause hypotheses with evidence | P0 | P3 |
| F6 | Natural-language incident assistant | P0 | P2, P3 |
| F7 | Deployment and change correlation | P0 | P4 |
| F8 | Slack, PagerDuty, and email notifications | P0 | P5 |
| F9 | SLO and error-budget visibility | P1 | P7 |
| F10 | Postmortem draft generation | P1 | P6 |
| F11 | Manager reliability dashboard | P1 | P7 |
| F12 | Role-based access and audit log | P0 | Trust and security |

### 7.2 Feature requirements

#### F1. OpenTelemetry-first ingestion and alert webhooks (P0)

- Accept metrics, logs, and traces through an OpenTelemetry collector
  integration.
- Accept alert webhooks from common sources, starting with Prometheus
  Alertmanager and a generic JSON webhook.
- Preserve source timestamps, labels, service identity, and trace/span IDs where
  available.
- Provide connection health, ingest volume, and error visibility in the UI.
- Support a configurable retention window appropriate for incident analysis;
  SentinelAI is not the long-term system of record.

**Acceptance criteria:** A new customer can connect an OpenTelemetry source and
an alert webhook using documentation alone, and see signals appear in the
product within 15 minutes.

#### F2. Service catalog and ownership map (P0)

- Automatically discover services from telemetry labels and allow manual
  curation.
- Record service owner, team, tier, dependencies, and runbook link.
- Show upstream and downstream dependencies for a failing service.
- Flag services with missing ownership or incomplete metadata.

**Acceptance criteria:** A responder can identify the owning team and direct
dependencies of any ingested service from the incident view.

#### F3. Alert deduplication and incident correlation (P0)

- Group related alerts into a single incident using time, service, dependency,
  and label similarity.
- Suppress duplicate notifications while preserving all underlying alerts.
- Allow responders to split or merge incidents manually.
- Show why alerts were grouped so the logic is understandable.
- Learn from responder merge/split feedback over time.

**Acceptance criteria:** In a beta evaluation, correlated incidents reduce
responder-facing alert volume by at least 40% without hiding a distinct
high-severity incident.

#### F4. Unified incident timeline and context (P0)

- Build a chronological timeline of alerts, deployments, configuration changes,
  status updates, and responder actions.
- Attach relevant logs, trace excerpts, metric snapshots, and dashboard links.
- Allow responders to add notes, link external resources, and mark key events.
- Keep the timeline shareable and exportable after resolution.

**Acceptance criteria:** A responder can understand the sequence of events
without opening more than one external tool for the primary signal.

#### F5. AI root-cause hypotheses with evidence (P0)

- Generate one to three ranked hypotheses per incident, each with a confidence
  level and supporting evidence.
- Link every claim to specific telemetry, events, commits, or configuration
  changes.
- Explicitly state when evidence is insufficient rather than guessing.
- Allow responders to accept, reject, or correct a hypothesis; capture feedback.
- Never present an unlinked claim as a root cause.

**Acceptance criteria:** In beta incident reviews, at least 70% of evaluated
hypotheses are rated useful, and 100% of hypotheses include at least one linked
piece of evidence.

#### F6. Natural-language incident assistant (P0)

- Answer questions about the active incident in plain language, such as "What
  changed in the last hour?" or "Which service is the bottleneck?".
- Ground answers in the customer's ingested data and the incident timeline.
- Link sources in every answer and refuse to answer when data is unavailable.
- Preserve a transcript in the incident record for postmortem use.

**Acceptance criteria:** A responder can obtain a useful answer to a
context-gathering question without writing a query, and every answer contains a
traceable citation.

#### F7. Deployment and change correlation (P0)

- Ingest deployment and release events from GitHub Actions, Argo CD, and a
  generic webhook at launch.
- Mark deployment events on the incident timeline.
- Highlight changes that occurred within the incident's likely causal window.
- Show commit, author, and environment metadata where available.
- Do not execute rollbacks; provide evidence and links for humans to act.

**Acceptance criteria:** For incidents preceded by a relevant deployment,
responders can see the change and its metadata in the incident timeline.

#### F8. Slack, PagerDuty, and email notifications (P0)

- Send incident creation, severity change, and resolution notifications to Slack.
- Create and resolve incidents in PagerDuty through the existing integration.
- Send email notifications for stakeholders and daily summaries.
- Allow per-team routing and notification preferences.
- Avoid duplicate notifications when alerts are correlated.

**Acceptance criteria:** A beta team can route incidents to its existing on-call
workflow without changing its paging provider.

#### F9. SLO and error-budget visibility (P1)

- Define SLOs from metrics or error-rate queries.
- Show current error budget, burn rate, and trend.
- Connect SLO breaches to the incidents that consumed the budget.
- Surface at-risk SLOs on the manager and team views.

**Acceptance criteria:** A team can define an SLO and see its budget consumption
attributed to incidents.

#### F10. Postmortem draft generation (P1)

- Generate a draft from the incident timeline, including summary, impact,
  timeline, contributing factors, hypotheses, and follow-up placeholders.
- Keep all generated content editable and clearly marked as draft.
- Link evidence inline and preserve responder notes.
- Export to Markdown and a shared document destination.

**Acceptance criteria:** A responder can produce a review-ready draft in under
ten minutes and at least 50% of beta drafts are used with minor edits.

#### F11. Manager reliability dashboard (P1)

- Show incident volume, severity mix, MTTR, time to acknowledge, repeat
  incidents, and SLO health over time.
- Break down reliability metrics by team and service.
- Show on-call load and incident participation.
- Support CSV export and a shareable read-only view.

**Acceptance criteria:** A manager can produce a monthly reliability review
without requesting a custom report from engineers.

#### F12. Role-based access and audit log (P0)

- Support admin, responder, and viewer roles.
- Scope access by team where required for beta customers.
- Record authentication, configuration changes, and sensitive actions in an
  audit log.
- Encrypt data in transit and at rest.
- Isolate tenant data and document data-retention controls.

**Acceptance criteria:** A beta customer can pass a basic security review, and
all administrative actions are attributable to a user.

---

## 8. Features excluded from version 1

The following are explicitly out of scope for v1. They may be considered after
the MVP validates the core diagnosis workflow.

| Excluded capability | Rationale |
| --- | --- |
| Autonomous remediation, auto-rollback, or auto-scaling actions | Requires high trust, safety controls, and broad integration coverage. |
| AI-generated code fixes or pull requests | Diagnosis is the wedge; code changes add risk and scope. |
| Long-term telemetry storage or full APM replacement | Customers already have systems of record; replacing them is expensive and slow. |
| Proprietary agents or deep host-level instrumentation | OpenTelemetry-first keeps adoption light and avoids lock-in. |
| Custom per-customer ML model training | Operationally heavy and unnecessary to prove MVP value. |
| Self-hosted or on-premises deployment | Adds packaging, support, and security burden before product-market fit. |
| Enterprise SSO, SCIM, and advanced RBAC | Basic roles are sufficient for private beta; enterprise identity comes later. |
| On-call scheduling and escalation management | PagerDuty and similar tools own this workflow; integrate instead of rebuild. |
| ChatOps commands that change production systems | Too risky for v1 and outside the diagnosis scope. |
| Mobile application | Web-first experience is sufficient for responders and managers. |
| Multi-cloud cost optimization | Separate problem from incident diagnosis. |
| Synthetic monitoring and uptime checks | Adjacent category; customers can feed results into SentinelAI. |
| Broad integration marketplace (50+ integrations) | Launch with a focused set that covers the majority of beta customers. |
| Compliance certifications (SOC 2, HIPAA, FedRAMP) | Security fundamentals are in scope, but formal certification is post-MVP. |
| Individual engineer performance scoring | Reliability data should not be used to rank people; ethical and adoption risk. |

---

## 9. Product success criteria

Success is measured at three levels: whether responders get value, whether teams
keep using the product, and whether the business can grow from the wedge.

### 9.1 North-star metric

**Median time to diagnose (MTTD)** for incidents handled in SentinelAI, measured
from incident creation to the first accepted or useful root-cause hypothesis.

Target: **30% reduction** from each customer's pre-SentinelAI baseline within 90
days of adoption.

### 9.2 Product and user success criteria

| Criterion | Target | Measurement |
| --- | --- | --- |
| Alert noise reduction | >= 40% fewer responder-facing notifications | Compare raw alerts with correlated incident notifications per customer |
| Time to first value | < 30 minutes from signup to first correlated incident | Instrumented onboarding funnel |
| Root-cause usefulness | >= 70% of evaluated hypotheses rated useful | In-product feedback and beta review |
| Evidence coverage | 100% of hypotheses include linked evidence | Automated validation and spot audits |
| Assistant groundedness | >= 95% of answers include valid citations | Automated checks and review sample |
| False-positive incident rate | < 10% of auto-created incidents | Responder feedback and audit |
| Postmortem draft acceptance | >= 50% of drafts used with minor edits | Export and edit tracking |
| Weekly active teams | >= 60% of onboarded teams active each week | Product analytics |
| Four-week team retention | >= 70% of activated teams | Cohort analysis |
| Responder satisfaction | >= 4.0 / 5.0 | In-product survey after incident resolution |
| Manager dashboard value | >= 70% of managers report it replaces manual reporting | Beta interviews |
| Integration success rate | >= 90% of onboarding integrations succeed without support | Onboarding telemetry |

### 9.3 Business success criteria

| Criterion | Target | Timeframe |
| --- | --- | --- |
| Design partners recruited | 5-10 qualified teams | First 90 days |
| Design partner activation | >= 70% connected and handling real incidents | Within 30 days of onboarding |
| Beta-to-paid conversion | >= 20% of active design partners | End of private beta |
| Net promoter score | >= 30 | End of private beta |
| Referenceable customers | >= 3 | End of private beta |
| Documented value stories | >= 3 with measured MTTR or noise reduction | End of private beta |

### 9.4 Technical success criteria

| Criterion | Target |
| --- | --- |
| Platform availability | 99.9% monthly |
| Alert-to-incident correlation latency | p95 < 2 minutes |
| Ingestion freshness | p95 < 60 seconds from source timestamp |
| Incident timeline load | p95 < 3 seconds |
| Assistant first response | p95 < 10 seconds |
| Data isolation | Tenant data segregated and access-controlled |
| Audit coverage | 100% of administrative and sensitive actions logged |
| Recovery point objective (RPO) | <= 1 hour for incident and configuration data |
| Recovery time objective (RTO) | <= 4 hours |

### 9.5 Guardrail metrics

These must not regress even if growth metrics improve:

- No customer data used to train shared models without explicit opt-in.
- Every AI-generated claim remains traceable to evidence.
- No incident is silently suppressed; all raw alerts remain accessible.
- No reliability metric is used to rank individual engineers.
- Security and privacy incidents remain at zero tolerated severity.

### 9.6 MVP exit criteria

The MVP is considered successful and ready to move toward general availability
when:

1. At least five design partners are using SentinelAI on real production
   incidents.
2. Median MTTD improves by at least 20% across the cohort, with at least two
   customers showing 30% or better.
3. Alert noise is reduced by at least 40% for at least three customers.
4. At least 70% of evaluated root-cause hypotheses are rated useful.
5. At least three customers agree to be references or provide a value story.
6. No unresolved critical security or data-isolation issues remain.

---

## 10. Assumptions, dependencies, and risks

### Assumptions

- Target customers already collect telemetry and are willing to connect it to a
  new system.
- A meaningful share of incidents have correlatable signals across services and
  deployment events.
- Responders will trust AI output when it is transparent, ranked, and linked to
  evidence.
- Buyers will pay for reduced MTTR and lower operational toil, not just another
  dashboard.

### Dependencies

- OpenTelemetry semantic conventions and collector compatibility.
- Stable APIs and webhook formats for alerting, deployment, and on-call tools.
- Access to historical incident data for baseline and evaluation.
- Sufficient data volume and quality from design partners to evaluate model
  quality.

### Key risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| AI produces incorrect or overconfident root causes | Loss of trust, unsafe decisions | Evidence-first output, explicit uncertainty, human acceptance, feedback loop |
| Customers have low-quality or incomplete telemetry | Weak correlation and hypotheses | Onboarding health checks, minimum data requirements, transparent gaps |
| Integration breadth expands scope | Delayed launch | Focus on OpenTelemetry, Prometheus, GitHub, Argo CD, Slack, PagerDuty |
| Incumbent observability vendors bundle similar features | Competitive pressure | Compete on cross-tool correlation, transparency, and speed to value |
| Data privacy and security concerns block adoption | Sales friction | Tenant isolation, encryption, audit logs, clear retention and model-use policy |
| Alert correlation merges distinct incidents | Missed failures | Manual split, severity preservation, conservative defaults, monitoring |
| Design partners do not share outcome data | Cannot prove ROI | Build measurement into onboarding and agree on metrics upfront |

---

## 11. Open questions

1. Should the beta support customer-managed encryption keys, or is standard
   encryption at rest sufficient?
2. Which deployment integration beyond GitHub Actions and Argo CD is most
   valuable to the first cohort?
3. How much telemetry history is required to produce a useful first hypothesis?
4. What is the right pricing unit: per service, per seat, per incident volume,
   or a platform fee?
5. Should SentinelAI host the AI model or use a customer-approved third-party
   provider per region?
6. How should incident severity be inferred when source alerts use inconsistent
   severities?
7. Which SLO data source is most common among design partners?

---

## 12. Release plan

| Phase | Scope | Exit |
| --- | --- | --- |
| Internal prototype | F1, F2, F3, F4 with synthetic data | Core correlation works end to end |
| Private alpha | F1-F8 with 2-3 friendly teams | Real incidents handled; feedback loop active |
| Private beta | Full P0 scope, selected P1 features | MVP exit criteria met |
| General availability | All P1 features, hardened security, billing, documentation | Repeatable onboarding and support |

---

## 13. Glossary

- **Alert:** A signal from a monitoring system indicating a potential problem.
- **Incident:** A correlated set of alerts and events representing a single
  production issue.
- **MTTD:** Mean time to diagnose; time from incident creation to a useful
  root-cause hypothesis.
- **MTTR:** Mean time to resolve; time from incident creation to resolution.
- **Root-cause hypothesis:** An evidence-linked explanation of what likely
  caused an incident, ranked by confidence.
- **SLO:** Service level objective; a target for a reliability metric such as
  availability or latency.
- **Error budget:** The amount of unreliability an SLO permits in a period.
