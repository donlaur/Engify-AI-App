# OpsHub Login Troubleshooting

## Issue: "Failed login" when accessing `/opshub`

**Important:** MongoDB Atlas login ≠ NextAuth session. You need to be logged into the **Engify.ai app**, not just MongoDB Atlas.

## Quick Fix Steps

### 1. Check Your NextAuth Session

1. Go to `/login`
2. Log in with your credentials
3. Verify you're logged in (check for session cookie)
4. Try accessing `/opshub` again

### 2. Verify Your Role in MongoDB

Ensure your MongoDB user has an admin role (`admin`, `super_admin`, or `org_admin`).

**Check your app session:**

- Open browser DevTools → Application → Cookies
- Look for `next-auth.session-token` or `__Secure-next-auth.session-token`
- If missing, you're not logged into the app

### 3. Common Issues

**Issue A: No Session Cookie**

- **Symptom:** Redirected to `/login` immediately
- **Fix:** Log in via `/login` page first

**Issue B: Wrong Role in Session**

- **Symptom:** Redirected to `/` (home page)
- **Fix:** Your MongoDB role may be correct, but NextAuth session might not have it
- **Check:** Log out and log back in to refresh session

**Issue C: MFA Required**

- **Symptom:** Redirected to `/login?error=MFA_REQUIRED`
- **Fix:** Check if `isAdminMFAEnforced` is enabled in environment
- **Check:** `src/lib/env.ts` → `isAdminMFAEnforced`

### 4. Debug Steps

**Check your current session:**

1. Go to `/api/auth/session`
2. Should show your user object with role:

```json
{
  "user": {
    "id": "...",
    "email": "...",
    "role": "super_admin",
    "name": "..."
  }
}
```

**If session shows wrong role:**

- Log out (`/logout`)
- Log back in (`/login`)
- Session should refresh with correct role from MongoDB

**Check middleware protection:**

- `/opshub` routes are protected by middleware
- If you have no session cookie, middleware will redirect to `/login`

### 5. Force Session Refresh

If role is correct in MongoDB but wrong in session:

```javascript
// In browser console (after logging in)
fetch('/api/auth/session')
  .then((r) => r.json())
  .then(console.log);
```

Should show the correct admin role. If not, log out and back in.

## Verification

After logging in, you should be able to:

- ✅ Access `/opshub` without redirect
- ✅ See "Admin Dashboard" title
- ✅ See user count, content count, audit logs

## Still Not Working?

**Check these files:**

1. `src/app/opshub/page.tsx` - Server-side auth check
2. `src/lib/auth/config.ts` - Auth configuration
3. `src/middleware.ts` - Route protection
4. `.env.local` - `NEXTAUTH_SECRET` must be set

**Common fixes:**

- Clear browser cookies and log in again
- Restart Next.js dev server (if local)
- Check environment variables are loaded

---

**Summary:** Log into `/login` first, then access `/opshub`. MongoDB Atlas login is separate from app authentication.
