/**
 * Create Tech Documentation Prompts
 *
 * Creates prompts for the three main types of tech documentation:
 * 1. Design Doc - Tech design and implementation strategy
 * 2. Tech Spec - API specs, database schema, what's live
 * 3. Functional Spec - Product requirements, UI/UX specs
 *
 * Run with: pnpm tsx scripts/content/create-tech-doc-prompts.ts
 */

import { getMongoDb } from '@/lib/db/mongodb';
import { generateSlug } from '@/lib/utils/slug';
import { randomUUID } from 'crypto';

const PROMPTS_TO_CREATE = [
  {
    title: 'Technical Design Document (Design Doc) Generator',
    description:
      'Create a comprehensive technical design document that records decisions, communicates trade-offs, and converges on implementation strategy before coding.',
    content: `# Technical Design Document (Design Doc) Generator

## Problem Context

Engineers need to create technical design documents before implementing features. Design docs help:
- **Solidify reasoning** - Writing is thinking; formalizing your approach improves the solution
- **Improve the design** - Get feedback from peers (like code review, but for design)
- **Create consensus** - Align stakeholders on what should be built
- **Record decisions** - Document trade-offs, alternatives considered, and open questions for posterity

## Solution Pattern: Template Pattern + Chain-of-Thought

This prompt uses a structured template to guide you through creating a comprehensive design doc, with step-by-step reasoning for each section.

## Prompt Template

Act as a senior software engineer specializing in technical design. I need to create a Technical Design Document (Design Doc) for [feature/system name].

Guide me through creating a comprehensive design doc with the following sections:

### 1. Overview
- **Title**: [Feature/System Name]
- **Author(s)**: [Your name/team]
- **Date**: [Date]
- **Status**: [Draft/Review/Approved/Implemented]
- **Stakeholders**: [List key stakeholders who need to review]
- **Related Documents**: [Links to PRD, RFCs, or other relevant docs]

### 2. Problem Statement
- What problem are we solving?
- Why is this problem important?
- What is the current state, and why is it problematic?
- What evidence do we have that this problem exists?
- Who is affected by this problem?

### 3. Goals & Non-Goals
- **Goals**: What are we trying to achieve?
  - Primary goal
  - Secondary goals
- **Non-Goals**: What are we explicitly NOT trying to solve?
  - Out of scope items
  - Future considerations (document but defer)

### 4. Proposed Solution
- High-level architecture overview
- Key components and their responsibilities
- Data flow and interactions
- Technology choices and rationale
- Diagrams (architecture, sequence, data flow) - describe what should be included

### 5. Detailed Design
- **Component Design**: Detailed breakdown of each component
  - Interfaces and APIs
  - Data structures
  - Algorithms and logic
- **Database Schema**: Tables, indexes, relationships (if applicable)
- **API Design**: Endpoints, request/response formats, error handling
- **Security Considerations**: Authentication, authorization, data protection
- **Performance Considerations**: Scalability, latency, throughput requirements

### 6. Alternatives Considered
For each alternative solution:
- **Option Name**: Brief description
- **Pros**: Advantages
- **Cons**: Disadvantages
- **Why Not Chosen**: Rationale for rejection

### 7. Trade-offs & Risks
- **Trade-offs**: What are we sacrificing for this solution?
- **Risks**: What could go wrong?
  - Technical risks
  - Timeline risks
  - Resource risks
- **Mitigation Strategies**: How will we address each risk?

### 8. Implementation Plan
- **Phases**: Break down into phases or milestones
- **Dependencies**: What needs to be done first?
- **Timeline**: Estimated timeline for each phase
- **Resource Requirements**: Team members, infrastructure, tools

### 9. Testing Strategy
- **Unit Tests**: What needs unit test coverage?
- **Integration Tests**: What integration points need testing?
- **Performance Tests**: What performance benchmarks need to be met?
- **Monitoring & Observability**: What metrics and alerts do we need?

### 10. Rollout Plan
- **Deployment Strategy**: Canary, blue-green, feature flags?
- **Rollback Plan**: How do we roll back if something goes wrong?
- **Success Criteria**: How do we know the rollout was successful?

### 11. Open Questions
- Questions that need answers before implementation
- Decisions that need to be made
- Research or proof-of-concept work needed

### 12. Future Work
- Known limitations of this design
- Future improvements or optimizations
- Technical debt introduced

---

**Instructions:**
1. For each section, ask me clarifying questions if needed
2. Provide clear, actionable content for each section
3. Use markdown formatting for readability
4. Include code examples, diagrams descriptions, and data structures where relevant
5. Ensure the design doc is comprehensive yet concise
6. Focus on recording decisions and trade-offs, not just describing what will be built

Once complete, format the design doc in a clean, professional structure that I can share with stakeholders and use as a decision record.

---

*This prompt is part of the Engify.ai research-based prompt library. Design docs are created BEFORE implementation to converge on solutions. They serve as decision records AFTER implementation.*`,
    category: 'documentation',
    tags: ['design-doc', 'architecture', 'technical-design', 'rfc', 'engineering'],
    role: 'engineer',
    pattern: 'template',
  },
  {
    title: 'Technical Specification (Tech Spec) Generator',
    description:
      'Create comprehensive technical specifications documenting API specs, database schemas, and what is currently live in production.',
    content: `# Technical Specification (Tech Spec) Generator

## Problem Context

Technical specifications document what is currently implemented and live in production. Unlike design docs (which record decisions before implementation), tech specs describe the current state:
- **API Specifications**: Endpoints, request/response formats, authentication
- **Database Schema**: Tables, columns, indexes, relationships
- **System Architecture**: What's deployed, how it works, dependencies
- **Configuration**: Environment variables, settings, feature flags

Tech specs are essential for onboarding, debugging, and maintaining systems.

## Solution Pattern: Template Pattern

This prompt uses a structured template to create comprehensive technical specifications.

## Prompt Template

Act as a technical writer specializing in technical specifications. I need to create a Technical Specification (Tech Spec) for [system/component name].

Guide me through creating a comprehensive tech spec that documents what is currently live in production:

### 1. Overview
- **System/Component Name**: [Name]
- **Version**: [Current version]
- **Last Updated**: [Date]
- **Owner**: [Team/individual responsible]
- **Status**: [Active/Deprecated/Maintenance Mode]
- **Documentation Links**: [Related docs, runbooks, etc.]

### 2. System Architecture
- **High-Level Overview**: What does this system do?
- **Components**: List of main components/services
- **Dependencies**: External services, databases, APIs this system depends on
- **Deployment**: Where is this deployed? (environments, regions, infrastructure)
- **Architecture Diagram**: Describe the architecture (or reference diagram)

### 3. API Specifications
For each API endpoint:

#### Endpoint: [Name]
- **URL**: [Full endpoint path]
- **Method**: [GET/POST/PUT/DELETE/etc.]
- **Authentication**: [How to authenticate]
- **Request**:
  - Headers: [Required headers]
  - Query Parameters: [Parameters with types and descriptions]
  - Request Body: [Schema with example]
- **Response**:
  - Success Response (200): [Schema with example]
  - Error Responses: [Error codes, messages, examples]
- **Rate Limits**: [If applicable]
- **Deprecation**: [If deprecated, when and migration path]

### 4. Database Schema
- **Database Type**: [PostgreSQL, MongoDB, etc.]
- **Tables/Collections**: 
  - **Table Name**: [Name]
    - Columns/Fields: [Name, type, constraints, description]
    - Indexes: [Index name, columns, purpose]
    - Relationships: [Foreign keys, references]
    - Sample Data: [Example rows]
- **Migrations**: [How to run migrations, version history]

### 5. Data Models
- **Key Data Structures**: 
  - **Model Name**: [Name]
    - Fields: [Name, type, description, validation rules]
    - Example: [JSON example]
- **Data Flow**: [How data moves through the system]

### 6. Configuration
- **Environment Variables**: 
  - Variable name, description, default value, required
- **Feature Flags**: 
  - Flag name, description, current state, rollout plan
- **Settings**: [Configuration files, their structure, examples]

### 7. Authentication & Authorization
- **Authentication Method**: [OAuth, API keys, JWT, etc.]
- **Authorization Model**: [Role-based, permission-based, etc.]
- **Security Considerations**: [Encryption, secrets management, etc.]

### 8. Performance Characteristics
- **Latency**: [Expected response times]
- **Throughput**: [Requests per second, transactions per second]
- **Scalability**: [How it scales, bottlenecks]
- **Monitoring**: [Key metrics, dashboards, alerts]

### 9. Error Handling
- **Error Codes**: [List of error codes and meanings]
- **Error Response Format**: [Standard error response structure]
- **Retry Logic**: [When/how to retry]
- **Circuit Breakers**: [If applicable]

### 10. Testing
- **Test Coverage**: [Current test coverage]
- **Test Types**: [Unit, integration, E2E tests]
- **How to Run Tests**: [Commands, setup]
- **Test Data**: [How to get test data]

### 11. Deployment & Operations
- **Deployment Process**: [How to deploy]
- **Rollback Procedure**: [How to rollback]
- **Health Checks**: [Health check endpoints]
- **Runbooks**: [Links to operational runbooks]

### 12. Known Issues & Limitations
- **Known Bugs**: [List of known issues]
- **Limitations**: [What the system cannot do]
- **Technical Debt**: [Areas that need improvement]

### 13. Changelog
- **Recent Changes**: [Recent updates, versions]
- **Breaking Changes**: [If any, migration guides]

---

**Instructions:**
1. Focus on documenting what IS, not what SHOULD BE
2. Be precise and accurate - this is a reference document
3. Include code examples, schemas, and actual values where possible
4. Keep it up-to-date - tech specs should reflect current state
5. Use markdown formatting for readability
6. Include links to actual code, APIs, and dashboards where relevant

Once complete, format the tech spec as a comprehensive reference document that engineers can use to understand and work with the system.

---

*This prompt is part of the Engify.ai research-based prompt library. Tech specs document what's LIVE, unlike design docs which record decisions BEFORE implementation.*`,
    category: 'documentation',
    tags: ['tech-spec', 'api-spec', 'database-schema', 'technical-writing', 'reference'],
    role: 'engineer',
    pattern: 'template',
  },
  {
    title: 'Functional Specification (Functional Spec) Generator',
    description:
      'Create a functional specification that communicates product requirements and UI/UX specifications from the user perspective.',
    content: `# Functional Specification (Functional Spec) Generator

## Problem Context

Functional specifications communicate WHAT should be achieved from the user's perspective. They bridge the gap between product requirements and technical implementation by focusing on:
- **User-facing functionality**: What users can do, see, and experience
- **UI/UX specifications**: Layouts, interactions, user flows
- **Product requirements**: Features, behaviors, edge cases
- **Acceptance criteria**: How we know a feature is complete

Functional specs are typically created by PMs and designers, but engineers need them to understand what to build.

## Solution Pattern: Template Pattern + User Stories

This prompt uses a structured template with user stories to create comprehensive functional specifications.

## Prompt Template

Act as a Product Manager and UX Designer. I need to create a Functional Specification (Functional Spec) for [feature/product name].

Guide me through creating a comprehensive functional spec that communicates what should be achieved from the user perspective:

### 1. Overview
- **Feature/Product Name**: [Name]
- **Owner**: [PM/Designer name]
- **Date**: [Date]
- **Status**: [Draft/Review/Approved]
- **Related Documents**: [PRD, Design Doc links]
- **Target Users**: [Who will use this feature]

### 2. Problem Statement
- What user problem are we solving?
- Why is this important to users?
- What is the current user experience, and why is it problematic?
- What evidence do we have (user research, data, feedback)?

### 3. Goals & Success Metrics
- **User Goals**: What do users want to achieve?
- **Business Goals**: What business outcomes do we expect?
- **Success Metrics**: 
  - User engagement metrics
  - Conversion metrics
  - Satisfaction metrics
  - Target values and timelines

### 4. User Stories & Personas
- **Primary Persona**: [Who is the primary user?]
  - Demographics
  - Goals
  - Pain points
- **User Stories**: 
  - "As a [user type], I want [goal] so that [benefit]"
  - Prioritize: Must Have, Should Have, Could Have
- **User Flows**: [High-level user journey]

### 5. Functional Requirements
For each feature/functionality:

#### Feature: [Name]
- **Description**: What does this feature do?
- **User Actions**: What can users do?
- **System Behavior**: How does the system respond?
- **Edge Cases**: 
  - Empty states
  - Error states
  - Loading states
  - Offline behavior
- **Dependencies**: [Other features this depends on]

### 6. UI/UX Specifications
- **Layout**: [Screen layouts, component placement]
- **Visual Design**: 
  - Colors, typography, spacing
  - Design system components used
  - Responsive breakpoints
- **Interactions**: 
  - Click/tap behaviors
  - Hover states
  - Animations and transitions
  - Form validation and feedback
- **Accessibility**: 
  - Keyboard navigation
  - Screen reader support
  - Color contrast
  - ARIA labels

### 7. User Flows & Wireframes
- **Primary User Flow**: [Step-by-step user journey]
- **Alternative Flows**: [Different paths users might take]
- **Error Flows**: [What happens when things go wrong]
- **Wireframes/Mockups**: [Describe or reference design files]

### 8. Content Requirements
- **Copy**: [All text content, labels, messages]
- **Error Messages**: [User-friendly error messages]
- **Help Text**: [Tooltips, help content]
- **Localization**: [If applicable, language considerations]

### 9. Acceptance Criteria
For each user story/feature:
- **Given**: [Initial state]
- **When**: [User action]
- **Then**: [Expected outcome]
- **And**: [Additional validations]

### 10. Non-Functional Requirements
- **Performance**: [Page load times, response times]
- **Browser/Device Support**: [Supported browsers, devices]
- **Accessibility**: [WCAG compliance level]
- **Security**: [Data protection, privacy considerations]

### 11. Edge Cases & Error Handling
- **Empty States**: [What users see when there's no data]
- **Error States**: [How errors are displayed and handled]
- **Validation**: [Input validation rules and messages]
- **Offline Behavior**: [What works offline, what doesn't]

### 12. Analytics & Tracking
- **Events to Track**: [User actions to measure]
- **Metrics**: [Key metrics to monitor]
- **A/B Tests**: [If applicable, test variations]

### 13. Launch Plan
- **Rollout Strategy**: [Phased rollout, beta, full launch]
- **Feature Flags**: [Flags to control rollout]
- **Success Criteria**: [How we know launch was successful]

### 14. Open Questions
- Questions that need answers before implementation
- Design decisions needed
- User research needed

---

**Instructions:**
1. Focus on the USER perspective - what they see, do, and experience
2. Be specific about UI/UX details - layouts, interactions, states
3. Include user stories and acceptance criteria for clarity
4. Document all edge cases and error states
5. Use markdown formatting for readability
6. Reference design files, mockups, and prototypes where available

Once complete, format the functional spec as a clear, user-focused document that engineers and designers can use to build the feature.

---

*This prompt is part of the Engify.ai research-based prompt library. Functional specs focus on WHAT users experience, while design docs focus on HOW engineers implement it.*`,
    category: 'documentation',
    tags: ['functional-spec', 'product-requirements', 'ui-ux', 'user-stories', 'product-management'],
    role: 'product-manager',
    pattern: 'template',
  },
];

