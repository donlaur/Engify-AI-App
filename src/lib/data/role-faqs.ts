/**
 * Role-Specific FAQ Data
 * FAQs targeting long-tail keywords for SEO
 * Questions are designed to match common search queries
 */

import { FAQItem } from '@/components/features/FAQSection';

export const ROLE_FAQS: Record<string, FAQItem[]> = {
  engineer: [
    {
      question:
        'How do software engineers use AI prompts to write better code?',
      answer:
        'Software engineers use AI prompts to generate code, debug issues, write tests, refactor code, and document functions. By providing clear context and specific requirements, engineers can get AI assistance that follows best practices, handles edge cases, and produces production-ready code. Our prompts are designed to help engineers work faster while maintaining code quality.',
    },
    {
      question: 'What are the best AI prompts for code review and debugging?',
      answer:
        'The best AI prompts for code review focus on security vulnerabilities, performance issues, code smells, and adherence to best practices. For debugging, prompts that include error messages, stack traces, and relevant code context help AI identify root causes quickly. Our prompt library includes specialized prompts for both code review and debugging workflows.',
    },
    {
      question:
        'How can AI help engineers with documentation and technical writing?',
      answer:
        'AI prompts can generate API documentation, code comments, README files, technical specifications, and user guides. By providing code context and requirements, engineers can create comprehensive documentation faster. Our documentation prompts help ensure consistency, clarity, and completeness in technical writing.',
    },
    {
      question:
        'What AI prompts are most useful for testing and test automation?',
      answer:
        'AI prompts excel at generating unit tests, integration tests, test cases, test data, and test plans. They can analyze code coverage, suggest edge cases, and create comprehensive test suites. Our testing prompts help engineers write better tests faster and improve test coverage.',
    },
  ],
  'engineering-manager': [
    {
      question:
        'How do engineering managers use AI prompts for team management?',
      answer:
        'Engineering managers use AI prompts to write performance reviews, create 1:1 meeting agendas, draft PIPs (Performance Improvement Plans), generate delegation messages, and synthesize team feedback. AI helps managers save time on administrative tasks while maintaining quality and consistency in people management.',
    },
    {
      question: 'What are the best AI prompts for writing performance reviews?',
      answer:
        "The best performance review prompts synthesize a year's worth of project data, peer feedback, and 1:1 notes into comprehensive reviews. They help managers identify themes, provide specific examples, and create actionable development plans. Our prompts ensure reviews are fair, complete, and aligned with company competency models.",
    },
    {
      question:
        'How can AI help engineering managers with technical planning and roadmaps?',
      answer:
        'AI prompts can analyze technical debt, prioritize initiatives, create project plans, estimate timelines, and generate technical roadmaps. They help managers balance competing priorities, communicate technical decisions to stakeholders, and make data-driven planning decisions.',
    },
    {
      question:
        'What AI prompts help with recruiting and onboarding new engineers?',
      answer:
        "AI prompts can generate role-specific interview kits with behavioral questions, technical questions, and scoring rubrics. They also create personalized 30/60/90-day onboarding plans tailored to each engineer's experience level and role. This saves managers significant time while ensuring consistent, high-quality hiring and onboarding processes.",
    },
  ],
  'product-manager': [
    {
      question: 'How do product managers use AI prompts for product strategy?',
      answer:
        'Product managers use AI prompts to synthesize customer feedback, conduct competitive analysis, create product roadmaps, prioritize features using frameworks like RICE, and translate business goals into product requirements. AI helps PMs make data-driven decisions faster and communicate strategy more effectively.',
    },
    {
      question:
        'What are the best AI prompts for customer research and user feedback analysis?',
      answer:
        'The best prompts for customer research perform thematic analysis on interview transcripts, survey responses, and support tickets. They identify pain points, cluster feedback into themes, and suggest feature ideas. Our prompts help PMs extract actionable insights from large volumes of qualitative data.',
    },
    {
      question: 'How can AI help product managers with stakeholder management?',
      answer:
        'AI prompts can synthesize competing stakeholder priorities, identify conflicts, and draft neutral compromise proposals using prioritization frameworks. They help PMs create clear communication plans, write status updates, and facilitate alignment meetings. Our prompts ensure PMs can navigate complex stakeholder relationships effectively.',
    },
    {
      question:
        'What AI prompts are useful for creating PRDs and product documentation?',
      answer:
        'AI prompts excel at generating comprehensive PRDs (Product Requirements Documents), user stories, acceptance criteria, and product specifications. They ensure documentation is complete, clear, and actionable for engineering teams. Our prompts help PMs create better documentation faster.',
    },
  ],
  'engineering-director': [
    {
      question:
        'How do engineering directors use AI prompts for organizational strategy?',
      answer:
        'Engineering directors use AI prompts to analyze engineering metrics, identify bottlenecks, create technical strategies, plan organizational changes, and communicate with executive leadership. AI helps directors make strategic decisions based on data and scale their impact across the organization.',
    },
    {
      question:
        'What are the best AI prompts for measuring engineering team productivity?',
      answer:
        'The best prompts analyze DORA metrics (deployment frequency, lead time, change failure rate, MTTR), cycle times, and workflow data to identify bottlenecks and improvement opportunities. They help directors understand team performance and make data-driven decisions about process improvements.',
    },
    {
      question:
        'How can AI help engineering directors with technical debt management?',
      answer:
        'AI prompts can analyze technical debt, prioritize refactoring efforts, create technical debt reduction plans, and communicate the business impact of technical decisions. They help directors balance innovation with maintenance and make strategic technical investments.',
    },
    {
      question: 'What AI prompts help with scaling engineering organizations?',
      answer:
        'AI prompts can help create hiring plans, design organizational structures, develop career ladders, plan team growth, and establish engineering culture. They assist directors in scaling teams effectively while maintaining quality and culture.',
    },
  ],
  'product-director': [
    {
      question:
        'How do product directors use AI prompts for product strategy and vision?',
      answer:
        'Product directors use AI prompts to develop product vision, create strategic roadmaps, analyze market trends, conduct competitive analysis, and align product strategy with business objectives. AI helps directors think strategically and communicate vision effectively across the organization.',
    },
    {
      question:
        'What are the best AI prompts for portfolio management and prioritization?',
      answer:
        'The best prompts help directors prioritize product initiatives using frameworks like RICE, WSJF, and value vs effort analysis. They synthesize multiple data sources to make objective prioritization decisions and communicate trade-offs to stakeholders.',
    },
    {
      question:
        'How can AI help product directors with market analysis and competitive intelligence?',
      answer:
        'AI prompts can analyze competitor features, pricing, and positioning. They identify market gaps, trends, and opportunities. Our prompts help directors stay ahead of market changes and make informed strategic decisions.',
    },
    {
      question:
        'What AI prompts assist with cross-functional alignment and communication?',
      answer:
        'AI prompts help directors create executive presentations, synthesize complex information for different audiences, draft strategic communications, and facilitate alignment across engineering, design, sales, and marketing teams.',
    },
  ],
  'vp-engineering': [
    {
      question:
        'How do VPs of Engineering use AI prompts for executive leadership?',
      answer:
        'VPs of Engineering use AI prompts to create executive presentations, analyze engineering metrics for board meetings, develop technical strategies, plan organizational changes, and communicate technical decisions to non-technical stakeholders. AI helps VPs scale their leadership impact.',
    },
    {
      question:
        'What are the best AI prompts for engineering organization design?',
      answer:
        'The best prompts help VPs design organizational structures, create career ladders, plan team composition, establish engineering culture, and scale engineering organizations. They assist in making strategic organizational decisions.',
    },
    {
      question:
        'How can AI help VPs of Engineering with technical strategy and innovation?',
      answer:
        'AI prompts can analyze technology trends, evaluate technical investments, create innovation roadmaps, and balance technical debt with new capabilities. They help VPs make strategic technical decisions that align with business goals.',
    },
    {
      question:
        'What AI prompts help with measuring and improving engineering ROI?',
      answer:
        'AI prompts analyze engineering productivity metrics, calculate ROI of technical investments, identify efficiency opportunities, and create data-driven improvement plans. They help VPs demonstrate engineering value to the business.',
    },
  ],
  'vp-product': [
    {
      question:
        'How do VPs of Product use AI prompts for product strategy and vision?',
      answer:
        'VPs of Product use AI prompts to develop product vision, create strategic roadmaps, analyze market opportunities, conduct competitive analysis, and align product strategy with business objectives. AI helps VPs think strategically at scale.',
    },
    {
      question:
        'What are the best AI prompts for portfolio strategy and resource allocation?',
      answer:
        'The best prompts help VPs prioritize product initiatives, allocate resources, balance short-term and long-term goals, and make strategic trade-offs. They synthesize multiple data sources to support objective decision-making.',
    },
    {
      question:
        'How can AI help VPs of Product with market positioning and go-to-market strategy?',
      answer:
        'AI prompts can analyze market positioning, identify differentiation opportunities, create go-to-market plans, and develop product messaging. They help VPs make strategic decisions about product positioning and market entry.',
    },
    {
      question:
        'What AI prompts assist with executive communication and stakeholder alignment?',
      answer:
        'AI prompts help VPs create executive presentations, synthesize complex information, draft strategic communications, and facilitate alignment across the organization. They ensure VPs can communicate effectively with all stakeholders.',
    },
  ],
  cto: [
    {
      question:
        'How do CTOs use AI prompts for technical strategy and innovation?',
      answer:
        'CTOs use AI prompts to develop technical strategy, evaluate technology investments, create innovation roadmaps, analyze industry trends, and make strategic technical decisions. AI helps CTOs think strategically about technology and its impact on the business.',
    },
    {
      question:
        'What are the best AI prompts for technology evaluation and architecture decisions?',
      answer:
        'The best prompts help CTOs evaluate new technologies, compare architectural approaches, assess technical risks, and make informed technology choices. They synthesize technical information to support strategic decision-making.',
    },
    {
      question: 'How can AI help CTOs with engineering organization scaling?',
      answer:
        'AI prompts can help design organizational structures, create hiring plans, develop engineering culture, plan team growth, and establish engineering practices. They assist CTOs in scaling engineering organizations effectively.',
    },
    {
      question:
        'What AI prompts help with technical risk management and security strategy?',
      answer:
        'AI prompts analyze technical risks, evaluate security postures, create risk mitigation plans, and develop security strategies. They help CTOs make informed decisions about technical risk and security investments.',
    },
  ],
};

// Default FAQs for roles not specifically defined
export const DEFAULT_ROLE_FAQS: FAQItem[] = [
  {
    question:
      'How do professionals in this role use AI prompts to improve their work?',
    answer:
      'AI prompts help professionals automate repetitive tasks, synthesize information, generate content, analyze data, and make better decisions. By providing clear context and specific requirements, AI becomes a powerful assistant that saves time and improves quality.',
  },
  {
    question: 'What are the most useful AI prompts for this role?',
    answer:
      'The most useful prompts depend on your specific responsibilities, but generally include prompts for documentation, analysis, communication, planning, and problem-solving. Our role-specific prompts are designed to address the unique challenges and workflows of each role.',
  },
  {
    question: 'How can I get started with AI prompts for my role?',
    answer:
      'Start by browsing our role-specific prompts, identify 2-3 prompts that address your biggest pain points, customize them for your context, and integrate them into your daily workflow. Our prompts include examples and best practices to help you get started quickly.',
  },
];

/**
 * Get FAQs for a specific role
 */
export function getRoleFAQs(role: string): FAQItem[] {
  return ROLE_FAQS[role] || DEFAULT_ROLE_FAQS;
}
