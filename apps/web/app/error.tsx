'use client';

import { useEffect } from 'react';
import { CircleAlert, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (error.digest) {
      console.error(`Unhandled application error (digest: ${error.digest})`);
    }
  }, [error.digest]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <span className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
        <CircleAlert className="size-6" aria-hidden="true" />
      </span>
      <div className="max-w-md space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground text-sm">
          The page could not be loaded. Try again, and if the problem persists contact support with
          the reference below.
        </p>
        {error.digest ? (
          <p className="text-muted-foreground font-mono text-xs">Reference: {error.digest}</p>
        ) : null}
      </div>
      <Button onClick={reset}>
        <RotateCcw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