async function createTechDocPrompts() {
  console.log('🚀 Creating tech documentation prompts...\n');

  try {
    const db = await getMongoDb();
    const collection = db.collection('prompts');

    let created = 0;
    let skipped = 0;

    for (const promptData of PROMPTS_TO_CREATE) {
      const slug = generateSlug(promptData.title);
      const promptId = slug;

      // Check if prompt already exists
      const existing = await collection.findOne({ id: promptId });
      if (existing) {
        console.log(`⏭️  Skipping "${promptData.title}" (already exists)`);
        skipped++;
        continue;
      }

      const prompt = {
        id: promptId,
        title: promptData.title,
        description: promptData.description,
        content: promptData.content,
        category: promptData.category,
        tags: promptData.tags,
        role: promptData.role,
        pattern: promptData.pattern,
        slug: slug,
        isPublic: true,
        isFeatured: false,
        views: 0,
        rating: 0,
        ratingCount: 0,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        currentRevision: 1,
        auditVersion: 0,
      };

      await collection.insertOne(prompt);
      console.log(`✅ Created: "${promptData.title}"`);
      console.log(`   ID: ${promptId}`);
      console.log(`   Category: ${promptData.category}`);
      console.log(`   Role: ${promptData.role}`);
      console.log(`   Tags: ${promptData.tags.join(', ')}\n`);
      created++;
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📝 Total: ${PROMPTS_TO_CREATE.length}`);

    if (created > 0) {
      console.log('\n💡 Next steps:');
      console.log('   1. Review the prompts in the database');
      console.log('   2. Run audit script to enrich them');
      console.log('   3. Test the prompts with real use cases');
    }
  } catch (error) {
    console.error('❌ Error creating prompts:', error);
    process.exit(1);
  }
}

createTechDocPrompts();

