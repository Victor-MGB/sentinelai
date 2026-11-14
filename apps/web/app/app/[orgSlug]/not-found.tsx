import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center gap-5 py-16 text-center">
      <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
        <SearchX className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Not found in this workspace</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          The incident, project, or page may have been removed, or you may not have access to it.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/app/acme">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to overview
        </Link>
      </Button>
    </div>
  );
}
