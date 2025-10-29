import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Use Groq (free tier) if OpenAI key not available
const apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
const baseURL =
  process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY
    ? 'https://api.groq.com/openai/v1'
    : undefined;

const openai = new OpenAI({
  apiKey,
  baseURL,
});

interface MultiAgentRequest {
  idea: string;
  roles: string[];
  mode: 'sequential' | 'debate';
}

const ROLE_CONTEXTS = {
  engineer: {
    focus:
      'Technical feasibility, implementation details, effort estimation, and code quality',
    personality:
      'Pragmatic and detail-oriented. High conscientiousness. Asks clarifying questions about technical constraints.',
    expertise:
      'Act as a Senior Software Engineer with 8+ years of experience in production systems.',
  },
  architect: {
    focus:
      'System design, scalability, technical debt, long-term implications, and architectural patterns',
    personality:
      'Strategic and cautious. High openness to new patterns but skeptical of shortcuts. Challenges assumptions.',
    expertise:
      'Act as a Principal Architect who has seen multiple systems scale from startup to enterprise.',
  },
  director: {
    focus:
      'Budget, ROI, resource allocation, business impact, and strategic alignment',
    personality:
      'Results-driven and decisive. Moderate agreeableness. Asks about business value and trade-offs.',
    expertise:
      'Act as a Director of Engineering who balances technical excellence with business realities.',
  },
  pm: {
    focus:
      'Customer needs, market fit, prioritization, user data, and product strategy',
    personality:
      'User-focused and collaborative. High extraversion. Pushes for clarity on user impact.',
    expertise:
      'Act as a Senior Product Manager with deep understanding of user research and market dynamics.',
  },
  tech_lead: {
    focus:
      'Realistic timelines, team capacity, risk assessment, and execution planning',
    personality:
      'Balanced and practical. High conscientiousness. Questions overly optimistic estimates.',
    expertise:
      'Act as a Tech Lead who has successfully delivered complex projects and knows where things go wrong.',
  },
  designer: {
    focus: 'UX implications, user impact, design complexity, and accessibility',
    personality:
      'Empathetic and creative. High openness. Advocates for user experience over technical convenience.',
    expertise:
      'Act as a Senior UX Designer who champions accessibility and inclusive design.',
  },
  qa: {
    focus:
      'Testing requirements, quality concerns, edge cases, and reliability',
    personality:
      'Meticulous and skeptical. Very high conscientiousness. Identifies risks others miss.',
    expertise:
      'Act as a Principal QA Engineer known for catching critical bugs before production.',
  },
  security: {
    focus:
      'Security vulnerabilities, compliance, data protection, and threat modeling',
    personality:
      'Vigilant and risk-averse. Low agreeableness when security is at stake. Challenges unsafe assumptions.',
    expertise:
      'Act as a Security Engineer with expertise in threat modeling and compliance (SOC2, GDPR).',
  },
  devops: {
    focus: 'Deployment, infrastructure, monitoring, and operational concerns',
    personality:
      'Reliability-focused and systematic. Asks about observability and failure modes.',
    expertise:
      'Act as a DevOps Engineer who has managed large-scale production systems and incident response.',
  },
};

function buildMultiAgentPrompt(
  idea: string,
  roles: string[],
  mode: string
): string {
  const roleDescriptions = roles
    .map((role) => {
      const context = ROLE_CONTEXTS[role as keyof typeof ROLE_CONTEXTS];
      if (!context) return `- ${role.toUpperCase()}: General perspective`;

      return `- ${role.toUpperCase()}: ${context.expertise}
  Focus: ${context.focus}
  Personality: ${context.personality}`;
    })
    .join('\n\n');

  if (mode === 'sequential') {
    return `You are simulating a team review process. Play ALL of these roles sequentially:

${roleDescriptions}

IDEA TO REVIEW:
"${idea}"

Simulate a realistic team review where:
1. Each role reviews the idea from their perspective
2. Each role references what previous roles said
3. Roles can validate or raise concerns
4. Show handoffs between roles with status indicators

FORMAT YOUR RESPONSE AS A WORKFLOW:

Use these status indicators:
🔄 [ROLE] is reviewing...
✅ [ROLE] approved: [brief summary]
⚠️ [ROLE] found issues: [specific concerns]
🔁 Sending back to [ROLE] to address...

Show the handoffs between roles.
If a role finds issues, show how they're addressed.
End with final status: ✅ APPROVED or ⚠️ NEEDS WORK

Make it feel like a real workflow with realistic feedback.`;
  } else {
    // Debate mode - using 4-step Debate Prompting methodology
    return `You are simulating a team meeting using structured debate methodology. Play ALL of these roles:

${roleDescriptions}

IDEA TO DEBATE:
"${idea}"

Use this 4-STEP DEBATE STRUCTURE:

STEP 1 - INTRODUCE POLARIZED PERSPECTIVES:
- Identify the core tension or trade-off in this idea
- Have 2-3 roles present opposing viewpoints clearly

STEP 2 - EXPLORE EACH SIDE:
- Each side presents their strongest arguments
- Use specific examples, data points, or past experiences
- Ask probing questions: "Have you considered...?" "What about...?"

STEP 3 - CRITICAL COMPARISON:
- Roles directly address and critique each other's points
- Acknowledge valid concerns while defending their position
- Use phrases like "I understand your concern about X, but..."
- Challenge assumptions: "That assumes we have unlimited time, but..."

STEP 4 - SYNTHESIZE AND CONCLUDE:
- Find common ground or acknowledge irreconcilable differences
- Propose a balanced path forward or a clear decision
- Outline next steps and who owns what

Format as a meeting transcript:
[ROLE NAME]: "What they say..."

Make it feel like a real, high-stakes team debate where smart people disagree respectfully.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!apiKey) {
      console.error('No API key found in environment variables');
      return NextResponse.json(
        {
          error:
            'No AI API key configured. Please add OPENAI_API_KEY or GROQ_API_KEY to .env.local',
        },
        { status: 500 }
      );
    }

    const body: MultiAgentRequest = await request.json();
    const { idea, roles, mode = 'sequential' } = body;

    console.log('Multi-agent request:', {
      idea: idea.substring(0, 50) + '...',
      roles,
      mode,
    });

    // Validation
    if (!idea || idea.trim().length === 0) {
      return NextResponse.json({ error: 'Idea is required' }, { status: 400 });
    }
    if (!roles || roles.length === 0) {
      return NextResponse.json(
        { error: 'At least one role is required' },
        { status: 400 }
      );
    }

    if (roles.length > 7) {
      return NextResponse.json(
        { error: 'Maximum 7 roles allowed' },
        { status: 400 }
      );
    }

    // Build the multi-agent prompt
    const prompt = buildMultiAgentPrompt(idea, roles, mode);

    // Call OpenAI or Groq
    const model = baseURL ? 'llama-3.1-70b-versatile' : 'gpt-4';

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert at simulating realistic team discussions and workflow reviews. You understand how different roles think and communicate.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8, // Higher for more creative/varied responses
      max_tokens: 2000,
    });

    const simulation =
      completion.choices[0]?.message?.content ||
      'Unable to generate simulation.';

    console.log(
      'Simulation generated successfully. Length:',
      simulation.length
    );

    return NextResponse.json({
      success: true,
      simulation,
      metadata: {
        idea,
        roles,
        mode,
        model,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Multi-agent simulation error:', error);
    console.error(
      'Error details:',
      error instanceof Error ? error.message : 'Unknown error'
    );

    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate multi-agent simulation' },
      { status: 500 }
    );
  }
}
