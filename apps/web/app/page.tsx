import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BellRing,
  BrainCircuit,
  Check,
  CircleCheck,
  Clock,
  Database,
  Fingerprint,
  GitBranch,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Siren,
  Sparkles,
  TrendingDown,
  Waypoints,
  Workflow,
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

const stats = [
  { value: '42%', label: 'faster mean time to resolution' },
  { value: '8×', label: 'alert noise reduction' },
  { value: '3 min', label: 'to an evidence-backed hypothesis' },
];

const steps = [
  {
    icon: Database,
    title: 'Connect your signals',
    description:
      'Send OpenTelemetry metrics, logs, traces, alerts, and deploy events through a single ingestion path.',
  },
  {
    icon: Waypoints,
    title: 'Correlate the incident',
    description:
      'SentinelAI deduplicates alerts and builds one timeline across services, environments, and changes.',
  },
  {
    icon: BrainCircuit,
    title: 'Act with evidence',
    description:
      'Review ranked root-cause hypotheses with linked telemetry, then approve safe next steps.',
  },
];

const features = [
  {
    icon: Radar,
    title: 'Noise reduction',
    description:
      'Collapse duplicate alerts into a single incident narrative before responders engage.',
  },
  {
    icon: GitBranch,
    title: 'Change correlation',
    description: 'Tie deploys, config changes, and feature flags directly to incident onset.',
  },
  {
    icon: Sparkles,
    title: 'Grounded AI hypotheses',
    description:
      'Every recommendation traces back to telemetry evidence, never an unsupported guess.',
  },
  {
    icon: BellRing,
    title: 'Signal routing',
    description:
      'Notify Slack, PagerDuty, and email with severity rules that respect on-call rotations.',
  },
  {
    icon: BarChart3,
    title: 'SLO visibility',
    description:
      'Track error budgets and reliability trends across teams, services, and environments.',
  },
  {
    icon: Fingerprint,
    title: 'Audit by default',
    description:
      'Every approval, role change, and configuration update is recorded and attributable.',
  },
];

