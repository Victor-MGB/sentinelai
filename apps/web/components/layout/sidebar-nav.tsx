'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getNavigation, isNavItemActive } from '@/lib/navigation';

type SidebarNavProps = {
  orgSlug: string;
  onNavigate?: () => void;
};

export function SidebarNav({ orgSlug, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const sections = getNavigation(orgSlug);

  return (
    <nav aria-label="Primary" className="space-y-6">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="text-muted-foreground mb-2 px-3 text-[0.65rem] font-semibold tracking-[0.12em] uppercase">
            {section.label}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isNavItemActive(pathname, item);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-4 shrink-0',
                        active ? 'text-foreground' : 'text-muted-foreground',
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex-1">{item.title}</span>
                    {item.badge ? (
                      <Badge variant="info" className="h-5 px-1.5 text-[0.65rem]">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
