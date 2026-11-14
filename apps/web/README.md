# SentinelAI Web

Next.js App Router frontend for SentinelAI. The application is presentation-only:
it calls the Fastify API for every read and mutation and never accesses data
stores directly.

## Stack

- Next.js 16 with the App Router and React Server Components
- TypeScript
- Tailwind CSS v4
- shadcn/ui primitives built on Radix UI
- Lucide icons

## Structure

```text
apps/web/
├── app/                  # Routes, nested layouts, loading/error boundaries
├── components/           # Shared UI primitives and layout components
├── features/             # Feature-scoped client components
├── lib/                  # Navigation, sample data, and utilities
└── public/               # Static assets
```

## Development

Run from the repository root:

```bash
npm run dev:web
```

The app starts at `http://localhost:3000`. The demo workspace lives at
`http://localhost:3000/app/acme`.

Useful commands:

```bash
npm run build:web
npm run lint:web
npm run typecheck:web
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page |
| `/login`, `/signup` | Authentication entry points |
| `/onboarding/organization` | Organization creation |
| `/app/[orgSlug]` | Reliability overview |
| `/app/[orgSlug]/incidents` | Incident list and filters |
| `/app/[orgSlug]/incidents/[incidentId]` | Investigation workspace |
| `/app/[orgSlug]/projects` | Projects and environments |
| `/app/[orgSlug]/members` | Members and roles |
| `/app/[orgSlug]/reports` | Reliability reporting |
| `/app/[orgSlug]/settings` | Organization settings |
| `/app/[orgSlug]/audit` | Audit log |

Loading, empty, and error states are defined for the route tree. Interactive
components are client components; layouts and data shells remain server
components.
