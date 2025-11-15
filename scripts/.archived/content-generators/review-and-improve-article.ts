#!/usr/bin/env tsx
/**
 * Article Review & Improvement Script
 * 
 * Takes the generated article and passes it through editorial review
 * for flow, readability, image suggestions, and actionable tips.
 */

import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function reviewArticle(articlePath: string) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Multi-Agent Editorial Review & Improvement                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Read the article
  const content = fs.readFileSync(articlePath, 'utf-8');
  console.log(`📖 Reading article: ${path.basename(articlePath)}`);
  console.log(`📊 Current length: ${content.split(/\s+/).length} words`);
  console.log('');
  console.log('⏳ Running editorial review (2-3 minutes)...');
  console.log('');

  // Agent 1: Content Editor (Flow & Structure)
  console.log('🤖 Agent 1: Content Editor (Flow & Readability)...');
  const editorReview = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a professional content editor reviewing technical articles for flow, readability, and engagement.

Focus on:
1. **Flow**: Does information flow logically? Are transitions smooth?
2. **Readability**: Are paragraphs too long? Is it scannable?
3. **Engagement**: Will readers stay interested?
4. **Structure**: Are headings clear? Is hierarchy logical?
5. **Pacing**: Does it move well or drag in places?

Provide specific, actionable feedback in JSON format.`
      },
      {
        role: 'user',
        content: `Review this article for flow and readability:

${content}

Provide feedback in this format:
{
  "overallScore": 1-10,
  "strengths": ["what flows well"],
  "issues": ["specific flow problems"],
  "improvements": ["actionable fixes"],
  "suggestedReorganization": "if sections should be reordered"
}`
      }
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const editorFeedback = JSON.parse(editorReview.choices[0]?.message?.content || '{}');
  console.log(`   ✅ Score: ${editorFeedback.overallScore}/10`);
  console.log(`   📝 ${editorFeedback.improvements?.length || 0} improvements suggested`);
  console.log('');

  // Agent 2: Visual Designer (Image Suggestions)
  console.log('🤖 Agent 2: Visual Designer (Image & Diagram Ideas)...');
  const designerReview = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a visual designer suggesting images, diagrams, and visual elements for technical articles.

For each suggestion provide:
1. **Type**: Diagram, screenshot, illustration, code comparison, flowchart, etc.
2. **Location**: Where in the article (after which heading)
3. **Purpose**: Why this visual helps
4. **Description**: What it should show
5. **Alt text**: For accessibility

Focus on visuals that clarify complex concepts, break up text walls, and improve comprehension. Return response in JSON format.`
      },
      {
        role: 'user',
        content: `Suggest 3-5 images/diagrams for this article:

${content}

Return JSON:
{
  "suggestions": [
    {
      "type": "diagram|screenshot|illustration|comparison|flowchart",
      "placement": "after which section",
      "purpose": "why this helps",
      "description": "what to show",
      "altText": "accessibility description"
    }
  ]
}`
      }
    ],
    temperature: 0.5,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  });

  const designFeedback = JSON.parse(designerReview.choices[0]?.message?.content || '{}');
  console.log(`   ✅ ${designFeedback.suggestions?.length || 0} visual elements suggested`);
  console.log('');

  // Agent 3: Actionability Expert
  console.log('🤖 Agent 3: Actionability Expert (Practical Tips)...');
  const actionabilityReview = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are an expert at making content actionable. You focus on:

1. **Concrete Steps**: Are instructions specific enough to follow?
2. **Examples**: Are they real and practical?
3. **Checklists**: Where would a checklist help?
4. **Quick Wins**: What can readers do in 5 minutes?
5. **Common Mistakes**: What should they avoid?

Suggest ways to make the content MORE actionable. Provide response in JSON format.`
      },
      {
        role: 'user',
        content: `Review this article for actionability:

${content}

Provide JSON:
{
  "actionabilityScore": 1-10,
  "strengths": ["what's already actionable"],
  "gaps": ["where it's too theoretical"],
  "suggestions": [
    {
      "section": "which section",
      "improvement": "what to add",
      "example": "concrete example if applicable"
    }
  ],
  "checklistIdeas": ["where to add checklists"],
  "quickWins": ["5-minute actions readers can take"]
}`
      }
    ],
    temperature: 0.4,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const actionFeedback = JSON.parse(actionabilityReview.choices[0]?.message?.content || '{}');
  console.log(`   ✅ Score: ${actionFeedback.actionabilityScore}/10`);
  console.log(`   💡 ${actionFeedback.quickWins?.length || 0} quick wins identified`);
  console.log('');

  // Generate improvement report
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 EDITORIAL REVIEW COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  const report = `# Editorial Review Report
**Article:** ${path.basename(articlePath)}
**Date:** ${new Date().toISOString()}

---

