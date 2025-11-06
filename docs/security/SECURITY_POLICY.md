# Security Policy

**Version:** 1.0  
**Effective Date:** November 6, 2025  
**Last Reviewed:** November 6, 2025  
**Next Review:** February 6, 2026  
**Owner:** Security Team  
**Status:** Active

---

## 1. Access Control Policy

### 1.1 User Authentication

**Requirements:**
- All users must authenticate using NextAuth.js (email/password or OAuth)
- Passwords must meet minimum complexity requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Passwords are hashed using bcrypt before storage
- Passwords are never stored in plain text
- Session tokens expire after 30 days of inactivity

**Implementation:**
- Authentication handled by NextAuth.js v5
- Password hashing: bcrypt with salt rounds
- Session management: JWT tokens stored in secure HTTP-only cookies
- Rate limiting: Maximum 5 login attempts per email per 15 minutes

**Multi-Factor Authentication (MFA):**
- **Required for:** `super_admin`, `org_admin`, `org_manager` roles
- **Optional for:** All other roles
- **Implementation:** Twilio SMS-based MFA
- **Enforcement:** Users with admin roles cannot access admin features without MFA enabled

---

### 1.2 Role-Based Access Control (RBAC)

**Roles Defined:**
1. **super_admin** - Full system access (all permissions)
2. **org_admin** - Organization administrator (org-level permissions)
3. **org_manager** - Team manager (team-level permissions)
4. **org_member** - Organization member (member-level permissions)
5. **user** - Basic user (limited permissions)
6. **free** - Free tier user (read-only access)
7. **pro** - Pro tier user (enhanced permissions)
8. **enterprise** - Enterprise tier user (organization features)

**Permissions:**
- 13 granular permissions covering:
  - User management (`users:read`, `users:write`, `users:delete`, `users:invite`, `users:manage_roles`)
  - Organization management (`org:read`, `org:write`, `org:delete`, `org:manage_members`, `org:manage_settings`)
  - Prompt management (`prompts:read`, `prompts:write`, `prompts:delete`, `prompts:share`, `prompts:featured`)
  - Workbench access (`workbench:basic`, `workbench:advanced`, `workbench:ai_execution`, `workbench:team_sharing`)
  - Analytics (`analytics:read`, `analytics:export`, `analytics:team`, `analytics:org`)
  - Billing (`billing:read`, `billing:write`, `billing:manage`)
  - System administration (`system:admin`, `system:logs`, `system:maintenance`, `system:backup`)

**Access Control Enforcement:**
- All API routes protected with RBAC middleware (`withRBAC()`)
- Route-level permission checks before processing requests
- Organization-level data isolation (`organizationId` scoping)
- Permission checks logged in audit trail

**Access Review Process:**
- **Quarterly:** Review all user roles and permissions
- **On Role Change:** Immediate audit log entry
- **On Termination:** Immediate access revocation
- **Documentation:** All access changes logged with reason and approver

---

### 1.3 API Access Control

**Public Endpoints:**
- `/api/stats` - Platform statistics (read-only)
- `/api/prompts` - Prompt library (read-only)
- `/api/patterns` - Pattern library (read-only)
- `/api/health` - Health check endpoint

**Protected Endpoints:**
- All `/api/v2/*` routes require authentication
- All `/api/admin/*` routes require `super_admin` or `org_admin` role
- All `/api/workbench/*` routes require authenticated user with appropriate permissions

**Rate Limiting:**
- **Public APIs:** 30 requests per minute per IP
- **Authenticated APIs:** 100 requests per minute per user
- **Admin APIs:** 200 requests per minute per admin user
- **AI Execution:** Per-tool budget limits ($0.75-$2.50 per tool)

**API Key Management:**
- User API keys encrypted before storage
- API keys can be rotated by users
- API key usage tracked and logged
- Revoked API keys immediately invalidated

---

### 1.4 Session Management

**Session Security:**
- Sessions expire after 30 days of inactivity
- Sessions invalidated on password change
- Sessions invalidated on role change (downgrade)
- Concurrent session limits: 5 active sessions per user

**Session Storage:**
- JWT tokens stored in HTTP-only cookies
- Cookies use `Secure` flag (HTTPS only)
- Cookies use `SameSite=Strict` to prevent CSRF
- Session data stored server-side (MongoDB)

---

## 2. Data Classification Policy

### 2.1 Data Classification Levels

**Public Data:**
- Prompt library content (public prompts)
- Pattern library content
- Learning resources (public articles)
- Platform statistics (aggregated, anonymized)

