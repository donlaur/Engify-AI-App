#!/usr/bin/env tsx
/**
 * Create Incident Management and DevOps Playbook Prompts
 * 
 * Creates prompts for:
 * - Incident Management Plans
 * - Incident Recovery Plans
 * - Post-Incident Reviews (Postmortems)
 * - DevOps Playbooks
 * - Runbooks
 * - On-Call Procedures
 * 
 * Usage:
 *   tsx scripts/content/create-incident-devops-playbooks.ts
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
    title: 'Create Incident Management Plan',
    description: 'Develop a comprehensive incident management plan including roles, escalation procedures, communication protocols, and response workflows.',
    role: 'engineering-manager',
    category: 'management',
    tags: ['incident-management', 'devops', 'on-call', 'operations', 'reliability'],
    content: `# Create Incident Management Plan

Act as an Engineering Manager creating an incident management plan.

## Incident Management Context
- **Organization Size**: [Team size]
- **System Complexity**: [High/Medium/Low]
- **Service Level Objectives**: [SLOs for your services]
- **Business Impact Tolerance**: [Acceptable downtime/customer impact]

## Incident Management Framework

### 1. Incident Classification

**Severity Levels**:
- **SEV-1 (Critical)**: [Definition] - [Example]
  - Impact: [Service down, data loss, security breach]
  - Response Time: [X minutes]
  - Escalation: [Immediate to CTO/VP]

- **SEV-2 (High)**: [Definition] - [Example]
  - Impact: [Major feature degraded, significant user impact]
  - Response Time: [X minutes]
  - Escalation: [To Engineering Director]

- **SEV-3 (Medium)**: [Definition] - [Example]
  - Impact: [Minor feature degradation, limited user impact]
  - Response Time: [X minutes]
  - Escalation: [To Team Lead]

- **SEV-4 (Low)**: [Definition] - [Example]
  - Impact: [Cosmetic issues, minor bugs]
  - Response Time: [X minutes]
  - Escalation: [Standard support]

### 2. Incident Response Roles

**Incident Commander**:
- Responsibilities: [Coordinate response, make decisions, communicate status]
- Who: [Role/person]
- Escalation Path: [When to escalate]

**On-Call Engineer**:
- Responsibilities: [Initial triage, investigation, mitigation]
- Who: [Rotation schedule]
- Handoff Procedure: [How to hand off]

**Subject Matter Experts (SMEs)**:
- Responsibilities: [Provide expertise, assist with resolution]
- Who: [List SMEs by domain]
- Contact Method: [How to reach]

**Communication Lead**:
- Responsibilities: [Update stakeholders, manage comms]
- Who: [Role/person]
- Communication Channels: [Slack, email, status page]

### 3. Incident Response Workflow

**Phase 1: Detection & Triage (0-15 minutes)**
- [ ] Incident detected via [monitoring/alerts/tickets]
- [ ] On-call engineer notified
- [ ] Initial severity assessment
- [ ] Incident created in [tool]
- [ ] War room/incident channel created

**Phase 2: Investigation (15-60 minutes)**
- [ ] Gather logs and metrics
- [ ] Identify root cause
- [ ] Assess impact scope
- [ ] Document findings
- [ ] Determine mitigation strategy

**Phase 3: Mitigation (Immediate)**
- [ ] Deploy hotfix/workaround
- [ ] Monitor resolution
- [ ] Verify system recovery
- [ ] Validate customer impact resolved

**Phase 4: Post-Incident (After resolution)**
- [ ] Incident resolved
- [ ] Post-incident review scheduled
- [ ] Status page updated
- [ ] Stakeholders notified
- [ ] Documentation updated

### 4. Escalation Procedures

**Escalation Triggers**:
- [ ] Severity upgrade (e.g., SEV-3 → SEV-2)
- [ ] No progress after [X] minutes
- [ ] External dependencies blocked
- [ ] Security concern identified
- [ ] Business impact exceeds threshold

**Escalation Path**:
1. On-Call Engineer → Team Lead
2. Team Lead → Engineering Manager
3. Engineering Manager → Engineering Director
4. Engineering Director → VP/CTO

**Escalation Communication**:
- [ ] Notify escalation contact via [method]
- [ ] Provide incident summary
- [ ] Include current status and blockers
- [ ] Request specific help needed

### 5. Communication Protocols

**Internal Communication**:
- **Incident Channel**: [Slack channel for incident updates]
- **Update Frequency**: [Every X minutes during active incidents]
- **Status Format**: [Template for updates]

**External Communication**:
- **Status Page**: [URL for public status updates]
- **Customer Notifications**: [When/how to notify customers]
- **Executive Updates**: [Format for executive briefings]

**Communication Templates**:
- Initial Incident Alert: [Template]
- Status Update: [Template]
- Resolution Notification: [Template]

### 6. Monitoring & Alerting

**Key Metrics to Monitor**:
- [ ] System uptime/availability
- [ ] Error rates
- [ ] Response times
- [ ] Resource utilization
- [ ] Business metrics (revenue, user activity)

**Alert Configuration**:
- [ ] Alert thresholds defined
- [ ] Alert routing configured
- [ ] On-call schedule configured
- [ ] Escalation policies set

### 7. Tools & Systems

**Incident Management Tools**:
- [ ] [Tool name] - [Purpose]
- [ ] [Tool name] - [Purpose]

**Monitoring Tools**:
- [ ] [Tool name] - [Purpose]

**Communication Tools**:
- [ ] [Tool name] - [Purpose]

### 8. Training & Documentation

**Training Requirements**:
- [ ] New engineers: [Training program]
- [ ] On-call engineers: [On-call training]
- [ ] Incident commanders: [Incident response training]

**Documentation**:
- [ ] Runbooks for common incidents
- [ ] System architecture diagrams
- [ ] Troubleshooting guides
- [ ] Contact lists

## Success Metrics

**Incident Response Metrics**:
- Mean Time to Acknowledge (MTTA): [Target]
- Mean Time to Resolve (MTTR): [Target]
- Incident Frequency: [Target]
- Post-Incident Review Completion: [Target %]`,
  },
  {
    title: 'Create Incident Recovery Plan',
    description: 'Develop detailed incident recovery procedures including rollback plans, failover procedures, data recovery steps, and service restoration workflows.',
    role: 'engineering-manager',
    category: 'management',
    tags: ['incident-recovery', 'disaster-recovery', 'devops', 'reliability', 'operations'],
    content: `# Create Incident Recovery Plan

Act as an Engineering Manager creating an incident recovery plan.

## Recovery Plan Context
- **System**: [System/service name]
- **Criticality**: [Critical/High/Medium/Low]
- **Recovery Time Objective (RTO)**: [Target recovery time]
- **Recovery Point Objective (RPO)**: [Acceptable data loss window]

## Recovery Procedures

### 1. Pre-Incident Preparation

**Backup Strategy**:
- [ ] Database backups: [Frequency, retention]
- [ ] Configuration backups: [Frequency, retention]
- [ ] Code backups: [Version control, release tags]
- [ ] Backup verification: [How to verify backups]

**Disaster Recovery Infrastructure**:
- [ ] Secondary region/environment: [Location]
- [ ] Failover capabilities: [Active-passive/Active-active]
- [ ] Standby resources: [Resources available]
- [ ] DNS failover: [Configured/Load balancer]

**Documentation**:
- [ ] System architecture documented
- [ ] Dependencies mapped
- [ ] Recovery procedures documented
- [ ] Contact lists maintained

### 2. Recovery Decision Tree

**Scenario: Service Down**
- [ ] Check health endpoints
- [ ] Verify infrastructure status
- [ ] Review recent deployments
- [ ] Check logs for errors
- [ ] Option A: Rollback deployment
- [ ] Option B: Restart services
- [ ] Option C: Scale up resources
- [ ] Option D: Failover to secondary region

**Scenario: Data Corruption**
- [ ] Identify corrupted data
- [ ] Assess scope of corruption
- [ ] Option A: Restore from backup (if data loss acceptable)
- [ ] Option B: Repair corrupted data (if possible)
- [ ] Option C: Rebuild from source (if available)

**Scenario: Security Breach**
- [ ] Isolate affected systems
- [ ] Preserve evidence
- [ ] Notify security team
- [ ] Assess data exposure
- [ ] Restore from clean backup
- [ ] Deploy security patches

### 3. Rollback Procedures

**Deployment Rollback**:
- [ ] Identify deployment version
- [ ] Verify previous stable version
- [ ] Execute rollback: [Step-by-step commands]
- [ ] Verify rollback success
- [ ] Monitor system health
- [ ] Notify stakeholders

**Database Rollback**:
- [ ] Stop database writes
- [ ] Identify restore point
- [ ] Restore from backup: [Commands]
- [ ] Verify data integrity
- [ ] Resume database operations
- [ ] Monitor for issues

**Configuration Rollback**:
- [ ] Identify configuration change
- [ ] Restore previous configuration
- [ ] Restart affected services
- [ ] Verify configuration applied
- [ ] Monitor system behavior

### 4. Failover Procedures

**Active-Passive Failover**:
- [ ] Verify secondary region health
- [ ] Stop primary region traffic
- [ ] Update DNS/load balancer
- [ ] Verify failover success
- [ ] Monitor secondary region
- [ ] Document failover event

**Active-Active Failover**:
- [ ] Identify failing region
- [ ] Drain traffic from failing region
- [ ] Redirect traffic to healthy region
- [ ] Monitor traffic distribution
- [ ] Verify service continuity

**Database Failover**:
- [ ] Identify primary database failure
- [ ] Promote secondary database
- [ ] Update connection strings
- [ ] Verify database connectivity
- [ ] Monitor replication lag

### 5. Data Recovery Procedures

**Database Recovery**:
- [ ] Identify data loss/corruption
- [ ] Stop data writes
- [ ] Select restore point (within RPO)
- [ ] Restore database: [Commands]
- [ ] Verify data integrity
- [ ] Resume operations

**File System Recovery**:
- [ ] Identify lost/corrupted files
- [ ] Restore from backup: [Commands]
- [ ] Verify file integrity
- [ ] Restore permissions
- [ ] Resume file operations

**Application State Recovery**:
- [ ] Identify lost state
- [ ] Restore from checkpoint/backup
- [ ] Replay logs if available
- [ ] Verify state consistency
- [ ] Resume application operations

### 6. Service Restoration Workflow

**Step 1: Assess Impact**
- [ ] What services are affected?
- [ ] How many users impacted?
- [ ] What functionality is broken?
- [ ] What data is at risk?

**Step 2: Choose Recovery Strategy**
- [ ] Quick fix/workaround available?
- [ ] Rollback possible?
- [ ] Failover needed?
- [ ] Full restoration required?

**Step 3: Execute Recovery**
- [ ] Execute recovery procedures
- [ ] Monitor recovery progress
- [ ] Verify recovery success
- [ ] Document actions taken

**Step 4: Validate Recovery**
- [ ] Test critical functionality
- [ ] Verify data integrity
- [ ] Monitor error rates
- [ ] Confirm user impact resolved

**Step 5: Post-Recovery**
- [ ] Update status page
- [ ] Notify stakeholders
- [ ] Schedule post-incident review
- [ ] Update documentation

### 7. Recovery Testing

**Test Scenarios**:
- [ ] Database failure recovery
- [ ] Deployment rollback
- [ ] Region failover
- [ ] Data corruption recovery
- [ ] Security incident recovery

**Testing Schedule**:
- [ ] Quarterly: [Full disaster recovery test]
- [ ] Monthly: [Component recovery tests]
- [ ] Weekly: [Backup verification]

**Test Documentation**:
- [ ] Test results recorded
- [ ] Recovery time measured
- [ ] Issues documented
- [ ] Improvements identified

### 8. Recovery Tools & Scripts

**Automation Scripts**:
- [ ] Rollback script: [Location]
- [ ] Failover script: [Location]
- [ ] Database restore script: [Location]
- [ ] Health check script: [Location]

**Monitoring Tools**:
- [ ] [Tool] - [Purpose]
- [ ] [Tool] - [Purpose]

**Backup Tools**:
- [ ] [Tool] - [Purpose]
- [ ] [Tool] - [Purpose]

## Success Metrics

**Recovery Metrics**:
- Recovery Time Objective (RTO): [Target]
- Recovery Point Objective (RPO): [Target]
- Recovery Success Rate: [Target %]
- Mean Time to Recovery (MTTR): [Target]`,
  },
  {
    title: 'Write Post-Incident Review (Postmortem)',
    description: 'Create comprehensive post-incident reviews documenting what happened, root cause analysis, impact assessment, and action items to prevent recurrence.',
    role: 'engineering-manager',
    category: 'management',
    tags: ['postmortem', 'post-incident-review', 'incident-analysis', 'devops', 'reliability'],
    content: `# Write Post-Incident Review (Postmortem)

Act as an Engineering Manager writing a post-incident review.

## Post-Incident Review Template

### Incident Summary
- **Incident ID**: [ID]
- **Date & Time**: [Start] - [End]
- **Duration**: [Duration]
- **Severity**: [SEV-1/2/3/4]
- **Status**: [Resolved/Mitigated]

### Executive Summary
[2-3 sentence summary of what happened and impact]

### Timeline of Events

**Detection** ([Time]):
- [What happened]
- [How it was detected]
- [Who was notified]

**Investigation** ([Time]):
- [What was investigated]
- [Key findings]
- [Decisions made]

**Mitigation** ([Time]):
- [Actions taken]
- [Workarounds deployed]
- [Resources involved]

**Resolution** ([Time]):
- [Root cause identified]
- [Permanent fix deployed]
- [Verification completed]

---

### Impact Assessment

**User Impact**:
- [ ] Affected users: [Number/%]
- [ ] Affected regions: [List]
- [ ] Affected features: [List]
- [ ] User-visible errors: [Description]

**Business Impact**:
- [ ] Revenue impact: [\$ or %]
- [ ] Customer churn: [Number]
- [ ] Support tickets: [Number]
- [ ] Brand reputation: [Impact]

**Technical Impact**:
- [ ] Services affected: [List]
- [ ] Error rate increase: [% or number]
- [ ] Performance degradation: [%]
- [ ] Data integrity: [Any issues]

---

### Root Cause Analysis

**Primary Root Cause**:
- [Detailed explanation]
- [Why it happened]
- [Contributing factors]

**Contributing Factors**:
- [ ] [Factor 1]: [Explanation]
- [ ] [Factor 2]: [Explanation]
- [ ] [Factor 3]: [Explanation]

**Five Whys Analysis**:
1. Why did [symptom] happen? → [Answer]
2. Why did [answer 1] happen? → [Answer]
3. Why did [answer 2] happen? → [Answer]
4. Why did [answer 3] happen? → [Answer]
5. Why did [answer 4] happen? → [Root cause]

---

### What Went Well
- [ ] [Positive aspect 1]
- [ ] [Positive aspect 2]
- [ ] [Positive aspect 3]

### What Went Wrong
- [ ] [Problem 1]
- [ ] [Problem 2]
- [ ] [Problem 3]

### What We Learned
- [ ] [Learning 1]
- [ ] [Learning 2]
- [ ] [Learning 3]

---

### Action Items

**Immediate Actions** (This Week):
- [ ] [Action] - Owner: [Name] - Due: [Date]
- [ ] [Action] - Owner: [Name] - Due: [Date]

**Short-term Actions** (This Month):
- [ ] [Action] - Owner: [Name] - Due: [Date]
- [ ] [Action] - Owner: [Name] - Due: [Date]

**Long-term Actions** (This Quarter):
- [ ] [Action] - Owner: [Name] - Due: [Date]
- [ ] [Action] - Owner: [Name] - Due: [Date]

**Action Item Categories**:
- Prevention: [Actions to prevent recurrence]
- Detection: [Actions to improve detection]
- Response: [Actions to improve response]
- Recovery: [Actions to improve recovery]

---

### Metrics & Statistics

**Incident Metrics**:
- Mean Time to Acknowledge (MTTA): [Time]
- Mean Time to Resolve (MTTR): [Time]
- Time to Detection: [Time]
- Time to Mitigation: [Time]
- Time to Resolution: [Time]

**Comparison to Goals**:
- [ ] MTTA within target? [Yes/No]
- [ ] MTTR within target? [Yes/No]
- [ ] Communication timeline met? [Yes/No]

---

### Follow-up Actions

**Review Schedule**:
- [ ] Action item review: [Date]
- [ ] Retrospective meeting: [Date]
- [ ] Document update: [Date]

**Stakeholder Communication**:
- [ ] Executive summary shared: [Date]
- [ ] Customer communication sent: [Date]
- [ ] Status page updated: [Date]

---

## Post-Incident Review Best Practices

**Blameless Culture**:
- Focus on systems and processes, not individuals
- Ask "What" and "How", not "Who"
- Encourage learning and improvement

**Thoroughness**:
- Include all relevant details
- Document lessons learned
- Track action items to completion

**Transparency**:
- Share learnings across teams
- Update documentation
- Communicate changes to stakeholders`,
  },
  {
    title: 'Create DevOps Runbook',
    description: 'Develop operational runbooks for common tasks, troubleshooting procedures, and standard operational procedures for DevOps teams.',
    role: 'engineering-manager',
    category: 'management',
    tags: ['runbook', 'devops', 'operations', 'troubleshooting', 'standard-procedures'],
    content: `# Create DevOps Runbook

Act as an Engineering Manager creating a DevOps runbook for operational procedures.

## Runbook Context
- **Service/System**: [Name]
- **Environment**: [Production/Staging/Development]
- **Owner**: [Team/person]
- **Last Updated**: [Date]

## Runbook Structure

### 1. Service Overview

**Purpose**: [What this service does]

**Key Components**:
- [ ] [Component 1]: [Description]
- [ ] [Component 2]: [Description]
- [ ] [Component 3]: [Description]

**Dependencies**:
- [ ] [Dependency 1]: [How it's used]
- [ ] [Dependency 2]: [How it's used]

**Architecture**:
- [Diagram or description]
- [Data flow]
- [Key integrations]

---

### 2. Health Checks

**Service Health Endpoint**:
\`\`\`
GET /health
Expected Response: {"status": "healthy"}
\`\`\`

**Key Health Indicators**:
- [ ] API response time: [Target < X ms]
- [ ] Error rate: [Target < X%]
- [ ] Database connectivity: [Check]
- [ ] External dependencies: [Check]

**Monitoring Dashboards**:
- [ ] [Dashboard URL] - [What it shows]
- [ ] [Dashboard URL] - [What it shows]

**Alert Thresholds**:
- [ ] Error rate > [X]%: [Alert]
- [ ] Response time > [X]ms: [Alert]
- [ ] CPU > [X]%: [Alert]
- [ ] Memory > [X]%: [Alert]

---

### 3. Common Operations

**Deployment Procedure**:
1. [ ] Backup current version
2. [ ] Run pre-deployment checks
3. [ ] Deploy to staging: [Command]
4. [ ] Verify staging deployment
5. [ ] Deploy to production: [Command]
6. [ ] Monitor deployment metrics
7. [ ] Verify production deployment

**Rollback Procedure**:
1. [ ] Identify version to rollback to
2. [ ] Execute rollback: [Command]
3. [ ] Verify rollback success
4. [ ] Monitor system health

**Scalability Procedures**:
- **Scale Up**: [Commands/Steps]
- **Scale Down**: [Commands/Steps]
- **Auto-scaling**: [Configuration]

**Backup Procedures**:
- **Manual Backup**: [Commands]
- **Backup Verification**: [Commands]
- **Backup Restoration**: [Commands]

---

### 4. Troubleshooting Guide

**Issue: High Error Rate**
- [ ] Check error logs: [Command]
- [ ] Review recent deployments
- [ ] Check dependency health
- [ ] Review system metrics
- [ ] Solution: [Common fixes]

**Issue: Slow Response Times**
- [ ] Check CPU/Memory usage
- [ ] Review database query performance
- [ ] Check network latency
- [ ] Review recent changes
- [ ] Solution: [Common fixes]

**Issue: Service Unavailable**
- [ ] Check service status: [Command]
- [ ] Review infrastructure status
- [ ] Check logs for errors
- [ ] Verify dependencies
- [ ] Solution: [Common fixes]

**Issue: Database Connection Errors**
- [ ] Check database status
- [ ] Verify connection strings
- [ ] Check network connectivity
- [ ] Review connection pool settings
- [ ] Solution: [Common fixes]

---

### 5. Emergency Procedures

**Service Down - Emergency Response**:
1. [ ] Acknowledge incident
2. [ ] Notify team: [Method]
3. [ ] Check service status: [Command]
4. [ ] Review recent deployments
5. [ ] Execute rollback if needed: [Command]
6. [ ] Monitor recovery

**Data Corruption - Emergency Response**:
1. [ ] Stop data writes
2. [ ] Assess corruption scope
3. [ ] Restore from backup: [Command]
4. [ ] Verify data integrity
5. [ ] Resume operations

**Security Incident - Emergency Response**:
1. [ ] Isolate affected systems
2. [ ] Notify security team
3. [ ] Preserve evidence
4. [ ] Assess impact
5. [ ] Deploy patches if needed

---

### 6. Maintenance Tasks

**Regular Maintenance**:
- **Daily**: [Tasks]
- **Weekly**: [Tasks]
- **Monthly**: [Tasks]
- **Quarterly**: [Tasks]

**Log Rotation**:
- [ ] Configuration: [Location]
- [ ] Retention: [Duration]
- [ ] Rotation: [Frequency]

**Certificate Renewal**:
- [ ] Certificates: [List]
- [ ] Renewal process: [Steps]
- [ ] Monitoring: [How to monitor]

**Database Maintenance**:
- [ ] Backup verification: [Schedule]
- [ ] Index optimization: [Schedule]
- [ ] Vacuum/cleanup: [Schedule]

---

### 7. Access & Permissions

**Required Access**:
- [ ] [Service/System]: [Access level]
- [ ] [Service/System]: [Access level]

**Access Request Process**:
- [ ] Request via [Method]
- [ ] Approval required from [Role]
- [ ] Access granted via [Method]

**SSH/Remote Access**:
- [ ] Jump host: [Hostname]
- [ ] SSH command: [Command]
- [ ] Key management: [Process]

---

### 8. Documentation & Resources

**Documentation Links**:
- [ ] Architecture docs: [URL]
- [ ] API docs: [URL]
- [ ] Deployment guide: [URL]

**Related Runbooks**:
- [ ] [Related runbook]: [Link]
- [ ] [Related runbook]: [Link]

**Contact Information**:
- [ ] On-call engineer: [Contact]
- [ ] Team lead: [Contact]
- [ ] Escalation: [Contact]

---

## Runbook Best Practices

**Keep Updated**:
- Review quarterly
- Update after incidents
- Update after major changes

**Test Procedures**:
- Test runbook procedures regularly
- Verify commands work
- Update outdated steps

**Clear & Concise**:
- Use step-by-step format
- Include exact commands
- Provide context for decisions`,
  },
  {
    title: 'Create On-Call Procedures and Playbook',
    description: 'Develop comprehensive on-call procedures including rotation schedules, escalation policies, handoff procedures, and on-call best practices.',
    role: 'engineering-manager',
    category: 'management',
    tags: ['on-call', 'devops', 'operations', 'incident-response', 'reliability'],
    content: `# Create On-Call Procedures and Playbook

Act as an Engineering Manager creating on-call procedures.

## On-Call Context
- **Team Size**: [Number of engineers]
- **Rotation Schedule**: [Weekly/Monthly/etc.]
- **Coverage**: [24/7/Business hours/etc.]
- **Services Covered**: [List critical services]

## On-Call Framework

### 1. On-Call Rotation

**Rotation Schedule**:
- **Primary On-Call**: [Name] - [Dates]
- **Secondary On-Call**: [Name] - [Dates]
- **Shadow/Backup**: [Name] - [Dates]

**Rotation Rules**:
- [ ] Rotation changes every [day/week]
- [ ] Handoff meeting: [Day/time]
- [ ] Minimum [X] engineers per rotation
- [ ] Backup coverage for vacations

**On-Call Tools**:
- [ ] [Tool] - [Purpose]
- [ ] [Tool] - [Purpose]

---

### 2. On-Call Responsibilities

**Primary Responsibilities**:
- [ ] Respond to alerts within [X] minutes
- [ ] Acknowledge incidents promptly
- [ ] Investigate and triage incidents
- [ ] Escalate when appropriate
- [ ] Document actions taken
- [ ] Communicate status updates

**Response Time Expectations**:
- **SEV-1**: [X] minutes
- **SEV-2**: [X] minutes
- **SEV-3**: [X] minutes
- **SEV-4**: [X] minutes

**Escalation Criteria**:
- [ ] No progress after [X] minutes
- [ ] Severity upgrade needed
- [ ] External dependencies blocked
- [ ] Business impact exceeds threshold

---

### 3. Alert Management

**Alert Prioritization**:
- **P0 (Critical)**: [Immediate response]
- **P1 (High)**: [Response within X minutes]
- **P2 (Medium)**: [Response within X minutes]
- **P3 (Low)**: [Response within X minutes]

**Alert Routing**:
- [ ] [Alert type] → [On-call engineer]
- [ ] [Alert type] → [Escalation path]

**Alert Fatigue Prevention**:
- [ ] Review alert noise monthly
- [ ] Tune alert thresholds
- [ ] Consolidate similar alerts
- [ ] Remove non-actionable alerts

---

### 4. Handoff Procedures

**End-of-Shift Handoff**:
- [ ] Review active incidents
- [ ] Document ongoing issues
- [ ] Share context with next on-call
- [ ] Update handoff document

**Handoff Template**:
\`\`\`
## On-Call Handoff - [Date]

### Active Incidents
- [Incident details]

### Ongoing Issues
- [Issue details]

### Recent Changes
- [Deployments, config changes]

### Things to Watch
- [Monitoring, potential issues]

### Notes
- [Additional context]
\`\`\`

**Handoff Meeting**:
- [ ] Scheduled: [Day/time]
- [ ] Duration: [X] minutes
- [ ] Attendees: [Incoming/outgoing on-call]
- [ ] Format: [Sync/async]

---

### 5. Communication Protocols

**Internal Communication**:
- **Incident Channel**: [Slack channel]
- **Update Frequency**: [Every X minutes]
- **Status Format**: [Template]

**Stakeholder Communication**:
- **Who to Notify**: [List]
- **When to Notify**: [Criteria]
- **How to Notify**: [Method]

**Status Page Updates**:
- [ ] Update within [X] minutes of incident
- [ ] Update every [X] minutes during incident
- [ ] Post-resolution update required

---

### 6. On-Call Tools & Access

**Required Access**:
- [ ] [System/Tool]: [Access level]
- [ ] [System/Tool]: [Access level]

**Monitoring Tools**:
- [ ] [Tool]: [URL/Purpose]
- [ ] [Tool]: [URL/Purpose]

**Incident Management Tools**:
- [ ] [Tool]: [URL/Purpose]
- [ ] [Tool]: [URL/Purpose]

**Documentation**:
- [ ] Runbooks: [Location]
- [ ] Architecture docs: [Location]
- [ ] Troubleshooting guides: [Location]

---

### 7. On-Call Best Practices

**During On-Call**:
- [ ] Stay available and responsive
- [ ] Acknowledge alerts promptly
- [ ] Document actions taken
- [ ] Communicate status clearly
- [ ] Escalate when stuck

**Time Management**:
- [ ] Respond to critical alerts immediately
- [ ] Batch low-priority alerts
- [ ] Use downtime for documentation
- [ ] Hand off complex issues

**Learning Opportunities**:
- [ ] Review incidents after shift
- [ ] Update runbooks as needed
- [ ] Share learnings with team
- [ ] Improve procedures

---

### 8. On-Call Compensation & Support

**Compensation**:
- [ ] Extra compensation: [Amount/Time off]
- [ ] Time-in-lieu: [Hours]
- [ ] On-call allowance: [Amount]

**Support & Resources**:
- [ ] Engineering manager available: [Hours]
- [ ] Escalation contacts: [List]
- [ ] Technical support: [Available]

**Wellness**:
- [ ] Maximum consecutive shifts: [Number]
- [ ] Time off after heavy incidents
- [ ] Support for on-call stress
- [ ] Rotation balance

---

### 9. On-Call Training

**New Engineer Onboarding**:
- [ ] Shadow primary on-call: [Duration]
- [ ] Review runbooks
- [ ] Practice incidents
- [ ] Pass on-call test

**Continuous Training**:
- [ ] Monthly on-call review
- [ ] Incident drills
- [ ] Tool training
- [ ] Procedure updates

---

### 10. Metrics & Improvement

**On-Call Metrics**:
- Mean Time to Acknowledge (MTTA)
- Mean Time to Resolve (MTTR)
- On-call workload distribution
- Alert response rate

**Regular Reviews**:
- [ ] Monthly on-call retrospective
- [ ] Review alert noise
- [ ] Update procedures
- [ ] Share learnings

## Success Criteria

**On-Call Effectiveness**:
- [ ] All alerts acknowledged within SLA
- [ ] Incidents resolved within target time
- [ ] Team satisfaction with on-call
- [ ] Continuous improvement demonstrated`,
  },
  {
    title: 'Create DevOps Playbook for Common Scenarios',
    description: 'Develop a comprehensive DevOps playbook covering deployment procedures, infrastructure management, monitoring setup, and operational best practices.',
    role: 'engineering-director',
    category: 'leadership',
    tags: ['devops-playbook', 'operations', 'infrastructure', 'deployment', 'sre'],
    content: `# Create DevOps Playbook for Common Scenarios

Act as an Engineering Director creating a DevOps playbook.

## DevOps Playbook Overview

**Purpose**: Standardize DevOps practices and procedures across teams

**Scope**: [Infrastructure, deployment, monitoring, operations]

**Audience**: [DevOps engineers, SREs, platform engineers]

---

## 1. Infrastructure Provisioning

### Cloud Infrastructure Setup

**Infrastructure as Code**:
- [ ] Use [Terraform/CloudFormation/etc.]
- [ ] Version control infrastructure code
- [ ] Review infrastructure changes
- [ ] Test infrastructure changes

**Environment Creation**:
- **Development**: [Setup procedure]
- **Staging**: [Setup procedure]
- **Production**: [Setup procedure]

**Resource Tagging**:
- [ ] Standard tags: [List]
- [ ] Cost allocation tags
- [ ] Environment tags
- [ ] Owner tags

---

## 2. Deployment Procedures

### CI/CD Pipeline

**Pipeline Stages**:
1. [ ] Build: [What happens]
2. [ ] Test: [What happens]
3. [ ] Security scan: [What happens]
4. [ ] Deploy to staging: [What happens]
5. [ ] Integration tests: [What happens]
6. [ ] Deploy to production: [What happens]

**Deployment Strategies**:
- **Blue-Green**: [Procedure]
- **Canary**: [Procedure]
- **Rolling**: [Procedure]
- **Feature Flags**: [Usage]

**Deployment Checklist**:
- [ ] Code review approved
- [ ] Tests passing
- [ ] Security scans clean
- [ ] Documentation updated
- [ ] Rollback plan ready
- [ ] On-call notified

---

## 3. Monitoring & Observability

### Monitoring Setup

**Metrics to Monitor**:
- [ ] System metrics (CPU, memory, disk)
- [ ] Application metrics (latency, errors, throughput)
- [ ] Business metrics (revenue, user activity)
- [ ] Custom metrics (application-specific)

**Logging Strategy**:
- [ ] Log aggregation: [Tool]
- [ ] Log retention: [Duration]
- [ ] Log levels: [Configuration]
- [ ] Structured logging: [Format]

**Alerting Configuration**:
- [ ] Alert thresholds defined
- [ ] Alert routing configured
- [ ] On-call escalation setup
- [ ] Alert fatigue prevention

**Dashboards**:
- [ ] System health dashboard
- [ ] Application performance dashboard
- [ ] Business metrics dashboard
- [ ] Custom dashboards as needed

---

## 4. Security Practices

### Security Hardening

**Access Control**:
- [ ] Principle of least privilege
- [ ] Multi-factor authentication
- [ ] Regular access reviews
- [ ] Secrets management

**Security Scanning**:
- [ ] Dependency scanning: [Tool/schedule]
- [ ] Container scanning: [Tool/schedule]
- [ ] Infrastructure scanning: [Tool/schedule]
- [ ] Penetration testing: [Schedule]

**Incident Response**:
- [ ] Security incident playbook
- [ ] Security team contact
- [ ] Isolation procedures
- [ ] Reporting requirements

---

## 5. Cost Management

### Cost Optimization

**Resource Management**:
- [ ] Right-size resources
- [ ] Use reserved instances where appropriate
- [ ] Auto-scaling configured
- [ ] Idle resource cleanup

**Cost Monitoring**:
- [ ] Cost allocation tags
- [ ] Budget alerts
- [ ] Regular cost reviews
- [ ] Cost optimization recommendations

**Cost Reporting**:
- [ ] Monthly cost reports
- [ ] Cost per team/service
- [ ] Cost trends analysis
- [ ] Budget planning

---

## 6. Disaster Recovery

### Backup & Recovery

**Backup Strategy**:
- [ ] Database backups: [Schedule]
- [ ] Configuration backups: [Schedule]
- [ ] Code backups: [Version control]
- [ ] Backup verification: [Schedule]

**Disaster Recovery**:
- [ ] Recovery Time Objective (RTO): [Target]
- [ ] Recovery Point Objective (RPO): [Target]
- [ ] Failover procedures: [Documented]
- [ ] Recovery testing: [Schedule]

---

## 7. Capacity Planning

### Scaling Strategy

**Auto-Scaling**:
- [ ] Horizontal scaling: [Configuration]
- [ ] Vertical scaling: [Configuration]
- [ ] Scaling policies: [Defined]
- [ ] Scaling metrics: [Monitored]

**Capacity Planning**:
- [ ] Resource growth projections
- [ ] Peak usage analysis
- [ ] Capacity reviews: [Schedule]
- [ ] Scaling recommendations

---

## 8. Documentation Standards

### Documentation Requirements

**Required Documentation**:
- [ ] Architecture diagrams
- [ ] Runbooks for common tasks
- [ ] Deployment procedures
- [ ] Troubleshooting guides
- [ ] API documentation

**Documentation Maintenance**:
- [ ] Update after changes
- [ ] Review quarterly
- [ ] Keep versioned
- [ ] Make accessible

---

## 9. Operational Excellence

### Best Practices

**Reliability**:
- [ ] Service Level Objectives (SLOs): [Defined]
- [ ] Error budgets: [Configured]
- [ ] Reliability reviews: [Schedule]

**Change Management**:
- [ ] Change approval process
- [ ] Change windows
- [ ] Rollback procedures
- [ ] Change documentation

**Incident Management**:
- [ ] Incident response procedures
- [ ] Post-incident reviews
- [ ] Action item tracking
- [ ] Continuous improvement

---

## 10. Team Collaboration

### DevOps Culture

**Cross-Functional Collaboration**:
- [ ] Regular sync meetings
- [ ] Shared on-call rotation
- [ ] Knowledge sharing sessions
- [ ] Blameless postmortems

**Continuous Learning**:
- [ ] Tool training
- [ ] Best practice sharing
- [ ] Conference attendance
- [ ] Internal tech talks

---

## Success Metrics

**DevOps Metrics**:
- Deployment frequency
- Lead time for changes
- Mean time to recovery (MTTR)
- Change failure rate

**Goals**:
- [ ] Increase deployment frequency
- [ ] Reduce lead time
- [ ] Improve reliability
- [ ] Reduce change failure rate`,
  },
];

async function createPrompts() {
  console.log('🚀 Creating Incident Management and DevOps Playbook Prompts\n');
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

