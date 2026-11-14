import type { Metadata } from 'next';
import { Mail, Plus, ShieldCheck } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { members } from '@/lib/sample-data';

export const metadata: Metadata = {
  title: 'Members',
};

const roleVariant = {
  Owner: 'default',
  Admin: 'info',
  Responder: 'secondary',
  Viewer: 'outline',
} as const;

export default function MembersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Access control"
        title="Members"
        description="Manage who can view, respond to, and administer incidents in this organization."
        actions={
          <Button>
            <Plus className="size-4" aria-hidden="true" />
            Invite member
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Active members', value: '3' },
          { label: 'Pending invites', value: '1' },
          { label: 'Teams', value: '4' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-muted-foreground text-xs font-medium">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization members</CardTitle>
          <CardDescription>
            Roles are enforced by the API on every request, not only in the interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.email}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback>
                          {member.name
                            .split(' ')
                            .map((part) => part.charAt(0))
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{member.name}</p>
                        <p className="text-muted-foreground truncate text-xs">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleVariant[member.role]}>{member.role}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{member.team}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'Active' ? 'success' : 'warning'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Single sign-on is available on Team plans</p>
            <p className="text-muted-foreground text-xs">
              Enforce SAML or OIDC, require MFA, and sync role assignments from your identity
              provider.
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Mail className="size-4" aria-hidden="true" />
            Contact sales
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
