# Dependency issues fix script for Render deployment

# Clean install
npm ci --prefer-offline --no-audit

# Verify critical modules
node -e "
try {
  require('express');
  require('mongoose');
  require('debug');
  console.log('✓ All critical modules loaded successfully');
} catch (error) {
  console.error('✗ Module loading failed:', error.message);
  process.exit(1);
}
"

echo "Build verification complete"
