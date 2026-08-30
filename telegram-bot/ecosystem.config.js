module.exports = {
  apps: [{
    name: 'zen-telegram-bot',
    script: 'bot.js',
    cwd: '/www/wwwroot/zen.moeid.net/telegram-bot',
    env: {
      BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',
      WEBAPP_URL: 'https://zen.moeid.net',
      CHANNEL_USERNAME: '@zenoslife_official',
      ADMIN_IDS: '123456789'
    },
    restart_delay: 3000,
    max_restarts: 10
  }]
};