# Set Password for Cognito User

## Quick Fix: Set Permanent Password

Since you forgot the password and didn't receive the email, you can set a permanent password directly in AWS Console:

### Option 1: Set Password in AWS Console (Easiest)

1. **AWS Console** → Cognito → User Pools → User pool - dz9-no
2. **User management** → **Users**
3. Click on your user (`donlaur@engify.ai`)
4. Click **"Actions"** → **"Set password"** (or look for password options)
5. **Set password:** Enter your desired password
6. **Mark as permanent:** ✅ (not temporary)
7. **Save**

### Option 2: Reset Password via AWS Console

1. **AWS Console** → Cognito → User Pools → User pool - dz9-no
2. **User management** → **Users**
3. Click on your user (`donlaur@engify.ai`)
4. Click **"Actions"** → **"Reset password"**
5. Choose **"Send email"** or **"Generate password"**
6. If email doesn't work, choose **"Generate password"** and copy it

### Option 3: Use AWS CLI (If Console Doesn't Work)

```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id us-east-1_tsIIjaxYi \
  --username donlaur@engify.ai \
  --password YOUR_NEW_PASSWORD \
  --permanent
```

## After Setting Password

1. ✅ Password is set
2. ✅ User status: Enabled
3. ✅ Email verified: Yes
4. ✅ Ready to login!

## Test Login

1. Go to `https://engify.ai/login`
2. Email: `donlaur@engify.ai`
3. Password: (the password you just set)
4. Should login successfully!

---

**Note:** The "Force change password" status means Cognito wants you to change your password on first login. If you set a permanent password, you can login directly without forcing a change.
