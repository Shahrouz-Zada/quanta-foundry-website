import { z } from 'zod';

// ============================================================================
// Workspace Q Content Schemas
// Defines the strict shape of immutable course content authored in the repository.
// ============================================================================

export const BlockSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string(),
    type: z.literal('prose'),
    content: z.string(), // Markdown or HTML
  }),
  z.object({
    id: z.string(),
    type: z.literal('resourceList'),
    resources: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      url: z.string().optional(),
      format: z.string().optional(), // pdf, github, link
    })),
  }),
  z.object({
    id: z.string(),
    type: z.literal('openQuestion'),
    prompt: z.string(),
    placeholder: z.string().optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('predictionLock'),
    prompt: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('predictionReveal'),
    linkedPredictionBlockId: z.string(), // ID of the lock block to display next to the result
    resultText: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('embed'),
    url: z.string(),
    title: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('artifactEditor'),
    templateId: z.string(),
  }),
  z.object({
    id: z.string(),
    type: z.literal('checklist'),
    items: z.array(z.object({
      id: z.string(),
      label: z.string(),
    })),
  }),
]);

export type Block = z.infer<typeof BlockSchema>;

export const StageSchema = z.object({
  id: z.string(),
  order: z.number(),
  key: z.string(), // prepare | explore | experiment | build ...
  title: z.string(),
  description: z.string(),
  defaultPlacement: z.enum(['before', 'in-session', 'after']),
  estimatedMinutes: z.number().optional(),
  isCore: z.boolean().default(true),
  blocks: z.array(BlockSchema),
  // requirements: z.array(RequirementSchema).optional(), // To be defined later
});

export type Stage = z.infer<typeof StageSchema>;

export const SessionContentSchema = z.object({
  id: z.string(), // Stable ID across versions
  trackId: z.string(),
  slug: z.string(),
  title: z.string(),
  centralQuestion: z.string(),
  summary: z.string(),
  estimatedMinutes: z.number().optional(),
  courseLanguage: z.enum(['en', 'fr']),
  stages: z.array(StageSchema),
});

export type SessionContent = z.infer<typeof SessionContentSchema>;
