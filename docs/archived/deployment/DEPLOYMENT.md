# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- Vercel account (recommended) or other hosting
- AI API keys (OpenAI, Anthropic, Google, Groq)

## Environment Variables

Create `.env.local` with:

```bash
# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/engify

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
GROQ_API_KEY=gsk_...

# Auth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Optional
SENTRY_DSN=...
```

## Vercel Deployment (Recommended)

### 1. Connect Repository

```bash
# Install Vercel CLI
pnpm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### 2. Configure Project

- Framework: Next.js
- Build Command: `pnpm build`
- Output Directory: `.next`
- Install Command: `pnpm install`

### 3. Environment Variables

Add all variables from `.env.local` in Vercel dashboard

### 4. Deploy

```bash
# Production
vercel --prod
```

## Manual Deployment

### Build

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Start
pnpm start
```

### PM2 (Process Manager)

```bash
# Install PM2
npm i -g pm2

# Start
pm2 start pnpm --name engify -- start

# Save
pm2 save

# Startup
pm2 startup
```

## Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

```bash
# Build
docker build -t engify-ai .

# Run
docker run -p 3000:3000 --env-file .env.local engify-ai
```

## Database Setup

### MongoDB Atlas

1. Create cluster (free tier)
2. Create database user
3. Whitelist IP (0.0.0.0/0 for development)
4. Get connection string
5. Add to MONGODB_URI

### Seed Data

```bash
# Run seed script
pnpm seed
```

## Domain Setup

### DNS Configuration

```
A Record: @ -> Vercel IP
CNAME: www -> your-app.vercel.app
```

### SSL

- Automatic with Vercel
- Let's Encrypt for manual deployment

## Monitoring

### Sentry (Errors)

1. Create Sentry project
2. Add DSN to environment
3. Errors auto-reported

### Vercel Analytics

- Automatic with Vercel deployment
- View in dashboard

## Performance

### Optimization Checklist

- [ ] Images optimized (Next.js Image)
- [ ] Code splitting enabled
- [ ] Caching configured
- [ ] CDN enabled
- [ ] Compression enabled

### Lighthouse Score Target

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

## Security

### Checklist

- [ ] Environment variables secure
- [ ] API keys not in code
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection

## Backup

### MongoDB

```bash
# Backup
mongodump --uri="$MONGODB_URI"

# Restore
mongorestore --uri="$MONGODB_URI" dump/
```

### Automated Backups

- MongoDB Atlas: Automatic daily backups
- Vercel: Git-based rollback

## Rollback

### Vercel

```bash
# List deployments
vercel ls

# Rollback
vercel rollback [deployment-url]
```

### Manual

```bash
# Revert to previous commit
git revert HEAD
git push

# Redeploy
vercel --prod
```

## Troubleshooting

### Build Fails

- Check Node version (18+)
- Clear cache: `pnpm clean`
- Delete node_modules and reinstall

### Database Connection

- Check MongoDB URI
- Verify IP whitelist
- Test connection locally

### API Errors

- Verify API keys
- Check rate limits
- Review error logs

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@engify.ai

---

**Last Updated**: October 2025
**Version**: 1.0
