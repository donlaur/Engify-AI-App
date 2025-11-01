# Fix: Reset Password via AWS Console

## ✅ IMMEDIATE FIX: Use AWS Console

Since AWS CLI requires permissions you don't have, use the AWS Console:

### Step 1: Reset Password via Console

1. **AWS Console** → Cognito → User Pools → [Your User Pool]
2. **User management** → **Users**
3. **Click on your user** ([your-email@example.com])
4. **Click "Actions"** dropdown (top right)
5. **Select "Reset password"**
6. **Choose "Generate password"** (this generates a temporary password you can copy)
7. **Copy the generated password**
8. **Save**

### Step 2: Login & Change Password

1. Go to `https://engify.ai/login`
2. Email: [your-email@example.com]
3. Password: (paste the generated password from Step 1)
4. Cognito will require you to change it on first login
5. Set your new permanent password

### Alternative: If "Reset password" Doesn't Work

**Option A: Set Password Directly**

- Click "Actions" → **"Set password"** (if available)
- Enter your desired password
- Mark as **permanent** (not temporary)
- Save

**Option B: Delete & Recreate User**

- Delete the user
- Create new user with email
- Set password during creation
- Mark email as verified

## Why This Happened

- User was created without a password
- Email verification email didn't send (check Cognito email settings)
- "Force change password" status means Cognito expects password to be set

## After Fixing

✅ Password is set  
✅ User status: Enabled  
✅ Email verified: Yes  
✅ Ready to login!

---

**Try "Reset password" → "Generate password" first - that should work immediately!**
