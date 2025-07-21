#!/bin/bash
# audit-everything.sh - Catch ALL the issues before production

set -e  # Exit on any error

echo "🔍 COMPREHENSIVE AUDIT STARTING..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ERRORS=$((ERRORS + 1))
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. BUILD TEST - Catches SSR issues like localStorage
echo -e "\n📦 1. BUILD TEST (SSR Validation)"
echo "--------------------------------"
if npm run build; then
    log_success "Build succeeds - no SSR issues"
else
    log_error "Build failed - likely SSR/localStorage issue"
fi

# 2. START DEV SERVER
echo -e "\n🚀 2. STARTING DEV SERVER"
echo "-------------------------"
npm run dev > /dev/null 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to start
echo "Waiting for server to start..."
for i in {1..30}; do
    if curl -s http://localhost:3004 > /dev/null; then
        log_success "Server is running"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Server failed to start"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# 3. CRITICAL PATH VALIDATION
echo -e "\n🛣️  3. CRITICAL PATH VALIDATION"
echo "--------------------------------"

# Test each critical route
ROUTES=("/" "/explore" "/results" "/research" "/api/dilemmas" "/api/generate-values")

for route in "${ROUTES[@]}"; do
    if [[ $route == /api/* ]]; then
        # API routes - check JSON response
        if curl -s -f "http://localhost:3004$route" | jq . > /dev/null 2>&1; then
            log_success "API route $route responds with valid JSON"
        else
            log_error "API route $route failed or invalid JSON"
        fi
    else
        # Page routes - check HTML response
        if curl -s -f "http://localhost:3004$route" | grep -q "<!DOCTYPE html"; then
            log_success "Page route $route serves HTML"
        else
            log_error "Page route $route failed or not HTML"
        fi
    fi
done

# 4. API HEALTH WITH REAL DATA
echo -e "\n🔌 4. API HEALTH (Real Data)"
echo "----------------------------"

# Test dilemmas API
DILEMMAS_RESPONSE=$(curl -s "http://localhost:3004/api/dilemmas")
if echo "$DILEMMAS_RESPONSE" | jq -e '.dilemmas | length > 0' > /dev/null; then
    DILEMMA_COUNT=$(echo "$DILEMMAS_RESPONSE" | jq '.dilemmas | length')
    log_success "Dilemmas API returns $DILEMMA_COUNT dilemmas"
    
    # Test values generation with real dilemma
    FIRST_DILEMMA_ID=$(echo "$DILEMMAS_RESPONSE" | jq -r '.dilemmas[0].dilemmaId')
    VALUES_PAYLOAD=$(cat <<EOF
{
  "responses": [{
    "dilemmaId": "$FIRST_DILEMMA_ID",
    "chosenOption": "A", 
    "reasoning": "Test reasoning",
    "responseTime": 5000,
    "perceivedDifficulty": 5
  }]
}
EOF
)
    
    VALUES_RESPONSE=$(curl -s -X POST "http://localhost:3004/api/generate-values" \
        -H "Content-Type: application/json" \
        -d "$VALUES_PAYLOAD")
    
    if echo "$VALUES_RESPONSE" | jq -e '.valuesMarkdown' > /dev/null; then
        log_success "Values generation API works with real data"
    else
        log_error "Values generation API failed: $VALUES_RESPONSE"
    fi
else
    log_error "Dilemmas API failed or empty: $DILEMMAS_RESPONSE"
fi

# 5. CHAOS TESTING (Quick version)
echo -e "\n🎲 5. CHAOS TESTING"
echo "-------------------"

# Test malformed requests
CHAOS_TESTS=(
    "POST /api/generate-values {}"
    "POST /api/generate-values {\"responses\":[]}"
    "POST /api/generate-values {\"responses\":[{\"invalid\":true}]}"
    "GET /api/nonexistent"
)

for test in "${CHAOS_TESTS[@]}"; do
    read -r method path payload <<< "$test"
    if [[ $method == "POST" ]]; then
        RESPONSE=$(curl -s -X POST "http://localhost:3004$path" \
            -H "Content-Type: application/json" \
            -d "$payload" -w "%{http_code}")
        HTTP_CODE="${RESPONSE: -3}"
        if [[ $HTTP_CODE -ge 400 && $HTTP_CODE -lt 500 ]]; then
            log_success "Chaos test $test returns proper error code $HTTP_CODE"
        else
            log_warning "Chaos test $test unexpected response: $HTTP_CODE"
        fi
    else
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3004$path")
        if [[ $HTTP_CODE == "404" ]]; then
            log_success "Chaos test $test returns 404 as expected"
        else
            log_warning "Chaos test $test unexpected response: $HTTP_CODE"
        fi
    fi
done

# 6. PRODUCTION PARITY CHECK
echo -e "\n🌍 6. PRODUCTION PARITY"
echo "-----------------------"

if curl -s -f "https://values.uprootiny.dev/" > /dev/null; then
    log_success "Production site is accessible"
    
    # Compare API responses
    PROD_DILEMMAS=$(curl -s "https://values.uprootiny.dev/api/dilemmas" || echo '{"error": "failed"}')
    LOCAL_DILEMMAS=$(curl -s "http://localhost:3004/api/dilemmas")
    
    PROD_COUNT=$(echo "$PROD_DILEMMAS" | jq -r '.dilemmas | length // 0')
    LOCAL_COUNT=$(echo "$LOCAL_DILEMMAS" | jq -r '.dilemmas | length // 0')
    
    if [[ $PROD_COUNT -gt 0 && $LOCAL_COUNT -gt 0 ]]; then
        log_success "Both prod ($PROD_COUNT) and local ($LOCAL_COUNT) have dilemmas"
    else
        log_error "Dilemma count mismatch - Prod: $PROD_COUNT, Local: $LOCAL_COUNT"
    fi
else
    log_error "Production site is not accessible"
fi

# 7. CLEANUP
echo -e "\n🧹 7. CLEANUP"
echo "-------------"
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true
log_success "Server stopped"

# 8. SUMMARY
echo -e "\n📊 AUDIT SUMMARY"
echo "================="
if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED! Safe to deploy.${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS ERRORS DETECTED! Fix before deploying.${NC}"
    exit 1
fi