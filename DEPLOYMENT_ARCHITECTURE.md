# Values.md Deployment Architecture

## 🔄 Service Integration Flow

```
GitHub Repository (georgestrakhov/values.md)
    ↓ (git push triggers)
Vercel Deployment Platform
    ↓ (reads environment variables)
Cloudflare DNS (values.md domain)
    ↓ (connects to)
Neon PostgreSQL Database
    ↓ (authenticates via)
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

## 🔐 Credential Flow

1. **Development**: `.env` file (local only, gitignored)
2. **Production**: Vercel environment variables
3. **Database**: Neon connection string with auth
4. **APIs**: OpenRouter API key for LLM access
5. **Auth**: NextAuth secret for session management

## 🚨 Security Model

- **GitHub**: Public repository, NO secrets
- **Vercel**: Encrypted environment variable storage
- **Local**: `.env` file (must be gitignored)
- **Never commit**: Any credentials to version control