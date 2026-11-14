import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  CircleCheck,
  Clock,
  GitBranch,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { severityVariant, statusLabel, statusVariant } from '@/lib/incident-ui';
import { incidents } from '@/lib/sample-data';

type IncidentPageProps = {
  params: Promise<{ orgSlug: string; incidentId: string }>;
};

export async function generateMetadata({ params }: IncidentPageProps): Promise<Metadata> {
  const { incidentId } = await params;
  const incident = incidents.find((item) => item.id === incidentId);

  return {
    title: incident?.title ?? 'Incident',
  };
}

const timeline = [
  {
    time: '14:02',
    title: 'Deploy completed',
    description: 'checkout-api v2.41.0 promoted to production by GitHub Actions.',
    tone: 'bg-sky-500',
  },
  {
    time: '14:05',
    title: 'Latency alert fired',
    description: 'p99 latency crossed the 1s warning threshold for 5 consecutive minutes.',
    tone: 'bg-amber-500',
  },
  {
    time: '14:07',
    title: 'Alerts correlated',
    description: '38 related alerts were merged into this incident by the correlation engine.',
    tone: 'bg-emerald-500',
  },
  {
    time: '14:09',
    title: 'Hypothesis generated',
    description: 'Connection pool exhaustion after deploy is the top-ranked explanation.',
    tone: 'bg-violet-500',
  },
];

const signals = [
  { label: 'deploy:v2.41.0', detail: 'Production release 14:02' },
  { label: 'db.pool.wait', detail: 'p95 up 6.4× after release' },
  { label: 'trace:checkout.submit', detail: 'Span latency concentrated at DB call' },
];

export default function IncidentPage({ params }: IncidentPageProps) {
  return (
    <Suspense fallback={<IncidentDetailFallback />}>
      <IncidentDetail params={params} />
    </Suspense>
  );
}

async function IncidentDetail({ params }: IncidentPageProps) {
  const { orgSlug, incidentId } = await params;
  const incident = incidents.find((item) => item.id === incidentId);

  if (!incident) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href={`/app/${orgSlug}/incidents`}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to incidents
        </Link>
      </Button>

      <PageHeader
        eyebrow={`${incident.id} · ${incident.service}`}
        title={incident.title}
        description={incident.summary}
        actions={
          <>
            <Button variant="outline">
              <MessageSquare className="size-4" aria-hidden="true" />
              Add update
            </Button>
            <Button>
              <CircleCheck className="size-4" aria-hidden="true" />
              Resolve incident
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={severityVariant(incident.severity)}>{incident.severity}</Badge>
        <Badge variant={statusVariant(incident.status)}>{statusLabel(incident.status)}</Badge>
        <span className="text-muted-foreground text-xs">
          Started {incident.startedAt} · {incident.duration} elapsed
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
                AI root-cause hypothesis
              </CardTitle>
              <CardDescription>
                Ranked explanation with linked evidence. Requires human approval before action.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Bot aria-hidden="true" />
                <AlertTitle>Connection pool exhaustion after deploy v2.41.0</AlertTitle>
                <AlertDescription>
                  The latency shift begins within 90 seconds of the production rollout. Database
                  pool wait time increased 6.4× while application CPU remained flat, which points to
                  a configuration or connection-leak regression rather than load.
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">87% confidence</Badge>
                <Badge variant="outline">3 evidence links</Badge>
                <Badge variant="outline">No writes proposed</Badge>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium">Linked evidence</p>
                {signals.map((signal) => (
                  <div
                    key={signal.label}
                    className="bg-muted/40 flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                  >
                    <code className="truncate font-mono text-xs">{signal.label}</code>
                    <span className="text-muted-foreground shrink-0 text-xs">{signal.detail}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Approve investigation
                </Button>
                <Button size="sm" variant="outline">
                  Dismiss hypothesis
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-4" aria-hidden="true" />
                Incident timeline
              </CardTitle>
              <CardDescription>Signals, changes, and responder actions in order.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-5 border-l pl-5">
                {timeline.map((event) => (
                  <li key={event.time} className="relative">
                    <span
                      className={`absolute -left-[1.6rem] top-1 size-2 rounded-full ring-4 ring-background ${event.tone}`}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{event.time}</span>
                      <p className="text-sm font-medium">{event.title}</p>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-5">
                      {event.description}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Responders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    {incident.owner
                      .split(' ')
                      .map((part) => part.charAt(0))
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{incident.owner}</p>
                  <p className="text-muted-foreground text-xs">Incident commander</p>
                </div>
              </div>
              <Separator />
              <Button variant="outline" size="sm" className="w-full">
                <Users className="size-4" aria-hidden="true" />
                Add responder
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="size-4" aria-hidden="true" />
                Related changes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted/40 rounded-md border p-3">
                <p className="text-sm font-medium">v2.41.0 production deploy</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  checkout-api · 14:02 · GitHub Actions
                </p>
              </div>
              <div className="bg-muted/40 rounded-md border p-3">
                <p className="text-sm font-medium">Pool max size 20 → 10</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  checkout-api config · 13:48 · Ada Lovelace
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function IncidentDetailFallback() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading incident">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-9 w-full max-w-xl" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-80" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-44" />
          <Skeleton className="h-56" />
        </div>
      </div>
    </div>
  );
}
