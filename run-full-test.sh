#!/bin/bash

# COMPLETE LOCAL TESTING SCRIPT
echo "🚀 Starting comprehensive local testing..."

# Kill any existing dev server
pkill -f "next dev" || true
sleep 2

echo "1️⃣ Starting Next.js dev server..."
npm run dev > dev.log 2>&1 &
DEV_PID=$!

# Wait for server to be ready
echo "2️⃣ Waiting for server to start..."
for i in {1..30}; do
  if curl -s http://localhost:3004/ > /dev/null; then
    echo "✅ Server is ready!"
    break
  fi
  echo "   Waiting... ($i/30)"
  sleep 2
done

# Check if server is actually running
if ! curl -s http://localhost:3004/ > /dev/null; then
  echo "❌ Server failed to start"
  kill $DEV_PID 2>/dev/null
  exit 1
fi

echo "3️⃣ Testing API endpoints..."
echo "   - Testing /api/dilemmas..."
if curl -s http://localhost:3004/api/dilemmas | jq -r '.dilemmas | length' > /dev/null 2>&1; then
  DILEMMA_COUNT=$(curl -s http://localhost:3004/api/dilemmas | jq -r '.dilemmas | length')
  echo "   ✅ API returns $DILEMMA_COUNT dilemmas"
else
  echo "   ❌ API failed"
fi

echo "4️⃣ Running complete user flow test..."
node test-complete-user-flow.js

# Capture the test result
TEST_RESULT=$?

echo "5️⃣ Cleaning up..."
kill $DEV_PID 2>/dev/null
rm -f dev.log test-failure-screenshot.png 2>/dev/null

if [ $TEST_RESULT -eq 0 ]; then
  echo "🎉 ALL TESTS PASSED!"
  echo "✅ Local development environment is working perfectly"
  echo "✅ Complete user flow works end-to-end"
  echo "✅ Values.md generation works"
  
  if [ -f "test-values-output.md" ]; then
    echo "📄 Generated values.md content:"
    echo "----------------------------------------"
    head -20 test-values-output.md
    echo "----------------------------------------"
    echo "(See full content in test-values-output.md)"
  fi
else
  echo "❌ TESTS FAILED"
  echo "Check the logs above for details"
  exit 1
fi