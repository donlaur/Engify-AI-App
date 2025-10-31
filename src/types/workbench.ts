/**
 * Workbench Tool Types
 * DRY definitions for all workbench tools
 */

export type WorkbenchToolId = 
  | 'token-counter'
  | 'prompt-optimizer'
  | 'model-comparison'
  | 'knowledge-navigator'
  | 'prompt-tester'
  | 'okr-workbench'
  | 'retrospective-diagnostician'
  | 'tech-debt-strategist'
  | 'rice-calculator'
  | 'pr-description-generator'
  | 'strategic-alignment-quadrant'
  | 'incident-response-planner'
  | 'hiring-decision-framework'
  | 'architecture-decision-records'
  | 'performance-review-assistant'
  | 'team-health-check'
  | 'sprint-planning-assistant'
  | 'cost-benefit-analyzer'
  | 'risk-assessment-framework'
  | 'stakeholder-communication-planner'
  | 'darci-decision-framework'
  | 'raci-responsibility-matrix'
  | 'value-effort-matrix'
  | 'build-buy-decision';

export interface WorkbenchTool {
  id: WorkbenchToolId;
  name: string;
  description: string;
  icon: string;
  category: 'analysis' | 'optimization' | 'testing' | 'execution' | 'strategy';
  requiresBackend: boolean;
  comingSoon?: boolean;
  features: string[];
  contractId?: string;
}

