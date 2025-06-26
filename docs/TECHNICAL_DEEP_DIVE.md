# Technical Deep Dive

## 🏗️ Architecture Overview

### Frontend (Next.js 15 + TypeScript)
```
src/app/
├── page.tsx                    # Landing page
├── explore/[uuid]/page.tsx     # Dilemma interface (FIXED: navigation working)
├── results/page.tsx            # Values.md generation
├── admin/page.tsx              # Admin interface
└── api/                        # Backend API routes
    ├── dilemmas/               # Dilemma management
    ├── generate-values/        # AI values generation
    └── responses/              # User response storage
```

### State Management (Zustand)
```typescript
// src/store/dilemma-store.ts - SIMPLIFIED & WORKING
interface DilemmaState {
  dilemmas: Dilemma[]           # Loaded from database
  currentIndex: number          # Progress tracking (FIXED: was stuck at 1)
  responses: Response[]         # User answers (localStorage + DB)
  selectedOption: string        # Current form state
  // Navigation methods (WORKING after revert to simple approach)
  goToNext(): Promise<boolean>
  goToPrevious(): void
}
```

### Database Schema (PostgreSQL + Drizzle)
```sql
-- Core ethical framework
frameworks     # Ethical theories (utilitarianism, deontology, etc.)
motifs         # Mapped to dilemma choices for value extraction
dilemmas       # Generated ethical scenarios with UUID routing

-- User data (privacy-focused)
userResponses      # Choices, reasoning, difficulty ratings
userDemographics   # Optional anonymous data
llmResponses       # Baseline AI responses for comparison
```

### Data Flow Pipeline
```
1. CSV Files (striated/) → 2. Database (seed) → 3. App Logic → 4. User Responses → 5. AI Analysis → 6. values.md
```

## 🔧 Key Components

### Navigation System (RECENTLY FIXED)
- **Problem**: Complex auto-advance system broke basic navigation
- **Solution**: Reverted to simple useState-based countdown timer
- **Result**: Progress shows correctly (1→2→3), Next button works, auto-advance optional

### Values Generation Pipeline
```typescript
// src/app/api/generate-values/route.ts
1. Fetch user responses from database
2. Map choices to motifs (from CSV data)
3. Generate AI prompt with ethical framework context
4. Call OpenRouter API (Claude 3.5 Sonnet)
5. Return formatted values.md file
```

### Authentication & Security
- NextAuth.js with JWT sessions (admin-only)
- Environment variables for API keys
- Privacy-first: localStorage until explicit sharing

## 🧪 Testing Strategy

### Current Test Suite (Post-Cleanup)
```
tests/
├── basic.test.ts              # Framework verification
├── store-unit.test.ts         # State management (regression prevention)
├── critical-regression.test.ts # Navigation bugs that occurred
├── database-pipeline.test.ts   # End-to-end data flow
└── setup.ts                   # Test configuration
```

### Test Coverage Focus
- ✅ Navigation flow (prevent "stuck at 1 of 12" regression)
- ✅ Response saving (prevent "No responses found" error)
- ✅ Store state management
- 🔄 Database integration (needs env setup)
- 🔄 API endpoints (planned)

## 📦 Build & Dependencies

### Core Dependencies
```json
{
  "next": "15.3.3",              // React framework
  "zustand": "^5.0.1",           // State management
  "drizzle-orm": "^0.36.1",      // Database ORM
  "@auth/nextauth": "^0.27.3",   // Authentication
  "openai": "^4.73.0"            // OpenRouter API client
}
```

### Development Tools
- TypeScript for type safety
- Tailwind CSS v4 for styling
- Vitest for unit testing
- Playwright for E2E testing
- ESLint for code quality