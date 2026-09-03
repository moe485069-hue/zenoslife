/**
 * ============================================================================
 * 🌐 ZenOsLife Unified REST API Server (Mini App Synchronization)
 * ============================================================================
 */

const http = require('http');
const { CONFIG } = require('./shared/config');
const { db, getUser } = require('./shared/db');
const { addReminder } = require('./bots/lifeos-bot/reminders');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Health check
  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'ok',
      uptime: process.uptime(),
      usersCount: Object.keys(db.users).length,
      timestamp: Date.now()
    }));
  }

  // Get User profile
  if (req.url.startsWith('/api/user/')) {
    const uid = req.url.replace('/api/user/', '').split('?')[0];
    const user = db.users[uid];
    if (user) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(user));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'User not found' }));
    }
  }

  // Create reminder from Mini App
  if (req.method === 'POST' && req.url === '/api/reminders') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        if (payload.userId && payload.title && payload.time) {
          const rem = await addReminder(payload.userId, payload.title, payload.time, payload.date);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, reminder: rem }));
        }
      } catch (_) {}
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid payload' }));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

function startServer(port = CONFIG.API_PORT) {
  server.listen(port, () => {
    console.log(`🌐 [REST API] Server listening on port ${port}`);
  });
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { server, startServer };
