# 🔐 Authentication Setup Guide

## Current Issue: "Invalid Credentials"

The login fails because:
1. **No `.env` file exists** (only `.env.example`)
2. **Database tables not created**
3. **Admin user not seeded**

## 🚀 Quick Fix (Choose One)

### Option A: Full Database Setup (Recommended)

```bash
# 1. Create environment file
cp .env.example .env

# 2. Edit .env with your database URL
# You need a PostgreSQL database (Neon, Railway, local, etc.)
nano .env  # or code .env

# Required in .env:
# DATABASE_URL="postgresql://user:pass@host:port/dbname"
# NEXTAUTH_SECRET="any-random-string-32-chars"

# 3. Set up database and admin user
npm run setup
```

### Option B: Quick Local Testing (If you have DATABASE_URL)

```bash
# 1. Create .env with your database URL
echo 'DATABASE_URL="your_postgresql_url_here"' > .env
echo 'NEXTAUTH_SECRET="super-secret-key-for-development"' >> .env

# 2. Create tables and admin user
npm run db:push
npm run seed:admin

# 3. Start app
npm run dev
```

## 🔑 Login Credentials (After Setup)

```
Email: admin@values.md
Password: hohoho
```

**Note**: Password comes from `scripts/seed-admin.ts` - you can change it by setting `ADMIN_PASSWORD` environment variable.

## 🗄️ Database Options

### Neon (Free PostgreSQL)
1. Go to https://neon.tech
2. Create free account & database
3. Copy connection string to `.env`

### Railway (Free PostgreSQL)
1. Go to https://railway.app  
2. Create PostgreSQL service
3. Copy connection string to `.env`

### Local PostgreSQL
```bash
# If you have PostgreSQL locally
DATABASE_URL="postgresql://localhost:5432/values_md"
```

## ⚠️ Troubleshooting

### "Invalid credentials" after setup
```bash
# Check if admin user exists
npm run db:studio  # Opens database browser

# Re-create admin user
npm run seed:admin
```

### "DATABASE_URL is not set"
```bash
# Verify .env file exists and has DATABASE_URL
cat .env
```

### Build fails
```bash
# Make sure environment is set up first
npm run setup
npm run dev  # Don't run build without DATABASE_URL
```

## 🎯 Verification

Once setup is complete:
1. Go to http://localhost:3000/admin
2. Login with `admin@values.md` / `hohoho`
3. You should see the admin dashboard

That's it! The credentials I mentioned are hardcoded in the seeding script, but the database needs to be set up first.