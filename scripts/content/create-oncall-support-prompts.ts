#!/usr/bin/env tsx
/**
 * Create On-Call Support Prompts
 * 
 * Creates prompts for:
 * - Customer Communication During Incidents
 * - Debugging and Troubleshooting On-Call
 * - On-Call Support Best Practices
 * 
 * Usage:
 *   tsx scripts/content/create-oncall-support-prompts.ts
 */

import { getDb } from '@/lib/mongodb';
import { generateSlug } from '@/lib/utils/slug';
import { randomUUID } from 'crypto';

interface PromptToCreate {
  title: string;
  description: string;
  role: string;
  category: string;
  tags: string[];
  content: string;
}

const PROMPTS_TO_CREATE: PromptToCreate[] = [
  {
    title: 'Customer Communication During On-Call Incidents',
    description: 'Guide engineers on how to communicate effectively with customers during incidents, including status updates, technical explanations, and empathetic responses.',
    role: 'engineering-manager',
    category: 'management',
    tags: ['on-call', 'customer-communication', 'incident-response', 'support', 'customer-service'],
    content: `# Customer Communication During On-Call Incidents

Act as an on-call engineer communicating with customers during an incident.

## Communication Principles

**Key Principles**:
- Be transparent and honest
- Communicate frequently, even if you don't have answers
- Use clear, non-technical language
- Show empathy and acknowledge impact
- Provide realistic timelines

**Important**: You represent the company. Stay professional, calm, and helpful even under pressure.

---

## Initial Customer Contact

**When a Customer Reports an Issue**:

**Template Response**:
\`\`\`
Hi [Customer Name],

Thank you for reporting this issue. I'm [Your Name], the on-call engineer. I've received your report and I'm investigating immediately.

I'll keep you updated every [X] minutes and will notify you as soon as I have more information or a resolution.

Can you provide a bit more detail about:
- When did you first notice the issue?
- What were you trying to do when it happened?
- Are you seeing any error messages? If so, what do they say?

This will help me investigate faster.

Best regards,
[Your Name]
\`\`\`

**Do's**:
- [ ] Acknowledge the issue immediately
- [ ] Thank them for reporting
- [ ] Set expectations for updates
- [ ] Ask clarifying questions politely
- [ ] Provide your name and role

**Don'ts**:
- [ ] Don't make excuses
- [ ] Don't use technical jargon
- [ ] Don't promise specific fix times
- [ ] Don't blame other teams/systems
- [ ] Don't appear dismissive

---

## Status Update Communication

**During Active Investigation**:

**Template for Status Updates**:
\`\`\`
Hi [Customer Name],

Quick update: I'm still investigating the issue. I've identified [what you've found so far] and I'm currently working on [what you're doing next].

I expect to have more information within the next [X] minutes. I'll update you again by [time].

Thanks for your patience.

[Your Name]
\`\`\`

**Frequency Guidelines**:
- **SEV-1 (Critical)**: Update every [15-30] minutes
- **SEV-2 (High)**: Update every [30-60] minutes
- **SEV-3 (Medium)**: Update every [1-2] hours
- **SEV-4 (Low)**: Update when resolved

**What to Include**:
- [ ] What you've discovered
- [ ] What you're doing now
- [ ] When next update will be
- [ ] Any workarounds available

**What to Avoid**:
- [ ] Don't over-promise timelines
- [ ] Don't share half-baked theories
- [ ] Don't ignore the customer
- [ ] Don't use technical details unnecessarily

---

## Explaining Technical Issues to Non-Technical Customers

**Translation Guide**:

**Technical**: "We're experiencing a database connection pool exhaustion"
**Customer-Friendly**: "We're having trouble connecting to our database. This is preventing some features from working properly."

**Technical**: "Our microservice is throwing 500 errors"
**Customer-Friendly**: "One of our systems is experiencing errors. We're working to fix it."

**Technical**: "We need to rollback the deployment"
**Customer-Friendly**: "We're reverting to a previous version of the system to resolve the issue."

**Key Strategies**:
- [ ] Explain in terms of impact, not technology
- [ ] Use analogies when helpful
- [ ] Focus on what they care about (their ability to use the product)
- [ ] Avoid acronyms and jargon
- [ ] Keep explanations concise

---

## Handling Frustrated or Angry Customers

**What to Do**:

**Template Response**:
\`\`\`
Hi [Customer Name],

I completely understand your frustration, and I apologize for the disruption this is causing. I'm working on this as my top priority right now.

[Brief status update]

I will personally ensure you're updated as soon as I have more information, and I'll do everything I can to get this resolved quickly.

Is there anything I can do in the meantime to help minimize the impact?

Best regards,
[Your Name]
\`\`\`

**Key Strategies**:
- [ ] Acknowledge their frustration/anger
- [ ] Apologize sincerely (even if it's not your fault)
- [ ] Reassure them it's a priority
- [ ] Offer to help minimize impact
- [ ] Stay calm and professional

**What NOT to Do**:
- [ ] Don't get defensive
- [ ] Don't make excuses
- [ ] Don't minimize their frustration
- [ ] Don't ignore emotional cues
- [ ] Don't pass blame

---

## Providing Workarounds

**When You Have a Workaround**:

**Template**:
\`\`\`
Hi [Customer Name],

While we're working on a permanent fix, here's a workaround you can use:

[Step-by-step workaround instructions]

This should allow you to [benefit] until we have the full fix deployed.

Please let me know if this works for you or if you need any clarification.

[Your Name]
\`\`\`

**Workaround Best Practices**:
- [ ] Test the workaround yourself first
- [ ] Provide clear, step-by-step instructions
- [ ] Explain what it does and why it works
- [ ] Set expectations about when the real fix will be ready
- [ ] Offer to help if they're stuck

---

## Incident Resolution Communication

**When the Issue is Resolved**:

**Template**:
\`\`\`
Hi [Customer Name],

Good news! The issue has been resolved. [Brief explanation of what was fixed]

The system should now be working normally. Please try [what they were trying to do] again and let me know if you encounter any issues.

I apologize for the disruption this caused. We've [taken steps to prevent recurrence / scheduled a post-incident review] to prevent this from happening again.

Thanks for your patience, and please don't hesitate to reach out if you need anything else.

Best regards,
[Your Name]
\`\`\`

**Key Elements**:
- [ ] Confirm resolution clearly
- [ ] Brief explanation of what was fixed
- [ ] Apologize for impact
- [ ] Explain prevention measures
- [ ] Offer continued support

---

## Escalation to Customer Success/Support

**When to Escalate**:
- [ ] Customer requests to speak with their account manager
- [ ] Issue involves billing or contract questions
- [ ] Customer is threatening to cancel
- [ ] Issue requires business-level decisions
- [ ] You're unable to resolve within reasonable time

**Escalation Template**:
\`\`\`
Hi [Customer Name],

I understand this situation requires additional attention. I'm escalating this to our Customer Success team who can work with you more closely on this.

[Customer Success contact] will be reaching out to you within [timeframe] to discuss this further.

In the meantime, I'll continue working on the technical aspects and will keep everyone updated on progress.

Best regards,
[Your Name]

CC: [Customer Success contact]
\`\`\`

---

## Internal Communication While Handling Customer Issues

**Status Updates to Your Team**:

**Template**:
\`\`\`
[Incident ID] - Customer Impact Update

Customer: [Name/Company]
Reported: [Time]
Status: [Investigating/Mitigating/Resolved]

What I've communicated:
- [Brief summary of customer communications]

What I need:
- [Help needed from team]

Next update: [Time]
\`\`\`

---

## Common Scenarios and Responses

**Scenario: "When will this be fixed?"**

**Response**:
"I'm working on this as fast as I can. Based on what I've found so far, I expect to have a resolution within [realistic timeframe]. However, I'll keep you updated if anything changes. I'll send you an update in [X] minutes regardless."

**Scenario: "This is affecting our business!"**

**Response**:
"I completely understand the impact this is having on your business, and I'm treating this as my top priority. I'm working on resolving this as quickly as possible and will keep you updated every [X] minutes until it's resolved."

**Scenario: "Can you just fix it already?"**

**Response**:
"I'm working on it right now. I understand this is frustrating. Here's what I'm doing: [brief explanation]. I expect to have an update within [timeframe]. I'll reach out as soon as I have more information."

**Scenario: "We're going to cancel if this isn't fixed soon."**

**Response**:
"I completely understand your frustration. I'm escalating this immediately to our Customer Success team who can work with you directly on this. In the meantime, I'm doing everything I can to resolve the technical issue as quickly as possible."

---

## Communication Checklist

**Before Responding to Customer**:
- [ ] Take a deep breath
- [ ] Read their message fully
- [ ] Understand the impact
- [ ] Gather relevant information
- [ ] Prepare clear, empathetic response

**During Incident**:
- [ ] Provide regular updates
- [ ] Use customer-friendly language
- [ ] Show empathy
- [ ] Set realistic expectations
- [ ] Keep internal team informed

**After Resolution**:
- [ ] Confirm resolution clearly
- [ ] Apologize for impact
- [ ] Explain prevention measures
- [ ] Offer continued support
- [ ] Follow up if needed

---

## Practice Scenarios

**Practice responding to these scenarios**:

1. Customer reports data loss during incident
2. Customer is angry about repeated issues
3. Customer needs immediate workaround for business-critical task
4. Customer threatens to switch to competitor
5. Customer asks for detailed technical explanation

Remember: Your goal is to help the customer feel heard, informed, and confident that the issue is being handled professionally.`,
  },
  {
    title: 'Debugging and Troubleshooting While On-Call',
    description: 'Systematic debugging approach for on-call engineers to efficiently diagnose and resolve issues during incidents, including investigation workflows and common debugging strategies.',
    role: 'engineering-manager',
    category: 'management',
    tags: ['on-call', 'debugging', 'troubleshooting', 'incident-response', 'problem-solving'],
    content: `# Debugging and Troubleshooting While On-Call

Act as an on-call engineer systematically debugging an issue during an incident.

## Debugging Framework

**Systematic Approach**:
1. Gather information
2. Reproduce the issue
3. Form hypotheses
4. Test hypotheses
5. Fix or escalate
6. Verify resolution

---

## Initial Investigation (0-15 minutes)

### Step 1: Gather Context

**Information to Collect**:
- [ ] When did the issue start? [Time]
- [ ] What was working before? [State]
- [ ] What changed recently? [Deployments/configs]
- [ ] How many users affected? [Scale]
- [ ] What error messages? [Logs/metrics]

**Quick Checks**:
- [ ] Status page: [Any known issues?]
- [ ] Recent deployments: [Last [X] hours]
- [ ] Monitoring dashboards: [Any anomalies?]
- [ ] Alert history: [Related alerts?]

**Question Template**:
- What exactly is broken?
- When did it start breaking?
- Who/what is affected?
- What changed recently?
- What should be happening instead?

---

## Information Gathering Tools

### Logs
**Where to Look**:
- [ ] Application logs: [Location]
- [ ] Error logs: [Location]
- [ ] Access logs: [Location]
- [ ] System logs: [Location]

**Useful Commands**:
\`\`\`
# Search for errors
grep -i error /var/log/app.log | tail -100

# Find recent errors
grep -i error /var/log/app.log | tail -50 | less

# Search by time range
grep "2024-01-01 14:" /var/log/app.log | grep error

# Count error frequency
grep -i error /var/log/app.log | wc -l
\`\`\`

### Metrics
**Metrics to Check**:
- [ ] Error rate: [Current vs. baseline]
- [ ] Response time: [Current vs. baseline]
- [ ] CPU/Memory: [Current usage]
- [ ] Request rate: [Traffic patterns]
- [ ] Database connections: [Pool status]

### Monitoring Dashboards
**Dashboards to Review**:
- [ ] [Dashboard name]: [What it shows]
- [ ] [Dashboard name]: [What it shows]
- [ ] [Dashboard name]: [What it shows]

**Key Questions**:
- What metrics are abnormal?
- When did metrics start changing?
- Are there any patterns?
- Which services are affected?

---

## Hypothesis Formation

### Common Issue Categories

**1. Recent Changes**
- Hypothesis: Recent deployment/config change caused issue
- Evidence to check: [Deployment logs, config changes]
- How to verify: [Rollback, compare configs]

**2. Dependency Issues**
- Hypothesis: External dependency/service is down
- Evidence to check: [Dependency health, API responses]
- How to verify: [Test dependency directly]

**3. Resource Exhaustion**
- Hypothesis: Out of CPU/memory/disk/connections
- Evidence to check: [Resource metrics, limits]
- How to verify: [Check resource usage, limits]

**4. Configuration Issues**
- Hypothesis: Incorrect configuration
- Evidence to check: [Config files, environment variables]
- How to verify: [Compare with known good config]

**5. Data Issues**
- Hypothesis: Corrupted or missing data
- Evidence to check: [Database integrity, data checks]
- How to verify: [Query data, check backups]

**6. Network Issues**
- Hypothesis: Network connectivity problems
- Evidence to check: [Network metrics, connectivity tests]
- How to verify: [Ping tests, traceroute]

---

## Investigation Workflow

### Workflow Template

**Step 1: Reproduce the Issue**
- [ ] Can I reproduce it?
- [ ] What steps reproduce it?
- [ ] Is it consistent or intermittent?
- [ ] What's the error message/behavior?

**Step 2: Check the Obvious**
- [ ] Is service running? [Status check]
- [ ] Are dependencies healthy? [Health checks]
- [ ] Are there recent errors? [Error logs]
- [ ] Has anything changed? [Recent changes]

**Step 3: Narrow Down Scope**
- [ ] Is it affecting all users or subset?
- [ ] Is it affecting all features or specific ones?
- [ ] Is it affecting all regions or specific region?
- [ ] Is it affecting all servers or specific server?

**Step 4: Form Initial Hypothesis**
- [ ] Based on evidence, what's most likely?
- [ ] What would explain all the symptoms?
- [ ] What's the simplest explanation?

**Step 5: Test Hypothesis**
- [ ] How can I verify this hypothesis?
- [ ] What evidence would confirm it?
- [ ] What test can I run?

---

## Common Debugging Strategies

### Strategy 1: Divide and Conquer
- [ ] Split system into components
- [ ] Test each component independently
- [ ] Identify which component is failing
- [ ] Narrow down to specific component

### Strategy 2: Binary Search
- [ ] Check midpoint of system
- [ ] If issue before midpoint, check first half
- [ ] If issue after midpoint, check second half
- [ ] Repeat until isolated

### Strategy 3: Compare Working vs. Broken
- [ ] What's different between working and broken?
- [ ] Compare configs: [Working vs. broken]
- [ ] Compare code versions: [Working vs. broken]
- [ ] Compare environments: [Working vs. broken]

### Strategy 4: Check Logs Systematically
- [ ] Start from when issue began
- [ ] Follow log trail chronologically
- [ ] Look for error patterns
- [ ] Trace request flow through logs

### Strategy 5: Use Debugging Tools
- [ ] Debugger: [Breakpoints, step through]
- [ ] Profilers: [Performance analysis]
- [ ] Tracing: [Distributed tracing]
- [ ] Monitoring: [Real-time metrics]

---

## Debugging Common Issues

### Issue: Service Not Responding

**Investigation Steps**:
1. [ ] Check if service is running: [Command]
2. [ ] Check service logs: [Command]
3. [ ] Check resource usage: [CPU/Memory]
4. [ ] Check network connectivity: [Ping/curl]
5. [ ] Check health endpoint: [URL]
6. [ ] Check recent deployments: [When]
7. [ ] Check dependencies: [Are they up?]

**Common Causes**:
- Service crashed: [Check logs for crash]
- Resource exhaustion: [Check CPU/memory]
- Configuration error: [Check configs]
- Dependency down: [Check dependencies]

### Issue: High Error Rate

**Investigation Steps**:
1. [ ] Check error logs: [Most common errors]
2. [ ] Identify error patterns: [What errors?]
3. [ ] Check when errors started: [Timeline]
4. [ ] Check recent changes: [Deployments/configs]
5. [ ] Check related metrics: [Request rate, latency]
6. [ ] Check database: [Query performance]

**Common Causes**:
- Code bug: [Recent deployment]
- Database issue: [Connection/query problems]
- Dependency issue: [External service down]
- Resource issue: [Out of capacity]

### Issue: Slow Performance

**Investigation Steps**:
1. [ ] Check response times: [Current vs. baseline]
2. [ ] Check resource usage: [CPU/Memory/DB]
3. [ ] Check database queries: [Slow queries]
4. [ ] Check network latency: [Network metrics]
5. [ ] Check request rate: [Traffic spike?]
6. [ ] Check recent changes: [Deployments]

**Common Causes**:
- N+1 queries: [Check database queries]
- Resource exhaustion: [CPU/Memory]
- Slow dependency: [External service]
- Traffic spike: [More requests than capacity]

### Issue: Data Inconsistency

**Investigation Steps**:
1. [ ] Identify scope: [What data is affected?]
2. [ ] Check data integrity: [Database checks]
3. [ ] Check recent changes: [Data migrations/writes]
4. [ ] Check application logic: [How data is written]
5. [ ] Check replication: [If replicated]
6. [ ] Review recent operations: [What changed data?]

**Common Causes**:
- Bug in application logic: [Check code]
- Data migration issue: [Check migrations]
- Replication lag: [Check replication]
- Concurrent updates: [Race condition]

---

## Effective Debugging Practices

### Time Management
- [ ] Set time limits for investigation phases
- [ ] Escalate if stuck after [X] minutes
- [ ] Don't rabbit hole into one theory
- [ ] Take breaks if frustrated

### Documentation
- [ ] Document what you've checked
- [ ] Document hypotheses tested
- [ ] Document findings
- [ ] Document resolution steps

### Collaboration
- [ ] Ask for help when stuck
- [ ] Share findings with team
- [ ] Use pair debugging if helpful
- [ ] Escalate appropriately

### Verification
- [ ] Verify fix actually resolves issue
- [ ] Test related functionality
- [ ] Monitor metrics after fix
- [ ] Confirm no regressions

---

## Debugging Checklist

**Before Starting Investigation**:
- [ ] Understand the problem clearly
- [ ] Gather initial information
- [ ] Set up monitoring/logging access
- [ ] Prepare debugging tools

**During Investigation**:
- [ ] Follow systematic approach
- [ ] Document findings
- [ ] Test hypotheses
- [ ] Don't make assumptions
- [ ] Ask for help when needed

**After Finding Root Cause**:
- [ ] Verify root cause
- [ ] Implement fix
- [ ] Verify fix works
- [ ] Document solution
- [ ] Update runbooks

---

## Escalation Criteria

**When to Escalate**:
- [ ] No progress after [X] minutes
- [ ] Issue exceeds your expertise
- [ ] Need access/permissions you don't have
- [ ] Issue affecting critical systems
- [ ] Customer impact severe

**How to Escalate**:
- [ ] Summarize what you've found
- [ ] Share investigation steps taken
- [ ] Explain what you need help with
- [ ] Provide context and evidence
- [ ] Include customer impact

---

## Common Mistakes to Avoid

**Don't**:
- [ ] Assume you know the cause without evidence
- [ ] Skip systematic investigation
- [ ] Make changes without understanding impact
- [ ] Ignore obvious checks
- [ ] Work in isolation when stuck
- [ ] Forget to document findings
- [ ] Forget to verify fixes

**Do**:
- [ ] Follow systematic approach
- [ ] Gather evidence before acting
- [ ] Document everything
- [ ] Ask for help when needed
- [ ] Verify your fixes
- [ ] Learn from incidents`,
  },
  {
    title: 'On-Call Support Best Practices',
    description: 'Comprehensive guide for on-call engineers covering preparation, incident handling, communication, self-care, and continuous improvement.',
    role: 'engineering-manager',
    category: 'management',
    tags: ['on-call', 'best-practices', 'incident-response', 'support', 'operations'],
    content: `# On-Call Support Best Practices

Act as an on-call engineer following best practices for effective incident response.

## Pre-On-Call Preparation

### Before Your Shift Begins

**Knowledge Preparation**:
- [ ] Review recent incidents and resolutions
- [ ] Review system architecture diagrams
- [ ] Review runbooks for common issues
- [ ] Review recent deployments/changes
- [ ] Review on-call handoff notes

**Tool Preparation**:
- [ ] Verify access to all systems
- [ ] Test monitoring tools
- [ ] Verify alert routing works
- [ ] Test incident management tools
- [ ] Verify communication channels

**Personal Preparation**:
- [ ] Ensure good sleep before shift
- [ ] Have phone/laptop charged
- [ ] Have internet connection ready
- [ ] Set up comfortable workspace
- [ ] Plan for meals/breaks

---

## During On-Call Shift

### Incident Response Workflow

**Step 1: Alert Received**
- [ ] Acknowledge alert immediately
- [ ] Assess severity
- [ ] Create incident ticket/thread
- [ ] Notify team if needed

**Step 2: Initial Triage**
- [ ] Gather basic information
- [ ] Check monitoring dashboards
- [ ] Review recent changes
- [ ] Assess impact scope
- [ ] Determine severity

**Step 3: Investigation**
- [ ] Follow systematic debugging approach
- [ ] Document findings
- [ ] Form hypotheses
- [ ] Test hypotheses
- [ ] Escalate if stuck

**Step 4: Mitigation**
- [ ] Implement fix/workaround
- [ ] Verify resolution
- [ ] Monitor metrics
- [ ] Communicate status

**Step 5: Post-Incident**
- [ ] Document incident
- [ ] Update status page
- [ ] Notify stakeholders
- [ ] Schedule postmortem

---

## Communication Best Practices

### Internal Communication

**Incident Channel Updates**:
- [ ] Create incident thread/channel
- [ ] Provide regular updates ([X] minute intervals)
- [ ] Share findings and progress
- [ ] Ask for help when needed
- [ ] Update status clearly

**Update Template**:
\`\`\`
[Incident ID] Update [Time]

Status: [Investigating/Mitigating/Resolved]

What I've found:
- [Finding 1]
- [Finding 2]

What I'm doing now:
- [Current action]

Next update: [Time]
\`\`\`

**Escalation Communication**:
- [ ] Be clear about what you need
- [ ] Provide context and evidence
- [ ] Explain what you've tried
- [ ] Express urgency appropriately

### External Communication

**Customer Communication**:
- [ ] Acknowledge issues promptly
- [ ] Provide regular updates
- [ ] Use customer-friendly language
- [ ] Show empathy
- [ ] Set realistic expectations

**Status Page Updates**:
- [ ] Update within [X] minutes
- [ ] Use clear, non-technical language
- [ ] Provide actionable information
- [ ] Update resolution promptly

---

## Problem-Solving Best Practices

### Systematic Approach

**Follow the Process**:
- [ ] Don't skip steps
- [ ] Document findings
- [ ] Test hypotheses
- [ ] Verify assumptions
- [ ] Don't rush to conclusions

**Stay Organized**:
- [ ] Track investigation steps
- [ ] Document hypotheses tested
- [ ] Keep timeline of events
- [ ] Note what worked/didn't work

**Think Broadly**:
- [ ] Consider all possibilities
- [ ] Check dependencies
- [ ] Look for patterns
- [ ] Consider recent changes

---

## Time Management

### Prioritization

**High Priority**:
- [ ] Critical incidents (SEV-1)
- [ ] Customer-facing issues
- [ ] Security incidents
- [ ] Data loss/corruption

**Medium Priority**:
- [ ] Important but not critical issues
- [ ] Affecting subset of users
- [ ] Has workaround available

**Low Priority**:
- [ ] Minor issues
- [ ] Non-critical bugs
- [ ] Can wait until next shift

### Setting Boundaries

**Reasonable Response Times**:
- [ ] SEV-1: [X] minutes
- [ ] SEV-2: [X] minutes
- [ ] SEV-3: [X] minutes
- [ ] SEV-4: [X] minutes

**When to Escalate**:
- [ ] No progress after [X] minutes
- [ ] Issue exceeds your expertise
- [ ] Need resources you don't have
- [ ] Customer impact severe

---

## Self-Care During On-Call

### Managing Stress

**Stay Calm**:
- [ ] Take deep breaths
- [ ] Don't panic
- [ ] Think systematically
- [ ] Ask for help when needed

**Take Breaks**:
- [ ] Step away if frustrated
- [ ] Take breaks between incidents
- [ ] Maintain regular sleep
- [ ] Eat regular meals

**Set Boundaries**:
- [ ] Don't work 24/7 on-call
- [ ] Hand off appropriately
- [ ] Take time off after heavy shifts
- [ ] Communicate workload concerns

### Maintaining Health

**Physical Health**:
- [ ] Get adequate sleep
- [ ] Eat healthy meals
- [ ] Stay hydrated
- [ ] Exercise regularly

**Mental Health**:
- [ ] Talk to teammates
- [ ] Share experiences
- [ ] Ask for support
- [ ] Take breaks
- [ ] Don't blame yourself

---

## Learning and Improvement

### After Each Incident

**Document Learnings**:
- [ ] What went well?
- [ ] What could be improved?
- [ ] What would you do differently?
- [ ] What tools/processes helped?

**Share Knowledge**:
- [ ] Update runbooks
- [ ] Share solutions with team
- [ ] Contribute to knowledge base
- [ ] Help train others

### Continuous Improvement

**Process Improvement**:
- [ ] Suggest improvements to on-call process
- [ ] Share feedback on tools
- [ ] Recommend runbook updates
- [ ] Suggest alert improvements

**Skill Development**:
- [ ] Learn from incidents
- [ ] Practice debugging skills
- [ ] Study system architecture
- [ ] Attend training sessions

---

## Common Mistakes to Avoid

**Don't**:
- [ ] Panic or rush
- [ ] Skip systematic investigation
- [ ] Make changes without understanding
- [ ] Ignore documentation
- [ ] Work in isolation when stuck
- [ ] Forget to communicate
- [ ] Burn yourself out

**Do**:
- [ ] Follow systematic approach
- [ ] Document everything
- [ ] Ask for help when needed
- [ ] Communicate regularly
- [ ] Take care of yourself
- [ ] Learn from each incident
- [ ] Improve processes

---

## Checklist for On-Call Shift

**Before Shift**:
- [ ] Reviewed handoff notes
- [ ] Verified access to systems
- [ ] Tested monitoring tools
- [ ] Understood current state
- [ ] Prepared personal space

**During Shift**:
- [ ] Respond to alerts promptly
- [ ] Follow investigation process
- [ ] Communicate regularly
- [ ] Document findings
- [ ] Escalate appropriately
- [ ] Take breaks
- [ ] Stay calm

**After Shift**:
- [ ] Document any unresolved issues
- [ ] Update handoff notes
- [ ] Share learnings with team
- [ ] Update runbooks if needed
- [ ] Rest and recover

---

## Success Metrics

**Personal Success**:
- [ ] Responded to all alerts within SLA
- [ ] Resolved incidents effectively
- [ ] Communicated clearly
- [ ] Learned from incidents
- [ ] Maintained work-life balance

**Team Success**:
- [ ] Improved incident response time
- [ ] Reduced repeat incidents
- [ ] Better documentation
- [ ] Improved processes
- [ ] Stronger team collaboration`,
  },
];

