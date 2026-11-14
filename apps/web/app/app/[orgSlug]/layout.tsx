import { Suspense, type ReactNode } from 'react';
import type { Metadata } from 'next';

import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Skeleton } from '@/components/ui/skeleton';

type AppLayoutProps = {
  children: ReactNode;
  params: Promise<{ orgSlug: string }>;
};

export const metadata: Metadata = {
  title: {
    default: 'Workspace',
    template: '%s · SentinelAI',
  },
};

export default function AppLayout({ children, params }: AppLayoutProps) {
  return (
    <div className="bg-muted/30 flex min-h-svh">
      <Suspense fallback={<SidebarFallback />}>
        <SidebarSlot params={params} />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<HeaderFallback />}>
          <HeaderSlot params={params} />
        </Suspense>
        <main id="main-content" className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

async function SidebarSlot({ params }: Pick<AppLayoutProps, 'params'>) {
  const { orgSlug } = await params;

  return <AppSidebar orgSlug={orgSlug} />;
}

async function HeaderSlot({ params }: Pick<AppLayoutProps, 'params'>) {
  const { orgSlug } = await params;

  return <AppHeader orgSlug={orgSlug} />;
}

function SidebarFallback() {
  return (
    <aside className="bg-sidebar sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r lg:flex">
      <div className="flex h-16 shrink-0 items-center border-b px-5">
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="px-3 py-4">
        <Skeleton className="h-16 rounded-lg" />
      </div>
      <div className="space-y-2 px-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-9 rounded-md" />
        ))}
      </div>
      <div className="mt-auto border-t p-3">
        <Skeleton className="h-28 rounded-lg" />
      </div>
    </aside>
  );
}

function HeaderFallback() {
  return (
    <header className="bg-background flex h-16 shrink-0 items-center gap-3 border-b px-4 md:px-6">
      <Skeleton className="size-8 rounded-md lg:hidden" />
      <Skeleton className="h-8 w-36" />
      <Skeleton className="hidden h-4 w-24 sm:block" />
      <div className="ml-auto flex items-center gap-2">
        <Skeleton className="hidden h-8 w-56 lg:block" />
        <Skeleton className="hidden h-8 w-28 sm:block" />
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </header>
  );
}
