# BULLETPROOF VALUES.MD ARCHITECTURE
*The system that would actually work if we had a gun to our heads*

## CORE PRINCIPLES

### 1. FAIL-FAST DEVELOPMENT
```typescript
// Every commit MUST pass these gates:
- TypeScript build (no warnings)
- End-to-end test (full user flow)
- Production build test
- API contract verification
```

### 2. SINGLE SOURCE OF TRUTH
```typescript
// One file defines everything
export const SYSTEM = {
  routes: {
    LANDING: '/',
    EXPLORE: '/explore',
    RESULTS: '/results'
  },
  api: {
    DILEMMAS: '/api/dilemmas',
    GENERATE: '/api/generate-values',
    RESPONSES: '/api/responses'
  },
  storage: {
    SESSION: 'values_session'
  },
  constants: {
    REQUIRED_RESPONSES: 12,
    SESSION_TIMEOUT: 3600000 // 1 hour
  }
} as const;
```

### 3. ZERO-SURPRISE STATE MANAGEMENT
```typescript
// One state machine, no localStorage complexity
type AppState = 
  | { phase: 'landing' }
  | { phase: 'exploring', currentIndex: number, responses: Response[] }
  | { phase: 'complete', responses: Response[], valuesGenerated: boolean }
  | { phase: 'error', error: string, recovery: () => void }

// State transitions are pure functions
function transition(state: AppState, action: Action): AppState {
  // Every transition is predictable and testable
}
```

### 4. BULLETPROOF DEPLOYMENT
```yaml
# .github/workflows/bulletproof-deploy.yml
name: Bulletproof Deploy
on: [push]
jobs:
  test-everything:
    steps:
      - Build TypeScript (ZERO warnings allowed)
      - Run E2E test (full user flow)
      - Test API contracts
      - Build production bundle
      - Deploy ONLY if all pass
```

### 5. DEFENSIVE API DESIGN
```typescript
// APIs NEVER fail - they degrade gracefully
export async function getDilemmas(): Promise<Dilemma[]> {
  try {
    const response = await fetch('/api/dilemmas');
    if (!response.ok) throw new Error();
    const data = await response.json();
    if (!data.dilemmas || !Array.isArray(data.dilemmas)) {
      return FALLBACK_DILEMMAS; // Always have fallback
    }
    return data.dilemmas;
  } catch {
    return FALLBACK_DILEMMAS; // Never crash the user experience
  }
}
```

## THE ACTUAL ARCHITECTURE

### File Structure (Minimal, No Complexity)
```
src/
├── system/
│   ├── constants.ts          # SINGLE source of truth
│   ├── state.ts              # One state machine
│   ├── api.ts                # Bulletproof API client
│   └── storage.ts            # SSR-safe storage
├── pages/
│   ├── LandingPage.tsx       # Pure, no side effects
│   ├── ExplorePage.tsx       # Controlled by state machine
│   └── ResultsPage.tsx       # Pure rendering
├── components/
│   └── [minimal UI components]
└── tests/
    └── end-to-end.test.ts    # Tests EVERYTHING
```

### Core State Machine
```typescript
// The ONLY state management - no localStorage complexity
class ValuesAppState {
  private state: AppState = { phase: 'landing' };
  private listeners: ((state: AppState) => void)[] = [];

  // Pure state transitions
  startExploring() {
    if (this.state.phase !== 'landing') return;
    this.setState({ 
      phase: 'exploring', 
      currentIndex: 0, 
      responses: [] 
    });
  }

  addResponse(response: Response) {
    if (this.state.phase !== 'exploring') return;
    const responses = [...this.state.responses, response];
    
    if (responses.length >= SYSTEM.constants.REQUIRED_RESPONSES) {
      this.setState({ 
        phase: 'complete', 
        responses, 
        valuesGenerated: false 
      });
    } else {
      this.setState({
        ...this.state,
        currentIndex: this.state.currentIndex + 1,
        responses
      });
    }
  }

  // Persist to storage automatically
  private setState(newState: AppState) {
    this.state = newState;
    this.persistToStorage();
    this.listeners.forEach(listener => listener(newState));
  }
}

// Global singleton - no prop drilling
export const appState = new ValuesAppState();
```

