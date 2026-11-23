'use client';

import { useState, type DragEvent } from 'react';
import { Check, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ActivityConfig, Answers, Score, SubmitProblem } from '@/lib/workspace-activities';
import { fieldClass } from '@/components/workspace/files/ui';

const pick = (lang: string, en: string, fr?: string) => (lang === 'fr' && fr) || en;

function Mark({ right }: { right: boolean }) {
  const { t } = useTranslation();
  return right ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
      <Check className="h-3 w-3" aria-hidden="true" /> {t('activity.result.right')}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">
      <X className="h-3 w-3" aria-hidden="true" /> {t('activity.result.wrong')}
    </span>
  );
}

/**
 * Quiz questions. Editable: one choice (radio) or several (boxes). Read-only:
 * what was chosen and, when the key is known, which options are right.
 */
export function QuizFields({
  config,
  answers,
  editable,
  problems,
  score,
  onChange,
}: {
  config: ActivityConfig;
  answers: Answers;
  editable: boolean;
  problems?: SubmitProblem[];
  score: Score | null;
  onChange?: (id: string, value: string) => void;
}) {
  const { t, lang } = useTranslation();
  return (
    <div className="space-y-6">
      {config.quiz.map((q, i) => {
        const chosen = new Set((answers.values[q.id] ?? '').split(',').filter(Boolean));
        const keyed = q.correct.length > 0;
        const problem = problems?.find((p) => p.id === q.id);
        const toggle = (optionId: string) => {
          if (!onChange) return;
          if (!q.multiple) return onChange(q.id, optionId);
          const next = new Set(chosen);
          if (next.has(optionId)) next.delete(optionId);
          else next.add(optionId);
          onChange(q.id, q.options.map((o) => o.id).filter((id) => next.has(id)).join(','));
        };
        return (
          <fieldset key={q.id} data-testid="quiz-question">
            <legend className="text-sm font-medium text-[var(--wq-text)]">
              {i + 1}. {pick(lang, q.promptEn, q.promptFr)}
              {q.points !== 1 && <span className="ml-1 text-xs font-normal text-[var(--wq-text-muted)]">({q.points} pts)</span>}
            </legend>
            <p className="mb-2 text-xs text-[var(--wq-text-muted)]">{q.multiple ? t('activity.quiz.pickMany') : t('activity.quiz.pickOne')}</p>
            <div className="space-y-1.5">
              {q.options.map((o) => {
                const isChosen = chosen.has(o.id);
                const isRight = keyed && q.correct.includes(o.id);
                return (
                  <label
                    key={o.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm text-[var(--wq-text)]',
                      isChosen ? 'border-[var(--wq-accent)] bg-[var(--wq-accent-glow)]/10' : 'border-[var(--wq-border)]',
                      keyed && isRight && 'border-emerald-500 bg-emerald-50',
                      keyed && isChosen && !isRight && 'border-red-400 bg-red-50',
                      !editable && 'cursor-default',
                    )}
                  >
                    <input
                      type={q.multiple ? 'checkbox' : 'radio'}
                      name={`quiz-${q.id}`}
                      checked={isChosen}
                      disabled={!editable}
                      onChange={() => toggle(o.id)}
                    />
                    <span className="flex-1">{pick(lang, o.textEn, o.textFr)}</span>
                    {keyed && isRight && <Check className="h-4 w-4 text-emerald-700" aria-label={t('activity.result.right')} />}
                  </label>
                );
              })}
            </div>
            {score && q.id in score.items && <div className="mt-2"><Mark right={score.items[q.id]} /></div>}
            {problem && <p role="alert" className="mt-1 text-xs text-red-600">{t('activity.problem.required')}</p>}
          </fieldset>
        );
      })}
    </div>
  );
}

/**
 * Card sort board: categories as columns plus a "not sorted yet" pool.
 * Drag and drop with a mouse; on phones and with the keyboard, each card has
 * a "Move to…" menu that does the same.
 */
