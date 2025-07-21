#!/bin/bash

# GLOBAL DRIZZLE STUDIO LAUNCHER
# Starts Drizzle Studio with global network access for remote development

echo "🗄️  STARTING DRIZZLE STUDIO (GLOBAL ACCESS)"
echo "=========================================="

# Configuration
DRIZZLE_PORT=${DRIZZLE_PORT:-4173}
DRIZZLE_HOST="0.0.0.0"

echo "📍 Host: $DRIZZLE_HOST (globally accessible)"
echo "🔌 Port: $DRIZZLE_PORT"
echo "🔗 Access URL: http://$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP"):$DRIZZLE_PORT"
echo "🔗 Local URL: http://localhost:$DRIZZLE_PORT"
echo ""

# Check if drizzle-kit is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Check for DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    if [ -f ".env.local" ]; then
        echo "📋 Loading environment from .env.local"
        source .env.local
    else
        echo "❌ DATABASE_URL not found and no .env.local file"
        echo "Please set DATABASE_URL environment variable or create .env.local"
        exit 1
    fi
fi

echo "✅ Database URL configured"
echo "🚀 Starting Drizzle Studio..."
echo ""
echo "📖 Usage:"
echo "   - Browse tables and data in the web interface"
echo "   - Run custom queries in the SQL editor"
echo "   - View schema relationships"
echo "   - Press Ctrl+C to stop"
echo ""

# Start Drizzle Studio with global access
npx drizzle-kit studio --port "$DRIZZLE_PORT" --host "$DRIZZLE_HOST"