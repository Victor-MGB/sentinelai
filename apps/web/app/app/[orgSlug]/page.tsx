import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CircleCheck,
  Clock,
  FolderKanban,
  Gauge,
  Plus,
  Siren,
  Sparkles,
  Users,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { WorkspacePageSkeleton } from '@/components/layout/workspace-page-skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { severityVariant, statusLabel, statusVariant } from '@/lib/incident-ui';
import { formatOrgName } from '@/lib/navigation';
import { incidents, projects } from '@/lib/sample-data';

export const metadata: Metadata = {
  title: 'Overview',
};

type OverviewPageProps = {
  params: Promise<{ orgSlug: string }>;
};

const metrics = [
  {
    title: 'Active incidents',
    value: '3',
    detail: '1 SEV-1 · 2 SEV-2',
    icon: Siren,
    tone: 'text-red-600 dark:text-red-400',
    background: 'bg-red-500/10',
  },
  {
    title: 'Mean time to resolve',
    value: '24m',
    detail: '12% faster than last week',
    icon: Clock,
    tone: 'text-emerald-600 dark:text-emerald-400',
    background: 'bg-emerald-500/10',
  },
  {
    title: 'Error budget remaining',
    value: '87%',
    detail: 'checkout-api · 30 day window',
    icon: Gauge,
    tone: 'text-sky-600 dark:text-sky-400',
    background: 'bg-sky-500/10',
  },
  {
    title: 'Services reporting',
    value: '53 / 53',
    detail: 'All collectors healthy',
    icon: BarChart3,
    tone: 'text-teal-600 dark:text-teal-400',
    background: 'bg-teal-500/10',
  },
];

export default function OverviewPage({ params }: OverviewPageProps) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <OverviewContent params={params} />
    </Suspense>
  );
}

async function OverviewContent({ params }: OverviewPageProps) {
  const { orgSlug } = await params;
  const orgName = formatOrgName(orgSlug);
  const openIncidents = incidents.filter((incident) => incident.status !== 'resolved');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={orgName}
        title="Reliability overview"
        description="Live incident posture, SLO health, and the next actions that need a responder."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/app/${orgSlug}/incidents`}>
                <Siren className="size-4" aria-hidden="true" />
                View incidents
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/app/${orgSlug}/incidents`}>
                <Plus className="size-4" aria-hidden="true" />
                New incident
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <Card key={metric.title}>
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs font-medium">{metric.title}</p>
                  <p className="text-2xl font-semibold tracking-tight">{metric.value}</p>
                  <p className="text-muted-foreground text-xs">{metric.detail}</p>
                </div>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${metric.background} ${metric.tone}`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active incidents</CardTitle>
            <CardDescription>Correlated incidents ordered by severity and recency.</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/app/${orgSlug}/incidents`}>
                  View all
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-1 px-3">
            {openIncidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/app/${orgSlug}/incidents/${incident.id}`}
                className="hover:bg-muted/60 focus-visible:ring-ring flex flex-col gap-2 rounded-lg px-3 py-3 transition-colors outline-none focus-visible:ring-2 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={severityVariant(incident.severity)} className="text-[0.65rem]">
                      {incident.severity}
                    </Badge>
                    <Badge variant={statusVariant(incident.status)} className="text-[0.65rem]">
                      {statusLabel(incident.status)}
                    </Badge>
                    <span className="truncate text-sm font-medium">{incident.title}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {incident.service} · started {incident.startedAt} · owned by {incident.owner}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-muted-foreground font-mono text-xs">
                    {incident.duration}
                  </span>
                  <ArrowRight className="text-muted-foreground size-4" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400" />
                Setup checklist
              </CardTitle>
              <CardDescription>Finish onboarding to unlock full correlation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Create a project', done: true },
                { label: 'Send first OpenTelemetry trace', done: true },
                { label: 'Connect Slack notifications', done: false },
                { label: 'Invite an on-call teammate', done: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <span
                    className={
                      item.done
                        ? 'flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'border-muted-foreground/30 flex size-5 items-center justify-center rounded-full border'
                    }
                  >
                    {item.done ? <CircleCheck className="size-3.5" aria-hidden="true" /> : null}
                  </span>
                  <span
                    className={item.done ? 'text-muted-foreground text-sm line-through' : 'text-sm'}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">2 of 4 complete</span>
                <Badge variant="secondary">50%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-4" aria-hidden="true" />
                On call now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    GH
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Grace Hopper</p>
                  <p className="text-muted-foreground text-xs">Primary · Payments</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-sky-500/10 text-sky-700 dark:text-sky-300">
                    AT
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Alan Turing</p>
                  <p className="text-muted-foreground text-xs">Secondary · Platform</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={`/app/${orgSlug}/settings`}>Manage rotation</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project health</CardTitle>
          <CardDescription>Environments with the most recent telemetry activity.</CardDescription>
          <CardAction>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/app/${orgSlug}/projects`}>
                <FolderKanban className="size-3.5" aria-hidden="true" />
                Projects
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-3 px-4 md:grid-cols-3">
          {projects.map((project) => (
            <div key={project.slug} className="bg-muted/40 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{project.name}</p>
                <Badge
                  variant={
                    project.health === 'healthy'
                      ? 'success'
                      : project.health === 'degraded'
                        ? 'warning'
                        : 'destructive'
                  }
                  className="text-[0.65rem] capitalize"
                >
                  {project.health}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                {project.description}
              </p>
              <p className="text-muted-foreground mt-3 text-xs">
                {project.services} services · {project.environments.length} environments
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
