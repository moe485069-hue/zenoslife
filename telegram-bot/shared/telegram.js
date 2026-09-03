/**
 * ============================================================================
 * 👑 ZenOsLife Shared Telegram API Client & Polling Engine
 * ============================================================================
 */

const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false, keepAlive: true });

function callTgApi(botToken, method, payload = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/${method}`,
      method: 'POST',
      agent: httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.ok) {
            resolve(parsed.result);
          } else {
            reject(new Error(parsed.description || 'Telegram API Error'));
          }
        } catch (err) {
          reject(new Error('Invalid JSON response: ' + body.slice(0, 100)));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.setTimeout(35000, () => {
      req.destroy();
      reject(new Error('Telegram API Request Timeout'));
    });
    req.write(data);
    req.end();
  });
}

class TelegramBotRunner {
  constructor(name, token, handlers) {
    this.name = name;
    this.token = token;
    this.handlers = handlers; // { onMessage, onCallback, onPayment, onPreCheckout }
    this.lastUpdateId = 0;
    this.isRunning = false;
    this.info = null;
  }

  async init(options = {}) {
    try {
      try {
        await callTgApi(this.token, 'deleteWebhook', { drop_pending_updates: false });
      } catch (_) {}

      this.info = await callTgApi(this.token, 'getMe');
      console.log(`🤖 [${this.name}] Connected: @${this.info.username} (${this.info.first_name})`);

      if (options.menuButton) {
        await callTgApi(this.token, 'setChatMenuButton', {
          menu_button: {
            type: 'web_app',
            text: options.menuButton.text,
            web_app: { url: options.menuButton.url }
          }
        }).catch(err => console.warn(`[${this.name}] menuButton notice:`, err.message));
      }

      if (options.commands) {
        await callTgApi(this.token, 'setMyCommands', {
          commands: options.commands
        }).catch(err => console.warn(`[${this.name}] commands notice:`, err.message));
      }

      return this.info;
    } catch (err) {
      console.error(`❌ [${this.name}] Init Error:`, err.message);
      throw err;
    }
  }

  async startPolling() {
    this.isRunning = true;
    console.log(`🚀 [${this.name}] Polling updates...`);
    this.pollLoop();
  }

  async pollLoop() {
    if (!this.isRunning) return;
    try {
      const updates = await callTgApi(this.token, 'getUpdates', {
        offset: this.lastUpdateId + 1,
        timeout: 20
      });

      for (const update of updates) {
        this.lastUpdateId = update.update_id;
        try {
          if (update.message) {
            if (update.message.successful_payment && this.handlers.onPayment) {
              await this.handlers.onPayment(update.message);
            } else if (this.handlers.onMessage) {
              await this.handlers.onMessage(update.message);
            }
          } else if (update.callback_query && this.handlers.onCallback) {
            await this.handlers.onCallback(update.callback_query);
          } else if (update.pre_checkout_query && this.handlers.onPreCheckout) {
            await this.handlers.onPreCheckout(update.pre_checkout_query);
          }
        } catch (handlerErr) {
          console.error(`⚠️ [${this.name}] Update dispatch error:`, handlerErr.message);
        }
      }
    } catch (err) {
      if (!err.message?.includes('ETIMEDOUT') && !err.message?.includes('socket hang up')) {
        console.warn(`[${this.name}] Polling warning:`, err.message);
      }
      await new Promise(r => setTimeout(r, 2000));
    }
    setImmediate(() => this.pollLoop());
  }

  stop() {
    this.isRunning = false;
  }

  // Quick API shortcut
  api(method, payload = {}) {
    return callTgApi(this.token, method, payload);
  }
}

async function isUserChannelMember(botToken, channelUsername, userId) {
  try {
    const res = await callTgApi(botToken, 'getChatMember', {
      chat_id: channelUsername,
      user_id: userId
    });
    return ['creator', 'administrator', 'member', 'restricted'].includes(res.status);
  } catch (err) {
    return true; // fail-open if channel cannot be queried
  }
}

module.exports = {
  callTgApi,
  TelegramBotRunner,
  isUserChannelMember
};
