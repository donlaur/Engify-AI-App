# eNPS Improvement Prompts & Role Structure Split

## Overview
This document outlines:
1. New eNPS (Employee Net Promoter Score) improvement prompts for leadership roles
2. Role structure changes to split Directors and VPs by Engineering vs Product

## Role Structure Changes

### Current State
- Generic `director` role (all directors)
- Generic `c-level` role (includes CTOs, VPs, executives)
- No distinction between Engineering and Product leadership tracks

### Proposed Changes

#### Split Director Roles
- `engineering-director` - Engineering Directors (manages multiple teams, technical strategy)
- `product-director` - Product Directors (manages PM teams, product portfolio strategy)

#### Split VP Roles (Optional, can be combined with C-Level)
- `vp-engineering` - VP of Engineering (scales engineering org, strategic technical decisions)
- `vp-product` - VP of Product (scales product org, strategic product decisions)

#### Keep C-Level
- `cto` - Chief Technology Officer (overall technical strategy, executive level)
- `cpo` - Chief Product Officer (overall product strategy, executive level)

### Rationale
- **Different Challenges**: Engineering Directors focus on technical scalability, architecture, team health. Product Directors focus on product strategy, market fit, customer needs.
- **Different eNPS Drivers**: Eng Directors care about technical growth, autonomy, tooling. Product Directors care about product impact, customer connection, strategic clarity.
- **SEO Benefits**: More specific roles = better search targeting ("Engineering Director prompts" vs "Director prompts")
- **Scalability**: As we add more director/VP level content, separate roles make organization clearer

## eNPS Improvement Prompts

### Target Roles
These prompts are most relevant for:
- Engineering Managers
- Engineering Directors
- Product Managers (senior/lead)
- Product Directors
- VPs (Engineering & Product)
- CTOs/CPOs

### Prompt Categories

#### 1. eNPS Survey Design & Analysis
- **Creating Effective eNPS Surveys**
- **Analyzing eNPS Results to Identify Action Items**
- **Segmenting eNPS Data by Team/Department**
- **Identifying Root Causes from eNPS Comments**

#### 2. Culture & Engagement
- **Building Engineering Culture That Drives eNPS**
- **Creating Psychological Safety Across Teams**
- **Designing Recognition Programs That Boost Engagement**
- **Improving Work-Life Balance Through Policy Changes**

#### 3. Career Growth & Development
- **Creating Clear Career Ladders That Increase Retention**
- **Designing Mentorship Programs**
- **Building Internal Mobility Programs**
- **Creating Learning & Development Roadmaps**

#### 4. Communication & Transparency
- **Improving Cross-Team Communication**
- **Creating Effective All-Hands Formats**
- **Designing Transparent Goal-Setting Processes**
- **Building Better Feedback Loops**

#### 5. Technical Factors (Engineering-Specific)
- **Improving Developer Experience (DX)**
- **Reducing Technical Debt That Hurts Morale**
- **Creating Better Tooling & Automation**
- **Improving Code Review Culture**

#### 6. Product Impact (Product-Specific)
- **Connecting Product Work to Customer Impact**
- **Creating Product Feedback Loops**
- **Improving Product Discovery Processes**
- **Building Product Culture Around User Value**

#### 7. Manager Effectiveness
- **Coaching Managers to Improve Team eNPS**
- **Creating 1-on-1 Templates That Drive Engagement**
- **Improving Manager Feedback Skills**
- **Building Manager Career Development Paths**

#### 8. Compensation & Benefits
- **Designing Competitive Compensation Structures**
- **Creating Fair Performance Review Processes**
- **Improving Benefits Packages Based on Employee Needs**
- **Building Transparent Pay Equity Frameworks**

## Implementation Plan

### Phase 1: Schema Updates
1. Update `src/lib/db/schema.ts` - Add new role types
2. Update `src/lib/schemas/prompt.ts` - Add new UserRole values
3. Update `src/lib/utils/role-mapping.ts` - Map new roles to landing pages

### Phase 2: Landing Pages
1. Create `/for-engineering-directors` route
2. Create `/for-product-directors` route
3. Update RoleSelector component
4. Add role content to `ROLE_CONTENT` in `src/lib/data/role-content.ts`

### Phase 3: Prompts Creation
1. Create ~30-40 eNPS improvement prompts
2. Tag appropriately by role
3. Seed into database

### Phase 4: SEO & Content
1. Optimize landing pages for SEO
2. Add use cases and examples
3. Cross-link related prompts

## Priority Prompt List (Top 10)

1. **Analyzing eNPS Results to Identify Action Items** (All leadership roles)
2. **Creating Effective eNPS Surveys** (All leadership roles)
3. **Building Engineering Culture That Drives eNPS** (Engineering Directors, VPs)
4. **Creating Clear Career Ladders That Increase Retention** (All leadership roles)
5. **Improving Developer Experience (DX) to Boost eNPS** (Engineering Directors, Engineering Managers)
6. **Connecting Product Work to Customer Impact** (Product Directors, Product Managers)
7. **Coaching Managers to Improve Team eNPS** (Directors, VPs)
8. **Designing Transparent Goal-Setting Processes** (All leadership roles)
9. **Creating Psychological Safety Across Teams** (All leadership roles)
10. **Reducing Technical Debt That Hurts Morale** (Engineering Directors, VPs)

## Next Steps
1. Review and approve role split approach
2. Create eNPS prompt templates
3. Update schemas and routing
4. Create landing pages
5. Seed prompts and test

