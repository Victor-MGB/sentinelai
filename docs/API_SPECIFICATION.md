# SentinelAI API Specification

| Field | Value |
| --- | --- |
| Document | Product REST API specification |
| Version | 0.1 |
| Status | Draft for review |
| Last updated | 2026-11-07 |
| API version | `v1` |
| Specification | OpenAPI 3.1, generated from Fastify route schemas |
| Related documents | [PRD](../PRD.md), [User flows](USER_FLOWS.md), [User stories](USER_STORIES.md), [Acceptance criteria](ACCEPTANCE_CRITERIA.md), [Architecture](ARCHITECTURE.md), [Database schema](DATABASE_SCHEMA.md) |

---

## 1. Purpose and scope

This document is the contract for the SentinelAI product REST API. It defines
the resource model, authentication and authorization rules, request and response
formats, validation rules, error semantics, versioning, OpenAPI workflow, and
the endpoint specifications for:

- `/api/v1/auth`
- `/api/v1/organizations` (including nested members and invitations)
- `/api/v1/projects`
- `/api/v1/environments` (including nested API keys)
- `/api/v1/logs`
- `/api/v1/incidents`
- `/api/v1/investigations`
- `/api/v1/knowledge`
- `/api/v1/approvals`
- `/api/v1/health`

**In scope:** public product REST endpoints consumed by the Next.js application
and browser, request/response contracts, tenant and team scoping, permissions,
validation, error mapping, pagination, idempotency, concurrency, versioning, and
the generated OpenAPI document.

**Out of scope:** the telemetry ingestion API (`/v1/ingest` on `ingest.`), webhook
ingress (`/v1/webhooks`), internal AI and MCP APIs, internal service tokens,
queue job schemas, notification delivery payloads, billing, and the physical
database schema. Those surfaces are documented in
[ARCHITECTURE.md](ARCHITECTURE.md) and [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md).

**Path convention:** the product API is served from the `api.` host. This
specification records the canonical product prefix as `/api/v1`. The ingestion
surface remains on its own host and prefix and MUST NOT be reachable through the
product API.

---

## 2. API conventions

### 2.1 Base URL

| Environment | Base URL |
| --- | --- |
| Production | `https://api.sentinelai.com/api/v1` |
| Staging | `https://api.staging.sentinelai.com/api/v1` |
| Local | `http://localhost:3000/api/v1` |

All endpoints in this document are relative to the base URL.

### 2.2 REST method semantics

| Method | Safe | Idempotent | Use |
| --- | --- | --- | --- |
| `GET` | Yes | Yes | Read a resource or collection. Never mutates state. |
| `POST` | No | No (unless `Idempotency-Key`) | Create a resource, request work, or perform a named action. |
| `PATCH` | No | No (unless `Idempotency-Key`) | Partially update a mutable resource. |
| `DELETE` | No | Yes | Revoke, remove, or soft-delete a resource. |

- Resource URLs are nouns in plural form. Actions that are not simple CRUD are
  modeled as sub-resource commands (`/merge`, `/split`, `/resolve`, `/decision`).
- `PUT` is not used in v1. Clients send `PATCH` with only the fields to change.
- State-changing requests MUST use `Content-Type: application/json`.
- Successful `DELETE` requests return `204 No Content` unless a response body is
  explicitly documented.

### 2.3 Requests

- Request and response bodies are UTF-8 JSON: `application/json; charset=utf-8`.
- Unknown request properties are rejected (`additionalProperties: false`).
- Empty bodies are rejected for endpoints that require a body.
- Query parameters are case-sensitive, validated against an allowlist, and
  unknown parameters are rejected with `422 validation_failed`.
- Arrays use JSON arrays; booleans use JSON booleans; enums use lowercase snake
  case strings unless stated otherwise.
- Free-text fields preserve internal whitespace after leading and trailing
  whitespace is normalized, except where explicitly noted.
- Sensitive values (passwords, tokens, API key secrets, raw telemetry) MUST NOT
  appear in URLs, query strings, logs, audit metadata, or error responses.

### 2.4 Responses

Single resources and command results use a data envelope:

```json
{
  "data": {
    "id": "inc_01JB3M9A2B4C6D8E0F2G4H6JKM",
    "status": "investigating"
  },
  "meta": {
    "requestId": "req_01JB3M9B2C4D6E8F0G2H4J6K"
  }
}
```

Collections use the same envelope with an array and pagination metadata:

```json
{
  "data": [],
  "meta": {
    "requestId": "req_01JB3M9B2C4D6E8F0G2H4J6K",
    "pagination": {
      "limit": 25,
      "hasMore": false,
      "nextCursor": null
    }
  }
}
```

- `meta.requestId` is always present and matches `X-Request-ID`.
- `meta.pagination` is present only for collection responses.
- Errors do not use the data envelope. They use RFC 9457 Problem Details
  (section 5).
- `204 No Content` responses have no body.
- `202 Accepted` responses return a resource or operation envelope containing the
  operation ID and current status.
- Server-generated fields are read-only. Clients MUST NOT send `id`, `orgId`,
  `createdAt`, `updatedAt`, `deletedAt`, `version`, computed metrics, or model
  provenance fields in request bodies.

### 2.5 Identifiers, timestamps, and enums

- All product IDs are opaque, prefixed ULIDs:
  `^(org|usr|mem|inv|team|prj|env|key|svc|inc|tlv|note|rec|evd|fb|msg|doc|chk|apr|apd|aud|ses|tok|idem)_[0-9A-HJKMNP-TV-Z]{26}$`.
- Clients MUST treat IDs as opaque strings. They MUST NOT parse, construct, or
  assume ordering beyond the documented prefix.
- `investigationId` is an incident ID (`inc_...`). An investigation is the
  read/write workspace over one incident.
- Timestamps are RFC 3339 strings in UTC with millisecond or microsecond
  precision, for example `2026-11-07T14:03:22.481Z`.
- Date-only query values are RFC 3339 date or date-time strings. A date without
  a time is interpreted as midnight UTC.
- Durations in request bodies use integer seconds unless a field is documented
  as an ISO 8601 duration.
- Enumerations are validated against the closed sets in section 9.1. Unknown
  values are rejected with `422 validation_failed`.

### 2.6 Pagination, filtering, and sorting

- Collections are cursor-paginated. Clients MUST NOT use offsets.
- Query parameters:
  - `limit`: integer, `1`–`100`, default `25`. Log search allows `1`–`200`,
    default `50`.
  - `cursor`: opaque base64url string returned as `nextCursor`. Maximum 512
    characters.
- Ordering is stable and documented per endpoint. A stable tie-breaker is always
  applied, so a page never duplicates or skips a row.
- A request with a malformed or expired cursor returns `400 invalid_cursor`.
- Filters are explicit query parameters documented per endpoint. Unknown filters
  are rejected.
- Sorting uses `sort=<field>` or `sort=-<field>` for descending order. Only
  allowlisted fields are accepted. Invalid sort fields return `422`.
- Collection filters are applied after tenant and team authorization. A filter
  MUST NOT let a caller infer the existence of another tenant's resource.

### 2.7 Idempotency

- Unsafe requests MAY include `Idempotency-Key`.
- `Idempotency-Key` is 8–255 printable ASCII characters and is scoped to the
  authenticated actor, organization, route, and method.
- Keys are stored for 24 hours with a request fingerprint.
- Replaying the same key with the same fingerprint returns the stored response and
  sets `Idempotent-Replay: true`.
- Reusing a key with a different request body returns `409 idempotency_conflict`.
- `Idempotency-Key` is REQUIRED for:
  - `POST /incidents`
  - `POST /investigations/{investigationId}/recommendations`
  - `POST /investigations/{investigationId}/assistant/messages`
  - `POST /approvals`
  - `POST /approvals/{approvalId}/decision`
  - `POST /environments/{environmentId}/api-keys`
  - `POST /knowledge/documents`
- It is RECOMMENDED for all other unsafe operations that may be retried, including
  notes, feedback, merges, splits, and resolution.

### 2.8 Concurrency control

- Mutable aggregate reads return an `ETag` derived from the resource `version`.
- Incidents and approval requests carry an integer `version` in the response.
- `PATCH /incidents/{incidentId}` and `PATCH /incidents/{incidentId}/status`
  require `If-Match: "<version>"`. A mismatch returns `409 version_conflict`.
- `POST /approvals/{approvalId}/decision` requires `If-Match: "<version>"`.
- Clients SHOULD re-read the resource and reapply changes after a version
  conflict. They MUST NOT blindly retry stale mutations.
- Status transitions are validated server-side. Invalid transitions return
  `409 invalid_transition` with the current and requested status.

### 2.9 Rate limiting

- Limits are applied per IP, per session, per organization, and per endpoint
  class.
- Responses include `RateLimit-Limit`, `RateLimit-Remaining`, and
  `RateLimit-Reset`.
- A throttled request returns `429 rate_limited` with `Retry-After` in seconds.
- Authentication, password recovery, and verification resend endpoints have
  stricter limits. Verification resend allows at most five sends per hour per
  email; resend is available after a 60-second cooldown.
- AI recommendation and assistant endpoints are additionally limited by tenant
  quota and provider concurrency. Quota exhaustion uses `429 quota_exceeded`.

### 2.10 Request correlation and caching

- `X-Request-ID` is accepted and echoed. If absent, the server generates one.
- `traceparent` is propagated according to W3C Trace Context.
- Every error response includes the request ID and trace ID.
- `GET` responses MAY include `ETag` and `Last-Modified`. Clients may send
  `If-None-Match` or `If-Modified-Since`; `304 Not Modified` has no body.
- Authenticated responses are `Cache-Control: private, no-store` unless
  explicitly documented as cacheable. Tenant data is never cached by a shared
  edge cache.

---

## 3. Authentication and authorization

### 3.1 Authentication methods

| Caller | Method | Allowed API |
| --- | --- | --- |
| Browser / Next.js | Session cookie | Product API `/api/v1` |
| Next.js server | Session cookie forwarded from the browser | Product API `/api/v1` |
| OpenTelemetry collector | API key | Ingestion API only, never `/api/v1` |
| External integration | HMAC or provider signature | Webhook ingress only |
| Internal AI/MCP services | Service token + mTLS | Internal APIs only |

**API keys are ingestion-only.** They cannot read incidents, manage members,
manage projects, call AI endpoints, or access any route in this specification.

### 3.2 Session cookie and CSRF

- The session is an opaque, random token stored server-side and sent as an
  `HttpOnly`, `Secure`, `SameSite=Lax` cookie.
- Cookie name: `__Host-sentinel_session`.
- Session expiration has both an idle timeout and an absolute lifetime. Expired
  sessions return `401 session_expired`.
- Login, registration verification, organization selection, and logout rotate or
  revoke the session cookie.
- All unsafe requests (anything other than `GET`, `HEAD`, or `OPTIONS`) MUST
  include `X-CSRF-Token` matching the session-bound CSRF token. A missing or
  invalid token returns `403 csrf_invalid`.
- The CSRF token is returned in the login and session responses. It is not
  accepted in a query parameter.
- Logout revokes the current session. Password reset revokes every other active
  session for the user.

### 3.3 Tenant resolution

`organizations.id` is the tenant key. Access to a tenant always requires an
active `memberships` row.

- Routes with `{orgId}` in the path resolve the tenant explicitly.
- All other tenant-scoped routes resolve the tenant from the session's active
  organization.
- A client MAY send `X-Organization-Id` to select a different organization for
  one request. The caller MUST have an active membership in that organization.
  An invalid or unauthorized value returns `403 forbidden` without revealing
  whether the organization exists.
- If the user belongs to one organization, login selects it automatically. If the
  user belongs to multiple organizations, the client must call
  `POST /auth/select-organization` before calling other tenant routes.
- A request that has no active organization returns `409 organization_required`.
- Every tenant-owned row in every query and mutation is filtered by the resolved
  organization.

### 3.4 Roles and teams

Membership roles inside an organization:

| Role | Scope |
| --- | --- |
| `owner` | Full organization control. Exactly one active owner. |
| `admin` | Manages members, projects, environments, keys, and integrations. |
| `responder` | Investigates and resolves incidents for assigned teams. |
| `viewer` | Read-only access to incidents, evidence, logs, and reports. |

Team roles are `member` and `lead`. A team lead is an operational signal, not an
organization-wide role.

Team visibility rules:

- `owner` and `admin` can read and mutate organization-wide, subject to
  ownership-transfer and self-approval restrictions.
- `responder` and `viewer` can read resources belonging to teams they are a
  member of. Mutating actions for responders additionally require team scope.
- Resources with no owning team (for example an unowned project or incident) are
  visible to all active members of the organization so they can be claimed, and
  are flagged as unowned in responses.
- A caller cannot elevate team scope by supplying a `teamId` they do not belong
  to. Doing so returns `403 forbidden`.
- An `admin` cannot grant a role above their own authority. Only an `owner` can
  transfer ownership or create another owner through the transfer flow.

The `approver` capability is separate from the role. An owner or admin is always
eligible to approve. A responder is eligible only when explicitly authorized for
the approval's action type and assigned team, and never for their own request
(four-eyes rule).

### 3.5 Permission catalogue

