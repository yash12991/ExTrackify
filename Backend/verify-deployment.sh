#!/bin/bash

# verify-deployment.sh - Check if deployment is ready

echo "🔍 Verifying deployment environment..."

# Check Node.js version
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Check if critical modules exist
echo "Checking critical modules..."

if [ -d "node_modules/express" ]; then
    echo "✅ Express found"
    if [ -f "node_modules/express/lib/router/index.js" ]; then
        echo "✅ Express router found"
    else
        echo "❌ Express router missing"
        exit 1
    fi
else
    echo "❌ Express not found"
    exit 1
fi

if [ -d "node_modules/debug" ]; then
    echo "✅ Debug module found"
else
    echo "❌ Debug module missing"
    exit 1
fi

if [ -d "node_modules/mongoose" ]; then
    echo "✅ Mongoose found"
else
    echo "❌ Mongoose missing"
    exit 1
fi

echo "✅ All critical modules verified"
echo "🚀 Deployment verification passed!"
