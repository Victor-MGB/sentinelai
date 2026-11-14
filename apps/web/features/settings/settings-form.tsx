'use client';

import { useState } from 'react';
import { Check, Save } from 'lucide-react';

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

type SettingsFormProps = {
  orgName: string;
  orgSlug: string;
};

export function SettingsForm({ orgName, orgSlug }: SettingsFormProps) {
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization profile</CardTitle>
          <CardDescription>
            How this workspace appears to members and in audit records.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization name</Label>
            <Input
              id="org-name"
              name="orgName"
              defaultValue={orgName}
              autoComplete="organization"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-slug">Workspace URL</Label>
            <div className="flex">
              <span className="bg-muted text-muted-foreground flex h-9 items-center rounded-l-md border border-r-0 px-3 text-xs">
                app.sentinelai.com/app/
              </span>
              <Input
                id="org-slug"
                name="orgSlug"
                defaultValue={orgSlug}
                className="rounded-l-none"
                pattern="[a-z0-9-]+"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              Lowercase letters, numbers, and hyphens.
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="billing-email">Billing contact</Label>
            <Input
              id="billing-email"
              name="billingEmail"
              type="email"
              defaultValue="billing@sentinelai.dev"
              autoComplete="email"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Retention and notifications</CardTitle>
          <CardDescription>
            Control how long telemetry is retained and where incident notifications are delivered.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="retention-days">Telemetry retention (days)</Label>
            <Input
              id="retention-days"
              name="retentionDays"
              type="number"
              min={7}
              max={365}
              defaultValue={30}
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notification-email">Notification email</Label>
            <Input
              id="notification-email"
              name="notificationEmail"
              type="email"
              defaultValue="oncall@sentinelai.dev"
              autoComplete="email"
            />
          </div>
          <label className="flex items-start gap-3 rounded-lg border p-3 sm:col-span-2">
            <input
              type="checkbox"
              name="weeklyDigest"
              defaultChecked
              className="accent-primary mt-0.5 size-4 rounded border"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium">Send weekly reliability digest</span>
              <span className="text-muted-foreground block text-xs">
                A Monday summary of incidents, SLO burn, and open action items.
              </span>
            </span>
          </label>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <p className="text-muted-foreground text-xs" aria-live="polite">
            {saved ? (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Check className="size-3.5" aria-hidden="true" />
                Changes saved successfully.
              </span>
            ) : (
              'Changes are audited and applied immediately.'
            )}
          </p>
          <Button type="submit" className="sm:ml-auto">
            <Save className="size-4" aria-hidden="true" />
            Save changes
          </Button>
        </CardFooter>
      </Card>

      <Alert>
        <Check aria-hidden="true" />
        <AlertTitle>Validation is authoritative on the server</AlertTitle>
        <AlertDescription>
          Client-side checks help you correct input quickly, but the API validates every field again
          and returns field-level errors without exposing internal details.
        </AlertDescription>
      </Alert>
    </form>
  );
}