**Internal Data:**
- User preferences and settings
- Prompt usage history (user-specific)
- Workbench session data
- Analytics data (aggregated by organization)

**Confidential Data:**
- User passwords (hashed)
- API keys (encrypted)
- User email addresses
- Organization data
- Billing information
- Audit logs

**Restricted Data:**
- PII (Personally Identifiable Information)
- Financial data (credit cards, billing)
- Security credentials (API keys, tokens)
- Admin access logs

---

### 2.2 Data Protection Requirements

**Encryption:**
- **In Transit:** TLS 1.3 for all connections
- **At Rest:** MongoDB Atlas encryption (AES-256)
- **Application-Level:** Sensitive fields encrypted before storage (API keys, tokens)
- **Key Management:** Encryption keys stored in environment variables (future: AWS Secrets Manager)

**Data Retention:**
- **User Data:** Retained while account is active, deleted 30 days after account deletion
- **Audit Logs:** Retained for 7 years (SOC 2 requirement)
- **Session Data:** Retained for 30 days, then purged
- **Analytics Data:** Retained for 2 years, then anonymized

**Data Deletion:**
- Users can request data deletion via account settings
- Data deletion processed within 30 days
- Audit logs retained per compliance requirements
- Backup data purged according to retention policy

**Data Minimization:**
- Only collect data necessary for service delivery
- No third-party data sharing
- No data selling
- No tracking or advertising

---

### 2.3 PII (Personally Identifiable Information) Handling

**PII Redaction:**
- PII redaction implemented for GDPR/SOC 2 compliance
- Email addresses redacted in logs (except admin audit logs)
- User IDs anonymized in analytics
- PII removed from error messages

**PII Access:**
- Only authorized admin users can access PII
- PII access logged in audit trail
- PII access requires justification
- PII access reviewed quarterly

---

## 3. Incident Response Policy

### 3.1 Incident Classification

**Critical (P1):**
- Data breach (unauthorized access to confidential data)
- System outage (complete service unavailability)
- Security breach (unauthorized admin access)
- **Response Time:** Immediate (within 1 hour)
- **Escalation:** CTO, Legal, affected customers

**High (P2):**
- Partial service outage (degraded performance)
- Authentication system failure
- Database connection issues
- **Response Time:** Within 4 hours
- **Escalation:** Engineering Lead

**Medium (P3):**
- API rate limiting issues
- Non-critical feature failures
- Performance degradation
- **Response Time:** Within 24 hours
- **Escalation:** On-call engineer

**Low (P4):**
- UI bugs
- Non-critical feature requests
- Documentation issues
- **Response Time:** Within 7 days
- **Escalation:** Product team

---

### 3.2 Incident Response Procedures

**Detection:**
- Automated monitoring (Sentry, health checks)
- User-reported incidents (support tickets)
- Security scanning (automated vulnerability detection)
- Audit log review (suspicious activity detection)

**Containment:**
1. **Immediate Actions:**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious IP addresses
   - Enable additional logging

2. **Short-Term Actions:**
   - Patch vulnerabilities
   - Update security controls
   - Notify affected users
   - Document incident details

**Eradication:**
- Remove root cause
- Patch vulnerabilities
- Update security controls
- Verify fix effectiveness

**Recovery:**
- Restore services from backups if needed
- Verify system integrity
- Monitor for recurrence
- Update documentation

**Post-Incident Review:**
- **Timeline:** Within 7 days of incident resolution
- **Participants:** Incident responders, engineering team
- **Deliverables:**
  - Incident report (what happened, why, impact)
  - Root cause analysis
  - Action items (prevent recurrence)
  - Process improvements

---

### 3.3 Communication Plan

**Internal Communication:**
- **Critical:** Immediate notification to CTO and engineering team
- **High:** Notification within 1 hour to engineering team
- **Medium/Low:** Notification within 24 hours via incident tracking system

**Customer Communication:**
- **Critical:** Email notification within 24 hours to affected customers
- **High:** Status page update, email if customer-impacting
- **Medium/Low:** Status page update if customer-impacting

**Regulatory Communication:**
- **Data Breach:** Notification to relevant authorities within 72 hours (GDPR requirement)
- **SOC 2:** Incident logged in audit trail for SOC 2 review

**Status Page:**
- Public status page at `status.engify.ai`
- Real-time incident updates
- Historical incident reports

---

## 4. Change Management Policy

### 4.1 Code Review Requirements

