// =============================================================================
// Quanta Foundry — Learning Session Types
// Prototype: feature/learning-sessions-prototype
// =============================================================================

export type StageId =
  | 'prepare'
  | 'explore'
  | 'experiment'
  | 'interpret'
  | 'build'
  | 'reflect'
  | 'publish';

export type ResourceType =
  | 'reading'
  | 'deck'
  | 'notebook'
  | 'dataset'
  | 'template'
  | 'link';

export interface SessionResource {
  id: string;
  type: ResourceType;
  title: string;
  description?: string;
  /** Must be a same-domain relative path (e.g. /courses/...) or undefined */
  url?: string;
}

/**
 * A single-response prompt block. Carries the real content block ID (not a
 * UI-invented one) so the caller can address the exact Response row this
 * prompt maps to — required for saveResponseAction/lockPredictionAction to
 * target the right record.
 */
export interface PromptItem {
  blockId: string;
  type: 'openQuestion' | 'predictionLock';
  prompt: string;
}

/**
 * The Interpret-stage counterpart to a predictionLock block: shows the
 * actual outcome next to the prediction the learner locked earlier.
 * `linkedBlockId` is the predictionLock block's ID this reveal refers to.
 */
export interface PredictionReveal {
  blockId: string;
  linkedBlockId: string;
  resultText: string;
}

export interface LearningStage {
  id: StageId;
  title: string;
  description: string;
  /**
   * Whether this stage counts toward the session's core-progress total.
   * Carried through from the authored content's `Stage.isCore` (see
   * content-schemas.ts) — the UI derives "how many stages", "how many are
   * core", and "which are optional" from this per-session, per-stage flag
   * rather than assuming a fixed 6-core-plus-Publish shape.
   */
  isCore: boolean;
  resources?: SessionResource[];
  prompts?: PromptItem[];
  reveals?: PredictionReveal[];
}

export interface LearningSession {
  id: string;
  slug: string;
  track: string;
  sessionNumber: number;
  title: string;
  description: string;
  status: 'prototype' | 'active' | 'archived';
  centralQuestion: string;
  estimatedTime: string;
  outputBadges: string[];
  stages: LearningStage[];
}

/**
 * Prediction Problem Brief content — the Build-stage Project artifact.
 * Lives here (not in content-schemas.ts) because it is NOT authored
 * SessionContent; it's the learner's own work product, persisted via
 * Project -> Artifact -> ArtifactVersion (see saveLearnerBrief in dal.ts).
 * The eight keys correspond 1:1 to BRIEF_FIELDS in ArtifactPanel.tsx.
 */
export interface BriefContent {
  problemStatement:  string;
  targetVariable:    string;
  predictionHorizon: string;
  availableData:     string;
  benchmarkModel:    string;
  evaluationMetric:  string;
  mainLimitation:    string;
  nextExperiment:    string;
}

export const EMPTY_BRIEF: BriefContent = {
  problemStatement:  '',
  targetVariable:    '',
  predictionHorizon: '',
  availableData:     '',
  benchmarkModel:    '',
  evaluationMetric:  '',
  mainLimitation:    '',
  nextExperiment:    '',
};