async function createPrompts() {
  console.log('🚀 Creating On-Call Support Prompts\n');
  console.log('='.repeat(70));

  const db = await getDb();
  const promptsCollection = db.collection('prompts');

  let created = 0;
  let skipped = 0;

  for (const prompt of PROMPTS_TO_CREATE) {
    // Check if prompt already exists
    const existing = await promptsCollection.findOne({
      title: { $regex: new RegExp(prompt.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      role: prompt.role,
    });

    if (existing) {
      console.log(`\n⏭️  Skipped: "${prompt.title}" (${prompt.role}) - already exists`);
      skipped++;
      continue;
    }

    // Generate unique slug
    const baseSlug = generateSlug(prompt.title);
    let slug = baseSlug;
    let suffix = 1;
    
    while (await promptsCollection.findOne({ slug })) {
      suffix++;
      slug = `${baseSlug}-${suffix}`;
    }

    const promptDoc = {
      id: randomUUID(),
      slug,
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      category: prompt.category,
      role: prompt.role,
      tags: prompt.tags,
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

    try {
      await promptsCollection.insertOne(promptDoc);
      created++;
      console.log(`\n✅ Created: "${prompt.title}"`);
      console.log(`   Role: ${prompt.role} | Category: ${prompt.category}`);
      console.log(`   Tags: ${prompt.tags.join(', ')}`);
    } catch (error) {
      const mongoError = error as { code?: number };
      if (mongoError.code === 11000) {
        console.log(`\n⏭️  Skipped (duplicate): "${prompt.title}"`);
        skipped++;
      } else {
        console.error(`\n❌ Error creating "${prompt.title}":`, error);
      }
    }
  }

  console.log(`\n\n📊 Summary:`);
  console.log(`   - Created: ${created} prompts`);
  console.log(`   - Skipped: ${skipped} prompts`);
  console.log(`\n✨ Complete!`);

  process.exit(0);
}

createPrompts().catch(console.error);

