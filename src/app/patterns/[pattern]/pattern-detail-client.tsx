import { Metadata } from 'next';
import { APP_URL } from '@/lib/constants';
import PatternDetailClient from './pattern-detail-client';

// Pattern descriptions and metadata
const PATTERN_INFO: Record<string, { title: string; description: string; icon: string; benefits: string[] }> = {
  'chain-of-thought': {
    title: 'Chain of Thought',
    description: 'Break down complex problems into step-by-step reasoning processes. This pattern helps AI models show their work and arrive at more accurate conclusions.',
    icon: 'link',
    benefits: [
      'Improved reasoning accuracy',
      'Transparent problem-solving',
      'Better handling of complex logic',
      'Easier to debug and refine',
    ],
  },
  'few-shot': {
    title: 'Few-Shot Learning',
    description: 'Provide examples to guide the AI\'s response format and style. This pattern uses 2-5 examples to teach the model what you want.',
    icon: 'book',
    benefits: [
      'Consistent output format',
      'Faster training without fine-tuning',
      'Clear expectations set',
      'Adaptable to various tasks',
    ],
  },
  'zero-shot': {
    title: 'Zero-Shot',
    description: 'Direct instructions without examples. Ideal for simple tasks or when you want maximum creativity.',
    icon: 'zap',
    benefits: [
      'Quick to write',
      'Maximum flexibility',
      'No example bias',
      'Works for novel tasks',
    ],
  },
  'persona': {
    title: 'Persona Pattern',
    description: 'Assign a specific role or expertise to the AI (e.g., "You are a senior software architect"). This shapes the tone, depth, and perspective of responses.',
    icon: 'user',
    benefits: [
      'Expert-level responses',
      'Role-appropriate tone',
      'Context-aware answers',
      'Professional communication',
    ],
  },
  'self-consistency': {
    title: 'Self-Consistency',
    description: 'Generate multiple solutions and choose the most consistent answer. This pattern reduces errors by cross-validating responses.',
    icon: 'check-circle',
    benefits: [
      'Higher accuracy',
      'Error reduction',
      'Reliable results',
      'Quality assurance',
    ],
  },
  'tree-of-thoughts': {
    title: 'Tree of Thoughts',
    description: 'Explore multiple reasoning paths simultaneously, then select the best solution. Ideal for complex problem-solving.',
    icon: 'git-branch',
    benefits: [
      'Comprehensive exploration',
      'Better decision-making',
      'Handles uncertainty',
      'Optimal path selection',
    ],
  },
  'chain-of-verification': {
    title: 'Chain of Verification',
    description: 'Verify each step of reasoning before proceeding. This pattern ensures accuracy at each stage.',
    icon: 'shield-check',
    benefits: [
      'Error detection',
      'Step-by-step validation',
      'Higher confidence',
      'Quality control',
    ],
  },
  're-act': {
    title: 'ReAct (Reasoning + Acting)',
    description: 'Combine reasoning with tool use. The AI thinks, acts, observes, and iterates.',
    icon: 'settings',
    benefits: [
      'Tool integration',
      'Iterative improvement',
      'Real-world problem solving',
      'Dynamic adaptation',
    ],
  },
  'automatic-few-shot': {
    title: 'Automatic Few-Shot',
    description: 'Let the AI select its own examples from context. This pattern adapts examples to the current task.',
    icon: 'wand-magic',
    benefits: [
      'Adaptive examples',
      'Context-aware',
      'Reduced manual work',
      'Task-specific guidance',
    ],
  },
  'meta-prompting': {
    title: 'Meta-Prompting',
    description: 'Prompt the AI to improve its own prompts. This pattern creates self-improving systems.',
    icon: 'sparkles',
    benefits: [
      'Self-optimization',
      'Continuous improvement',
      'Adaptive prompts',
      'Reduced manual tuning',
    ],
  },
  'socratic-method': {
    title: 'Socratic Method',
    description: 'Ask probing questions to guide reasoning. This pattern helps the AI think deeper.',
    icon: 'message-circle',
    benefits: [
      'Deeper thinking',
      'Critical reasoning',
      'Self-reflection',
      'Better insights',
    ],
  },
  'constitutional-ai': {
    title: 'Constitutional AI',
    description: 'Apply principles and constraints to guide AI behavior. This pattern ensures ethical, safe responses.',
    icon: 'scale',
    benefits: [
      'Ethical responses',
      'Safety constraints',
      'Controlled behavior',
      'Principle-based',
    ],
  },
  'retrieval-augmented': {
    title: 'Retrieval-Augmented Generation (RAG)',
    description: 'Augment prompts with relevant context from external sources. This pattern improves accuracy with real data.',
    icon: 'database',
    benefits: [
      'Up-to-date information',
      'Accurate facts',
      'Context-aware',
      'Knowledge integration',
    ],
  },
  'reflection': {
    title: 'Reflection Pattern',
    description: 'Review and refine responses iteratively. This pattern improves quality through self-critique.',
    icon: 'refresh-cw',
    benefits: [
      'Self-improvement',
      'Quality refinement',
      'Error correction',
      'Continuous enhancement',
    ],
  },
  'kernal': {
    title: 'KERNEL Framework',
    description: 'Knowledge, Examples, Role, Next, Evaluate, Learn - Our comprehensive prompt engineering framework.',
    icon: 'kernel',
    benefits: [
      'Structured approach',
      '94% success rate',
      'Research-backed',
      'Comprehensive methodology',
    ],
  },
};

export async function generateMetadata({ params }: { params: { pattern: string } }): Promise<Metadata> {
  const pattern = decodeURIComponent(params.pattern);
  const patternInfo = PATTERN_INFO[pattern] || {
    title: pattern.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: `Learn about the ${pattern} prompt engineering pattern and how to use it effectively.`,
    benefits: [],
  };

  const title = `${patternInfo.title} - Prompt Engineering Pattern | Engify.ai`;
  const description = `${patternInfo.description} Part of the PMI 7 Patterns of AI. Explore ${patternInfo.benefits.length} key benefits and learn how to apply this pattern in your prompts.`;
  const url = `${APP_URL}/patterns/${encodeURIComponent(pattern)}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'Engify.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords: [
      'prompt engineering',
      'AI patterns',
      patternInfo.title.toLowerCase(),
      'prompt patterns',
      'AI prompt techniques',
      'PMI patterns',
      'prompt engineering framework',
    ],
  };
}

export default async function PatternDetailPage({ params }: { params: { pattern: string } }) {
  const pattern = decodeURIComponent(params.pattern);
  const patternInfo = PATTERN_INFO[pattern] || {
    title: pattern.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: `Learn about the ${pattern} prompt engineering pattern.`,
    icon: 'zap',
    benefits: [],
  };

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: patternInfo.title,
    description: patternInfo.description,
    url: `${APP_URL}/patterns/${encodeURIComponent(pattern)}`,
    author: {
      '@type': 'Organization',
      name: 'Engify.ai',
      url: APP_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Engify.ai',
      logo: {
        '@type': 'ImageObject',
        url: `${APP_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${APP_URL}/patterns/${encodeURIComponent(pattern)}`,
    },
    about: {
      '@type': 'Thing',
      name: 'Prompt Engineering',
      description: 'The practice of crafting effective prompts for AI models',
    },
    keywords: [
      'prompt engineering',
      'AI patterns',
      patternInfo.title.toLowerCase(),
      'prompt patterns',
    ].join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PatternDetailClient pattern={pattern} patternInfo={patternInfo} />
    </>
  );
}
