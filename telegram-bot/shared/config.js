/**
 * ============================================================================
 * 👑 ZenOsLife Shared Configuration Engine
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// Zero-dependency .env loader
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#') && line.includes('=')) {
          const idx = line.indexOf('=');
          const key = line.slice(0, idx).trim();
          const val = line.slice(idx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    } catch (_) {}
  }
}

loadEnv();

const HARDCODED_ADMINS = ['7517486185', '8887477989', '123456789'];

const CONFIG = {
  // Bot Tokens
  BOT_TOKEN_GAMES: process.env.BOT_TOKEN_GAMES || '8434479283:AAGEy60kwodfI72GDWTLSsgWGpjzrybCvUc',
  BOT_TOKEN_DATING: process.env.BOT_TOKEN_DATING || '8997736176:AAFoPDjjOL5xY-bvtnacIzZCsINDzJdW1X4',
  BOT_TOKEN_LIFEOS: process.env.BOT_TOKEN_LIFEOS || process.env.BOT_TOKEN || '8887477989:AAEj6gnWZvmhm2jFdjRzJAI3fwVtVptZrd4',

  // Mini App & Web Server
  WEBAPP_URL: process.env.WEBAPP_URL || 'https://zen.moeid.net',
  API_PORT: parseInt(process.env.PORT || process.env.API_PORT || '3001', 10),
  
  // Channels & Administration
  CHANNEL_USERNAME: process.env.CHANNEL_USERNAME || '@zenoslife_official',
  DATA_FILE: path.resolve(__dirname, '../bot_database.json'),
  BACKUP_DIR: path.resolve(__dirname, '../backups'),
  RATE_LIMIT_MS: 400
};

function isAdmin(userId) {
  const uid = String(userId).trim();
  if (HARDCODED_ADMINS.includes(uid)) return true;
  const envList = (process.env.ADMIN_IDS || '').split(',').map(s => s.trim());
  return envList.includes(uid);
}

module.exports = {
  CONFIG,
  isAdmin
};
