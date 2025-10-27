# Site Test Checklist

**Quick smoke test before going live**

## ✅ Public Pages (No Auth Required)

- [ ] **Homepage** (`/`) - Loads, stats show, CTA buttons work
- [ ] **For Directors** (`/for-directors`) - Role selector works, prompts link
- [ ] **For Engineers** (`/for-engineers`) - Loads, challenges show
- [ ] **Built in Public** (`/built-in-public`) - Journey shows, GitHub link works
- [ ] **Library** (`/library`) - Prompts load, search works, can view prompts
- [ ] **Patterns** (`/patterns`) - 15 patterns show, descriptions load
- [ ] **Learn** (`/learn`) - Learning paths show, steps visible
- [ ] **Pricing** (`/pricing`) - Plans show, CTA buttons work
- [ ] **About** (`/about`) - Page loads
- [ ] **Contact** (`/contact`) - Page loads
- [ ] **Blog** (`/blog`) - Page loads

## 🔐 Auth Pages

- [ ] **Login** (`/login`) - Form shows, can attempt login
- [ ] **Signup** (`/signup`) - Form shows, validation works
- [ ] **Onboarding** (`/onboarding`) - 3 steps show (after signup)

## 🔒 Protected Pages (Require Login)

- [ ] **Dashboard** (`/dashboard`) - Stats show, activity feed works
- [ ] **Workbench** (`/workbench`) - AI provider selector, can enter prompt
- [ ] **Settings** (`/settings`) - Profile form, preferences load

## 🤖 API Endpoints

- [ ] **Health Check** (`/api/health`) - Returns 200
- [ ] **AI Execute** (`/api/ai/execute`) - Requires auth, executes prompt
- [ ] **Prompt History** (`/api/prompts/history`) - Saves/retrieves history
- [ ] **Favorites** (`/api/prompts/favorites`) - Add/remove favorites
- [ ] **Analytics** (`/api/analytics/track`) - Tracks events

## 🎨 UI/UX

- [ ] **Mobile responsive** - Test on phone/tablet
- [ ] **Dark gradient hero** - Animations work
- [ ] **Navigation** - All links work
- [ ] **Buttons** - All CTAs are visible and clickable
- [ ] **Forms** - Validation shows errors
- [ ] **Loading states** - Spinners show during async operations

## 🔧 Technical

- [ ] **Build succeeds** - `npm run build` ✅
- [ ] **No console errors** - Check browser console
- [ ] **Images load** - All images/icons show
- [ ] **Fonts load** - Typography looks correct
- [ ] **Tailwind classes** - Styling works

## 🚨 Critical Paths

### 1. New User Flow
1. Visit homepage
2. Click "Get Started"
3. Sign up with email/password
4. Complete onboarding (role, experience, AI level)
5. Land on dashboard
6. See 0 prompts, 0 favorites, 0 streak (honest state)

### 2. Browse & Execute Flow
1. Go to Library
2. Browse prompts
3. Click a prompt
4. Copy to clipboard OR go to workbench
5. Execute in workbench (requires login)
6. See response
7. Check history saved

### 3. Role-Based Flow
1. Go to For Directors
2. Click role selector
3. Switch to Engineers
4. See different content
5. Click "View Prompt"
6. Land on specific prompt page

## 🐛 Known Issues

- GitHub API routes (fixed - commit 400)
- ~~Button contrast on dark background~~ (fixed)
- ~~Jellyfish references~~ (removed)

## 📝 Quick Test Script

```bash
# 1. Build
npm run build

# 2. Start dev server
npm run dev

# 3. Open browser
open http://localhost:3005

# 4. Test critical paths above
```

## ✅ Sign-off

- [ ] All public pages load
- [ ] Auth flow works
- [ ] AI execution works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Ready for deployment

**Tested by:** _____________  
**Date:** _____________  
**Status:** ⏳ Pending
