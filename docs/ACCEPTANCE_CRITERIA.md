# SentinelAI Acceptance Criteria

| Field | Value |
| --- | --- |
| Document | Acceptance criteria |
| Version | 0.1 |
| Status | Draft for review |
| Last updated | 2026-11-06 |
| Related documents | [PRD](../PRD.md), [User flows](USER_FLOWS.md), [User stories](USER_STORIES.md) |

---

## 1. Purpose

This document defines the observable, testable conditions that must be true for
each SentinelAI workflow to be accepted. It is the contract between product,
engineering, design, security, and QA.

Every workflow in the MVP has its own acceptance criteria. Global criteria apply
to all workflows and may not be waived without a recorded product and security
decision.

### How to read this document

- **ID:** Stable identifier used in stories, tests, and release reviews.
- **Priority:** `Must` for MVP/P0, `Should` for P1.
- **Test level:** `Unit`, `API`, `Integration`, `E2E`, `Security`, or `UAT`.
- **Given / When / Then:** Gherkin-style conditions written from the user's or
  system's perspective.

### Quality standards

Acceptance criteria must be:

1. **Testable:** A test can return pass or fail without interpretation.
2. **Independent:** One criterion does not require another to be true unless
   explicitly stated.
3. **Unambiguous:** No subjective words such as "fast" without a threshold.
4. **Traceable:** Linked to at least one story and workflow.
5. **Outcome-focused:** Describes observable behaviour, not implementation.
6. **Secure by default:** Includes authorization and tenant scope where relevant.

### Test level legend

| Level | Meaning |
| --- | --- |
| Unit | Deterministic logic, validation, or state transition. |
| API | Contract, status codes, payloads, and authorization. |
| Integration | Cross-service behaviour such as email, Slack, PagerDuty, or AI. |
| E2E | Full user journey through the UI and backend. |
| Security | Abuse, isolation, secret handling, and privilege tests. |
| UAT | Product or design partner validation of usefulness and clarity. |

---

## 2. Global acceptance criteria

### AC-X-01 Server-side authorization

**Priority:** Must · **Level:** Security

```gherkin
Given a user has a role and team scope
When they attempt an action through the UI, API, or a direct request
Then the server enforces the permission and tenant scope
And unauthorized requests return 403 without leaking protected data
```

### AC-X-02 Immutable audit trail

**Priority:** Must · **Level:** Integration

```gherkin
Given a sensitive action occurs
When the action completes or fails
Then an audit event records actor, organization, action, target, timestamp, and outcome
And the event cannot be edited or deleted by the actor
And secrets and raw telemetry payloads are never included
```

### AC-X-03 Tenant isolation

**Priority:** Must · **Level:** Security

```gherkin
Given two organizations have data in SentinelAI
When a user from organization A requests any resource
Then only organization A resources are returned
And no identifier, count, or error message reveals organization B data
```

### AC-X-04 Notification preferences

**Priority:** Should · **Level:** E2E

```gherkin
Given a team has configured notification channels and severity rules
When an incident matches those rules
Then only the configured channels and recipients are notified
And changes to preferences are audited
```

### AC-X-05 Accessibility

**Priority:** Must · **Level:** E2E

```gherkin
Given a user navigates with a keyboard or screen reader
When they complete any MVP workflow
Then all interactive elements are reachable and labelled
And focus order is logical
And the workflow meets WCAG 2.1 AA for the affected surfaces
```

### AC-X-06 Actionable errors

**Priority:** Must · **Level:** E2E

```gherkin
Given a workflow cannot complete
When an error is shown
Then the message states what happened, why if safe to disclose, and the next action
And the user's safe input is preserved
And no stack trace, secret, or internal identifier is exposed
```

### AC-X-07 Safe observability

**Priority:** Must · **Level:** Integration

```gherkin
Given any workflow emits logs, metrics, or traces
When an operator inspects them
Then events include a correlation ID and workflow identifier
And they exclude passwords, tokens, API keys, and raw sensitive telemetry
```

### AC-X-08 Retention, export, and deletion

**Priority:** Must · **Level:** Integration

```gherkin
Given an organization has configured retention and deletion rules
When the retention period elapses or an authorized deletion is requested
Then data is removed or anonymized according to policy
And audit records that must be retained are preserved without sensitive payloads
And the organization can export its incident and configuration data
```

---

## 3. Workflow acceptance criteria

### 3.1 AC-REG: Registration

**Stories:** US-001 to US-006 · **Flow:** UF-01

#### AC-REG-01 Successful registration with valid details

**Priority:** Must · **Level:** E2E

```gherkin
Given a visitor is on the sign-up page
When they submit a valid name, work email, password, and accepted terms
Then an account is created in pending_verification state
And a verification email is sent with a single-use token
And no authenticated session is created
```

#### AC-REG-02 Invalid input and password policy

**Priority:** Must · **Level:** API

```gherkin
Given a visitor is completing the sign-up form
When the email is invalid, the password does not meet policy, or terms are not accepted
Then submission is blocked
And every unmet requirement is shown inline
And no account is created
```

#### AC-REG-03 Email verification activates the account

**Priority:** Must · **Level:** E2E

```gherkin
Given a pending account has a valid verification token
When the visitor opens the verification link within 24 hours
Then the account becomes active
And the token is consumed
And an authenticated session is created
And a user.verified audit event is recorded
```

#### AC-REG-04 Expired or invalid verification token

**Priority:** Must · **Level:** API

```gherkin
Given a verification token is expired, already used, or invalid
When the visitor opens the link
Then the account remains pending
And the page explains the problem
And a resend-verification action is offered without revealing account details
```

#### AC-REG-05 Verification resend is rate-limited

**Priority:** Must · **Level:** API

```gherkin
Given a pending account has not received a verification email
When the visitor requests a resend
Then a new single-use token is sent after the cooldown
And the old token is invalidated
And no more than five resends are accepted per hour
And the response does not reveal whether the account exists
```

