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
  {
    id: 'structured-output',
    name: 'Structured Output Generation',
    category: 'Structure/Format',
    level: 'intermediate',
    shortDescription:
      'Forces the AI to output in machine-readable formats (JSON, XML, YAML) for system integration',
    fullDescription:
      'The Structured Output Generation pattern instructs the AI to return responses in a specific, machine-readable format such as JSON, XML, or YAML. This is critical for production engineering systems where AI outputs must be programmatically parsed and integrated into automated workflows, databases, or CI/CD pipelines. Unlike conversational prompts, structured outputs enable reliable system integration.',
    howItWorks:
      'You explicitly define the output format using schema definitions (JSON Schema, XML DTD, or YAML structure) and strict instructions to output ONLY the structured data with no additional text. The AI then formats its response according to your specification, making it parseable by other systems.',
    whenToUse: [
      'You need to integrate AI output into automated systems',
      'Building APIs that return AI-generated data',
      'Creating CI/CD pipelines that process AI responses',
      'Storing AI outputs in databases or data warehouses',
      'You need consistent, parseable data structures',
      'Building agentic systems that process AI outputs programmatically',
    ],
    example: {
      before:
        'Analyze this codebase and list all security vulnerabilities.',
      after: `Analyze this codebase and return security vulnerabilities as JSON. Output ONLY valid JSON, no text before or after.

Required JSON Schema:
{
  "vulnerabilities": [
    {
      "severity": "critical|high|medium|low",
      "type": "string",
      "location": "file:line",
      "description": "string",
      "remediation": "string"
    }
  ]
}

Codebase: [your code here]`,
      explanation:
        'The structured JSON output can be directly parsed by a security scanner, stored in a database, or integrated into a CI/CD pipeline for automated vulnerability tracking. The strict format ensures reliable parsing.',
    },
    bestPractices: [
      'Provide explicit schema definitions (JSON Schema, XML DTD)',
      'Use strict instructions: "Output ONLY JSON, no text before or after"',
      'Validate the output format programmatically',
      'Use JSON Schema for complex nested structures',
      'Consider using XML or YAML for domain-specific formats',
      'Test with edge cases to ensure format consistency',
      'Handle parsing errors gracefully in your code',
    ],
    commonMistakes: [
      'Not being explicit enough about format requirements',
      'Allowing extra text before/after the structured data',
      'Using formats the AI cannot reliably produce',
      'Not validating parsed output',
      'Making schemas too complex or ambiguous',
      'Forgetting to handle malformed responses',
    ],
    relatedPatterns: ['template', 'constraint', 'recipe'],
  },
  {
    id: 'self-reflection',
    name: 'Self-Reflection / Internalized Critique',
    category: 'Quality Control',
    level: 'advanced',
    shortDescription:
      'Single-prompt technique where AI generates, reviews, and improves its own response before presenting',
    fullDescription:
      'The Self-Reflection pattern is a single-prompt technique that instructs the AI to generate a response, then critically review it, identify flaws, and improve it before presenting the final answer. Unlike the iterative Critique & Improve pattern, this happens in a single pass, making it faster and more automatable while producing higher-quality first-pass responses.',
    howItWorks:
      'You structure your prompt to instruct the AI to: (1) Generate an initial response, (2) Critically review its own output for errors, style issues, or improvements, (3) Apply the improvements, and (4) Present only the final, improved version. This internalizes the quality control loop.',
    whenToUse: [
      'You need high-quality output in a single pass',
      'Building automated systems where iterative loops are costly',
      'Code generation where correctness is critical',
      'Technical documentation that must be accurate',
      'Any task where self-correction improves quality',
      'You want to reduce the need for human review',
    ],
    example: {
      before: 'Write a Python function to parse JSON.',
      after: `Write a Python function to parse JSON. Follow this process:

1. **Generate Code:** Write the complete function with error handling
2. **Self-Reflection:** Critically review your code for:
   - Bugs or logic errors
   - Style guide violations (PEP 8)
   - Missing error handling
   - Edge cases not handled
   - Performance inefficiencies
3. **Improve:** Apply all improvements from your reflection
4. **Output:** Provide ONLY the final, improved code

Do not show your reflection process - only the final code.`,
      explanation:
        'This pattern forces the AI to catch its own mistakes before presenting the code, resulting in higher-quality output that requires less human review. The reflection happens internally, so you get a polished result immediately.',
    },
    bestPractices: [
      'Define specific criteria for the self-review (bugs, style, performance)',
      'Instruct the AI to provide only the final output, not the reflection process',
      'Use for critical outputs where correctness matters',
      'Combine with persona pattern for expert-level review',
      'Specify the improvement areas explicitly',
      'Use for code, technical documentation, or analytical tasks',
    ],
    commonMistakes: [
      'Not being specific about what to review',
      'Asking the AI to show its reflection (adds noise)',
      'Using for simple tasks where it adds unnecessary overhead',
      'Not testing if the reflection actually improves quality',
      'Expecting perfect results (still validate)',
    ],
    relatedPatterns: ['critique-improve', 'cognitive-verifier', 'chain-of-thought'],
  },
  {
    id: 'flipped-interaction',
    name: 'Flipped Interaction',
    category: 'Collaboration',
    level: 'intermediate',
    shortDescription:
      'AI takes control of conversation, asking questions to gather sufficient context for complex tasks',
    fullDescription:
      'The Flipped Interaction pattern instructs the AI to act as an expert diagnostician or requirements-gatherer, taking control of the conversation by asking the user questions one at a time until it has gathered sufficient context to perform a complex task. This solves the "low-context prompt" problem by having the AI guide the user through the information-gathering process.',
    howItWorks:
      'You instruct the AI to act as an expert in a specific domain (e.g., "Act as a senior SRE") and ask the user questions one by one, rather than expecting the user to provide all context upfront. The AI uses its domain expertise to determine what information is needed and asks for it systematically.',
    whenToUse: [
      'Users don\'t know what information to provide',
      'Diagnostic or troubleshooting scenarios',
      'Requirements gathering for complex tasks',
      'Debugging workflows where step-by-step data collection is needed',
      'Expert consultations where the AI needs to guide the conversation',
      'Compliance audits or structured reviews',
    ],
    example: {
      before:
        'Help me debug my Kubernetes pod that\'s in CrashLoopBackOff.',
      after: `Act as a senior Site Reliability Engineer (SRE) and Kubernetes expert. I have a pod stuck in a 'CrashLoopBackOff' state.

Your role is to ask me questions one at a time to gather information. Do not suggest a solution until you have gathered sufficient information (e.g., describe output, logs, events).

Start by asking me for the output of 'kubectl describe pod <pod_name>'.`,
      explanation:
        'Instead of the user guessing what information to provide, the AI acts as the expert and guides them through the diagnostic process step-by-step, ensuring all necessary context is gathered before attempting a solution.',
    },
    bestPractices: [
      'Use a strong persona pattern (expert role)',
      'Instruct the AI to ask one question at a time',
      'Have the AI wait for user responses before proceeding',
      'Use for diagnostic, troubleshooting, or requirements-gathering tasks',
      'Specify when the AI should stop asking and provide a solution',
      'Make it clear this is a multi-turn conversation',
    ],
    commonMistakes: [
      'Not specifying the expert persona clearly',
      'Allowing the AI to ask all questions at once',
      'Not defining when to stop asking questions',
      'Using for simple tasks where direct instruction works better',
      'Not making it clear this requires multiple interactions',
    ],
    relatedPatterns: ['persona', 'question-refinement', 'chain-of-thought'],
  },
  {
    id: 'cognitive-verifier',
    name: 'Cognitive Verifier',
    category: 'Reasoning',
    level: 'intermediate',
    shortDescription:
      'Instructs the AI to verify its own reasoning and check for errors before presenting conclusions',
    fullDescription:
      'The Cognitive Verifier pattern asks the AI to critically examine its own reasoning process, identify potential errors or assumptions, and verify the correctness of its conclusions before presenting them. This pattern improves accuracy by making the AI double-check its work, similar to how a human would review their solution before submitting it. It\'s especially powerful when combined with Chain-of-Thought, as the AI can verify each step of its reasoning.',
    howItWorks:
      'You instruct the AI to: (1) Provide its initial answer or reasoning, (2) Review its own work critically, checking for logical errors, incorrect assumptions, or missing considerations, (3) Verify the correctness of each step or conclusion, and (4) Present the verified answer with confidence. The AI acts as its own quality control mechanism.',
    whenToUse: [
      'Mathematical problems or calculations where accuracy is critical',
      'Logical reasoning tasks where errors could cascade',
      'Code review or debugging where correctness matters',
      'Analysis tasks where assumptions need verification',
      'Any complex problem where self-checking improves quality',
      'Situations where you want to catch errors before they propagate',
    ],
    example: {
      before:
        'Solve this equation: 2x + 5 = 15. What is the value of x?',
      after: `Solve this equation: 2x + 5 = 15. What is the value of x?

**Step 1: Solve the equation**
2x + 5 = 15
2x = 15 - 5
2x = 10
x = 10 / 2
x = 5

**Step 2: Verify your answer**
Let me check if x = 5 is correct by substituting back into the original equation:
2(5) + 5 = 10 + 5 = 15 ✓

The equation holds true, so x = 5 is correct.`,
      explanation:
        'The Cognitive Verifier pattern forces the AI to verify its answer by substituting the result back into the original equation, catching any arithmetic errors before presenting the final answer.',
    },
    bestPractices: [
      'Explicitly ask the AI to verify its reasoning',
      'Specify what aspects to check (logic, math, assumptions, completeness)',
      'Combine with Chain-of-Thought for step-by-step verification',
      'Use for critical tasks where errors are costly',
      'Instruct the AI to show its verification process',
      'Ask for confidence level after verification',
    ],
    commonMistakes: [
      'Not specifying what to verify (too vague)',
      'Using for simple tasks where verification adds no value',
      'Expecting perfect verification (AI can still make errors)',
      'Not combining with other patterns (works best with Chain-of-Thought)',
      'Asking for verification but not using the results',
    ],
    relatedPatterns: ['chain-of-thought', 'self-reflection', 'critique-improve'],
  },
  {
    id: 'hypothesis-testing',
    name: 'Hypothesis Testing',
    category: 'Reasoning',
    level: 'advanced',
    shortDescription:
      'Generates multiple plausible explanations or hypotheses and evaluates them systematically',
    fullDescription:
      'The Hypothesis Testing pattern instructs the AI to generate multiple plausible explanations or hypotheses for a problem, then systematically evaluate each one against the available evidence. This is similar to scientific method: propose multiple theories, test them, and determine which best fits the data. This pattern is powerful for complex problems where multiple explanations are possible and you need to find the most likely one.',
    howItWorks:
      'You instruct the AI to: (1) Generate 3-5 plausible hypotheses or explanations, (2) For each hypothesis, identify what evidence would support or refute it, (3) Evaluate each hypothesis against the available evidence, (4) Rank hypotheses by likelihood or strength of evidence, and (5) Present the most likely explanation with reasoning.',
    whenToUse: [
      'Debugging complex systems where multiple root causes are possible',
      'Diagnostic scenarios (medical, technical, business)',
      'Analyzing ambiguous data or situations',
      'Investigating incidents or anomalies',
      'Research problems where multiple theories exist',
      'Decision-making with uncertainty',
      'Root cause analysis',
    ],
    example: {
      before:
        'My application is slow. What could be causing this?',
      after: `My application is slow. Use hypothesis testing to identify the root cause.

**Step 1: Generate Hypotheses**
Generate 3-5 plausible explanations for why the application might be slow:
1. Database query performance issues
2. Network latency or bandwidth constraints
3. Insufficient server resources (CPU, memory)
4. Inefficient code or algorithms
5. External API dependencies causing delays

**Step 2: Evaluate Each Hypothesis**
For each hypothesis, identify:
- What evidence would support it?
- What evidence would refute it?
- What diagnostic steps would confirm it?

**Step 3: Rank Hypotheses**
Rank the hypotheses by likelihood based on available evidence and present the most likely cause with your reasoning.`,
      explanation:
        'Instead of jumping to a single conclusion, the AI systematically considers multiple possibilities and evaluates them, leading to more accurate diagnoses.',
    },
    bestPractices: [
      'Specify the number of hypotheses to generate (3-5 is optimal)',
      'Instruct the AI to evaluate evidence systematically',
      'Ask for ranking based on likelihood or evidence strength',
      'Use for complex problems with multiple possible causes',
      'Combine with diagnostic data or evidence when available',
      'Instruct the AI to explain why each hypothesis is plausible',
    ],
    commonMistakes: [
      'Generating too many hypotheses (overwhelming)',
      'Not providing enough context or evidence for evaluation',
      'Not ranking hypotheses (all seem equally likely)',
      'Using for simple problems with obvious causes',
      'Not following up with diagnostic steps',
    ],
    relatedPatterns: ['chain-of-thought', 'cognitive-verifier', 'flipped-interaction'],
  },
  {
    id: 'rag',
    name: 'RAG (Retrieval Augmented Generation)',
    category: 'Context Management',
    level: 'advanced',
    shortDescription:
      'Retrieves relevant information from external knowledge base before generating response',
    fullDescription:
      'RAG (Retrieval Augmented Generation) is a pattern that combines information retrieval with text generation. Instead of relying solely on the AI\'s training data, RAG first retrieves relevant documents or information from a knowledge base (database, vector store, documentation), then uses that retrieved context to generate accurate, up-to-date responses. This pattern is essential for applications that need to reference specific documents, codebases, or knowledge bases that change frequently or contain domain-specific information not in the AI\'s training data.',
    howItWorks:
      'The RAG process involves: (1) **Query**: User asks a question, (2) **Retrieval**: System searches knowledge base (often using semantic search/embeddings) to find relevant documents, (3) **Augmentation**: Retrieved documents are added to the prompt as context, (4) **Generation**: AI generates response using both its training knowledge and the retrieved context. This ensures answers are grounded in your specific data.',
    whenToUse: [
      'You have a large knowledge base or documentation that changes frequently',
      'You need to answer questions about specific codebases or projects',
      'The AI needs access to information not in its training data',
      'You want to cite sources or provide references',
      'Building chatbots that answer questions about your product/service',
      'Creating AI assistants that reference internal documentation',
      'You need to combine multiple sources of information',
    ],
    example: {
      before:
        'What are the key features of our product?',
      after: `Answer this question using our product documentation.

**Question:** What are the key features of our product?

**Step 1: Retrieve Relevant Information**
Search our product documentation for:
- Feature descriptions
- Product specifications
- Release notes
- User guides

**Step 2: Extract Key Information**
From the retrieved documents, identify:
- Core features
- Feature descriptions
- Use cases
- Technical specifications

**Step 3: Generate Response**
Using the retrieved information, provide a comprehensive answer about our product features. Cite specific documents or sections where information came from.

**Available Documentation:**
[Your knowledge base or documentation source]

Generate the answer based on the retrieved context.`,
      explanation:
        'RAG ensures the AI uses your actual product documentation rather than generic knowledge, resulting in accurate, up-to-date answers that reflect your specific product.',
    },
    bestPractices: [
      'Use semantic search or embeddings for better retrieval',
      'Retrieve top 3-5 most relevant documents',
      'Include source citations in the response',
      'Instruct the AI to use only information from retrieved context',
      'Handle cases where no relevant information is found',
      'Combine retrieved information with AI\'s general knowledge appropriately',
      'Use chunking strategies for large documents',
    ],
    commonMistakes: [
      'Retrieving too many documents (overwhelming context)',
      'Not instructing the AI to prioritize retrieved information',
      'Using simple keyword search instead of semantic search',
      'Not handling cases where retrieval finds nothing',
      'Not citing sources (hard to verify accuracy)',
      'Mixing retrieved context with hallucinated information',
    ],
    relatedPatterns: ['context', 'few-shot', 'template'],
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
