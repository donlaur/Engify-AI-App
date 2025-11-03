# Quick AWS Setup for Multi-Agent Lambda Invocation

**Problem:** 500 error when calling `/api/agents/scrum-meeting` in production  
**Cause:** Missing AWS credentials in Vercel to invoke Lambda function  
**Fix:** Set up IAM user and configure Vercel environment variables

---

## Quick Setup (5 minutes)

### Step 1: Get Your AWS Account ID

```bash
aws sts get-caller-identity --query Account --output text
```

Save this - you'll need it for the IAM policy.

---

### Step 2: Create IAM User (AWS Console)

1. **Go to AWS IAM Console:**
   - https://console.aws.amazon.com/iam/

2. **Create User:**
   - Users → Add users
   - Username: `engify-vercel-lambda-invoker`
   - Access type: ✅ **Programmatic access** (Access key)
   - Click Next

3. **Attach Permissions:**
   - Click "Create policy" (opens new tab/window)
   - **In Policy Editor tab:**
     - Service: Select **Lambda**
     - Actions: Check **InvokeFunction**
     - Resources: Select **Specific**
     - Click "Add ARN"
     - Enter ARN: `arn:aws:lambda:us-east-2:<YOUR_ACCOUNT_ID>:function:engify-ai-integration-workbench`
       - Replace `<YOUR_ACCOUNT_ID>` with your actual account ID from Step 1
     - Click "Add"
     - Click "Next"
     - Name: `Engify-Vercel-Lambda-Invoke`
     - Description: `Allows Vercel to invoke engify-ai-integration-workbench Lambda function`
     - Click "Create policy"
   - **Back in Users tab:**
     - Refresh policies list
     - Search for `Engify-Vercel-Lambda-Invoke`
     - Check the box
     - Click "Next"

4. **Create User:**
   - Click "Create user"
   - **IMPORTANT:** Copy the **Access Key ID** and **Secret Access Key** immediately
   - You won't be able to see the secret key again!

---

### Step 3: Set Vercel Environment Variables

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project (`engify-ai-app`)

2. **Open Environment Variables:**
   - Settings → Environment Variables

3. **Add Variables:**
   - Click "Add New"
   - Add each variable:
   
   | Name | Value | Environments |
   |------|-------|--------------|
   | `AWS_ACCESS_KEY_ID` | (from Step 2) | Production, Preview, Development |
   | `AWS_SECRET_ACCESS_KEY` | (from Step 2) | Production, Preview, Development |
   | `AWS_REGION` | `us-east-2` | Production, Preview, Development |

4. **Save:**
   - Click "Save" for each variable
   - Vercel will automatically trigger a redeploy

---

### Step 4: Verify Setup

1. **Wait for redeploy** (2-5 minutes)

2. **Test the endpoint:**
   ```bash
   curl -X POST https://engify.ai/api/agents/scrum-meeting \
     -H "Content-Type: application/json" \
     -d '{"situation":"test"}'
   ```

3. **Check CloudWatch Logs:**
   ```bash
   aws logs tail /aws/lambda/engify-ai-integration-workbench --follow --region us-east-2
   ```

---

## Troubleshooting

### Error: "The security token included in the request is invalid"
**Cause:** AWS credentials incorrect or not set  
**Fix:** Double-check Vercel environment variables are correct

### Error: "AccessDeniedException"
**Cause:** IAM user doesn't have permission  
**Fix:** Verify policy is attached to user

### Error: "ResourceNotFoundException"
**Cause:** Lambda function name incorrect  
**Fix:** Verify function name: `engify-ai-integration-workbench` in region `us-east-2`

---

## Security Notes

- ✅ **Least Privilege:** Policy only allows `lambda:InvokeFunction` on specific function
- ✅ **Separate User:** Dedicated IAM user for Vercel (not admin account)
- ⚠️ **Rotate Keys:** Rotate access keys every 90 days
- ⚠️ **Monitor:** Enable CloudTrail to audit Lambda invocations

---

**Related:** See `docs/aws/VERCEL_LAMBDA_SETUP.md` for detailed documentation

