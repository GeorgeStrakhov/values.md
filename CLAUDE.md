# Claude Technical Architecture - Values.md

<master-instruction>
## VERY IMPORTANT!!!!
I tend to have too many ideas and my head spins a bit. Keep me honest to the PLAN.md file. Look at it first.
If I'm proposing a feature that is not there - tell me to reconsider.
We need to stick to the plan so that we actually ship this before making it too complicated.
If you or I have extra ideas that are interesting but don't fit to the MVP plan as per PLAN.md - simply capture them in EXTRA_IDEAS.md and move on.
</master-instruction>

## Project Overview
Research platform for exploring personal values through ethical dilemmas to generate personalized "values.md" files for LLM alignment.

## Technical Stack
- **Frontend**: Next.js 15+ with TypeScript
- **Database**: PostgreSQL (Neon Cloud) with Drizzle ORM
- **LLM Services**: OpenRouter API
- **Authentication**: NextAuth.js with JWT sessions for admin
- **State Management**: Zustand with localStorage persistence
- **UI Components**: shadcn/ui with Tailwind CSS v4
- **Storage**: Local storage for privacy (user responses)
- **Deployment**: TBD

## Tailwind CSS Notes
- WE ARE USING TAILWIND v4

## Directory Structure
```
/Users/gs/dev/values.md/
├── CLAUDE.md
├── README.md
├── components.json
├── content/
│   ├── blog/
│   │   └── hello-world.mdx
│   └── docs/
│       └── getting-started.mdx
├── drizzle.config.ts
├── drizzle/
│   ├── 0000_bent_microbe.sql
│   ├── 0001_minor_iron_monger.sql
│   ├── 0002_complete_major_mapleleaf.sql
│   ├── 0003_bright_moira_mactaggert.sql
│   ├── 0004_public_magik.sql
│   └── meta/
│       ├── 0000_snapshot.json
│       ├── 0001_snapshot.json
│       ├── 0002_snapshot.json
│       ├── 0003_snapshot.json
│       ├── 0004_snapshot.json
│       └── _journal.json
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public/
├── scripts/
│   ├── cleanup-db.ts
│   ├── reset-schema.ts
│   ├── seed-admin.ts
│   ├── seed-db.ts
│   └── update-admin-password.ts
├── src/
│   ├── app/
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── change-password/
│   │   │   │   │   └── route.ts
│   │   │   │   └── generate-dilemma/
│   │   │   │       └── route.ts
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── dilemmas/
│   │   │   │   ├── [uuid]/
│   │   │   │   │   └── route.ts
│   │   │   │   └── random/
│   │   │   │       └── route.ts
│   │   │   ├── generate-values/
│   │   │   │   └── route.ts
│   │   │   └── responses/
│   │   │       └── route.ts
│   │   ├── blog/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── docs/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── explore/
│   │   │   └── [uuid]/
│   │   │       └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── research/
│   │   │   └── page.tsx
│   │   └── results/
│   │       └── page.tsx
│   ├── components/
│   │   ├── auth-provider.tsx
│   │   ├── header.tsx
│   │   ├── mdx.tsx
│   │   ├── mode-toggle.tsx
│   │   ├── progress-bar.tsx
│   │   ├── progress-context.tsx
│   │   ├── theme-provider.tsx
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── progress.tsx
│   │       ├── sheet.tsx
│   │       ├── slider.tsx
│   │       └── textarea.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── mdx.ts
│   │   ├── openrouter.ts
│   │   ├── schema.ts
│   │   └── utils.ts
│   ├── store/
│   │   └── dilemma-store.ts
│   └── types/
│       └── next-auth.d.ts
└── tsconfig.json
```

## Project Structure & Architecture

### Core User Flow
1. **Landing** (`/`) → **Start Exploring** → Random dilemma via `/api/dilemmas/random`
2. **Dilemma Sequence** (`/explore/[uuid]`) → 12 ethical dilemmas with A/B/C/D choices + difficulty rating + reasoning
3. **Results** (`/results`) → AI analyzes responses → generates personalized values.md file
4. **Optional Research** → Anonymous data contribution

### Key Pages & Components
- **Main Pages**: `/`, `/explore/[uuid]`, `/results`, `/admin`, `/about`, `/research`
- **API Routes**: 
  - `/api/dilemmas/random` & `/api/dilemmas/[uuid]` - dilemma management
  - `/api/generate-values` - values.md generation
  - `/api/admin/generate-dilemma` & `/api/admin/change-password` - admin functions
  - `/api/responses` - research data collection
- **State**: Zustand store (`/src/store/dilemma-store.ts`) with localStorage persistence
- **UI**: shadcn/ui components in `/src/components/ui/`

### Database Schema (`/src/lib/schema.ts`)
- **Ethical Framework**: `frameworks`, `motifs`, `dilemmas` (UUID-based)
- **User Data**: `userResponses`, `userDemographics`, `llmResponses` (privacy-focused, anonymous)
- **Auth**: NextAuth tables (`users`, `accounts`, `sessions`, `verificationTokens`)

### Authentication & Security
- **Admin-only access** via NextAuth.js with bcrypt passwords
- **Privacy-first**: User responses in localStorage until explicitly shared
- **Anonymous data**: Session IDs, no personal info required

### LLM Integration
- **OpenRouter API** (`/src/lib/openrouter.ts`) with Claude 3.5 Sonnet for dilemma generation
- **Structured prompts** for consistent ethical scenario quality
- **Baseline LLM responses** stored for comparison analysis

### Scripts & Utilities
- `/scripts/` - Database management (seed, cleanup, admin password updates)
- `/drizzle/` - Database migrations and schema snapshots
- Content management via MDX for blog/docs