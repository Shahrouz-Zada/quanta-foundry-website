'use client';

import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ActivityConfig, ActivityKind, Answers, FormField, Score, SubmitProblem } from '@/lib/workspace-activities';
import { CardSortBoard, QuizFields } from './ScoredFields';
import { fieldClass } from '@/components/workspace/files/ui';

const unit: Partial<Record<FormField['type'], string>> = { euro: '€', percent: '%' };

export function rangeText(f: { min: number | null; max: number | null }): string {
  if (f.min !== null && f.max !== null) return `${f.min} – ${f.max}`;
  if (f.min !== null) return `≥ ${f.min}`;
  if (f.max !== null) return `≤ ${f.max}`;
  return '';
}

/**
 * The questions or fields of an activity, as inputs (student) or as a
 * read-only answer (review, history). Values are kept as typed.
 */
export default function AnswerFields({
  kind,
  config,
  answers,
  editable,
  problems,
  onChange,
  onFocusField,
  score = null,
}: {
  kind: ActivityKind;
  config: ActivityConfig;
  answers: Answers;
  editable: boolean;
  problems?: SubmitProblem[];
  onChange?: (id: string, value: string) => void;
  onFocusField?: (id: string | null) => void;
  /** Quiz and card sort: marks right and wrong answers when results are shown */
  score?: Score | null;
}) {
  const { t, lang } = useTranslation();
  const problemFor = (id: string) => problems?.find((p) => p.id === id);
  const problemText = (p: SubmitProblem, f?: FormField) =>
    p.message === 'range' && f ? t('activity.problem.range', { range: rangeText(f) }) : t(`activity.problem.${p.message}` as 'activity.problem.required');
  const label = 'block text-sm font-medium text-[var(--wq-text)]';

  if (kind === 'QUIZ') {
    return <QuizFields config={config} answers={answers} editable={editable} problems={problems} score={score} onChange={onChange} />;
  }
  if (kind === 'CARD_SORT') {
    return <CardSortBoard config={config} answers={answers} editable={editable} problems={problems} score={score} onChange={onChange} />;
  }

  if (kind === 'SHORT_ANSWER') {
    return (
      <div className="space-y-5">
        {config.questions.map((q, i) => {
          const prompt = (lang === 'fr' && q.promptFr) || q.promptEn;
          const p = problemFor(q.id);
          const value = answers.values[q.id] ?? '';
          return (
            <div key={q.id}>
              <label htmlFor={`a-${q.id}`} className={label}>
                {i + 1}. {prompt}
                {!q.required && <span className="ml-1 font-normal text-[var(--wq-text-muted)]">({t('activity.optional')})</span>}
              </label>
              {editable ? (
                q.long ? (
                  <textarea
                    id={`a-${q.id}`}
                    rows={5}
                    className={cn(fieldClass, 'mt-1.5 w-full', p && 'border-red-500')}
                    value={value}
                    onChange={(e) => onChange?.(q.id, e.target.value)}
                    onFocus={() => onFocusField?.(q.id)}
                    onBlur={() => onFocusField?.(null)}
                    aria-invalid={!!p}
                  />
                ) : (
                  <input
                    id={`a-${q.id}`}
                    className={cn(fieldClass, 'mt-1.5 w-full', p && 'border-red-500')}
                    value={value}
                    onChange={(e) => onChange?.(q.id, e.target.value)}
                    onFocus={() => onFocusField?.(q.id)}
                    onBlur={() => onFocusField?.(null)}
                    aria-invalid={!!p}
                  />
                )
              ) : (
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-[var(--wq-canvas-alt)] px-3 py-2 text-sm text-[var(--wq-text)]">{value || '—'}</p>
              )}
              {p && <p role="alert" className="mt-1 text-xs text-red-600">{problemText(p)}</p>}
            </div>
          );
        })}
      </div>
    );
  }

  if (kind === 'FORM') {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {config.fields.map((f) => {
          const name = (lang === 'fr' && f.labelFr) || f.labelEn;
          const p = problemFor(f.id);
          const value = answers.values[f.id] ?? '';
          const range = rangeText(f);
          const wide = f.type === 'longtext';
          const common = {
            id: `a-${f.id}`,
            value,
            'aria-invalid': !!p,
            onFocus: () => onFocusField?.(f.id),
            onBlur: () => onFocusField?.(null),
          };
          return (
            <div key={f.id} className={cn(wide && 'sm:col-span-2')}>
              <label htmlFor={`a-${f.id}`} className={label}>
                {name}
                {unit[f.type] && <span className="ml-1 text-[var(--wq-text-muted)]">({unit[f.type]})</span>}
                {!f.required && <span className="ml-1 font-normal text-[var(--wq-text-muted)]">({t('activity.optional')})</span>}
              </label>
              {editable ? (
                f.type === 'choice' ? (
                  <select {...common} className={cn(fieldClass, 'mt-1.5 w-full', p && 'border-red-500')} onChange={(e) => onChange?.(f.id, e.target.value)}>
                    <option value="">{t('activity.choose')}</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : f.type === 'longtext' ? (
                  <textarea {...common} rows={4} className={cn(fieldClass, 'mt-1.5 w-full', p && 'border-red-500')} onChange={(e) => onChange?.(f.id, e.target.value)} />
                ) : (
                  <input
                    {...common}
                    inputMode={f.type === 'text' ? undefined : 'decimal'}
                    className={cn(fieldClass, 'mt-1.5 w-full', p && 'border-red-500')}
                    onChange={(e) => onChange?.(f.id, e.target.value)}
                  />
                )
              ) : (
                <p className="mt-1 whitespace-pre-wrap rounded-lg bg-[var(--wq-canvas-alt)] px-3 py-2 text-sm text-[var(--wq-text)]">{value || '—'}</p>
              )}
              {editable && range && !p && <p className="mt-1 text-xs text-[var(--wq-text-muted)]">{range}</p>}
              {p && <p role="alert" className="mt-1 text-xs text-red-600">{problemText(p, f)}</p>}
            </div>
          );
        })}
      </div>
    );
  }

  if (kind === 'LINK') {
    const p = problems?.find((x) => x.message === 'url');
    return (
      <div>
        <label htmlFor="a-url" className={label}>
          {t('activity.link')}
        </label>
        {editable ? (
          <input
            id="a-url"
            type="url"
            className={cn(fieldClass, 'mt-1.5 w-full', p && 'border-red-500')}
            placeholder="https://"
            value={answers.url ?? ''}
            onChange={(e) => onChange?.('__url', e.target.value)}
            onFocus={() => onFocusField?.('__url')}
            onBlur={() => onFocusField?.(null)}
          />
        ) : answers.url ? (
          <p className="mt-1 break-all text-sm">
            {/^https?:\/\//i.test(answers.url) ? (
              <a href={answers.url} target="_blank" rel="noopener noreferrer nofollow" className="text-[var(--wq-accent)] hover:underline">
                {answers.url}
              </a>
            ) : (
              answers.url
            )}
          </p>
        ) : (
          <p className="mt-1 text-sm text-[var(--wq-text-muted)]">—</p>
        )}
        {p && <p role="alert" className="mt-1 text-xs text-red-600">{t('activity.problem.url')}</p>}
      </div>
    );
  }

  // FILE: shown by the caller (attach / upload controls), read-only list here.
  return (
    <ul className="space-y-1">
      {(answers.files ?? []).length === 0 ? (
        <li className="text-sm text-[var(--wq-text-muted)]">{t('activity.noFiles')}</li>
      ) : (
        (answers.files ?? []).map((f) => (
          <li key={f.versionId}>
            <a
              href={`/api/workspace-q/files/${f.fileId}/download?version=${f.versionId}`}
              className="text-sm font-medium text-[var(--wq-accent)] hover:underline"
            >
              {f.fileName}
            </a>
          </li>
        ))
      )}
    </ul>
  );
}
