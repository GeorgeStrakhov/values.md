# Development Lifecycle - CI/CD & Data Synchronization

## 🔄 Core Development Loop

### The Harmonized Cycle
```
1. CODE CHANGE → 2. AUTOMATED TESTS → 3. DATA SYNC → 4. BUILD → 5. DEPLOY → 6. VALIDATE
     ↑                                                                           ↓
     ←――――――――――――――――――――― FEEDBACK & ITERATION ←―――――――――――――――――――――――――――
```

### Pipeline Stages

#### Stage 1: 🧪 **Code Quality & Testing**
```bash
# Triggered on: push to main/develop, pull requests
npm run lint              # ESLint code quality
npm run typecheck         # TypeScript validation
npm run test:unit         # Core logic tests (store, navigation)
npm run build            # Production build verification
```

#### Stage 2: 🗄️ **Database Integration**
```bash
# PostgreSQL service container
npm run db:migrate        # Schema migrations
npm run db:seed          # Test data population
npm run test:integration # Database pipeline tests
npm run data:sync        # CSV → Database synchronization
```

#### Stage 3: 📊 **Data Pipeline Validation**
```bash
npm run validate:csv      # CSV file integrity
npm run validate:motifs   # Motif-framework relationships
npm run validate:templates # Values.md template validation
npm run data:validate     # Complete data consistency check
```

#### Stage 4: 🎭 **End-to-End Testing**
```bash
npm run test:e2e         # Critical user flows
npm run validate:critical-flows # Navigation regression prevention
```

#### Stage 5: 🚀 **Deployment**
```bash
# Production deployment (main branch only)
- Deploy to Vercel
- Database schema migration
- Production data synchronization
- Health check validation
```

#### Stage 6: ✅ **Post-Deploy Validation**
```bash
npm run health-check:production    # API endpoints
npm run benchmark:lighthouse       # Performance metrics
npm run validate:critical-flows    # End-to-end flows
```

## 🔧 Data Synchronization System

### Overview
Ensures CSV data, database records, and application code stay in perfect sync across all environments.

### Data Flow Architecture
```
CSV Files (striated/) → Database Tables → Application Logic → User Responses → Values.md Generation
      ↓                     ↓                ↓                    ↓              ↓
   Git tracked         Migrations       State mgmt        localStorage      AI analysis
   Source of truth     Auto-applied     Zustand store     + Database        OpenRouter
```

### Sync Process (`scripts/data-sync.ts`)

#### 1. **CSV Validation**
- Verify required files exist: `frameworks.csv`, `motifs.csv`, `dilemmas.csv`
- Validate column structure and data integrity
- Check for missing required fields

#### 2. **Database Schema Check**
- Confirm all required tables exist
- Validate foreign key relationships
- Ensure migration compatibility

#### 3. **Intelligent Data Updates**
- Compare CSV data with database records
- Update only changed records (not full replacement)
- Preserve user-generated data (responses, sessions)
- Log all changes for audit trail

#### 4. **Relationship Validation**
- Verify motif → framework connections
- Check dilemma → motif mappings
- Validate choice indicators consistency

#### 5. **Metadata Updates**
- Record sync timestamp and version
- Store git commit hash for traceability
- Generate integrity report

### Development Commands

#### Local Development
```bash
npm run dev              # Start dev server with hot reload
npm run data:sync        # Sync latest CSV data to local DB
npm run db:studio       # Visual database browser
npm run test            # Run all tests with file watching
```

#### Data Management
```bash
npm run data:validate   # Check CSV integrity without changes
npm run data:sync       # Full synchronization
npm run seed:db         # Fresh database seed from CSV
npm run db:migrate      # Apply schema changes
```

#### Testing & Validation
```bash
npm run test:unit       # Fast unit tests (store, components)
npm run test:integration # Database + API tests
npm run test:e2e        # Full user journey tests
npm run test:all        # Complete test suite
```

#### Deployment
```bash
npm run validate        # Pre-deployment checks
npm run build          # Production build
git push origin main   # Triggers CI/CD pipeline
```

## 🎯 Key Integrations

### 1. **Code ↔ Database Sync**
- Drizzle ORM with type-safe migrations
- CSV files as single source of truth
- Automatic schema validation

### 2. **State ↔ Persistence Sync**
- Zustand store with localStorage backup
- Database persistence for completed responses
- Session recovery and progress tracking

### 3. **Development ↔ Production Sync**
- Environment-specific configurations
- Production database migration safety
- Health checks before and after deployment

### 4. **Data ↔ Application Sync**
- CSV motifs mapped to UI choices
- Dynamic values.md template system
- Real-time experiment configuration

## 🔍 Monitoring & Validation

### Automated Checks
- **Build Health**: TypeScript, linting, test passage
- **Data Integrity**: CSV consistency, database relationships
- **Performance**: Lighthouse scores, API response times
- **Functionality**: Critical user flows, navigation regression

### Manual Verification Points
- **Before Major Releases**: Full test suite + manual testing
- **CSV Data Updates**: Validate motif mappings and framework connections
- **Schema Changes**: Test migration rollback procedures
- **Production Issues**: Health check diagnostics and rollback capability

### Success Metrics
- ✅ Zero navigation regressions (progress indicators work)
- ✅ Zero "No responses found" errors
- ✅ 100% CSV → Database sync accuracy
- ✅ < 2 second build times for incremental changes
- ✅ < 30 second full pipeline execution

This system ensures that every change—whether to code, data, or configuration—is validated, tested, and deployed with confidence while maintaining perfect synchronization between all components.