import type { Metadata } from 'next';
import WorkspaceDashboard from '@/components/sections/WorkspaceDashboard';

export const metadata: Metadata = {
  title: 'Workspace Q',
  description:
    'Your project launchpad. Access project briefs, code templates, datasets, and advanced deep-tech learning tools sponsored by Quanta Foundry.',
  alternates: { canonical: 'https://www.quantafoundry.com/workspace-q' },
};

export default function WorkspaceQPage() {
  return <WorkspaceDashboard />;
}
