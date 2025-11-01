# Vercel Deployment Guide

**Quick deployment to production**

---

## Step 1: Import to Vercel

1. Go to https://vercel.com/new
2. Import Git Repository
3. Select: Your GitHub repository
4. Framework: **Next.js** (auto-detected)
5. Root Directory: `./`
6. Build Command: `npm run build`
7. Output Directory: `.next`

---

## Step 2: Environment Variables

**Add these in Vercel dashboard:**

```bash
# Required
MONGODB_URI=mongodb+srv://your-connection-string
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://engify.ai
OPENAI_API_KEY=sk-your-key
GOOGLE_AI_API_KEY=your-key

# Optional
NEXT_PUBLIC_APP_NAME=Engify.ai
NEXT_PUBLIC_APP_URL=https://engify.ai
NODE_ENV=production
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

---

## Step 3: Deploy

1. Click **Deploy**
2. Wait 2-3 minutes
3. Get deployment URL: `engify-ai-app.vercel.app`

---

## Step 4: Add Custom Domain

1. Vercel → Project → Settings → Domains
2. Add domain: `engify.ai`
3. Add domain: `www.engify.ai`
4. Vercel will show DNS records needed

---

## Step 5: Update GoDaddy DNS

**Add these A records:**

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 600

Type: A
Name: www
Value: 76.76.21.21
TTL: 600
```

**Wait 5-10 minutes for DNS propagation**

---

## Step 6: Verify

- [ ] https://engify.ai loads
- [ ] https://www.engify.ai loads
- [ ] SSL certificate active (🔒)
- [ ] All pages work
- [ ] No console errors

---

## Troubleshooting

**Build fails:**

- Check environment variables
- Verify MongoDB connection string
- Check build logs in Vercel

**Domain not working:**

- Wait for DNS propagation (up to 24 hours)
- Verify A records in GoDaddy
- Check Vercel domain settings

**SSL not working:**

- Vercel auto-provisions SSL
- Wait 5-10 minutes after DNS propagates
- Force HTTPS in Vercel settings

---

**Ready to deploy!**
