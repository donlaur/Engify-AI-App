#!/bin/bash
# Shared test framework helpers
# Source this file in API test scripts

# Source colors
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../scripts/_lib/colors.sh"
source "$SCRIPT_DIR/../scripts/_lib/config.sh"

# Test counters
export PASSED=0
export FAILED=0
export TOTAL=0

# Test endpoint helper
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local data=$5

    TOTAL=$((TOTAL + 1))
    print_status "Testing: $description"

    local url="${BASE_URL}${endpoint}"
    local response_code

    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response_code=$(curl -s -o /dev/null -w "%{http_code}" \
            -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url")
    else
        response_code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$url")
    fi

    if [ "$response_code" = "$expected_status" ]; then
        print_success "✓ $description (HTTP $response_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        print_error "✗ $description (Expected: $expected_status, Got: $response_code)"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Test page helper
test_page() {
    local path=$1
    local description=$2
    local expected_text=$3

    TOTAL=$((TOTAL + 1))
    print_status "Testing: $description"

    local url="${BASE_URL}${path}"
    local response=$(curl -s "$url")
    local status=$?

    if [ $status -ne 0 ]; then
        print_error "✗ $description (Failed to fetch page)"
        FAILED=$((FAILED + 1))
        return 1
    fi

    if [ -n "$expected_text" ]; then
        if echo "$response" | grep -q "$expected_text"; then
            print_success "✓ $description (Found expected content)"
            PASSED=$((PASSED + 1))
            return 0
        else
            print_error "✗ $description (Expected content not found)"
            FAILED=$((FAILED + 1))
            return 1
        fi
    else
        print_success "✓ $description (Page accessible)"
        PASSED=$((PASSED + 1))
        return 0
    fi
}

# Test check helper (generic assertion)
test_check() {
    local condition=$1
    local description=$2

    TOTAL=$((TOTAL + 1))
    print_status "Checking: $description"

    if eval "$condition"; then
        print_success "✓ $description"
        PASSED=$((PASSED + 1))
        return 0
    else
        print_error "✗ $description"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Report summary
report_summary() {
    print_section "Test Summary"
    echo "Total Tests: $TOTAL"
    echo -e "${GREEN}Passed: $PASSED${NC}"
    echo -e "${RED}Failed: $FAILED${NC}"

    if [ $FAILED -eq 0 ]; then
        print_success "All tests passed!"
        return 0
    else
        print_error "Some tests failed"
        return 1
    fi
}

# Initialize test suite
init_tests() {
    local suite_name=$1
    print_section "$suite_name"
    PASSED=0
    FAILED=0
    TOTAL=0
}
