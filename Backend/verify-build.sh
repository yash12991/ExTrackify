#!/bin/bash

echo "🔍 Verifying build environment..."

# Node version check
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf node_modules package-lock.json

# Install dependencies
echo "📦 Installing dependencies..."
npm cache clean --force
npm install --production

# Verify critical modules
echo "🔍 Verifying Express installation..."
if [ -d "node_modules/express" ]; then
    echo "✅ Express module found"
    ls -la node_modules/express/lib/ | head -5
else
    echo "❌ Express module not found"
    exit 1
fi

# Check for router module specifically
echo "🔍 Checking Express router module..."
if [ -f "node_modules/express/lib/router/index.js" ]; then
    echo "✅ Express router found"
else
    echo "❌ Express router missing - reinstalling express"
    npm uninstall express
    npm install express@^4.18.2
fi

# Verify app can be imported
echo "🔍 Testing app import..."
node -e "
try {
  require('./src/app.js');
  console.log('✅ App import successful');
} catch (err) {
  console.error('❌ App import failed:', err.message);
  process.exit(1);
}
"

echo "✅ Build verification complete"
