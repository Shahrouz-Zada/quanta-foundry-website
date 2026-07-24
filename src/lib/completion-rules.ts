// =============================================================================
// Completion Rules — per-stage minimum requirements for the prototype
// A checkmark = the learner met real criteria AND clicked confirm.
// Opening a stage never creates a checkmark.
// =============================================================================

import type { StageId } from '@/types/learning-session';

// ── State required by the completion checks ───────────────────────────────────

export interface CompletionState {
  // Prepare
  prepareAnswers:    string[];

  // Explore
  exploreConfirmed:  boolean;
  deckAvailable:     boolean;   // false until deck.html is deployed

  // Experiment
  experimentConfirmed: boolean;
  experimentUrl:       string;
  experimentResourceAvailable: boolean; // false until at least one URL is set

  // Interpret
  interpretAnswers:  string[];

  // Build
  buildConfirmed:    boolean;

  // Reflect
  reflectAnswers:    string[];
}

// ── Minimum meaningful answer length (trimmed) ────────────────────────────────

export const MIN_ANSWER_LEN = 20;

// ── Requirement descriptors ───────────────────────────────────────────────────

export interface Requirement {
  key:   string;  // i18n message key for the label
  isMet: (state: CompletionState) => boolean;
}

type CompletionMode = 'auto' | 'manual' | 'hybrid';

export interface StageCompletionRule {
  stageId:      StageId;
  mode:         CompletionMode;
  requirements: Requirement[];
  canComplete:  (state: CompletionState) => boolean;
}

// ── Rules ─────────────────────────────────────────────────────────────────────

export const COMPLETION_RULES: Record<StageId, StageCompletionRule> = {

  // Prepare — one meaningful pre-session answer (≥ 20 trimmed chars)
  // Reading resources are not yet active, so acknowledgement is NOT required.
  prepare: {
    stageId: 'prepare',
    mode:    'hybrid',
    requirements: [
      {
        key:   'req.prepare.answer',
        isMet: (s) =>
          s.prepareAnswers.some((a) => a.trim().length >= MIN_ANSWER_LEN),
      },
    ],
    canComplete: (s) =>
      s.prepareAnswers.some((a) => a.trim().length >= MIN_ANSWER_LEN),
  },

  // Explore — teaching deck must be available AND the learner confirms review.
  // When deck is unavailable, confirmation is disabled.
  explore: {
    stageId: 'explore',
    mode:    'hybrid',
    requirements: [
      {
        key:   'req.explore.manual',
        // Not met when deck is unavailable (regardless of exploreConfirmed)
        isMet: (s) => s.deckAvailable && s.exploreConfirmed,
      },
    ],
    canComplete: (s) => s.deckAvailable && s.exploreConfirmed,
  },

  // Experiment — at least one real resource must be available before any
  // confirmation or completion is permitted.
  experiment: {
    stageId: 'experiment',
    mode:    'hybrid',
    requirements: [
      {
        key:   'req.experiment.confirm',
        isMet: (s) => s.experimentResourceAvailable && s.experimentConfirmed,
      },
    ],
    canComplete: (s) => s.experimentResourceAvailable && s.experimentConfirmed,
  },

  // Interpret — every prompt answered with ≥ 20 trimmed chars + intentional action.
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

  // Build — learner acknowledges reviewing the Brief structure.
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

  // Reflect — every prompt answered with ≥ 20 trimmed chars + intentional action.
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

  // Publish — optional, tracked separately. Never contributes to 6-stage count.
  publish: {
    stageId: 'publish',
    mode:    'manual',
    requirements: [],
    canComplete:  () => false, // Controlled via publishState in SessionLayout
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** The 6 core stages that count toward progress. Publish is excluded. */
export const CORE_STAGE_IDS: StageId[] = [
  'prepare', 'explore', 'experiment', 'interpret', 'build', 'reflect',
];

/** Count how many core stages are completed */
export function countCoreCompleted(completedStages: Set<StageId>): number {
  return CORE_STAGE_IDS.filter((id) => completedStages.has(id)).length;
}
