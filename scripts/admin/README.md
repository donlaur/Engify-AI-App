# Admin Scripts

Administrative scripts for managing the Engify.ai platform.

## Super Admin Setup

### Overview

The `ensure-super-admin.ts` script is a production-ready tool for creating and managing super admin users in your MongoDB database. This is typically the first script you'll run when setting up a new Engify.ai instance.

### Features

- **Idempotent**: Safe to run multiple times
- **Secure**: Bcrypt password hashing with 12 salt rounds
- **Validated**: Strong email and password validation
- **Interactive**: Prompts for password if not provided
- **Flexible**: Supports environment variables, CLI arguments, or interactive mode
- **Safe**: Never logs passwords or sensitive data

### Usage

#### Quick Start

```bash
# Using pnpm script (recommended)
SUPER_ADMIN_EMAIL=admin@engify.ai SUPER_ADMIN_PASSWORD='SecurePass123!' pnpm admin:setup

# Or using tsx directly
SUPER_ADMIN_EMAIL=admin@engify.ai SUPER_ADMIN_PASSWORD='SecurePass123!' pnpm tsx scripts/admin/ensure-super-admin.ts
```

#### Command Line Arguments

```bash
pnpm admin:setup --email admin@engify.ai --password 'SecurePass123!' --name "Admin User"
```

#### Interactive Mode

```bash
# Will prompt for password
pnpm admin:setup --email admin@engify.ai
```

#### Help

```bash
pnpm admin:setup --help
```

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SUPER_ADMIN_EMAIL` | Super admin email address | `admin@engify.ai` | No |
| `SUPER_ADMIN_PASSWORD` | Super admin password | None | **Yes** |
| `SUPER_ADMIN_NAME` | Display name | `"Super Admin"` | No |
| `MONGODB_URI` | MongoDB connection string | None | **Yes** |

### Password Requirements

For security, passwords must meet the following requirements:

- Minimum 12 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*()_+-=[]{}|;:'",.<>?/)

### Examples

#### Example 1: First-time Setup

```bash
# Set environment variables
export SUPER_ADMIN_EMAIL="don@engify.ai"
export SUPER_ADMIN_PASSWORD="MySecureP@ssw0rd123!"
export SUPER_ADMIN_NAME="Don Laur"

# Run setup
pnpm admin:setup
```

#### Example 2: Using .env.local

Add to your `.env.local` file:

```env
SUPER_ADMIN_EMAIL=admin@engify.ai
SUPER_ADMIN_PASSWORD=MySecureP@ssw0rd123!
SUPER_ADMIN_NAME=Super Admin
```

Then run:

```bash
pnpm admin:setup
```

#### Example 3: Update Existing Password

```bash
# Script will detect existing user and prompt to update password
SUPER_ADMIN_EMAIL=admin@engify.ai SUPER_ADMIN_PASSWORD='NewSecureP@ss456!' pnpm admin:setup
```

### Security Best Practices

1. **Never commit credentials** to version control
2. **Use a password manager** to generate and store strong passwords
3. **Enable MFA** immediately after first login
4. **Limit super admin access** to emergency use only
5. **Create role-specific admin accounts** for day-to-day operations
6. **Regularly review audit logs** for super admin activities
7. **Rotate passwords** periodically (at least every 90 days)

### Database Schema

The script creates a user document with the following structure:

```typescript
{
  _id: ObjectId,
  email: string,
  name: string,
  password: string,              // Bcrypt hashed
  role: 'super_admin',
  plan: 'enterprise_premium',
  emailVerified: Date,
  mfaVerified: true,             // Emergency access enabled
  mfaEnabled: false,
  image: null,
  organizationId: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  active: true,
  createdAt: Date,
  updatedAt: Date
}
```

### Troubleshooting

#### Error: "MONGODB_URI environment variable is not set"

**Solution**: Add `MONGODB_URI` to your `.env.local` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/engify
```

#### Error: "Password validation failed"

**Solution**: Ensure your password meets all requirements:
- At least 12 characters
- Mixed case letters
- Numbers
- Special characters

Example valid password: `MySecureP@ssw0rd123!`

#### Error: "Email validation failed"

**Solution**: Ensure email is in valid format: `user@domain.com`

#### Error: "User with this email already exists" (as regular user)

**Solution**: The email is already used by a non-super-admin user. You have two options:

1. Use a different email for the super admin
2. Manually update the existing user's role in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@engify.ai" },
  { $set: { role: "super_admin", plan: "enterprise_premium" } }
)
```

### Testing

Run in test mode (dry run):

```bash
# Note: Always test in a non-production environment first
MONGODB_URI=mongodb://localhost:27017/engify-test pnpm admin:setup --email test@example.com --password 'TestP@ssw0rd123!'
```

### Next Steps After Setup

1. **Log in** to the Engify.ai platform at `/login`
2. **Enable MFA** in security settings
3. **Create additional admin accounts** for team members
4. **Review system settings** in OpsHub
5. **Set up backup procedures** for the database
6. **Configure monitoring and alerts**

### Related Scripts

- `admin:stats` - View database statistics
- `admin:review-prompts` - Review and audit prompts

### Support

For issues or questions:
- Documentation: https://docs.engify.ai/admin/super-admin
- Security: https://docs.engify.ai/security/best-practices
- Support: support@engify.ai

---

**Last Updated**: 2025-11-17
**Version**: 1.0.0
**Maintainer**: Engify.ai Security Team
