// =============================================================================
// Quanta Foundry — Learning Session Static Data
// Prototype: feature/learning-sessions-prototype
// =============================================================================

import type { LearningSession } from '@/types/learning-session';

export const SESSION_01: LearningSession = {
  id: 'finance-session-01',
  slug: 'session-01',
  track: 'Finance, Data & AI',
  sessionNumber: 1,
  title: 'From Financial Question to Prediction Problem',
  description:
    'This session explores how to move from a broad financial question to a clearly defined prediction problem, using research discussion, an interactive deck, and a simple notebook experiment.',
  status: 'prototype',
  centralQuestion:
    'How do we transform a financial idea into a testable prediction problem?',
  estimatedTime: '90–120 min',
  outputBadges: ['Prediction Problem Brief', 'Experiment Notebook'],
  stages: [
    {
      id: 'prepare',
      title: 'Prepare',
      description:
        'Arrive with context. The readings and questions below will help you engage more deeply with the session.',
      resources: [
        {
          id: 'reading-01',
          type: 'reading',
          title: 'What Makes a Financial Prediction Useful?',
          description:
            'A short research note on the distinction between correlation, prediction, and decision-relevant forecasting in financial contexts.',
          url: undefined,
        },
        {
          id: 'reading-02',
          type: 'link',
          title: 'SSRN: Prediction Problem Framing in Finance',
          description:
            'A curated excerpt from academic literature on defining well-posed prediction problems in quantitative finance.',
          url: undefined,
        },
      ],
      prompts: [
        'What is the prediction target in this problem?',
        'What data would be available before the prediction date?',
        'What would make this prediction useful in practice?',
        'What feature of the data could make the result misleading?',
      ],
    },
    {
      id: 'explore',
      title: 'Explore',
      description:
        'Work through the interactive teaching deck at your own pace. Use it to build a shared vocabulary before running the experiment.',
      resources: [
        {
          id: 'deck-01',
          type: 'deck',
          title: 'Session 01 — Interactive Teaching Deck',
          description:
            'Covers prediction target definition, data labelling, benchmark choice, and evaluation metric selection.',
          url: '/courses/finance-data-ai/session-01/deck.html',
        },
      ],
    },
    {
      id: 'experiment',
      title: 'Experiment',
      description:
        'Run the computational experiment: naive benchmark versus logistic regression for market-stress classification.',
      resources: [
        {
          id: 'notebook-colab',
          type: 'notebook',
          title: 'Open in Google Colab',
          description: 'Pre-configured notebook. No local setup required.',
          url: undefined,
        },
        {
          id: 'notebook-github',
          type: 'notebook',
          title: 'View on GitHub',
          description: 'Browse or fork the source notebook.',
          url: undefined,
        },
        {
          id: 'dataset-01',
          type: 'dataset',
          title: 'Market Stress Dataset',
          description: 'CSV — daily equity and volatility indicators, 2010–2023.',
          url: undefined,
        },
        {
          id: 'method-notes',
          type: 'template',
          title: 'Method Notes & Setup Guide',
          description: 'Step-by-step instructions and variable definitions for the experiment.',
          url: undefined,
        },
      ],
    },
    {
      id: 'interpret',
      title: 'Interpret',
      description:
        'Pause before drawing conclusions. Use these prompts to reason about what the results actually show.',
      prompts: [
        'What patterns do you observe in the model output? Describe what you see numerically.',
        'What might explain the difference in performance between the naive benchmark and the logistic regression?',
        'What does a higher accuracy score not prove about the model?',
        'Which assumption in this experiment matters most to the validity of the result?',
        'What would you design as the next experiment, and why?',
      ],
    },
    {
      id: 'build',
      title: 'Build',
      description:
        'Translate your work into a structured project artifact: the Prediction Problem Brief.',
      resources: [
        {
          id: 'brief-template',
          type: 'template',
          title: 'Prediction Problem Brief — Template',
          description: 'A structured one-page document defining your prediction problem.',
          url: undefined,
        },
      ],
    },
    {
      id: 'reflect',
      title: 'Reflect',
      description:
        'Step back from the result. Critical reflection is how experimental work becomes real knowledge.',
      prompts: [
        'What aspect of this session worked well for your understanding?',
        'What failed or remained genuinely unclear after the experiment?',
        'What remains uncertain, even if the model performed well?',
        'What would you change about the experimental design?',
        'What did the result not prove, even under the best interpretation?',
      ],
    },
    {
      id: 'publish',
      title: 'Publish',
      description:
        'Strong session outputs may be revised into a Quanta Foundry Projects & Notes entry — after review, consent, and attribution confirmation.',
    },
  ],
};

export const LEARNING_SESSIONS: LearningSession[] = [SESSION_01];
