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

export interface LearningStage {
  id: StageId;
  title: string;
  description: string;
  resources?: SessionResource[];
  prompts?: string[];
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
