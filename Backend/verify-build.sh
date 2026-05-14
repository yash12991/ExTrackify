#!/bin/bash

echo "Verifying build environment..."

# Node version check
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Verify critical modules
echo "Verifying Express installation..."
if [ -d "node_modules/express" ]; then
    echo "Express module found"
else
    echo "Express module not found"
    exit 1
fi

# Verify app can be imported (ESM compatible check)
echo "Testing app import..."
node --input-type=module -e "
import('./src/app.js').then(() => {
  console.log('App import successful');
}).catch((err) => {
  console.error('App import failed:', err.message);
  process.exit(1);
});
"

echo "Build verification complete"
