'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { setModelAnswer, setResultsShown } from '@/app/workspace-q/classes/activity-actions';
import { cn } from '@/lib/utils';
import { newItemId, type ActivityConfig, type QuizQuestion, type RevealMode, type SortCard, type SortCategory } from '@/lib/workspace-activities';
import type { ActivityInfo } from '@/lib/workspace-activities-server';
import { formatClassDate } from '@/lib/workspace-materials';
import { Button, ErrorText, fieldClass, useAction } from '@/components/workspace/files/ui';

function move<T>(list: T[], i: number, d: -1 | 1): T[] {
  const j = i + d;
  if (j < 0 || j >= list.length) return list;
  const copy = [...list];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

function Tools({ onUp, onDown, onRemove, label }: { onUp: () => void; onDown: () => void; onRemove: () => void; label: string }) {
  return (
    <div className="flex shrink-0 gap-1">
      <Button size="sm" variant="ghost" onClick={onUp} aria-label={`Move ${label} up`}>
        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onDown} aria-label={`Move ${label} down`}>
        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onRemove} aria-label={`Remove ${label}`}>
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}

const h2 = 'text-sm font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]';

/** When students see their results and the right answers. Saved with the activity. */
export function RevealSetting({ value, onChange }: { value: RevealMode; onChange: (v: RevealMode) => void }) {
  return (
    <label className="block text-xs font-medium text-[var(--wq-text-muted)]">
      Show results and right answers to students
      <select className={cn(fieldClass, 'mt-1 w-full sm:w-96')} value={value} onChange={(e) => onChange(e.target.value as RevealMode)}>
        <option value="submit">Right after they submit (their answer is then final)</option>
        <option value="deadline">After the due time</option>
        <option value="manual">Only when I click “Show results now”</option>
      </select>
    </label>
  );
}

