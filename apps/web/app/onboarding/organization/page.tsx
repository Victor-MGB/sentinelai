import type { Metadata } from 'next';

import { AuthShell } from '@/components/layout/auth-shell';
import { OrganizationForm } from '@/features/onboarding/organization-form';

export const metadata: Metadata = {
  title: 'Create organization',
};

export default function OnboardingOrganizationPage() {
  return (
    <AuthShell>
      <OrganizationForm />
    </AuthShell>
  );
}