| Permission | Meaning |
| --- | --- |
| `organization:read` | Read organization profile and settings. |
| `organization:update` | Update organization profile and settings. |
| `organization:create` | Create an organization. |
| `organization:delete` | Request organization deletion. |
| `organization:transfer` | Transfer ownership. |
| `member:read` | List and read members and invitations. |
| `member:invite` | Create, resend, and revoke invitations. |
| `member:update` | Change member role, status, or team assignment. |
| `member:remove` | Remove a member. |
| `project:read` | Read projects. |
| `project:create` | Create projects. |
| `project:update` | Update projects. |
| `project:archive` | Archive projects. |
| `environment:read` | Read environments. |
| `environment:create` | Create environments. |
| `environment:update` | Update environments. |
| `environment:archive` | Archive environments. |
| `api_key:read` | Read API key metadata. |
| `api_key:create` | Create API keys. |
| `api_key:rotate` | Rotate API keys. |
| `api_key:revoke` | Revoke API keys. |
| `log:read` | Search and read retained logs. |
| `incident:read` | List and read incidents. |
| `incident:create` | Create incidents manually. |
| `incident:update` | Update incident fields and ownership. |
| `incident:status` | Change incident status. |
| `incident:merge` | Merge incidents. |
| `incident:split` | Split incidents. |
| `incident:resolve` | Resolve incidents. |
| `incident:reopen` | Reopen incidents within the reopen window. |
| `note:read` | Read investigation notes. |
| `note:create` | Add investigation notes. |
| `note:update` | Edit notes. |
| `note:delete` | Delete notes. |
| `recommendation:read` | Read AI recommendations and evidence. |
| `recommendation:request` | Request or refresh AI recommendations. |
| `recommendation:feedback` | Record recommendation feedback. |
| `assistant:read` | Read assistant transcripts. |
| `assistant:use` | Ask the incident assistant questions. |
| `knowledge:read` | Read and search knowledge. |
| `knowledge:create` | Create knowledge documents. |
| `knowledge:update` | Update or version knowledge documents. |
| `knowledge:delete` | Delete knowledge documents. |
| `knowledge:reindex` | Reindex knowledge documents. |
| `approval:read` | Read approval requests and decisions. |
| `approval:request` | Create approval requests. |
| `approval:decide` | Approve or reject requests. |
| `audit:read` | Read audit events. |

### 3.6 Permission matrix

`Team` means the permission is limited to teams the caller belongs to. `Cond.`
means conditional on the approver capability and the four-eyes rule.

| Permission | Owner | Admin | Responder | Viewer |
| --- | --- | --- | --- | --- |
| `organization:read` | Yes | Yes | Yes | Yes |
| `organization:create` | Yes | Yes | Yes | Yes |
| `organization:update` | Yes | Yes | No | No |
| `organization:delete` | Yes | No | No | No |
| `organization:transfer` | Yes | No | No | No |
| `member:read` | Yes | Yes | No | No |
| `member:invite` | Yes | Yes | No | No |
| `member:update` | Yes | Yes | No | No |
| `member:remove` | Yes | Yes | No | No |
| `project:read` | Yes | Yes | Team | Team |
| `project:create` | Yes | Yes | No | No |
| `project:update` | Yes | Yes | No | No |
| `project:archive` | Yes | Yes | No | No |
| `environment:read` | Yes | Yes | Team | Team |
| `environment:create` | Yes | Yes | No | No |
| `environment:update` | Yes | Yes | No | No |
| `environment:archive` | Yes | Yes | No | No |
| `api_key:read` | Yes | Yes | No | No |
| `api_key:create` | Yes | Yes | No | No |
| `api_key:rotate` | Yes | Yes | No | No |
| `api_key:revoke` | Yes | Yes | No | No |
| `log:read` | Yes | Yes | Team | Team |
| `incident:read` | Yes | Yes | Team | Team |
| `incident:create` | Yes | Yes | Yes | No |
| `incident:update` | Yes | Yes | Team | No |
| `incident:status` | Yes | Yes | Team | No |
| `incident:merge` | Yes | Yes | Team | No |
| `incident:split` | Yes | Yes | Team | No |
| `incident:resolve` | Yes | Yes | Team | No |
| `incident:reopen` | Yes | Yes | Team | No |
| `note:read` | Yes | Yes | Team | Team |
| `note:create` | Yes | Yes | Team | No |
| `note:update` | Yes | Yes | Own | No |
| `note:delete` | Yes | Yes | Own | No |
| `recommendation:read` | Yes | Yes | Team | Team |
| `recommendation:request` | Yes | Yes | Team | No |
| `recommendation:feedback` | Yes | Yes | Team | No |
| `assistant:read` | Yes | Yes | Team | Team |
| `assistant:use` | Yes | Yes | Team | No |
| `knowledge:read` | Yes | Yes | Team | Team |
| `knowledge:create` | Yes | Yes | No | No |
| `knowledge:update` | Yes | Yes | No | No |
| `knowledge:delete` | Yes | Yes | No | No |
| `knowledge:reindex` | Yes | Yes | No | No |
| `approval:read` | Yes | Yes | Team | Team |
| `approval:request` | Yes | Yes | Team | No |
| `approval:decide` | Yes | Yes | Cond. | No |
| `audit:read` | Yes | Yes | No | No |

`Own` means the actor authored the note. An owner or admin can edit or delete any
note in the organization.

### 3.7 Authorization rules

1. Authentication runs before authorization. Every route except the public health
   and auth routes requires a valid session.
2. Authorization is enforced in the application layer by role plus team scope.
   The database enforces tenant integrity, not the full policy.
3. A caller MUST NOT read or mutate a resource in another organization, even with
   a valid ID. The response is `404 not_found`, not `403`, to avoid disclosure.
4. `403 forbidden` is used when the resource is in the caller's tenant but the
   caller lacks the permission or team scope.
5. A viewer can read incidents, timelines, evidence, knowledge, logs, and
   approval status, but every mutation returns `403 forbidden`.
6. A responder cannot manage members, projects, environments, API keys, or
   knowledge.
7. Self-approval of a sensitive approval request is always forbidden, including
   for owners and admins.
8. A request that would remove or demote the last active owner returns
   `409 last_owner`.
9. Permission checks are applied to the resolved tenant and actor. They are never
   trusted from client-supplied roles, scopes, or headers.

### 3.8 Audit

- Every mutation of security or configuration significance emits an audit event:
  authentication, organization, membership, invitation, project, environment,
  API key, incident status, resolution, recommendation feedback, approval,
  knowledge version, and deletion.
- Audit metadata never contains passwords, tokens, API key secrets, raw
  telemetry, or full sensitive request bodies.
- Audit records are append-only. They are not exposed by these endpoints except
  through the future `GET /audit-events` resource documented in
  [ARCHITECTURE.md](ARCHITECTURE.md).

---

## 4. HTTP status codes

| Status | Meaning | Use in this API |
| --- | --- | --- |
| `200 OK` | Success | Reads, updates, and commands with a response body. |
| `201 Created` | Resource created | Resource creation. |
| `202 Accepted` | Asynchronous work accepted | AI generation, assistant message, indexing, deletion, resend. |
| `204 No Content` | Success without body | Logout, revoke, delete, archive where documented. |
| `304 Not Modified` | Conditional read matched | `GET` with a matching `If-None-Match`. |
| `400 Bad Request` | Malformed syntax | Invalid JSON, invalid cursor, malformed query value. |
| `401 Unauthorized` | Not authenticated | Missing, invalid, or expired session. |
| `403 Forbidden` | Authenticated but not allowed | Missing permission, team scope, CSRF failure, four-eyes block. |
| `404 Not Found` | Resource not found | Unknown ID, expired evidence, or cross-tenant access. |
| `405 Method Not Allowed` | Unsupported method | Method not defined for the route. |
| `409 Conflict` | State or uniqueness conflict | Version conflict, invalid transition, duplicate, last owner, open approvals, idempotency conflict. |
| `413 Payload Too Large` | Body exceeds limit | Request body over the documented maximum. |
| `415 Unsupported Media Type` | Wrong content type | Missing or non-JSON body on a JSON endpoint. |
| `422 Unprocessable Entity` | Semantic validation failure | Field validation, enum, range, cross-field rules. |
| `429 Too Many Requests` | Rate or quota exceeded | Includes `Retry-After`. |
| `500 Internal Server Error` | Unexpected failure | No internal details are exposed. |
| `502 Bad Gateway` | Dependency returned an invalid response | Upstream dependency failure. |
| `503 Service Unavailable` | Dependency unavailable or not ready | Retryable after `Retry-After`. |
| `504 Gateway Timeout` | Upstream timed out | Retryable. |

---

## 5. Errors

### 5.1 Problem Details

All errors use RFC 9457 `application/problem+json`:

```json
{
  "type": "https://docs.sentinelai.com/errors/validation-failed",
  "title": "Request validation failed",
  "status": 422,
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/projects",
  "code": "validation_failed",
  "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
  "requestId": "req_01JB3M9B2C4D6E8F0G2H4J6K",
  "errors": [
    {
      "field": "key",
      "code": "already_exists",
      "message": "Project key is already in use."
    }
  ]
}
```

Rules:

- `code` is stable and documented; `title` is human-readable; `detail` never
  includes secrets, stack traces, SQL, internal hostnames, or raw telemetry.
- `errors[]` is present for validation failures and identifies fields without
  echoing sensitive values.
- `requestId` and `traceId` are always present.
- Authentication and authorization errors do not reveal whether a resource exists
  unless the caller already has access.

### 5.2 Error codes

| Code | Status | Meaning | Retryable |
| --- | --- | --- | --- |
| `validation_failed` | `422` | Field or cross-field validation failed. | No |
| `invalid_request` | `400` | Malformed JSON, query, or cursor. | No |
| `invalid_cursor` | `400` | Pagination cursor is malformed or expired. | No |
| `invalid_token` | `400` | Verification, reset, or invitation token is malformed or unknown. | No |
| `unauthenticated` | `401` | No valid session. | No |
| `session_expired` | `401` | Session is expired or revoked. | No |
| `invalid_credentials` | `401` | Email or password is incorrect. | No |
| `csrf_invalid` | `403` | CSRF token missing or invalid. | No |
| `forbidden` | `403` | Missing permission or team scope. | No |
| `four_eyes_violation` | `403` | Requester attempted to approve their own request. | No |
| `email_unverified` | `403` | Account email has not been verified. | No |
| `account_unavailable` | `403` | Account is suspended or disabled. | No |
| `not_found` | `404` | Resource does not exist in the tenant. | No |
| `evidence_expired` | `404` | Evidence or telemetry is no longer retained. | No |
| `method_not_allowed` | `405` | Unsupported method. | No |
| `conflict` | `409` | Generic state conflict. | No |
| `already_exists` | `409` | Unique natural key already exists. | No |
| `version_conflict` | `409` | `If-Match` version is stale. | No |
| `idempotency_conflict` | `409` | Reused idempotency key with a different request. | No |
| `invalid_transition` | `409` | Lifecycle transition is not allowed. | No |
| `last_owner` | `409` | Operation would remove the last active owner. | No |
| `last_environment` | `409` | Cannot archive the last active environment. | No |
| `seat_limit_reached` | `409` | Plan seat limit would be exceeded. | No |
| `project_limit_reached` | `409` | Plan project limit would be exceeded. | No |
| `organization_required` | `409` | No active organization is selected. | No |
| `open_approvals` | `409` | Unresolved critical approvals block resolution. | No |
| `reopen_window_expired` | `409` | Incident is outside the seven-day reopen window. | No |
| `expired` | `409` | Approval or invitation has expired. | No |
| `time_range_too_large` | `422` | Requested time range exceeds the endpoint maximum. | No |
| `quota_exceeded` | `429` | Plan or AI quota exhausted. | No |
| `rate_limited` | `429` | Rate limit exceeded. | Yes, after delay |
| `payload_too_large` | `413` | Body exceeds the limit. | No |
| `unsupported_media_type` | `415` | Content type is not JSON. | No |
| `internal_error` | `500` | Unexpected server error. | Maybe |
| `dependency_unavailable` | `502`, `503` | Downstream dependency failed. | Yes |
| `not_ready` | `503` | A required dependency is not ready. | Yes, after delay |
| `upstream_timeout` | `504` | Downstream timed out. | Yes |

Common errors for every authenticated endpoint, in addition to the
endpoint-specific errors listed later:

- `401 unauthenticated` / `401 session_expired`
- `403 csrf_invalid` for unsafe methods
- `403 forbidden`
- `404 not_found` for unknown or cross-tenant resources
- `413` / `415` when a body is present but not acceptable
- `429 rate_limited`
- `500 internal_error`

---

## 6. Validation

### 6.1 Global rules

1. Route schemas validate params, query, headers, and body before business logic.
2. The schema is JSON Schema / TypeBox and is the source of truth for OpenAPI.
3. Unknown request properties are rejected. Read-only properties are rejected if
   supplied.
4. Valid JSON with a semantically invalid value returns `422`; syntactically
   invalid JSON returns `400 invalid_request`.
5. `limit`, ranges, enum values, date ranges, and cross-field rules are validated
   before any database read where possible.
6. PATCH semantics:
   - Absent field: no change.
   - `null`: clears the field only when the field is documented as nullable.
   - Empty object: `422 validation_failed` because no change was requested.