export function QuizBuilder({ config, onChange }: { config: ActivityConfig; onChange: (quiz: QuizQuestion[]) => void }) {
  const quiz = config.quiz;
  const update = (id: string, patch: Partial<QuizQuestion>) => onChange(quiz.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  return (
    <section className="space-y-3">
      <h2 className={h2}>Quiz questions</h2>
      {quiz.map((q, i) => (
        <div key={q.id} className="space-y-2 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-3" data-testid="quiz-builder-question">
          <div className="flex gap-2">
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
              <input className={fieldClass} value={q.promptEn} placeholder="Question (English)" aria-label={`Quiz question ${i + 1} (English)`} onChange={(e) => update(q.id, { promptEn: e.target.value })} />
              <input className={fieldClass} value={q.promptFr ?? ''} placeholder="Question (French, optional)" aria-label={`Quiz question ${i + 1} (French)`} onChange={(e) => update(q.id, { promptFr: e.target.value || undefined })} />
            </div>
            <Tools label={`quiz question ${i + 1}`} onUp={() => onChange(move(quiz, i, -1))} onDown={() => onChange(move(quiz, i, 1))} onRemove={() => onChange(quiz.filter((x) => x.id !== q.id))} />
          </div>
          <p className="text-xs text-[var(--wq-text-muted)]">Tick the right answer. Tick several if several are right (students then tick boxes).</p>
          <ul className="space-y-1.5">
            {q.options.map((o, j) => (
              <li key={o.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={q.correct.includes(o.id)}
                  aria-label={`Question ${i + 1}, option ${j + 1} is right`}
                  onChange={(e) => update(q.id, { correct: e.target.checked ? [...q.correct, o.id] : q.correct.filter((c) => c !== o.id) })}
                />
                <input
                  className={cn(fieldClass, 'min-w-0 flex-1 py-1.5')}
                  value={o.textEn}
                  placeholder={`Option ${j + 1}`}
                  aria-label={`Question ${i + 1}, option ${j + 1}`}
                  onChange={(e) => update(q.id, { options: q.options.map((x) => (x.id === o.id ? { ...x, textEn: e.target.value } : x)) })}
                />
                <input
                  className={cn(fieldClass, 'hidden min-w-0 flex-1 py-1.5 sm:block')}
                  value={o.textFr ?? ''}
                  placeholder="French (optional)"
                  aria-label={`Question ${i + 1}, option ${j + 1} (French)`}
                  onChange={(e) => update(q.id, { options: q.options.map((x) => (x.id === o.id ? { ...x, textFr: e.target.value || undefined } : x)) })}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Remove option ${j + 1} of question ${i + 1}`}
                  disabled={q.options.length <= 2}
                  onClick={() => update(q.id, { options: q.options.filter((x) => x.id !== o.id), correct: q.correct.filter((c) => c !== o.id) })}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" variant="ghost" disabled={q.options.length >= 12} onClick={() => update(q.id, { options: [...q.options, { id: newItemId(), textEn: '', textFr: undefined }] })}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add option
            </Button>
            <label className="flex items-center gap-1.5 text-xs text-[var(--wq-text-muted)]">
              Points
              <input type="number" min={0} max={100} className={cn(fieldClass, 'w-20 py-1 text-xs')} value={q.points} aria-label={`Question ${i + 1} points`} onChange={(e) => update(q.id, { points: Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0))) })} />
            </label>
          </div>
        </div>
      ))}
      <Button
        size="sm"
        onClick={() =>
          onChange([
            ...quiz,
            { id: newItemId(), promptEn: '', promptFr: undefined, options: [{ id: newItemId(), textEn: '', textFr: undefined }, { id: newItemId(), textEn: '', textFr: undefined }], correct: [], multiple: false, points: 1 },
          ])
        }
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add quiz question
      </Button>
    </section>
  );
}

export function CardSortBuilder({
  config,
  onChange,
}: {
  config: ActivityConfig;
  onChange: (next: { categories: SortCategory[]; cards: SortCard[] }) => void;
}) {
  const { categories, cards } = config;
  const setCats = (c: SortCategory[]) => onChange({ categories: c, cards: cards.map((x) => (x.expected && !c.some((k) => k.id === x.expected) ? { ...x, expected: null } : x)) });
  const setCards = (c: SortCard[]) => onChange({ categories, cards: c });
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className={h2}>Categories</h2>
        {categories.map((c, i) => (
          <div key={c.id} className="flex gap-2">
            <input className={cn(fieldClass, 'min-w-0 flex-1')} value={c.labelEn} placeholder="Category (English)" aria-label={`Category ${i + 1} (English)`} onChange={(e) => setCats(categories.map((x) => (x.id === c.id ? { ...x, labelEn: e.target.value } : x)))} />
            <input className={cn(fieldClass, 'min-w-0 flex-1')} value={c.labelFr ?? ''} placeholder="French (optional)" aria-label={`Category ${i + 1} (French)`} onChange={(e) => setCats(categories.map((x) => (x.id === c.id ? { ...x, labelFr: e.target.value || undefined } : x)))} />
            <Tools label={`category ${i + 1}`} onUp={() => setCats(move(categories, i, -1))} onDown={() => setCats(move(categories, i, 1))} onRemove={() => setCats(categories.filter((x) => x.id !== c.id))} />
          </div>
        ))}
        <Button size="sm" disabled={categories.length >= 12} onClick={() => setCats([...categories, { id: newItemId(), labelEn: '', labelFr: undefined }])}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add category
        </Button>
      </div>
      <div className="space-y-2">
        <h2 className={h2}>Cards</h2>
        <p className="text-xs text-[var(--wq-text-muted)]">The expected category is optional. When set, the answer is marked and students see their result when you choose.</p>
        {cards.map((c, i) => (
          <div key={c.id} className="flex flex-col gap-2 rounded-xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-2 sm:flex-row">
            <input className={cn(fieldClass, 'min-w-0 flex-1')} value={c.textEn} placeholder="Card (English)" aria-label={`Card ${i + 1} (English)`} onChange={(e) => setCards(cards.map((x) => (x.id === c.id ? { ...x, textEn: e.target.value } : x)))} />
            <input className={cn(fieldClass, 'min-w-0 flex-1')} value={c.textFr ?? ''} placeholder="French (optional)" aria-label={`Card ${i + 1} (French)`} onChange={(e) => setCards(cards.map((x) => (x.id === c.id ? { ...x, textFr: e.target.value || undefined } : x)))} />
            <select className={cn(fieldClass, 'sm:w-48')} value={c.expected ?? ''} aria-label={`Card ${i + 1} expected category`} onChange={(e) => setCards(cards.map((x) => (x.id === c.id ? { ...x, expected: e.target.value || null } : x)))}>
              <option value="">No expected category</option>
              {categories.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.labelEn || '(unnamed)'}
                </option>
              ))}
            </select>
            <Tools label={`card ${i + 1}`} onUp={() => setCards(move(cards, i, -1))} onDown={() => setCards(move(cards, i, 1))} onRemove={() => setCards(cards.filter((x) => x.id !== c.id))} />
          </div>
        ))}
        <Button size="sm" onClick={() => setCards([...cards, { id: newItemId(), textEn: '', textFr: undefined, expected: null }])}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add card
        </Button>
      </div>
    </section>
  );
}

export interface MaterialChoice {
  id: string;
  label: string;
  studentsSee: boolean;
  releaseAt: string | null;
}

/** Results now (quiz, card sort) and the model answer (F6.4). These act at once, separately from "Save activity". */
export function ResultsAndModel({ activity, materials, scored }: { activity: ActivityInfo; materials: MaterialChoice[]; scored: boolean }) {
  const router = useRouter();
  const results = useAction();
  const model = useAction();
  const [materialId, setMaterialId] = useState(activity.modelMaterialId ?? '');
  const current = materials.find((m) => m.id === activity.modelMaterialId) ?? null;
  const stateText = !current
    ? 'No model answer linked.'
    : current.studentsSee
      ? 'Students can see it now.'
      : current.releaseAt
        ? `Students get it ${formatClassDate(current.releaseAt, 'en')}.`
        : 'Staff only for now.';
  const run = (reveal: 'hide' | 'deadline' | 'now') =>
    model.run(() => setModelAnswer({ activityId: activity.id, materialId: materialId || null, reveal }), () => router.refresh());

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--wq-border)] bg-[var(--wq-card)] p-4">
      {scored && (
        <div className="space-y-2">
          <h2 className={h2}>Results</h2>
          <p className="text-sm text-[var(--wq-text)]">
            {activity.resultsRevealedAt
              ? `Shown to students since ${formatClassDate(activity.resultsRevealedAt, 'en')}. Answers can no longer change.`
              : activity.config.reveal === 'submit'
                ? 'Each student or team sees their results right after submitting.'
                : activity.config.reveal === 'deadline'
                  ? activity.dueAt
                    ? `Shown after the due time (${formatClassDate(activity.dueAt, 'en')}).`
                    : 'Set a due time, or show them yourself.'
                  : 'Hidden until you show them.'}
          </p>
          <Button
            variant={activity.resultsRevealedAt ? 'ghost' : 'primary'}
            pending={results.pending}
            onClick={() => results.run(() => setResultsShown({ activityId: activity.id, shown: !activity.resultsRevealedAt }), () => router.refresh())}
          >
            {activity.resultsRevealedAt ? 'Hide results again' : 'Show results now'}
          </Button>
          <ErrorText>{results.error}</ErrorText>
        </div>
      )}
      <div className="space-y-2">
        <h2 className={h2}>Model answer</h2>
        <p className="text-xs text-[var(--wq-text-muted)]">
          Upload the model answer as a material (it is kept staff-only), link it here, and choose when students get it. It then appears on this activity
          and in the session&apos;s materials.
        </p>
        <select className={cn(fieldClass, 'w-full sm:w-96')} value={materialId} onChange={(e) => setMaterialId(e.target.value)} aria-label="Model answer material">
          <option value="">No model answer</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-[var(--wq-text)]">{stateText}</p>
        <div className="flex flex-wrap gap-2">
          {materialId ? (
            <>
              <Button size="sm" pending={model.pending} onClick={() => run('now')}>
                Show to students now
              </Button>
              <Button size="sm" pending={model.pending} onClick={() => run('deadline')} disabled={!activity.dueAt}>
                Show at the due time
              </Button>
              <Button size="sm" variant="ghost" pending={model.pending} onClick={() => run('hide')}>
                Keep it staff-only
              </Button>
            </>
          ) : (
            activity.modelMaterialId && (
              <Button size="sm" variant="ghost" pending={model.pending} onClick={() => run('hide')}>
                Unlink
              </Button>
            )
          )}
        </div>
        <ErrorText>{model.error}</ErrorText>
      </div>
    </section>
  );
}
