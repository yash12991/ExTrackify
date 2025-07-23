#!/bin/bash

echo "🚀 Starting application with error handling..."

# Function to check if Express is properly installed
check_express() {
    if [ ! -d "node_modules/express/lib" ]; then
        echo "❌ Express not properly installed, reinstalling..."
        npm uninstall express
        npm install express@^4.18.2
    fi
    
    if [ ! -f "node_modules/express/lib/router/index.js" ]; then
        echo "❌ Express router missing, fixing installation..."
        rm -rf node_modules/express
        npm install express@^4.18.2
    fi
}

# Check and fix Express installation
check_express

# Try to start the application
echo "🎯 Starting server..."
node src/server.js