**Mandatory Code Review:**
- All code changes require pull request review
- At least one approval required before merge
- Automated checks must pass (tests, linting, security scans)
- No direct commits to `main` branch

**Code Review Checklist:**
- [ ] Code follows TypeScript strict mode (no `any` types)
- [ ] Tests added/updated for new features
- [ ] Security considerations addressed (input validation, RBAC)
- [ ] Documentation updated if needed
- [ ] No hardcoded secrets or credentials
- [ ] Performance considerations addressed

**Pre-Commit Hooks:**
- TypeScript type checking
- ESLint (code quality)
- Prettier (code formatting)
- Security scanning (git-secrets, no hardcoded secrets)
- Schema validation (no data drift)

---

### 4.2 Deployment Procedures

**Deployment Environments:**
1. **Development** - Local development environment
2. **Staging** - Pre-production testing environment
3. **Production** - Live customer-facing environment

**Deployment Process:**
1. **Development:**
   - Feature branch created
   - Code written and tested locally
   - Pre-commit hooks pass

2. **Staging:**
   - Pull request created
   - Code review completed
   - Automated tests pass (CI/CD)
   - Manual testing completed
   - Merge to `main` branch

3. **Production:**
   - Automated deployment via Vercel
   - Health checks verify deployment success
   - Monitoring alerts configured
   - Rollback plan documented

**Deployment Approval:**
- **Standard Changes:** Automated deployment (no approval required)
- **High-Risk Changes:** Manual approval required (database migrations, security changes)
- **Emergency Changes:** Post-deployment approval (documented in incident response)

---

### 4.3 Rollback Procedures

**Automated Rollback:**
- Vercel automatically rolls back on deployment failure
- Health check failures trigger automatic rollback
- Database migration failures trigger automatic rollback

**Manual Rollback:**
1. Identify last known good deployment
2. Revert code changes (git revert)
3. Redeploy previous version
4. Verify system health
5. Document rollback reason

**Rollback Testing:**
- Rollback procedures tested quarterly
- Rollback time target: < 5 minutes
- Rollback documented in runbook

---

### 4.4 Testing Requirements

**Test Coverage:**
- **Current:** 18% coverage (growing incrementally)
- **Target:** 70% coverage for critical paths
- **Critical Paths:** Authentication, authorization, data access, payment processing

**Test Types:**
- **Unit Tests:** Vitest for component and utility functions
- **Integration Tests:** API route testing with authentication
- **End-to-End Tests:** Playwright for critical user workflows
- **Security Tests:** RBAC, rate limiting, input validation
- **Performance Tests:** Load testing for critical endpoints

**Test Execution:**
- All tests run on pull request (CI/CD)
- Tests must pass before merge
- Flaky test detection (runs suite 3-5x)
- Test failures block deployment

---

## 5. Vendor Management Policy

### 5.1 Vendor Assessment Process

**Vendor Categories:**
1. **Critical Vendors** - Core infrastructure (database, hosting, authentication)
2. **Important Vendors** - Key services (AI providers, email, SMS)
3. **Standard Vendors** - Supporting services (monitoring, analytics)

**Assessment Criteria:**
- **Security:** SOC 2 Type II certification, security practices
- **Reliability:** Uptime SLA, incident response
- **Compliance:** GDPR compliance, data residency
- **Support:** Response time, escalation procedures
- **Cost:** Pricing transparency, contract terms

**Assessment Process:**
1. **Initial Assessment:**
   - Complete vendor security questionnaire
   - Review vendor SOC 2 reports (if available)
   - Check vendor security practices
   - Review vendor incident history

2. **Ongoing Monitoring:**
   - Quarterly vendor reviews
   - Annual security reassessment
   - Incident tracking (vendor-related incidents)
   - Contract renewal review

---

### 5.2 Current Vendors

**Critical Vendors:**

1. **MongoDB Atlas** (Database)
   - **SOC 2:** ✅ Type II certified
   - **Data Residency:** Configurable (US, EU, APAC)
   - **Backup:** Automated daily backups
   - **Encryption:** AES-256 at rest, TLS in transit
   - **Assessment:** ✅ Approved

2. **Vercel** (Hosting)
   - **SOC 2:** ✅ Type II certified
   - **Uptime SLA:** 99.99%
   - **Security:** DDoS protection, WAF, SSL/TLS
   - **Assessment:** ✅ Approved

3. **NextAuth.js** (Authentication)
   - **Type:** Open-source library
   - **Security:** OAuth 2.0, JWT, secure session management
   - **Assessment:** ✅ Approved (open-source, audited)

