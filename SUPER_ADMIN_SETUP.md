# Super Admin Setup Guide

## Quick Start

The fastest way to set up your super admin account:

```bash
# 1. Set your credentials (use a secure password!)
export SUPER_ADMIN_EMAIL="your-email@example.com"
export SUPER_ADMIN_PASSWORD="YourSecureP@ssw0rd123!"

# 2. Run the setup script
pnpm admin:setup
```

## What This Script Does

The `admin:setup` script (`scripts/admin/ensure-super-admin.ts`) is a production-ready tool that:

- ✅ Creates a super admin user with full system access
- ✅ Uses bcrypt password hashing (12 salt rounds)
- ✅ Validates email format and password strength
- ✅ Is idempotent (safe to run multiple times)
- ✅ Never logs passwords or sensitive data
- ✅ Supports interactive, environment variable, or CLI argument modes

## Password Requirements

Your password **must** include:

- ✓ Minimum 12 characters
- ✓ At least one uppercase letter (A-Z)
- ✓ At least one lowercase letter (a-z)
- ✓ At least one number (0-9)
- ✓ At least one special character (!@#$%^&*()_+-=[]{}|;:'",.<>?/)

**Example valid passwords:**
- `SecureP@ssw0rd123!`
- `MyStr0ng!P@ssword`
- `C0mpl3x#P@ssw0rd`

## Usage Options

### Option 1: Environment Variables (Recommended)

```bash
SUPER_ADMIN_EMAIL=admin@engify.ai \
SUPER_ADMIN_PASSWORD='SecurePass123!' \
SUPER_ADMIN_NAME="Admin User" \
pnpm admin:setup
```

### Option 2: .env.local File

1. Copy the example file:
   ```bash
   cp .env.admin.example .env.local
   ```

2. Edit `.env.local` and set your credentials:
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/engify
   SUPER_ADMIN_EMAIL=admin@engify.ai
   SUPER_ADMIN_PASSWORD=YourSecureP@ssw0rd123!
   SUPER_ADMIN_NAME=Admin User
   ```

3. Run the setup:
   ```bash
   pnpm admin:setup
   ```

### Option 3: Command Line Arguments

```bash
pnpm admin:setup \
  --email admin@engify.ai \
  --password 'SecurePass123!' \
  --name "Admin User"
```

### Option 4: Interactive Mode

```bash
# Will prompt for password if not provided
pnpm admin:setup --email admin@engify.ai
```

## What Gets Created

The script creates a user document in MongoDB with these properties:

```typescript
{
  email: "your-email@example.com",
  name: "Your Name",
  password: "bcrypt_hashed_password",
  role: "super_admin",              // Full system access
  plan: "enterprise_premium",       // Highest tier
  emailVerified: new Date(),        // Pre-verified
  mfaVerified: true,                // Emergency access enabled
  mfaEnabled: false,                // Can enable later
  active: true,                     // Account is active
  // ... other fields
}
```

## Security Features

- **Password Hashing**: Uses bcrypt with 12 salt rounds (industry standard)
- **Strong Validation**: Enforces email format and password complexity
- **No Logging**: Passwords are never written to logs
- **Idempotent**: Won't create duplicate users
- **Emergency Access**: MFA verified by default for initial setup

## After Setup

### Immediate Steps

1. **Log in** to https://engify.ai/login with your credentials
2. **Enable MFA** in security settings
3. **Change password** if you used a temporary one
4. **Review system settings** in OpsHub

### Security Best Practices

- ✓ Store credentials in a password manager
- ✓ Never commit credentials to version control
- ✓ Enable MFA immediately after first login
- ✓ Create role-specific admin accounts for daily use
- ✓ Reserve super admin for emergency access only
- ✓ Rotate passwords every 90 days
- ✓ Review audit logs regularly

## Troubleshooting

### "MONGODB_URI not set"

**Solution**: Add to your `.env.local`:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/engify
```

### "Password validation failed"

**Solution**: Ensure your password meets all requirements (12+ chars, mixed case, numbers, symbols)

Example: `MySecureP@ssw0rd123!`

### "User already exists"

**Solution**: The script detected an existing super admin. You can:
- Answer 'y' to update the password
- Answer 'n' to skip the update

### Connection Issues

If you see MongoDB connection errors:

1. Verify `MONGODB_URI` is correct
2. Check your network connection
3. Ensure MongoDB Atlas allows your IP address
4. Verify database credentials

## Help & Documentation

```bash
# Show help message
pnpm admin:setup --help

# View detailed documentation
cat scripts/admin/README.md
```

## Files Created

This setup created the following files:

- `/scripts/admin/ensure-super-admin.ts` - Main script (574 lines)
- `/scripts/admin/ensure-super-admin.test.ts` - Unit tests
- `/scripts/admin/README.md` - Detailed documentation
- `/.env.admin.example` - Environment variable template
- `/SUPER_ADMIN_SETUP.md` - This quick start guide
- Updated: `/package.json` - Added `admin:setup` npm script

## Testing

Run the unit tests:

```bash
pnpm test scripts/admin/ensure-super-admin.test.ts
```

## Support

- **Documentation**: https://docs.engify.ai/admin/super-admin
- **Security Guide**: https://docs.engify.ai/security/best-practices
- **Support**: support@engify.ai

---

**Version**: 1.0.0
**Last Updated**: 2025-11-17
**Maintainer**: Engify.ai Security Team
