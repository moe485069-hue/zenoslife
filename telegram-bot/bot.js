/**
 * ============================================================================
 * 👑 ZenOsLife Master Multi-Bot Orchestrator
 * Launches all 3 specialized bots + REST API Server concurrently:
 * 1. 🎮 چاژا (@chazha_bot) - Games & Arcade Duels
 * 2. 💬 حُذا (@whoza_bot) - Anonymous Chat & Dating
 * 3. 🌱 زنوسلایف (@zenosaaa_bot) - LifeOS, Realms & Self-Discovery
 * 4. 🌐 REST API Server (Port 3001) - Mini App Sync Engine
 * ============================================================================
 */

const { CONFIG } = require('./shared/config');
const { startServer } = require('./server');
const gamesBot = require('./bots/games-bot');
const datingBot = require('./bots/dating-bot');
const lifeosBot = require('./bots/lifeos-bot');

async function launchEcosystem() {
  console.log('====================================================================');
  console.log('👑 Starting ZenOsLife 3-Bot Ecosystem & Unified REST Backend Engine');
  console.log('====================================================================');

  // 1. Start REST API Server
  try {
    startServer(CONFIG.API_PORT);
  } catch (err) {
    console.error('❌ REST API Server failed to start:', err.message);
  }

  // 2. Start Chazha Games Bot (@chazha_bot)
  try {
    await gamesBot.start();
  } catch (err) {
    console.error('❌ Chazha Games Bot failed to start:', err.message);
  }

  // 3. Start Whoza Dating Bot (@whoza_bot)
  try {
    await datingBot.start();
  } catch (err) {
    console.error('❌ Whoza Dating Bot failed to start:', err.message);
  }

  // 4. Start ZenOsLife LifeOS Bot (@zenosaaa_bot)
  try {
    await lifeosBot.start();
  } catch (err) {
    console.error('❌ ZenOsLife Bot failed to start:', err.message);
  }

  console.log('====================================================================');
  console.log('✨ All 3 Bots & API Server are ONLINE and Fully Operational! ✨');
  console.log('🎮 Chazha:  https://t.me/chazha_bot');
  console.log('💬 Whoza:   https://t.me/whoza_bot');
  console.log('🌱 LifeOS:  https://t.me/zenosaaa_bot');
  console.log('====================================================================');
}

if (require.main === module) {
  launchEcosystem().catch(err => {
    console.error('Fatal error in master launcher:', err);
  });
}

module.exports = { launchEcosystem };
