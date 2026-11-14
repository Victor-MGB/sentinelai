'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Bell, Plus, Search } from 'lucide-react';

import { MobileNav } from '@/components/layout/mobile-nav';
import { OrgSwitcher } from '@/components/layout/org-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getActiveNavTitle } from '@/lib/navigation';
import { UserMenu } from '@/components/layout/user-menu';

type AppHeaderProps = {
  orgSlug: string;
};

export function AppHeader({ orgSlug }: AppHeaderProps) {
  const pathname = usePathname();
  const title = getActiveNavTitle(pathname, orgSlug);

  return (
    <header className="bg-background/85 sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-md md:px-6">
      <MobileNav orgSlug={orgSlug} />
      <OrgSwitcher orgSlug={orgSlug} />
      <span className="text-muted-foreground hidden text-sm sm:inline" aria-hidden="true">
        /
      </span>
      <span className="hidden truncate text-sm font-medium sm:inline">{title}</span>

      <div className="ml-auto flex items-center gap-1.5">
        <form
          role="search"
          className="relative mr-1 hidden lg:block"
          onSubmit={(event) => event.preventDefault()}
        >
          <label htmlFor="global-search" className="sr-only">
            Search incidents and services
          </label>
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="global-search"
            type="search"
            placeholder="Search incidents..."
            className="bg-muted/50 h-8 w-56 pl-8 text-sm"
          />
        </form>

        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href={`/app/${orgSlug}/incidents`}>
            <Plus className="size-4" aria-hidden="true" />
            New incident
          </Link>
        </Button>

        <ThemeToggle />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="View notifications"
        >
          <Bell className="size-4" aria-hidden="true" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-emerald-500 ring-2 ring-background" />
        </Button>

        <UserMenu orgSlug={orgSlug} />
      </div>
    </header>
  );
}
