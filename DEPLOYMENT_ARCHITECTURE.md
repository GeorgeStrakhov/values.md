# VALUES.MD Deployment Architecture

## Environment Separation & Clear Deployment Paths

### 🖥️ Local Development Environment
- **Base URL**: `http://localhost:3000` (or available port)
- **Environment**: `NODE_ENV=development`
- **Configuration**: `.env.local` file (gitignored)
- **Database**: Neon PostgreSQL (development credentials)
- **Purpose**: Development, testing, debugging
- **Deployment**: `./deploy-wizard.sh` → option 1

### 🌐 Production Environment (values.md)
- **Base URL**: `https://values.md`
- **Environment**: `NODE_ENV=production`, `VERCEL_ENV=production`
- **Configuration**: Vercel environment variables
- **Database**: Neon PostgreSQL (production credentials)
- **Deployment**: `./deploy-wizard.sh` → option 2 → push to GitHub → auto-deploy

## 🔄 Service Integration Flow

```
Developer Machine (local development)
    ↓ (git push main branch)
GitHub Repository (georgestrakhov/values.md)
    ↓ (webhook triggers auto-deployment)
Vercel Deployment Platform
    ↓ (builds & deploys with environment variables)
Cloudflare DNS (values.md domain)
    ↓ (routes traffic to Vercel)
Live Production Site (https://values.md)
    ↓ (connects securely to)
Neon PostgreSQL Database
    ↓ (authenticates via connection string)
OpenRouter API (LLM services)
```

## 🏢 Service Responsibilities

### **GitHub** (`github.com/GeorgeStrakhov/values.md`)
- **Role**: Source code repository
- **Triggers**: Auto-deployment on push to main branch
- **Secrets**: Should NOT contain any credentials (public repo)
- **Access**: Code versioning, branch management

### **Vercel** (`values-md.vercel.app` → `values.md`)
- **Role**: Hosting and serverless deployment platform
- **Features**: 
  - Auto-deploys from GitHub main branch
  - Manages environment variables securely
  - Provides serverless functions for API routes
  - CDN and global distribution
- **Domain**: Custom domain `values.md` points to Vercel
- **Environment Variables**: Stores all secrets securely

### **Cloudflare** (DNS for `values.md`)
- **Role**: DNS provider and domain management
- **Configuration**: Points `values.md` to Vercel servers
- **Features**: SSL/TLS, caching, security features
- **Access**: Domain administration

### **Neon** (`ep-lingering-river-a8yzbmfc-pooler.eastus2.azure.neon.tech`)
- **Role**: PostgreSQL database hosting
- **Features**: 
  - Serverless PostgreSQL
  - Connection pooling
  - Automatic scaling
- **Region**: East US 2 (Azure)
- **Access**: Via DATABASE_URL connection string

### **OpenRouter** (`openrouter.ai`)
- **Role**: LLM API gateway
- **Features**: Access to multiple AI models (Claude, GPT-4, etc.)
- **Usage**: VALUES.md generation, chat functionality
- **Access**: Via API key authentication

## 🔐 Credential Management & Environment Variables

### Required Environment Variables
```bash
# Database Connection
DATABASE_URL="postgresql://valuesmd_owner:npg_...@ep-lingering-river-a8yzbmfc-pooler.eastus2.azure.neon.tech/valuesmd?sslmode=require"

# LLM API Access
OPENROUTER_API_KEY="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"

# Authentication (Production Only)
NEXTAUTH_SECRET="random-secret-for-session-signing"
NEXTAUTH_URL="https://values.md"

# Optional Overrides
SITE_URL="http://localhost:3000"  # Local development override
```

### 🔐 Credential Storage Locations

#### Local Development
- **File**: `.env.local` (gitignored)
- **Location**: Project root directory
- **Security**: Never committed to git
- **Usage**: Automatic detection by Next.js

#### Production
- **Storage**: Vercel Environment Variables
- **Access**: Vercel Dashboard → Project Settings → Environment Variables
- **Security**: Encrypted at rest, injected at build/runtime
- **Usage**: Automatic injection by Vercel

### 🚨 Security Model

- ✅ **GitHub**: Public repository, NO secrets ever committed
- ✅ **Vercel**: Encrypted environment variable storage
- ✅ **Local**: `.env.local` file (gitignored)
- ✅ **Environment-Aware**: App automatically detects local vs production
- ❌ **Never commit**: Any credentials to version control

## 🔄 Environment-Aware URL Handling

All hardcoded URLs have been replaced with environment-aware configuration:

```typescript
// src/lib/config.ts
export const getBaseUrl = (): string => {
  // Production domain
  if (host === 'values.md') return 'https://values.md';
  
  // Local development
  if (host.includes('localhost')) return `${protocol}//${host}`;
  
  // Vercel preview deployments
  if (host.includes('vercel.app')) return `${protocol}//${host}`;
  
  return 'http://localhost:3000'; // fallback
};
```

This ensures:
- ✅ Local builds use `http://localhost:3000`
- ✅ Production builds use `https://values.md`
- ✅ Preview deployments use correct Vercel URLs
- ✅ No wrong FQDN paths in any environment