import type { IncidentSeverity, IncidentStatus } from '@/lib/sample-data';

type BadgeVariant =
  'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';

export function severityVariant(severity: IncidentSeverity): BadgeVariant {
  switch (severity) {
    case 'SEV-1':
      return 'destructive';
    case 'SEV-2':
      return 'warning';
    case 'SEV-3':
      return 'outline';
  }
}

export function statusVariant(status: IncidentStatus): BadgeVariant {
  switch (status) {
    case 'investigating':
      return 'warning';
    case 'monitoring':
      return 'info';
    case 'resolved':
      return 'success';
  }
}

export function statusLabel(status: IncidentStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
