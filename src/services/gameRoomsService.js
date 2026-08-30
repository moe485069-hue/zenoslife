// gameRoomsService.js — Live Game Lobby via ntfy.sh
const NTFY_BASE = 'https://ntfy.sh';
const TOPIC = 'zenoslife_gamerooms_v3';
const ROOM_TTL = 30 * 60 * 1000;

const gameRoomsService = {
  _listeners: [],
  _rooms: {},
  _sseSource: null,
  _myRoomId: null,
  _heartbeatInterval: null,

  async publishRoom({ roomId, gameType, gameTitleFa, hostId, hostName, hostAvatar, maxPlayers, isPrivate }) {
    const room = {
      roomId, gameType, gameTitleFa, hostId, hostName,
      hostAvatar: hostAvatar || '🎮', maxPlayers,
      currentPlayers: 1, isPrivate: !!isPrivate,
      status: 'waiting', createdAt: Date.now(),
    };
    this._myRoomId = roomId;
    this._rooms[roomId] = { ...room, _lastSeen: Date.now() };
    this._saveLocal();
    try {
      await fetch(NTFY_BASE + '/' + TOPIC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ROOM_OPEN', room }),
      });
    } catch (_) {}
    clearInterval(this._heartbeatInterval);
    this._heartbeatInterval = setInterval(async () => {
      if (!this._myRoomId) return;
      try {
        await fetch(NTFY_BASE + '/' + TOPIC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'ROOM_HEARTBEAT', roomId: this._myRoomId }),
        });
      } catch (_) {}
    }, 90000);
    return room;
  },

  async closeRoom(roomId) {
    delete this._rooms[roomId];
    this._saveLocal();
    if (this._myRoomId === roomId) {
      this._myRoomId = null;
      clearInterval(this._heartbeatInterval);
    }
    try {
      await fetch(NTFY_BASE + '/' + TOPIC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ROOM_CLOSED', roomId }),
      });
    } catch (_) {}
  },

  subscribe(callback) {
    this._listeners.push(callback);
    this._ensureSSE();
    callback(this._getActiveRooms());
    return () => { this._listeners = this._listeners.filter(l => l !== callback); };
  },

  _ensureSSE() {
    if (this._sseSource) return;
    try {
      this._sseSource = new EventSource(NTFY_BASE + '/' + TOPIC + '/sse');
      this._sseSource.onmessage = (e) => {
        try {
          const outer = JSON.parse(e.data);
          const msg = JSON.parse(outer.message || '{}');
          this._handleMessage(msg);
        } catch (_) {}
      };
      this._sseSource.onerror = () => {
        this._sseSource?.close();
        this._sseSource = null;
        setTimeout(() => this._ensureSSE(), 5000);
      };
    } catch (_) {}
  },

  _handleMessage(msg) {
    const now = Date.now();
    if (msg.type === 'ROOM_OPEN' && msg.room) {
      this._rooms[msg.room.roomId] = { ...msg.room, _lastSeen: now };
    } else if (msg.type === 'ROOM_UPDATE' && msg.roomId && this._rooms[msg.roomId]) {
      Object.assign(this._rooms[msg.roomId], { status: msg.status, currentPlayers: msg.currentPlayers, _lastSeen: now });
    } else if (msg.type === 'ROOM_CLOSED' && msg.roomId) {
      delete this._rooms[msg.roomId];
    } else if (msg.type === 'ROOM_HEARTBEAT' && msg.roomId && this._rooms[msg.roomId]) {
      this._rooms[msg.roomId]._lastSeen = now;
    }
    this._purgeStale();
    this._saveLocal();
    this._emit();
  },

  _purgeStale() {
    const now = Date.now();
    Object.keys(this._rooms).forEach(id => {
      const r = this._rooms[id];
      if (now - (r._lastSeen || r.createdAt) > ROOM_TTL) delete this._rooms[id];
    });
  },

  _getActiveRooms() {
    return Object.values(this._rooms)
      .filter(r => r.status !== 'closed')
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  _emit() {
    const rooms = this._getActiveRooms();
    this._listeners.forEach(fn => fn(rooms));
  },

  _saveLocal() {
    try { localStorage.setItem('zen_game_rooms_cache', JSON.stringify(this._rooms)); } catch (_) {}
  },

  _loadLocal() {
    try {
      const s = localStorage.getItem('zen_game_rooms_cache');
      if (s) { this._rooms = JSON.parse(s); this._purgeStale(); }
    } catch (_) {}
  },

  init() { this._loadLocal(); }
};

gameRoomsService.init();
export default gameRoomsService;
