import type { Metadata } from 'next';
import { ScrollText } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { auditEvents } from '@/lib/sample-data';

export const metadata: Metadata = {
  title: 'Audit log',
};

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Security"
        title="Audit log"
        description="An append-only record of approvals, access changes, and configuration updates."
        actions={
          <Button variant="outline">
            <ScrollText className="size-4" aria-hidden="true" />
            Export audit log
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Audit records are retained according to the organization retention policy and never
            include secrets or raw sensitive telemetry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditEvents.map((event) => (
                <TableRow key={`${event.time}-${event.action}`}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[0.65rem]">
                      {event.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{event.actor}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{event.target}</TableCell>
                  <TableCell className="text-muted-foreground text-right text-xs">
                    {event.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
