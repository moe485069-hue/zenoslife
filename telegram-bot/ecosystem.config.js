/**
 * ============================================================================
 * 👑 ZenOsLife PM2 Ecosystem Orchestrator
 * Runs all 3 specialized bots + the unified REST API server concurrently
 * ============================================================================
 */

module.exports = {
  apps: [
    {
      name: 'zen-api-server',
      script: 'server.js',
      cwd: __dirname,
      restart_delay: 2000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'zen-bot-games', // چاژا (@chazha_bot)
      script: 'bots/games-bot/index.js',
      cwd: __dirname,
      restart_delay: 3000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'zen-bot-dating', // حُذا (@whoza_bot)
      script: 'bots/dating-bot/index.js',
      cwd: __dirname,
      restart_delay: 3000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'zen-bot-lifeos', // زنوسلایف (@zenosaaa_bot)
      script: 'bots/lifeos-bot/index.js',
      cwd: __dirname,
      restart_delay: 3000,
      max_restarts: 10,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
