import { SessionContent } from '@/lib/content-schemas';

export const session01: SessionContent = {
  id: 'finance-session-01',
  trackId: 'applied-finance', // Will map to Track in DB
  slug: 'session-01',
  title: 'From Financial Question to Prediction Problem',
  centralQuestion: 'How do we transform a financial idea into a testable prediction problem?',
  summary: 'This session explores how to move from a broad financial question to a clearly defined prediction problem, using research discussion, an interactive deck, and a simple notebook experiment.',
  estimatedMinutes: 120,
  courseLanguage: 'en',
  stages: [
    {
      id: 'stage-prepare',
      order: 1,
      key: 'prepare',
      title: 'Prepare',
      description: 'Arrive with context. The readings and questions below will help you engage more deeply with the session.',
      defaultPlacement: 'before',
      isCore: true,
      blocks: [
        {
          id: 'b-prep-readings',
          type: 'resourceList',
          resources: [
            {
              id: 'reading-01',
              title: 'What Makes a Financial Prediction Useful?',
              description: 'A short research note on the distinction between correlation, prediction, and decision-relevant forecasting in financial contexts.',
            },
            {
              id: 'reading-02',
              title: 'SSRN: Prediction Problem Framing in Finance',
              description: 'A curated excerpt from academic literature on defining well-posed prediction problems in quantitative finance.',
            },
          ]
        },
        {
          id: 'b-prep-q1',
          type: 'openQuestion',
          prompt: 'What is the prediction target in this problem?',
        },
        {
          id: 'b-prep-q2',
          type: 'openQuestion',
          prompt: 'What data would be available before the prediction date?',
        }
      ]
    },
    {
      id: 'stage-explore',
      order: 2,
      key: 'explore',
      title: 'Explore',
      description: 'Work through the interactive teaching deck at your own pace.',
      defaultPlacement: 'in-session',
      isCore: true,
      blocks: [
        {
          id: 'b-exp-deck',
          type: 'embed',
          title: 'Session 01 — Interactive Teaching Deck',
          url: '/courses/finance-data-ai/session-01/deck.html'
        }
      ]
    },
    {
      id: 'stage-experiment',
      order: 3,
      key: 'experiment',
      title: 'Experiment',
      description: 'Run the computational experiment: naive benchmark versus logistic regression for market-stress classification.',
      defaultPlacement: 'in-session',
      isCore: true,
      blocks: [
        {
          id: 'b-expr-lock',
          type: 'predictionLock',
          prompt: 'What do you expect to happen when we run the logistic regression against the naive benchmark, and why?'
        }
        // Additional notebook externalLaunch blocks would go here
      ]
    },
    {
      id: 'stage-build',
      order: 4,
      key: 'build',
      title: 'Build',
      description: 'Translate your work into a structured project artifact: the Prediction Problem Brief.',
      defaultPlacement: 'in-session',
      isCore: true,
      blocks: [
        {
          id: 'b-build-editor',
          type: 'artifactEditor',
          templateId: 'template-prediction-brief'
        }
      ]
    }
  ]
};
