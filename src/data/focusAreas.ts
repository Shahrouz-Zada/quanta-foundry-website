// =============================================================================
// Quanta Foundry — Focus Areas Data
// Future CMS collection: 'focus-areas'
// =============================================================================

import { FocusArea } from '@/types';

export const focusAreas: FocusArea[] = [
  {
    id: 'applied-ai-ml',
    slug: 'applied-ai-machine-learning',
    title: 'Applied AI & Machine Learning',
    shortTitle: 'Applied AI & ML',
    description:
      'Applied AI methods for prediction, automation, document intelligence, decision support, and domain-specific modeling, explored through readings, notebooks, datasets, and project-based work.',
    tags: ['Predictive Modeling', 'NLP & LLMs', 'Computer Vision', 'MLOps'],
    longDescription:
      'This focus area explores how applied AI and machine learning can support prediction, automation, document intelligence, decision support, and domain-specific modeling. Through Workspace Q projects, reading discussions, and selected partner use cases, contributors explore datasets, build prototype workflows, evaluate models, and document practical findings.',
    icon: 'Brain',
    status: 'active',
    engagementModel: {
      durationLabel: 'Project Cycle',
      duration: '8–12 weeks',
      commitmentLabel: 'Format',
      commitment: 'Part-time technical collaboration',
      deliveryLabel: 'Delivery',
      delivery: 'Hybrid, Paris and remote',
      teamScaleLabel: 'Team Scale',
      teamScale: 'Small selected project teams',
    },
    technicalTracks: [
      {
        title: 'Machine Learning Foundations for Applied Systems',
        description:
          'Rigorous statistical and mathematical foundation for modern ML systems.',
        topics: [
          'Supervised & unsupervised learning paradigms',
          'Statistical learning theory & bias-variance tradeoff',
          'Feature engineering & dimensionality reduction',
          'Model selection, cross-validation & evaluation metrics',
        ],
        phase: 'Phase 1',
      },
      {
        title: 'Deep Learning & Neural Architectures',
        description:
          'Design and training of deep neural networks for structured and unstructured data.',
        topics: [
          'Neural network fundamentals & backpropagation',
          'CNNs, RNNs, LSTMs & attention mechanisms',
          'Transformers & large language models',
          'Model training, evaluation, and optimization workflows',
        ],
        phase: 'Phase 2',
      },
      {
        title: 'NLP, LLMs, Computer Vision & Applied AI',
        description:
          'State-of-the-art model applications to real-world natural language and vision tasks.',
        topics: [
          'Text classification, NER & sentiment analysis',
          'Image segmentation, object detection & generative models',
          'Transfer learning & fine-tuning foundation models',
          'MLOps: CI/CD for ML, model monitoring & drift detection',
        ],
        phase: 'Phase 3',
      },
      {
        title: 'Applied Industry Sprint',
        description:
          'Focused work on a real or simulated business problem to produce a prototype, technical report, and deployment roadmap.',
        topics: [
          'Problem scoping & data strategy',
          'End-to-end ML pipeline development',
          'Stakeholder communication & technical presentation',
          'Deployment, documentation & handoff',
        ],
        phase: 'Phase 4',
      },
    ],
    outcomes: [
      'Design prototype AI workflows from data preparation to model evaluation',
      'Evaluate and select appropriate models for complex industry problems',
      'Apply deep learning to NLP, vision, and structured data tasks',
      'Understand deployment, monitoring, and reproducibility considerations for applied AI systems',
      'Communicate technical findings with strategic clarity for business or research stakeholders',
    ],
    requirements: [
      'Working knowledge of Python programming',
      'Familiarity with linear algebra, probability, and statistics',
      'Interest in applied AI, data systems, or quantitative modeling',
      'Availability for structured project collaboration',
    ],
    statusLabel: 'Participation Paths',
    statusText: 'Workspace Q Projects + Partner Use Cases',
    ctas: [
      {
        target: 'For partners:',
        description: 'Propose an Applied AI use case, dataset, or technical challenge for future Workspace Q collaboration.',
        buttonText: 'Propose a Use Case',
        buttonLink: '/companies',
      },
      {
        target: 'For selected contributors:',
        description: 'Apply to join Workspace Q and participate in project-based technical work.',
        buttonText: 'Enter Workspace Q',
        buttonLink: '/workspace-q',
      }
    ],
    accentColor: '#4A90E2',
  },
  {
    id: 'quantitative-finance',
    slug: 'quantitative-finance',
    title: 'Quantitative Finance & Risk Analytics',
    shortTitle: 'Quantitative Finance & Risk Analytics',
    description:
      'Quantitative methods for market analysis, risk modeling, portfolio research, stress testing, and financial decision systems, explored through simulations, case studies, and applied research.',
    tags: ['Risk Modeling', 'Time Series', 'Portfolio Analytics', 'Market Simulation'],
    longDescription:
      'This focus area explores quantitative methods for market analysis, risk modeling, portfolio research, stress testing, and financial decision-support systems. Through Workspace Q projects, reading discussions, simulations, and selected partner use cases, contributors test models on realistic financial data and translate quantitative research into technical notes, prototypes, and analytical reports.',
    icon: 'TrendingUp',
    status: 'active',
    engagementModel: {
      durationLabel: 'Project Cycle',
      duration: '8–10 weeks',
      commitmentLabel: 'Format',
      commitment: 'Part-time technical collaboration',
      deliveryLabel: 'Delivery',
      delivery: 'Hybrid, Paris and remote',
      teamScaleLabel: 'Team Scale',
      teamScale: 'Small selected project teams',
    },
    technicalTracks: [
      {
        title: 'Statistical Modeling for Financial Systems',
        description:
          'Statistical and probabilistic methods used to model financial time series, uncertainty, and market behavior.',
        topics: [
          'Time series analysis and stochastic processes',
          'Volatility modeling and risk estimation',
          'Monte Carlo simulation methods',
          'Bayesian inference for financial modeling',
        ],
        phase: 'Phase 1',
      },
      {
        title: 'Market Microstructure & Execution Analytics',
        description:
          'Quantitative analysis of order books, execution dynamics, transaction costs, and market structure.',
        topics: [
          'Market microstructure and order book dynamics',
          'Execution analytics and transaction cost analysis',
          'Factor models and systematic strategy research',
          'Backtesting frameworks and performance attribution',
        ],
        phase: 'Phase 2',
      },
      {
        title: 'Risk Modeling & Portfolio Analytics',
        description:
          'Quantitative tools for risk measurement, stress testing, allocation research, and portfolio analytics.',
        topics: [
          'Value-at-Risk, expected shortfall, CVaR and stress testing',
          'Mean-variance optimization and Black-Litterman model',
          'Credit risk modeling and derivatives pricing',
          'Regulatory risk concepts, Basel III/IV and market risk requirements',
        ],
        phase: 'Phase 3',
      },
      {
        title: 'Applied Market Simulation Sprint',
        description:
          'Focused work on realistic market datasets to build analytics prototypes, test assumptions, and present research findings.',
        topics: [
          'Research design using historical or simulated market data',
          'Portfolio construction and risk management scenarios',
          'Performance analysis and attribution',
          'Final technical report and stakeholder presentation',
        ],
        phase: 'Phase 4',
      },
    ],
    outcomes: [
      'Build prototype quantitative analytics workflows for market and risk analysis',
      'Backtest and evaluate systematic research ideas responsibly',
      'Design portfolio and risk analytics prototypes',
      'Apply stochastic and statistical methods to financial datasets',
      'Communicate quantitative findings to business, research, or risk stakeholders',
    ],
    requirements: [
      'Strong quantitative background in mathematics, physics, engineering, finance, or a related field',
      'Programming experience in Python or R',
      'Basic understanding of financial markets and instruments',
      'Familiarity with statistics, probability, or time series analysis',
      'Availability for structured project collaboration',
    ],
    statusLabel: 'Participation Paths',
    statusText: 'Workspace Q Projects + Partner Use Cases',
    ctas: [
      {
        target: 'For partners:',
        description: 'Propose a quantitative finance, risk analytics, or market research use case for future Workspace Q collaboration.',
        buttonText: 'Propose a Use Case',
        buttonLink: '/companies',
      },
      {
        target: 'For selected contributors:',
        description: 'Apply to join Workspace Q and participate in project-based quantitative research work.',
        buttonText: 'Enter Workspace Q',
        buttonLink: '/workspace-q',
      }
    ],
    accentColor: '#4A90E2',
  },
  {
    id: 'quantum-software',
    slug: 'quantum-software-engineering',
    title: 'Quantum Software & Hybrid Algorithms',
    shortTitle: 'Quantum Software',
    description:
      'An exploratory future track on quantum programming, hybrid quantum-classical algorithms, optimization, and potential applications in AI, finance, and scientific computing.',
    tags: ['Quantum Programming', 'Variational Algorithms', 'Hybrid Models', 'Optimization'],
    longDescription:
      'This future track explores quantum software, hybrid quantum-classical methods, optimization workflows, and potential applications in AI, finance, and scientific computing. The initial emphasis is on simulations, technical literacy, prototype notebooks, and exploratory research notes, rather than production deployment claims.',
    icon: 'Atom',
    status: 'coming-soon',
    engagementModel: {
      durationLabel: 'Exploratory Cycle',
      duration: '6–8 weeks',
      commitmentLabel: 'Format',
      commitment: 'Exploratory technical collaboration',
      deliveryLabel: 'Delivery',
      delivery: 'Remote-first, optional Paris sessions',
      teamScaleLabel: 'Team Scale',
      teamScale: 'Small selected research groups',
    },
    technicalTracks: [
      {
        title: 'Quantum Software Foundations',
        description:
          'Foundations of quantum information, circuits, measurement, and the current limits of quantum computing.',
        topics: [
          'Qubits, superposition, entanglement, and measurement',
          'Quantum circuits and computational models',
          'Quantum simulators and cloud-accessible quantum platforms',
          'Current hardware landscape and practical limitations',
        ],
        phase: 'Phase 1',
      },
      {
        title: 'Quantum Algorithms & Circuit Prototyping',
        description:
          'Prototype-level implementation of foundational quantum algorithms and circuit-based workflows.',
        topics: [
          'Grover’s search and amplitude amplification',
          'Quantum Fourier transform and phase estimation concepts',
          'Variational quantum eigensolver, VQE',
          'Quantum approximate optimization algorithm, QAOA',
        ],
        phase: 'Phase 2',
      },
      {
        title: 'Hybrid Quantum-Classical Models',
        description:
          'Exploratory work on hybrid quantum-classical models and their potential role in future AI systems.',
        topics: [
          'Quantum kernels and support vector machines',
          'Parameterized quantum circuits',
          'Quantum generative models, exploratory level',
          'Hybrid classical-quantum architectures',
        ],
        phase: 'Phase 3',
      },
      {
        title: 'Exploratory Use Cases & Research Notes',
        description:
          'Early-stage exploration of where quantum software may become relevant for optimization, simulation, AI, and financial research.',
        topics: [
          'Optimization and portfolio research concepts',
          'Simulation and computational chemistry examples',
          'AI and finance-oriented feasibility studies',
          'Technical notes, benchmarks, and research summaries',
        ],
        phase: 'Phase 4',
      },
    ],
    outcomes: [
      'Understand the foundations of quantum software and current hardware limitations',
      'Build and test basic quantum circuits using Python-based frameworks',
      'Explore hybrid quantum-classical algorithms at prototype level',
      'Evaluate where quantum methods may or may not offer practical value',
      'Produce technical notes, prototype notebooks, and feasibility summaries',
    ],
    requirements: [
      'Strong interest in quantum computing, AI, optimization, or mathematical modeling',
      'Working knowledge of Python',
      'Comfort with linear algebra, probability, or willingness to prepare',
      'No prior quantum physics background required',
      'Availability for structured exploratory collaboration',
    ],
    statusLabel: 'Participation Paths',
    statusText: 'Future Track',
    ctas: [
      {
        target: 'For partners:',
        description: 'Register interest in future exploratory discussions around quantum software, hybrid algorithms, optimization, or scientific computing.',
        buttonText: 'Register Interest',
        buttonLink: '/companies',
      },
      {
        target: 'For selected contributors:',
        description: 'Apply to join Workspace Q and participate in early exploratory quantum software readings, notebooks, and research activities.',
        buttonText: 'Enter Workspace Q',
        buttonLink: '/workspace-q',
      }
    ],
    accentColor: '#D4AF37',
  },
];
