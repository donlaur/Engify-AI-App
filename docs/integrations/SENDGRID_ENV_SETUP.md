# SendGrid Environment Variables Setup

**Date**: October 29, 2025  
**Quick Reference**: Required environment variables for SendGrid integration

---

## 🔑 **Required Environment Variables**

### **Core SendGrid Configuration**

```bash
# SendGrid API Key (REQUIRED)
# Get from: SendGrid Dashboard → Settings → API Keys
# NOTE: Supports both SENDGRID_API_KEY and SENDGRID_API variable names
SENDGRID_API_KEY=SG.your_api_key_here
# OR
SENDGRID_API=SG.your_api_key_here

# From Email Address (Optional, defaults to noreply@engify.ai)
SENDGRID_FROM_EMAIL=noreply@engify.ai

# From Name (Optional)
SENDGRID_FROM_NAME=Engify AI

# Reply-To Email (Optional)
SENDGRID_REPLY_TO=donlaur@engify.ai
```

### **Dynamic Template IDs**

```bash
# Email Template IDs (Optional - uses HTML fallback if not set)
# Get from: SendGrid Dashboard → Email API → Dynamic Templates

SENDGRID_WELCOME_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxx
SENDGRID_PASSWORD_RESET_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxx
SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxx
SENDGRID_PROMPT_SHARED_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxx
SENDGRID_CONTACT_FORM_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxx
SENDGRID_API_KEY_ALERT_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxx
SENDGRID_WEEKLY_DIGEST_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxx
SENDGRID_AI_CONTENT_READY_TEMPLATE_ID=d-xxxxxxxxxxxxxxxxxxxxx
```

### **Webhook Configuration**

```bash
# Webhook Public Key (Optional - for signature verification)
# Get from: SendGrid Dashboard → Settings → API Keys → Webhook Verification
SENDGRID_WEBHOOK_PUBLIC_KEY=your_public_key_here
```

---

## ✅ **Quick Setup Steps**

### **1. Get SendGrid API Key**

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access** (more secure)
5. Select permissions:
   - ✅ **Mail Send**: Full Access
   - ✅ **Template Engine**: Full Access (if using templates)
   - ✅ **Suppressions**: Read Access
6. Copy the API key (starts with `SG.`)
7. **Save it immediately** - you can't view it again!

### **2. Create Email Templates (Optional)**

If you want to use dynamic templates:

1. Go to **Email API** → **Dynamic Templates**
2. Click **Create a Dynamic Template**
3. Add version and design your template
4. Use variables like `{{userName}}`, `{{resetUrl}}`, etc.
5. Copy the Template ID (starts with `d-`)
6. Add to environment variables

### **3. Set Up Webhooks**

**Event Webhooks** (for email analytics):

1. Go to **Settings** → **Mail Settings** → **Event Webhook**
2. Set webhook URL: `https://engify.ai/api/webhooks/sendgrid`
3. Select events to track: delivered, opened, clicked, bounced, etc.
4. Save settings

**Inbound Parse** (for processing incoming emails):

1. Go to **Settings** → **Mail Settings** → **Inbound Parse**
2. Add hostname and set webhook URL: `https://engify.ai/api/webhooks/sendgrid`
3. Configure routing rules if needed

---

## 🧪 **Testing Your Setup**

### **Test Email Service**

```typescript
import { sendWelcomeEmail } from '@/lib/services/emailService';

// Test welcome email
const result = await sendWelcomeEmail('your-email@example.com', 'Test User');
console.log(result); // { success: true, messageId: '...' }
```

### **Check Environment Variables**

```bash
# In your terminal
echo $SENDGRID_API_KEY  # Should show your key (starts with SG.)

# Or check in Node.js
console.log(process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');
```

---

## 🔍 **Troubleshooting**

### **"SendGrid API key not configured" Error**

**Problem**: `SENDGRID_API_KEY` is not set or empty

**Solution**:

1. Check `.env.local` file (for local dev)
2. Check Vercel Environment Variables (for production)
3. Make sure variable name is exactly `SENDGRID_API_KEY` (not `SENDGRID_API`)
4. Restart your dev server after adding env vars
5. Redeploy on Vercel after adding env vars

### **Templates Not Working**

**Problem**: Emails sent but templates not used

**Solution**:

1. Check template IDs are correct in env vars
2. Verify template IDs in SendGrid dashboard
3. Make sure template variables match (e.g., `{{userName}}` not `{{user_name}}`)
4. Test template in SendGrid dashboard first
5. Check logs for template errors

### **Webhooks Not Receiving Events**

**Problem**: Webhooks not firing or not processing

**Solution**:

1. Verify webhook URL is publicly accessible
2. Check webhook URL in SendGrid settings
3. Test webhook endpoint: `curl https://engify.ai/api/webhooks/sendgrid`
4. Check Vercel logs for webhook requests
5. Verify signature verification (if enabled)

---

## 📋 **Environment Variable Checklist**

- [ ] `SENDGRID_API_KEY` set (starts with `SG.`)
- [ ] `SENDGRID_FROM_EMAIL` set (verified sender domain)
- [ ] Template IDs set (if using templates)
- [ ] Webhook URL configured in SendGrid
- [ ] Webhook public key set (if using signature verification)
- [ ] Variables added to `.env.local` (local dev)
- [ ] Variables added to Vercel (production)

---

## 🔒 **Security Best Practices**

1. **Never commit API keys to git**
   - Keep in `.env.local` (already in `.gitignore`)
   - Add to Vercel Environment Variables (encrypted)

2. **Use restricted API keys**
   - Don't use full-access API keys
   - Only grant needed permissions

3. **Rotate keys regularly**
   - Change API keys every 90 days
   - Update in both `.env.local` and Vercel

4. **Verify webhook signatures**
   - Set `SENDGRID_WEBHOOK_PUBLIC_KEY`
   - Code automatically verifies signatures

---

## 💡 **Common Variable Names**

**Correct**:

```bash
SENDGRID_API_KEY=SG.xxxxx
```

**Wrong** (won't work):

```bash
SENDGRID_API=SG.xxxxx           # Wrong name
SENDGRID_API_KEY=                # Empty
sendgrid_api_key=SG.xxxxx        # Wrong case
```

The code looks for exactly: `process.env.SENDGRID_API_KEY`
