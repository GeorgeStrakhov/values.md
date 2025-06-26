# Values.md - Project Overview

## 🎯 Vision
Research platform for exploring personal values through ethical dilemmas to generate personalized "values.md" files for LLM alignment.

## 📊 Project Levels of Detail

### Level 1: Executive Summary (30 seconds)
**What**: Ethical dilemma → Personal values profile → LLM alignment file  
**Why**: Help users understand their values and align AI systems accordingly  
**Status**: Working app with navigation fix, clean rebuild complete  

### Level 2: Technical Architecture (5 minutes)
- **Frontend**: Next.js 15 + TypeScript + Zustand state management
- **Backend**: PostgreSQL + Drizzle ORM + OpenRouter API
- **Data Flow**: CSV seed data → Database → User responses → AI analysis → values.md
- **Key Pages**: Landing → Dilemmas → Results → Admin

### Level 3: Implementation Details (30 minutes)
- See `/docs/TECHNICAL_DEEP_DIVE.md`
- Database schema, API endpoints, component structure
- State management patterns, data persistence strategy

### Level 4: Development Lifecycle (Complete understanding)
- See `/docs/DEVELOPMENT_LIFECYCLE.md`
- CI/CD pipeline, testing strategy, deployment process
- Data synchronization, experiment management

## 🔄 Core Development Loop

```
Code Changes → Tests → Build → Deploy → Data Sync → Validation
     ↑                                                      ↓
     ←―――――――――――― Feedback & Iteration ←――――――――――――――――――
```

## 📁 Documentation Structure

- `PROJECT_OVERVIEW.md` - This file (all levels)
- `TECHNICAL_DEEP_DIVE.md` - Architecture & implementation  
- `DEVELOPMENT_LIFECYCLE.md` - CI/CD, testing, deployment
- `DATA_PIPELINE.md` - CSV → DB → App → Experiments
- `API_REFERENCE.md` - Endpoint documentation
- `DEPLOYMENT_GUIDE.md` - Production setup

## 🚀 Quick Start
1. `npm install` - Install dependencies
2. `npm run db:seed` - Initialize database with CSV data
3. `npm run dev` - Start development server
4. `npm run test` - Run test suite
5. `npm run build` - Production build