#### AC-REG-06 Pending invitation is preserved

**Priority:** Must · **Level:** E2E

```gherkin
Given an email address has a pending organization invitation
When the visitor registers and verifies that email
Then the invitation is available after verification
And accepting it creates membership in the correct organization and role
```

#### AC-REG-07 Duplicate account is handled neutrally

**Priority:** Must · **Level:** API

```gherkin
Given an email address already belongs to an active account
When a visitor attempts to register with it
Then no second account is created
And the response offers sign in or password recovery
And it does not disclose sensitive account details
```

#### AC-REG-08 Password storage and transport security

**Priority:** Must · **Level:** Security

```gherkin
Given a user registers or changes a password
When the password is stored or transmitted
Then it is hashed with a current password-hashing algorithm and a unique salt
And it is sent only over TLS
And it is never written to logs, audit events, analytics, or error reports
```

#### AC-REG-09 Registration audit events

**Priority:** Must · **Level:** Integration

```gherkin
Given a registration is attempted
When it succeeds or fails
Then an audit event records the attempt outcome, timestamp, and relevant metadata
And the event excludes the password, token, and full email where policy requires
```

---

### 3.2 AC-AUTH: Login and session

**Stories:** US-010 to US-014 · **Flow:** UF-02

#### AC-AUTH-01 Valid login creates a session

**Priority:** Must · **Level:** E2E

```gherkin
Given an active user with valid credentials
When they submit their email and password
Then an authenticated session is created
And the session cookie is secure, HTTP-only, and same-site protected
And a user.login audit event is recorded
```

#### AC-AUTH-02 Invalid credentials return a generic error

**Priority:** Must · **Level:** API

```gherkin
Given a user submits an unknown email or an incorrect password
When authentication fails
Then the same generic error is returned in both cases
And no field-specific hint or account existence information is revealed
```

#### AC-AUTH-03 Session expiry is enforced

**Priority:** Must · **Level:** Security

```gherkin
Given an authenticated session
When the configured idle timeout or absolute lifetime is reached
Then the session is rejected on the next request
And the user is redirected to login
And no protected data is returned
```

#### AC-AUTH-04 Logout invalidates the session

**Priority:** Must · **Level:** E2E

```gherkin
Given an authenticated user
When they select log out
Then the server-side session is invalidated
And the session cookie is cleared
And a subsequent request with the old session is rejected
```

#### AC-AUTH-05 Multiple organizations require a choice

**Priority:** Must · **Level:** E2E

```gherkin
Given a user belongs to more than one organization
When they log in
Then they are shown an organization picker
And selecting an organization scopes the session to that tenant
And the last selected organization is remembered safely
```

#### AC-AUTH-06 Unverified and suspended accounts are handled safely

**Priority:** Must · **Level:** API

```gherkin
Given an account is unverified or suspended
When the user attempts to log in
Then access is denied
And the message explains the next step without revealing sensitive details
And an unverified user is offered email verification resend
```

#### AC-AUTH-07 Login attempts are rate-limited

**Priority:** Must · **Level:** Security

```gherkin
Given repeated failed login attempts for an account or source
When the configured threshold is exceeded
Then further attempts are delayed or blocked with a retry-after response
And the user is offered password recovery
And the event is recorded for abuse monitoring
```

#### AC-AUTH-08 Expired session preserves the return path

**Priority:** Should · **Level:** E2E

```gherkin
Given a user's session expires while they are viewing a protected page
When they log in again
Then they are returned to the originally requested page
And the return path is validated to be a safe internal URL
```

---

### 3.3 AC-PWD: Password recovery

**Stories:** US-020 to US-024 · **Flow:** UF-03

#### AC-PWD-01 Reset request is neutral

**Priority:** Must · **Level:** API

```gherkin
Given a visitor requests a password reset for any email address
When they submit the form
Then the same confirmation message is shown whether or not an account exists
And the response does not reveal account status
```

#### AC-PWD-02 Reset email is sent only for eligible accounts

**Priority:** Must · **Level:** Integration

```gherkin
Given the requested email belongs to an active account
When the reset request is processed
Then a single-use token valid for 30 minutes is created
And a reset email is sent
And no reset email is sent for unknown or ineligible accounts
```

#### AC-PWD-03 Valid token allows a password change

**Priority:** Must · **Level:** E2E

```gherkin
Given a user has a valid, unused reset token
When they submit a new password that meets policy and matches confirmation
Then the password is updated
And the token is consumed
And the user is directed to log in
```

#### AC-PWD-04 Password policy and confirmation are enforced

**Priority:** Must · **Level:** API

```gherkin
Given a user is setting a new password
When the password does not meet policy or the confirmation does not match
Then the change is rejected
And all unmet requirements are shown
And the reset token remains usable until it expires or succeeds
```

#### AC-PWD-05 Expired or reused token is rejected

**Priority:** Must · **Level:** API

```gherkin
Given a reset token is expired or has already been used
When the user opens the link or submits a new password
Then the change is rejected
And the page offers to request a new reset link
And no account state changes
```

#### AC-PWD-06 Other sessions are revoked

**Priority:** Must · **Level:** Security

```gherkin
Given a user successfully resets their password
When the change is committed
Then all other active sessions for that user are revoked
And the initiating session, if any, is handled according to policy
```

#### AC-PWD-07 Password change confirmation is sent

**Priority:** Should · **Level:** Integration

```gherkin
Given a user successfully changes their password
When the change completes
Then a confirmation email is sent to the account address
And the email does not contain the new password or token
```

#### AC-PWD-08 Recovery requests are rate-limited

**Priority:** Must · **Level:** Security

```gherkin
Given repeated password reset requests for the same email or source
When the configured threshold is exceeded
Then further requests are delayed or blocked
And the neutral response is preserved
And the event is recorded for abuse monitoring
```

