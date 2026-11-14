import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, Plus, Sparkles } from 'lucide-react';

import { IncidentsView } from '@/features/incidents/incidents-view';
import { PageHeader } from '@/components/layout/page-header';
import { WorkspacePageSkeleton } from '@/components/layout/workspace-page-skeleton';
import { Button } from '@/components/ui/button';
import { incidents } from '@/lib/sample-data';

export const metadata: Metadata = {
  title: 'Incidents',
};

type IncidentsPageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default function IncidentsPage({ params }: IncidentsPageProps) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <IncidentsContent params={params} />
    </Suspense>
  );
}

async function IncidentsContent({ params }: IncidentsPageProps) {
  const { orgSlug } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Incident lifecycle"
        title="Incidents"
        description="Correlated incidents across every service and environment. Filter by status, ownership, and service."
        actions={
          <>
            <Button variant="outline">
              <Download className="size-4" aria-hidden="true" />
              Export
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

      <div className="bg-gradient-to-r from-emerald-500/10 via-background to-cyan-500/10 flex items-start gap-3 rounded-xl border p-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">Correlation is active</p>
          <p className="text-muted-foreground text-xs leading-5">
            SentinelAI merged 38 related alerts into 3 incidents in the last 24 hours. Hypotheses
            are evidence-backed and require responder approval before any write.
          </p>
        </div>
      </div>

      <IncidentsView orgSlug={orgSlug} incidents={incidents} />
    </div>
  );
}
