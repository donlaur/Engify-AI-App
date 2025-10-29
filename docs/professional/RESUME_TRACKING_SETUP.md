# Resume Tracking Setup - A/B Testing Resume Versions

**Purpose**: Track which resume version leads to which company for job applications

**Strategy**: Use URL parameters to track resume versions sent to different companies

---

## 🎯 How It Works

When someone visits from your resume, they'll land on a URL with tracking parameters. The Request Access form captures this data and stores it for analysis.

### **URL Format for Resume Links**

```
https://engify.ai/signup?ref=COMPANY_NAME&version=v2&source=resume
```

**Parameters**:

- `ref` = Company name or identifier
- `version` = Resume version (v1, v2, v3, etc.)
- `source` = Where they came from (resume, linkedin, etc.)
- `utm_*` = Standard UTM parameters for deeper tracking

---

## 📋 Implementation

### **Step 1: Update Resume Links**

For each resume version, use different URLs:

**Resume Version 1**:

```
https://engify.ai/signup?ref=Google&version=v1&source=resume
https://engify.ai/signup?ref=Meta&version=v1&source=resume
https://engify.ai/signup?ref=Stripe&version=v1&source=resume
```

**Resume Version 2**:

```
https://engify.ai/signup?ref=Google&version=v2&source=resume
https://engify.ai/signup?ref=Meta&version=v2&source=resume
https://engify.ai/signup?ref=Stripe&version=v2&source=resume
```

### **Step 2: Add Links to Resume**

In your resume, add a section like:

```markdown
## Portfolio

**Engify.ai** - AI Engineering Platform

- Live Demo: https://engify.ai
- Request Beta Access: [Personalized link per company]
```

Or make the entire portfolio section clickable with the tracking URL.

### **Step 3: Track in Database**

All requests are stored in `access_requests` collection with:

```javascript
{
  name: "Hiring Manager Name",
  email: "hiring@company.com",
  company: "Google",
  role: "director",
  ref: "Google",           // From URL param
  version: "v2",          // Resume version
  source: "resume",       // Source type
  requestedAt: ISODate,
  status: "pending"
}
```

---

## 📊 Analyzing Results

### **Query by Resume Version**

```javascript
// MongoDB query
db.access_requests.aggregate([
  { $match: { version: 'v1' } },
  { $group: { _id: '$ref', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);

// Results show which companies visited from v1 resume
```

### **Compare Versions**

```javascript
// Compare v1 vs v2 for same company
db.access_requests.aggregate([
  { $match: { ref: 'Google' } },
  {
    $group: {
      _id: '$version',
      count: { $sum: 1 },
      companies: { $addToSet: '$company' },
    },
  },
]);
```

### **Track Conversion**

```javascript
// See which version got more requests
db.access_requests.aggregate([
  {
    $group: {
      _id: { version: '$version', status: '$status' },
      count: { $sum: 1 },
    },
  },
]);
```

---

## 🔍 What Gets Tracked

### **Automatically Captured**

- **URL Parameters**: `ref`, `version`, `source`, `utm_*`
- **IP Address**: From request headers
- **User Agent**: Browser/device info
- **Timestamp**: When request was made
- **Company**: If they fill it in
- **Role**: If they select it

### **Data Collection**

The form collects:

- Name (required)
- Email (required)
- Company (optional - but hiring managers often fill this!)
- Role (optional dropdown)
- Use Case (optional text area)

---

## 💡 Pro Tips

### **1. Short, Clean URLs**

Use URL shorteners with tracking:

```
bit.ly/engify-google-v2
tinyurl.com/engify-meta-v1
```

### **2. QR Codes**

Add QR codes to print resumes:

```
QR Code → engify.ai/signup?ref=CompanyName&version=v2&source=resume-qr
```

### **3. LinkedIn Profile**

Add tracking to LinkedIn:

```
engify.ai/signup?ref=LinkedIn&version=v2&source=linkedin-profile
```

### **4. Email Signatures**

Different signatures for different campaigns:

```
engify.ai/signup?ref=Email&version=v2&source=email-signature
```

---

## 🎯 What This Tells You

1. **Which Resume Works Better**
   - v1 vs v2 conversion rates
   - Which version gets more interest

2. **Which Companies Are Interested**
   - Companies that requested access
   - Roles of people requesting access

3. **Timing**
   - When they requested access
   - Response time patterns

4. **Source Analysis**
   - Resume vs LinkedIn vs Email
   - Which channel works best

---

## 📧 Admin Notifications

You'll receive an email for each access request with:

```
Subject: New Beta Access Request - John Doe from Google

Body:
Name: John Doe
Email: john@google.com
Company: Google
Role: Director of Engineering
Use Case: Looking to improve team's AI capabilities

Tracking:
Company/Ref: Google
Resume Version: v2
Source: resume
```

**This lets you:**

- Know immediately when someone from a company requests access
- See which resume version they saw
- Personalize your response

---

## 🔒 Privacy Note

This tracking is:

- ✅ **Transparent**: URL parameters are visible (not hidden)
- ✅ **Optional**: Data collection is clear (name/email required, rest optional)
- ✅ **Legitimate**: Business intelligence for job applications
- ✅ **GDPR Friendly**: Optional fields, clear purpose

---

## 🚀 Next Steps

1. **Set Environment Variable**: `NEXT_PUBLIC_ALLOW_SIGNUP=false`
2. **Deploy**: Push changes to Vercel
3. **Update Resumes**: Add tracking URLs to each resume version
4. **Monitor**: Check `access_requests` collection regularly
5. **Respond**: Quickly approve access for hiring managers

---

## 📊 Example Queries

### **Most Popular Companies**

```javascript
db.access_requests.aggregate([
  { $match: { status: 'pending' } },
  { $group: { _id: '$ref', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 },
]);
```

### **Version Comparison**

```javascript
db.access_requests.aggregate([
  {
    $group: {
      _id: '$version',
      total: { $sum: 1 },
      companies: { $addToSet: '$ref' },
      roles: { $addToSet: '$role' },
    },
  },
]);
```

---

**Result**: You'll know exactly which resume version went to which company and who showed interest! 🎯