7. Unique values that lose a race return `409 already_exists`.
8. Optimistic-concurrency failures return `409 version_conflict`.
9. Validation error messages never echo passwords, tokens, API key secrets, raw
   telemetry, or sensitive free text.

### 6.2 Body limits and field primitives

| Field type | Rule |
| --- | --- |
| General request body | Maximum 1 MiB; larger returns `413`. |
| Knowledge document body | Maximum 5 MiB; larger returns `413`. |
| `email` | Maximum 254 characters, valid RFC 5322 address, normalized to lowercase for lookup; display casing is preserved. |
| `password` | 12–128 characters, at least a `zxcvbn` score of 3, not equal to the email or name, no leading or trailing whitespace. Never logged. |
| `name` | 1–120 characters after trimming. |
| `title` (incident, document, approval) | 1–200 characters after trimming. |
| `summary` | 1–1,000 characters unless a schema sets a tighter limit. |
| `note.body` | 1–10,000 characters; Markdown or plain text. |
| `assistant.content` | 1–8,000 characters. |
| `knowledge.content` | 1–5,000,000 characters; required if `sourceUrl` is absent. |
| `slug` | Lowercase `^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$`. |
| `project.key` | `^[A-Z0-9]{2,12}$`, case-insensitive unique per organization. |
| `URL` | Absolute `https://` URL, maximum 2,048 characters. |
| `timezone` | Valid IANA time zone. |
| `locale` | BCP 47 language tag. |
| `Idempotency-Key` | 8–255 printable ASCII characters. |
| `If-Match` | Quoted integer version, for example `"7"`. |
| `cursor` | Opaque base64url, maximum 512 characters. |

### 6.3 Time ranges

- Query ranges use `startTime` and `endTime` (inclusive start, exclusive end) or
  the endpoint-specific names documented below.
- `startTime` MUST be before `endTime`.
- Log search requires both bounds and allows at most 30 days per request,
  matching the default log retention.
- Timeline reads allow at most 90 days per request or the incident lifetime,
  whichever is shorter.

---

## 7. Versioning, deprecation, and compatibility

- The major version is in the URL: `/api/v1`. Breaking changes require a new
  major version (`/api/v2`).
- Within `v1`, changes are additive only:
  - new optional request fields,
  - new response fields,
  - new enum values where the client is required to tolerate unknown values,
  - new endpoints,
  - new optional query parameters.
- Removing or renaming a field, changing a type, making an optional field
  required, or changing an error code is breaking.
- Deprecated fields and endpoints are:
  - marked `deprecated: true` in OpenAPI,
  - announced with `Deprecation` and `Sunset` response headers,
  - documented in the changelog and release notes.
- Clients MUST ignore unknown response fields and unknown enum values they do not
  act on.
- The OpenAPI document declares `info.version` as the API release version and
  includes a `servers` entry for each environment.
- Ingestion has its own versioned path and rate limits. It is not affected by
  product API versioning.

---

## 8. OpenAPI contract

### 8.1 Document and runtime

- OpenAPI version: 3.1.
- Canonical artifact: `openapi/sentinelai-v1.json`, built in CI.
- Runtime document: `GET https://api.sentinelai.com/api/v1/openapi.json`.
- Interactive reference: `GET https://api.sentinelai.com/api/v1/docs` (internal or
  approved-partner access only).
- The document is generated from Fastify/TypeBox route schemas. Hand-written
  schemas that drift from routes are not permitted.
- Tags: `Health`, `Auth`, `Organizations`, `Members`, `Projects`, `Environments`,
  `API Keys`, `Logs`, `Incidents`, `Investigations`, `Knowledge`, `Approvals`.

### 8.2 Security schemes

```yaml
components:
  securitySchemes:
    sessionCookie:
      type: apiKey
      in: cookie
      name: __Host-sentinel_session
      description: Opaque server-side session for browser and Next.js callers.
    csrfToken:
      type: apiKey
      in: header
      name: X-CSRF-Token
      description: Session-bound CSRF token required for unsafe methods.
```

- Public routes set `security: []`.
- Authenticated reads use `sessionCookie`.
- Unsafe routes use both `sessionCookie` and `csrfToken`.
- API keys are deliberately absent from the product API security schemes.

### 8.3 Generation and contract tests

1. Route schemas are the source of truth.
2. CI generates the OpenAPI document and the typed frontend client.
3. Contract tests fail when implementation responses drift from schemas.
4. Security tests assert the authorization matrix, tenant isolation, and that API
   keys are rejected by every `/api/v1` route.
5. The frontend pins a generated client version and upgrades through normal
   dependency review.

---

## 9. Common schemas

### 9.1 Enumerations

| Enum | Values |
| --- | --- |
| Organization status | `active`, `suspended`, `archived`, `pending_deletion` |
| Membership role | `owner`, `admin`, `responder`, `viewer` |
| Membership status | `active`, `suspended`, `removed` |
| Invitation status | `pending`, `accepted`, `expired`, `revoked` |
| Project / environment status | `active`, `archived` |
| Environment kind | `production`, `staging`, `development`, `testing`, `other` |
| Criticality | `critical`, `high`, `medium`, `low` |
| API key status | `active`, `rotating`, `revoked`, `expired` |
| API key scope | `logs:write`, `metrics:write`, `traces:write`, `alerts:write` |
| Log severity | `trace`, `debug`, `info`, `warn`, `error`, `fatal` |
| Incident status | `triage`, `investigating`, `identified`, `monitoring`, `resolved` |
| Incident severity | `sev1`, `sev2`, `sev3`, `sev4` |
| Detection source | `alert`, `log`, `metric`, `trace`, `manual`, `correlation`, `integration` |
| Resolution category | `code_change`, `config_change`, `infrastructure`, `dependency`, `traffic`, `human_error`, `false_positive`, `other` |
| Timeline event type | `incident_created`, `signal_attached`, `status_changed`, `note_added`, `deployment`, `recommendation_generated`, `feedback_recorded`, `assistant_message`, `approval_requested`, `approval_decided`, `resolution`, `reopened`, `merged`, `split`, `assignment` |
| Timeline signal type | `alert`, `log`, `metric`, `trace`, `deployment`, `note`, `status`, `ai`, `approval`, `other` |
| Recommendation confidence | `low`, `medium`, `high`, `insufficient` |
| Recommendation status | `proposed`, `accepted`, `rejected`, `superseded`, `expired` |
| Recommendation feedback | `accepted`, `rejected`, `corrected` |
| Assistant message role | `user`, `assistant`, `system` |
| Assistant message status | `pending`, `complete`, `failed`, `insufficient_evidence` |
| Knowledge document type | `runbook`, `postmortem`, `policy`, `service_description`, `deployment_note`, `other` |
| Knowledge source type | `manual`, `integration`, `postmortem`, `service_catalog` |
| Knowledge status | `processing`, `indexed`, `failed`, `stale`, `superseded`, `deleted` |
| Sensitivity | `public`, `internal`, `restricted` |
| Knowledge visibility | `org`, `project`, `team`, `restricted` |
| Approval action type | `ticket.create`, `incident.publish_update`, `postmortem.publish` |
| Approval target type | `incident`, `external_ticket`, `postmortem` |
| Approval risk | `low`, `medium`, `high`, `critical` |
| Approval status | `pending`, `approved`, `rejected`, `expired`, `cancelled`, `superseded`, `execution_failed`, `executed` |
| Approval execution status | `not_started`, `running`, `succeeded`, `failed` |
| Approval decision | `approved`, `rejected` |

### 9.2 Standard objects

#### User

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `usr_` ID. |
| `email` | string | Present to the user and to member managers. |
| `name` | string | Display name. |
| `status` | string | User status. |
| `emailVerifiedAt` | string \| null | Verification timestamp. |
| `timezone` | string | IANA zone. |
| `locale` | string | BCP 47 tag. |
| `lastLoginAt` | string \| null | Last successful login. |
| `createdAt` | string | Creation time. |
| `updatedAt` | string | Update time. |

#### Organization

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `org_` ID. |
| `name` | string | Display name. |
| `slug` | string | Globally unique, immutable. |
| `status` | string | Organization status. |
| `dataRegion` | string | Data region allowlist. |
| `plan` | string | Read-only plan. |
| `seatLimit` | integer | Read-only. |
| `projectLimit` | integer | Read-only. |
| `retention` | object | `logDays`, `metricDays`, `traceDays`, `incidentDays`, `auditDays`. |
| `defaultNotificationSettings` | object | Validated per channel. |
| `securitySettings` | object | Redaction and AI policy. |
| `aiTrainingOptIn` | boolean | Explicit opt-in only. |
| `createdAt` | string | Creation time. |
| `updatedAt` | string | Update time. |

#### Membership

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `mem_` ID. |
| `orgId` | string | Tenant. |
| `userId` | string | Global user ID. |
| `user` | User | Compact user summary. |
| `role` | string | Membership role. |
| `status` | string | Membership status. |
| `teamIds` | string[] | Teams assigned to the membership. |
| `joinedAt` | string | Join time. |
| `createdAt` | string | Creation time. |
| `updatedAt` | string | Update time. |

#### Invitation

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `inv_` ID. |
| `orgId` | string | Tenant. |
| `email` | string | Bound invited email. |
| `role` | string | Invited role. |
| `teamIds` | string[] | Teams granted on acceptance. |
| `status` | string | Invitation status. |
| `invitedByMembershipId` | string | Inviter. |
| `expiresAt` | string | Expiry. |
| `acceptedAt` | string \| null | Acceptance time. |
| `createdAt` | string | Creation time. |

#### Project

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `prj_` ID. |
| `orgId` | string | Tenant. |
| `owningTeamId` | string \| null | Team owner; null means unassigned. |
| `name` | string | Display name. |
| `key` | string | Uppercase key, immutable. |
| `description` | string \| null | Bounded. |
| `status` | string | `active` or `archived`. |
| `retentionSettings` | object | Organization-limited overrides. |
| `notificationSettings` | object | Routing rules. |
| `archivedAt` | string \| null | Archive time. |
| `createdAt` | string | Creation time. |
| `updatedAt` | string | Update time. |

#### Environment

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `env_` ID. |
| `orgId` | string | Tenant. |
| `projectId` | string | Parent project. |
| `name` | string | Unique per project, case-insensitive. |
| `kind` | string | Environment kind. |
| `criticality` | string | Criticality. |
| `isProtected` | boolean | Production defaults to `true`. |
| `status` | string | `active` or `archived`. |
| `archivedAt` | string \| null | Archive time. |
| `createdAt` | string | Creation time. |
| `updatedAt` | string | Update time. |

#### ApiKey (metadata only)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `key_` ID. |
| `environmentId` | string | Scope. |
| `name` | string | Display name. |
| `keyPrefix` | string | Non-secret display prefix. |
| `scopes` | string[] | Ingestion scopes. |
| `status` | string | Key status. |
| `expiresAt` | string | Expiry. |
| `rotationOverlapEndsAt` | string \| null | Old-key validity during rotation. |
| `lastUsedAt` | string \| null | Last use. |
| `lastUsedIp` | string \| null | Last use IP. |
| `createdByMembershipId` | string \| null | Creator. |
| `rotatedFromKeyId` | string \| null | Rotation predecessor. |
| `createdAt` | string | Creation time. |
| `revokedAt` | string \| null | Revocation time. |

The plaintext `secret` is returned only in the creation and rotation responses.
It is never returned by a read endpoint and never stored in plaintext.

#### LogEntry

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Opaque log reference (`ch:logs:<orgId>:<fingerprint>` or a signed opaque ID). |
| `timestamp` | string | Event time. |
| `ingestedAt` | string | Ingestion time. |
| `severity` | string | Log severity. |
| `body` | string | Redacted log text. |
| `attributes` | object | Non-secret labels. |
| `service` | object | `id`, `key`, `name` when known. |
| `projectId` | string | Project. |
| `environmentId` | string | Environment. |
| `traceId` | string \| null | Trace correlation. |
| `spanId` | string \| null | Span correlation. |

#### Incident

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `inc_` ID. |
| `number` | integer | Human-facing display number. |
| `title` | string | Title. |
| `summary` | string \| null | Current summary. |
| `severity` | string | Incident severity. |
| `status` | string | Incident status. |
| `detectionSource` | string | Detection source. |
| `projectId` | string | Project. |
| `environmentId` | string | Environment. |
| `services` | array | `{id, name, impact, isPrimary}`. |
| `owningTeamId` | string \| null | Owning team. |
| `ownerMembershipId` | string \| null | Owner; null means unowned. |
| `isUnowned` | boolean | Mirrors `ownerMembershipId === null`. |
| `correlation` | object | `{key, confidence}`. |
| `firstSignalAt` | string \| null | Earliest signal. |
| `openedAt` | string | Open time. |
| `acknowledgedAt` | string \| null | Acknowledgement time. |
| `resolvedAt` | string \| null | Resolution time. |
| `resolution` | object \| null | `{category, summary}`. |
| `mttdSeconds` | integer \| null | Computed. |
| `mttrSeconds` | integer \| null | Computed. |
| `reopenCount` | integer | Reopen count. |
| `version` | integer | Optimistic concurrency. |
| `createdAt` | string | Creation time. |
| `updatedAt` | string | Update time. |

