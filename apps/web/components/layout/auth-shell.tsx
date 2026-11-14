import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Sparkles, Waypoints } from 'lucide-react';

import { Brand } from '@/components/brand';
import { Badge } from '@/components/ui/badge';

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r bg-muted/30 lg:flex lg:flex-col">
        <div
          aria-hidden="true"
          className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 size-96 rounded-full bg-emerald-500/20 blur-3xl"
        />
        <div className="relative flex flex-1 flex-col justify-between p-10">
          <Brand />

          <div className="max-w-md space-y-6">
            <Badge variant="success" className="gap-1.5">
              <Sparkles className="size-3" aria-hidden="true" />
              Built for responders
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              The incident context you wish you had at 3am.
            </h2>
            <p className="text-muted-foreground leading-7 text-pretty">
              One correlated timeline, ranked hypotheses with evidence, and approvals that keep
              automation accountable.
            </p>
            <ul className="space-y-3 text-sm">
              {[
                { icon: Waypoints, text: 'Correlate alerts, traces, logs, and deploys' },
                { icon: Sparkles, text: 'Evidence-backed hypotheses with confidence scores' },
                { icon: ShieldCheck, text: 'Human approval before any write action' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.text} className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-md bg-background text-emerald-600 shadow-sm dark:text-emerald-400">
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-muted-foreground">{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="text-muted-foreground text-xs">
            Private beta · SentinelAI reliability platform
          </p>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:justify-end">
          <Brand className="lg:hidden" />
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to site
          </Link>
        </div>
        <main
          id="main-content"
          className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6"
        >
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
