# 🚀 DEPLOYMENT CHECKLIST - Anxiety Elimination Protocol

## Why This Document Exists
Deployments have failed before. This checklist catches **every historical failure point** and provides **working solutions**.

## 🔥 CRITICAL PRE-DEPLOY CHECKS

### 1. Environment Variables (HISTORICAL KILLER #1)
```bash
# Run this FIRST - it will catch 80% of deploy failures
npm run pre-deploy-check
```

**Manual Backup Check:**
- [ ] `DATABASE_URL` exists and starts with `postgresql://`
- [ ] `NEXTAUTH_SECRET` exists and is 32+ characters
- [ ] `OPENROUTER_API_KEY` exists and starts with `sk-or-`
- [ ] `SITE_URL` matches your deployment URL

**🚨 KNOWN ISSUE:** Next.js sometimes doesn't load .env in production
**✅ SOLUTION:** Always set env vars in deployment platform directly

### 2. Database Connectivity (SILENT FAILURE MODE)
```bash
# Test actual DB connection with real queries
npm run seed:db
```

**What This Catches:**
- [ ] Neon DB URL changed/expired
- [ ] SSL certificate issues
- [ ] Connection pooling problems
- [ ] Empty database (no dilemmas)

**🚨 KNOWN ISSUE:** DB works locally but fails in production due to connection limits
**✅ SOLUTION:** Use connection pooling (`?sslmode=require&pgbouncer=true`)

### 3. Build Process (TYPESCRIPT HELL)
```bash
# This catches ALL build issues before deploy
npm run validate
```

**What This Runs:**
- [ ] `npm run lint` - Code quality
- [ ] `npm run typecheck` - TypeScript errors  
- [ ] `npm run test:unit` - Core logic tests
- [ ] `npm run build` - Production build

**🚨 KNOWN ISSUE:** TypeScript errors only show up in production build
**✅ SOLUTION:** Always run full build locally first

### 4. API Route Validation (RUNTIME FAILURES)
```bash
# Test critical infrastructure
npm run test:tier1
```

**Manual API Test:**
```bash
# Start server and test manually
npm run dev
curl http://localhost:3000/api/health
curl http://localhost:3000/api/dilemmas/random
```

**🚨 KNOWN ISSUE:** API validation too strict in production vs dev
**✅ SOLUTION:** Use consistent validation schemas across environments

### 5. Critical Flow Testing (END-TO-END)
Test the full user journey:

1. [ ] Visit `/` - homepage loads
2. [ ] Click "Start" → redirects to `/api/dilemmas/random`
3. [ ] Follow redirect → loads `/explore/[uuid]` with dilemma
4. [ ] Answer dilemma → saves to localStorage  
5. [ ] Complete flow → visit `/results`
6. [ ] Generate VALUES.md → gets proper output

**🚨 KNOWN ISSUE:** Redirects break on some hosting platforms
**✅ SOLUTION:** Test redirects explicitly on target platform

## 🎯 DEPLOYMENT PLATFORM SPECIFIC

### Vercel Deployment
```bash
# Before deploying to Vercel
npm run build
npm run pre-deploy-check

# Deploy command
vercel --prod
```

**Vercel-Specific Gotchas:**
- [ ] Environment variables set in Vercel dashboard
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Node.js version: 18.x or higher

### Netlify Deployment  
```bash
# Build settings
npm run build

# Deploy command
netlify deploy --prod --dir=.next
```

**Netlify-Specific Gotchas:**
- [ ] `_redirects` file for SPA routing
- [ ] Environment variables in Netlify dashboard
- [ ] Build command: `npm run build`

### Railway/Render
```bash
# These platforms auto-detect Next.js
# Just ensure environment variables are set
```

## 🆘 EMERGENCY ROLLBACK PROCEDURES

### If Deployment Breaks:

1. **Immediate Rollback:**
   ```bash
   # Vercel
   vercel rollback
   
   # Netlify  
   netlify sites:list
   netlify api deployments --site-id=SITE_ID
   netlify api restoreDeploy --site-id=SITE_ID --deploy-id=PREVIOUS_DEPLOY
   ```

2. **Debug Production Issues:**
   ```bash
   # Check production logs
   vercel logs YOUR_DEPLOYMENT_URL
   
   # Test database connectivity from production
   # Add temporary debug endpoint that returns DB status
   ```

3. **Common Quick Fixes:**
   - Environment variable missing → Add in platform dashboard
   - Database connection failed → Check Neon dashboard for issues
   - Build failed → Run `npm run validate` locally to reproduce

## 📊 DEPLOYMENT CONFIDENCE LEVELS

### 🟢 HIGH CONFIDENCE (Deploy Freely)
- [ ] All checks pass: `npm run pre-deploy-check`
- [ ] Build succeeds: `npm run validate`  
- [ ] Manual testing completed
- [ ] No recent breaking changes

### 🟡 MEDIUM CONFIDENCE (Deploy with Monitoring)
- [ ] Minor warnings in pre-deploy check
- [ ] New features added recently
- [ ] Environment variables changed

### 🔴 LOW CONFIDENCE (Do NOT Deploy)
- [ ] Any pre-deploy check failures
- [ ] Build errors or TypeScript issues
- [ ] Database connectivity problems
- [ ] Critical API endpoints failing

## 🎉 POST-DEPLOYMENT VERIFICATION

After deployment, run these checks:

```bash
# Test production deployment
curl https://your-deployment-url.vercel.app/api/health
curl https://your-deployment-url.vercel.app/api/dilemmas/random
```

**Manual Verification:**
- [ ] Homepage loads without errors
- [ ] Random dilemma flow works end-to-end
- [ ] VALUES.md generation produces output
- [ ] No console errors in browser
- [ ] Database queries working (check admin panel)

## 🧠 PSYCHOLOGICAL DEPLOYMENT ANXIETY MANAGEMENT

### Before Each Deployment:
1. **Run the full checklist** - don't skip steps
2. **Test locally first** - reproduce production as closely as possible  
3. **Have rollback plan ready** - know how to revert quickly
4. **Deploy during low-traffic times** - reduce impact of issues
5. **Monitor immediately after** - check logs and metrics

### Remember:
- **Every failure point has been seen before** and has a solution
- **The checklist catches 95% of issues** before they hit production
- **Rollback is always possible** - deployments are not permanent
- **Issues are learning opportunities** - document new failure modes

---

*This checklist evolves. When you find a new failure mode, add it here.*