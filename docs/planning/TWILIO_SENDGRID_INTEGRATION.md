# Twilio + SendGrid Integration Plan

**Date**: October 28, 2025  
**Goal**: MFA via SMS/Email + Automated AI Content Pipeline

---

## 🎯 Dual Purpose Integration

### 1. **Twilio for MFA** (SMS-based TOTP)
- SMS verification codes
- Phone number verification
- Backup MFA method (if authenticator app fails)

### 2. **SendGrid for Email** (Email-based MFA + Content Pipeline)
- Email verification codes
- Transactional emails (welcome, password reset)
- **CONTENT PIPELINE**: Receive AI industry emails → Process → Auto-publish

---

## 📧 SendGrid Content Pipeline Architecture

### The Genius Strategy:
**Use SendGrid Inbound Parse to turn email subscriptions into automated content**

### How It Works:

```
AI Industry Emails (100+/day)
    ↓
donlaur@engify.ai (SendGrid Inbound Parse)
    ↓
Webhook → /api/webhooks/email-ingest
    ↓
AI Processing (Extract, Summarize, Categorize)
    ↓
Auto-publish to Engify.ai content library
```

### Email Sources to Subscribe:
- AI newsletters (The Batch, Import AI, etc.)
- Company blogs (OpenAI, Anthropic, Google AI)
- Research papers (arXiv alerts)
- Industry news (TechCrunch AI, VentureBeat AI)
- Developer content (Hacker News digests)

---

## 🔧 Implementation Plan

### Phase 1: Twilio Setup (15 commits)

#### 1. Install Dependencies
```bash
pnpm add twilio @twilio/conversations
```

#### 2. Environment Variables
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid
```

#### 3. Twilio Service
**File**: `src/lib/services/TwilioService.ts`

```typescript
import twilio from 'twilio';

export class TwilioService {
  private client: twilio.Twilio;
  private verifyServiceSid: string;
  
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
    this.verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;
  }
  
  async sendVerificationCode(phoneNumber: string): Promise<void> {
    await this.client.verify.v2
      .services(this.verifyServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms',
      });
  }
  
  async verifyCode(phoneNumber: string, code: string): Promise<boolean> {
    const verification = await this.client.verify.v2
      .services(this.verifyServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code,
      });
    
    return verification.status === 'approved';
  }
}
```

#### 4. MFA API Routes
**File**: `src/app/api/auth/mfa/sms/send/route.ts`
**File**: `src/app/api/auth/mfa/sms/verify/route.ts`

---

### Phase 2: SendGrid Setup (20 commits)

#### 1. Install Dependencies
```bash
pnpm add @sendgrid/mail @sendgrid/inbound-mail-parser
```

#### 2. Environment Variables
```env
SENDGRID_API_KEY=your_api_key
SENDGRID_FROM_EMAIL=noreply@engify.ai
SENDGRID_INBOUND_DOMAIN=inbound.engify.ai
```

#### 3. SendGrid Service
**File**: `src/lib/services/SendGridService.ts`

```typescript
import sgMail from '@sendgrid/mail';

export class SendGridService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }
  
  async sendVerificationEmail(to: string, code: string): Promise<void> {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: 'Engify.ai - Verify Your Email',
      html: `
        <h1>Verify Your Email</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code expires in 10 minutes.</p>
      `,
    });
  }
  
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      templateId: 'd-welcome-template-id',
      dynamicTemplateData: {
        name,
      },
    });
  }
  
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: 'Reset Your Password',
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 1 hour.</p>
      `,
    });
  }
}
```

---

### Phase 3: AI Content Pipeline (15 commits)

#### 1. SendGrid Inbound Parse Setup

**In SendGrid Dashboard:**
1. Go to Settings → Inbound Parse
2. Add domain: `inbound.engify.ai`
3. Set webhook URL: `https://engify.ai/api/webhooks/email-ingest`
4. Configure MX records in DNS

**DNS Records:**
```
MX  inbound.engify.ai  mx.sendgrid.net  10
```

#### 2. Email Ingest Webhook
**File**: `src/app/api/webhooks/email-ingest/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { InboundMailParser } from '@sendgrid/inbound-mail-parser';
import { AIContentProcessor } from '@/lib/services/AIContentProcessor';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const parser = new InboundMailParser();
    const email = parser.parse(formData);
    
    // Extract email data
    const emailData = {
      from: email.from,
      subject: email.subject,
      text: email.text,
      html: email.html,
      attachments: email.attachments,
      receivedAt: new Date(),
    };
    
    // Process with AI
    const processor = new AIContentProcessor();
    await processor.processEmail(emailData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email ingest error:', error);
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    );
  }
}
```

#### 3. AI Content Processor
**File**: `src/lib/services/AIContentProcessor.ts`

