# Shared Script Libraries

This directory contains reusable shell script libraries that eliminate duplication across the codebase.

## Libraries

### colors.sh
Color definitions and logging functions for consistent terminal output.

**Functions:**
- `print_status(message)` - Blue info message
- `print_success(message)` - Green success message
- `print_warning(message)` - Yellow warning message
- `print_error(message)` - Red error message
- `print_critical(message)` - Red critical message
- `print_debug(message)` - Purple debug message (only when DEBUG=1)
- `print_section(title)` - Cyan section header

**Usage:**
```bash
#!/bin/bash
source "$(dirname "$0")/_lib/colors.sh"

print_status "Starting deployment..."
print_success "Deployment complete!"
```

### config.sh
Shared configuration and constants used across scripts.

**Variables:**
- AWS: `AWS_REGION`, `AWS_ACCOUNT_ID`, `LAMBDA_*` constants
- Redis: `REDIS_HOST`, `REDIS_PORT`, `REDIS_CONTAINER_NAME`, etc.
- API: `API_BASE_URL`, `PROD_URL`, `API_VERSION`
- Timeouts: Various timeout constants
- Database: MongoDB connection defaults

**Usage:**
```bash
#!/bin/bash
source "$(dirname "$0")/_lib/config.sh"

echo "Deploying to region: $AWS_REGION"
echo "Redis container: $REDIS_CONTAINER_NAME"
```

### aws-common.sh
AWS utility functions used by deployment and Lambda scripts.

**Functions:**
- `check_aws_cli()` - Verify AWS CLI is installed
- `validate_aws_credentials()` - Check AWS credentials are valid
- `get_account_id()` - Get current AWS account ID
- `get_region()` - Get current AWS region
- `role_exists(role_name)` - Check if IAM role exists
- `create_lambda_role(role_name, account_id)` - Create Lambda execution role
- `wait_for_lambda(function_name, [max_wait])` - Wait for Lambda to be active
- `lambda_exists(function_name)` - Check if Lambda function exists
- `print_aws_info()` - Display AWS environment information

**Usage:**
```bash
#!/bin/bash
source "$(dirname "$0")/_lib/colors.sh"
source "$(dirname "$0")/_lib/config.sh"
source "$(dirname "$0")/_lib/aws-common.sh"

check_aws_cli || exit 1
validate_aws_credentials || exit 1

ACCOUNT_ID=$(get_account_id)
create_lambda_role "my-lambda-role" "$ACCOUNT_ID"
```

## Benefits

1. **DRY Principle**: Eliminates ~500+ lines of duplicated code
2. **Consistency**: All scripts use the same logging format and colors
3. **Maintainability**: Update configuration in one place
4. **Testability**: Easier to test shared functions
5. **Documentation**: Centralized documentation of common patterns

## Migration Guide

To update existing scripts to use these libraries:

### Before:
```bash
#!/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}[SUCCESS]${NC} Deploy complete"

if ! command -v aws &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} AWS CLI not found"
    exit 1
fi
```

### After:
```bash
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_lib/colors.sh"
source "$SCRIPT_DIR/_lib/aws-common.sh"

print_success "Deploy complete"
check_aws_cli || exit 1
```

## Scripts Already Using These Libraries

- ✅ `scripts/_lib/colors.sh` - NEW
- ✅ `scripts/_lib/config.sh` - NEW
- ✅ `scripts/_lib/aws-common.sh` - NEW
- ✅ `tests/_setup.sh` - NEW (test framework)

## Scripts That Should Be Updated

**High Priority:**
- `scripts/deployment/smoke-test.sh` (133 lines → ~60 lines)
- `scripts/maintenance/smoke-test.sh` (135 lines → ~60 lines)
- `tests/api/smoke-tests.sh` (112 lines → ~40 lines)
- `tests/api/page-tests.sh` (100 lines → ~30 lines)
- `tests/api/e2e-tests.sh` (143 lines → ~60 lines)
- `tests/api/regression-tests.sh` (136 lines → ~50 lines)
- `scripts/aws/deploy-lambda.sh` (223 lines → ~120 lines)
- `scripts/aws/deploy-multi-agent-lambda.sh` (155 lines → ~80 lines)
- `scripts/aws/deploy-python-backend.sh` (148 lines → ~80 lines)

**Estimated Reduction**: ~600 lines of duplicated code

## Reference Implementation

See `scripts/redis/` for excellent example of this pattern:
- `redis-manager.sh` - Central library with all functions
- `start-local.sh`, `stop-local.sh`, etc. - Thin wrappers (2-3 lines each)
