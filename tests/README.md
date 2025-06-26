# Test Suite for Values.md

## Overview

This test suite is designed to catch the specific regressions we experienced and prevent future breakages. Each test addresses real failures that occurred in production.

## Test Structure

### 1. Critical Regression Tests (`critical-regression.test.ts`)
**Purpose**: Catch the exact user-facing bugs we experienced
**Playwright E2E tests that simulate real user interactions**

- ✅ **REGRESSION 1**: "No responses found" error
  - Completes full dilemma flow and verifies results page works
  - Checks localStorage persistence and database submission
  - **Would have caught**: Our biggest user-facing bug

- ✅ **REGRESSION 2**: Broken manual navigation after auto-advance  
  - Tests auto-advance timer coordination with manual buttons
  - Verifies URL updates work correctly in both modes
  - **Would have caught**: Navigation coordination bug

- ✅ **REGRESSION 3**: Form state restoration issues
  - Tests that previous responses are restored when navigating back
  - Verifies localStorage persistence across navigation
  - **Would have caught**: Data loss on navigation

- ✅ **REGRESSION 4**: Missing motif data from broken seed scripts
  - Verifies database contains real motif metadata, not placeholders
  - Checks that values.md contains rich psychological profiles
  - **Would have caught**: Broken seed script file paths

### 2. Store Logic Unit Tests (`store-logic.test.ts`)
**Purpose**: Test Zustand store behavior in isolation
**Vitest unit tests with mocked dependencies**

- State management correctness
- Response saving and restoration
- Navigation logic
- Auto-advance timer coordination
- Edge case handling

### 3. Database Pipeline Tests (`database-pipeline.test.ts`)  
**Purpose**: Test data flow from responses to values generation
**Integration tests with real database operations**

- API endpoint functionality
- Database query correctness
- Motif extraction logic
- Framework alignment calculations
- Error handling for invalid data

## Test Data & Utilities

### `test-data.ts`
- Factory functions for consistent test data
- Matches real database schema
- Provides realistic dilemma/motif/framework examples

### `test-utils.ts`
- Helper functions for database setup/teardown
- Browser testing utilities
- API testing helpers
- Mock store creation

## Running Tests

```bash
# Run all tests
npm run test:all

# Run unit tests only
npm run test:run

# Run E2E tests only  
npm run test:e2e

# Run tests with UI
npm run test:ui
npm run test:e2e-ui

# Run specific test file
npx vitest store-logic.test.ts
npx playwright test critical-regression.test.ts
```

## Test Philosophy

### What We Test
1. **Real User Journeys**: Complete flows from start to finish
2. **Data Pipeline Integrity**: Responses → Database → Values generation
3. **Error Recovery**: Graceful handling of edge cases
4. **Regression Prevention**: Specific bugs that occurred

### What We Don't Test
1. **UI Styling**: Focus on functionality, not appearance
2. **API Contracts Only**: Test actual behavior, not just HTTP responses
3. **Implementation Details**: Test outcomes, not internal mechanics

## Coverage Goals

- **Critical User Flows**: 100% (must catch user-facing failures)
- **Data Pipeline**: 95% (must catch "No responses found" errors)
- **Store Logic**: 90% (must catch navigation bugs)
- **Error Handling**: 85% (must handle edge cases gracefully)

## Test-Driven Development

When adding new features:

1. **Write failing E2E test first** - What should the user experience be?
2. **Write failing unit tests** - What components need to work?
3. **Implement feature** - Make tests pass
4. **Add edge case tests** - Handle error conditions

When fixing bugs:

1. **Write test that reproduces the bug** - Confirm it fails
2. **Fix the bug** - Make test pass
3. **Add related edge cases** - Prevent similar bugs

## Test Environment Setup

Tests require:
- Test database with seeded motif/framework data
- Mock timers for auto-advance testing
- Browser automation for E2E flows
- Network mocking for API reliability testing

## Performance Targets

- E2E test suite: < 2 minutes total
- Unit test suite: < 30 seconds total  
- Database tests: < 1 minute total
- Individual test: < 10 seconds max

## Maintenance

Review and update tests when:
- User interface changes significantly
- Database schema changes
- New features add user flows
- Bugs are discovered in production

**Key Principle**: Every production bug should become a test case to prevent regression.