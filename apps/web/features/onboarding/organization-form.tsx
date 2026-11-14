'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleCheck, Building2 } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function OrganizationForm() {
  const [created, setCreated] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreated(true);
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Building2 className="size-4" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">Create your organization</CardTitle>
        <CardDescription>
          This becomes the top-level tenant for projects, incidents, and billing.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization-name">Organization name</Label>
            <Input
              id="organization-name"
              name="organizationName"
              placeholder="Acme Inc"
              autoComplete="organization"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workspace-slug">Workspace URL</Label>
            <div className="flex">
              <span className="bg-muted text-muted-foreground flex h-9 items-center rounded-l-md border border-r-0 px-3 text-xs">
                app.sentinelai.com/app/
              </span>
              <Input
                id="workspace-slug"
                name="workspaceSlug"
                placeholder="acme"
                pattern="[a-z0-9-]+"
                className="rounded-l-none"
                required
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Lowercase letters, numbers, and hyphens.
            </p>
          </div>
          {created ? (
            <Alert>
              <CircleCheck aria-hidden="true" />
              <AlertTitle>Organization ready</AlertTitle>
              <AlertDescription>
                This preview does not persist data. Open the demo workspace to continue exploring.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button type="submit" className="w-full">
            Create organization
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/app/acme">Skip to demo workspace</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
