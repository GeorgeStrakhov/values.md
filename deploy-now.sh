#!/bin/bash

# BULLETPROOF DEPLOYMENT - No more manual chaos
echo "🚀 BULLETPROOF DEPLOYMENT STARTING"

# Pre-flight checks
echo "1️⃣ Pre-flight checks..."
if ! command -v npm &> /dev/null; then
  echo "❌ npm not found"
  exit 1
fi

if ! command -v node &> /dev/null; then
  echo "❌ node not found"
  exit 1
fi

echo "2️⃣ Installing dependencies..."
npm ci || { echo "❌ npm ci failed"; exit 1; }

echo "3️⃣ TypeScript check..."
npx tsc --noEmit || { echo "❌ TypeScript errors"; exit 1; }

echo "4️⃣ Build test..."
npm run build || { echo "❌ Build failed"; exit 1; }

echo "5️⃣ Installing Playwright..."
npx playwright install chromium || { echo "❌ Playwright install failed"; exit 1; }

echo "6️⃣ Starting test server..."
pkill -f "next dev" 2>/dev/null || true
npm run dev > /dev/null 2>&1 &
SERVER_PID=$!

echo "7️⃣ Waiting for server..."
for i in {1..30}; do
  if curl -s http://localhost:3004/ > /dev/null; then
    echo "✅ Server ready"
    break
  fi
  sleep 2
  if [ $i -eq 30 ]; then
    echo "❌ Server failed to start"
    kill $SERVER_PID 2>/dev/null
    exit 1
  fi
done

echo "8️⃣ Running complete user flow test..."
if node test-complete-user-flow.js; then
  echo "✅ E2E test passed"
else
  echo "❌ E2E test failed"
  kill $SERVER_PID 2>/dev/null
  exit 1
fi

kill $SERVER_PID 2>/dev/null

echo "9️⃣ Committing and pushing..."
git add -A
git commit -m "BULLETPROOF DEPLOY: All gates passed

✅ TypeScript check passed
✅ Build successful  
✅ E2E test passed
✅ Ready for production

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push origin HEAD:main

echo "🔟 Monitoring deployment..."
echo "Waiting 2 minutes for Vercel deployment..."
sleep 120

echo "🏁 Verifying production..."
if curl -f https://values-md.vercel.app/api/dilemmas > /dev/null 2>&1; then
  echo "🎉 DEPLOYMENT SUCCESSFUL!"
  echo "✅ Production is live and working"
  echo "🌐 https://values-md.vercel.app"
else
  echo "⚠️  Deployment may still be in progress"
  echo "Check https://values-md.vercel.app in a few minutes"
fi