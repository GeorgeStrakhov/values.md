# Complete App Architecture Analysis

## 1. CREDENTIALS & AUTHENTICATION

### Database Connection
- **Storage**: `.env.local` (dev), `.env.staging` (stage), `.env.production` (prod)
- **Format**: `DATABASE_URL="postgresql://user:pass@host/db"`
- **Usage**: `src/lib/db.ts` → Drizzle ORM connection
- **Race condition**: Multiple API calls can overwhelm connection pool

### LLM API
- **Storage**: `OPENROUTER_API_KEY` in env files
- **Usage**: `src/lib/openrouter.ts` for dilemma generation + VALUES.md
- **Race condition**: Rate limiting if too many concurrent requests

### Admin Authentication
- **Storage**: `ADMIN_PASSWORD` (bcrypt hashed)
- **Session**: NextAuth.js JWT tokens
- **Usage**: `/admin` page, protected API routes

## 2. DATA FLOW & STORAGE POINTS

### User Journey Data Flow:
```
1. Landing page → No data stored
2. Click "Start Exploring" → API call `/api/dilemmas/random`
3. Redirect to `/explore/[uuid]` → Fetch 12 dilemmas via `/api/dilemmas/[uuid]`
4. User answers → Stored in localStorage via Zustand
5. Navigate between dilemmas → State persisted locally
6. Complete 12 dilemmas → Navigate to `/results`
7. Generate VALUES.md → API call `/api/generate-values` with localStorage data
8. Optional: Contribute to research → Save to database
```

### Storage Layers:
1. **Browser localStorage** (Zustand persistence):
   - User responses during dilemma sequence
   - Session ID
   - Progress state

2. **Database** (PostgreSQL):
   - Dilemmas (seeded)
   - User responses (if contributed to research)
   - Admin accounts
   - LLM responses (for comparison)

## 3. PRECONDITIONS & RACE CONDITIONS

### Critical Preconditions:
1. **Database must be seeded** with dilemmas before user flow works
2. **Environment variables** must be set correctly per deployment
3. **Domain routing** must match environment (localhost vs staging vs prod)

### Race Conditions Identified:
1. **Hydration mismatch**: Server renders empty state, client loads from localStorage
2. **Concurrent API calls**: Multiple users hitting `/api/dilemmas/random` simultaneously
3. **Database connection limits**: Neon has connection pooling limits
4. **Domain redirect conflicts**: Multiple environments sharing same base URLs

## 4. ERROR PATTERNS OBSERVED

### Deployment Failures:
- **Pattern**: Every push to stage fails in GitHub Actions
- **Hypothesis**: Environment variable conflicts or build issues
- **Missing info**: Need to check actual error logs

### Domain Redirect Issues:
- **Pattern**: APIs redirect to wrong domains (stage→prod, local→localhost)
- **Root cause**: Hardcoded `NEXTAUTH_URL` instead of dynamic request URLs
- **Impact**: Users can't access dilemmas on correct environment

### Loading Freezes:
- **Pattern**: "Loading ethical dilemmas..." never resolves
- **Hypothesis**: Zustand persistence causing client-server state mismatch
- **Impact**: Core flow broken

## 5. EXECUTION ORDER ANALYSIS

### On Page Load `/explore/[uuid]`:
1. Server renders with empty dilemmas state
2. Client hydrates and checks localStorage for persisted state
3. **RACE**: If no dilemmas in store, fetch from API
4. **RACE**: If dilemmas exist but wrong UUID, re-fetch
5. Update Zustand store
6. Re-render with dilemmas

### Critical Timing Issues:
- Hydration happens before API response
- Multiple useEffects can trigger simultaneously
- State updates can trigger additional re-fetches

## 6. MISSING PIECES TO INVESTIGATE

1. **GitHub Actions logs** - Why are deployments failing?
2. **Database state** - Are the 30 dilemmas still seeded?
3. **Environment variable inheritance** - How does Vercel handle staging vs prod?
4. **Zustand persistence config** - What exactly is stored/restored?
5. **API endpoint behavior** - Test each endpoint independently

## 7. RECOMMENDED INVESTIGATION ORDER

1. Test database connection and dilemma count
2. Check GitHub Actions failure logs
3. Verify Zustand store state in browser
4. Test API endpoints in isolation
5. Trace complete user flow step-by-step