#### AC-PWD-09 Reset secrets are never logged

**Priority:** Must · **Level:** Security

```gherkin
Given a password reset is requested or completed
When logs, audit events, analytics, and error reports are inspected
Then they contain no reset token, password, or password hash
And only non-sensitive metadata is retained
```

---

### 3.4 AC-ORG: Organization creation

**Stories:** US-030 to US-034 · **Flow:** UF-04

#### AC-ORG-01 User can create an organization

**Priority:** Must · **Level:** E2E

```gherkin
Given an authenticated user without a blocking organization limit
When they submit a valid organization name and slug
Then the organization is created in active state
And the user is redirected to the organization setup checklist
```

#### AC-ORG-02 Creator becomes owner with a default team

**Priority:** Must · **Level:** Integration

```gherkin
Given an organization is created
When creation completes
Then the creator has the owner role
And a default team named Platform exists
And the organization has exactly one owner at creation time
```

#### AC-ORG-03 Organization slug is unique

**Priority:** Must · **Level:** API

```gherkin
Given a slug is already in use
When a user submits it for a new organization
Then creation is rejected
And the error suggests available alternatives
And no partial organization is created
```

#### AC-ORG-04 Partial creation is rolled back

**Priority:** Must · **Level:** Integration

```gherkin
Given organization creation fails after some records are written
When the transaction fails
Then all organization, team, and role records from that attempt are removed
And the user sees a retryable error
```

#### AC-ORG-05 Owner role cannot be accidentally duplicated

**Priority:** Must · **Level:** API

```gherkin
Given an organization already has an owner
When a role change attempts to create a second owner without explicit transfer
Then the change is rejected
And the existing owner remains unchanged
```

#### AC-ORG-06 Setup checklist is available

**Priority:** Should · **Level:** E2E

```gherkin
Given an organization has just been created
When the owner lands in the workspace
Then a setup checklist shows invite members, create project, create environment, generate key, and connect telemetry
And completed steps are marked automatically
```

#### AC-ORG-07 Organization defaults are visible

**Priority:** Should · **Level:** E2E

```gherkin
Given an owner opens organization settings
When the settings page loads
Then the data region, retention policy, and default notification settings are visible
And only authorized roles can change them
```

#### AC-ORG-08 Organization creation is audited

**Priority:** Must · **Level:** Integration

```gherkin
Given an organization is created or a setting changes
When the action completes
Then an audit event records the actor, organization, action, and timestamp
```

---

### 3.5 AC-INVITE: Team invitation

**Stories:** US-040 to US-046 · **Flow:** UF-05

#### AC-INVITE-01 Admin can invite one or more members

**Priority:** Must · **Level:** E2E

```gherkin
Given an admin is on the members page
When they submit valid email addresses with a role and optional teams
Then one invitation per email is created
And invitation emails are sent
And the members page shows each invitation as pending
```

#### AC-INVITE-02 Role and team values are validated

**Priority:** Must · **Level:** API

```gherkin
Given an admin submits an invitation
When the role is unknown or a team does not belong to the organization
Then the invitation is rejected
And the invalid field is identified
And no invitation is created
```

#### AC-INVITE-03 Invitations can be resent and revoked

**Priority:** Must · **Level:** E2E

```gherkin
Given a pending invitation exists
When an admin resends it
Then a new token is issued and the previous token is invalidated
When an admin revokes it
Then the invitation becomes revoked and its link can no longer be accepted
```

#### AC-INVITE-04 Duplicate invitations are prevented

**Priority:** Must · **Level:** API

```gherkin
Given an email already has a pending invitation or active membership
When an admin invites it again
Then no duplicate invitation is created
And the UI reports the existing state and offers resend, update, or no action
```

#### AC-INVITE-05 Invitation is bound to the invited email

**Priority:** Must · **Level:** Security

```gherkin
Given an invitation was issued to a specific email address
When someone accepts it while authenticated as a different email
Then acceptance is rejected
And no membership is created
And the event is recorded
```

#### AC-INVITE-06 Expired invitations cannot be accepted

**Priority:** Must · **Level:** API

```gherkin
Given an invitation is older than seven days or has been revoked
When the invitee opens the link
Then acceptance is rejected
And the page explains that the invitation is no longer valid
And the inviter can issue a new invitation
```

#### AC-INVITE-07 Privilege boundaries are enforced

**Priority:** Must · **Level:** Security

```gherkin
Given an admin invites a member
When they attempt to grant a role or team scope above their own authority
Then the invitation is rejected
And the permission boundary is explained
And the event is recorded
```

#### AC-INVITE-08 Seat limits and existing members are handled

**Priority:** Must · **Level:** API

```gherkin
Given the organization has reached its seat limit
When an admin invites another member
Then the invitation is blocked
And the limit and resolution options are shown
And existing members are never duplicated
```

#### AC-INVITE-09 Multi-organization membership works

**Priority:** Should · **Level:** E2E

```gherkin
Given a user already belongs to another organization
When they accept a valid invitation
Then the new membership is added without removing existing memberships
And both organizations appear in the organization switcher
```

#### AC-INVITE-10 Invitation status is visible and audited

**Priority:** Should · **Level:** E2E

```gherkin
Given invitations exist in different states
When an admin views the members page
Then pending, accepted, expired, and revoked states are visible
And sending, resending, revoking, and accepting are recorded in the audit log
```

---

### 3.6 AC-PROJ: Project creation

**Stories:** US-050 to US-054 · **Flow:** UF-06

#### AC-PROJ-01 Admin can create a project

**Priority:** Must · **Level:** E2E

```gherkin
Given an authorized admin
When they submit a valid name, unique key, and optional description and owning team
Then the project is created in active state
And the admin is directed to the project overview
```

#### AC-PROJ-02 Project defaults are applied

**Priority:** Must · **Level:** API

