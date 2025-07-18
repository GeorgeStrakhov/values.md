# VALUES.MD PROJECT PLAN

## Overview
Clean, focused implementation of the values.md generation platform with SMART goals and atomic commits to prevent regressions.

## Current State Analysis
- **Latest Working Commit**: `9d94654` - Proper localStorage-based data flow
- **Active Branch**: `stage` 
- **Core Architecture**: localStorage → results → optional research contribution
- **Database Schema**: 4 migrations with solid foundation (frameworks, motifs, dilemmas, responses)

## SMART Goals & Atomic Commits Plan

### Phase 1: Core Flow Stability (Week 1)
**Goal**: Ensure the main user flow works 100% reliably

#### Commit 1: Fix Results Page localStorage Integration
- **Issue**: Results page still reads from URL params instead of localStorage
- **Fix**: Update `/src/app/results/page.tsx` to read from localStorage 
- **Test**: Verify complete flow from landing → explore → results
- **Time**: 2 hours

#### Commit 2: Validate API Endpoints
- **Issue**: Ensure all API routes match current schema
- **Fix**: Test `/api/dilemmas`, `/api/responses`, `/api/generate-values`
- **Test**: End-to-end API flow validation
- **Time**: 3 hours

#### Commit 3: localStorage Session Management
- **Issue**: Consistent session tracking across flow
- **Fix**: Robust sessionId generation and persistence
- **Test**: Multiple sessions don't interfere
- **Time**: 2 hours

### Phase 2: Values Generation Component (Week 2)
**Goal**: Isolate and perfect the values.md generation as a black box

#### Commit 4: Extract Values Generator
- **Issue**: Values generation logic needs to be modular
- **Fix**: Create `/src/lib/values-generator.ts` with clean interface
- **Test**: Generate values with mock data
- **Time**: 4 hours

#### Commit 5: Improve Generation Quality
- **Issue**: Make values.md output more personalized
- **Fix**: Better prompts, motif analysis, structured output
- **Test**: Compare outputs for different response patterns
- **Time**: 6 hours

### Phase 3: Research Data Export (Week 3)
**Goal**: Enable researchers to download anonymized datasets

#### Commit 6: Create Research Page
- **Issue**: No research data export functionality
- **Fix**: Create `/src/app/research/page.tsx` with CSV download
- **Test**: Export works with real data
- **Time**: 4 hours

#### Commit 7: Data Export API
- **Issue**: Need `/api/research/export` endpoint
- **Fix**: Generate CSV from database with proper anonymization
- **Test**: Export all anonymized responses and demographics
- **Time**: 3 hours

### Phase 4: Regression Prevention (Week 4)
**Goal**: Prevent future regressions and mismatches

#### Commit 8: Integration Tests
- **Issue**: No automated testing of complete flow
- **Fix**: Add Playwright tests for main user journey
- **Test**: Full automation of landing → explore → results
- **Time**: 8 hours

#### Commit 9: API Schema Validation
- **Issue**: API responses can drift from expected format
- **Fix**: Add Zod schemas for all API endpoints
- **Test**: Schema validation in all routes
- **Time**: 4 hours

#### Commit 10: Database Migration Safety
- **Issue**: Schema changes can break existing code
- **Fix**: Add migration tests and rollback procedures
- **Test**: Migration safety checks
- **Time**: 3 hours

## Architecture Components

### 1. Main User Flow (Black Box)
```
Landing Page → Explore (12 dilemmas) → Results (values.md) → Optional Research
```

### 2. Values Generation Component (Replaceable Black Box)
```
Input: Response[] → Analysis Engine → Output: values.md
```

### 3. Research Data Pipeline
```
Anonymous Sessions → Database → CSV Export → Researchers
```

## Technical Requirements

### Core Stack Alignment
- **Frontend**: Next.js 15+ with TypeScript ✓
- **Database**: PostgreSQL (Neon) with Drizzle ORM ✓
- **LLM**: OpenRouter API with Claude 3.5 Sonnet ✓
- **Storage**: localStorage for privacy, DB for research ✓

### Critical Path Dependencies
1. **Database Schema**: 4 migrations must remain stable
2. **API Contract**: Response formats must not change
3. **localStorage Format**: Session data structure must persist
4. **LLM Integration**: OpenRouter API must handle failures gracefully

## Risk Management

### High Risk Items
- **LLM API Failures**: Add retry logic and fallback responses
- **Database Schema Changes**: Require migration tests
- **localStorage Clearing**: Handle graceful degradation

### Medium Risk Items
- **Session Management**: Users switching devices mid-flow
- **Performance**: Large response datasets
- **Privacy**: Ensuring anonymization is robust

## Success Metrics

### Technical Metrics
- **Reliability**: 99% success rate for complete flow
- **Performance**: < 3s response time for values generation
- **Data Quality**: 0 schema validation errors

### User Experience Metrics
- **Flow Completion**: 85% of users complete all 12 dilemmas
- **Values Download**: 90% of completers download their values.md
- **Research Contribution**: 30% opt into research contribution

## Testing Strategy

### Unit Tests
- Values generation logic
- API endpoint responses
- Database queries

### Integration Tests
- Complete user flow (Playwright)
- Database migrations
- API contract validation

### Manual Tests
- Multi-browser compatibility
- Mobile responsiveness
- Edge cases (cleared localStorage, network failures)

## Deployment Strategy

### Environment Management
- **Development**: Local with test DB
- **Staging**: Vercel preview with staging DB
- **Production**: Vercel production with prod DB

### Rollback Plan
- Git revert capability for each atomic commit
- Database migration rollback procedures
- Feature flags for major changes

## Extra Ideas Storage
Any additional features beyond MVP scope should be captured in `EXTRA_IDEAS.md` to maintain focus on core functionality.