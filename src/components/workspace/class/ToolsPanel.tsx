'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Plus, X } from 'lucide-react';
import { addTool, deleteTool } from '@/app/workspace-q/classes/materials-actions';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ToolView } from '@/lib/workspace-materials-server';
import { Button, ErrorText, fieldClass, useAction } from '@/components/workspace/files/ui';

/** Links students need all term (F5.3). Staff add and remove them. */
export default function ToolsPanel({ offeringId, tools, staff }: { offeringId: string; tools: ToolView[]; staff: boolean }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const add = useAction();
  const remove = useAction();

  if (!staff && tools.length === 0) return null;

  return (
    <section aria-labelledby="tools-title" className="rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-4">
      <h2 id="tools-title" className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]">
        {t('class.tools')}
      </h2>
      {tools.length === 0 ? (
        <p className="text-sm text-[var(--wq-text-muted)]">{t('class.noTools')}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <li key={tool.id} className="flex items-center">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--wq-border)] px-3 py-1.5 text-sm font-medium text-[var(--wq-text)] hover:border-[var(--wq-accent)]"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[var(--wq-accent)]" aria-hidden="true" />
                {tool.label}
              </a>
              {staff && (
                <button
                  type="button"
                  aria-label={`Remove ${tool.label}`}
                  onClick={() => remove.run(() => deleteTool({ toolId: tool.id }), () => router.refresh())}
                  className="ml-0.5 rounded p-1 text-[var(--wq-text-subtle)] hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {staff && (
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            add.run(() => addTool({ offeringId, label, url }), () => {
              setLabel('');
              setUrl('');
              router.refresh();
            });
          }}
        >
          <input className={cn(fieldClass, 'sm:w-44')} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Name, e.g. Google Colab" aria-label="Tool name" maxLength={80} />
          <input className={cn(fieldClass, 'min-w-0 flex-1')} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" aria-label="Tool address" maxLength={2000} />
          <Button type="submit" pending={add.pending} disabled={!label.trim() || !url.trim()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add tool
          </Button>
        </form>
      )}
      <ErrorText>{add.error || remove.error}</ErrorText>
    </section>
  );
}