```gherkin
Given a project is created
When creation completes
Then default retention and notification settings are applied
And the owning team is set, or the project is flagged as unassigned
```

#### AC-PROJ-03 Project key is unique within the organization

**Priority:** Must · **Level:** API

```gherkin
Given a project key already exists in the organization
When an admin submits it for a new project
Then creation is rejected
And alternative keys are suggested
And no project is created
```

#### AC-PROJ-04 Project creation requires permission

**Priority:** Must · **Level:** Security

```gherkin
Given a responder or viewer attempts to create a project
When they use the UI or call the API directly
Then the action is forbidden
And no project is created
```

#### AC-PROJ-05 Archiving stops ingestion and preserves history

**Priority:** Should · **Level:** Integration

```gherkin
Given an active project with API keys and incidents
When an admin archives it with confirmation
Then its keys stop accepting ingestion
And historical incidents remain readable according to retention
And the project is marked archived
```

#### AC-PROJ-06 Project limits are enforced

**Priority:** Should · **Level:** API

```gherkin
Given the organization has reached its project limit
When an admin attempts to create another project
Then creation is blocked
And the limit and upgrade or archive options are shown
```

#### AC-PROJ-07 Project visibility follows team scope

**Priority:** Must · **Level:** Security

```gherkin
Given a user with team-scoped access
When they list or open projects
Then they see only projects allowed by their role and team scope
And direct access to another project returns 403
```

#### AC-PROJ-08 Project creation is audited

**Priority:** Must · **Level:** Integration

```gherkin
Given a project is created, updated, or archived
When the action completes
Then an audit event records actor, organization, project, action, and timestamp
```

---

### 3.7 AC-ENV: Environment creation

**Stories:** US-060 to US-064 · **Flow:** UF-07

#### AC-ENV-01 Admin can create an environment

**Priority:** Must · **Level:** E2E

```gherkin
Given an active project and an authorized admin
When they submit a valid environment name and type
Then the environment is created in active state under that project
And it is available as an API key and incident scope
```

#### AC-ENV-02 Environment names are unique per project

**Priority:** Must · **Level:** API

```gherkin
Given an environment name already exists in the project
When an admin submits it again
Then creation is rejected
And a unique name is suggested
```

#### AC-ENV-03 Production creation requires confirmation

**Priority:** Must · **Level:** E2E

```gherkin
Given an admin creates a production environment
When the production warning is shown
Then creation proceeds only after explicit confirmation
And the environment is marked as protected
```

#### AC-ENV-04 Production guardrails are enforced

**Priority:** Must · **Level:** Integration

```gherkin
Given a production environment exists
When an admin attempts to archive it or change its criticality
Then additional confirmation is required
And the action is audited
And ingestion keys for that environment are not silently deleted
```

#### AC-ENV-05 Environment scope isolates keys and incidents

**Priority:** Must · **Level:** Security

```gherkin
Given a project has multiple environments
When a key is generated or an incident is filtered
Then the selected environment scopes the key and the query
And data from another environment is not mixed in
```

#### AC-ENV-06 Archiving stops environment ingestion

**Priority:** Must · **Level:** Integration

```gherkin
Given an environment is archived
When an ingestion client uses a key scoped to that environment
Then the request is rejected with a clear error
And historical data remains available according to retention
```

#### AC-ENV-07 The last environment cannot be archived alone

**Priority:** Must · **Level:** API

```gherkin
Given a project has only one environment
When an admin attempts to archive it
Then the action is blocked unless the project is also being archived
And the reason is explained
```

#### AC-ENV-08 Environment criticality is captured

**Priority:** Should · **Level:** API

```gherkin
Given an admin creates or edits an environment
When they set criticality
Then the value is stored and used by severity and notification rules
And the change is audited
```

---

### 3.8 AC-KEY: API key generation

**Stories:** US-070 to US-075 · **Flow:** UF-08

#### AC-KEY-01 Admin can generate a scoped key

**Priority:** Must · **Level:** E2E

```gherkin
Given an authorized admin and an active environment
When they submit a key name, scopes, and expiry
Then a key is created with those scopes and expiry
And the full secret is displayed exactly once
```

#### AC-KEY-02 Scopes are validated

**Priority:** Must · **Level:** API

```gherkin
Given an admin selects scopes
When a scope is unsupported or not allowed for the environment
Then key creation is rejected
And the allowed scopes are shown
```

#### AC-KEY-03 Secrets are stored hashed and revealed once

**Priority:** Must · **Level:** Security

```gherkin
Given an API key is generated
When it is stored and later listed
Then only a hash and metadata are stored
And the full secret is shown only in the creation response
And it is never retrievable from logs, audit events, or the UI afterward
```

#### AC-KEY-04 Rotation supports an overlap window

**Priority:** Must · **Level:** Integration

```gherkin
Given an active key
When an admin rotates it
Then a new key is created
And the old key remains valid for the configured overlap window
And the old key expires automatically at the end of the window
```

#### AC-KEY-05 Revocation is immediate

**Priority:** Must · **Level:** Security

```gherkin
Given an active key
When an admin revokes it
Then new requests using that key are rejected immediately
And the key is marked revoked
And the event is audited
```

#### AC-KEY-06 Expired keys are rejected

**Priority:** Must · **Level:** API

```gherkin
Given a key has passed its expiry
When an ingestion request uses it
Then the request is rejected with 401 or 403
And the UI shows the key as expired
```

#### AC-KEY-07 Key metadata is visible without the secret

**Priority:** Must · **Level:** E2E

```gherkin
Given keys exist
When an admin views the key list
Then name, prefix, scopes, environment, creator, created date, expiry, and status are visible
And the full secret is not visible
```

#### AC-KEY-08 Key usage is auditable

**Priority:** Must · **Level:** Integration

```gherkin
Given a key is used for ingestion
When the request is processed
Then usage is attributed to the key and organization
And creation, rotation, revocation, and expiry are audited
And no secret material appears in audit events
```