**Important Vendors:**

4. **OpenAI** (AI Provider)
   - **SOC 2:** ✅ Type II certified
   - **Data Processing:** Data not used for training (API usage)
   - **Security:** API key management, rate limiting
   - **Assessment:** ✅ Approved

5. **Anthropic** (AI Provider)
   - **SOC 2:** ✅ Type II certified
   - **Data Processing:** Data not used for training (API usage)
   - **Security:** API key management, rate limiting
   - **Assessment:** ✅ Approved

6. **Google AI** (AI Provider)
   - **SOC 2:** ✅ Type II certified
   - **Data Processing:** Data not used for training (API usage)
   - **Security:** API key management, rate limiting
   - **Assessment:** ✅ Approved

7. **SendGrid** (Email)
   - **SOC 2:** ✅ Type II certified
   - **Security:** ECDSA webhook verification, bounce tracking
   - **Assessment:** ✅ Approved

8. **Twilio** (SMS/MFA)
   - **SOC 2:** ✅ Type II certified
   - **Security:** E.164 validation, rate limiting, webhook signature verification
   - **Assessment:** ✅ Approved

**Standard Vendors:**

9. **Sentry** (Error Tracking)
   - **SOC 2:** ✅ Type II certified
   - **Data:** Error logs, performance data
   - **Assessment:** ✅ Approved

10. **Upstash** (Redis)
    - **SOC 2:** ✅ Type II certified
    - **Data:** Cache data, session data
    - **Assessment:** ✅ Approved

---

### 5.3 Vendor Security Requirements

**Required Certifications:**
- SOC 2 Type II (preferred) or SOC 2 Type I (minimum)
- GDPR compliance (for EU data processing)
- ISO 27001 (preferred for enterprise vendors)

**Required Security Practices:**
- Encryption at rest and in transit
- Regular security audits
- Incident response procedures
- Data breach notification (within 72 hours)

**Contract Requirements:**
- Data Processing Agreement (DPA) for GDPR compliance
- Security addendum (SOC 2 requirements)
- Incident notification clause (24-hour notification)
- Data retention and deletion clauses

---

### 5.4 Vendor Monitoring

**Quarterly Reviews:**
- Review vendor security incidents
- Review vendor uptime/SLA performance
- Review vendor contract compliance
- Update vendor risk assessment

**Annual Reassessment:**
- Complete vendor security questionnaire
- Review vendor SOC 2 reports
- Assess vendor security posture
- Update vendor approval status

**Incident Tracking:**
- Log all vendor-related incidents
- Track vendor response time
- Document vendor incident resolution
- Review vendor incidents quarterly

---

## 6. Business Continuity Policy

### 6.1 Backup Procedures

**Database Backups:**
- **Frequency:** Automated daily backups (MongoDB Atlas)
- **Retention:** 30 days of daily backups
- **Storage:** Encrypted backups stored in MongoDB Atlas
- **Testing:** Monthly restore testing

**Code Backups:**
- **Frequency:** Continuous (Git repository)
- **Storage:** GitHub (primary), local backups (secondary)
- **Retention:** Full Git history retained
- **Testing:** Continuous (Git pull verification)

**Configuration Backups:**
- **Frequency:** Weekly
- **Storage:** Encrypted environment variables in Vercel
- **Retention:** 90 days
- **Testing:** Quarterly restore testing

**Backup Verification:**
- **Monthly:** Test database restore from backup
- **Quarterly:** Test full system restore
- **Documentation:** All backup/restore tests documented

---

### 6.2 Disaster Recovery Plan

**Recovery Time Objectives (RTO):**
- **Critical Systems:** 4 hours
- **Important Systems:** 8 hours
- **Standard Systems:** 24 hours

**Recovery Point Objectives (RPO):**
- **Critical Data:** 1 hour (maximum data loss)
- **Important Data:** 4 hours
- **Standard Data:** 24 hours

**Disaster Scenarios:**

1. **Database Failure:**
   - **Detection:** Health check failures, error monitoring
   - **Recovery:** Restore from MongoDB Atlas backup
   - **RTO:** 2 hours
   - **RPO:** 1 hour (last backup)

2. **Hosting Failure:**
   - **Detection:** Vercel status page, health checks
   - **Recovery:** Vercel automatic failover, manual DNS switch if needed
   - **RTO:** 15 minutes (automatic)
   - **RPO:** 0 minutes (no data loss)

