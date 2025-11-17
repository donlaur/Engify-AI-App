# Workflows & Guardrails Execution Notes

**Last updated:** November 11, 2025  
**Owner:** Donnie Laur (human-created, AI-assisted)  
**Contact:** donlaur@engify.ai

---

## 1. Objectives
- Launch a `/workflows` pillar that showcases Engify's guardrail mindset and teases upcoming governance tooling.  
- Drive qualified traffic from guardrail-related queries while reinforcing existing prompts/patterns.  
- Provide actionable checklists today, with clear upgrade path to the private guardrail beta.

## 2. Page Structure Requirements
1. **Hero** – "Industry-Proven AI Guardrails & Workflows" headline, subheadline, highlights line, dual CTAs (Explore Workflows & Guardrails / See the Platform), private beta teaser, and author schema.
2. **Why Guardrails Matter** – Summaries of productivity, quality, security, and context-drift data (METR 2025, GitClear, Veracode, Qodo, etc.).
3. **Workflow Library Grid** – Cards grouped by Code Quality, Security, AI Behavior, Memory.
   - Failure mode, manual checklist, related Prompts/Patterns/Learn resources, automation teaser (“Guardrail hook – private beta”), CTA button (Copy checklist / Download template).
4. **Live Practices** – Outline the internal pre-commit, CI, documentation guardrails we run today (source: docs/showcase/AI_WORKFLOW_GUARDRAILS.md).
5. **Deeper Engagement** – CTAs for installing quality checklists and joining the guardrail waitlist.
6. **Community** – Submission CTA (Form or GitHub template), acceptance criteria, contributor highlights/leaderboard.

## 3. Initial Workflow Card Backlog
1. Keep PRs Under Control – 400-line guardrail checklist + PR prompts/patterns.  
2. Stop Schema Guessing – Manual validation steps + architecture prompts/patterns.  
3. Catch Mock Metrics – Detecting fake analytics before release.  
4. Cursor Obedience Kit – Cursor rule bundle, manual instructions.  
5. Memory & Trend Logging – Incident logging + upcoming memory tooling teaser.  
6. Security Guardrails – Pre-flight security checks referencing security prompts/patterns.  
7–8. Community placeholders – "Coming soon" slots encouraging submissions.

Each card cites published research supporting the failure mode.

## 4. Cross-Site Integration
- Add `/workflows` to primary navigation beside Prompts/Patterns (header + mobile menu).
- Provide audience filters (Engineers, DevOps/SRE, QA) on the page.
- Role landing pages gain a "Recommended workflows" carousel.
- Prompt/pattern detail pages expose "Related Workflow" badges.
- Learn hub + `/learn/ai-tools/*` articles include "Suggested Guardrails & Workflows" blocks that map tool modes (Cursor Agent/Plan/Ask, Windsurf flows, Replit Ghostwriter, etc.) to relevant cards.

## 5. SEO & Analytics
- Friendly URLs (`/workflows/<slug>`), HowTo schema on detail pages, sitemap/Search Console updates.
- Target long-tail queries: "kernel prompt engineering," "AI prompts for product managers," "deepseek pricing/v3 0324," and related guardrail searches.
- Track page views, bounce rate, CTA clicks with existing analytics instrumentation.

## 6. Donnie Laur Author Page (`/authors/donnie-laur`)
- Bio highlighting guardrail leadership and Engify mission.  
- Contact info (donlaur@engify.ai), GitHub, LinkedIn, resume link.  
- Showcase authored articles and workflow cards.  
- Structured data (Person/Author) with "Human-created, AI-assisted" transparency.  
- Cross-link on `/workflows`, Learn articles, and resume page.

## 7. Community & Thought Leadership
- Publish workflow submission criteria + intake form/issue template.
- Highlight top contributors.  
- Plan LinkedIn post linking to `/workflows` after launch.  
- Include "Why this matters for engineering leaders" blurb pointing to `/for-managers` and `/hireme`.

## 8. Execution Checklist (Windsurf/Public Site Team)
1. Wireframe `/workflows` layout (Figma/Windsurf).  
2. Build reusable workflow card component + MDX template.  
3. Implement navigation updates and role-page carousel.  
4. Draft and publish six workflow cards.  
5. Add submission CTA + form/issue flow.  
6. Update sitemap, schema, analytics tracking.  
7. Swap homepage hero copy once page is live; confirm waitlist URL.  
8. Ship Donnie Laur author page and link existing articles to the new author ID.

## 9. Open Questions
- Confirm guardrail waitlist link and workflow submission channel (Google Form vs GitHub).  
- Define citation formatting for research callouts.  
- Align launch order for `/workflows` page and homepage hero update.
