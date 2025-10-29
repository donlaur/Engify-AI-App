# Quick Start: Resume Tracking Setup

**Time**: 5 minutes  
**Purpose**: Enable tracking to see which resume version gets responses from which companies

---

## ✅ Step 1: Set Environment Variable

In Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_ALLOW_SIGNUP=false
```

This enables the Request Access form instead of open signup.

---

## ✅ Step 2: Add Tracking URLs to Your Resume

For each company, use a unique URL:

**Example Resume Version 1**:

```
Portfolio: engify.ai/signup?ref=Google&version=v1&source=resume
Portfolio: engify.ai/signup?ref=Meta&version=v1&source=resume
Portfolio: engify.ai/signup?ref=Stripe&version=v1&source=resume
```

**Example Resume Version 2**:

```
Portfolio: engify.ai/signup?ref=Google&version=v2&source=resume
Portfolio: engify.ai/signup?ref=Meta&version=v2&source=resume
Portfolio: engify.ai/signup?ref=Stripe&version=v2&source=resume
```

---

## ✅ Step 3: Track Results

When someone requests access, you'll get an email with:

```
Subject: New Beta Access Request - John Doe from Google

Body includes:
- Company: Google
- Role: Director of Engineering
- Resume Version: v2
- Source: resume
```

And it's stored in MongoDB `access_requests` collection for analysis.

---

## 📊 Example Queries

### See all requests from a company:

```javascript
db.access_requests.find({ ref: 'Google' });
```

### Compare v1 vs v2:

```javascript
db.access_requests.aggregate([
  { $group: { _id: '$version', count: { $sum: 1 } } },
]);
```

### Which companies showed interest:

```javascript
db.access_requests.distinct('ref');
```

---

## 🎯 That's It!

The system is now:

- ✅ Gating signups behind Request Access
- ✅ Tracking resume versions and companies
- ✅ Sending you email notifications
- ✅ Storing data for analysis

**Next**: Add unique tracking URLs to each resume version you send out!