#### TimelineEvent

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `tlv_` ID. |
| `incidentId` | string | Parent incident. |
| `eventType` | string | Event type. |
| `signalType` | string \| null | Signal type. |
| `source` | string | `system`, `user`, `integration`, `ai`, or a named integration. |
| `sourceId` | string \| null | External ID. |
| `serviceId` | string \| null | Service filter. |
| `environmentId` | string \| null | Environment filter. |
| `actor` | object | `{type, membershipId}`. |
| `title` | string | Event title. |
| `summary` | string \| null | Bounded summary. |
| `payload` | object | Redacted details. |
| `evidence` | array | `{type, ref, label, available, sourceStore, sourceId, timestamp}`. |
| `occurredAt` | string | Business event time. |
| `createdAt` | string | Persistence time. |

#### Note

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `note_` ID. |
| `incidentId` | string | Parent incident. |
| `authorMembershipId` | string | Author. |
| `body` | string | Note text. |
| `bodyFormat` | string | `markdown` or `plain`. |
| `mentionedMembershipIds` | string[] | Validated mentions. |
| `timelineEventId` | string \| null | Linked timeline event. |
| `editedAt` | string \| null | Last edit. |
| `createdAt` | string | Creation time. |
| `updatedAt` | string | Update time. |

#### Recommendation

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `rec_` ID. |
| `incidentId` | string | Parent incident. |
| `generationId` | string | Groups one model run. |
| `rank` | integer | 1–3. |
| `summary` | string | Hypothesis statement. |
| `rationale` | string | Explanation and ranking basis. |
| `confidence` | string | Confidence. |
| `status` | string | Recommendation status. |
| `rankingFactors` | object | Evidence strength, recency, relevance. |
| `nextSteps` | array | Safe, non-destructive checks. |
| `limitations` | array | Missing or conflicting evidence. |
| `validationStatus` | string | `valid`, `insufficient_evidence`, `rejected`. |
| `evidence` | Evidence[] | At least one per hypothesis. |
| `model` | object | `{provider, name, version, promptVersion}`. |
| `generatedAt` | string | Generation time. |
| `expiresAt` | string \| null | Staleness boundary. |
| `createdAt` | string | Creation time. |
| `updatedAt` | string | Update time. |

#### Evidence

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `evd_` ID. |
| `evidenceType` | string | `log`, `metric`, `trace`, `deployment`, `alert`, `timeline_event`, `knowledge_chunk`, `tool_result`, `service_catalog`, `dashboard`. |
| `evidenceRef` | string | Stable citation reference. |
| `sourceStore` | string | `clickhouse`, `postgres`, `s3`, `external`. |
| `sourceId` | string \| null | Source row or object ID. |
| `citationLabel` | string | Short source label. |
| `description` | string | Why the evidence matters. |
| `excerpt` | string \| null | Redacted, size-limited. |
| `knowledgeChunkId` | string \| null | Typed RAG citation. |
| `occurredAt` | string \| null | Evidence time. |
| `isAvailable` | boolean | Resolvable now. |
| `unavailableReason` | string \| null | `expired`, `deleted`, `access_denied`, `source_unavailable`. |
| `lastVerifiedAt` | string \| null | Last verification. |
| `metadata` | object | Non-secret source metadata. |

#### AssistantMessage

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `msg_` ID. |
| `conversationId` | string | Transcript group. |
| `parentMessageId` | string \| null | Thread parent. |
| `role` | string | `user`, `assistant`, `system`. |
| `authorMembershipId` | string \| null | Required for user messages. |
| `content` | string | Redacted content. |
| `citations` | array | Validated evidence references. |
| `toolCalls` | array | Redacted summaries. |
| `model` | object \| null | Assistant messages only. |
| `status` | string | Message status. |
| `errorCode` | string \| null | Stable public code. |
| `latencyMs` | integer \| null | Latency. |
| `createdAt` | string | Creation time. |
| `completedAt` | string \| null | Completion time. |

#### KnowledgeDocument

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `doc_` ID. |
| `projectId` | string \| null | Project scope; null means org-wide. |
| `serviceId` | string \| null | Service scope. |
| `documentType` | string | Document type. |
| `title` | string | Title. |
| `sourceType` | string | Source type. |
| `sourceId` | string \| null | External source ID. |
| `sourceUrl` | string \| null | HTTPS source URL. |
| `version` | integer | Document version. |
| `indexVersion` | integer | Embedding version. |
| `status` | string | Indexing status. |
| `sensitivity` | string | Sensitivity. |
| `visibility` | string | Visibility. |
| `allowedTeamIds` | string[] | Team ACL. |
| `allowedMembershipIds` | string[] | Membership ACL for restricted visibility. |
| `indexedAt` | string \| null | Index completion. |
| `createdAt` | string | Creation time. |
| `updatedAt` | string | Update time. |

#### ApprovalRequest

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `apr_` ID. |
| `incidentId` | string | Parent incident. |
| `requesterMembershipId` | string | Requester. |
| `approverMembershipId` | string \| null | Assigned approver. |
| `assignedTeamId` | string \| null | Eligibility team. |
| `actionType` | string | Supported action. |
| `targetType` | string | Target type. |
| `targetId` | string \| null | Target ID. |
| `actionPayload` | object | Validated, non-secret arguments. |
| `riskLevel` | string | Risk level. |
| `status` | string | Approval status. |
| `reason` | string \| null | Requester context. |
| `policyVersion` | string | Policy version. |
| `requiredApprovals` | integer | Number of approvals required. |
| `decisions` | ApprovalDecision[] | Immutable decisions. |
| `expiresAt` | string | Expiry. |
| `decidedAt` | string \| null | Decision time. |
| `executionStatus` | string \| null | Execution state. |
| `executionResult` | object | Redacted result. |
| `executedAt` | string \| null | Execution time. |
| `version` | integer | Optimistic concurrency. |
| `createdAt` | string | Creation time. |
| `updatedAt` | string | Update time. |

#### ApprovalDecision

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `apd_` ID. |
| `approvalRequestId` | string | Parent request. |
| `actorMembershipId` | string | Deciding actor. |
| `decision` | string | `approved` or `rejected`. |
| `reason` | string \| null | Optional reason. |
| `decidedAt` | string | Decision time. |

---

## 10. Endpoint specifications

The tables below define every endpoint. Common authentication and error behavior
from sections 3 and 5 applies in addition to the endpoint-specific entries.

Auth column values:

- `Public`: no session required.
- `Session`: valid session cookie required.
- `Session + CSRF`: valid session cookie and `X-CSRF-Token` required.

### 10.1 Health

| Method | URL | Auth | Permissions | Request body | Success | Endpoint-specific errors |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/health` | Public | None | — | `200` `HealthStatus` | `503` |
| `GET` | `/health/live` | Public | None | — | `200` `LivenessStatus` | `503` |
| `GET` | `/health/ready` | Public | None | — | `200` `ReadinessStatus` | `503` |

**Response schemas**

- `HealthStatus`: `{ "status": "ok" | "degraded", "version": string, "uptimeSeconds": integer }`.
- `LivenessStatus`: `{ "status": "alive" }`.
- `ReadinessStatus`: `{ "status": "ready" | "not_ready", "checks": [{ "name": string, "status": "up" | "down", "latencyMs": integer | null }] }`.

**Validation rules**

- No query parameters or body accepted. Unknown parameters return `422`.
- Health responses are not cached by shared caches.
- Readiness reports dependency names and status only. It never exposes
  connection strings, versions of internal dependencies, or stack traces.

**Errors**

- `503 not_ready` when a required dependency (PostgreSQL, Redis, ClickHouse, or
  object storage) is unavailable for readiness.
- `503` responses never include internal hostnames or credentials.

---

### 10.2 Auth

| Method | URL | Auth | Permissions | Request body | Success | Endpoint-specific errors |
| --- | --- | --- | --- | --- | --- | --- |
| `POST` | `/auth/register` | Public | None | `RegisterRequest` | `201` `User` | `409`, `422`, `429` |
| `POST` | `/auth/verify-email` | Public | None | `VerifyEmailRequest` | `200` `{user, session, csrfToken}` | `400`, `422`, `429` |
| `POST` | `/auth/verify-email/resend` | Public | None | `ResendVerificationRequest` | `202` `OperationAccepted` | `422`, `429` |
| `POST` | `/auth/login` | Public | None | `LoginRequest` | `200` `{user, organizations, activeOrganizationId, csrfToken}` | `401`, `422`, `429` |
| `POST` | `/auth/select-organization` | Session | None | `SelectOrganizationRequest` | `200` `{activeOrganizationId, csrfToken}` | `403`, `409`, `422` |
| `POST` | `/auth/logout` | Session + CSRF | None | — | `204` | `401` |
| `GET` | `/auth/me` | Session | None | — | `200` `{user, memberships, activeOrganizationId, permissions}` | `401`, `409` |
| `POST` | `/auth/password/request` | Public | None | `PasswordRequest` | `202` `OperationAccepted` | `422`, `429` |
| `POST` | `/auth/password/reset` | Public | None | `PasswordResetRequest` | `200` `OperationAccepted` | `400`, `422`, `429` |
| `GET` | `/auth/sessions` | Session | None | — | `200` `Session[]` | `401` |
| `DELETE` | `/auth/sessions/{sessionId}` | Session + CSRF | None | — | `204` | `401`, `403`, `404` |

**Request schemas**

- `RegisterRequest`:

  ```json
  {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "password": "correct horse battery staple",
    "termsAccepted": true,
    "timezone": "Europe/London",
    "locale": "en-GB"
  }
  ```

- `VerifyEmailRequest`: `{ "token": "string" }`.
- `ResendVerificationRequest`: `{ "email": "string" }`.
- `LoginRequest`: `{ "email": "string", "password": "string" }`.
- `SelectOrganizationRequest`: `{ "organizationId": "org_..." }`.
- `PasswordRequest`: `{ "email": "string" }`.
- `PasswordResetRequest`: `{ "token": "string", "newPassword": "string" }`.
- `OperationAccepted`: `{ "status": "accepted", "operationId": string }`.
- `Session` summary: `{ id, ipAddress, userAgent, lastSeenAt, idleExpiresAt, absoluteExpiresAt, createdAt, current }`.

**Validation rules**

- `POST /auth/register`
  - `name` 1–120 characters.
  - `email` valid and normalized. Duplicate registration returns a neutral
    success-shaped response and does not reveal account existence.
  - `password` meets the policy in section 6.2.
  - `termsAccepted` MUST be `true`.
  - `timezone` and `locale` are validated when present.
  - No session is created; `User.status` is `pending_verification`.
- `POST /auth/verify-email`
  - `token` is required, single-use, and expires after 24 hours.
  - An expired, consumed, or unknown token returns `400 invalid_token` without
    revealing account details.
  - Success activates the user, consumes the token, creates a session, and
    returns `user`, `session`, and the session-bound `csrfToken`.
- `POST /auth/verify-email/resend`
  - `email` valid. The response is always `202` with the same neutral body
    whether or not the account exists.
  - A new token invalidates the old token. At most five resends per hour per
    email and a 60-second cooldown apply.
- `POST /auth/login`
  - Invalid credentials return `401 invalid_credentials` with a generic message.
  - Unverified accounts return `403 email_unverified`.
  - Suspended or disabled accounts return `403 account_unavailable`.
  - On success, `organizations` lists memberships. If more than one organization
    exists and none was previously selected, `activeOrganizationId` is `null` and
    tenant routes return `409 organization_required` until selection.
  - Failed attempts are rate-limited per account and per IP.
- `POST /auth/select-organization`
  - `organizationId` must be an organization where the user has an active
    membership. Otherwise `403 forbidden`.
  - Updates the session's active organization and `last_selected_org_id`,
    rotates the CSRF token, and returns the new token.
- `POST /auth/logout`
  - Revokes the current session and clears the cookie. Calling it with an expired
    session returns `401 session_expired`.
- `GET /auth/me`
  - Returns the caller, memberships, active organization, and effective
    permissions. No sensitive fields are returned.
- `POST /auth/password/request`
  - Always returns `202` with a neutral body. A reset token valid for 30 minutes
    is sent only when an active account exists.
  - Rate-limited per email and per IP.
- `POST /auth/password/reset`
  - `newPassword` meets policy and differs from the current password.
  - Token is single-use and expires after 30 minutes.
  - Success updates the password, consumes the token, revokes all other
    sessions, and sends a confirmation email.
- `GET /auth/sessions`
  - Lists active sessions for the caller. `current` identifies the current one.
- `DELETE /auth/sessions/{sessionId}`
  - The caller may revoke their own sessions. Revoking another user's session is
    not possible through this endpoint and returns `404`.

**Errors**

- `401 invalid_credentials`, `401 session_expired`, `403 email_unverified`,
  `403 account_unavailable`, `403 csrf_invalid`, `409 organization_required`,
  `422 validation_failed`, `429 rate_limited`, `429 quota_exceeded` for resend
  abuse.

---

### 10.3 Organizations

| Method | URL | Auth | Permissions | Request body | Success | Endpoint-specific errors |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/organizations` | Session | `organization:read` | — | `200` `Page<Organization>` | `401` |
| `POST` | `/organizations` | Session + CSRF | `organization:create` | `CreateOrganizationRequest` | `201` `Organization` | `409`, `422`, `429` |
| `GET` | `/organizations/{orgId}` | Session | `organization:read` | — | `200` `Organization` | `403`, `404` |
| `PATCH` | `/organizations/{orgId}` | Session + CSRF | `organization:update` | `UpdateOrganizationRequest` | `200` `Organization` | `403`, `404`, `409`, `422` |
| `POST` | `/organizations/{orgId}/transfer-ownership` | Session + CSRF | `organization:transfer` | `TransferOwnershipRequest` | `200` `Organization` | `403`, `404`, `409`, `422` |
| `DELETE` | `/organizations/{orgId}` | Session + CSRF | `organization:delete` | `DeleteOrganizationRequest` | `202` `OperationAccepted` | `403`, `404`, `409`, `422` |

