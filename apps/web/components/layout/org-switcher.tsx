'use client';

import Link from 'next/link';
import { Building2, Check, ChevronsUpDown, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatOrgName } from '@/lib/navigation';

type OrgSwitcherProps = {
  orgSlug: string;
};

export function OrgSwitcher({ orgSlug }: OrgSwitcherProps) {
  const orgName = formatOrgName(orgSlug);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 max-w-44 gap-1.5 px-2">
          <Building2 className="text-muted-foreground size-3.5" aria-hidden="true" />
          <span className="truncate font-medium">{orgName}</span>
          <ChevronsUpDown className="text-muted-foreground size-3" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/app/${orgSlug}`}>
            <Check className="size-4" aria-hidden="true" />
            {orgName}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app/northwind">
            <Building2 className="size-4" aria-hidden="true" />
            Northwind Labs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/onboarding/organization">
            <Plus className="size-4" aria-hidden="true" />
            Create organization
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
