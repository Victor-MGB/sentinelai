'use client';

import { CircleAlert, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="flex min-h-svh items-center justify-center p-6 font-sans">
        <div className="flex max-w-md flex-col items-center gap-5 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-700">
            <CircleAlert className="size-6" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">SentinelAI is unavailable</h1>
            <p className="text-sm text-neutral-600">
              A critical error prevented the application from rendering. Reload the page to try
              again.
            </p>
            {error.digest ? (
              <p className="font-mono text-xs text-neutral-500">Reference: {error.digest}</p>
            ) : null}
          </div>
          <Button onClick={reset}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Reload application
          </Button>
        </div>
      </body>
    </html>
  );
}