#### AC-KEY-09 Key management requires permission

**Priority:** Must · **Level:** Security

```gherkin
Given a responder, viewer, or ingestion client attempts key management
When they use the UI or API
Then the action is forbidden
And no key is created, rotated, or revoked
```

---

### 3.9 AC-INGEST: Log ingestion

**Stories:** US-080 to US-086 · **Flow:** UF-09

#### AC-INGEST-01 OTLP and JSON logs are accepted

**Priority:** Must · **Level:** API

```gherkin
Given a valid key with logs:write scope
When the client sends a valid OTLP/HTTP or documented JSON batch
Then the gateway returns 202 Accepted
And the records enter the ingestion pipeline
```

#### AC-INGEST-02 Accepted logs are queryable quickly

**Priority:** Must · **Level:** Integration

```gherkin
Given a log batch is accepted
When the pipeline completes
Then the records are queryable within 60 seconds at p95
And the ingestion freshness timestamp is updated
```

#### AC-INGEST-03 Missing or invalid key is rejected

**Priority:** Must · **Level:** Security

```gherkin
Given a request has no API key or a malformed key
When it reaches the ingestion gateway
Then the request is rejected with 401
And no data is accepted
And no internal detail is disclosed
```

#### AC-INGEST-04 Scope and environment mismatches are rejected

**Priority:** Must · **Level:** Security

```gherkin
Given a valid key
When it lacks the required scope or targets a different environment
Then the request is rejected with 403
And the reason identifies the scope or environment mismatch
```

#### AC-INGEST-05 Partial validation is supported

**Priority:** Must · **Level:** API

```gherkin
Given a batch contains valid and invalid records
When the batch is processed
Then valid records are accepted
And invalid records are reported with per-record reasons
And no invalid record is silently indexed
```

#### AC-INGEST-06 Retries are idempotent

**Priority:** Must · **Level:** Integration

```gherkin
Given a client retries a batch after a timeout
When the retry carries the same idempotency key or fingerprint
Then duplicate records are not created
And the client receives a consistent response
```

#### AC-INGEST-07 Rate limits return actionable responses

**Priority:** Must · **Level:** API

```gherkin
Given a key or tenant exceeds its ingestion rate limit
When it sends another request
Then the gateway returns 429
And includes Retry-After guidance
And does not silently discard accepted data
```

#### AC-INGEST-08 Backpressure is handled safely

**Priority:** Must · **Level:** Integration

```gherkin
Given the ingestion pipeline is under backpressure
When a client sends data
Then the gateway returns 503 with Retry-After or queues durably
And accepted data is not lost
```

#### AC-INGEST-09 Ingestion health is visible

**Priority:** Must · **Level:** E2E

```gherkin
Given logs are being sent
When an admin opens ingestion health
Then accepted, rejected, indexed, and freshness metrics are visible per key and environment
And the last error reason is available without exposing sensitive payloads
```

#### AC-INGEST-10 Sensitive data is redacted

**Priority:** Must · **Level:** Security

```gherkin
Given a log record contains a configured secret or PII pattern
When it is processed
Then the sensitive value is redacted before storage and AI processing
And the original secret is not written to logs or audit events
```

#### AC-INGEST-11 Ingestion can trigger incident creation

**Priority:** Must · **Level:** Integration

```gherkin
Given error logs and related signals meet the configured correlation threshold
When the correlation engine evaluates them
Then an incident is created or updated through AC-INC-CREATE
And the contributing logs are linked as evidence
```

---

### 3.10 AC-INC-CREATE: Incident creation

**Stories:** US-090 to US-096 · **Flow:** UF-10

#### AC-INC-CREATE-01 Correlated signals create an incident

**Priority:** Must · **Level:** Integration

```gherkin
Given related signals meet the configured incident threshold
When the correlation engine evaluates the group
Then one incident is created in triage state
And the contributing signals are linked as evidence
And the detection time is recorded
```

#### AC-INC-CREATE-02 Incident has required context

**Priority:** Must · **Level:** API

```gherkin
Given an incident is created
When it is persisted
Then it has an ID, title, severity, affected services, environment, opened_at, status, and owner or unowned flag
And it has a timeline with a creation event
```

#### AC-INC-CREATE-03 Duplicate signals attach to the existing incident

**Priority:** Must · **Level:** Integration

```gherkin
Given an open incident exists for a correlation group
When a new related signal arrives
Then the signal is attached to that incident
And no duplicate incident is created
And the timeline records the attachment
```

#### AC-INC-CREATE-04 Manual incident creation works

**Priority:** Must · **Level:** E2E

```gherkin
Given an authorized responder
When they submit a valid title, severity, service, environment, and summary
Then an incident is created in triage state
And the responder is assigned as owner
And notifications follow routing rules
```

#### AC-INC-CREATE-05 Ownership resolves from the service catalog

**Priority:** Must · **Level:** Integration

```gherkin
Given an incident affects a service with an owner
When the incident is created
Then the owning team and responder group are assigned
If no owner exists
Then the incident is flagged unowned and routed to the project default
```

#### AC-INC-CREATE-06 Severity drives routing

**Priority:** Must · **Level:** Integration

```gherkin
Given an incident has a severity
When notifications are sent
Then the severity-specific channels, escalation policy, and recipients are used
And the severity is visible on the incident
```

#### AC-INC-CREATE-07 Notifications are sent to configured integrations

**Priority:** Must · **Level:** Integration

```gherkin
Given an incident is created
When notification channels are configured
Then Slack, PagerDuty, and email notifications are sent according to rules
And delivery status is recorded on the incident
```

#### AC-INC-CREATE-08 Notification failures do not block creation

**Priority:** Must · **Level:** Integration

```gherkin
Given a notification provider is unavailable
When an incident is created
Then the incident is still created
And the notification is queued and retried
And the failure is visible without exposing provider secrets
```

