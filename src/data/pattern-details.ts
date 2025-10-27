/**
 * Detailed Pattern Explanations
 *
 * In-depth information about each prompt engineering pattern
 * with examples, use cases, and best practices
 */

export interface PatternDetail {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  shortDescription: string;
  fullDescription: string;
  howItWorks: string;
  whenToUse: string[];
  example: {
    before: string;
    after: string;
    explanation: string;
  };
  bestPractices: string[];
  commonMistakes: string[];
  relatedPatterns: string[];
}

export const patternDetails: PatternDetail[] = [
  {
    id: 'persona',
    name: 'Persona Pattern',
    category: 'Role/Instruction',
    level: 'beginner',
    shortDescription: 'Assigns a specific role or expertise to the AI',
    fullDescription:
      'The Persona Pattern instructs the AI to adopt a specific role, profession, or perspective when generating responses. By defining who the AI should "be," you get responses that match the knowledge, tone, and approach of that persona.',
    howItWorks:
      'You explicitly tell the AI to act as a specific expert (e.g., "You are a senior software architect"). The AI then filters its responses through that lens, using appropriate terminology, frameworks, and thinking patterns associated with that role.',
    whenToUse: [
      'You need domain-specific expertise or terminology',
      'You want responses tailored to a specific audience',
      'You need consistent tone and perspective across multiple prompts',
      'You want the AI to apply specialized frameworks or methodologies',
    ],
    example: {
      before: 'How do I improve my code?',
      after:
        'Act as a senior code reviewer with 15 years of experience. Review this code and provide specific, actionable feedback on security, performance, and maintainability.',
      explanation:
        'The "after" version gives the AI a clear role (senior code reviewer) and expertise level (15 years), resulting in more professional, structured feedback rather than generic suggestions.',
    },
    bestPractices: [
      'Be specific about the expertise level (junior, senior, expert)',
      "Include relevant context about the persona's background",
      'Combine with other patterns for better results',
      'Use consistent personas across related prompts',
    ],
    commonMistakes: [
      'Being too vague ("act as an expert" - expert in what?)',
      "Choosing personas that don't match your actual need",
      'Forgetting to maintain the persona throughout the conversation',
      'Using conflicting personas in the same prompt',
    ],
    relatedPatterns: ['context', 'audience-persona', 'format'],
  },
  {
    id: 'format',
    name: 'Output Formatting Pattern',
    category: 'Structure/Format',
    level: 'beginner',
    shortDescription:
      'Specifies the exact output format (JSON, Markdown, etc.)',
    fullDescription:
      "The Format Pattern explicitly defines how you want the AI's response structured. This ensures consistent, parseable output that can be easily integrated into your workflow or applications.",
    howItWorks:
      'You specify the desired format using clear instructions like "Return as JSON", "Format as a table", or "Use Markdown with headers". The AI then structures its response to match your specification exactly.',
    whenToUse: [
      'You need to parse the output programmatically',
      'You want consistent structure across multiple responses',
      "You're integrating AI output into another system",
      'You need specific data fields in a predictable format',
    ],
    example: {
      before: 'Analyze this code for issues.',
      after:
        'Analyze this code and return the results as JSON with these fields: {issues: [{severity, description, lineNumber, suggestion}]}',
      explanation:
        'The structured JSON format makes it easy to programmatically process the results, display them in a UI, or integrate with other tools.',
    },
    bestPractices: [
      'Provide a clear example of the desired format',
      'Specify required vs optional fields',
      'Use standard formats (JSON, Markdown, CSV) when possible',
      'Test with edge cases to ensure format consistency',
    ],
    commonMistakes: [
      'Not providing enough detail about the structure',
      "Asking for formats the AI can't reliably produce",
      'Forgetting to handle parsing errors in your code',
      'Making the format too complex',
    ],
    relatedPatterns: ['template', 'constraint'],
  },
  {
    id: 'few-shot',
    name: 'Few-Shot Learning Pattern',
    category: 'Context Management',
    level: 'intermediate',
    shortDescription: "Provides examples to guide the AI's responses",
    fullDescription:
      'The Few-Shot Pattern teaches the AI by example. You provide 2-5 examples of the input-output pairs you want, and the AI learns the pattern to apply to new inputs. This is incredibly powerful for tasks where explaining the rules is harder than showing examples.',
    howItWorks:
      'You structure your prompt with clear examples showing the desired transformation or response style. The AI recognizes the pattern and applies the same logic to new inputs.',
    whenToUse: [
      'The task is easier to show than explain',
      'You want consistent style or format across outputs',
      'You need the AI to follow a specific reasoning pattern',
      "Simple instructions aren't producing the right results",
    ],
    example: {
      before: 'Convert this to a user story.',
      after: `Convert feature requests to user stories. Examples:

Input: "Add dark mode"
Output: "As a user, I want to toggle dark mode so that I can reduce eye strain in low-light environments."

Input: "Export to PDF"
Output: "As a user, I want to export reports as PDF so that I can share them with stakeholders who don't have system access."

Now convert: "Add search filters"`,
      explanation:
        'The examples show the exact format and level of detail needed. The AI will match this pattern for the new input.',
    },
    bestPractices: [
      "Use 2-5 examples (more isn't always better)",
      'Make examples diverse but clear',
      'Show edge cases if relevant',
      'Keep examples concise and focused',
    ],
    commonMistakes: [
      'Providing too many examples (confuses the pattern)',
      'Using inconsistent examples',
      'Not showing enough variety',
      'Making examples too complex',
    ],
    relatedPatterns: ['template', 'chain-of-thought'],
  },
  {
    id: 'chain-of-thought',
    name: 'Chain of Thought Pattern',
    category: 'Reasoning',
    level: 'intermediate',
    shortDescription: 'Breaks down complex reasoning into explicit steps',
    fullDescription:
      "The Chain of Thought Pattern instructs the AI to show its reasoning process step-by-step before arriving at a conclusion. This dramatically improves accuracy on complex problems and makes the AI's logic transparent and verifiable.",
    howItWorks:
      'You ask the AI to "think step by step" or "show your reasoning". The AI then breaks down the problem, considers each part, and builds toward a solution incrementally.',
    whenToUse: [
      'Complex problems requiring multi-step reasoning',
      "You need to verify the AI's logic",
      'Mathematical or logical problems',
      'Debugging or troubleshooting scenarios',
    ],
    example: {
      before: "What's the best database for this use case?",
      after: `Analyze this use case and recommend a database. Think through it step by step:
1. What are the data access patterns?
2. What are the scalability requirements?
3. What are the consistency vs availability trade-offs?
4. Based on these factors, what database type fits best?
5. What specific database would you recommend and why?`,
      explanation:
        'Breaking it into steps ensures the AI considers all relevant factors and shows its reasoning, making the recommendation more trustworthy.',
    },
    bestPractices: [
      'Explicitly ask for step-by-step reasoning',
      'Number the steps if you want specific structure',
      'Use for complex decisions or calculations',
      'Combine with persona for expert-level reasoning',
    ],
    commonMistakes: [
      'Using it for simple questions (overkill)',
      'Not providing enough context for reasoning',
      'Expecting perfect logic (AI can still make errors)',
      'Forgetting to validate the reasoning yourself',
    ],
    relatedPatterns: ['cognitive-verifier', 'refinement'],
  },
  {
    id: 'template',
    name: 'Template Pattern',
    category: 'Structure/Format',
    level: 'beginner',
    shortDescription:
      'Provides a fill-in-the-blank structure with placeholders',
    fullDescription:
      'The Template Pattern gives the AI a structured outline with placeholders that it fills in based on your input. This ensures consistent structure while allowing flexible content.',
    howItWorks:
      'You provide a template with placeholders (like {feature_name}, {benefit}, etc.) and the AI fills them in with appropriate content based on your context.',
    whenToUse: [
      'You need consistent document structure',
      'Creating standardized outputs (user stories, PRDs, etc.)',
      'Generating multiple similar items',
      'Ensuring all required sections are included',
    ],
    example: {
      before: 'Write a user story for the search feature.',
      after: `Fill in this user story template:

As a {user_type}
I want to {action}
So that {benefit}

Acceptance Criteria:
- {criterion_1}
- {criterion_2}
- {criterion_3}

Feature: Search functionality`,
      explanation:
        'The template ensures all necessary components are included and maintains consistency across all user stories.',
    },
    bestPractices: [
      'Use clear, descriptive placeholder names',
      'Provide context for what should fill each placeholder',
      'Keep templates simple and focused',
      'Test with different inputs to ensure flexibility',
    ],
    commonMistakes: [
      'Too many placeholders (overwhelming)',
      'Vague placeholder names',
      "Rigid templates that don't allow variation",
      'Not providing enough context for filling placeholders',
    ],
    relatedPatterns: ['format', 'few-shot'],
  },
  {
    id: 'constraint',
    name: 'Constraint Pattern',
    category: 'Context Management',
    level: 'beginner',
    shortDescription: 'Sets clear boundaries and limitations for the response',
    fullDescription:
      'The Constraint Pattern explicitly defines what the AI should NOT do or what limits apply to the response. This prevents unwanted behaviors and keeps responses focused and appropriate.',
    howItWorks:
      'You specify constraints like word limits, forbidden topics, required inclusions/exclusions, or response boundaries. The AI respects these constraints when generating output.',
    whenToUse: [
      'You need concise responses (word/character limits)',
      'Certain topics or approaches should be avoided',
      'You want audience-appropriate content',
      'You need to enforce specific rules or guidelines',
    ],
    example: {
      before: 'Explain microservices.',
      after:
        'Explain microservices in under 100 words. Do not use technical jargon. Focus only on business benefits, not implementation details.',
      explanation:
        'The constraints ensure a concise, business-friendly explanation rather than a technical deep-dive.',
    },
    bestPractices: [
      "Be specific about what's not allowed",
      'Combine positive and negative constraints',
      'Use measurable limits (word count, time, etc.)',
      'Explain why constraints exist if helpful',
    ],
    commonMistakes: [
      'Too many constraints (over-restricting)',
      'Contradictory constraints',
      'Vague boundaries',
      'Not testing if constraints are actually followed',
    ],
    relatedPatterns: ['format', 'audience-persona'],
  },
];

export function getPatternById(id: string): PatternDetail | undefined {
  return patternDetails.find((p) => p.id === id);
}

export function getPatternsByLevel(level: string): PatternDetail[] {
  return patternDetails.filter((p) => p.level === level);
}

export function getPatternsByCategory(category: string): PatternDetail[] {
  return patternDetails.filter((p) => p.category === category);
}
