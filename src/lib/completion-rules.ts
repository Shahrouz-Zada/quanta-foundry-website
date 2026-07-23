// =============================================================================
// Completion Rules — per-stage minimum requirements for the prototype
// A checkmark in the sidebar means the learner has met real criteria,
// not merely opened a stage.
// =============================================================================

import type { StageId } from '@/types/learning-session';

// ── State required by the completion checks ───────────────────────────────────

export interface CompletionState {
  prepareReadingAcknowledged: boolean;
  prepareAnswers:    string[];
  exploreConfirmed:  boolean;
  experimentConfirmed: boolean;
  experimentUrl:     string;
  interpretAnswers:  string[];
  buildConfirmed:    boolean;
  reflectAnswers:    string[];
}

// Minimum meaningful answer length (trimmed)
export const MIN_ANSWER_LEN = 20;
export const MIN_PREPARE_LEN = 20;

// ── Requirement descriptors (keys → i18n message keys) ───────────────────────

export interface Requirement {
  key:   string; // i18n message key for the label
  isMet: (state: CompletionState) => boolean;
}

type CompletionMode = 'auto' | 'manual' | 'hybrid';

export interface StageCompletionRule {
  stageId:      StageId;
  mode:         CompletionMode;
  requirements: Requirement[];
  /** Returns true only when ALL requirements pass */
  canComplete:  (state: CompletionState) => boolean;
}

// ── Rules ─────────────────────────────────────────────────────────────────────

export const COMPLETION_RULES: Record<StageId, StageCompletionRule> = {
  prepare: {
    stageId: 'prepare',
    mode:    'hybrid',
    requirements: [
      {
        key:   'req.prepare.reading',
        isMet: (s) => s.prepareReadingAcknowledged,
      },
      {
        key:   'req.prepare.answer',
        isMet: (s) =>
          s.prepareAnswers.some((a) => a.trim().length >= MIN_PREPARE_LEN),
      },
    ],
    canComplete: (s) =>
      s.prepareReadingAcknowledged &&
      s.prepareAnswers.some((a) => a.trim().length >= MIN_PREPARE_LEN),
  },

  explore: {
    stageId: 'explore',
    mode:    'manual',
    requirements: [
      {
        key:   'req.explore.manual',
        isMet: (s) => s.exploreConfirmed,
      },
    ],
    canComplete: (s) => s.exploreConfirmed,
  },

  experiment: {
    stageId: 'experiment',
    mode:    'hybrid',
    requirements: [
      {
        key:   'req.experiment.confirm',
        isMet: (s) => s.experimentConfirmed,
      },
    ],
    canComplete: (s) => s.experimentConfirmed,
  },

  interpret: {
    stageId: 'interpret',
    mode:    'hybrid',
    requirements: [
      {
        key:   'req.interpret.prompts',
        isMet: (s) =>
          s.interpretAnswers.length > 0 &&
          s.interpretAnswers.every((a) => a.trim().length >= MIN_ANSWER_LEN),
      },
    ],
    canComplete: (s) =>
      s.interpretAnswers.length > 0 &&
      s.interpretAnswers.every((a) => a.trim().length >= MIN_ANSWER_LEN),
  },

  build: {
    stageId: 'build',
    mode:    'manual',
    requirements: [
      {
        key:   'req.build.confirm',
        isMet: (s) => s.buildConfirmed,
      },
    ],
    canComplete: (s) => s.buildConfirmed,
  },

  reflect: {
    stageId: 'reflect',
    mode:    'hybrid',
    requirements: [
      {
        key:   'req.reflect.prompts',
        isMet: (s) =>
          s.reflectAnswers.length > 0 &&
          s.reflectAnswers.every((a) => a.trim().length >= MIN_ANSWER_LEN),
      },
    ],
    canComplete: (s) =>
      s.reflectAnswers.length > 0 &&
      s.reflectAnswers.every((a) => a.trim().length >= MIN_ANSWER_LEN),
  },

  // Publish is optional — tracked separately, not counted in 6/6 progress
  publish: {
    stageId: 'publish',
    mode:    'manual',
    requirements: [],
    canComplete: () => false, // controlled via publishState in SessionLayout
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** The 6 core stages that count toward progress */
export const CORE_STAGE_IDS: StageId[] = [
  'prepare', 'explore', 'experiment', 'interpret', 'build', 'reflect',
];

/** Count how many core stages are completed */
export function countCoreCompleted(completedStages: Set<StageId>): number {
  return CORE_STAGE_IDS.filter((id) => completedStages.has(id)).length;
}