### Bulletproof API Layer
```typescript
// APIs that NEVER crash the app
class BulletproofAPI {
  async getDilemmas(): Promise<Dilemma[]> {
    return this.safeCall('/api/dilemmas', FALLBACK_DILEMMAS);
  }

  async generateValues(responses: Response[]): Promise<string> {
    return this.safeCall('/api/generate-values', 
      { body: JSON.stringify({ responses }) },
      FALLBACK_VALUES_MD
    );
  }

  private async safeCall<T>(url: string, fallback: T, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn(`API ${url} failed, using fallback:`, error);
      return fallback;
    }
  }
}

export const api = new BulletproofAPI();
```

### Zero-Surprise React Components
```typescript
// Pages are PURE - no side effects, no localStorage
export function ExplorePage() {
  const state = useAppState();
  
  if (state.phase !== 'exploring') {
    return <Navigate to={getRouteForPhase(state.phase)} />;
  }

  const currentDilemma = state.dilemmas[state.currentIndex];
  
  return (
    <DilemmaCard 
      dilemma={currentDilemma}
      onResponse={(response) => appState.addResponse(response)}
      progress={state.currentIndex / SYSTEM.constants.REQUIRED_RESPONSES}
    />
  );
}
```

### End-to-End Test (The Gun-to-Head Test)
```typescript
// This test MUST pass for every deploy
test('Complete user flow works perfectly', async () => {
  // 1. Landing page loads
  await page.goto('/');
  expect(await page.textContent('h1')).toContain('values.md');
  
  // 2. Start exploring
  await page.click('[data-testid=start-exploring]');
  expect(page.url()).toContain('/explore');
  
  // 3. Answer 12 dilemmas
  for (let i = 0; i < 12; i++) {
    await page.click('[data-testid=choice-A]');
    await page.fill('[data-testid=reasoning]', `Test reasoning ${i}`);
    await page.click('[data-testid=next]');
  }
  
  // 4. Results page shows
  expect(page.url()).toContain('/results');
  
  // 5. Values.md is generated
  await page.click('[data-testid=generate-values]');
  await page.waitForSelector('[data-testid=values-markdown]');
  
  // 6. Download works
  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-testid=download]');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('values.md');
  
  // THIS TEST MUST PASS OR WE DON'T DEPLOY
});
```

## DEPLOYMENT STRATEGY

### GitHub Actions (No Deploy Unless Perfect)
```yaml
name: Gun-to-Head Deploy
on: 
  push:
    branches: [main]

jobs:
  bulletproof-test:
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      # GATE 1: TypeScript must be perfect
      - run: npm run type-check
      - run: npm run lint -- --max-warnings 0
      
      # GATE 2: Build must succeed
      - run: npm run build
      
      # GATE 3: E2E test must pass
      - run: npm run test:e2e
      
      # GATE 4: API contracts must be valid
      - run: npm run test:api-contracts
      
      # ONLY THEN deploy
      - if: success()
        run: vercel --prod --confirm
```

## WHAT THIS ELIMINATES

✅ **No more localStorage SSR errors** - State machine handles persistence
✅ **No more API route mismatches** - Single source of truth
✅ **No more TypeScript build failures** - Fail-fast development
✅ **No more production surprises** - E2E tests catch everything
✅ **No more manual deployments** - Automated gates
✅ **No more 404s** - Fallback systems everywhere
✅ **No more state management bugs** - Pure state machine
✅ **No more race conditions** - Sequential state transitions

## THE GUN-TO-HEAD GUARANTEE

This architecture would work because:

1. **Every deploy is tested end-to-end**
2. **APIs never crash the app** (fallbacks)
3. **State is predictable** (pure functions)
4. **No environment surprises** (same code path everywhere)
5. **Single source of truth** (no drift)
6. **Fail-fast development** (catch issues immediately)

If we built this, we'd NEVER have the recurring failures we keep seeing.