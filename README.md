# VALUES.MD - Personal Values Discovery Platform

> **🎯 CORE MISSION**: Help users discover their values through ethical dilemmas → generate personalized VALUES.md files

## 🚀 QUICK START - ONE COMMAND DEPLOYMENT

```bash
# Deploy locally with wizard
npm run deploy:wizard

# OR simple local dev
npm run dev
```

**Live Site**: [https://values.md](https://values.md)

---

## 📊 CURRENT STATUS

### ✅ WORKING
- ✅ Database with 101 dilemmas, 20 frameworks, 18 motifs
- ✅ User interface for completing dilemmas  
- ✅ Response collection and localStorage
- ✅ VALUES.md generation from responses
- ✅ Enhanced results page with chat/experiments

### 🚨 CRITICAL ISSUE - MAIN FLOW BROKEN
**❌ PROBLEM**: Users complete 12 dilemmas → reach `/results` → see "0 answers saved, go away"

**🔧 ROOT CAUSE**: Response pipeline has async timing issues between localStorage → database → results page

**🎯 FIX STATUS**: Pipeline fixes implemented, debugging added, needs live testing validation

---

## 🏗️ DEPLOYMENT ARCHITECTURE

```
User completes dilemmas → Zustand store → localStorage + Database → VALUES.md generation → Results page
                                     ↑ BREAKING HERE ↑
```

### 🌐 DEPLOYMENT FLOW
1. **Local Dev**: `npm run dev` → `http://localhost:3000`
2. **Production**: GitHub push → Vercel auto-deploy → `https://values.md`
3. **Database**: Neon PostgreSQL (serverless)
4. **Domain**: Cloudflare DNS → Vercel hosting

---

## 🛠️ COMMANDS REFERENCE

### Development
```bash
npm run dev              # Local development server
npm run deploy:wizard    # Interactive deployment wizard
npm run status          # System status check
```

### Database
```bash
npm run db:report       # Database statistics
npm run db:dump         # Export all data
npm run setup          # Initialize database with seed data
```

### Validation
```bash
npm run validate       # Lint + typecheck + build
npm run lint          # Code linting
npm run typecheck     # TypeScript check
```

### Production
```bash
npm run deploy:prod   # Push to GitHub → Auto-deploy to values.md
```

---

## 🔧 ENVIRONMENT SETUP

### Required Credentials
```bash
# Copy template and configure
cp .env.example .env.local

# Required variables:
DATABASE_URL=postgresql://...     # Neon PostgreSQL connection
OPENROUTER_API_KEY=sk-or-v1-...  # LLM API access  
NEXTAUTH_SECRET=...              # Session security
ADMIN_PASSWORD=...               # Admin panel access
```

### Why Credentials Are Needed
- **DATABASE_URL**: Store user responses, dilemmas, frameworks
- **OPENROUTER_API_KEY**: Generate VALUES.md files using LLMs
- **NEXTAUTH_SECRET**: Secure admin authentication
- **ADMIN_PASSWORD**: Protect admin panel access

---

## 🎯 USER JOURNEY (INTENDED)

1. **Landing** → Understand the concept
2. **Start** → Click "Generate Your VALUES.md"  
3. **Dilemmas** → Answer 12 ethical scenarios
4. **Analysis** → AI analyzes responses → generates VALUES.md
5. **Results** → Download file + chat + experiments + research sharing
6. **Usage** → Use VALUES.md to guide AI systems

### 🚨 CURRENT BROKEN STEP
**Step 4**: Responses saved but not reaching results page properly

---

## 🔬 DEBUGGING THE MAIN ISSUE

### Browser Console Testing
1. Open dev tools console
2. Complete dilemma flow  
3. Look for these debug messages:
   - `💾 saveResponsesToDatabase called with:`
   - `📤 Sending to /api/responses:`
   - `✅ Responses saved to database successfully:`
   - `🔍 Results page - hydration complete:`

### Common Failure Points
- Store not saving responses to database
- API errors during save
- Results page hydration timing
- Session ID mismatches

---

## 📁 PROJECT STRUCTURE

```
src/
├── app/
│   ├── explore/[uuid]/     # Dilemma completion flow
│   ├── results/            # VALUES.md results page
│   └── api/
│       ├── responses/      # Save user responses  
│       ├── generate-values/ # Create VALUES.md
│       └── dilemmas/       # Dilemma management
├── store/
│   └── dilemma-store.ts    # Zustand state management
└── lib/
    ├── db.ts              # Database connection
    ├── schema.ts          # Database schema
    └── openrouter.ts      # LLM integration
```

---

## 🚀 DEPLOYMENT TARGETS

### Local Development
- **URL**: `http://localhost:3000`
- **Purpose**: Development and testing
- **Data**: Shared Neon database

### Production
- **URL**: `https://values.md`
- **Platform**: Vercel
- **Auto-deploy**: GitHub main branch
- **Environment**: Production Vercel env vars

---

## 🔍 NEXT IMMEDIATE ACTIONS

1. **PRIORITY 1**: Fix response pipeline - users MUST get their VALUES.md
2. **Test live site**: Validate fixes work in production
3. **Monitor**: Use debug logging to identify exact failure points
4. **Document**: Update status once main flow works

---

## 📞 SUPPORT

**Main Issue**: Response pipeline broken
**Debug Tool**: Browser console + database reports  
**Status**: Fixes implemented, validation needed