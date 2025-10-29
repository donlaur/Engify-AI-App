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
  engineer:
    'Focus on technical feasibility, implementation details, effort estimation, and code quality',
  architect:
    'Focus on system design, scalability, technical debt, long-term implications, and architectural patterns',
  director:
    'Focus on budget, ROI, resource allocation, business impact, and strategic alignment',
  pm: 'Focus on customer needs, market fit, prioritization, user data, and product strategy',
  tech_lead:
    'Focus on realistic timelines, team capacity, risk assessment, and execution planning',
  designer:
    'Focus on UX implications, user impact, design complexity, and accessibility',
  qa: 'Focus on testing requirements, quality concerns, edge cases, and reliability',
  security:
    'Focus on security vulnerabilities, compliance, data protection, and threat modeling',
  devops:
    'Focus on deployment, infrastructure, monitoring, and operational concerns',
};

function buildMultiAgentPrompt(
  idea: string,
  roles: string[],
  mode: string
): string {
  const roleDescriptions = roles
    .map(
      (role) =>
        `- ${role.toUpperCase()}: ${ROLE_CONTEXTS[role as keyof typeof ROLE_CONTEXTS] || 'General perspective'}`
    )
    .join('\n');

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
    // Debate mode
    return `You are simulating a team meeting where these roles DEBATE this idea:

${roleDescriptions}

IDEA TO DISCUSS:
"${idea}"

Simulate a realistic team discussion where:
1. Each role speaks 2-3 times
2. Roles respond to each other's points
3. Roles can disagree and push back
4. Conversation feels natural (not robotic)
5. End with consensus or vote

Format as a meeting transcript:
[ROLE NAME]: "What they say..."

Show realistic back-and-forth debate.
Include disagreements and resolution.
End with final decision and next steps.`;
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
