/**
 * Life OS — Global Realtime Network Service v1.0
 * Connects Life OS users worldwide in real-time using open distributed WebSocket relays.
 * Zero-config, zero-backend, instant P2P/PubSub delivery, and persistent global rooms.
 */

const PUBLIC_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.primal.net'
];

const APP_CHANNEL_TAG = 'life_os_global_v3';
const EVENT_KIND = 20088; // Ephemeral/Parameterized Realtime Message Kind

class RealtimeNetworkService {
  constructor() {
    this.sockets = [];
    this.status = 'disconnected'; // 'connecting' | 'connected' | 'disconnected'
    this.listeners = new Set();
    this.seenMessageIds = new Set();
    this.heartbeatTimer = null;
    this.currentUser = { id: '', name: '', avatar: '👤' };
    this.activeRelayCount = 0;
  }

  init(user, onMessageReceived) {
    if (user) {
      this.currentUser = user;
    }
    if (onMessageReceived) {
      this.listeners.add(onMessageReceived);
    }

    this.connectRelays();
    this.startHeartbeat();
  }

  updateUser(user) {
    this.currentUser = { ...this.currentUser, ...user };
    this.broadcastPresence();
  }

  connectRelays() {
    this.status = 'connecting';
    this.notifyStatus();

    PUBLIC_RELAYS.forEach((relayUrl) => {
      this.connectToRelay(relayUrl);
    });
  }

  connectToRelay(url) {
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        this.activeRelayCount++;
        this.status = 'connected';
        this.notifyStatus();

        // Subscribe to global Life OS messages
        const subFilter = {
          kinds: [EVENT_KIND],
          '#t': [APP_CHANNEL_TAG],
          limit: 60
        };
        const req = JSON.stringify(['REQ', 'life_os_sub_' + Math.random().toString(36).substr(2, 5), subFilter]);
        ws.send(req);

        // Send initial presence
        this.broadcastPresence();
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (Array.isArray(data) && data[0] === 'EVENT') {
            const eventObj = data[2];
            if (eventObj && eventObj.content) {
              const payload = JSON.parse(eventObj.content);
              if (payload && payload.id && !this.seenMessageIds.has(payload.id)) {
                this.seenMessageIds.add(payload.id);
                // Keep set bounded
                if (this.seenMessageIds.size > 1000) {
                  const arr = Array.from(this.seenMessageIds);
                  this.seenMessageIds = new Set(arr.slice(-500));
                }
                this.notifyListeners(payload);
              }
            }
          }
        } catch (err) {
          // Ignore parse errors from non-standard relay messages
        }
      };

      ws.onclose = () => {
        this.activeRelayCount = Math.max(0, this.activeRelayCount - 1);
        if (this.activeRelayCount === 0) {
          this.status = 'disconnected';
          this.notifyStatus();
        }
        // Auto-reconnect after 8s
        setTimeout(() => this.connectToRelay(url), 8000 + Math.random() * 4000);
      };

      ws.onerror = () => {
        ws.close();
      };

      this.sockets.push(ws);
    } catch (err) {
      console.warn(`Could not connect to relay ${url}:`, err);
    }
  }

  startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      this.broadcastPresence();
    }, 20000);
  }

  broadcastPresence() {
    if (!this.currentUser?.id) return;
    this.publish({
      type: 'PRESENCE',
      id: 'pres_' + this.currentUser.id + '_' + Date.now(),
      userId: this.currentUser.id,
      userName: this.currentUser.name || 'کاربر زندگی‌ساز',
      avatar: this.currentUser.avatar || '🌟',
      role: this.currentUser.role || 'کاربر آنلاین',
      timestamp: new Date().toISOString()
    });
  }

  publish(payload) {
    if (!payload.id) {
      payload.id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }
    this.seenMessageIds.add(payload.id);

    // Build event object (Nostr compatible standard)
    const content = JSON.stringify(payload);
    const event = {
      kind: EVENT_KIND,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['t', APP_CHANNEL_TAG],
        ['type', payload.type || 'CHAT'],
        ['room', payload.roomId || 'general']
      ],
      content: content,
      pubkey: this.currentUser.id ? this.currentUser.id.replace(/[^a-f0-9]/gi, '').padEnd(64, '0').slice(0, 64) : '0000000000000000000000000000000000000000000000000000000000000001'
    };

    const msg = JSON.stringify(['EVENT', event]);

    // Send to all active WebSocket relays
    let sentCount = 0;
    this.sockets.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(msg);
          sentCount++;
        } catch (e) {
          // ignore
        }
      }
    });

    return payload;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(payload) {
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    });
  }

  notifyStatus() {
    this.notifyListeners({
      type: 'NETWORK_STATUS',
      status: this.status,
      activeRelayCount: this.activeRelayCount
    });
  }
}

export const realtimeNetwork = new RealtimeNetworkService();
export default realtimeNetwork;