#### AC-INC-CREATE-09 Incidents can be merged and split

**Priority:** Must · **Level:** E2E

```gherkin
Given two incidents are incorrectly separated or one is incorrectly merged
When an authorized responder merges or splits them
Then signals, timeline events, and links are preserved
And the action and reason are audited
And notifications reflect the resulting incident state
```

#### AC-INC-CREATE-10 Low-confidence groups go to triage

**Priority:** Should · **Level:** Integration

```gherkin
Given a correlation group is below the paging threshold
When it is evaluated
Then it is placed in a triage queue without paging a responder
And it can be promoted to an incident manually
And the threshold change is audited
```

---

### 3.11 AC-INC-INVEST: Incident investigation

**Stories:** US-100 to US-107 · **Flow:** UF-11

#### AC-INC-INVEST-01 Unified timeline is available

**Priority:** Must · **Level:** E2E

```gherkin
Given an incident has alerts, logs, metrics, traces, deployments, and notes
When a responder opens the incident
Then all authorized events appear in one timeline
And each event has a type, timestamp, source, and link where available
```

#### AC-INC-INVEST-02 Timeline is ordered and linked

**Priority:** Must · **Level:** API

```gherkin
Given an incident timeline is displayed
When it is loaded
Then events are ordered chronologically with a stable tie-breaker
And pagination does not duplicate or skip events
```

#### AC-INC-INVEST-03 Timeline can be filtered

**Priority:** Must · **Level:** E2E

```gherkin
Given a timeline with many events
When a responder filters by time range, service, or signal type
Then only matching events are shown
And the active filters are visible and removable
```

#### AC-INC-INVEST-04 Evidence links resolve to source context

**Priority:** Must · **Level:** Integration

```gherkin
Given a timeline event has evidence
When a responder opens the evidence link
Then it resolves to the source log, trace, metric snapshot, deployment, or dashboard
And the link preserves the relevant time and service context
```

#### AC-INC-INVEST-05 Unavailable evidence is handled transparently

**Priority:** Must · **Level:** E2E

```gherkin
Given an evidence source is unavailable, expired, or access-denied
When the responder opens or views it
Then the UI shows the unavailable state and last-known metadata
And the incident remains usable
And the responder can retry
```

#### AC-INC-INVEST-06 Assistant answers are grounded and cited

**Priority:** Must · **Level:** UAT

```gherkin
Given an incident with available context
When a responder asks a question
Then the answer is based on the incident's data
And every factual claim includes a valid citation
And if data is insufficient, the assistant says so and suggests what to collect
```

#### AC-INC-INVEST-07 Notes and collaboration are persisted

**Priority:** Must · **Level:** E2E

```gherkin
Given an authorized responder
When they add a note or mention a collaborator
Then the note is stored with author and timestamp
And the mentioned user is notified according to preferences
And the note appears on the timeline
```

#### AC-INC-INVEST-08 Ownership and dependencies are visible

**Priority:** Must · **Level:** E2E

```gherkin
Given an incident affects one or more services
When a responder views the service context
Then owner, team, tier, runbook, upstream, and downstream dependencies are shown
And missing ownership is clearly flagged
```

#### AC-INC-INVEST-09 Deployment correlation is visible

**Priority:** Must · **Level:** Integration

```gherkin
Given deployments occurred near the incident window
When the incident is viewed
Then relevant deployment events appear on the timeline
And commit, author, environment, and status are shown where available
```

#### AC-INC-INVEST-10 Status transitions are valid and visible

**Priority:** Must · **Level:** API

```gherkin
Given an incident in a valid state
When a responder changes its status
Then only allowed transitions are accepted
And the change appears on the timeline and in the audit log
And invalid transitions are rejected with a reason
```

#### AC-INC-INVEST-11 Viewers are read-only

**Priority:** Must · **Level:** Security

```gherkin
Given a viewer opens an incident
When they attempt to add notes, change status, or request recommendations
Then the action is unavailable or forbidden
And read-only access to the timeline and evidence remains available
```

---

### 3.12 AC-AI: AI recommendations

**Stories:** US-110 to US-117 · **Flow:** UF-12

#### AC-AI-01 One to three hypotheses are generated

**Priority:** Must · **Level:** Integration

```gherkin
Given an incident with sufficient context
When recommendations are generated
Then between one and three ranked root-cause hypotheses are returned
And each has a rationale and a confidence label
```

#### AC-AI-02 Ranking is explainable

**Priority:** Must · **Level:** UAT

```gherkin
Given multiple hypotheses are returned
When a responder reviews them
Then the ranking basis is visible, including evidence strength, recency, and service relevance
And the ordering is deterministic for the same input version
```

#### AC-AI-03 Every hypothesis has evidence

**Priority:** Must · **Level:** Integration

```gherkin
Given a hypothesis is returned
When it is validated
Then every factual claim links to at least one resolvable evidence item
And any claim without evidence is removed or regenerated
```

#### AC-AI-04 Confidence reflects evidence quality

**Priority:** Must · **Level:** UAT

```gherkin
Given evidence is sparse, stale, or conflicting
When a hypothesis is displayed
Then its confidence is reduced or labeled insufficient
And the limitation is explained
```

#### AC-AI-05 Recommended next steps are provided

**Priority:** Must · **Level:** UAT

```gherkin
Given a root-cause hypothesis
When recommendations are displayed
Then the responder sees specific next checks or actions
And each step is safe, non-destructive, and linked to the relevant service or evidence
```

#### AC-AI-06 Insufficient evidence is stated explicitly

**Priority:** Must · **Level:** Integration

```gherkin
Given the incident lacks enough context for a reliable hypothesis
When recommendations are generated
Then the system returns an insufficient-evidence result
And lists the missing data and suggested collection steps
And does not present a guess as a root cause
```