3. **Application Failure:**
   - **Detection:** Error monitoring, health checks
   - **Recovery:** Rollback to previous deployment
   - **RTO:** 5 minutes (automated rollback)
   - **RPO:** 0 minutes (no data loss)

4. **Security Breach:**
   - **Detection:** Security monitoring, audit logs
   - **Recovery:** Revoke credentials, patch vulnerabilities, restore from backup if needed
   - **RTO:** 4 hours
   - **RPO:** 1 hour (restore to pre-breach state)

---

### 6.3 Business Continuity Testing

**Testing Schedule:**
- **Monthly:** Database restore testing
- **Quarterly:** Full disaster recovery test
- **Annually:** Business continuity plan review

**Test Scenarios:**
1. Database restore from backup
2. Application rollback to previous version
3. DNS failover (if applicable)
4. Security incident response

**Test Documentation:**
- All tests documented with results
- Failures tracked and remediated
- Process improvements identified
- Plan updated based on test results

---

### 6.4 High Availability

**Current Architecture:**
- **Stateless Application:** Horizontal scaling ready
- **Database:** MongoDB Atlas (multi-region replication available)
- **Hosting:** Vercel (global CDN, automatic failover)
- **Monitoring:** Health checks, error tracking, uptime monitoring

**Availability Targets:**
- **Target Uptime:** 99.9% (43.2 minutes downtime/month)
- **Current Uptime:** Monitored via UptimeRobot
- **SLA Commitment:** Defined per customer contract

**Scaling Strategy:**
- **Horizontal Scaling:** Stateless architecture enables horizontal scaling
- **Database Scaling:** MongoDB Atlas auto-scaling
- **CDN:** Vercel global CDN for static assets
- **Caching:** Redis (Upstash) for performance optimization

---

## 7. Policy Compliance

### 7.1 Policy Enforcement

**Automated Enforcement:**
- Pre-commit hooks (code quality, security)
- CI/CD pipeline (tests, security scans)
- Runtime checks (RBAC, rate limiting, input validation)

**Manual Enforcement:**
- Code reviews (security considerations)
- Quarterly access reviews
- Annual security audits
- Incident response exercises

---

### 7.2 Policy Violations

**Violation Types:**
1. **Critical:** Security breach, data exposure, unauthorized access
2. **High:** Policy non-compliance, security misconfiguration
3. **Medium:** Process violations, documentation gaps
4. **Low:** Minor policy deviations

**Violation Response:**
- **Critical:** Immediate incident response, access revocation, investigation
- **High:** Immediate remediation, policy review, process improvement
- **Medium:** Remediation within 7 days, process improvement
- **Low:** Remediation within 30 days, documentation update

---

### 7.3 Policy Review

**Review Schedule:**
- **Quarterly:** Policy effectiveness review
- **Annually:** Full policy review and update
- **On Incident:** Policy review after security incidents
- **On Change:** Policy review when systems change

**Review Process:**
1. Assess policy effectiveness
2. Identify gaps or improvements
3. Update policy document
4. Communicate changes to team
5. Update training materials

---

## 8. Appendices

### Appendix A: Security Contacts

**Security Team:**
- **Primary Contact:** security@engify.ai
- **Incident Response:** incidents@engify.ai
- **Security Questions:** security@engify.ai

**External Contacts:**
- **MongoDB Support:** support@mongodb.com
- **Vercel Support:** support@vercel.com
- **Sentry Support:** support@sentry.io

---

### Appendix B: Related Documents

- [Security Standards](./SECURITY_STANDARDS.md)
- [Incident Response Plan](./INCIDENT_RESPONSE_PLAN.md)
- [Vendor Management Program](./VENDOR_MANAGEMENT.md)
- [Business Continuity Plan](../operations/BUSINESS_CONTINUITY_PLAN.md)
- [Architecture Decision Records](../development/ADR/)

---

### Appendix C: Compliance References

**SOC 2 Trust Service Criteria:**
- CC1: Control Environment
- CC2: Communication & Information
- CC3: Risk Assessment
- CC4: Monitoring Activities
- CC5: Control Activities
- CC6: Logical & Physical Access Controls
- CC7: System Operations
- CC8: Change Management

**GDPR Requirements:**
- Article 32: Security of processing
- Article 33: Breach notification
- Article 35: Data protection impact assessment

---

**Document Control:**
- **Version:** 1.0
- **Created:** November 6, 2025
- **Last Updated:** November 6, 2025
- **Next Review:** February 6, 2026
- **Owner:** Security Team
- **Approved By:** [Pending]

---

**This policy is a living document and will be updated as security requirements evolve.**