**Request schemas**

- `CreateOrganizationRequest`:

  ```json
  {
    "name": "Northwind",
    "slug": "northwind",
    "dataRegion": "us"
  }
  ```

- `UpdateOrganizationRequest`:

  ```json
  {
    "name": "Northwind Reliability",
    "retention": {
      "logDays": 30,
      "metricDays": 90,
      "traceDays": 14,
      "incidentDays": 365,
      "auditDays": 365
    },
    "defaultNotificationSettings": {},
    "securitySettings": {},
    "aiTrainingOptIn": false
  }
  ```

- `TransferOwnershipRequest`: `{ "newOwnerMembershipId": "mem_...", "confirm": true }`.
- `DeleteOrganizationRequest`: `{ "confirmSlug": "northwind", "reason": "optional" }`.

**Validation rules**

- `GET /organizations`
  - Returns only organizations where the caller has an active membership.
  - Supports `limit`, `cursor`, and `sort` (`name`, `-name`, `createdAt`,
    `-createdAt`).
- `POST /organizations`
  - `name` 1–120 characters.
  - `slug` matches the slug pattern, is globally unique, and is immutable after
    creation.
  - `dataRegion` is validated against the deployment region allowlist; it is
    immutable after creation.
  - Creation atomically creates the organization, the caller's `owner`
    membership, the default `Platform` team, default retention and notification
    settings, and an audit event.
  - Plan, seat limits, and project limits are server-assigned and read-only.
- `GET /organizations/{orgId}`
  - Requires an active membership. Cross-tenant access returns `404`.
- `PATCH /organizations/{orgId}`
  - `slug`, `plan`, `seatLimit`, `projectLimit`, `dataRegion`, and
    `createdAt` are rejected as read-only.
  - Retention values are within the ranges in section 9.2 and cannot exceed the
    plan limits.
  - `defaultNotificationSettings` and `securitySettings` are validated JSON
    objects with bounded keys.
  - `aiTrainingOptIn` changes only with an explicit boolean and is audited.
- `POST /organizations/{orgId}/transfer-ownership`
  - `confirm` must be `true`.
  - Target must be an active member of the same organization, must not be the
    current owner, and must not be suspended.
  - The transfer demotes the current owner to `admin` and promotes the target to
    `owner` in one transaction. It emits an audit event and a domain event.
  - Only the current owner can transfer ownership.
- `DELETE /organizations/{orgId}`
  - `confirmSlug` must exactly match the organization slug.
  - Only the owner can request deletion.
  - The request moves the organization to `pending_deletion`, disables ingestion,
    revokes API keys, and schedules the privacy job after the grace period.
  - The response is `202` and does not purge data synchronously.

**Errors**

- `403 forbidden`, `404 not_found`, `409 already_exists` for slug,
  `409 conflict` for a pending organization operation, `409 last_owner`,
  `422 validation_failed`, `429 rate_limited`.

---

### 10.4 Members

This section covers organization members and invitations. Invitations are
modeled under the organization because every invitation is tenant-scoped.

| Method | URL | Auth | Permissions | Request body | Success | Endpoint-specific errors |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/organizations/{orgId}/members` | Session | `member:read` | — | `200` `Page<Membership>` | `403`, `404` |
| `GET` | `/organizations/{orgId}/members/{memberId}` | Session | `member:read` | — | `200` `Membership` | `403`, `404` |
| `PATCH` | `/organizations/{orgId}/members/{memberId}` | Session + CSRF | `member:update` | `UpdateMemberRequest` | `200` `Membership` | `403`, `404`, `409`, `422` |
| `DELETE` | `/organizations/{orgId}/members/{memberId}` | Session + CSRF | `member:remove` | — | `204` | `403`, `404`, `409` |
| `POST` | `/organizations/{orgId}/invitations` | Session + CSRF | `member:invite` | `CreateInvitationRequest` | `201` `Invitation[]` | `403`, `404`, `409`, `422`, `429` |
| `GET` | `/organizations/{orgId}/invitations` | Session | `member:read` | — | `200` `Page<Invitation>` | `403`, `404` |
| `POST` | `/organizations/{orgId}/invitations/{invitationId}/resend` | Session + CSRF | `member:invite` | — | `202` `OperationAccepted` | `403`, `404`, `409`, `429` |
| `DELETE` | `/organizations/{orgId}/invitations/{invitationId}` | Session + CSRF | `member:invite` | — | `204` | `403`, `404`, `409` |
| `POST` | `/invitations/{token}/accept` | Session + CSRF | Self-acceptance only | `AcceptInvitationRequest` | `200` `Membership` | `400`, `403`, `404`, `409`, `422` |

**Request schemas**

- `UpdateMemberRequest`: `{ "role"?: "admin" | "responder" | "viewer", "status"?: "active" | "suspended", "teamIds"?: ["team_..."] }`.
- `CreateInvitationRequest`:

  ```json
  {
    "invitations": [
      {
        "email": "dev@example.com",
        "role": "responder",
        "teamIds": ["team_01JB3M8Q7Y4S2V6K9C1D5EFGHJ"]
      }
    ]
  }
  ```

- `AcceptInvitationRequest`: `{ "accept": true }`.

**Validation rules**

- `GET /organizations/{orgId}/members`
  - Filters: `role`, `status`, `teamId`, `search` (name or email), `limit`,
    `cursor`, `sort` (`name`, `-name`, `joinedAt`, `-joinedAt`).
  - Only owner/admin can read the member directory.
- `GET /organizations/{orgId}/members/{memberId}`
  - `memberId` must belong to `orgId`. Cross-tenant IDs return `404`.
- `PATCH /organizations/{orgId}/members/{memberId}`
  - Role changes are limited to `admin`, `responder`, and `viewer`. The `owner`
    role is changed only through `transfer-ownership`.
  - An admin cannot grant a role above their own authority or modify an owner.
  - `teamIds`, when present, replaces the member's team assignments; every team
    must belong to the same organization.
  - `status` may be `active` or `suspended`. A suspended member loses access but
    retains history.
  - The last active owner cannot be demoted or suspended (`409 last_owner`).
  - Every successful change is audited.
- `DELETE /organizations/{orgId}/members/{memberId}`
  - Soft-removes the membership, revokes the member's active sessions in the
    organization, preserves authored notes and audit history, and does not delete
    the global user.
  - The last active owner cannot be removed (`409 last_owner`).
  - Self-removal is allowed only when another active owner exists or ownership
    has been transferred.
- `POST /organizations/{orgId}/invitations`
  - `invitations` array length 1–50.
  - Each `email` is valid; each `role` is `admin`, `responder`, or `viewer`.
  - `owner` is rejected; ownership is granted only by transfer.
  - `teamIds` must belong to the organization.
  - A duplicate pending invitation for the same email returns `409 already_exists`
    and never creates duplicate pending rows.
  - Seat limits are enforced; exceeding the limit returns `409 seat_limit_reached`.
  - The invitation is bound to the exact invited email and expires after seven
    days.
- `GET /organizations/{orgId}/invitations`
  - Filters: `status`, `email`, `role`, `limit`, `cursor`, `sort`
    (`createdAt`, `-createdAt`, `expiresAt`, `-expiresAt`).
- `POST /organizations/{orgId}/invitations/{invitationId}/resend`
  - Only `pending` invitations can be resent.
  - A 60-second cooldown and a maximum of five sends per hour apply. Exceeding
    returns `429 rate_limited`.
  - Resending invalidates the prior token and sends a new one.
- `DELETE /organizations/{orgId}/invitations/{invitationId}`
  - Revokes a pending invitation. Accepted invitations cannot be revoked and
    return `409 conflict`.
- `POST /invitations/{token}/accept`
  - Requires an authenticated user whose verified email matches the invitation
    email exactly (case-insensitive).
  - The invitation must be `pending` and unexpired; otherwise `400 invalid_token`,
    `409 expired`, or `409 conflict`.
  - Accepting creates the membership with the invited role and teams atomically
    and marks the invitation `accepted`.
  - The caller can only accept an invitation for their own email, so a different
    user receives `403 forbidden`.

**Errors**

- `403 forbidden`, `404 not_found`, `409 already_exists`, `409 last_owner`,
  `409 seat_limit_reached`, `409 expired`, `409 conflict`,
  `422 validation_failed`, `429 rate_limited`.

---

### 10.5 Projects

| Method | URL | Auth | Permissions | Request body | Success | Endpoint-specific errors |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/projects` | Session | `project:read` | — | `200` `Page<Project>` | `403` |
| `POST` | `/projects` | Session + CSRF | `project:create` | `CreateProjectRequest` | `201` `Project` | `403`, `409`, `422`, `429` |
| `GET` | `/projects/{projectId}` | Session | `project:read` | — | `200` `Project` | `403`, `404` |
| `PATCH` | `/projects/{projectId}` | Session + CSRF | `project:update` | `UpdateProjectRequest` | `200` `Project` | `403`, `404`, `409`, `422` |
| `POST` | `/projects/{projectId}/archive` | Session + CSRF | `project:archive` | `ArchiveRequest` | `200` `Project` | `403`, `404`, `409`, `422` |

**Request schemas**

- `CreateProjectRequest`:

  ```json
  {
    "name": "Payments",
    "key": "PAY",
    "description": "Payments services and telemetry",
    "owningTeamId": "team_01JB3M8Q7Y4S2V6K9C1D5EFGHJ",
    "retentionSettings": {},
    "notificationSettings": {}
  }
  ```

- `UpdateProjectRequest`: `{ "name"?, "description"?, "owningTeamId"?, "retentionSettings"?, "notificationSettings"? }`.
- `ArchiveRequest`: `{ "reason": "optional" }`.

**Validation rules**

- `GET /projects`
  - Tenant resolved from session or `X-Organization-Id`.
  - Filters: `status` (`active`, `archived`), `owningTeamId`, `search`, `limit`,
    `cursor`, `sort` (`name`, `-name`, `createdAt`, `-createdAt`, `updatedAt`,
    `-updatedAt`).
  - Responders and viewers see only projects owned by their teams, plus unowned
    projects flagged as unowned.
- `POST /projects`
  - `name` 1–120 characters.
  - `key` matches `^[A-Z0-9]{2,12}$`, is normalized to uppercase, and is unique
    case-insensitively per organization.
  - `owningTeamId` must belong to the organization; omitting it creates an
    unowned project.
  - The organization project limit is enforced (`409 project_limit_reached`).
  - Retention overrides cannot exceed organization limits.
  - `notificationSettings` is validated per channel.
- `GET /projects/{projectId}`
  - Team scope applies. Cross-tenant IDs return `404`.
- `PATCH /projects/{projectId}`
  - `key`, `status`, `archivedAt`, `createdAt`, and `updatedAt` are read-only.
  - `owningTeamId` must belong to the same organization and the caller's scope.
  - Archiving is performed through the archive endpoint, not by setting `status`.
- `POST /projects/{projectId}/archive`
  - Already archived returns `409 conflict`.
  - Archiving stops ingestion and key use for the project while preserving
    incidents, notes, and audit history.
  - An archived project cannot be used as a target for new incidents or keys.

**Errors**

- `403 forbidden`, `404 not_found`, `409 already_exists` for `key`,
  `409 project_limit_reached`, `409 conflict`, `422 validation_failed`,
  `429 rate_limited`.

---

### 10.6 Environments

