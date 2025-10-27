/**
 * Career-Driven Learning Pathways
 * Based on real engineering career progression data
 */

export interface LearningStep {
  id: string;
  title: string;
  contentType: 'tutorial' | 'workshop' | 'exercise' | 'case-study' | 'framework';
  duration: number; // minutes
  skills: string[];
  promptIds: string[];
  description: string;
}

export interface CareerPathway {
  id: string;
  title: string;
  level: 'junior' | 'mid' | 'senior' | 'staff';
  yearsExperience: string;
  overview: string;
  prerequisites: string[];
  objectives: string[];
  steps: LearningStep[];
  nextPathways: string[];
}

export const careerPathways: CareerPathway[] = [
  {
    id: 'junior-ai-tools',
    title: 'AI Tools for Daily Development',
    level: 'junior',
    yearsExperience: '0-2 years',
    overview: 'Master AI tools that enhance daily coding tasks and accelerate learning',
    prerequisites: [
      'Basic programming knowledge',
      'Familiarity with Git',
      'Understanding of web development basics',
    ],
    objectives: [
      'Use AI for code review and quality improvement',
      'Generate documentation efficiently',
      'Debug systematically with AI assistance',
      'Create personalized learning plans',
    ],
    steps: [
      {
        id: 'jr-step-1',
        title: 'AI-Powered Code Review',
        contentType: 'tutorial',
        duration: 30,
        skills: ['code-analysis', 'best-practices', 'learning-acceleration'],
        promptIds: ['cg-001'],
        description: 'Learn to use AI for comprehensive code reviews that accelerate your learning',
      },
      {
        id: 'jr-step-2',
        title: 'Documentation Generation',
        contentType: 'exercise',
        duration: 45,
        skills: ['technical-writing', 'api-docs', 'readme-creation'],
        promptIds: ['cg-007'],
        description: 'Generate professional documentation for your projects',
      },
      {
        id: 'jr-step-3',
        title: 'Bug Analysis & Debugging',
        contentType: 'case-study',
        duration: 60,
        skills: ['debugging', 'error-analysis', 'problem-solving'],
        promptIds: ['cg-004'],
        description: 'Master systematic debugging with AI assistance',
      },
      {
        id: 'jr-step-4',
        title: 'Learning Resource Recommendations',
        contentType: 'framework',
        duration: 30,
        skills: ['self-directed-learning', 'skill-gap-analysis'],
        promptIds: ['cg-012'],
        description: 'Create personalized learning plans based on your goals',
      },
    ],
    nextPathways: ['mid-architecture', 'tech-react', 'tech-nodejs'],
  },
  {
    id: 'mid-architecture',
    title: 'AI-Assisted Architecture & Design',
    level: 'mid',
    yearsExperience: '2-4 years',
    overview: 'Leverage AI for system design, architecture decisions, and technical leadership',
    prerequisites: [
      'Solid programming fundamentals',
      'Experience with production systems',
      'Understanding of design patterns',
    ],
    objectives: [
      'Design scalable systems with AI guidance',
      'Make informed architectural decisions',
      'Optimize system performance',
      'Lead technical initiatives',
    ],
    steps: [
      {
        id: 'mid-step-1',
        title: 'System Design with AI',
        contentType: 'workshop',
        duration: 90,
        skills: ['system-architecture', 'scalability', 'design-patterns'],
        promptIds: ['dir-002'],
        description: 'Design production-ready systems with AI architectural guidance',
      },
      {
        id: 'mid-step-2',
        title: 'API Design & Documentation',
        contentType: 'workshop',
        duration: 75,
        skills: ['api-design', 'rest-principles', 'documentation'],
        promptIds: ['cg-002', 'cg-007'],
        description: 'Create well-designed APIs with comprehensive documentation',
      },
      {
        id: 'mid-step-3',
        title: 'Performance Optimization',
        contentType: 'case-study',
        duration: 60,
        skills: ['performance', 'profiling', 'monitoring'],
        promptIds: ['cg-005'],
        description: 'Identify and resolve performance bottlenecks',
      },
      {
        id: 'mid-step-4',
        title: 'Technical Decision Making',
        contentType: 'framework',
        duration: 45,
        skills: ['decision-making', 'trade-off-analysis', 'communication'],
        promptIds: ['dir-004'],
        description: 'Make and communicate technical decisions effectively',
      },
    ],
    nextPathways: ['senior-leadership', 'tech-advanced'],
  },
];

// Technology-specific pathways
export const techPathways = [
  {
    id: 'tech-react',
    title: 'AI-Enhanced React Development',
    tech: 'React/Next.js',
    topics: [
      {
        title: 'AI-Powered Component Generation',
        description: 'Generate React components with AI assistance',
        promptIds: ['cg-003'],
        duration: 45,
      },
      {
        title: 'Smart Testing',
        description: 'AI-assisted test generation and debugging',
        promptIds: ['cg-008'],
        duration: 60,
      },
      {
        title: 'Performance Optimization',
        description: 'AI analysis of React performance',
        promptIds: ['cg-005'],
        duration: 45,
      },
      {
        title: 'Accessibility Enhancement',
        description: 'AI-powered accessibility auditing',
        promptIds: ['cg-003'],
        duration: 30,
      },
    ],
  },
  {
    id: 'tech-nodejs',
    title: 'AI-Assisted Node.js Development',
    tech: 'Node.js/Backend',
    topics: [
      {
        title: 'API Design',
        description: 'AI-powered API design and documentation',
        promptIds: ['cg-002', 'cg-007'],
        duration: 60,
      },
      {
        title: 'Database Optimization',
        description: 'AI analysis of database performance',
        promptIds: ['cg-005'],
        duration: 45,
      },
      {
        title: 'Microservices Architecture',
        description: 'AI-guided service design',
        promptIds: ['dir-002'],
        duration: 90,
      },
      {
        title: 'Security Best Practices',
        description: 'AI-assisted security analysis',
        promptIds: ['cg-001'],
        duration: 45,
      },
    ],
  },
  {
    id: 'tech-python',
    title: 'AI-Enhanced Python Development',
    tech: 'Python',
    topics: [
      {
        title: 'Data Analysis with AI',
        description: 'AI-assisted data processing and analysis',
        promptIds: ['cg-012'],
        duration: 60,
      },
      {
        title: 'API Development',
        description: 'Build FastAPI/Flask apps with AI',
        promptIds: ['cg-002'],
        duration: 75,
      },
      {
        title: 'Testing & Quality',
        description: 'AI-powered test generation',
        promptIds: ['cg-008'],
        duration: 45,
      },
    ],
  },
];

export function getPathwayByLevel(level: CareerPathway['level']) {
  return careerPathways.filter((p) => p.level === level);
}

export function getPathwayById(id: string) {
  return careerPathways.find((p) => p.id === id);
}

export function getTechPathway(tech: string) {
  return techPathways.find((p) => p.tech.toLowerCase().includes(tech.toLowerCase()));
}
