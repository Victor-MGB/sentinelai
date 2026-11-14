import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ExternalLink,
  KeyRound,
  Radio,
  Server,
  ShieldCheck,
  Webhook,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { projects } from '@/lib/sample-data';

type ProjectPageProps = {
  params: Promise<{ orgSlug: string; projectId: string }>;
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { projectId } = await params;
  const project = projects.find((item) => item.slug === projectId);

  return {
    title: project?.name ?? 'Project',
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <Suspense fallback={<ProjectDetailFallback />}>
      <ProjectDetail params={params} />
    </Suspense>
  );
}

async function ProjectDetail({ params }: ProjectPageProps) {
  const { orgSlug, projectId } = await params;
  const project = projects.find((item) => item.slug === projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href={`/app/${orgSlug}/projects`}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to projects
        </Link>
      </Button>

      <PageHeader
        eyebrow="Project overview"
        title={project.name}
        description={project.description}
        actions={
          <>
            <Button variant="outline">
              <KeyRound className="size-4" aria-hidden="true" />
              Manage keys
            </Button>
            <Button>
              <Radio className="size-4" aria-hidden="true" />
              Send test event
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={
            project.health === 'healthy'
              ? 'success'
              : project.health === 'degraded'
                ? 'warning'
                : 'destructive'
          }
          className="capitalize"
        >
          {project.health}
        </Badge>
        {project.environments.map((environment) => (
          <Badge key={environment} variant="outline" className="font-normal">
            {environment}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Services', value: String(project.services), icon: Server },
          { label: 'Environments', value: String(project.environments.length), icon: Webhook },
          { label: 'Ingestion keys', value: String(project.environments.length), icon: KeyRound },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-5">
                <span className="bg-muted flex size-9 items-center justify-center rounded-lg">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-muted-foreground text-xs">{stat.label}</p>
                  <p className="text-xl font-semibold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Environments</CardTitle>
            <CardDescription>
              Each environment has its own scoped ingestion key and retention policy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.environments.map((environment, index) => (
              <div
                key={environment}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
              >
                <span className="bg-emerald-500/10 flex size-8 shrink-0 items-center justify-center rounded-md text-emerald-600 dark:text-emerald-400">
                  <Server className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{environment}</p>
                  <p className="text-muted-foreground font-mono text-xs">
                    otel.{project.slug}.{environment.toLowerCase()}.sentinelai.dev
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={index === 0 ? 'success' : 'secondary'}>
                    {index === 0 ? 'Receiving' : 'Idle'}
                  </Badge>
                  <Button variant="ghost" size="icon" aria-label={`Open ${environment} settings`}>
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                Ingestion health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ['OpenTelemetry traces', 'Healthy'],
                ['Log pipeline', 'Healthy'],
                ['Alert webhooks', project.health === 'healthy' ? 'Healthy' : 'Delayed'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">{label}</span>
                  <Badge variant={value === 'Healthy' ? 'success' : 'warning'}>{value}</Badge>
                </div>
              ))}
              <Separator className="my-1" />
              <p className="text-muted-foreground text-xs">Last event {project.lastEvent}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick start</CardTitle>
              <CardDescription>Send a first span in under a minute.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <pre className="bg-muted overflow-x-auto rounded-md border p-3 text-[0.65rem] leading-5">
                <code>{`OTEL_EXPORTER_OTLP_ENDPOINT=\nhttps://otel.${project.slug}.sentinelai.dev\nOTEL_SERVICE_NAME=${project.slug}-api`}</code>
              </pre>
              <Button variant="outline" size="sm" className="w-full">
                Copy environment variables
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProjectDetailFallback() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading project">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 lg:col-span-2" />
        <div className="space-y-6">
          <Skeleton className="h-44" />
          <Skeleton className="h-56" />
        </div>
      </div>
    </div>
  );
}
