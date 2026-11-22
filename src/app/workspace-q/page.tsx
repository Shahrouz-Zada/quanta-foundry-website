import type { Metadata } from 'next';
import WorkspaceDashboard from '@/components/sections/WorkspaceDashboard';
import ClassesBand from '@/components/workspace/classes/ClassesBand';
import { loadMyClasses } from '@/lib/workspace-classes-server';

export const metadata: Metadata = {
  title: 'Workspace Q',
  description:
    'Your project launchpad. Access project briefs, code templates, datasets, and advanced deep-tech learning tools sponsored by Quanta Foundry.',
  alternates: { canonical: 'https://www.quantafoundry.com/workspace-q' },
};

// Shows who is signed in (their classes), so this page is rendered per request.
export const dynamic = 'force-dynamic';

export default async function WorkspaceQPage() {
  const mine = await loadMyClasses();
  // Someone who belongs to a class has already given their name through the class; skip the general sign-up form.
  return <WorkspaceDashboard classesSlot={<ClassesBand {...mine} />} inClass={mine.classes.length > 0} />;
}