#### AC-AI-07 Feedback is captured

**Priority:** Must · **Level:** E2E

```gherkin
Given a hypothesis is displayed
When a responder accepts, rejects, or corrects it with an optional reason
Then the decision is stored with actor and timestamp
And the incident timeline records the feedback
And the feedback is available for quality evaluation
```

#### AC-AI-08 Refresh supersedes without deleting history

**Priority:** Should · **Level:** Integration

```gherkin
Given recommendations already exist
When a responder requests a refresh
Then a new set is generated from the latest evidence
And older recommendations are marked superseded
And the prior evidence and feedback remain available
```

#### AC-AI-09 Telemetry is treated as untrusted

**Priority:** Must · **Level:** Security

```gherkin
Given log or event content contains instructions aimed at the model
When recommendations are generated
Then the content is treated as data, not instructions
And it cannot change system policy, reveal prompts, or trigger actions
```

#### AC-AI-10 Sensitive data is redacted before generation

**Priority:** Must · **Level:** Security

```gherkin
Given incident context contains secrets, credentials, or configured PII
When the AI request is assembled
Then sensitive values are redacted before transmission
And the redaction policy applied is recorded without storing the original values
```

#### AC-AI-11 Tenant isolation and training policy are enforced

**Priority:** Must · **Level:** Security

```gherkin
Given an organization's incident data is processed by AI
When the model is invoked or evaluated
Then no other organization's data is included
And the data is not used to train shared models without explicit opt-in
```

---

### 3.13 AC-APPROVE: Human approval

**Stories:** US-120 to US-125 · **Flow:** UF-13

#### AC-APPROVE-01 Approval can be requested for supported actions

**Priority:** Must · **Level:** E2E

```gherkin
Given a responder and a supported action
When they request approval with context
Then an approval request is created in pending state
And the action, requester, incident, and risk level are recorded
```

#### AC-APPROVE-02 An eligible approver is assigned

**Priority:** Must · **Level:** Integration

```gherkin
Given an approval request is created
When the system selects an approver
Then the approver has the required role and team scope
And the approver is not the requester for sensitive actions
```

#### AC-APPROVE-03 Approval and rejection require a decision record

**Priority:** Must · **Level:** E2E

```gherkin
Given an eligible approver reviews a request
When they approve or reject it
Then the decision, actor, timestamp, and optional reason are stored
And the requester is notified
```

#### AC-APPROVE-04 Decisions are immutable

**Priority:** Must · **Level:** Security

```gherkin
Given an approval decision has been recorded
When any user attempts to edit or delete it
Then the attempt is rejected
And the original decision remains in the audit trail
```

#### AC-APPROVE-05 Self-approval is blocked for sensitive actions

**Priority:** Must · **Level:** Security

```gherkin
Given a requester submitted a sensitive approval request
When they attempt to approve it themselves
Then the action is blocked
And the request remains pending or is routed to another approver
```

#### AC-APPROVE-06 Approvals expire

**Priority:** Must · **Level:** API

```gherkin
Given an approval request is pending
When 24 hours pass without a decision
Then the request becomes expired
And it can no longer be approved or executed
And the requester can submit a new request
```

#### AC-APPROVE-07 Every decision is audited

**Priority:** Must · **Level:** Integration

```gherkin
Given an approval request changes state
When the change is committed
Then an audit event records request ID, action, actor, decision, reason, and timestamp
And no secret or sensitive payload is included
```

#### AC-APPROVE-08 Approver changes are handled safely

**Priority:** Must · **Level:** Integration

```gherkin
Given an approver loses permission or becomes unavailable
When the request is evaluated
Then it is reassigned to an eligible approver or organization admin
And the reassignment is audited
```

#### AC-APPROVE-09 Approved actions execute once

**Priority:** Must · **Level:** Integration

```gherkin
Given an approval request is approved
When the approved action executes
Then it is attempted once with idempotency protection
And the result is recorded on the request and incident
And a retry after a transient failure does not require a new approval
```

#### AC-APPROVE-10 Production remediation is never executed

**Priority:** Must · **Level:** Security

```gherkin
Given any approval request
When the action is a rollback, auto-scaling, code change, or other production remediation
Then the action is rejected as unsupported in v1
And no external production change is attempted
```

---

### 3.14 AC-RESOLVE: Incident resolution

**Stories:** US-130 to US-136 · **Flow:** UF-14

#### AC-RESOLVE-01 Resolution requires a category and summary

**Priority:** Must · **Level:** E2E

```gherkin
Given an authorized responder
When they resolve an incident
Then they must select a category and provide a resolution summary
And the resolution is stored on the incident
```

#### AC-RESOLVE-02 Resolution updates state and timers

**Priority:** Must · **Level:** API

```gherkin
Given a valid resolution
When it is committed
Then the incident status becomes resolved
And resolved_at is recorded
And active incident timers stop
And the timeline records the resolution event
```

#### AC-RESOLVE-03 Resolution checklist is shown

**Priority:** Must · **Level:** E2E

```gherkin
Given a responder opens the resolve action
When the checklist is displayed
Then it shows open critical approvals, unowned follow-ups, affected services, and SLO impact
And the responder can review each item before confirming
```

#### AC-RESOLVE-04 Unresolved critical work requires a recorded decision

**Priority:** Must · **Level:** API

```gherkin
Given an incident has an unresolved critical approval or follow-up
When a responder attempts to resolve it
Then resolution is blocked or requires an explicit admin waiver with a reason
And the waiver is audited
```

#### AC-RESOLVE-05 Notifications are resolved

**Priority:** Must · **Level:** Integration

```gherkin
Given an incident is resolved
When notification integrations are available
Then linked PagerDuty incidents are resolved
And resolution messages are posted to configured Slack and email channels
```

#### AC-RESOLVE-06 Resolution is not blocked by integration failures

**Priority:** Must · **Level:** Integration

