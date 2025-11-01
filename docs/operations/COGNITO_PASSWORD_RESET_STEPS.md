# Step-by-Step: Reset Cognito Password in AWS Console

## Exact Steps (Click-by-Click)

### Step 1: Open Your User Details Page

1. Go to **AWS Console** → **Cognito** → **User Pools**
2. Click on your user pool: **"User pool - dz9-no"**
3. Click **"User management"** in the left sidebar
4. Click **"Users"** (under User management)
5. **Click on your email** ([your-email@example.com]) - this opens the user details page

### Step 2: Reset Password via Actions Menu

**You're now on the user details page. Look for:**

1. **Top right corner** → Find the blue **"Actions"** button (has a dropdown arrow)
2. **Click "Actions"** → A dropdown menu appears
3. **Click "Reset password"** in the dropdown (3rd option)
4. A modal dialog appears with two options:
   - **"Send email"** - Sends reset code to email
   - **"Generate password"** - Creates a temporary password you can copy

### Step 3: Generate Password

1. **Click "Generate password"** (recommended - you'll see the password immediately)
2. **Copy the password** that appears
3. **Click "Save"** or "Confirm"

### Step 4: Login with Temporary Password

1. Go to `https://engify.ai/login`
2. Email: [your-email@example.com]
3. Password: (paste the temporary password from Step 3)
4. Click "Login"

### Step 5: Change Password (First Login)

Cognito will require you to change the password on first login:

1. After logging in, you'll see a **"Change password"** screen
2. Enter your **temporary password** (from Step 3)
3. Enter your **new permanent password** (twice)
4. Click **"Change password"**

---

## Alternative: Use "Force Change Password" Button

If you can't find "Reset password" in Actions:

1. On the user details page, look for **"Confirmation status"** section
2. You'll see a blue button: **"Force change password"**
3. **Click "Force change password"**
4. This will set the user to require password change on next login
5. But you still need a password to login first (use "Reset password" from Actions)

---

## Troubleshooting

### "Reset password" Option Not Visible?

- Make sure you're on the **user details page** (clicked on the user email)
- The "Actions" button is in the **top right** of the user details page
- Try refreshing the page

### "Generate password" Doesn't Show Password?

- The password should appear in the modal after clicking "Generate password"
- If not, try **"Send email"** instead and check your inbox

### Still Can't Login?

1. Check that your account status is **"Enabled"** (green checkmark)
2. Check that email is **"Verified"** (green badge)
3. Try logging in with the exact temporary password (no spaces)
4. Make sure you're using the correct email: [your-email@example.com]

### Need to Set Password Directly (Admin Only)

If you have admin permissions and want to set a password directly:

1. Click **"Actions"** → **"Set password"** (if available)
2. Enter your desired password
3. Check **"Mark as permanent"**
4. Click **"Save"**

---

## Quick Visual Guide

```
AWS Console
  └─ Cognito
      └─ User Pools
          └─ "User pool - dz9-no"
              └─ User management
                  └─ Users
                      └─ [Click: [your-email@example.com]]
                          └─ Actions (top right)
                              └─ Reset password
                                  └─ Generate password
                                      └─ Copy password
                                          └─ Login at engify.ai/login
```

---

**Most Common Issue:** Not clicking on the user email first. You must be on the **user details page** to see the "Actions" menu.
