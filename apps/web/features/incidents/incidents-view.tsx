'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Siren, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { severityVariant, statusLabel, statusVariant } from '@/lib/incident-ui';
import type { Incident, IncidentStatus } from '@/lib/sample-data';
import { cn } from '@/lib/utils';

type IncidentsViewProps = {
  orgSlug: string;
  incidents: Incident[];
};

const filters: Array<{ label: string; value: IncidentStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Investigating', value: 'investigating' },
  { label: 'Monitoring', value: 'monitoring' },
  { label: 'Resolved', value: 'resolved' },
];

export function IncidentsView({ orgSlug, incidents }: IncidentsViewProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<IncidentStatus | 'all'>('all');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchesStatus = status === 'all' || incident.status === status;
      const matchesQuery =
        normalized.length === 0 ||
        [incident.title, incident.service, incident.owner, incident.id].some((value) =>
          value.toLowerCase().includes(normalized),
        );

      return matchesStatus && matchesQuery;
    });
  }, [incidents, query, status]);

  function clearFilters() {
    setQuery('');
    setStatus('all');
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <label htmlFor="incident-search" className="sr-only">
              Search incidents
            </label>
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              id="incident-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, service, or owner..."
              className="pl-9"
            />
          </div>

          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Filter by status"
          >
            {filters.map((filter) => (
              <Button
                key={filter.value}
                type="button"
                size="sm"
                variant={status === filter.value ? 'secondary' : 'ghost'}
                aria-pressed={status === filter.value}
                onClick={() => setStatus(filter.value)}
                className={cn(status !== filter.value && 'text-muted-foreground')}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        <div
          aria-live="polite"
          className="text-muted-foreground flex items-center justify-between text-xs"
        >
          <span>
            {filtered.length} incident{filtered.length === 1 ? '' : 's'}
          </span>
          {(query.length > 0 || status !== 'all') && (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              <X className="size-3.5" aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
            <span className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-full">
              <Siren className="size-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium">No incidents match those filters</p>
              <p className="text-muted-foreground text-xs">
                Try a different status or clear the search to see the full list.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Reset filters
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-full">Incident</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="w-8">
                  <span className="sr-only">Open</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="max-w-[18rem] whitespace-normal">
                    <Link
                      href={`/app/${orgSlug}/incidents/${incident.id}`}
                      className="hover:underline focus-visible:ring-ring rounded outline-none focus-visible:ring-2"
                    >
                      <span className="block truncate text-sm font-medium">{incident.title}</span>
                      <span className="text-muted-foreground block font-mono text-xs">
                        {incident.id}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={severityVariant(incident.severity)} className="text-[0.65rem]">
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(incident.status)} className="text-[0.65rem]">
                      {statusLabel(incident.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {incident.service}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{incident.owner}</TableCell>
                  <TableCell className="text-muted-foreground text-right font-mono text-xs">
                    {incident.duration}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/app/${orgSlug}/incidents/${incident.id}`}
                      className="text-muted-foreground hover:text-foreground inline-flex rounded p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Open ${incident.title}`}
                    >
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
