# MongoDB Setup Guide

**Date**: 2025-10-27
**Goal**: Connect Engify.ai to MongoDB Atlas
**Time**: 15 minutes

---

## 🎯 **Quick Start**

### Option 1: MongoDB Atlas (Recommended - Free)

1. **Create Account**
   - Go to https://cloud.mongodb.com
   - Sign up (free)
   - Verify email

2. **Create Cluster**
   - Click "Build a Database"
   - Choose "M0 Free" tier
   - Select region (closest to you)
   - Name: `engify-cluster`
   - Click "Create"

3. **Create Database User**
   - Security → Database Access
   - Add New Database User
   - Username: `engify-admin`
   - Password: Generate secure password
   - Database User Privileges: Read and write to any database
   - Add User

4. **Whitelist IP**
   - Security → Network Access
   - Add IP Address
   - Allow Access from Anywhere: `0.0.0.0/0` (for development)
   - Or add your specific IP
   - Confirm

5. **Get Connection String**
   - Database → Connect
   - Choose "Connect your application"
   - Driver: Node.js
   - Version: 5.5 or later
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `engify`

6. **Add to .env.local**
   ```bash
   MONGODB_URI=mongodb+srv://engify-admin:YOUR_PASSWORD@engify-cluster.xxxxx.mongodb.net/engify?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB

```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Connection string
MONGODB_URI=mongodb://localhost:27017/engify
```

---

## 🔧 **Test Connection**

### 1. Add to .env.local
```bash
# Create .env.local if it doesn't exist
cat > .env.local << EOF
MONGODB_URI=mongodb+srv://...your-connection-string...
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3005
EOF
```

### 2. Test Health Check
```bash
# Start dev server
npm run dev

# Test in another terminal
curl http://localhost:3005/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-10-27T..."
}
```

---

## 📊 **Database Structure**

### Collections

#### 1. **users**
```typescript
{
  _id: ObjectId,
  email: string,
  name: string,
  passwordHash: string,
  role: 'user' | 'admin',
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **prompts**
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  content: string,
  category: string,
  tags: string[],
  author: ObjectId, // ref: users
  views: number,
  favorites: number,
  rating: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **favorites**
```typescript
{
  _id: ObjectId,
  userId: ObjectId, // ref: users
  promptId: ObjectId, // ref: prompts
  createdAt: Date
}
```

#### 4. **ratings**
```typescript
{
  _id: ObjectId,
  userId: ObjectId, // ref: users
  promptId: ObjectId, // ref: prompts
  rating: number, // 1-5
  createdAt: Date
}
```

#### 5. **audit_logs**
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  action: string,
  resource: string,
  details: object,
  ipAddress: string,
  userAgent: string,
  createdAt: Date
}
```

---

## 🌱 **Seed Data**

### Seed Prompts to Database
```bash
# Run seed script (when created)
npm run seed

# Or manually via MongoDB Compass
# 1. Download MongoDB Compass
# 2. Connect with your connection string
# 3. Create database: engify
# 4. Import JSON files from src/data/
```

---

## 🔒 **Security Best Practices**

### 1. Environment Variables
- ✅ Never commit `.env.local`
- ✅ Use strong passwords
- ✅ Rotate credentials regularly

### 2. Network Security
- ✅ Whitelist specific IPs in production
- ✅ Use VPC peering for AWS/Vercel
- ✅ Enable encryption at rest

### 3. Database Security
- ✅ Least privilege access
- ✅ Separate users for read/write
- ✅ Enable audit logging
- ✅ Regular backups

---

## 📈 **Monitoring**

### MongoDB Atlas Dashboard
- **Metrics**: CPU, Memory, Connections
- **Slow Queries**: Identify bottlenecks
- **Alerts**: Set up email alerts
- **Backups**: Automatic daily backups

### Performance Tips
1. Create indexes on frequently queried fields
2. Use projection to limit returned fields
3. Implement pagination
4. Cache frequently accessed data
5. Monitor connection pool

---

## 🚀 **Deployment**

### Vercel Environment Variables
```bash
# Add to Vercel project settings
vercel env add MONGODB_URI production
# Paste your connection string
```

### Connection Pooling
```typescript
// Already configured in src/lib/db/mongodb.ts
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
};
```

---

## 🔧 **Troubleshooting**

### Connection Failed
- ✅ Check connection string format
- ✅ Verify password (no special chars in URL)
- ✅ Confirm IP whitelist
- ✅ Check network connectivity

### Slow Queries
- ✅ Add indexes
- ✅ Use explain() to analyze
- ✅ Limit result size
- ✅ Use aggregation pipeline

### Connection Pool Exhausted
- ✅ Increase maxPoolSize
- ✅ Check for connection leaks
- ✅ Implement connection timeout
- ✅ Use connection pooling

---

## 📚 **Resources**

- **MongoDB Atlas**: https://cloud.mongodb.com
- **MongoDB Docs**: https://docs.mongodb.com
- **Mongoose Docs**: https://mongoosejs.com
- **Connection String**: https://docs.mongodb.com/manual/reference/connection-string/

---

## ✅ **Checklist**

- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 Free)
- [ ] Database user created
- [ ] IP whitelisted
- [ ] Connection string obtained
- [ ] Added to .env.local
- [ ] Health check passes
- [ ] Seed data loaded
- [ ] Indexes created
- [ ] Monitoring enabled

---

**Status**: Ready to connect!
**Next**: Add MONGODB_URI to .env.local and test
