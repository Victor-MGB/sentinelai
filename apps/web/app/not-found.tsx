import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
        <SearchX className="size-6" aria-hidden="true" />
      </span>
      <div className="max-w-md space-y-2">
        <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
          404
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground text-sm">
          The page you are looking for may have moved, or you may not have access to it.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back home
          </Link>
        </Button>
        <Button asChild>
          <Link href="/app/acme">Open workspace</Link>
        </Button>
      </div>
    </div>
  );
}
