import type { Metadata } from 'next';
import { ArrowDownRight, ArrowUpRight, BarChart3, Clock, Gauge, TrendingDown } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Reports',
};

const trend = [42, 55, 38, 64, 48, 72, 58, 46, 62, 50, 44, 36];

const services = [
  { name: 'checkout-api', slo: '99.95%', budget: 41, incidents: 2, trend: 'down' as const },
  { name: 'payments-worker', slo: '99.99%', budget: 88, incidents: 1, trend: 'up' as const },
  { name: 'edge-gateway', slo: '99.90%', budget: 72, incidents: 1, trend: 'up' as const },
  { name: 'search-indexer', slo: '99.50%', budget: 94, incidents: 0, trend: 'up' as const },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reliability reporting"
        title="Reports"
        description="Track error budgets, incident trends, and responder load across the organization."
        actions={
          <Button variant="outline">
            <BarChart3 className="size-4" aria-hidden="true" />
            Export report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'MTTR', value: '24m', change: '-12%', positive: true, icon: Clock },
          {
            label: 'Incidents this month',
            value: '14',
            change: '-3',
            positive: true,
            icon: BarChart3,
          },
          { label: 'Error budget used', value: '13%', change: '+2%', positive: false, icon: Gauge },
          {
            label: 'Alert noise reduced',
            value: '8.2×',
            change: '+0.6×',
            positive: true,
            icon: TrendingDown,
          },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium">{metric.label}</p>
                  <Icon className="text-muted-foreground size-4" aria-hidden="true" />
                </div>
                <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
                <p
                  className={
                    metric.positive
                      ? 'mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400'
                      : 'mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400'
                  }
                >
                  {metric.positive ? (
                    <ArrowDownRight className="size-3" aria-hidden="true" />
                  ) : (
                    <ArrowUpRight className="size-3" aria-hidden="true" />
                  )}
                  {metric.change} vs last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Incidents over time</CardTitle>
            <CardDescription>Last 12 weeks, all severities.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="flex h-48 items-end gap-2"
              role="img"
              aria-label="Incident trend bar chart"
            >
              {trend.map((value, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-emerald-500/40 to-teal-500"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-muted-foreground text-[0.6rem]">W{index + 1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SLO status</CardTitle>
            <CardDescription>30 day rolling window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-medium">{service.name}</span>
                  <span className="text-muted-foreground font-mono">{service.slo}</span>
                </div>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                  <div
                    className={
                      service.budget > 60
                        ? 'h-full rounded-full bg-emerald-500'
                        : service.budget > 35
                          ? 'h-full rounded-full bg-amber-500'
                          : 'h-full rounded-full bg-red-500'
                    }
                    style={{ width: `${service.budget}%` }}
                  />
                </div>
                <div className="text-muted-foreground flex justify-between text-[0.65rem]">
                  <span>{service.budget}% budget remaining</span>
                  <span>{service.incidents} incidents</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Responder load</CardTitle>
          <CardDescription>Incidents owned in the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'Grace Hopper', incidents: 6, load: 86 },
            { name: 'Ada Lovelace', incidents: 4, load: 62 },
            { name: 'Alan Turing', incidents: 3, load: 44 },
          ].map((person, index) => (
            <div key={person.name}>
              {index > 0 ? <Separator className="mb-3" /> : null}
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{person.name}</p>
                <Badge variant={person.load > 75 ? 'warning' : 'secondary'}>{person.load}%</Badge>
              </div>
              <div className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{ width: `${person.load}%` }}
                />
              </div>
              <p className="text-muted-foreground mt-1 text-[0.65rem]">
                {person.incidents} incidents
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