const stack = ['OpenTelemetry', 'Prometheus', 'Grafana', 'Slack', 'PagerDuty', 'GitHub', 'Argo CD'];

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      <div
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-cyan-500/20 blur-2xl"
        aria-hidden="true"
      />
      <Card className="overflow-hidden border shadow-2xl shadow-emerald-950/10">
        <div className="bg-muted/50 flex items-center gap-2 border-b px-4 py-3">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
          <span className="text-muted-foreground ml-2 truncate font-mono text-[0.65rem]">
            app.sentinelai.com/incidents/inc-1042
          </span>
        </div>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-[0.65rem]">
                  SEV-1
                </Badge>
                <Badge variant="warning" className="text-[0.65rem]">
                  Investigating
                </Badge>
              </div>
              <p className="truncate text-sm font-semibold">Checkout latency above SLO</p>
              <p className="text-muted-foreground text-xs">checkout-api · Production</p>
            </div>
            <span className="text-muted-foreground shrink-0 text-xs">18m</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'p99 latency', value: '1.8s', tone: 'text-red-600 dark:text-red-400' },
              {
                label: 'error rate',
                value: '0.4%',
                tone: 'text-emerald-600 dark:text-emerald-400',
              },
              { label: 'burn rate', value: '9.1×', tone: 'text-amber-600 dark:text-amber-400' },
            ].map((metric) => (
              <div key={metric.label} className="bg-muted/50 rounded-lg border p-2.5">
                <p className="text-muted-foreground text-[0.6rem] tracking-wide uppercase">
                  {metric.label}
                </p>
                <p className={`mt-1 text-lg font-semibold ${metric.tone}`}>{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 p-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-medium">Top hypothesis</p>
              <Badge variant="success" className="ml-auto text-[0.6rem]">
                87% confidence
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2 text-xs leading-5">
              Connection pool exhaustion after deploy <span className="font-mono">v2.41.0</span>.
              Three supporting signals link the rollout to the latency shift.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {['deploy:v2.41.0', 'db.pool.wait', 'trace:checkout'].map((tag) => (
                <span
                  key={tag}
                  className="bg-background rounded border px-1.5 py-0.5 font-mono text-[0.6rem]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">Timeline</p>
              <span className="text-muted-foreground text-[0.65rem]">Live</span>
            </div>
            {[
              { time: '14:02', text: 'Deploy v2.41.0 completed', tone: 'bg-sky-500' },
              { time: '14:05', text: 'Latency alert fired', tone: 'bg-amber-500' },
              { time: '14:09', text: 'Incident correlated', tone: 'bg-emerald-500' },
            ].map((event) => (
              <div key={event.time} className="flex items-center gap-2.5">
                <span className={`size-1.5 shrink-0 rounded-full ${event.tone}`} />
                <span className="text-muted-foreground font-mono text-[0.65rem]">{event.time}</span>
                <span className="truncate text-xs">{event.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="absolute -bottom-8 -left-8 hidden w-52 border shadow-xl sm:block">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-xs">
            <CircleCheck className="size-3.5 text-emerald-500" />
            Noise reduced
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-2xl font-semibold">38 → 1</p>
          <p className="text-muted-foreground text-[0.65rem]">alerts merged into one incident</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden="true"
            className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          />
          <div
            aria-hidden="true"
            className="absolute -top-32 left-1/2 -z-10 size-[32rem] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl"
          />
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
            <div className="space-y-7">
              <Badge variant="outline" className="gap-2 bg-background/70 py-1 pr-3 pl-1.5">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Now in private beta
                <ArrowUpRight className="size-3" aria-hidden="true" />
              </Badge>

              <div className="space-y-5">
                <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Turn noisy telemetry into{' '}
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
                    answers
                  </span>{' '}
                  during incidents.
                </h1>
                <p className="text-muted-foreground max-w-xl text-base leading-7 text-pretty sm:text-lg">
                  SentinelAI correlates alerts, metrics, logs, traces, and deployments into one
                  incident view, then produces evidence-backed root-cause hypotheses your responders
                  can trust.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="group">
                  <Link href="/signup">
                    Start free
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/app/acme">
                    <Activity className="size-4" aria-hidden="true" />
                    Explore live demo
                  </Link>
                </Button>
              </div>

              <dl className="grid max-w-lg grid-cols-3 gap-4 border-t pt-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-muted-foreground text-xs leading-4">{stat.label}</dt>
                    <dd className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <DashboardPreview />
          </div>
        </section>

        <section className="border-b bg-muted/30 py-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Built for the tools you already run
            </p>
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {stack.map((item) => (
                <li key={item} className="text-muted-foreground text-sm font-medium">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-[0.16em] text-emerald-600 uppercase dark:text-emerald-400">
              How it works
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              From first alert to supported decision in three steps.
            </h2>
            <p className="text-muted-foreground text-pretty">
              Keep your existing observability stack. SentinelAI adds the correlation and context
              layer that sits between raw telemetry and an on-call responder.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="relative bg-background/60">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="text-muted-foreground/40 font-mono text-sm">
                        0{index + 1}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-muted-foreground text-sm leading-6">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="platform" className="border-y bg-muted/30">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl space-y-3">
                <p className="text-xs font-semibold tracking-[0.16em] text-emerald-600 uppercase dark:text-emerald-400">
                  Platform
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  Context that holds up under pressure.
                </h2>
              </div>
              <p className="text-muted-foreground max-w-md text-sm leading-6">
                Every surface is designed for a responder who is already late to the incident.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="bg-background/70">
                    <CardContent className="space-y-3 p-5">
                      <Icon
                        className="size-5 text-emerald-600 dark:text-emerald-400"
                        aria-hidden="true"
                      />
                      <h3 className="text-sm font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-6">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="security"
          className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8"
        >
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.16em] text-emerald-600 uppercase dark:text-emerald-400">
              Security
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Telemetry is untrusted input. We treat it that way.
            </h2>
            <p className="text-muted-foreground text-pretty">
              AI guardrails validate structured output, bound tool arguments, and require human
              approval before any write. Sensitive values are redacted before logs, audit records,
              and model prompts.
            </p>
            <ul className="space-y-3 pt-2">
              {[
                'Tenant isolation enforced at the repository and data layers',
                'Hashed, scoped, expiring ingestion keys',
                'Append-only audit trail for approvals and configuration',
                'No direct data-store access from the browser or Next.js',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card className="bg-gradient-to-br from-emerald-500/5 via-background to-cyan-500/5">
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              {[
                {
                  icon: LockKeyhole,
                  title: 'Encrypted in transit',
                  text: 'TLS everywhere, mTLS for services.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Human approval',
                  text: 'Writes wait for an authorized operator.',
                },
                {
                  icon: Workflow,
                  title: 'Scoped automation',
                  text: 'Tool calls are bounded and audited.',
                },
                {
                  icon: Clock,
                  title: 'Retention controls',
                  text: 'Configurable per organization and data class.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="bg-background/80 rounded-lg border p-4">
                    <Icon
                      className="size-4 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                    <p className="mt-2 text-sm font-medium">{item.title}</p>
                    <p className="text-muted-foreground mt-1 text-xs leading-5">{item.text}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <section id="pricing" className="border-t">
          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-background to-cyan-500/10">
              <div
                className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
                aria-hidden="true"
              />
              <CardContent className="relative flex flex-col items-center gap-6 px-6 py-14 text-center">
                <Badge variant="success" className="gap-1.5">
                  <Zap className="size-3" aria-hidden="true" />
                  Private beta
                </Badge>
                <div className="max-w-2xl space-y-3">
                  <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                    Bring calm to your next incident.
                  </h2>
                  <p className="text-muted-foreground text-pretty">
                    Start with a free workspace, connect OpenTelemetry, and see what correlated
                    incident context looks like for your services.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">
                      Create workspace
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/app/acme">
                      <Siren className="size-4" aria-hidden="true" />
                      Tour the workspace
                    </Link>
                  </Button>
                </div>
                <div className="text-muted-foreground flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs">
                  <span className="flex items-center gap-1.5">
                    <TrendingDown className="size-3.5" aria-hidden="true" />
                    No credit card required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="size-3.5" aria-hidden="true" />
                    SOC 2 readiness underway
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="size-3.5" aria-hidden="true" />
                    OpenTelemetry-native
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
