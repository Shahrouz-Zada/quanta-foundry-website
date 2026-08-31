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
      id: 'stage-interpret',
      order: 4,
      key: 'interpret',
      title: 'Interpret',
      description: 'Pause before drawing conclusions. Use these prompts to reason about what the results actually show.',
      defaultPlacement: 'in-session',
      isCore: true,
      blocks: [
        // NOTE: no predictionReveal block yet. That block's `resultText` is
        // supposed to be the actual outcome of running the Experiment-stage
        // notebook (naive benchmark vs logistic regression) — a real finding
        // from executing it, not something to write ahead of time. Add a
        // block here of the form:
        //   { id: 'b-interp-reveal', type: 'predictionReveal',
        //     linkedPredictionBlockId: 'b-expr-lock', resultText: '<real result>' }
        // once that number exists. The adapter and UI already support it —
        // see PREDICTION_LOCK_UI_WIRING.md.
        {
          id: 'b-interp-q1',
          type: 'openQuestion',
          prompt: 'What patterns do you observe in the model output? Describe what you see numerically.',
        },
        {
          id: 'b-interp-q2',
          type: 'openQuestion',
          prompt: 'What might explain the difference in performance between the naive benchmark and the logistic regression?',
        },
        {
          id: 'b-interp-q3',
          type: 'openQuestion',
          prompt: 'What does a higher accuracy score not prove about the model?',
        },
        {
          id: 'b-interp-q4',
          type: 'openQuestion',
          prompt: 'Which assumption in this experiment matters most to the validity of the result?',
        },
        {
          id: 'b-interp-q5',
          type: 'openQuestion',
          prompt: 'What would you design as the next experiment, and why?',
        },
      ]
    },
    {
      id: 'stage-build',
      order: 5,
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
    },
    {
      id: 'stage-reflect',
      order: 6,
      key: 'reflect',
      title: 'Reflect',
      description: 'Step back from the result. Critical reflection is how experimental work becomes real knowledge.',
      defaultPlacement: 'after',
      isCore: true,
      blocks: [
        {
          id: 'b-reflect-q1',
          type: 'openQuestion',
          prompt: 'What aspect of this session worked well for your understanding?',
        },
        {
          id: 'b-reflect-q2',
          type: 'openQuestion',
          prompt: 'What failed or remained genuinely unclear after the experiment?',
        },
        {
          id: 'b-reflect-q3',
          type: 'openQuestion',
          prompt: 'What remains uncertain, even if the model performed well?',
        },
        {
          id: 'b-reflect-q4',
          type: 'openQuestion',
          prompt: 'What would you change about the experimental design?',
        },
        {
          id: 'b-reflect-q5',
          type: 'openQuestion',
          prompt: 'What did the result not prove, even under the best interpretation?',
        },
      ]
    },
    {
      id: 'stage-publish',
      order: 7,
      key: 'publish',
      title: 'Publish',
      description: 'Strong session outputs may be revised into a Quanta Foundry Projects & Notes entry — after review, consent, and attribution confirmation.',
      defaultPlacement: 'after',
      isCore: false,
      blocks: [
        {
          id: 'b-publish-intro',
          type: 'prose',
          content: 'Publishing is optional and reviewed separately from the six core stages above. Nothing you submit here becomes public without your explicit consent at each step.',
        }
      ]
    }
  ]
};
