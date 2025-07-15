#!/bin/bash

# startup.sh - Robust startup script for Render deployment

echo "🚀 Starting Express Tracker Backend..."
echo "📊 Environment: $NODE_ENV"
echo "🌍 Node.js version: $(node --version)"
echo "📦 npm version: $(npm --version)"

# Function to check if a module exists
check_module() {
    local module_name=$1
    if npm list "$module_name" > /dev/null 2>&1; then
        echo "✅ $module_name is installed"
        return 0
    else
        echo "❌ $module_name is missing"
        return 1
    fi
}

# Verify critical dependencies
echo "🔍 Verifying dependencies..."
if ! check_module "express" || ! check_module "mongoose" || ! check_module "debug"; then
    echo "⚠️  Critical dependencies missing. Attempting to reinstall..."
    
    # Clean install
    rm -rf node_modules package-lock.json
    npm cache clean --force
    npm ci
    
    # Verify again
    if ! check_module "express" || ! check_module "mongoose" || ! check_module "debug"; then
        echo "❌ Dependency installation failed. Cannot start server."
        exit 1
    fi
fi

echo "✅ All dependencies verified"

# Check if Express router exists specifically
echo "🔍 Checking Express router module..."
if [ ! -f "node_modules/express/lib/router/index.js" ]; then
    echo "❌ Express router module is missing or corrupted"
    echo "🛠️  Attempting to fix Express installation..."
    npm install express@4.21.2 --force
fi

echo "🚀 Starting server..."
exec node ./src/server.js
