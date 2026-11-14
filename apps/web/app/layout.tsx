import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'SentinelAI — AI-assisted incident response',
    template: '%s · SentinelAI',
  },
  description:
    'SentinelAI correlates alerts, metrics, logs, traces, and deployment events into a single incident view with evidence-backed root-cause hypotheses.',
  applicationName: 'SentinelAI',
  keywords: [
    'incident response',
    'observability',
    'site reliability engineering',
    'root cause analysis',
    'AIOps',
  ],
  openGraph: {
    title: 'SentinelAI — AI-assisted incident response',
    description:
      'Turn fragmented observability data into a correlated incident narrative with clear evidence and recommended next steps.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem('sentinelai-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground flex min-h-svh flex-col font-sans antialiased">
        <a
          href="#main-content"
          className="bg-background focus:ring-ring sr-only rounded-md border px-4 py-2 text-sm font-medium shadow-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:ring-2"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