```gherkin
Given a notification provider is unavailable during resolution
When the incident is resolved
Then the resolution succeeds
And notification retries are queued and visible
```

#### AC-RESOLVE-07 Reopening is possible within seven days

**Priority:** Must · **Level:** E2E

```gherkin
Given a resolved incident
When a responder reopens it within seven days with a reason
Then the incident returns to investigating state
And the original resolution remains in the timeline
And the reopen is audited
```

#### AC-RESOLVE-08 Metrics are captured automatically

**Priority:** Must · **Level:** Integration

```gherkin
Given an incident is resolved
When metrics are recorded
Then MTTD, MTTR, detection source, and resolution category are stored
And the metrics are available to reporting without manual entry
```

#### AC-RESOLVE-09 Postmortem draft is generated

**Priority:** Should · **Level:** Integration

```gherkin
Given a resolved incident
When the responder requests a postmortem draft
Then a draft is generated from the timeline with summary, impact, timeline, contributing factors, and follow-up placeholders
And it is marked as a draft and is editable
And generation failure does not invalidate the resolution
```

#### AC-RESOLVE-10 Follow-up tasks can be captured

**Priority:** Should · **Level:** E2E

```gherkin
Given a resolved incident
When the responder adds a follow-up task
Then the task is linked to the incident with an owner and optional due date
And it appears in the follow-up list
```

#### AC-RESOLVE-11 Resolution requires permission and is audited

**Priority:** Must · **Level:** Security

```gherkin
Given a viewer or unauthorized user attempts to resolve or reopen an incident
When they use the UI or API
Then the action is forbidden
And every valid resolution or reopen is recorded in the audit log
```

---

## 4. Traceability matrix

| Workflow | Flow | Stories | Acceptance criteria | Primary test levels |
| --- | --- | --- | --- | --- |
| Registration | UF-01 | US-001 to US-006 | AC-REG-01 to AC-REG-09 | API, E2E, Security |
| Login | UF-02 | US-010 to US-014 | AC-AUTH-01 to AC-AUTH-08 | API, E2E, Security |
| Password recovery | UF-03 | US-020 to US-024 | AC-PWD-01 to AC-PWD-09 | API, Integration, Security |
| Organization creation | UF-04 | US-030 to US-034 | AC-ORG-01 to AC-ORG-08 | API, Integration, E2E |
| Team invitation | UF-05 | US-040 to US-046 | AC-INVITE-01 to AC-INVITE-10 | API, E2E, Security |
| Project creation | UF-06 | US-050 to US-054 | AC-PROJ-01 to AC-PROJ-08 | API, E2E, Security |
| Environment creation | UF-07 | US-060 to US-064 | AC-ENV-01 to AC-ENV-08 | API, Integration, Security |
| API key generation | UF-08 | US-070 to US-075 | AC-KEY-01 to AC-KEY-09 | API, Security, Integration |
| Log ingestion | UF-09 | US-080 to US-086 | AC-INGEST-01 to AC-INGEST-11 | API, Integration, Security |
| Incident creation | UF-10 | US-090 to US-096 | AC-INC-CREATE-01 to AC-INC-CREATE-10 | Integration, E2E, Security |
| Incident investigation | UF-11 | US-100 to US-107 | AC-INC-INVEST-01 to AC-INC-INVEST-11 | E2E, Integration, Security |
| AI recommendations | UF-12 | US-110 to US-117 | AC-AI-01 to AC-AI-11 | Integration, UAT, Security |
| Human approval | UF-13 | US-120 to US-125 | AC-APPROVE-01 to AC-APPROVE-10 | E2E, Integration, Security |
| Incident resolution | UF-14 | US-130 to US-136 | AC-RESOLVE-01 to AC-RESOLVE-11 | API, Integration, E2E |
| Cross-cutting | All | US-140 to US-147 | AC-X-01 to AC-X-08 | Security, Integration, E2E |

---

## 5. Verification strategy

### 5.1 Test coverage expectations

| Area | Minimum expectation |
| --- | --- |
| Authentication and authorization | Automated API and security tests for every role and tenant boundary. |
| State transitions | Unit tests for every allowed and rejected incident, recommendation, and approval transition. |
| Ingestion | Contract tests for OTLP and JSON, plus load, idempotency, and backpressure tests. |
| Integrations | Sandbox or contract tests for email, Slack, PagerDuty, GitHub, and Argo CD. |
| AI quality | Golden-incident evaluation set with evidence-link validation, redaction checks, and human usefulness review. |
| Accessibility | Automated checks plus manual keyboard and screen-reader review for each workflow. |
| Audit and privacy | Security tests that inspect logs and audit events for secrets, tokens, and cross-tenant data. |
| Failure handling | Chaos or fault-injection tests for provider outages, queue backpressure, and stale evidence. |

### 5.2 Definition of done for a workflow

A workflow is accepted when:

1. Every `Must` acceptance criterion passes.
2. Every `Should` criterion is either passing or explicitly deferred with product
   approval.
3. Role, team-scope, and tenant-isolation tests pass.
4. Audit events are verified for all sensitive actions.
5. Error, empty, loading, and success states are reviewed.
6. Accessibility checks pass for the affected surfaces.
7. Observability emits the required events without sensitive payloads.
8. Documentation is updated and the workflow is demonstrated to product.

### 5.3 Release sign-off checklist

- [ ] All `Must` criteria pass in the release candidate.
- [ ] No open critical or high security findings.
- [ ] Tenant-isolation and authorization tests pass.
- [ ] Ingestion SLOs are met in a load test.
- [ ] AI evidence coverage is 100% on the evaluation set.
- [ ] Notification retry and resolution behaviour are verified with providers
      unavailable.
- [ ] Audit log completeness is verified for every sensitive action.
- [ ] Design partners have completed UAT for the incident lifecycle.
- [ ] Known limitations and deferred `Should` criteria are documented.