| Method | URL | Auth | Permissions | Request body | Success | Endpoint-specific errors |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/projects/{projectId}/environments` | Session | `environment:read` | — | `200` `Page<Environment>` | `403`, `404` |
| `POST` | `/projects/{projectId}/environments` | Session + CSRF | `environment:create` | `CreateEnvironmentRequest` | `201` `Environment` | `403`, `404`, `409`, `422` |
| `GET` | `/environments/{environmentId}` | Session | `environment:read` | — | `200` `Environment` | `403`, `404` |
| `PATCH` | `/environments/{environmentId}` | Session + CSRF | `environment:update` | `UpdateEnvironmentRequest` | `200` `Environment` | `403`, `404`, `409`, `422` |
| `POST` | `/environments/{environmentId}/archive` | Session + CSRF | `environment:archive` | `ArchiveRequest` | `200` `Environment` | `403`, `404`, `409`, `422` |

**Request schemas**

- `CreateEnvironmentRequest`:

  ```json
  {
    "name": "production",
    "kind": "production",
    "criticality": "critical",
    "isProtected": true,
    "confirmProduction": true
  }
  ```

- `UpdateEnvironmentRequest`: `{ "name"?, "kind"?, "criticality"?, "isProtected"? }`.

**Validation rules**

- `GET /projects/{projectId}/environments`
  - Filters: `status`, `kind`, `criticality`, `limit`, `cursor`, `sort`
    (`name`, `-name`, `createdAt`, `-createdAt`).
  - The project must be visible to the caller.
- `POST /projects/{projectId}/environments`
  - `name` 1–80 characters and unique per project case-insensitively.
  - `kind` is one of the documented environment kinds.
  - `criticality` defaults to `medium`.
  - A `production` environment requires `confirmProduction: true` and forces
    `isProtected: true`. Omitting either returns `422`.
  - The project must be `active`. Creating an environment in an archived project
    returns `409 conflict`.
- `GET /environments/{environmentId}`
  - Team scope applies through the parent project.
- `PATCH /environments/{environmentId}`
  - `status`, `archivedAt`, `projectId`, and `createdAt` are read-only.
  - Changing `kind` to `production` requires `isProtected: true`.
  - A production environment cannot be made unprotected (`422`).
  - `name` must remain unique per project.
- `POST /environments/{environmentId}/archive`
  - Already archived returns `409 conflict`.
  - The last active environment in a project cannot be archived unless the
    project is archived in the same transaction. Returning this condition uses
    `409 last_environment`.
  - Archiving stops ingestion for that environment and disables its API keys for
    new requests while preserving retained telemetry until TTL expiry.

**Errors**

- `403 forbidden`, `404 not_found`, `409 already_exists` for name,
  `409 last_environment`, `409 conflict`, `422 validation_failed`.

---

### 10.7 API keys

API keys are ingestion credentials. These endpoints manage key metadata and
plaintext secrets. The ingestion endpoints themselves are out of scope.

| Method | URL | Auth | Permissions | Request body | Success | Endpoint-specific errors |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/environments/{environmentId}/api-keys` | Session | `api_key:read` | — | `200` `Page<ApiKey>` | `403`, `404` |
| `POST` | `/environments/{environmentId}/api-keys` | Session + CSRF | `api_key:create` | `CreateApiKeyRequest` | `201` `ApiKeyWithSecret` | `403`, `404`, `409`, `422`, `429` |
| `GET` | `/api-keys/{keyId}` | Session | `api_key:read` | — | `200` `ApiKey` | `403`, `404` |
| `POST` | `/api-keys/{keyId}/rotate` | Session + CSRF | `api_key:rotate` | `RotateApiKeyRequest` | `201` `ApiKeyWithSecret` | `403`, `404`, `409`, `422` |
| `DELETE` | `/api-keys/{keyId}` | Session + CSRF | `api_key:revoke` | — | `204` | `403`, `404`, `409` |

**Request schemas**

- `CreateApiKeyRequest`:

  ```json
  {
    "name": "otel-collector-prod",
    "scopes": ["logs:write", "metrics:write", "traces:write", "alerts:write"],
    "expiresAt": "2027-05-07T00:00:00.000Z"
  }
  ```

- `RotateApiKeyRequest`: `{ "overlapSeconds": 86400 }`.
- `ApiKeyWithSecret`: `ApiKey` plus `{ "secret": "sk_live_..." }`, returned once.

**Validation rules**

- `GET /environments/{environmentId}/api-keys`
  - Filters: `status`, `limit`, `cursor`, `sort` (`createdAt`, `-createdAt`,
    `expiresAt`, `-expiresAt`, `lastUsedAt`, `-lastUsedAt`).
  - Only owner/admin can manage keys. The response never includes secrets.
- `POST /environments/{environmentId}/api-keys`
  - `name` 1–80 characters.
  - `scopes` is a non-empty subset of `logs:write`, `metrics:write`,
    `traces:write`, `alerts:write`. Duplicate scopes are rejected.
  - `expiresAt` is required, in the future, and at most two years ahead.
  - The environment must be `active` and the parent project must be `active`.
  - The secret is generated server-side, returned once, and only its keyed hash
    and public prefix are stored.
  - `Idempotency-Key` is required. A replayed creation returns the original
    secret response once within the idempotency window; repeated reads after the
    window never return the secret.
- `GET /api-keys/{keyId}`
  - Returns metadata only. Cross-tenant IDs return `404`.
- `POST /api-keys/{keyId}/rotate`
  - Only a key with status `active` or `rotating` can be rotated.
  - `overlapSeconds` is an integer from 0 to 604,800 (seven days); default
    `86400`.
  - Creates a new key with the same environment and scopes, marks the old key
    `rotating`, and sets `rotationOverlapEndsAt` on the old key.
  - The new secret is returned once.
  - Revoked or expired keys cannot be rotated (`409 conflict`).
- `DELETE /api-keys/{keyId}`
  - Revokes the key immediately and sets `revokedAt`.
  - Revoking an already revoked key returns `409 conflict`.
  - Revocation is idempotent from the client's perspective after the first
    successful call; the audit event records the actor and time.

**Errors**

- `403 forbidden`, `404 not_found`, `409 conflict`,
  `409 already_exists` for a duplicate name where names are unique per
  environment, `422 validation_failed`, `429 rate_limited`.

---

### 10.8 Logs

Logs are retained telemetry stored in ClickHouse and queried through the product
API. Log ingestion uses the separate ingestion API with an API key. These
endpoints are read-only and never mutate log data.

| Method | URL | Auth | Permissions | Request body | Success | Endpoint-specific errors |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/logs/search` | Session | `log:read` | — | `200` `{logs, pagination, query}` | `403`, `404`, `422`, `429` |
| `GET` | `/logs/{logId}` | Session | `log:read` | — | `200` `LogEntry` | `403`, `404` |
| `GET` | `/logs/ingestion-health` | Session | `log:read` | — | `200` `IngestionHealth` | `403`, `404` |

**Query parameters for `/logs/search`**

| Parameter | Type | Rules |
| --- | --- | --- |
| `startTime` | string | Required, RFC 3339. |
| `endTime` | string | Required, RFC 3339, after `startTime`; range at most 30 days. |
| `projectId` | string | Optional; must be visible. |
| `environmentId` | string | Optional; must belong to the project. |
| `serviceId` | string | Optional; must belong to the project. |
| `severity` | string | Optional; one of the log severities or a comma-separated list. |
| `query` | string | Optional; maximum 500 characters; full-text search syntax. |
| `traceId` | string | Optional; exact match. |
| `limit` | integer | 1–200, default 50. |
| `cursor` | string | Opaque. |

**Validation rules**

- `GET /logs/search`
  - Both time bounds are required; missing bounds return `422`.
  - A range longer than 30 days returns `422 time_range_too_large`.
  - All filters are intersected with tenant and team scope.
  - Results are ordered newest first by default. Supported `sort`: `timestamp`,
    `-timestamp`.
  - `query` supports a documented subset of full-text syntax; unsupported syntax
    returns `422 validation_failed`.
  - The response includes the normalized `query` object so the UI can display
    active filters.
- `GET /logs/{logId}`
  - `logId` is the opaque ID returned by search, not an alert or trace ID.
  - If the log has expired under retention, returns `404 evidence_expired` with
    last-known metadata when available.
  - Team scope is enforced from the log's project and service.
- `GET /logs/ingestion-health`
  - Query: `projectId?`, `environmentId?`, `window` (for example `1h`, `24h`,
    `7d`; default `1h`, maximum `7d`).
  - Returns accepted and rejected batch counts, last received time, and the most
    recent error code per environment. It never returns raw payloads or secrets.
  - Only counts for environments the caller can see are included.

**Response schemas**

- `IngestionHealth`: `{ "window": string, "environments": [{ "environmentId", "acceptedBatches", "rejectedBatches", "lastReceivedAt", "lastErrorCode" }] }`.

**Errors**

- `403 forbidden`, `404 not_found`, `404 evidence_expired`,
  `422 time_range_too_large`, `422 validation_failed`, `429 rate_limited`.
- A telemetry backend outage returns `503 dependency_unavailable` with a
  `Retry-After` header. Retained PostgreSQL metadata is not substituted for a
  failed log query.

---

### 10.9 Incidents

| Method | URL | Auth | Permissions | Request body | Success | Endpoint-specific errors |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/incidents` | Session | `incident:read` | — | `200` `Page<Incident>` | `403` |
| `POST` | `/incidents` | Session + CSRF | `incident:create` | `CreateIncidentRequest` | `201` `Incident` | `403`, `404`, `409`, `422`, `429` |
| `GET` | `/incidents/{incidentId}` | Session | `incident:read` | — | `200` `Incident` | `403`, `404` |
| `PATCH` | `/incidents/{incidentId}` | Session + CSRF | `incident:update` | `UpdateIncidentRequest` | `200` `Incident` | `403`, `404`, `409`, `422` |
| `PATCH` | `/incidents/{incidentId}/status` | Session + CSRF | `incident:status` | `UpdateIncidentStatusRequest` | `200` `Incident` | `403`, `404`, `409`, `422` |
| `POST` | `/incidents/{incidentId}/merge` | Session + CSRF | `incident:merge` | `MergeIncidentsRequest` | `200` `Incident` | `403`, `404`, `409`, `422` |
| `POST` | `/incidents/{incidentId}/split` | Session + CSRF | `incident:split` | `SplitIncidentRequest` | `201` `{incident, movedTimelineEventIds}` | `403`, `404`, `409`, `422` |
| `POST` | `/incidents/{incidentId}/resolve` | Session + CSRF | `incident:resolve` | `ResolveIncidentRequest` | `200` `Incident` | `403`, `404`, `409`, `422` |
| `POST` | `/incidents/{incidentId}/reopen` | Session + CSRF | `incident:reopen` | `ReopenIncidentRequest` | `200` `Incident` | `403`, `404`, `409`, `422` |

**Request schemas**

- `CreateIncidentRequest`:

  ```json
  {
    "title": "Payment authorization latency elevated",
    "summary": "p99 latency over SLO for 10 minutes",
    "severity": "sev2",
    "projectId": "prj_01JB3M8Q7Y4S2V6K9C1D5EFGHJ",
    "environmentId": "env_01JB3M8Q7Y4S2V6K9C1D5EFGHJ",
    "serviceIds": ["svc_01JB3M8Q7Y4S2V6K9C1D5EFGHJ"],
    "occurredAt": "2026-11-07T14:00:00.000Z"
  }
  ```

- `UpdateIncidentRequest`: `{ "title"?, "summary"?, "severity"?, "owningTeamId"?, "ownerMembershipId"?, "serviceIds"? }`.
- `UpdateIncidentStatusRequest`: `{ "status": "investigating", "reason": "optional" }`.
- `MergeIncidentsRequest`: `{ "sourceIncidentIds": ["inc_..."], "reason": "optional" }`.
- `SplitIncidentRequest`: `{ "timelineEventIds": ["tlv_..."], "title": "string", "severity": "sev2", "serviceIds": ["svc_..."], "reason": "optional" }`.
- `ResolveIncidentRequest`:

  ```json
  {
    "resolutionCategory": "code_change",
    "resolutionSummary": "Rolled back deployment 4821 and latency recovered.",
    "openApprovalsWaiverReason": null
  }
  ```

- `ReopenIncidentRequest`: `{ "reason": "string" }`.

**Validation rules**

- `GET /incidents`
  - Filters: `status`, `severity`, `projectId`, `environmentId`, `serviceId`,
    `owningTeamId`, `ownerMembershipId`, `isUnowned`, `search`,
    `openedAfter`, `openedBefore`, `limit`, `cursor`, `sort`
    (`openedAt`, `-openedAt`, `updatedAt`, `-updatedAt`, `severity`, `-severity`).
  - Team scope applies. Unowned incidents are visible to all organization
    members and include `isUnowned: true`.
- `POST /incidents`
  - `title` 1–200 characters; `summary` at most 1,000 characters.
  - `severity` is one of `sev1`–`sev4`.
  - `projectId` and `environmentId` must belong to the resolved tenant and the
    environment must belong to the project.
  - `serviceIds` must belong to the project; at most one service can be primary
    (the first is treated as primary when ownership is resolved).
  - `detectionSource` is server-set to `manual` for this endpoint.
  - `occurredAt`, when provided, must not be in the future and must be within the
    project retention window.
  - `Idempotency-Key` is required.
  - Creation opens the incident in `triage`, writes the `incident_created`
    timeline event, resolves ownership from the primary service when available,
    and emits notifications through the outbox.
- `GET /incidents/{incidentId}`
  - Team scope applies. Cross-tenant IDs return `404`.
- `PATCH /incidents/{incidentId}`
  - Requires `If-Match` matching the current `version`; mismatch returns
    `409 version_conflict`.
  - `title`, `summary`, and `severity` are mutable. `number`, `status`,
    `openedAt`, `resolvedAt`, metrics, and correlation fields are read-only.
  - `ownerMembershipId` must be an active member with access to the project;
    setting it clears `isUnowned`. Setting it to `null` marks the incident
    unowned.
  - `owningTeamId` must belong to the organization and the caller's team scope.
  - `serviceIds` replaces the incident's service associations. The first service
    is primary, and the operation preserves at most one primary service.
  - A resolved incident cannot be updated through this endpoint; reopen it first.
  - Increments `version` and writes an audit event.
