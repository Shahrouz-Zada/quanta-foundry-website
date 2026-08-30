// =============================================================================
// Session content adapter
//
// The database stores session content in the authored `SessionContent` shape
// (see src/lib/content-schemas.ts): block-based stages with `key`, `blocks[]`,
// `summary`, `estimatedMinutes`.
//
// The prototype session UI (SessionLayout / StageContent / SessionSidebar) was
// built against a different, earlier shape — `LearningSession` (see
// src/types/learning-session.ts): `stages[].id` is a StageId, with flattened
// `prompts[]` / `resources[]`, plus `status`, `estimatedTime`, `outputBadges`.
//
// These two shapes were previously bridged by an `as any` / `as unknown as`
// cast in the session page, which silenced the mismatch at compile time and
// crashed at runtime with:
//   TypeError: Cannot read properties of undefined (reading 'map')
// (`session.outputBadges` does not exist in the stored content).
//
// This module does the conversion explicitly and defensively, so a missing or
// malformed field degrades to an empty list instead of taking the page down.
// =============================================================================

import type {
  LearningSession,
  LearningStage,
  SessionResource,
  ResourceType,
  StageId,
} from '@/types/learning-session';

/** StageIds the prototype UI knows how to render. */
const VALID_STAGE_IDS: readonly StageId[] = [
  'prepare', 'explore', 'experiment', 'interpret', 'build', 'reflect', 'publish',
];

function isStageId(value: unknown): value is StageId {
  return typeof value === 'string' && (VALID_STAGE_IDS as readonly string[]).includes(value);
}

/** Resource `format` strings seen in authored content -> UI ResourceType. */
const RESOURCE_TYPE_BY_FORMAT: Record<string, ResourceType> = {
  pdf: 'reading',
  reading: 'reading',
  deck: 'deck',
  notebook: 'notebook',
  github: 'notebook',
  dataset: 'dataset',
  template: 'template',
  link: 'link',
};

// Minimal structural views of the stored JSON. Deliberately loose: this data
// comes from a Json column and may predate the current schema.
interface StoredResource {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  url?: unknown;
  format?: unknown;
}

interface StoredBlock {
  id?: unknown;
  type?: unknown;
  prompt?: unknown;
  resources?: unknown;
}

interface StoredStage {
  id?: unknown;
  key?: unknown;
  order?: unknown;
  title?: unknown;
  description?: unknown;
  blocks?: unknown;
}

interface StoredSessionContent {
  id?: unknown;
  slug?: unknown;
  trackId?: unknown;
  title?: unknown;
  centralQuestion?: unknown;
  summary?: unknown;
  estimatedMinutes?: unknown;
  stages?: unknown;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toResource(raw: unknown, index: number): SessionResource | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as StoredResource;
  const title = asString(r.title);
  if (!title) return null;

  const format = asString(r.format).toLowerCase();
  return {
    id: asString(r.id, `resource-${index}`),
    type: RESOURCE_TYPE_BY_FORMAT[format] ?? 'link',
    title,
    description: typeof r.description === 'string' ? r.description : undefined,
    url: typeof r.url === 'string' ? r.url : undefined,
  };
}

function toStage(raw: unknown): LearningStage | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const s = raw as StoredStage;

  // Stored stages carry the UI's StageId in `key` ('prepare'); `id` is a
  // prefixed identifier ('stage-prepare'). Prefer `key`, fall back to
  // stripping the prefix from `id`.
  const keyCandidate = asString(s.key) || asString(s.id).replace(/^stage-/, '');
  if (!isStageId(keyCandidate)) return null;

  const prompts: string[] = [];
  const resources: SessionResource[] = [];

  asArray(s.blocks).forEach((rawBlock, blockIndex) => {
    if (typeof rawBlock !== 'object' || rawBlock === null) return;
    const block = rawBlock as StoredBlock;

    // Both openQuestion and predictionLock present a single free-text prompt
    // and are rendered by the UI's prompt list.
    if (block.type === 'openQuestion' || block.type === 'predictionLock') {
      const prompt = asString(block.prompt);
      if (prompt) prompts.push(prompt);
      return;
    }

    if (block.type === 'resourceList') {
      asArray(block.resources).forEach((rawResource, resourceIndex) => {
        const resource = toResource(rawResource, blockIndex * 100 + resourceIndex);
        if (resource) resources.push(resource);
      });
    }
  });

  return {
    id: keyCandidate,
    title: asString(s.title, keyCandidate),
    description: asString(s.description),
    prompts,
    resources,
  };
}

/**
 * Convert stored session content (Json column) into the shape the prototype
 * session UI renders. Never throws; unknown/missing fields become safe
 * defaults so a content mismatch degrades instead of 500-ing the route.
 */
export function toLearningSession(
  storedContent: unknown,
  options: { sessionNumber?: number } = {}
): LearningSession {
  const content = (
    typeof storedContent === 'object' && storedContent !== null ? storedContent : {}
  ) as StoredSessionContent;

  const stages = asArray(content.stages)
    .map((stage) => toStage(stage))
    .filter((stage): stage is LearningStage => stage !== null);

  const estimatedMinutes =
    typeof content.estimatedMinutes === 'number' ? content.estimatedMinutes : undefined;

  return {
    id: asString(content.id, 'unknown-session'),
    slug: asString(content.slug),
    track: asString(content.trackId),
    sessionNumber: options.sessionNumber ?? 1,
    title: asString(content.title, 'Untitled session'),
    // The stored schema calls this `summary`; the UI calls it `description`.
    description: asString(content.summary),
    // Stored content has no lifecycle field; anything served to a learner is
    // by definition an active session.
    status: 'active',
    centralQuestion: asString(content.centralQuestion),
    estimatedTime: estimatedMinutes ? `${estimatedMinutes} min` : '',
    // Not present in the stored schema at all — this is the field whose
    // absence caused the production crash.
    outputBadges: [],
    stages,
  };
}