```typescript
import { OpenAI } from 'openai';
import { getMongoDb } from '@/lib/db/mongodb';

interface EmailData {
  from: string;
  subject: string;
  text: string;
  html: string;
  attachments: any[];
  receivedAt: Date;
}

interface ProcessedContent {
  title: string;
  summary: string;
  category: string;
  tags: string[];
  keyInsights: string[];
  sourceUrl?: string;
  publishReady: boolean;
}

export class AIContentProcessor {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async processEmail(email: EmailData): Promise<void> {
    // Step 1: Extract content
    const content = this.extractContent(email);
    
    // Step 2: AI Analysis
    const processed = await this.analyzeContent(content);
    
    // Step 3: Quality check
    if (processed.publishReady) {
      await this.saveToDatabase(processed, email);
    } else {
      await this.saveForReview(processed, email);
    }
  }
  
  private extractContent(email: EmailData): string {
    // Extract main content from email
    // Remove headers, footers, unsubscribe links
    // Clean HTML, extract text
    return email.text || email.html;
  }
  
  private async analyzeContent(content: string): Promise<ProcessedContent> {
    const prompt = `
You are an AI content curator for Engify.ai, a platform teaching AI engineering.

Analyze this email content and extract:
1. A clear, SEO-friendly title
2. A 2-3 sentence summary
3. Category (Tutorial, News, Research, Tool, Best Practice)
4. Relevant tags (max 5)
5. 3-5 key insights or takeaways
6. Whether this is high-quality, relevant content worth publishing

Content:
${content}

Respond in JSON format.
`;
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });
    
    return JSON.parse(response.choices[0].message.content!);
  }
  
  private async saveToDatabase(
    processed: ProcessedContent,
    email: EmailData
  ): Promise<void> {
    const db = await getMongoDb();
    
    await db.collection('content').insertOne({
      ...processed,
      source: {
        type: 'email',
        from: email.from,
        subject: email.subject,
        receivedAt: email.receivedAt,
      },
      status: 'published',
      publishedAt: new Date(),
      createdBy: 'ai-pipeline',
    });
  }
  
  private async saveForReview(
    processed: ProcessedContent,
    email: EmailData
  ): Promise<void> {
    const db = await getMongoDb();
    
    await db.collection('content_review_queue').insertOne({
      ...processed,
      source: {
        type: 'email',
        from: email.from,
        subject: email.subject,
        receivedAt: email.receivedAt,
      },
      status: 'pending_review',
      createdAt: new Date(),
    });
  }
}
```

---

## 📊 Email Subscriptions Strategy

### High-Value AI Newsletters:
1. **The Batch** (Andrew Ng) - Weekly AI news
2. **Import AI** (Jack Clark) - AI research summaries
3. **AI Weekly** - Curated AI content
4. **Last Week in AI** - Research highlights
5. **TLDR AI** - Daily AI news

### Company Blogs:
1. OpenAI Blog
2. Anthropic Blog
3. Google AI Blog
4. Meta AI Blog
5. Microsoft Research Blog

### Research Sources:
1. arXiv daily alerts (cs.AI, cs.LG)
2. Papers with Code
3. Hugging Face Blog

### Developer Content:
1. Hacker News AI digest
2. Reddit r/MachineLearning digest
3. Dev.to AI tag

**Goal**: 100+ emails/day → 5-10 high-quality articles/day auto-published

---

## 🔒 Security Considerations

### Email Webhook Security:
1. **Verify SendGrid signature** on webhook
2. **Rate limiting** on ingest endpoint
3. **Content validation** before AI processing
4. **Spam filtering** - reject low-quality sources
5. **Duplicate detection** - don't republish same content

### MFA Security:
1. **Rate limit** verification attempts
2. **Expire codes** after 10 minutes
3. **Lock account** after 5 failed attempts
4. **Audit log** all MFA events

---

## 📝 Commit Strategy

### Twilio Integration (15 commits):
1. `feat: add Twilio SDK and configuration`
2. `feat: create TwilioService for SMS verification`
3. `feat: add SMS MFA send endpoint`
4. `feat: add SMS MFA verify endpoint`
5. `feat: add phone number validation`
6. `feat: add MFA UI components`
7. `test: add Twilio service tests`
8. `docs: add Twilio setup guide`
... (15 total)

### SendGrid Integration (20 commits):
1. `feat: add SendGrid SDK and configuration`
2. `feat: create SendGridService`
3. `feat: add email verification endpoint`
4. `feat: add welcome email template`
5. `feat: add password reset email`
6. `feat: add transactional email templates`
7. `test: add SendGrid service tests`
... (20 total)

### AI Content Pipeline (15 commits):
1. `feat: add SendGrid Inbound Parse webhook`
2. `feat: create AIContentProcessor service`
3. `feat: add email content extraction`
4. `feat: add AI content analysis`
5. `feat: add content quality scoring`
6. `feat: add auto-publish logic`
7. `feat: add content review queue`
8. `feat: add duplicate detection`
9. `feat: add spam filtering`
10. `feat: add content moderation`
11. `feat: add admin review dashboard`
12. `test: add content processor tests`
13. `docs: add content pipeline guide`
14. `chore: configure DNS for inbound email`
15. `feat: subscribe to 50+ AI newsletters`

**Total**: 50 commits for Twilio/SendGrid/AI Pipeline

---

## 🎯 Success Metrics

### MFA Adoption:
- 80%+ users enable MFA within 30 days
- <1% MFA failure rate
- <5 second average verification time

### Content Pipeline:
- 100+ emails ingested per day
- 5-10 articles auto-published per day
- 90%+ content quality score
- <5% manual review needed

---

**This turns your email inbox into an automated content factory! 🚀**