- `PATCH /incidents/{incidentId}/status`
  - Requires `If-Match`. Only the transitions in section 10.9.1 are allowed.
  - A status of `resolved` is rejected here; use
    `POST /incidents/{incidentId}/resolve` so category and summary are captured.
  - `reason` is optional for non-terminal transitions and is written to the
    timeline.
  - Every transition writes a `status_changed` timeline event, an audit event,
    and increments `version`.
- `POST /incidents/{incidentId}/merge`
  - `sourceIncidentIds` length 1–20; each must be open, in the same organization,
    and not already merged.
  - The target incident is the survivor. Source timelines, notes, and evidence
    are preserved and marked as merged.
  - A source cannot be the target itself (`422`).
  - `reason` is optional and bounded to 1,000 characters.
  - Merge is rejected if any source is resolved (`409 conflict`).
- `POST /incidents/{incidentId}/split`
  - `timelineEventIds` length 1–100; each must belong to the source incident.
  - `title` and `severity` are required for the new incident.
  - `serviceIds` must belong to the same project.
  - Selected timeline rows are reparented to the new incident in one
    transaction. A timeline row cannot be split twice.
  - The new incident references the source through `splitFromIncidentId`.
- `POST /incidents/{incidentId}/resolve`
  - `resolutionCategory` is required and one of the documented values.
  - `resolutionSummary` 1–1,000 characters and required.
  - The incident must not already be resolved (`409 invalid_transition`).
  - Open critical approvals block resolution with `409 open_approvals` unless an
    owner/admin supplies `openApprovalsWaiverReason` of 1–500 characters, which is
    audited.
  - Sets `status: resolved`, `resolvedAt`, resolution fields, and `mttrSeconds`;
    writes a `resolution` timeline event and an audit event.
- `POST /incidents/{incidentId}/reopen`
  - Only a resolved incident can be reopened.
  - Reopening is allowed within seven days of `resolvedAt`. Later requests return
    `409 reopen_window_expired` and instruct the client to create a new incident.
  - `reason` 1–1,000 characters and required.
  - Sets `status: investigating`, preserves the prior resolution in history,
    increments `reopenCount`, and writes a `reopened` timeline event and audit
    event.

#### 10.9.1 Incident lifecycle transitions

| From | Allowed to |
| --- | --- |
| `triage` | `investigating`, `resolved` (false positive through the resolve endpoint) |
| `investigating` | `identified`, `monitoring`, `resolved` |
| `identified` | `investigating`, `monitoring`, `resolved` |
| `monitoring` | `investigating`, `resolved` |
| `resolved` | `investigating` through the reopen endpoint only |

**Errors**

- `403 forbidden`, `404 not_found`, `409 version_conflict`,
  `409 invalid_transition`, `409 conflict`, `409 open_approvals`,
  `409 reopen_window_expired`, `422 validation_failed`, `429 rate_limited`.

---

### 10.10 Investigations

An investigation is the read/write workspace over a single incident. The path
parameter `{investigationId}` is the incident ID (`inc_...`). Incident lifecycle
changes remain under `/incidents`; investigation endpoints cover context,
timeline, notes, AI recommendations, assistant messages, and live updates.

| Method | URL | Auth | Permissions | Request body | Success | Endpoint-specific errors |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/investigations` | Session | `incident:read` | — | `200` `Page<InvestigationSummary>` | `403` |
| `GET` | `/investigations/{investigationId}` | Session | `incident:read` | — | `200` `InvestigationContext` | `403`, `404` |
| `GET` | `/investigations/{investigationId}/timeline` | Session | `incident:read` | — | `200` `Page<TimelineEvent>` | `403`, `404`, `422` |
| `GET` | `/investigations/{investigationId}/timeline/{eventId}` | Session | `incident:read` | — | `200` `TimelineEvent` | `403`, `404` |
| `POST` | `/investigations/{investigationId}/notes` | Session + CSRF | `note:create` | `CreateNoteRequest` | `201` `Note` | `403`, `404`, `422`, `429` |
| `GET` | `/investigations/{investigationId}/notes` | Session | `note:read` | — | `200` `Page<Note>` | `403`, `404` |
| `PATCH` | `/investigations/{investigationId}/notes/{noteId}` | Session + CSRF | `note:update` | `UpdateNoteRequest` | `200` `Note` | `403`, `404`, `409`, `422` |
| `DELETE` | `/investigations/{investigationId}/notes/{noteId}` | Session + CSRF | `note:delete` | — | `204` | `403`, `404`, `409` |
| `POST` | `/investigations/{investigationId}/recommendations` | Session + CSRF | `recommendation:request` | `GenerateRecommendationRequest` | `202` `RecommendationGeneration` | `403`, `404`, `409`, `422`, `429` |
| `GET` | `/investigations/{investigationId}/recommendations` | Session | `recommendation:read` | — | `200` `RecommendationGeneration[]` | `403`, `404` |
| `POST` | `/investigations/{investigationId}/recommendations/{recommendationId}/feedback` | Session + CSRF | `recommendation:feedback` | `RecommendationFeedbackRequest` | `201` `RecommendationFeedback` | `403`, `404`, `409`, `422` |
| `POST` | `/investigations/{investigationId}/assistant/messages` | Session + CSRF | `assistant:use` | `CreateAssistantMessageRequest` | `202` `AssistantMessage` | `403`, `404`, `409`, `422`, `429` |
| `GET` | `/investigations/{investigationId}/assistant/messages` | Session | `assistant:read` | — | `200` `Page<AssistantMessage>` | `403`, `404` |
| `GET` | `/investigations/{investigationId}/stream` | Session | `incident:read` | — | `200` `text/event-stream` | `403`, `404` |

**Request schemas**

- `CreateNoteRequest`:

  ```json
  {
    "body": "Rollback 4821 correlates with the latency drop at 14:12.",
    "bodyFormat": "markdown",
    "mentionedMembershipIds": ["mem_01JB3M8Q7Y4S2V6K9C1D5EFGHJ"]
  }
  ```

- `UpdateNoteRequest`: `{ "body": "string" }`.
- `GenerateRecommendationRequest`: `{ "focus": "optional question", "forceRefresh": false, "clientRequestId": "optional" }`.
- `RecommendationFeedbackRequest`: `{ "decision": "accepted" | "rejected" | "corrected", "reason"?, "correctedSummary"?, "correctedRootCause"? }`.
- `RecommendationGeneration`: `{ generationId, status: "pending" | "complete" | "failed" | "insufficient_evidence", recommendations: Recommendation[], createdAt }`.
- `CreateAssistantMessageRequest`: `{ "content": "What changed in the last deployment?", "conversationId": "optional", "parentMessageId": "optional", "clientMessageId": "optional" }`.
- `InvestigationSummary`: `{ incidentId, number, title, severity, status, owner, owningTeam, openedAt, lastEventAt, recommendationSummary }`.
- `InvestigationContext`: `{ incident, services, ownership, dependencies, recentDeployments, activeRecommendations, approvals, retentionNotes }`.

**Validation rules**

- `GET /investigations`
  - Returns active investigations (incidents not `resolved`) visible to the
    caller. Supports the same filters as `GET /incidents` plus `since`.
  - `since` is an RFC 3339 timestamp; default is the last 24 hours and maximum is
    90 days.
- `GET /investigations/{investigationId}`
  - `investigationId` must be an incident visible to the caller. Cross-tenant IDs
    return `404`.
  - Returns ownership, affected services, upstream and downstream dependencies,
    runbook links, tier, recent deployments near the incident window, active
    recommendations, and open approvals.
  - Missing ownership is returned as `isUnowned: true` and is never hidden.
- `GET /investigations/{investigationId}/timeline`
  - Filters: `signalType`, `eventType`, `serviceId`, `environmentId`,
    `occurredAfter`, `occurredBefore`, `limit`, `cursor`, `sort`
    (`occurredAt`, `-occurredAt`).
  - Ordering is chronological by `occurredAt` with `id` as a stable tie-breaker.
    Page boundaries never duplicate or skip events.
  - The query range is at most 90 days or the incident lifetime.
- `GET /investigations/{investigationId}/timeline/{eventId}`
  - The event must belong to the investigation. Unknown or cross-tenant IDs
    return `404`.
  - Evidence references that have expired are returned with `available: false`
    and `unavailableReason` rather than being dropped.
- `POST /investigations/{investigationId}/notes`
  - `body` 1–10,000 characters. `bodyFormat` defaults to `markdown`.
  - `mentionedMembershipIds` are validated as active members of the same
    organization; invalid mentions return `422`.
  - The note and its `note_added` timeline event are written in one transaction.
  - Mentioned users are notified according to their preferences.
  - `Idempotency-Key` is recommended.
- `GET /investigations/{investigationId}/notes`
  - Excludes soft-deleted notes by default. Supports `limit`, `cursor`, and
    chronological sorting.
- `PATCH /investigations/{investigationId}/notes/{noteId}`
  - Only the author, an owner, or an admin can edit.
  - `body` 1–10,000 characters; `editedAt` is set by the server.
  - The original creation event remains in the timeline; an edit is recorded in
    audit.
- `DELETE /investigations/{investigationId}/notes/{noteId}`
  - Soft-deletes the note. Only the author, an owner, or an admin can delete.
  - The note is removed from default reads but retained for audit.
- `POST /investigations/{investigationId}/recommendations`
  - The incident must be open (`triage`, `investigating`, `identified`, or
    `monitoring`). Resolved incidents return `409 conflict`.
  - `focus` is at most 500 characters. `forceRefresh` supersedes the prior
    generation without deleting history.
  - `Idempotency-Key` is required. A replay returns the original generation.
  - The response is `202` with a `generationId` and `status: pending`; the AI
    service produces one to three ranked hypotheses asynchronously.
  - If evidence is insufficient, the completed generation reports
    `insufficient_evidence` rather than fabricating a hypothesis.
- `GET /investigations/{investigationId}/recommendations`
  - Returns generations newest first, including evidence per hypothesis.
  - Supports `includeSuperseded` (default `false`) and `limit`, `cursor`.
  - Each factual claim resolves to one or more evidence rows in the same
    organization.
- `POST /investigations/{investigationId}/recommendations/{recommendationId}/feedback`
  - `decision` is `accepted`, `rejected`, or `corrected`.
  - `corrected` requires `correctedSummary` of 1–500 characters.
  - `reason` is at most 1,000 characters.
  - The recommendation must belong to the investigation and be visible.
  - A new feedback row supersedes the actor's prior active feedback; history is
    preserved.
  - Feedback on a superseded or expired recommendation returns `409 conflict`.
- `POST /investigations/{investigationId}/assistant/messages`
  - `content` 1–8,000 characters.
  - `conversationId` and `parentMessageId` must belong to the investigation when
    present.
  - `clientMessageId`, when present, is unique per incident and used for
    idempotent retries.
  - `Idempotency-Key` is required.
  - The response is `202` with a pending assistant message. Completion arrives
    through the stream or by re-reading the transcript.
  - Assistant output MUST be grounded in the incident and cited. If evidence is
    insufficient, the message completes with `insufficient_evidence` and a
    suggestion of what to collect.
- `GET /investigations/{investigationId}/assistant/messages`
  - Filters: `conversationId`, `limit`, `cursor`, chronological order.
  - Returns redacted transcripts only.
- `GET /investigations/{investigationId}/stream`
  - Returns `text/event-stream`. Requires an active session; the browser
    reconnects with `Last-Event-ID`.
  - Event names: `incident.updated`, `timeline.appended`,
    `recommendation.updated`, `assistant.message.completed`, `approval.updated`,
    `heartbeat`.
  - Each event's `data` is a JSON object with the resource ID, type, and changed
    fields. It never contains secrets or unredacted telemetry.
  - The stream is authorized once at connect time and rechecked on each event. A
    revoked session closes the stream.

**Errors**

- `403 forbidden`, `404 not_found`, `404 evidence_expired`, `409 conflict`,
  `409 version_conflict`, `422 validation_failed`, `429 rate_limited`,
  `429 quota_exceeded`, `503 dependency_unavailable` for AI provider outages.

---

### 10.11 Knowledge

Knowledge documents are the retrieval corpus for RAG. Raw logs are never inserted
as knowledge. Documents are versioned; indexing is asynchronous.

| Method | URL | Auth | Permissions | Request body | Success | Endpoint-specific errors |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/knowledge/documents` | Session | `knowledge:read` | — | `200` `Page<KnowledgeDocument>` | `403` |
| `POST` | `/knowledge/documents` | Session + CSRF | `knowledge:create` | `CreateKnowledgeDocumentRequest` | `202` `KnowledgeDocument` | `403`, `404`, `409`, `413`, `422` |
| `GET` | `/knowledge/documents/{documentId}` | Session | `knowledge:read` | — | `200` `KnowledgeDocument` | `403`, `404` |
| `PATCH` | `/knowledge/documents/{documentId}` | Session + CSRF | `knowledge:update` | `UpdateKnowledgeDocumentRequest` | `202` `KnowledgeDocument` | `403`, `404`, `409`, `413`, `422` |
| `DELETE` | `/knowledge/documents/{documentId}` | Session + CSRF | `knowledge:delete` | — | `204` | `403`, `404`, `409` |
| `POST` | `/knowledge/documents/{documentId}/reindex` | Session + CSRF | `knowledge:reindex` | `ReindexRequest` | `202` `OperationAccepted` | `403`, `404`, `409`, `422` |
| `GET` | `/knowledge/search` | Session | `knowledge:read` | — | `200` `{results, pagination}` | `403`, `404`, `422`, `429` |

