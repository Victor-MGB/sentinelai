'use client';

import Link from 'next/link';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type UserMenuProps = {
  orgSlug: string;
};

export function UserMenu({ orgSlug }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 px-1.5">
          <Avatar className="size-7">
            <AvatarFallback className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              AL
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:inline">Ada Lovelace</span>
          <ChevronDown
            className="text-muted-foreground hidden size-3 md:block"
            aria-hidden="true"
          />
          <span className="sr-only">Open user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">Ada Lovelace</p>
          <p className="text-muted-foreground text-xs">ada@sentinelai.dev</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/app/${orgSlug}/settings`}>
            <User className="size-4" aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/app/${orgSlug}/settings`}>
            <Settings className="size-4" aria-hidden="true" />
            Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild variant="destructive">
          <Link href="/login">
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