export function CardSortBoard({
  config,
  answers,
  editable,
  problems,
  score,
  onChange,
}: {
  config: ActivityConfig;
  answers: Answers;
  editable: boolean;
  problems?: SubmitProblem[];
  score: Score | null;
  onChange?: (id: string, value: string) => void;
}) {
  const { t, lang } = useTranslation();
  const [over, setOver] = useState<string | null>(null);
  const placed = (cardId: string) => {
    const v = answers.values[cardId] ?? '';
    return config.categories.some((c) => c.id === v) ? v : '';
  };
  const columns = [{ id: '', label: t('activity.sort.unsorted') }, ...config.categories.map((c) => ({ id: c.id, label: pick(lang, c.labelEn, c.labelFr) }))];
  const catLabel = (id: string | null) => columns.find((c) => c.id === id)?.label ?? '';

  function onDrop(e: DragEvent, categoryId: string) {
    e.preventDefault();
    setOver(null);
    const cardId = e.dataTransfer.getData('text/card');
    if (cardId && editable) onChange?.(cardId, categoryId);
  }

  return (
    <div className="space-y-3">
      {editable && <p className="text-xs text-[var(--wq-text-muted)]">{t('activity.sort.help')}</p>}
      <div className="grid gap-3 md:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
        {columns.map((col) => {
          const cards = config.cards.filter((c) => placed(c.id) === col.id);
          if (col.id === '' && cards.length === 0 && !editable) return null;
          return (
            <section
              key={col.id || 'unsorted'}
              data-testid={`column-${col.id || 'unsorted'}`}
              aria-label={col.label}
              onDragOver={(e) => {
                if (!editable) return;
                e.preventDefault();
                setOver(col.id);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => onDrop(e, col.id)}
              className={cn(
                'min-h-24 rounded-xl border-2 p-2 transition',
                // The pool of unsorted cards runs across the top; categories sit side by side below it.
                col.id === '' ? 'border-dashed border-[var(--wq-border-hover)] md:col-span-full' : 'border-[var(--wq-border)] bg-[var(--wq-canvas-alt)]',
                over === col.id && 'border-[var(--wq-accent)] bg-[var(--wq-accent-glow)]/10',
              )}
            >
              <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--wq-text-muted)]">
                {col.label} <span className="font-normal">({cards.length})</span>
              </h3>
              <ul className="space-y-1.5">
                {cards.map((card) => {
                  const problem = problems?.find((p) => p.id === card.id);
                  return (
                    <li
                      key={card.id}
                      data-testid="sort-card"
                      draggable={editable}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/card', card.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      className={cn(
                        'rounded-lg border bg-[var(--wq-card)] px-3 py-2 text-sm text-[var(--wq-text)] shadow-sm',
                        editable && 'cursor-grab active:cursor-grabbing',
                        problem ? 'border-red-400' : 'border-[var(--wq-border)]',
                        score && card.id in score.items && (score.items[card.id] ? 'border-emerald-500' : 'border-red-400'),
                      )}
                    >
                      <p>{pick(lang, card.textEn, card.textFr)}</p>
                      {editable && (
                        <select
                          className={cn(fieldClass, 'mt-1.5 w-full py-1 text-xs')}
                          value={col.id}
                          aria-label={`${t('activity.sort.moveTo')} ${pick(lang, card.textEn, card.textFr)}`}
                          onChange={(e) => onChange?.(card.id, e.target.value)}
                        >
                          {columns.map((c) => (
                            <option key={c.id || 'unsorted'} value={c.id}>
                              {c.id === '' ? t('activity.sort.moveTo') : c.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {score && card.id in score.items && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <Mark right={score.items[card.id]} />
                          {!score.items[card.id] && (
                            <span className="text-xs text-[var(--wq-text-muted)]">{t('activity.result.expected', { category: catLabel(card.expected) })}</span>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
      {problems?.some((p) => p.message === 'sort') && (
        <p role="alert" className="text-xs text-red-600">
          {t('activity.problem.sort')}
        </p>
      )}
    </div>
  );
}