## Overall Assessment

**Content Editor Score:** ${editorFeedback.overallScore}/10
**Actionability Score:** ${actionFeedback.actionabilityScore}/10
**Average:** ${((editorFeedback.overallScore + actionFeedback.actionabilityScore) / 2).toFixed(1)}/10

---

## 1. Content Editor Feedback (Flow & Readability)

### ✅ Strengths
${editorFeedback.strengths?.map((s: string) => `- ${s}`).join('\n') || '- None noted'}

### ⚠️ Issues
${editorFeedback.issues?.map((i: string) => `- ${i}`).join('\n') || '- None noted'}

### 💡 Improvements
${editorFeedback.improvements?.map((i: string) => `- ${i}`).join('\n') || '- None suggested'}

${editorFeedback.suggestedReorganization ? `### 🔄 Suggested Reorganization\n${editorFeedback.suggestedReorganization}\n` : ''}

---

## 2. Visual Designer Feedback (Images & Diagrams)

${designFeedback.suggestions?.map((s: any, i: number) => `
### Image ${i + 1}: ${s.type}

**Placement:** ${s.placement}
**Purpose:** ${s.purpose}

**Description:**
${s.description}

**Alt Text:** \`${s.altText}\`

**Implementation Note:** 
\`\`\`markdown
![${s.altText}](/images/cursor-2-0-${s.type.toLowerCase()}-${i + 1}.png)

*${s.purpose}*
\`\`\`

---
`).join('\n') || 'No suggestions'}

---

## 3. Actionability Expert Feedback

### ✅ What's Working
${actionFeedback.strengths?.map((s: string) => `- ${s}`).join('\n') || '- None noted'}

### ⚠️ Gaps (Too Theoretical)
${actionFeedback.gaps?.map((g: string) => `- ${g}`).join('\n') || '- None noted'}

### 💡 Suggestions to Improve Actionability

${actionFeedback.suggestions?.map((s: any, i: number) => `
#### ${i + 1}. ${s.section}
**Add:** ${s.improvement}
${s.example ? `**Example:** ${s.example}` : ''}
`).join('\n') || 'No specific suggestions'}

### ✅ Checklist Ideas
${actionFeedback.checklistIdeas?.map((c: string) => `- ${c}`).join('\n') || '- None suggested'}

### ⚡ Quick Wins (5-Minute Actions)
${actionFeedback.quickWins?.map((q: string) => `- [ ] ${q}`).join('\n') || '- None identified'}

---

## 4. Priority Action Items

Based on all feedback, here are the top priorities:

### High Priority (Do First)
1. **Flow improvements** - ${editorFeedback.improvements?.[0] || 'Address any structural issues'}
2. **Add visuals** - ${designFeedback.suggestions?.[0]?.description || 'Add at least 2-3 diagrams'}
3. **More actionable** - ${actionFeedback.suggestions?.[0]?.improvement || 'Add concrete examples'}

### Medium Priority
4. ${editorFeedback.improvements?.[1] || 'Polish paragraph transitions'}
5. ${actionFeedback.quickWins?.[0] || 'Add quick win checklist'}

### Low Priority (Polish)
6. ${editorFeedback.improvements?.[2] || 'Final readability pass'}

---

## 5. Next Steps

1. **Review this report** - Understand the feedback
2. **Apply high-priority fixes** - Start with flow and visuals
3. **Add actionable elements** - Checklists, quick wins
4. **Create/commission images** - Based on designer suggestions
5. **Final polish** - Read aloud for flow
6. **Publish** - Ship it!

---

**Generated by:** Multi-Agent Editorial Review System
**Models Used:** GPT-4 Turbo (Content Editor, Visual Designer, Actionability Expert)
`;

  // Save report
  const reportPath = articlePath.replace('.md', '-EDITORIAL-REVIEW.md');
  fs.writeFileSync(reportPath, report);

  console.log('📄 Reports Generated:');
  console.log(`   📋 Editorial Review: ${reportPath}`);
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Content Flow: ${editorFeedback.overallScore}/10`);
  console.log(`   Actionability: ${actionFeedback.actionabilityScore}/10`);
  console.log(`   Visual Elements: ${designFeedback.suggestions?.length || 0} suggested`);
  console.log(`   Quick Wins: ${actionFeedback.quickWins?.length || 0} identified`);
  console.log('');
  console.log('✅ Review complete! Check the report for detailed feedback.');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
}

// Main
async function main() {
  const articlePath = path.join(
    process.cwd(),
    'content/drafts/2025-11-02-enhancing-cursor-2-0-with-workflows-guardrails.md'
  );

  if (!fs.existsSync(articlePath)) {
    console.error('❌ Article not found:', articlePath);
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found');
    process.exit(1);
  }

  await reviewArticle(articlePath);
}

main().catch(console.error);

