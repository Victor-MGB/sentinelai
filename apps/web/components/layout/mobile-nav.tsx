'use client';

import { useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import Link from 'next/link';

import { Brand } from '@/components/brand';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { formatOrgName } from '@/lib/navigation';

type MobileNavProps = {
  orgSlug: string;
};

export function MobileNav({ orgSlug }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Primary navigation for {formatOrgName(orgSlug)}
          </SheetDescription>
          <Brand href={`/app/${orgSlug}`} />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav orgSlug={orgSlug} onNavigate={() => setOpen(false)} />
        </div>
        <div className="border-t p-3">
          <Button asChild className="w-full">
            <Link href={`/app/${orgSlug}/incidents`} onClick={() => setOpen(false)}>
              <Plus className="size-4" aria-hidden="true" />
              New incident
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
