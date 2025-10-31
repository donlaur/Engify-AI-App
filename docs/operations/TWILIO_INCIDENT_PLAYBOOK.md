<!--
AI Summary: Incident response playbook for Twilio MFA/SMS failures.
Part of Day 5 Phase 11.
-->

# Twilio Incident Playbook

## Incident Types

### 1. MFA Codes Not Delivering

**Symptoms:**
- Users report not receiving verification codes
- Webhook logs show delivery failures
- `/api/auth/mfa/send-code` returns success but no SMS received

**Diagnosis:**
```bash
# Check Twilio service status
curl https://status.twilio.com/api/v2/status.json

# Check recent MFA sends in audit logs
tail -100 logs/audit-$(date +%Y-%m-%d).log | grep MFA_CODE_SENT

# Check webhook signature failures
tail -100 logs/audit-$(date +%Y-%m-%d).log | grep TWILIO_WEBHOOK_SIGNATURE_FAILED
```

**Resolution:**
1. Verify Twilio credentials are correct:
   ```bash
   # Check env vars (don't print values!)
   printenv | grep TWILIO_ | cut -d'=' -f1
   ```

2. Check Twilio account status and balance

3. Verify phone number format (E.164):
   ```typescript
   import { validateE164 } from '@/lib/messaging/twilio';
   console.log(validateE164('+1234567890')); // Should be true
   ```

4. Check rate limiting:
   ```typescript
   // Look for 429 responses in logs
   grep "Rate limit exceeded" logs/app-$(date +%Y-%m-%d).log
   ```

**Escalation:**
- If Twilio service degraded: Use fallback email MFA
- If credentials invalid: Rotate via AWS Secrets Manager
- If widespread: Notify users via status page

---

### 2. Webhook Signature Verification Failures

**Symptoms:**
- `/api/auth/mfa/webhook` returns 401
- Audit log shows `TWILIO_WEBHOOK_SIGNATURE_FAILED`

**Diagnosis:**
```bash
# Check webhook configuration
echo "Webhook URL should be: https://$(printenv NEXT_PUBLIC_APP_URL)/api/auth/mfa/webhook"

# Verify auth token matches
# (Don't print the actual token!)
```

**Resolution:**
1. Regenerate webhook signature in Twilio console
2. Update `TWILIO_AUTH_TOKEN` in AWS Secrets Manager
3. Restart app to pick up new token
4. Test webhook with Twilio's webhook test tool

**Prevention:**
- Document webhook URL in Twilio console
- Set up monitoring alerts for signature failures > 5% of requests

---

### 3. Rate Limiting Blocking Legitimate Users

**Symptoms:**
- Users report "Rate limit exceeded" errors
- Spike in 429 responses
- `/api/auth/mfa/send-code` blocks valid requests

**Diagnosis:**
```bash
# Count rate limit hits
grep "Rate limit exceeded" logs/app-$(date +%Y-%m-%d).log | wc -l

# Check which users are affected
grep "Rate limit exceeded" logs/audit-$(date +%Y-%m-%d).log | jq '.userId' | sort | uniq -c
```

**Resolution:**
1. Temporary: Increase rate limits in `/api/auth/mfa/send-code/route.ts`
   ```typescript
   // From: { windowMs: 60_000, max: 3 }
   // To:   { windowMs: 60_000, max: 5 }
   ```

2. Long-term: Migrate rate limiting to Redis for distributed state
3. Add per-user override capability for VIP users

**Prevention:**
- Monitor 429 response rate in observability dashboard
- Set alert if 429 rate > 1% of requests

---

### 4. Replay Attacks Detected

**Symptoms:**
- Audit log shows `Message already processed` warnings
- Same `MessageSid` appearing multiple times

**Diagnosis:**
```bash
# Check for duplicate MessageSids
grep "MessageSid=" logs/audit-$(date +%Y-%m-%d).log | sort | uniq -d
```

**Resolution:**
- This is EXPECTED behavior (replay protection working)
- Investigate if rate is unusually high (> 5% of webhooks)
- May indicate:
  - Twilio retrying due to 5xx responses
  - Malicious replay attempt
  - Network issues causing duplicate deliveries

**Action:**
- If rate is normal (< 1%): No action needed
- If rate is high: Check application logs for 5xx errors in webhook handler
- If suspicious pattern: Block source IP temporarily

---

## Monitoring & Alerts

### Key Metrics to Track

1. **MFA Code Delivery Rate**
   - Target: > 99% success
   - Alert if < 95%

2. **Webhook Signature Verification Rate**
   - Target: > 99.5% valid
   - Alert if < 98%

3. **Rate Limit Hit Rate**
   - Target: < 1% of requests
   - Alert if > 5%

4. **Replay Detection Rate**
   - Normal: < 1% of webhooks
   - Alert if > 5%

### Dashboard Queries

```typescript
// Get MFA delivery stats
const stats = await db.collection('audit_logs').aggregate([
  { $match: { action: { $in: ['MFA_CODE_SENT', 'MFA_VERIFICATION_FAILED'] } } },
  { $group: {
      _id: '$action',
      count: { $sum: 1 }
    }
  }
]).toArray();

// Get webhook failure rate
const webhookStats = await db.collection('audit_logs').aggregate([
  {
    $match: {
      action: { $in: ['TWILIO_WEBHOOK_RECEIVED', 'TWILIO_WEBHOOK_SIGNATURE_FAILED'] }
    }
  },
  { $group: { _id: '$action', count: { $sum: 1 } } }
]).toArray();
```

---

## Runbook: Complete Twilio Failure

**If Twilio is completely unavailable:**

1. **Immediate**: Disable MFA requirement temporarily
   ```bash
   # Set in Vercel environment
   ADMIN_MFA_REQUIRED=false
   ```

2. **Fallback**: Switch to email-based MFA codes
   - Use SendGrid to send verification codes
   - Update MFA service to send via email

3. **Communication**:
   - Post to status page
   - Email affected users
   - Slack notification to #incidents

4. **Recovery**:
   - Monitor Twilio status page
   - Once resolved, re-enable MFA
   - Verify with test user before announcing

---

## Related Documentation

- [Twilio MFA Production Setup](../messaging/TWILIO_MFA_PROD.md)
- [Security Architecture](../security/SECURITY_GUIDE.md)
- [Audit Logging](../architecture/SECURITY_ARCHITECTURE_REVIEW.md)

