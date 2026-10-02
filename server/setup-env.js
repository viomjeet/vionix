const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const content = [
    'DATABASE_URL="file:./dev.db"',
    'JWT_SECRET="vionix_super_secret_jwt_key_2026_xyz!"',
    'PORT=5000',
    'NODE_ENV=production',
    '',
  ].join('\n');
 fs.writeFileSync(envPath, content, 'utf8');
 console.log('[setup-env] Created fallback .env for deployment');
}
