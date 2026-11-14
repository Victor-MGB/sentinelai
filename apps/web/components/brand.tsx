import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

import { cn } from '@/lib/utils';

type BrandProps = {
  href?: string;
  className?: string;
};

export function Brand({ href = '/', className }: BrandProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2.5 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-sm">
        <ShieldAlert className="size-4" aria-hidden="true" />
      </span>
      <span className="text-[0.95rem]">SentinelAI</span>
    </Link>
  );
}
