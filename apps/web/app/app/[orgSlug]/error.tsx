'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CircleAlert, LayoutDashboard, RotateCcw } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    if (error.digest) {
      console.error(`Workspace surface failed (digest: ${error.digest})`);
    }
  }, [error.digest]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-10">
      <div className="space-y-2 text-center">
        <span className="bg-destructive/10 text-destructive mx-auto flex size-11 items-center justify-center rounded-full">
          <CircleAlert className="size-5" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">This view could not load</h1>
        <p className="text-muted-foreground text-sm">
          Your navigation and other panels are still available. Retry this section or return to the
          overview.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 p-6">
          <Alert variant="destructive">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>Request failed</AlertTitle>
            <AlertDescription>
              SentinelAI could not fetch the data for this page. Safe input has been preserved.
              {error.digest ? (
                <span className="font-mono text-xs">Reference: {error.digest}</span>
              ) : null}
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap gap-2">
            <Button onClick={reset}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/app/acme">
                <LayoutDashboard className="size-4" aria-hidden="true" />
                Back to overview
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
