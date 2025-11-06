/**
 * Research-Based Section Structures for Pillar Pages
 * 
 * These structures are based on Gemini Deep Research analysis and should be used
 * instead of AI-generated outlines to ensure strategic alignment and keyword coverage.
 */

import type { PillarPageConfig } from '@/lib/data/pillar-pages';

export interface ResearchBasedSection {
  id: string;
  title: string;
  order: number;
  targetWordCount: number;
  keywords: string[];
  relatedRoles: string[];
  keyConcepts: string[];
  frameworks?: string[];
  caseStudies?: string[];
  visualRequirements?: string[];
}

/**
 * Get research-based sections for AI Upskilling Program pillar page
 */
export function getAIUpskillingSections(config: PillarPageConfig): ResearchBasedSection[] {
  const wordsPerSection = Math.ceil(config.targetWordCount / 10); // 10 sections for comprehensive coverage
  
  return [
    {
      id: 'introduction-strategic-imperative',
      title: 'Introduction: The Strategic Imperative',
      order: 1,
      targetWordCount: 800,
      keywords: ['CTO guide to AI adoption', 'engineering leader AI strategy', 'AI transformation strategy'],
      relatedRoles: ['cto', 'vp-engineering', 'engineering-director'],
      keyConcepts: ['AI Delta', 'performance gap', 'leadership challenge'],
      frameworks: ['4-step strategic approach'],
    },
    {
      id: 'cto-adoption-playbook',
      title: "The CTO's AI Adoption Playbook: A 4-Step Strategic Guide",
      order: 2,
      targetWordCount: 1200,
      keywords: ['CTO guide to AI adoption', 'AI-first leadership development', 'AI adoption psychological safety'],
      relatedRoles: ['cto', 'vp-engineering'],
      keyConcepts: ['Infrastructure', 'Team & Culture', 'Strategic Planning', 'Ethics & Governance'],
      frameworks: ['CTO 4-Step Guide', 'AI-First Leadership', 'Psychological Safety'],
    },
    {
      id: 'build-vs-buy-framework',
      title: "The 'Build vs. Buy vs. Boost' Framework: A Strategic Decision Guide",
      order: 3,
      targetWordCount: 1000,
      keywords: ['build vs buy AI training', 'corporate AI training providers', 'AI training solution comparison'],
      relatedRoles: ['cto', 'vp-engineering'],
      keyConcepts: ['Build path', 'Buy path', 'Boost path', 'Decision framework'],
      frameworks: ['MIT Sloan Build vs. Buy framework'],
    },
    {
      id: 'measuring-roi-framework',
      title: 'Measuring What Matters: The Engineering Leader\'s AI ROI Framework',
      order: 4,
      targetWordCount: 1500,
      keywords: [
        'measuring AI impact engineering team',
        'how to calculate ROI on employee AI adoption',
        'what metrics measure AI impact on developer productivity',
        'AI training ROI',
      ],
      relatedRoles: ['cto', 'vp-engineering', 'engineering-director'],
      keyConcepts: [
        'Multi-layer measurement framework',
        'Adoption metrics',
        'Direct impact metrics',
        'Business impact metrics',
        'ROI calculator model',
      ],
      frameworks: ['AI Measurement Framework', 'ROI Calculator Model'],
      visualRequirements: ['Measurement framework diagram', 'ROI calculator template'],
    },
    {
      id: 'implementation-roadmap',
      title: 'From Concept to Practice: A 6-Phase AI Implementation Roadmap',
      order: 5,
      targetWordCount: 1000,
      keywords: [
        'AI implementation roadmap for enterprise',
        'AI transformation roadmap',
        'how to build AI training program for engineers from scratch',
      ],
      relatedRoles: ['cto', 'vp-engineering', 'engineering-manager'],
      keyConcepts: [
        'Readiness Assessment',
        'Strategy Development',
        'Pilot Selection',
        'Implementation & Testing',
        'Scaling',
        'Monitoring & Optimization',
      ],
      frameworks: ['6-Phase Roadmap'],
      visualRequirements: ['Timeline/infographic showing 6 phases'],
    },
    {
      id: 'ai-driven-sdlc',
      title: 'The AI-Driven SDLC: Integrating GenAI into Your Engineering Workflow',
      order: 6,
      targetWordCount: 1200,
      keywords: [
        'integrating AI into SDLC training',
        'AI-driven software development lifecycle',
        'GenAI upskilling for software engineers topics',
        'AI training for software developers vs data scientists',
      ],
      relatedRoles: ['engineer', 'senior-engineer', 'tech-lead'],
      keyConcepts: [
        'AI in Requirements',
        'AI in Design',
        'AI in Development',
        'AI in Testing',
        'AI in Deployment',
      ],
      frameworks: ['AI-Driven SDLC', 'Transforming SDLC with GenAI'],
    },
    {
      id: 'competency-framework',
      title: "Defining 'Good': A Practical AI Competency Framework for Engineers",
      order: 7,
      targetWordCount: 800,
      keywords: [
        'AI competency framework for engineers',
        'what is an AI competency framework for engineers',
        'AI skills framework',
      ],
      relatedRoles: ['engineering-director', 'vp-engineering', 'engineering-manager'],
      keyConcepts: [
        'SFIA Framework (7 levels)',
        'Data Handling & Management',
        'Model Validation & Testing',
        'Ethical AI & Governance',
        'Prompt Engineering & Context Engineering',
      ],
      frameworks: ['SFIA Framework', 'AI Competency Models'],
      visualRequirements: ['Competency matrix table'],
    },
    {
      id: 'case-studies',
      title: 'Real-World Proof: AI Upskilling Case Studies & Metrics',
      order: 8,
      targetWordCount: 800,
      keywords: [
        'AI upskilling case study engineering',
        'AI training success stories',
        'measuring AI impact engineering team',
      ],
      relatedRoles: ['cto', 'vp-engineering'],
      keyConcepts: ['Keppel: 60% reduction', 'Lob: 57% velocity increase', 'IBM', 'Adobe'],
      caseStudies: ['Keppel', 'Lob', 'IBM', 'Adobe'],
    },
    {
      id: 'common-pitfalls',
      title: 'Common Pitfalls: Why 60% of AI Initiatives Fail (and How to Succeed)',
      order: 9,
      targetWordCount: 1000,
      keywords: [
        'challenges of AI implementation in engineering',
        'common pitfalls AI transformation',
        'why AI initiatives fail',
      ],
      relatedRoles: ['cto', 'vp-engineering', 'engineering-director'],
      keyConcepts: [
        'Focusing on technology vs business problems',
        'Change management failures',
        'Pilot purgatory',
        'Poor data quality',
        'Treating AI as bolt-on',
      ],
    },
    {
      id: 'next-steps',
      title: 'Next Steps & Resources',
      order: 10,
      targetWordCount: 400,
      keywords: [],
      relatedRoles: [],
      keyConcepts: ['Downloadable resources', 'Related content', 'Community resources'],
    },
  ];
}

