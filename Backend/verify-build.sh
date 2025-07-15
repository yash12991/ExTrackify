#!/bin/bash

# Dependency issues fix script for Render deployment

echo "🔧 Starting build verification..."
echo "📍 Working directory: $(pwd)"
echo "🌍 Node.js version: $(node --version)"
echo "📦 npm version: $(npm --version)"

# Remove any existing problematic installations
echo "🧹 Cleaning previous installations..."
rm -rf node_modules package-lock.json
npm cache clean --force

# Install with specific flags to prevent corruption
echo "📦 Installing dependencies..."
npm ci --prefer-offline --no-audit --omit=dev

# Verify critical modules exist and are loadable
echo "🔍 Verifying critical modules..."
node -e "
try {
  require('express');
  require('mongoose');
  require('debug');
  require('express/lib/router');
  console.log('✅ All critical modules loaded successfully');
} catch (error) {
  console.error('❌ Module loading failed:', error.message);
  console.error('📍 Stack:', error.stack);
  process.exit(1);
}
"

# Check specific Express router file exists
if [ ! -f "node_modules/express/lib/router/index.js" ]; then
    echo "❌ Express router module missing - reinstalling express"
    npm install express@4.21.2 --save --prefer-offline
fi

# Check specific debug file exists
if [ ! -f "node_modules/debug/src/node.js" ]; then
    echo "❌ Debug module corrupted - reinstalling debug"
    npm install debug@4.3.4 --save --prefer-offline
fi

echo "✅ Build verification complete"
