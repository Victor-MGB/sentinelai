import Link from 'next/link';
import { Activity, ArrowUpRight, LifeBuoy } from 'lucide-react';

import { Brand } from '@/components/brand';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Button } from '@/components/ui/button';
import { formatOrgName } from '@/lib/navigation';

type AppSidebarProps = {
  orgSlug: string;
};

export function AppSidebar({ orgSlug }: AppSidebarProps) {
  const orgName = formatOrgName(orgSlug);

  return (
    <aside className="bg-sidebar text-sidebar-foreground sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b px-5">
        <Brand href={`/app/${orgSlug}`} />
      </div>

      <div className="px-3 py-4">
        <div className="bg-background flex items-center gap-3 rounded-lg border p-3 shadow-xs">
          <span className="flex size-9 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Activity className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{orgName}</p>
            <p className="text-muted-foreground text-xs">Private beta workspace</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <SidebarNav orgSlug={orgSlug} />
      </div>

      <div className="shrink-0 border-t p-3">
        <div className="bg-background rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <p className="text-xs font-medium">Ingestion healthy</p>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">All collectors reporting normally.</p>
          <div className="mt-3 flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/app/${orgSlug}/settings`}>
                <LifeBuoy className="size-3.5" aria-hidden="true" />
                Support
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Open audit log">
              <Link href={`/app/${orgSlug}/audit`}>
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
