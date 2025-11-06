/**
 * Generate and Seed Prompts for Weak Roles
 *
 * Identifies roles with low prompt counts and generates prompts based on role content
 * or common use cases for those roles.
 *
 * Run with: pnpm tsx scripts/content/seed-weak-role-prompts.ts
 *
 * Options:
 *   --role=director          # Generate for specific role only
 *   --min-prompt-count=10    # Only generate for roles with fewer than this many prompts
 *   --dry-run                # Preview without creating prompts
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { generateSlug } from '@/lib/utils/slug';
import { randomUUID } from 'crypto';

interface PromptTemplate {
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
}

// Prompt templates for weak roles
const PROMPT_TEMPLATES: Record<string, PromptTemplate[]> = {
  director: [
    {
      title: 'Strategic Technology Investment Analysis',
      description:
        'Evaluate technology investments from a strategic business perspective, including ROI, risk assessment, and competitive advantage.',
      content: `# Strategic Technology Investment Analysis

## Problem Context

Engineering Directors need to make strategic technology investment decisions that balance technical needs with business objectives. These decisions require comprehensive analysis of ROI, risk, competitive advantage, and organizational impact.

## Solution Pattern: Chain-of-Thought Pattern

The Chain-of-Thought Pattern breaks down complex strategic decisions into logical steps, ensuring all factors are considered systematically.

## Prompt Template

Act as an Engineering Director's strategic advisor. I'm evaluating a technology investment:

**Investment Proposal:**
- Technology/Initiative: [Describe the technology or initiative]
- Initial Cost: [Investment amount]
- Timeline: [Expected timeline]
- Team Impact: [How many teams/engineers affected]

**Analysis Required:**

1. **Business Value Assessment**
   - What business problems does this solve?
   - What's the ROI calculation? (quantify benefits vs costs)
   - What competitive advantages does this provide?
   - How does this align with company strategy?

2. **Risk Analysis**
   - Technical risks (implementation, maintenance, scalability)
   - Business risks (adoption, vendor lock-in, market changes)
   - Organizational risks (team capacity, change management)
   - Mitigation strategies for each risk

3. **Resource Requirements**
   - Engineering resources needed
   - Training and onboarding requirements
   - Infrastructure and tooling costs
   - Ongoing maintenance and support

4. **Comparison with Alternatives**
   - Alternative solutions considered
   - Build vs buy vs partner analysis
   - Cost-benefit comparison

5. **Recommendation**
   - Go/no-go decision with clear rationale
   - If go: Phased rollout plan and success metrics
   - If no-go: Alternative path forward

Provide a comprehensive analysis that helps make an informed strategic decision.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'general',
      tags: ['strategy', 'roi', 'investment', 'decision-making', 'executive'],
    },
    {
      title: 'Organizational Transformation Plan',
      description:
        'Create a comprehensive plan for organizational transformation, including change management, team structure, and success metrics.',
      content: `# Organizational Transformation Plan

## Problem Context

Engineering Directors lead organizational transformations that reshape how teams work, structure, and deliver value. These transformations require careful planning, stakeholder alignment, and change management.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured framework for transformation planning, ensuring all critical aspects are considered.

## Prompt Template

Act as an Engineering Director leading an organizational transformation. Create a transformation plan for:

**Transformation Goals:**
- Primary Objective: [e.g., "Shift to autonomous teams", "Adopt AI-first development", "Move to microservices"]
- Business Drivers: [Why this transformation is needed]
- Success Criteria: [How we'll measure success]

**Create a comprehensive plan:**

1. **Current State Analysis**
   - Current organizational structure
   - Key pain points and constraints
   - Team capabilities and readiness
   - Technology landscape

2. **Target State Vision**
   - Desired organizational structure
   - New ways of working
   - Required capabilities
   - Success metrics

3. **Transformation Roadmap**
   - Phase 1 (Months 1-3): Foundation and pilot
   - Phase 2 (Months 4-6): Expansion
   - Phase 3 (Months 7-12): Scale and optimize
   - Each phase should include: deliverables, success criteria, risks

4. **Change Management Strategy**
   - Stakeholder communication plan
   - Team training and enablement
   - Resistance management
   - Quick wins to build momentum

5. **Risk Mitigation**
   - Key risks and mitigation strategies
   - Contingency plans
   - Success indicators and early warning signs

6. **Resource Requirements**
   - Team structure changes
   - Budget needs
   - Technology investments
   - External support needed

Provide a detailed, actionable plan that balances ambition with realism.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'general',
      tags: [
        'transformation',
        'change-management',
        'strategy',
        'organizational',
        'leadership',
      ],
    },
    {
      title: 'Executive Communication Framework',
      description:
        'Translate technical concepts and engineering initiatives into executive-level communications that focus on business value.',
      content: `# Executive Communication Framework

## Problem Context

Engineering Directors must communicate technical initiatives to executive leadership in a way that demonstrates business value, not just technical complexity. This requires translating engineering work into business metrics and outcomes.

## Solution Pattern: Audience-Persona Pattern

The Audience-Persona Pattern tailors communication to the specific audience (executives), focusing on what matters to them: business impact, ROI, risk, and strategic alignment.

## Prompt Template

Act as an Engineering Director preparing executive communication. Translate this technical initiative into executive language:

**Technical Initiative:**
- Initiative: [Name of technical project/initiative]
- Technical Details: [Technical description]
- Current Status: [Where we are]
- Technical Challenges: [Key technical issues]

**Create executive communication:**

1. **Executive Summary (1-2 paragraphs)**
   - What are we doing? (business language, not technical)
   - Why does it matter? (business impact)
   - What's the ask? (resources, timeline, support)

2. **Business Value**
   - Revenue impact (if applicable)
   - Cost savings or efficiency gains
   - Competitive advantage
   - Risk reduction

3. **Status Update**
   - Progress vs plan (high-level milestones)
   - Key achievements
   - Challenges (framed as business risks, not technical problems)

4. **Resource Needs**
   - Budget requirements
   - Timeline and milestones
   - Dependencies on other initiatives
   - Support needed from leadership

5. **Recommendation**
   - Next steps and decisions needed
   - Go/no-go recommendation
   - Alternative options if applicable

Use clear, concise language. Avoid technical jargon. Focus on business outcomes, not technical implementation details.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'general',
      tags: [
        'communication',
        'executive',
        'presentation',
        'strategy',
        'leadership',
      ],
    },
    {
      title: 'Team Scaling Strategy',
      description:
        'Develop a comprehensive team scaling strategy that balances growth with quality, culture, and sustainable practices.',
      content: `# Team Scaling Strategy

## Problem Context

Engineering Directors need to scale teams rapidly while maintaining quality, culture, and sustainable practices. Scaling requires careful planning across hiring, onboarding, team structure, and tooling.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured approach to scaling planning, ensuring all critical aspects are addressed.

## Prompt Template

Act as an Engineering Director planning team scaling. Create a scaling strategy:

**Scaling Context:**
- Current Team Size: [Number of engineers]
- Target Team Size: [Number after scaling]
- Timeline: [When scaling needs to happen]
- Business Drivers: [Why scaling is needed]

**Create a comprehensive scaling plan:**

1. **Hiring Strategy**
   - Roles to hire (breakdown by level and specialty)
   - Hiring timeline and milestones
   - Sourcing strategy (internal, external, referrals)
   - Interview process and evaluation criteria

2. **Team Structure**
   - Organizational design (teams, reporting structure)
   - Team composition and specialization
   - Leadership requirements (managers, tech leads)
   - Cross-functional collaboration model

3. **Onboarding Plan**
   - Ramp-up timeline expectations
   - Onboarding curriculum and materials
   - Mentorship and buddy programs
   - Success metrics for new hires

4. **Infrastructure Scaling**
   - Tooling and platforms needed
   - Process evolution (agile, ceremonies, workflows)
   - Knowledge management systems
   - Communication and collaboration tools

5. **Culture Preservation**
   - How to maintain culture during growth
   - Values and principles to reinforce
   - Team building and connection strategies
   - Preventing silos and fragmentation

6. **Risk Mitigation**
   - Common scaling pitfalls to avoid
   - Quality gates and guardrails
   - Early warning indicators
   - Contingency plans

7. **Success Metrics**
   - How to measure scaling success
   - Team health indicators
   - Productivity and quality metrics
   - Culture and engagement metrics

Provide a detailed, actionable plan that enables sustainable growth.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'general',
      tags: ['scaling', 'hiring', 'team-building', 'strategy', 'leadership'],
    },
    {
      title: 'Technology Portfolio Management',
      description:
        'Manage and optimize the technology portfolio, including technical debt, tool consolidation, and architecture decisions.',
      content: `# Technology Portfolio Management

## Problem Context

Engineering Directors manage complex technology portfolios with multiple tools, platforms, and systems. Effective portfolio management requires balancing innovation, maintenance, technical debt, and business needs.

## Solution Pattern: Chain-of-Thought Pattern

The Chain-of-Thought Pattern helps systematically evaluate and optimize technology portfolios by breaking down complex decisions into clear steps.

## Prompt Template

Act as an Engineering Director managing a technology portfolio. Help optimize our technology stack:

**Current Portfolio:**
- Technologies in use: [List key technologies]
- Technical debt areas: [Known debt]
- Pain points: [Current challenges]
- Business constraints: [Budget, timeline, resources]

**Provide portfolio analysis:**

1. **Portfolio Assessment**
   - Catalog all technologies and their purposes
   - Usage patterns and adoption levels
   - Maintenance burden and costs
   - Strategic importance to business

2. **Technical Debt Analysis**
   - Identify high-impact debt areas
   - Quantify debt (cost, risk, technical impact)
   - Prioritize debt repayment based on ROI
   - Create debt repayment roadmap

3. **Consolidation Opportunities**
   - Identify redundant or overlapping tools
   - Consolidation candidates and rationale
   - Migration plan and risks
   - Cost savings and efficiency gains

4. **Technology Gaps**
   - Missing capabilities needed for business goals
   - Emerging technologies to evaluate
   - Strategic technology investments
   - Build vs buy vs partner analysis

5. **Optimization Recommendations**
   - Technologies to retire or replace
   - Technologies to standardize on
   - Investments to make
   - Process improvements

6. **Implementation Roadmap**
   - Prioritized action items
   - Timeline and milestones
   - Resource requirements
   - Success metrics

Provide clear, actionable recommendations that balance technical excellence with business pragmatism.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'architecture',
      tags: [
        'portfolio-management',
        'technical-debt',
        'architecture',
        'optimization',
        'strategy',
      ],
    },
  ],
  'scrum-master': [
    {
      title: 'Sprint Planning Facilitator',
      description:
        'Facilitate effective sprint planning sessions that align team capacity with product goals and create actionable sprint backlogs.',
      content: `# Sprint Planning Facilitator

## Problem Context

Scrum Masters facilitate sprint planning sessions that balance team capacity, product priorities, and technical constraints. Effective planning requires structure, collaboration, and realistic estimation.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured framework for sprint planning, ensuring all critical aspects are addressed systematically.

## Prompt Template

Act as a Scrum Master facilitating sprint planning. Guide the team through planning:

**Context:**
- Team: [Team name/size]
- Sprint Duration: [1 week, 2 weeks, etc.]
- Product Backlog: [Available user stories/features]
- Previous Sprint Velocity: [Story points completed]

**Facilitate planning:**

1. **Sprint Goal Setting**
   - Review product roadmap priorities
   - Identify sprint goal (what value will be delivered?)
   - Ensure goal is measurable and achievable

2. **Capacity Planning**
   - Team member availability (time off, other commitments)
   - Calculate total capacity
   - Account for ceremonies, slack time, unexpected work

3. **Backlog Refinement**
   - Review and clarify user stories
   - Break down large stories into sprint-sized work
   - Add acceptance criteria and technical details
   - Identify dependencies and blockers

4. **Story Estimation**
   - Use planning poker or relative sizing
   - Discuss complexity, unknowns, and risks
   - Ensure estimates are realistic, not optimistic
   - Re-estimate if stories are too large

5. **Sprint Backlog Creation**
   - Select stories that fit within capacity
   - Prioritize by business value and dependencies
   - Ensure work is balanced across team members
   - Leave buffer for unexpected work

6. **Definition of Done**
   - Review and confirm definition of done
   - Ensure all stories meet quality standards
   - Clarify testing, code review, documentation requirements

7. **Risk Identification**
   - Identify potential blockers
   - Discuss mitigation strategies
   - Plan for uncertainty

Create a clear, actionable sprint plan that teams can execute confidently.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'general',
      tags: ['sprint-planning', 'agile', 'scrum', 'facilitation', 'planning'],
    },
    {
      title: 'Retrospective Facilitator',
      description:
        'Facilitate effective retrospectives that drive continuous improvement and team growth.',
      content: `# Retrospective Facilitator

## Problem Context

Scrum Masters facilitate retrospectives that help teams learn, improve, and grow. Effective retrospectives require creating a safe space, structured discussion, and actionable outcomes.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured framework for retrospectives, ensuring teams extract maximum value from reflection.

## Prompt Template

Act as a Scrum Master facilitating a sprint retrospective. Guide the team through reflection:

**Context:**
- Sprint: [Sprint number/name]
- Duration: [Sprint length]
- Team: [Team members]
- Sprint Goal: [What was the goal?]

**Facilitate retrospective:**

1. **Set the Stage**
   - Create safe, open environment
   - Remind team of retrospective purpose
   - Establish ground rules (respect, constructive feedback)

2. **Gather Data**
   - What went well? (celebrate successes)
   - What didn't go well? (identify challenges)
   - What was surprising? (unexpected learnings)
   - Use data: velocity, metrics, incidents

3. **Generate Insights**
   - Identify patterns and root causes
   - Discuss "why" behind issues
   - Connect observations to systemic problems
   - Prioritize what matters most

4. **Decide What to Do**
   - Generate improvement ideas
   - Prioritize actions (high impact, low effort first)
   - Create specific, actionable items
   - Assign owners and timelines

5. **Action Plan**
   - Document action items clearly
   - Set follow-up date
   - Commit to change
   - Track progress from previous retrospectives

**Retrospective Formats:**
- Start/Stop/Continue
- Mad/Sad/Glad
- 4Ls (Liked, Learned, Lacked, Longed for)
- Timeline (chronological events)

Facilitate discussion that leads to concrete improvements.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'general',
      tags: [
        'retrospective',
        'agile',
        'scrum',
        'facilitation',
        'continuous-improvement',
      ],
    },
    {
      title: 'Impediment Remover',
      description:
        'Identify, track, and remove impediments that block team progress and productivity.',
      content: `# Impediment Remover

## Problem Context

Scrum Masters identify and remove impediments that block team progress. Effective impediment management requires visibility, prioritization, and systematic resolution.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured approach to impediment management, ensuring blockers are tracked and resolved efficiently.

## Prompt Template

Act as a Scrum Master managing team impediments. Help remove blockers:

**Current Impediments:**
- [List current blockers]
- Impact: [How is this affecting the team?]
- Duration: [How long has this been blocked?]

**Impeding Management Process:**

1. **Impediment Identification**
   - What's blocking progress?
   - Who is affected?
   - What's the impact? (velocity, quality, morale)
   - Is it a real blocker or just a challenge?

2. **Categorization**
   - Technical (tools, infrastructure, dependencies)
   - Process (workflow, communication, ceremonies)
   - Organizational (budget, approvals, policies)
   - People (skills, capacity, availability)

3. **Prioritization**
   - Impact on sprint goal
   - Number of people affected
   - Urgency and severity
   - Ease of resolution

4. **Resolution Strategy**
   - Can team solve internally?
   - What help is needed? (management, other teams, vendors)
   - Escalation path if needed
   - Workaround options while resolving

5. **Tracking**
   - Document impediment clearly
   - Assign owner
   - Set resolution target date
   - Update status regularly
   - Escalate if stuck

6. **Prevention**
   - Identify patterns (common impediments)
   - Process improvements to prevent recurrence
   - Team capability building

Provide a clear action plan to remove blockers and prevent future impediments.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'general',
      tags: ['impediments', 'blockers', 'scrum', 'agile', 'problem-solving'],
    },
  ],
  designer: [
    {
      title: 'User Research Synthesis',
      description:
        'Synthesize user research data into actionable insights and design recommendations.',
      content: `# User Research Synthesis

## Problem Context

Designers conduct user research but need to synthesize complex data into clear insights that inform design decisions. Effective synthesis requires pattern recognition, prioritization, and clear communication.

## Solution Pattern: Chain-of-Thought Pattern

The Chain-of-Thought Pattern breaks down research synthesis into systematic steps, ensuring insights are extracted methodically.

## Prompt Template

Act as a UX Designer synthesizing user research. Transform research data into design insights:

**Research Data:**
- Research Type: [Interviews, surveys, usability tests, analytics]
- Participants: [Number and type]
- Key Findings: [Raw data, quotes, observations]

**Synthesis Process:**

1. **Data Organization**
   - Group similar observations
   - Identify themes and patterns
   - Note outliers and edge cases
   - Distinguish facts from assumptions

2. **Insight Extraction**
   - What are users really trying to accomplish?
   - What are the core pain points?
   - What are users' mental models?
   - What are the emotional drivers?

3. **Prioritization**
   - High-impact, high-frequency issues
   - Quick wins vs long-term improvements
   - User needs vs business goals
   - Technical feasibility

4. **Design Implications**
   - How do insights inform design decisions?
   - What design patterns could address these needs?
   - What should we start/stop/continue?
   - What questions still need answering?

5. **Recommendations**
   - Specific design changes to make
   - Areas requiring further research
   - Design principles to follow
   - Success metrics for designs

6. **Communication**
   - Create visual summary (charts, diagrams)
   - Key insight statements
   - User quotes that illustrate insights
   - Prioritized action items

Provide clear, actionable insights that drive design decisions.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'general',
      tags: ['user-research', 'synthesis', 'ux', 'design', 'insights'],
    },
    {
      title: 'Design System Documentation Generator',
      description:
        'Create comprehensive design system documentation that enables consistent design implementation.',
      content: `# Design System Documentation Generator

## Problem Context

Designers need to document design systems that enable consistent implementation across teams and products. Effective documentation requires clarity, examples, and developer-friendly guidance.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured framework for design system documentation, ensuring all critical aspects are covered.

## Prompt Template

Act as a Design System Designer creating documentation. Document design system components:

**Component to Document:**
- Component Name: [e.g., "Button", "Form Input", "Card"]
- Design Specifications: [Visual design details]
- Variants: [Different states/types]

**Documentation Structure:**

1. **Overview**
   - Purpose and use cases
   - When to use vs when not to use
   - Accessibility considerations
   - Examples of correct usage

2. **Specifications**
   - Visual design (colors, typography, spacing)
   - Size variants and responsive behavior
   - States (default, hover, active, disabled, error)
   - Animations and transitions

3. **Implementation**
   - Code examples (React, Vue, HTML/CSS)
   - Props/parameters
   - Styling guidelines
   - Integration instructions

4. **Design Tokens**
   - Color values
   - Typography scale
   - Spacing system
   - Breakpoints

5. **Usage Guidelines**
   - Best practices
   - Common mistakes to avoid
   - Accessibility requirements
   - Responsive considerations

6. **Examples**
   - Real-world usage examples
   - Good vs bad examples
   - Variations and combinations
   - Edge cases

Create documentation that designers and developers can use to implement consistently.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'documentation',
      tags: ['design-system', 'documentation', 'components', 'ux', 'design'],
    },
    {
      title: 'Design Handoff Checklist',
      description:
        'Ensure smooth design-to-development handoff with comprehensive specifications and clear communication.',
      content: `# Design Handoff Checklist

## Problem Context

Designers need to hand off designs to developers in a way that ensures accurate implementation. Effective handoffs require clear specifications, communication, and collaboration.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured checklist for design handoffs, ensuring nothing is missed.

## Prompt Template

Act as a Designer preparing a design handoff. Use this checklist:

**Design to Handoff:**
- Feature/Component: [Name]
- Design Files: [Figma, Sketch, etc.]
- Design Changes: [What's new/modified]

**Handoff Checklist:**

1. **Design Specifications**
   - ✅ All screens/states designed
   - ✅ Dimensions and spacing specified
   - ✅ Colors, typography, and assets provided
   - ✅ Responsive breakpoints defined
   - ✅ Animation and interaction specs included

2. **Assets Preparation**
   - ✅ Icons exported in all needed formats
   - ✅ Images optimized and compressed
   - ✅ Naming conventions followed
   - ✅ Assets organized in clear folders

3. **Documentation**
   - ✅ Design rationale documented
   - ✅ User flows and interactions explained
   - ✅ Edge cases and error states designed
   - ✅ Accessibility considerations noted

4. **Developer Communication**
   - ✅ Key decisions and constraints explained
   - ✅ Technical considerations discussed
   - ✅ Questions and assumptions documented
   - ✅ Timeline and priorities communicated

5. **Quality Assurance**
   - ✅ Design reviewed for consistency
   - ✅ Accessibility checked
   - ✅ Responsive design verified
   - ✅ Design system components used

6. **Collaboration Setup**
   - ✅ Review meeting scheduled
   - ✅ Feedback channels established
   - ✅ Design files shared and accessible
   - ✅ Handoff timeline communicated

Create a comprehensive handoff package that enables smooth implementation.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'documentation',
      tags: ['handoff', 'design', 'collaboration', 'specifications', 'ux'],
    },
  ],
  architect: [
    {
      title: 'System Architecture Design Review',
      description:
        'Review and validate system architecture designs for scalability, maintainability, and best practices.',
      content: `# System Architecture Design Review

## Problem Context

Software Architects design system architectures that need to be reviewed for scalability, maintainability, security, and alignment with best practices. Effective reviews require structured evaluation and actionable feedback.

## Solution Pattern: Chain-of-Thought Pattern

The Chain-of-Thought Pattern breaks down architecture review into systematic evaluation steps, ensuring all critical aspects are assessed.

## Prompt Template

Act as a Software Architect reviewing a system architecture design. Evaluate:

**Architecture to Review:**
- System Name: [Name]
- Architecture Type: [Microservices, monolith, serverless, etc.]
- Design Documents: [Available documentation]

**Review Process:**

1. **Architecture Overview**
   - Understand the system's purpose and scope
   - Identify key components and their relationships
   - Review architectural patterns and decisions
   - Assess alignment with requirements

2. **Scalability Analysis**
   - Can it handle expected load?
   - What are the bottlenecks?
   - How does it scale horizontally/vertically?
   - Is the data model scalable?

3. **Maintainability Assessment**
   - Is the architecture easy to understand?
   - Are components loosely coupled?
   - Is code organization clear?
   - Are there documentation gaps?

4. **Security Review**
   - Authentication and authorization strategy
   - Data protection and encryption
   - API security
   - Vulnerability considerations

5. **Performance Evaluation**
   - Expected performance characteristics
   - Potential performance issues
   - Caching and optimization strategies
   - Resource utilization

6. **Technology Choices**
   - Are technology choices appropriate?
   - Framework and library selections
   - Infrastructure decisions
   - Future-proofing considerations

7. **Recommendations**
   - Strengths to preserve
   - Areas for improvement
   - Specific technical recommendations
   - Risk mitigation strategies

8. **Alternative Approaches**
   - Other architectural patterns to consider
   - Trade-offs and comparisons
   - Migration path if changes needed

Provide comprehensive, actionable feedback that improves the architecture.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'architecture',
      tags: [
        'architecture-review',
        'system-design',
        'scalability',
        'best-practices',
        'technical-leadership',
      ],
    },
    {
      title: 'Technology Selection Framework',
      description:
        'Select appropriate technologies based on requirements, constraints, and long-term considerations.',
      content: `# Technology Selection Framework

## Problem Context

Software Architects need to select technologies that balance immediate needs with long-term maintainability, team capabilities, and business constraints. Effective selection requires systematic evaluation.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured framework for technology evaluation, ensuring all critical factors are considered.

## Prompt Template

Act as a Software Architect selecting technology. Evaluate options:

**Selection Context:**
- Use Case: [What problem are we solving?]
- Requirements: [Functional and non-functional requirements]
- Constraints: [Budget, timeline, team skills, infrastructure]
- Options: [Technologies/frameworks to evaluate]

**Evaluation Framework:**

1. **Requirements Analysis**
   - Functional requirements (what must it do?)
   - Non-functional requirements (performance, scalability, security)
   - Integration requirements
   - Compliance and regulatory needs

2. **Technology Evaluation**
   - For each option:
     - Feature fit (does it meet requirements?)
     - Performance characteristics
     - Scalability and limitations
     - Ecosystem and community support
     - Learning curve and team readiness
     - Cost (licensing, infrastructure, development time)

3. **Risk Assessment**
   - Vendor lock-in risk
   - Technology maturity and stability
   - Community and support availability
   - Future maintenance burden
   - Upgrade and migration paths

4. **Team Fit**
   - Team expertise and learning curve
   - Development velocity impact
   - Hiring and onboarding considerations
   - Knowledge transfer requirements

5. **Long-Term Considerations**
   - Technology roadmap and future
   - Community trends and adoption
   - Deprecation risk
   - Ecosystem evolution

6. **Recommendation**
   - Recommended choice with rationale
   - Decision matrix summary
   - Implementation plan
   - Risk mitigation strategies

Provide a clear recommendation with supporting analysis.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'architecture',
      tags: [
        'technology-selection',
        'decision-making',
        'evaluation',
        'architecture',
        'technical-leadership',
      ],
    },
  ],
  'devops-sre': [
    {
      title: 'Infrastructure as Code Review',
      description:
        'Review Infrastructure as Code (IaC) for best practices, security, and maintainability.',
      content: `# Infrastructure as Code Review

## Problem Context

DevOps/SRE engineers write Infrastructure as Code (IaC) that needs to be reviewed for correctness, security, and best practices. Effective reviews prevent production issues and ensure maintainability.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured review checklist for IaC, ensuring all critical aspects are evaluated.

## Prompt Template

Act as a DevOps/SRE engineer reviewing Infrastructure as Code. Review:

**IaC to Review:**
- Tool: [Terraform, CloudFormation, Pulumi, etc.]
- Infrastructure: [What's being provisioned?]
- Code Files: [IaC code to review]

**Review Checklist:**

1. **Code Quality**
   - Is code well-organized and modular?
   - Are resources properly named?
   - Is there reusable code (modules/functions)?
   - Are variables and outputs clear?

2. **Security Review**
   - Are secrets and sensitive data handled securely?
   - Are IAM roles and permissions least-privilege?
   - Are network security groups configured correctly?
   - Are encryption settings appropriate?
   - Are public endpoints avoided when possible?

3. **Best Practices**
   - Are resource tags applied consistently?
   - Is state management handled correctly?
   - Are environment-specific configurations separated?
   - Are DRY principles followed?

4. **Reliability**
   - Are health checks configured?
   - Are auto-scaling policies appropriate?
   - Are backup and disaster recovery configured?
   - Are resource limits and quotas considered?

5. **Cost Optimization**
   - Are resources appropriately sized?
   - Are unused resources cleaned up?
   - Are cost-effective instance types selected?
   - Are monitoring and alerting configured?

6. **Documentation**
   - Is README documentation clear?
   - Are deployment instructions documented?
   - Are dependencies and prerequisites listed?
   - Are troubleshooting guides included?

7. **Testing**
   - Are there tests for IaC?
   - Is linting/validation automated?
   - Are changes tested before applying?

Provide comprehensive feedback with specific recommendations.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'architecture',
      tags: ['infrastructure', 'iac', 'terraform', 'devops', 'sre', 'security'],
    },
    {
      title: 'Incident Post-Mortem Facilitator',
      description:
        'Facilitate effective incident post-mortems that drive learning and prevent recurrence.',
      content: `# Incident Post-Mortem Facilitator

## Problem Context

DevOps/SRE engineers facilitate post-mortems after incidents to understand what happened, learn from failures, and prevent recurrence. Effective post-mortems require structure, blameless culture, and actionable outcomes.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured framework for post-mortems, ensuring all critical aspects are covered.

## Prompt Template

Act as a DevOps/SRE engineer facilitating an incident post-mortem. Guide the team:

**Incident Details:**
- Incident: [What happened?]
- Duration: [How long did it last?]
- Impact: [Who/what was affected?]
- Resolution: [How was it fixed?]

**Post-Mortem Process:**

1. **Incident Timeline**
   - When did it start? (detection time)
   - Key events in chronological order
   - When was it resolved?
   - Create detailed timeline

2. **What Happened**
   - Root cause analysis (5 whys)
   - Contributing factors
   - Trigger events
   - Technical details

3. **Impact Assessment**
   - Users affected
   - Business impact (revenue, reputation)
   - System impact (downtime, data loss)
   - Long-term consequences

4. **What Went Well**
   - Detection and response speed
   - Team coordination
   - Tools and processes that helped
   - Communication during incident

5. **What Could Be Better**
   - Detection improvements
   - Response time improvements
   - Communication gaps
   - Tooling and process improvements

6. **Action Items**
   - Immediate fixes (done)
   - Short-term improvements (next sprint)
   - Long-term improvements (roadmap)
   - Assign owners and timelines

7. **Follow-Up**
   - Document lessons learned
   - Share with broader team
   - Update runbooks and playbooks
   - Schedule progress review

Create a blameless post-mortem that drives improvement.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'general',
      tags: [
        'post-mortem',
        'incident',
        'sre',
        'devops',
        'reliability',
        'learning',
      ],
    },
    {
      title: 'Monitoring and Alerting Strategy',
      description:
        'Design comprehensive monitoring and alerting strategies that provide visibility without alert fatigue.',
      content: `# Monitoring and Alerting Strategy

## Problem Context

DevOps/SRE engineers need to design monitoring and alerting strategies that provide visibility into system health without creating alert fatigue. Effective monitoring requires thoughtful metric selection and alert tuning.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured approach to designing monitoring strategies, ensuring all critical aspects are covered.

## Prompt Template

Act as a DevOps/SRE engineer designing monitoring and alerting. Create strategy:

**System to Monitor:**
- System: [Name/description]
- Components: [Key services/components]
- Critical Services: [Services that must be available]

**Monitoring Strategy:**

1. **Metrics to Monitor**
   - **Availability**: Uptime, error rates, SLA compliance
   - **Performance**: Response times, throughput, latency percentiles
   - **Resources**: CPU, memory, disk, network utilization
   - **Business**: User activity, transactions, conversions
   - **Custom**: Application-specific metrics

2. **Alerting Rules**
   - **Critical Alerts**: Pager-duty, immediate response needed
   - **Warning Alerts**: Email/Slack, investigate during business hours
   - **Info Alerts**: Dashboard only, no notification
   - Define thresholds based on SLIs/SLOs

3. **Dashboard Design**
   - Key metrics at a glance
   - Service health overview
   - Resource utilization
   - Business metrics
   - Real-time vs historical views

4. **Alert Tuning**
   - Reduce false positives (noise)
   - Set appropriate thresholds
   - Use alert aggregation
   - Implement alert fatigue prevention

5. **Runbooks**
   - Document alert response procedures
   - Troubleshooting steps
   - Escalation paths
   - Common resolutions

6. **SLI/SLO/SLA Definition**
   - Service Level Indicators (what to measure)
   - Service Level Objectives (target values)
   - Service Level Agreements (commitments)
   - Error budgets and policies

Provide a comprehensive monitoring strategy that balances visibility with operational efficiency.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'general',
      tags: [
        'monitoring',
        'alerting',
        'sre',
        'devops',
        'observability',
        'reliability',
      ],
    },
  ],
  'product-owner': [
    {
      title: 'User Story Refinement',
      description:
        'Refine user stories into clear, actionable work items that meet INVEST criteria.',
      content: `# User Story Refinement

## Problem Context

Product Owners need to refine user stories into clear, actionable work items that development teams can implement. Effective refinement requires breaking down epics, clarifying requirements, and ensuring stories meet INVEST criteria.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured framework for user story refinement, ensuring all critical aspects are addressed.

## Prompt Template

Act as a Product Owner refining user stories. Refine:

**User Story to Refine:**
- Story: [Initial user story or epic]
- Context: [Product context, user needs]

**Refinement Process:**

1. **Story Structure**
   - As a [user type]
   - I want [goal]
   - So that [benefit]
   - Ensure story follows this format

2. **INVEST Criteria Check**
   - **Independent**: Can this be developed independently?
   - **Negotiable**: Is there room for team input?
   - **Valuable**: Does this deliver user/business value?
   - **Estimable**: Can team estimate effort?
   - **Small**: Is it appropriately sized (1-3 days)?
   - **Testable**: Can we verify completion?

3. **Acceptance Criteria**
   - Clear, testable criteria
   - Given-When-Then format (optional)
   - Edge cases considered
   - Success metrics defined

4. **User Research**
   - Validate user need
   - Research data supporting story
   - User quotes or evidence
   - User pain points addressed

5. **Technical Considerations**
   - Dependencies identified
   - Technical constraints
   - Integration points
   - Data requirements

6. **Definition of Done**
   - Coding complete
   - Tests written and passing
   - Code reviewed
   - Documentation updated
   - Deployed to staging/production
   - Product owner acceptance

7. **Breaking Down Large Stories**
   - If story is too large, break down:
     - By user flow steps
     - By technical implementation phases
     - By user value (MVP first)

Create refined stories that teams can confidently implement.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'general',
      tags: [
        'user-stories',
        'refinement',
        'product-owner',
        'agile',
        'planning',
      ],
    },
    {
      title: 'Backlog Prioritization Framework',
      description:
        'Prioritize product backlog items using frameworks like RICE, Value vs Effort, or MoSCoW.',
      content: `# Backlog Prioritization Framework

## Problem Context

Product Owners need to prioritize product backlog items to maximize value delivery. Effective prioritization requires frameworks, data, and stakeholder alignment.

## Solution Pattern: Template Pattern

The Template Pattern provides structured frameworks for prioritization, ensuring consistent, data-driven decisions.

## Prompt Template

Act as a Product Owner prioritizing backlog items. Prioritize:

**Backlog Items:**
- [List of features/stories to prioritize]

**Prioritization Framework:**

Choose a framework:

**1. RICE Framework**
   - **Reach**: How many users affected? (per quarter)
   - **Impact**: How much impact per user? (0.25 = minimal, 0.5 = low, 1 = medium, 2 = high, 3 = massive)
   - **Confidence**: How confident are we? (50% = low, 80% = medium, 100% = high)
   - **Effort**: How much effort? (person-months)
   - **Score**: (Reach × Impact × Confidence) / Effort

**2. Value vs Effort Matrix**
   - High Value, Low Effort: Quick Wins (do first)
   - High Value, High Effort: Big Bets (plan carefully)
   - Low Value, Low Effort: Fill-ins (when free)
   - Low Value, High Effort: Time Sinks (avoid)

**3. MoSCoW**
   - **Must Have**: Essential for MVP
   - **Should Have**: Important but not critical
   - **Could Have**: Nice to have
   - **Won't Have**: Out of scope

**4. Kano Model**
   - **Basic**: Must-have features (satisfaction if present, dissatisfaction if absent)
   - **Performance**: More is better (satisfaction increases with quality)
   - **Delight**: Unexpected features (high satisfaction if present)

**Application:**
1. Score each item using chosen framework
2. Rank items by score
3. Consider dependencies and sequencing
4. Validate with stakeholders
5. Create prioritized backlog

Provide clear prioritization with rationale.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'general',
      tags: [
        'prioritization',
        'backlog',
        'rice',
        'product-owner',
        'product-management',
      ],
    },
    {
      title: 'Stakeholder Communication Planner',
      description:
        'Plan effective stakeholder communication that keeps stakeholders informed and aligned.',
      content: `# Stakeholder Communication Planner

## Problem Context

Product Owners need to communicate effectively with diverse stakeholders (executives, engineering, customers, sales). Effective communication requires tailoring messages, selecting channels, and maintaining alignment.

## Solution Pattern: Template Pattern

The Template Pattern provides a structured framework for stakeholder communication planning.

## Prompt Template

Act as a Product Owner planning stakeholder communication. Create communication plan:

**Communication Context:**
- Initiative: [What are we communicating about?]
- Stakeholders: [Who needs to know?]
- Timeline: [When are updates needed?]

**Communication Plan:**

1. **Stakeholder Mapping**
   - Identify all stakeholders
   - Classify by influence and interest
   - Determine communication needs
   - Identify communication preferences

2. **Message Tailoring**
   - **For Executives**: Business value, ROI, risks, decisions needed
   - **For Engineering**: Technical details, dependencies, capacity
   - **For Customers**: Value delivered, timeline, expectations
   - **For Sales**: Features, competitive advantage, positioning

3. **Communication Channels**
   - Weekly updates (email, Slack)
   - Monthly reviews (presentations, demos)
   - Quarterly roadmaps (documents, presentations)
   - Ad-hoc (Slack, meetings)

4. **Content Strategy**
   - Status updates (what's done, what's next)
   - Progress metrics (velocity, completion)
   - Blockers and risks
   - Decisions needed

5. **Timeline**
   - Frequency of updates
   - Key milestones to communicate
   - Regular cadence (daily standups, weekly reviews)
   - Special communications (launches, pivots)

6. **Success Metrics**
   - Stakeholder satisfaction
   - Alignment on priorities
   - Reduced surprises
   - Faster decision-making

Create a communication plan that keeps stakeholders informed and aligned.

---

*This prompt is part of the Engify.ai research-based prompt library. Customize it for your specific context and needs.*`,
      category: 'general',
      tags: [
        'stakeholder-management',
        'communication',
        'product-owner',
        'leadership',
      ],
    },
  ],
};

async function main() {
  try {
    const args = process.argv.slice(2);
    const roleFilter = args
      .find((arg) => arg.startsWith('--role='))
      ?.split('=')[1];
    const minPromptCount = parseInt(
      args
        .find((arg) => arg.startsWith('--min-prompt-count='))
        ?.split('=')[1] || '10'
    );
    const dryRun = args.includes('--dry-run');

    console.log('🔍 Analyzing prompt counts by role...\n');
    const db = await getMongoDb();
    const promptsCollection = db.collection('prompts');

    // Get prompt counts by role
    const prompts = await promptsCollection
      .find({ active: { $ne: false } })
      .toArray();
    const roleCounts: Record<string, number> = {};
    prompts.forEach((p: { role?: string }) => {
      const role = p.role || 'unknown';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    console.log('Current prompt counts:\n');
    Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([role, count]) => {
        const bar = '█'.repeat(Math.min(20, Math.floor(count / 5)));
        console.log(
          `   ${role.padEnd(25)} ${count.toString().padStart(3)} ${bar}`
        );
      });

    // Identify weak roles
    const weakRoles = Object.entries(roleCounts)
      .filter(([role, count]) => count < minPromptCount && role !== 'unknown')
      .map(([role]) => role);

    console.log(
      `\n⚠️  Weak roles (< ${minPromptCount} prompts): ${weakRoles.join(', ')}\n`
    );

    // Determine which roles to generate prompts for
    const rolesToGenerate = roleFilter
      ? [roleFilter]
      : weakRoles.filter(
          (role) => PROMPT_TEMPLATES[role] && PROMPT_TEMPLATES[role].length > 0
        );

    if (rolesToGenerate.length === 0) {
      console.log('✨ No roles need prompts generated!\n');
      process.exit(0);
    }

    console.log(`📝 Generating prompts for: ${rolesToGenerate.join(', ')}\n`);

    interface PromptDocument {
      id: string;
      slug: string;
      title: string;
      description: string;
      content: string;
      category: string;
      role: string;
      pattern?: string;
      tags: string[];
      currentRevision: number;
      views: number;
      rating: number;
      ratingCount: number;
      createdAt: Date;
      updatedAt: Date;
      isPublic: boolean;
      isFeatured: boolean;
      active: boolean;
      source: string;
    }
    const promptsToCreate: PromptDocument[] = [];
    const promptsToSkip: string[] = [];

    for (const role of rolesToGenerate) {
      const templates = PROMPT_TEMPLATES[role] || [];
      console.log(`\n📋 Processing ${role} (${templates.length} templates)...`);

      for (const template of templates) {
        const slug = generateSlug(template.title);

        // Check if prompt already exists
        const existing = await promptsCollection.findOne({
          $or: [{ title: template.title }, { slug: slug }],
        });

        if (existing) {
          promptsToSkip.push(template.title);
          console.log(`   ⏭️  Skipped: "${template.title}" (already exists)`);
          continue;
        }

        // Create prompt object
        const prompt = {
          id: randomUUID(),
          slug,
          title: template.title,
          description: template.description,
          content: template.content,
          category: template.category,
          role: role,
          pattern: template.content.includes('Multi-Step')
            ? undefined
            : 'template',
          tags: template.tags,
          currentRevision: 1,
          views: 0,
          rating: 0,
          ratingCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          isPublic: true,
          isFeatured: false,
          active: true,
          source: 'seed' as const,
        };

        promptsToCreate.push(prompt);
        console.log(`   ✅ Will create: "${template.title}"`);
        console.log(`      Slug: ${slug}`);
        console.log(`      Category: ${template.category}`);
        console.log(`      Tags: ${template.tags.join(', ')}`);
      }
    }

    if (promptsToCreate.length === 0) {
      console.log('\n✨ All prompts already exist! Nothing to create.\n');
      if (promptsToSkip.length > 0) {
        console.log(`   Skipped: ${promptsToSkip.length} prompts\n`);
      }
      process.exit(0);
    }

    if (dryRun) {
      console.log(
        `\n🔍 DRY RUN: Would create ${promptsToCreate.length} prompt(s)\n`
      );
      promptsToCreate.forEach((p) => {
        console.log(`   - ${p.title} (${p.role})`);
      });
      console.log('\n');
      process.exit(0);
    }

    console.log(`\n📝 Creating ${promptsToCreate.length} prompt(s)...\n`);

    // Insert prompts
    if (promptsToCreate.length > 0) {
      const result = await promptsCollection.insertMany(promptsToCreate);
      console.log(
        `\n✨ Successfully created ${result.insertedCount} prompt(s)!`
      );
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Created: ${promptsToCreate.length}`);
    console.log(`   - Skipped: ${promptsToSkip.length}`);
    console.log(`\n`);

    // Show what was created
    promptsToCreate.forEach((p) => {
      console.log(`   ✅ ${p.title}`);
      console.log(`      /prompts/${p.slug}`);
    });

    console.log(`\n`);
    console.log(`📋 Next Steps:`);
    console.log(
      `   1. Run audit: pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --role=${rolesToGenerate.join(',')}`
    );
    console.log(
      `   2. Run improvements: pnpm tsx scripts/content/batch-improve-from-audits.ts`
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
