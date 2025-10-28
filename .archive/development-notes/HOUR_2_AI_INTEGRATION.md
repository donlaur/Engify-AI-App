# ⚡ Hour 2: Real AI Integration (30 minutes)

**Goal**: Working AI prompt execution with OpenAI API  
**Status**: Starting now 🔥

---

## 🎯 What We're Building

- Real OpenAI API integration
- Working prompt execution in workbench
- Response streaming
- Token tracking
- Error handling

---

## 🔑 Step 1: Get OpenAI API Key (5 min)

1. Go to: https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Name it: "Engify.ai Dev"
5. Copy the key (starts with `sk-`)

**Add to `.env.local`**:

```bash
OPENAI_API_KEY="sk-your-key-here"
```

**Add to Vercel**:

- Go to environment variables
- Add: `OPENAI_API_KEY` = `sk-your-key-here`

---

## 💳 OpenAI Free Tier

- $5 free credit for new accounts
- Enough for ~100,000 tokens
- Perfect for demo
- Can add $5-10 for safety

---

## 🚀 What's Next

Once you have the API key:

1. I'll create the AI execution endpoint
2. Wire up the workbench
3. Test real prompt execution
4. Add token tracking

---

**Get your OpenAI API key and tell me when ready!** 🔥
