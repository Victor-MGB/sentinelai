import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FolderKanban, KeyRound, Plus, Server, Settings2 } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { WorkspacePageSkeleton } from '@/components/layout/workspace-page-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { projects } from '@/lib/sample-data';

export const metadata: Metadata = {
  title: 'Projects',
};

type ProjectsPageProps = {
  params: Promise<{ orgSlug: string }>;
};

const healthVariant = {
  healthy: 'success',
  degraded: 'warning',
  critical: 'destructive',
} as const;

export default function ProjectsPage({ params }: ProjectsPageProps) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <ProjectsContent params={params} />
    </Suspense>
  );
}

async function ProjectsContent({ params }: ProjectsPageProps) {
  const { orgSlug } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Service catalog"
        title="Projects"
        description="Group services, environments, and ingestion keys by product area."
        actions={
          <Button>
            <Plus className="size-4" aria-hidden="true" />
            New project
          </Button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.slug} className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FolderKanban className="size-4" aria-hidden="true" />
              </div>
              <CardTitle className="flex items-center gap-2">
                {project.name}
                <Badge variant={healthVariant[project.health]} className="capitalize">
                  {project.health}
                </Badge>
              </CardTitle>
              <CardDescription>{project.description}</CardDescription>
              <CardAction>
                <Button variant="ghost" size="icon" aria-label={`Settings for ${project.name}`}>
                  <Settings2 className="size-4" aria-hidden="true" />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {project.environments.map((environment) => (
                  <Badge key={environment} variant="outline" className="font-normal">
                    {environment}
                  </Badge>
                ))}
              </div>
              <div className="text-muted-foreground grid grid-cols-2 gap-3 text-xs">
                <div className="bg-muted/40 rounded-md border p-2.5">
                  <Server className="mb-1 size-3.5" aria-hidden="true" />
                  <p className="text-foreground text-sm font-medium">{project.services}</p>
                  <p>services</p>
                </div>
                <div className="bg-muted/40 rounded-md border p-2.5">
                  <KeyRound className="mb-1 size-3.5" aria-hidden="true" />
                  <p className="text-foreground text-sm font-medium">
                    {project.environments.length}
                  </p>
                  <p>ingestion keys</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-muted-foreground text-xs">Last event {project.lastEvent}</p>
              <Button asChild variant="ghost" size="sm" className="ml-auto">
                <Link href={`/app/${orgSlug}/projects/${project.slug}`}>
                  Open
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