**Request schemas**

- `CreateKnowledgeDocumentRequest`:

  ```json
  {
    "title": "Payments rollback runbook",
    "documentType": "runbook",
    "sourceType": "manual",
    "projectId": "prj_01JB3M8Q7Y4S2V6K9C1D5EFGHJ",
    "serviceId": "svc_01JB3M8Q7Y4S2V6K9C1D5EFGHJ",
    "content": "1. Check deployment history...",
    "sensitivity": "internal",
    "visibility": "project",
    "allowedTeamIds": []
  }
  ```

- `UpdateKnowledgeDocumentRequest`: `{ "title"?, "content"?, "sourceUrl"?, "sensitivity"?, "visibility"?, "allowedTeamIds"?, "allowedMembershipIds"?, "projectId"?, "serviceId"? }`.
- `ReindexRequest`: `{ "embeddingModelVersion": "optional" }`.

**Validation rules**

- `GET /knowledge/documents`
  - Filters: `documentType`, `status`, `projectId`, `serviceId`, `visibility`,
    `sensitivity`, `search`, `includeDeleted` (owner/admin only), `limit`,
    `cursor`, `sort` (`title`, `-title`, `createdAt`, `-createdAt`,
    `updatedAt`, `-updatedAt`).
  - Results are filtered by organization and document ACL. A document with
    `team` or `restricted` visibility is visible only to allowed teams or
    memberships.
- `POST /knowledge/documents`
  - `title` 1–200 characters.
  - `documentType` and `sourceType` are from the documented enums.
  - Exactly one of `content` or `sourceUrl` is required. Both may be provided
    only when `sourceUrl` points to the canonical source and `content` is the
    extracted text.
  - `projectId` and `serviceId`, when present, must belong to the organization
    and be visible to the caller. `serviceId` requires `projectId`.
  - `sensitivity` defaults to `internal`; `visibility` defaults to `org`.
  - `visibility: restricted` requires a non-empty `allowedMembershipIds`.
  - `visibility: team` requires a non-empty `allowedTeamIds`.
  - `content` is redacted for configured secrets before storage and indexing.
  - The response is `202` with `status: processing`; indexing runs
    asynchronously through the `rag.index` queue.
  - `Idempotency-Key` is required. Replaying with the same body returns the same
    document; a different body with the same key returns
    `409 idempotency_conflict`.
- `GET /knowledge/documents/{documentId}`
  - ACL and tenant checks apply. Cross-tenant IDs return `404`.
  - Large `content` may be returned as a pre-signed `contentRef` reference rather
    than inline.
- `PATCH /knowledge/documents/{documentId}`
  - A document version is immutable once `indexed`. A change creates a new
    version, increments `version`, resets `indexVersion`, and sets `status` to
    `processing` in one transaction.
  - The prior version is marked `superseded` only after the new chunks are
    active.
  - `content` or `sourceUrl` must remain present after the change.
  - ACL changes apply to future retrieval and trigger a reindex when visibility
    or allowed IDs change.
  - The response is `202` with the new version in `processing`.
- `DELETE /knowledge/documents/{documentId}`
  - Soft-deletes the document and marks chunks deleted. Retrieval excludes it
    immediately.
  - Already deleted returns `409 conflict`.
- `POST /knowledge/documents/{documentId}/reindex`
  - Rebuilds chunks and embeddings for the current version. The document must not
    be deleted.
  - `embeddingModelVersion`, when present, must be an approved model version.
  - The response is `202`. Repeated reindex requests while one is running return
    `409 conflict` or are coalesced by the queue with the same operation ID.
- `GET /knowledge/search`
  - Query: `q` required, 1–500 characters; `projectId?`, `serviceId?`,
    `documentType?`, `limit` (1–50, default 20), `cursor`.
  - Hybrid retrieval combines full-text and vector ranking with reciprocal rank
    fusion after tenant and ACL filters.
  - Results include the chunk text, document metadata, retrieval score, and a
    stable citation reference.
  - A query that matches nothing returns `200` with an empty array.
  - Search never returns chunks from another organization or from a document the
    caller cannot access.

**Response schema**

- `KnowledgeSearchResult`: `{ chunkId, documentId, documentTitle, heading, excerpt, score, citationRef }`.

**Errors**

- `403 forbidden`, `404 not_found`, `409 conflict`, `413 payload_too_large`,
  `422 validation_failed`, `429 rate_limited`, `503 dependency_unavailable` when
  the embedding provider or vector index is unavailable.

---

### 10.12 Approvals

Approvals gate sensitive, non-destructive actions. In v1 the supported actions
are `ticket.create`, `incident.publish_update`, and `postmortem.publish`.
Production remediation actions (rollback, scaling, code change, or infrastructure
mutation) are not supported and are rejected before an approval row is created.

| Method | URL | Auth | Permissions | Request body | Success | Endpoint-specific errors |
| --- | --- | --- | --- | --- | --- | --- |
| `GET` | `/approvals` | Session | `approval:read` | — | `200` `Page<ApprovalRequest>` | `403` |
| `POST` | `/approvals` | Session + CSRF | `approval:request` | `CreateApprovalRequest` | `201` `ApprovalRequest` | `403`, `404`, `409`, `422`, `429` |
| `GET` | `/approvals/{approvalId}` | Session | `approval:read` | — | `200` `ApprovalRequest` | `403`, `404` |
| `POST` | `/approvals/{approvalId}/decision` | Session + CSRF | `approval:decide` | `ApprovalDecisionRequest` | `200` `ApprovalRequest` | `403`, `404`, `409`, `422` |
| `POST` | `/approvals/{approvalId}/cancel` | Session + CSRF | `approval:request` | `CancelApprovalRequest` | `200` `ApprovalRequest` | `403`, `404`, `409`, `422` |
| `GET` | `/approvals/{approvalId}/decisions` | Session | `approval:read` | — | `200` `ApprovalDecision[]` | `403`, `404` |

**Request schemas**

- `CreateApprovalRequest`:

  ```json
  {
    "incidentId": "inc_01JB3M9A2B4C6D8E0F2G4H6JKM",
    "actionType": "incident.publish_update",
    "targetType": "incident",
    "targetId": "inc_01JB3M9A2B4C6D8E0F2G4H6JKM",
    "actionPayload": {
      "channel": "status-page",
      "message": "Investigating elevated latency."
    },
    "riskLevel": "medium",
    "reason": "Customer-facing update",
    "approverMembershipId": "mem_01JB3M8Q7Y4S2V6K9C1D5EFGHJ",
    "assignedTeamId": "team_01JB3M8Q7Y4S2V6K9C1D5EFGHJ"
  }
  ```

- `ApprovalDecisionRequest`: `{ "decision": "approved", "reason": "optional" }`.
- `CancelApprovalRequest`: `{ "reason": "string" }`.

**Validation rules**

- `GET /approvals`
  - Filters: `status`, `riskLevel`, `incidentId`, `assignedTeamId`,
    `approverMembershipId`, `requesterMembershipId`, `actionType`,
    `expiresBefore`, `limit`, `cursor`, `sort` (`createdAt`, `-createdAt`,
    `expiresAt`, `-expiresAt`).
  - Responders and viewers see only approvals for incidents in their team scope.
  - Expired approvals are returned with `status: expired`; they are never
    silently deleted.
- `POST /approvals`
  - `incidentId` must be visible and open.
  - `actionType` is one of `ticket.create`, `incident.publish_update`, or
    `postmortem.publish`. Any production remediation action returns `422`.
  - `targetType` is `incident`, `external_ticket`, or `postmortem` and must be
    consistent with `actionType`.
  - `targetId`, when present, must reference a resource in the same organization.
  - `actionPayload` is a bounded JSON object of non-secret arguments validated
    per action type. It never contains credentials, tokens, raw telemetry, or
    secrets.
  - `riskLevel` is required. `critical` requires an owner or admin approver.
  - `approverMembershipId`, when present, must be an active member with the
    required role, team scope, approver capability, and must not be the requester.
  - If no approver is supplied, the server assigns one from the incident's
    owning team or the approver pool. A request can remain unassigned in
    `pending`, but it cannot be approved by the requester.
  - `requiredApprovals` defaults to `1` and must be at least `1`. It cannot
    exceed the number of eligible approvers.
  - `expiresAt` defaults to 24 hours after creation and cannot exceed 72 hours.
  - `reason` is at most 1,000 characters.
  - `Idempotency-Key` is required. The key is stored with the request and reused
    by the execution path.
  - Creation writes an `approval_requested` timeline event and an audit event.
- `GET /approvals/{approvalId}`
  - Returns the request, decisions, execution state, and redacted result.
  - Cross-tenant IDs return `404`.
- `POST /approvals/{approvalId}/decision`
  - Requires `If-Match` matching the request `version`; mismatch returns
    `409 version_conflict`.
  - `decision` is `approved` or `rejected`.
  - The actor must have `approval:decide`, satisfy the action's team scope, and
    not be the requester. Self-approval returns `403 four_eyes_violation`.
  - The request must be `pending` and not expired. Expired requests return
    `409 expired`; non-pending requests return `409 conflict`.
  - `reason` is optional and at most 1,000 characters. It is required when
    rejecting a `critical` request.
  - Every decision is an immutable `ApprovalDecision` row and an audit event.
  - When the number of distinct `approved` decisions reaches
    `requiredApprovals`, the request becomes `approved` and execution is queued
    once under the approval idempotency key.
  - A single `rejected` decision moves the request to `rejected`.
  - Execution failure is recorded as `execution_failed` with a redacted result;
    a retry does not require a new approval.
- `POST /approvals/{approvalId}/cancel`
  - Only the requester, an owner, or an admin can cancel.
  - Only a `pending` request can be cancelled. Other states return `409 conflict`.
  - `reason` 1–1,000 characters and required.
  - Cancellation is audited and writes an `approval_decided` timeline event.
- `GET /approvals/{approvalId}/decisions`
  - Returns decisions oldest first.
  - Decisions are append-only and cannot be edited or deleted.

**Errors**

- `403 forbidden`, `403 four_eyes_violation`, `404 not_found`,
  `409 version_conflict`, `409 expired`, `409 conflict`,
  `422 validation_failed`, `429 rate_limited`.
- `502`, `503`, or `504` when the execution adapter is unavailable after
  approval; the approval remains recorded and retryable.

---

## 11. Traceability and open questions

### 11.1 Traceability

| API area | Primary acceptance criteria |
| --- | --- |
| Auth | AC-REG-01 to AC-REG-09, AC-AUTH-01 to AC-AUTH-08, AC-PWD-01 to AC-PWD-09 |
| Organizations and members | AC-ORG-01 to AC-ORG-08, AC-INVITE-01 to AC-INVITE-10, AC-X-01, AC-X-03 |
| Projects and environments | AC-PROJ-01 to AC-PROJ-08, AC-ENV-01 to AC-ENV-08 |
| API keys | AC-KEY-01 to AC-KEY-09, AC-INGEST-01 to AC-INGEST-04 |
| Logs | AC-INGEST-02, AC-INGEST-09, AC-INC-INVEST-01 to AC-INC-INVEST-05 |
| Incidents | AC-INC-CREATE-01 to AC-INC-CREATE-10, AC-INC-INVEST-02, AC-INC-INVEST-10, AC-RESOLVE-01 to AC-RESOLVE-11 |
| Investigations | AC-INC-INVEST-01 to AC-INC-INVEST-11, AC-AI-01 to AC-AI-11 |
| Knowledge | AC-AI-03, AC-AI-10, AC-X-08 |
| Approvals | AC-APPROVE-01 to AC-APPROVE-10, AC-X-01, AC-X-02 |
| Health | Operational readiness and deployment criteria |

### 11.2 Open questions

1. **Approver assignment defaults.** The exact pool and round-robin rules for
   automatically assigning an approver are a policy decision. The API contract
   supports an explicit `approverMembershipId`, an `assignedTeamId`, or
   server-side assignment.
2. **Investigation aliases.** This specification uses `/investigations/{id}` as
   the canonical investigation workspace. If the frontend standardizes on
   incident-scoped routes, equivalent aliases under `/incidents/{id}` can be
   added additively in v1.
3. **Log query language.** The documented `query` subset must be finalized with
   the search implementation. Unsupported syntax is rejected rather than
   silently ignored.
4. **Audit API.** Audit events are written but not yet exposed by a resource in
   this specification. The architecture reserves `GET /v1/audit-events`; it can
   be added additively as `GET /api/v1/audit-events` when the UI is ready.
5. **Knowledge limits.** The 5 MiB inline limit may be lowered or replaced by a
   pre-signed upload flow once object storage ingestion is finalized.
6. **Embedding model pinning.** The embedding model and dimension must be pinned
   before the knowledge API is implemented. A dimension change requires a new
   index and is a breaking operational change, not a breaking API change.
7. **Rate-limit quotas.** Per-plan rate limits and AI quotas must be finalized in
   the pricing and platform configuration. The API uses `429` and `Retry-After`
   regardless of the configured values.

