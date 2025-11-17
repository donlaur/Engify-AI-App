#!/bin/bash
# Shared AWS utility functions
# Source this file along with colors.sh and config.sh

# Check if AWS CLI is installed
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI not found. Please install it first."
        echo "Visit: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        return 1
    fi
    print_success "AWS CLI found"
    return 0
}

# Validate AWS credentials are configured
validate_aws_credentials() {
    print_status "Validating AWS credentials..."
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured or invalid"
        echo "Run 'aws configure' or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
        return 1
    fi
    print_success "AWS credentials validated"
    return 0
}

# Get AWS account ID
get_account_id() {
    aws sts get-caller-identity --query Account --output text 2>/dev/null
}

# Get current AWS region
get_region() {
    aws configure get region 2>/dev/null || echo "${AWS_REGION:-us-east-2}"
}

# Check if IAM role exists
role_exists() {
    local role_name=$1
    aws iam get-role --role-name "$role_name" &> /dev/null
    return $?
}

# Create Lambda execution role
create_lambda_role() {
    local role_name=$1
    local account_id=$2

    print_status "Creating IAM role: $role_name..."

    # Check if role already exists
    if role_exists "$role_name"; then
        print_warning "Role $role_name already exists"
        return 0
    fi

    # Create trust policy
    local trust_policy=$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
)

    # Create role
    if aws iam create-role \
        --role-name "$role_name" \
        --assume-role-policy-document "$trust_policy" \
        --description "Execution role for Lambda function" &> /dev/null; then
        print_success "Role created: $role_name"
    else
        print_error "Failed to create role: $role_name"
        return 1
    fi

    # Attach basic Lambda execution policy
    aws iam attach-role-policy \
        --role-name "$role_name" \
        --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" &> /dev/null

    print_success "Attached Lambda execution policy"
    return 0
}

# Wait for Lambda function to be active
wait_for_lambda() {
    local function_name=$1
    local max_wait=${2:-60}
    local wait_time=0

    print_status "Waiting for Lambda function to be active..."

    while [ $wait_time -lt $max_wait ]; do
        local state=$(aws lambda get-function \
            --function-name "$function_name" \
            --query 'Configuration.State' \
            --output text 2>/dev/null)

        if [ "$state" = "Active" ]; then
            print_success "Lambda function is active"
            return 0
        fi

        sleep 2
        wait_time=$((wait_time + 2))
    done

    print_error "Lambda function did not become active within ${max_wait}s"
    return 1
}

# Check if Lambda function exists
lambda_exists() {
    local function_name=$1
    aws lambda get-function --function-name "$function_name" &> /dev/null
    return $?
}

# Print AWS environment info
print_aws_info() {
    print_section "AWS Environment"
    echo "Account ID: $(get_account_id)"
    echo "Region: $(get_region)"
    echo "Caller Identity: $(aws sts get-caller-identity --query Arn --output text 2>/dev/null)"
}