/**
 * Get research-based sections for AI-First Engineering Organization pillar page
 */
export function getAIFirstOrganizationSections(config: PillarPageConfig): ResearchBasedSection[] {
  const wordsPerSection = Math.ceil(config.targetWordCount / 10); // 10 sections
  
  return [
    {
      id: 'ai-first-to-ai-native',
      title: 'The New Strategic Imperative: From "AI-First" to "AI-Native"',
      order: 1,
      targetWordCount: 1200,
      keywords: ['AI-first vs AI-native', 'AI-first engineering', 'AI-native company'],
      relatedRoles: ['cto', 'vp-engineering'],
      keyConcepts: [
        'AI-First as strategy',
        'AI-Native as architecture',
        'Decision-making differences',
        'Data culture differences',
        'Operations differences',
      ],
      visualRequirements: ['Comparison table: AI-First vs AI-Native'],
    },
    {
      id: 'leadership-mandate',
      title: 'The Leadership Mandate: Owning the "AI Delta"',
      order: 2,
      targetWordCount: 1000,
      keywords: [
        'CTO playbook for AI transformation',
        'engineering director AI strategy',
        'VP engineering AI transformation',
      ],
      relatedRoles: ['cto', 'vp-engineering', 'ceo', 'cfo'],
      keyConcepts: ['AI Delta', 'Performance gap', 'CEO/CFO involvement', 'Leadership challenge'],
      frameworks: ['L.E.K. Consulting research', 'BCG report'],
    },
    {
      id: 'cultural-blueprint',
      title: 'The Cultural Blueprint: Building an AI-First Engineering Culture',
      order: 3,
      targetWordCount: 1200,
      keywords: [
        'AI-first leadership development',
        'AI adoption psychological safety',
        'change management AI adoption',
        'building AI-first engineering culture',
      ],
      relatedRoles: ['cto', 'vp-engineering', 'engineering-manager'],
      keyConcepts: [
        'Fear of replacement',
        'Safe spaces for experimentation',
        'New roles: Knowledge Architect, AI Conversation Designer',
        'nCino Principle: People, problems, context before technology',
      ],
      frameworks: ['Change management research', 'nCino insights'],
    },
    {
      id: 'velocity-to-verifiability',
      title: 'Redefining Success: The New Engineering KPIs (From Velocity to Verifiability)',
      order: 4,
      targetWordCount: 1500,
      keywords: [
        'AI engineering KPIs',
        'what is AI verifiability',
        'confidence velocity',
        'reasoning transparency',
        'data lineage',
      ],
      relatedRoles: ['cto', 'vp-engineering', 'engineering-director'],
      keyConcepts: [
        'Why traditional metrics fail',
        'Verifiability framework',
        'Reasoning Transparency',
        'Data Lineage',
        'Governance Accountability',
        'Outcome Consistency',
        'Confidence Velocity',
      ],
      frameworks: ['Logiciel.io Verifiability framework'],
      visualRequirements: ['KPI comparison table: Velocity vs. Verifiability'],
    },
    {
      id: 'organizational-architecture',
      title: 'Organizational Architecture: How to Structure Your AI Engineering Teams',
      order: 5,
      targetWordCount: 1200,
      keywords: [
        'AI engineering team structure',
        'centralized vs decentralized AI team',
        'federated learning',
      ],
      relatedRoles: ['vp-engineering', 'engineering-director'],
      keyConcepts: [
        'Centralized Model (CoE)',
        'Decentralized Model (Embedded)',
        'Hybrid/Federated Model (Platform)',
        'Decision framework',
      ],
      frameworks: ['Scrum.org team scaling models', 'AWS federated approach'],
      visualRequirements: ['Comparison table: Centralized vs. Decentralized vs. Hybrid'],
    },
    {
      id: 'tech-stack',
      title: 'The AI-First Tech Stack: A CTO\'s Guide to MLOps, Governance, and Context Engineering',
      order: 6,
      targetWordCount: 1500,
      keywords: [
        'MLOps and data governance strategy',
        'what is context engineering',
        'AI governance framework',
        'MLOps',
      ],
      relatedRoles: ['cto', 'vp-engineering', 'engineering-director'],
      keyConcepts: [
        'MLOps Infrastructure',
        'AI Data Governance',
        'Context Engineering (architectural problem vs user skill)',
        'Data quality pipelines',
        'Regulatory alignment (EU AI Act, CRA)',
      ],
      frameworks: ['MLOps research', 'nCino context engineering concept', 'Governance frameworks'],
    },
    {
      id: 'transformation-roadmap',
      title: 'The AI Transformation Roadmap: A 5-Phase Playbook',
      order: 7,
      targetWordCount: 1200,
      keywords: [
        'AI transformation roadmap',
        'AI maturity model',
        'CTO playbook for AI transformation',
      ],
      relatedRoles: ['cto', 'vp-engineering'],
      keyConcepts: [
        'Phase 1: Assess (AI Maturity Model)',
        'Phase 2: Align (Strategy & Governance)',
        'Phase 3: Experiment (Safe sandboxes)',
        'Phase 4: Industrialize (Scale with MLOps)',
        'Phase 5: Transform (Become AI-Native)',
      ],
      frameworks: ['Multiple roadmap frameworks synthesized'],
      visualRequirements: ['5-phase roadmap timeline'],
    },
    {
      id: 'product-organization',
      title: 'The AI-First Product Organization: A Guide for Product Directors',
      order: 8,
      targetWordCount: 800,
      keywords: [
        'role of product director in AI',
        'AI product management',
        'product director AI strategy',
      ],
      relatedRoles: ['product-director', 'vp-product'],
      keyConcepts: [
        'How Product Manager role changes',
        'Collaboration with Applied AI teams',
        'Owning product vision for models',
        'Human-AI interaction design',
      ],
      frameworks: ['Product Director role research', 'AI PM responsibilities'],
    },
    {
      id: 'common-pitfalls',
      title: 'Common Pitfalls: Why 60% of AI Initiatives Fail',
      order: 9,
      targetWordCount: 1000,
      keywords: [
        'common pitfalls AI transformation',
        'why AI initiatives fail',
        'AI transformation challenges',
      ],
      relatedRoles: ['cto', 'vp-engineering'],
      keyConcepts: [
        'Focusing on technology vs business problems',
        'Ignoring change management',
        'Disappointing ROI / Pilot purgatory',
        'Poor data quality',
        'Treating AI as bolt-on',
      ],
      frameworks: ['Failure rate research', 'Common mistakes analysis'],
    },
    {
      id: 'agentic-era',
      title: 'The Future: Preparing for the "Agentic Era"',
      order: 10,
      targetWordCount: 800,
      keywords: ['agentic AI', 'future of AI-first engineering', 'AI agents'],
      relatedRoles: ['cto', 'vp-engineering'],
      keyConcepts: [
        'Defining Agentic AI',
        'Architecture evolution: rigid orchestration to intelligent coordination',
        'Preparing your organization',
      ],
      frameworks: ['Agentic AI research', 'AWS architecture evolution'],
    },
  ];
}

/**
 * Get research-based sections for a pillar page
 */
export function getResearchBasedSections(config: PillarPageConfig): ResearchBasedSection[] {
  if (config.id === 'ai-upskilling-program') {
    return getAIUpskillingSections(config);
  }
  
  if (config.id === 'ai-first-engineering-organization') {
    return getAIFirstOrganizationSections(config);
  }
  
  // For other pages, return empty array to use AI generation
  return [];
}

