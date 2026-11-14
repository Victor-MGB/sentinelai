export type IncidentStatus = 'investigating' | 'monitoring' | 'resolved';
export type IncidentSeverity = 'SEV-1' | 'SEV-2' | 'SEV-3';

export type Incident = {
  id: string;
  title: string;
  service: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  startedAt: string;
  duration: string;
  owner: string;
  summary: string;
};

export const incidents: Incident[] = [
  {
    id: 'inc-1042',
    title: 'Checkout latency above SLO',
    service: 'checkout-api',
    severity: 'SEV-1',
    status: 'investigating',
    startedAt: '18 minutes ago',
    duration: '18m',
    owner: 'Ada Lovelace',
    summary:
      'p99 latency shifted from 240ms to 1.8s after the 14:02 deploy. Error rate remains within budget, but the checkout SLO is burning 9x faster than normal.',
  },
  {
    id: 'inc-1041',
    title: 'Elevated 5xx on payments webhook',
    service: 'payments-worker',
    severity: 'SEV-2',
    status: 'monitoring',
    startedAt: '1 hour ago',
    duration: '1h 12m',
    owner: 'Grace Hopper',
    summary:
      'Webhook retries are draining after the upstream provider recovered. No new failures in the last 12 minutes; monitoring the retry queue depth.',
  },
  {
    id: 'inc-1040',
    title: 'Search index freshness lag',
    service: 'search-indexer',
    severity: 'SEV-3',
    status: 'resolved',
    startedAt: 'Yesterday',
    duration: '43m',
    owner: 'Alan Turing',
    summary:
      'A Kafka consumer rebalance delayed indexing by 43 minutes. Offsets caught up and a guardrail alert was added for consumer lag.',
  },
  {
    id: 'inc-1039',
    title: 'API gateway TLS handshake spikes',
    service: 'edge-gateway',
    severity: 'SEV-2',
    status: 'resolved',
    startedAt: '2 days ago',
    duration: '27m',
    owner: 'Katherine Johnson',
    summary:
      'A stale certificate bundle on two edge nodes caused handshake retries. Rolling replacement restored normal TLS success rates.',
  },
];

export type Project = {
  name: string;
  slug: string;
  description: string;
  environments: string[];
  services: number;
  lastEvent: string;
  health: 'healthy' | 'degraded' | 'critical';
};

export const projects: Project[] = [
  {
    name: 'Storefront',
    slug: 'storefront',
    description: 'Customer-facing catalog, checkout, and order management.',
    environments: ['Production', 'Staging', 'Preview'],
    services: 18,
    lastEvent: '2 minutes ago',
    health: 'degraded',
  },
  {
    name: 'Payments',
    slug: 'payments',
    description: 'Payment orchestration, ledger, and provider webhooks.',
    environments: ['Production', 'Staging'],
    services: 11,
    lastEvent: '1 hour ago',
    health: 'healthy',
  },
  {
    name: 'Platform',
    slug: 'platform',
    description: 'Shared edge, identity, and internal developer platform.',
    environments: ['Production', 'Staging', 'Development'],
    services: 24,
    lastEvent: 'Yesterday',
    health: 'healthy',
  },
];

export type Member = {
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Responder' | 'Viewer';
  team: string;
  status: 'Active' | 'Invited';
};

export const members: Member[] = [
  {
    name: 'Ada Lovelace',
    email: 'ada@sentinelai.dev',
    role: 'Owner',
    team: 'Reliability',
    status: 'Active',
  },
  {
    name: 'Grace Hopper',
    email: 'grace@sentinelai.dev',
    role: 'Admin',
    team: 'Payments',
    status: 'Active',
  },
  {
    name: 'Alan Turing',
    email: 'alan@sentinelai.dev',
    role: 'Responder',
    team: 'Platform',
    status: 'Active',
  },
  {
    name: 'Katherine Johnson',
    email: 'katherine@sentinelai.dev',
    role: 'Viewer',
    team: 'Leadership',
    status: 'Invited',
  },
];

export type AuditEvent = {
  action: string;
  actor: string;
  target: string;
  time: string;
};

export const auditEvents: AuditEvent[] = [
  {
    action: 'incident.resolved',
    actor: 'Grace Hopper',
    target: 'inc-1040',
    time: 'Yesterday at 16:42',
  },
  {
    action: 'api_key.created',
    actor: 'Ada Lovelace',
    target: 'storefront/production',
    time: 'Yesterday at 11:08',
  },
  {
    action: 'member.role_changed',
    actor: 'Ada Lovelace',
    target: 'alan@sentinelai.dev',
    time: '2 days ago',
  },
  {
    action: 'retention.updated',
    actor: 'Ada Lovelace',
    target: 'Organization settings',
    time: '3 days ago',
  },
];
