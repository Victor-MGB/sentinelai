import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Trash2 } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { WorkspacePageSkeleton } from '@/components/layout/workspace-page-skeleton';
import { SettingsForm } from '@/features/settings/settings-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatOrgName } from '@/lib/navigation';

export const metadata: Metadata = {
  title: 'Settings',
};

type SettingsPageProps = {
  params: Promise<{ orgSlug: string }>;
};

export default function SettingsPage({ params }: SettingsPageProps) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <SettingsContent params={params} />
    </Suspense>
  );
}

async function SettingsContent({ params }: SettingsPageProps) {
  const { orgSlug } = await params;
  const orgName = formatOrgName(orgSlug);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="Organization profile, retention policy, notifications, and security controls."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <SettingsForm orgName={orgName} orgSlug={orgSlug} />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security posture</CardTitle>
              <CardDescription>Current organization safeguards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                ['Session cookies', 'HttpOnly · Secure · SameSite=Lax'],
                ['CSRF protection', 'Origin checks enabled'],
                ['Audit retention', '365 days'],
                ['SSO', 'Not configured'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground text-xs">{label}</span>
                  <span className="max-w-40 text-right text-xs font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
              <CardDescription>
                Deleting the organization removes all projects, incidents, and telemetry. This
                cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" size="sm" className="w-full">
                <Trash2 className="size-4" aria-hidden="true" />
                Delete organization
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
