import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  ScrollText,
  Settings,
  Siren,
  Users,
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export function getNavigation(orgSlug: string): NavSection[] {
  const base = `/app/${orgSlug}`;

  return [
    {
      label: 'Workspace',
      items: [
        { title: 'Overview', href: base, icon: LayoutDashboard, exact: true },
        { title: 'Incidents', href: `${base}/incidents`, icon: Siren, badge: '3' },
        { title: 'Projects', href: `${base}/projects`, icon: FolderKanban },
        { title: 'Members', href: `${base}/members`, icon: Users },
        { title: 'Reports', href: `${base}/reports`, icon: BarChart3 },
      ],
    },
    {
      label: 'Administration',
      items: [
        { title: 'Audit log', href: `${base}/audit`, icon: ScrollText },
        { title: 'Settings', href: `${base}/settings`, icon: Settings },
      ],
    },
  ];
}

export function formatOrgName(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getActiveNavTitle(pathname: string, orgSlug: string): string {
  const items = getNavigation(orgSlug)
    .flatMap((section) => section.items)
    .sort((a, b) => b.href.length - a.href.length);

  const active = items.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return active?.title ?? 'Overview';
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
