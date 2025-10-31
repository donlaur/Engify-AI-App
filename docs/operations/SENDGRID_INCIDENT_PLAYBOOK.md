<!--
AI Summary: Incident response playbook for SendGrid email delivery failures.
Part of Day 5 Phase 11.
-->

# SendGrid Incident Playbook

## Incident Types

### 1. Emails Not Delivering

**Symptoms:**
- Users report not receiving emails (welcome, password reset, etc.)
- Webhook events show `bounce` or `dropped`
- `/api/email` returns success but emails don't arrive

**Diagnosis:**
```bash
# Check SendGrid service status
curl https://status.sendgrid.com/api/v2/status.json

# Check recent email events in audit logs
tail -100 logs/audit-$(date +%Y-%m-%d).log | grep sendgrid_event

# Check for bounces
tail -100 logs/audit-$(date +%Y-%m-%d).log | grep bounce
```

**Resolution:**
1. Verify SendGrid API key is valid:
   ```bash
   curl -H "Authorization: Bearer $SENDGRID_API_KEY" \
        https://api.sendgrid.com/v3/user/account
   ```

2. Check sender authentication:
   - Verify domain authentication in SendGrid console
   - Check SPF/DKIM records

3. Review bounce reasons in audit logs:
   - Hard bounces: Invalid email address
   - Soft bounces: Temporary failure (retry)
   - Blocks: Spam complaints

4. Check rate limits:
   ```bash
   # SendGrid free tier: 100 emails/day
   # Pro tier: Custom limits
   ```

**Escalation:**
- If SendGrid service degraded: Use backup email provider
- If domain reputation issue: Contact SendGrid support
- If widespread: Notify users via SMS or in-app notifications

---

### 2. Webhook Signature Verification Failures

**Symptoms:**
- `/api/email/webhook` returns 401
- Audit log shows `sendgrid_event_failed` with `invalid_signature`

**Diagnosis:**
```bash
# Check webhook public key configuration
printenv | grep SENDGRID_WEBHOOK_PUBLIC_KEY | cut -d'=' -f1

# Check recent webhook failures
tail -100 logs/audit-$(date +%Y-%m-%d).log | grep sendgrid_event_failed
```

**Resolution:**
1. Verify webhook public key in SendGrid Event Webhook settings
2. Update `SENDGRID_WEBHOOK_PUBLIC_KEY` in environment
3. Restart application
4. Test webhook delivery

**Prevention:**
- Document public key location in runbook
- Set up monitoring for signature failure rate > 1%

---

### 3. Template Rendering Errors

**Symptoms:**
- Emails sent but content is malformed
- Template variables not populating
- Users report broken email links

**Diagnosis:**
```typescript
// Check template configuration
import { getTemplateId, TemplateRegistry } from '@/lib/email/templates';

Object.entries(TemplateRegistry).forEach(([key, config]) => {
  console.log(key, getTemplateId(config.envKey));
});
```

**Resolution:**
1. Verify template IDs in `.env`:
   ```bash
   SENDGRID_WELCOME_TEMPLATE_ID=d-xxxxx
   SENDGRID_PASSWORD_RESET_TEMPLATE_ID=d-xxxxx
   ```

2. Test template with sample data:
   ```typescript
   import { SendGridTemplateBuilders } from '@/lib/email/templates';
   
   const template = SendGridTemplateBuilders.welcome({
     userName: 'Test User',
     userEmail: 'test@example.com',
     loginUrl: 'https://engify.ai/login',
     libraryUrl: 'https://engify.ai/library',
     workbenchUrl: 'https://engify.ai/workbench',
     supportUrl: 'https://engify.ai/contact',
   });
   ```

3. Check SendGrid template design in console
4. Verify all required merge variables are present

**Prevention:**
- Add template validation tests
- Version control template designs
- Document required merge variables

---

### 4. High Bounce Rate

**Symptoms:**
- Bounce rate > 5%
- Domain reputation declining
- Emails going to spam

**Diagnosis:**
```bash
# Check bounce events
grep "bounce" logs/audit-$(date +%Y-%m-%d).log | \
  jq -r '.details.reason' | sort | uniq -c
```

**Resolution:**
1. **Hard Bounces (Invalid Addresses):**
   - Implement email validation before sending
   - Remove invalid emails from send list
   - Add double opt-in for new signups

2. **Soft Bounces (Temporary):**
   - SendGrid will auto-retry
   - Monitor if pattern persists

3. **Spam Complaints:**
   - Review email content for spam triggers
   - Ensure unsubscribe link is prominent
   - Add email preference center

4. **Domain Reputation:**
   - Check domain reputation: https://sendgrid.com/docs/ui/account-and-settings/tracking/
   - Warm up new domains gradually
   - Limit sending volume if new domain

**Prevention:**
- Monitor bounce rate daily
- Alert if bounce rate > 3%
- Maintain clean email lists

---

## Monitoring & Alerts

### Key Metrics to Track

1. **Email Delivery Rate**
   - Target: > 95%
   - Alert if < 90%

2. **Bounce Rate**
   - Target: < 2%
   - Alert if > 5%

3. **Webhook Processing Success Rate**
   - Target: > 99%
   - Alert if < 95%

4. **Template Rendering Success Rate**
   - Target: 100%
   - Alert on any failure

### Dashboard Queries

```typescript
// Get email event summary
const summary = await db.collection('audit_logs').aggregate([
  {
    $match: {
      resource: 'sendgrid_webhook',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: '$details.event',
      count: { $sum: 1 }
    }
  }
]).toArray();

// Get SendGrid health status
const healthResponse = await fetch('/api/admin/settings');
const { messagingStatus } = await healthResponse.json();
console.log(messagingStatus.sendgrid);
```

---

## Runbook: Complete SendGrid Failure

**If SendGrid is completely unavailable:**

1. **Immediate**: Switch to backup email provider
   ```typescript
   // Implement backup provider in emailService.ts
   // Use AWS SES or Mailgun as fallback
   ```

2. **Disable email-dependent features temporarily**:
   - Password reset (direct support intervention)
   - Email verification (manual verification)
   - Transactional emails (queue for later)

3. **Communication**:
   - Post to status page
   - In-app notifications for affected features
   - Support team notification

4. **Recovery**:
   - Monitor SendGrid status
   - Once resolved, flush queued emails
   - Verify with test sends before full restore

---

## Escalation Contacts

- **SendGrid Support**: https://support.sendgrid.com
- **Account SLA**: Check SendGrid plan SLA terms
- **Internal**: DevOps team, Site Reliability lead

---

## Related Documentation

- [SendGrid Transactional Email Setup](../messaging/SENDGRID_TRANSACTIONAL_EMAIL.md)
- [Email Service Implementation](../../src/lib/services/emailService.ts)
- [Security Guide](../security/SECURITY_GUIDE.md)