export const WORKBENCH_TOOLS: Record<WorkbenchToolId, WorkbenchTool> = {
  'token-counter': {
    id: 'token-counter',
    name: 'Token Counter & Cost Estimator',
    description: 'Calculate tokens and estimate costs across all AI models',
    icon: 'hash',
    category: 'analysis',
    requiresBackend: false,
    features: [
      'Real-time token counting',
      'Cost comparison (8 models)',
      'Optimization tips',
      'Context window warnings',
      'Cheapest model recommendation',
    ],
  },
  'prompt-optimizer': {
    id: 'prompt-optimizer',
    name: 'Prompt Optimizer',
    description: 'Automatically improve prompts using best practices and patterns',
    icon: 'sparkles',
    category: 'optimization',
    requiresBackend: false,
    comingSoon: false,
    contractId: 'contract/prompt-optimizer@1',
    features: [
      'Rule-based optimization',
      'Pattern application',
      'Before/after comparison',
      'Improvement explanations',
      'Copy optimized prompt',
    ],
  },
  'model-comparison': {
    id: 'model-comparison',
    name: 'Multi-Model Comparison',
    description: 'Run same prompt across multiple AI models and compare results',
    icon: 'gitCompare',
    category: 'execution',
    requiresBackend: true,
    comingSoon: true,
    contractId: 'contract/model-comparison@1',
    features: [
      'Parallel execution',
      'Side-by-side comparison',
      'Quality metrics',
      'Speed & cost analysis',
      'Export results',
    ],
  },
  'knowledge-navigator': {
    id: 'knowledge-navigator',
    name: 'Knowledge Navigator (RAG)',
    description: 'Upload documents and ask questions with AI-powered answers',
    icon: 'fileSearch',
    category: 'execution',
    requiresBackend: true,
    comingSoon: true,
    contractId: 'contract/knowledge-navigator@1',
    features: [
      'Document upload (PDF, TXT, MD)',
      'Semantic search',
      'Source citations',
      'Chat interface',
      'Multiple documents',
    ],
  },
  'prompt-tester': {
    id: 'prompt-tester',
    name: 'Prompt Tester',
    description: 'Test prompts with multiple inputs and grade results automatically',
    icon: 'testTube',
    category: 'testing',
    requiresBackend: true,
    comingSoon: true,
    contractId: 'contract/prompt-tester@1',
    features: [
      'Batch testing',
      'A-F grading system',
      'Test case management',
      'Statistics & insights',
      'Export test reports',
    ],
  },
  'okr-workbench': {
    id: 'okr-workbench',
    name: 'OKR Workbench',
    description: 'Create effective Objectives and Key Results with AI-powered guidance',
    icon: 'target',
    category: 'strategy',
    requiresBackend: false,
    features: [
      'OKR template generation',
      'Progress tracking forms',
      'Stakeholder communication',
      'Success metrics planning',
      'Export to PDF/Word',
    ],
  },
  'retrospective-diagnostician': {
    id: 'retrospective-diagnostician',
    name: 'Retrospective Diagnostician',
    description: 'Design effective retrospectives tailored to your team\'s specific needs',
    icon: 'users',
    category: 'strategy',
    requiresBackend: false,
    features: [
      'Team assessment tools',
      'Format recommendations',
      'Facilitation guides',
      'Action item templates',
      'Success metrics',
    ],
  },
  'tech-debt-strategist': {
    id: 'tech-debt-strategist',
    name: 'Tech Debt Strategist',
    description: 'Build compelling business cases for technical debt remediation',
    icon: 'wrench',
    category: 'strategy',
    requiresBackend: false,
    features: [
      'Business case generation',
      'ROI calculations',
      'Risk assessment',
      'Stakeholder communication',
      'Implementation planning',
    ],
  },
  'rice-calculator': {
    id: 'rice-calculator',
    name: 'RICE Scoring Calculator',
    description: 'Calculate RICE scores (Reach, Impact, Confidence, Effort) for prioritization',
    icon: 'calculator',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'RICE formula calculator',
      'Priority scoring',
      'Comparison matrix',
      'Export results',
      'Historical tracking',
    ],
  },
  'pr-description-generator': {
    id: 'pr-description-generator',
    name: 'PR Description Generator',
    description: 'Create comprehensive PR descriptions with context and testing notes',
    icon: 'gitCompare',
    category: 'optimization',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'PR template generation',
      'Change description',
      'Testing checklist',
      'Review guidance',
      'Copy-ready format',
    ],
  },
  'strategic-alignment-quadrant': {
    id: 'strategic-alignment-quadrant',
    name: 'Strategic Alignment Quadrant',
    description: 'Categorize initiatives into quadrants for strategic decision-making',
    icon: 'compass',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'Initiative categorization',
      'Quadrant visualization',
      'Strategic recommendations',
      'Priority matrix',
      'Export summary',
    ],
  },
  'incident-response-planner': {
    id: 'incident-response-planner',
    name: 'Incident Response Planner',
    description: 'Create structured incident response plans and runbooks',
    icon: 'alertTriangle',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'Incident template generation',
      'Response procedures',
      'Stakeholder communication',
      'Post-mortem structure',
      'Prevention planning',
    ],
  },
  'hiring-decision-framework': {
    id: 'hiring-decision-framework',
    name: 'Hiring Decision Framework',
    description: 'Structured framework for hiring decisions (juniors vs seniors, team fit)',
    icon: 'users',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'Decision matrix',
      'Cost-benefit analysis',
      'Team impact assessment',
      'ROI calculations',
      'Recommendation summary',
    ],
  },
  'architecture-decision-records': {
    id: 'architecture-decision-records',
    name: 'ADR Generator',
    description: 'Generate Architecture Decision Records with context and alternatives',
    icon: 'file',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'ADR template generation',
      'Context documentation',
      'Alternatives analysis',
      'Decision rationale',
      'Markdown export',
    ],
  },
  'performance-review-assistant': {
    id: 'performance-review-assistant',
    name: 'Performance Review Assistant',
    description: 'Create comprehensive performance reviews with examples and feedback',
    icon: 'star',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'Review template generation',
      'Example collection',
      'Feedback structuring',
      'Growth plan creation',
      'Export formats',
    ],
  },
  'team-health-check': {
    id: 'team-health-check',
    name: 'Team Health Check',
    description: 'Assess team health and identify improvement areas',
    icon: 'heart',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'Health assessment questionnaire',
      'Score calculation',
      'Improvement recommendations',
      'Tracking over time',
      'Action plan generation',
    ],
  },
  'sprint-planning-assistant': {
    id: 'sprint-planning-assistant',
    name: 'Sprint Planning Assistant',
    description: 'Facilitate sprint planning with capacity and priority guidance',
    icon: 'calendar',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'Capacity planning',
      'Story point estimation',
      'Priority recommendations',
      'Sprint goal formulation',
      'Risk identification',
    ],
  },
  'cost-benefit-analyzer': {
    id: 'cost-benefit-analyzer',
    name: 'Cost-Benefit Analyzer',
    description: 'Analyze costs and benefits of technical decisions',
    icon: 'dollarSign',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'Cost calculation',
      'Benefit quantification',
      'ROI analysis',
      'Risk assessment',
      'Decision framework',
    ],
  },
  'risk-assessment-framework': {
    id: 'risk-assessment-framework',
    name: 'Risk Assessment Framework',
    description: 'Identify and assess risks for projects and initiatives',
    icon: 'shield',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'Risk identification',
      'Impact assessment',
      'Probability analysis',
      'Mitigation planning',
      'Risk register export',
    ],
  },
  'stakeholder-communication-planner': {
    id: 'stakeholder-communication-planner',
    name: 'Stakeholder Communication Planner',
    description: 'Plan effective communication strategies for stakeholders',
    icon: 'messageSquare',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'Stakeholder mapping',
      'Message templates',
      'Communication timing',
      'Channel selection',
      'Feedback collection',
    ],
  },
  'darci-decision-framework': {
    id: 'darci-decision-framework',
    name: 'DARCI Decision Framework',
    description: 'Define decision roles: Driver, Approver, Recommender, Consulted, Informed',
    icon: 'users',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'Role assignment matrix',
      'Decision ownership clarity',
      'Stakeholder mapping',
      'Communication plan',
      'Template export',
    ],
  },
  'raci-responsibility-matrix': {
    id: 'raci-responsibility-matrix',
    name: 'RACI Responsibility Matrix',
    description: 'Clarify roles: Responsible, Accountable, Consulted, Informed',
    icon: 'layers',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'Responsibility assignment',
      'Accountability clarity',
      'Role conflict detection',
      'Matrix visualization',
      'Export to spreadsheet',
    ],
  },
  'value-effort-matrix': {
    id: 'value-effort-matrix',
    name: 'Value vs. Effort Matrix',
    description: 'Categorize initiatives into Quick Wins, Big Bets, Fill-ins, Time Sinks',
    icon: 'target',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'Quadrant categorization',
      'Visual matrix',
      'Priority recommendations',
      'Comparison view',
      'Export summary',
    ],
  },
  'build-buy-decision': {
    id: 'build-buy-decision',
    name: 'Build vs. Buy Decision Framework',
    description: 'Decide whether to build custom or buy/integrate existing solutions',
    icon: 'gitCompare',
    category: 'strategy',
    requiresBackend: false,
    comingSoon: true,
    features: [
      'Requirements assessment',
      'TCO calculation',
      'Risk analysis',
      'Recommendation engine',
      'Decision rationale',
    ],
  },
};

export function getWorkbenchTool(id: WorkbenchToolId): WorkbenchTool {
  return WORKBENCH_TOOLS[id];
}

export function getAvailableTools(): WorkbenchTool[] {
  return Object.values(WORKBENCH_TOOLS).filter((tool) => !tool.comingSoon);
}

export function getComingSoonTools(): WorkbenchTool[] {
  return Object.values(WORKBENCH_TOOLS).filter((tool) => tool.comingSoon);
}

export function getToolsByCategory(category: WorkbenchTool['category']): WorkbenchTool[] {
  return Object.values(WORKBENCH_TOOLS).filter((tool) => tool.category === category);
}