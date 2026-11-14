const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

let WebcastPushConnection = null;
try {
  WebcastPushConnection = require('tiktok-live-connector').WebcastPushConnection;
} catch (err) {
  console.log('TikTok Live Connector ready.');
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/overlay', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ==========================================
// GAME STATE (ARENA LIVE BATTLE ROYALE)
// ==========================================
const ROUND_TIME_LIMIT = 75; // 75 seconds per round

let gameState = {
  status: 'FIGHTING', // 'WAITING', 'FIGHTING', 'ROUND_END'
  roundNumber: 131,
  timeLeft: ROUND_TIME_LIMIT,
  fighters: {}, // key: username -> fighter data
  leaderboard: [
    { nickname: 'พี่มารวยขายประกัน', avatar: '/assets/default-avatar-red.svg', wins: 14, kills: 15 },
    { nickname: 'กฤษดา ประเสริฐสังข์', avatar: '/assets/default-avatar-blue.svg', wins: 3, kills: 16 },
    { nickname: 'KOJiji', avatar: '/assets/default-avatar-red.svg', wins: 2, kills: 12 }
  ],
  lastWinner: null,
  nextRoundCountdown: 5,
  tiktok: {
    username: '',
    isConnected: false,
    viewerCount: 15,
    likeCount: 0,
    lastError: null
  },
  recentEvents: []
};

// ==========================================
// TIKTOK LIVE CONNECTOR
// ==========================================
let tiktokLiveConnection = null;

function connectToTikTok(targetUsername) {
  if (!WebcastPushConnection) {
    try {
      WebcastPushConnection = require('tiktok-live-connector').WebcastPushConnection;
    } catch (e) {
      gameState.tiktok.lastError = 'ไม่พบไลบรารี tiktok-live-connector';
      broadcastState();
      return;
    }
  }

  const cleanUsername = targetUsername.replace(/^@/, '').trim();
  if (!cleanUsername) return;

  if (tiktokLiveConnection) {
    try { tiktokLiveConnection.disconnect(); } catch (e) {}
    tiktokLiveConnection = null;
  }

  gameState.tiktok.username = cleanUsername;
  gameState.tiktok.lastError = null;
  gameState.tiktok.isConnected = false;
  broadcastState();

  try {
    tiktokLiveConnection = new WebcastPushConnection(cleanUsername, {
      processInitialData: false,
      enableExtendedGiftInfo: true,
      enableWebsocketUpgrade: true,
      clientParams: { app_language: 'th-TH', device_platform: 'web' }
    });

    tiktokLiveConnection.connect()
      .then(state => {
        gameState.tiktok.isConnected = true;
        gameState.tiktok.lastError = null;
        broadcastState();
        logEvent('system', `เชื่อมต่อห้องสด @${cleanUsername} สำเร็จ!`);
      })
      .catch(err => {
        gameState.tiktok.isConnected = false;
        gameState.tiktok.lastError = err.message || 'ไม่สามารถเชื่อมต่อไลฟ์ได้';
        broadcastState();
        logEvent('system', `ข้อผิดพลาด: ${gameState.tiktok.lastError}`);
      });

    tiktokLiveConnection.on('chat', data => handleChat(data));
    tiktokLiveConnection.on('gift', data => handleGift(data));
    tiktokLiveConnection.on('like', data => handleLike(data));
    tiktokLiveConnection.on('follow', data => handleFollow(data));
    tiktokLiveConnection.on('share', data => handleShare(data));
    tiktokLiveConnection.on('roomUser', data => {
      if (data && typeof data.viewerCount === 'number') {
        gameState.tiktok.viewerCount = data.viewerCount;
        io.emit('viewer_count', data.viewerCount);
      }
    });
    tiktokLiveConnection.on('disconnected', () => {
      gameState.tiktok.isConnected = false;
      broadcastState();
      logEvent('system', 'ตัดการเชื่อมต่อจาก TikTok Live');
    });

  } catch (err) {
    gameState.tiktok.isConnected = false;
    gameState.tiktok.lastError = err.message;
    broadcastState();
  }
}

function disconnectTikTok() {
  if (tiktokLiveConnection) {
    try { tiktokLiveConnection.disconnect(); } catch (e) {}
    tiktokLiveConnection = null;
  }
  gameState.tiktok.isConnected = false;
  broadcastState();
  logEvent('system', 'หยุดการเชื่อมต่อ TikTok Live');
}

// ==========================================
// GAME EVENT LOGGING
// ==========================================
function logEvent(type, text, meta = {}) {
  const event = {
    id: Date.now() + Math.random().toString(36).substring(2, 6),
    time: new Date().toLocaleTimeString('th-TH'),
    type,
    text,
    meta
  };
  gameState.recentEvents.unshift(event);
  if (gameState.recentEvents.length > 50) gameState.recentEvents.pop();
  io.emit('new_event', event);
}

// ==========================================
// FIGHTER REGISTRATION & COMBAT LOGIC
// ==========================================
function spawnFighter(uniqueId, nickname, avatar, forceRevive = false) {
  const existing = gameState.fighters[uniqueId];

  // If already alive and not reviving, just update active
  if (existing && existing.alive && !forceRevive) {
    existing.lastActive = Date.now();
    return existing;
  }

  // Choose team/color based on count
  const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#a855f7', '#10b981', '#f97316'];
  const paletteIdx = Object.keys(gameState.fighters).length % colors.length;
  const assignedColor = colors[paletteIdx];

  const fighter = {
    id: uniqueId,
    nickname: nickname || uniqueId,
    avatar: avatar || '/assets/avatar-1.svg',
    hp: 100,
    maxHp: 100,
    color: assignedColor,
    palette: paletteIdx, // 0 to 5 for Fighter: Blaze pixel sprite palettes
    weapon: 'none',       // 'none', 'sword', 'club', 'giant_glove'
    hasShield: false,
    speedBoost: 1,
    kills: 0,
    alive: true,
    lastActive: Date.now(),
    buffLevel: 0
  };

  gameState.fighters[uniqueId] = fighter;

  // Tell client to spawn fighter with drop-in physics
  io.emit('spawn_fighter', fighter);

  if (forceRevive) {
    logEvent('game', `✨ ${nickname} ฟื้นชีพกลับลงมาล้างแค้นบนสังเวียน!`, { avatar });
  } else {
    logEvent('game', `🥊 ${nickname} กระโดดลงสนามประลองมวยวัด!`, { avatar });
  }

  broadcastState();
  return fighter;
}

// 1. Handle Chat ("เข้า" หรือ "JOIN")
function handleChat(data) {
  const comment = (data.comment || '').trim();
  const commentLower = comment.toLowerCase();
  const username = data.uniqueId || 'viewer';
  const nickname = data.nickname || username;
  const avatar = data.profilePictureUrl || '';

  if (commentLower === 'เข้า' || commentLower === 'join' || commentLower === 'ลงสนาม' || commentLower === 'สู้') {
    spawnFighter(username, nickname, avatar);
    return;
  }

  // Floating chat bubble over fighter head
  io.emit('chat_bubble', { username, nickname, avatar, comment });
  logEvent('chat', `${nickname}: "${comment}"`, { avatar });
}

// 2. Handle Likes (เคาะจอ 30 ครั้ง = +พลัง/ฮีล)
function handleLike(data) {
  const count = data.likeCount || 1;
  gameState.tiktok.likeCount += count;

  const username = data.uniqueId;
  if (username && gameState.fighters[username]) {
    const fighter = gameState.fighters[username];
    if (fighter.alive) {
      fighter.hp = Math.min(fighter.maxHp, fighter.hp + (count * 0.5));
      io.emit('fighter_heal', { id: username, hp: fighter.hp });
    }
  }

  io.emit('like_burst', { count });
}

// 3. Handle Gifts (หัวใจหลักของระบบมวยวัด)
function handleGift(data) {
  const giftName = data.giftName || 'Gift';
  const diamondCount = (data.diamondCount || 1) * (data.repeatCount || 1);
  const username = data.uniqueId || 'supporter';
  const nickname = data.nickname || username;
  const avatar = data.profilePictureUrl || '';

  let fighter = gameState.fighters[username];

  // ถ้าตายอยู่ -> ส่งของขวัญอะไรก็ได้ (เช่น กุหลาบ 1 💎) = ฟื้นชีพทันที!
  if (!fighter || !fighter.alive) {
    fighter = spawnFighter(username, nickname, avatar, true);
  }

  // Tier 1: บัฟเลือด & พลังหมัด (1-4 💎)
  if (diamondCount >= 1 && diamondCount < 5) {
    fighter.hp = Math.min(fighter.maxHp + 30, fighter.hp + 40);
    fighter.buffLevel += 1;
    io.emit('fighter_buff', { id: username, type: 'hp', hp: fighter.hp });
    logEvent('gift', `🩸 ${nickname} ส่ง ${giftName} บัฟพลังชีวิต +40 HP!`, { avatar });
  }
  // Tier 2: เสกอาวุธ (5-29 💎)
  else if (diamondCount >= 5 && diamondCount < 30) {
    fighter.weapon = 'sword';
    io.emit('fighter_weapon', { id: username, weapon: 'sword' });
    logEvent('gift', `⚔️ ${nickname} ส่ง ${giftName} เสกดาบยาวโจมตีหนักขึ้น!`, { avatar });
  }
  // Tier 3: อุปกรณ์/โล่สะท้อน (30-99 💎)
  else if (diamondCount >= 30 && diamondCount < 100) {
    fighter.hasShield = true;
    fighter.maxHp += 50;
    fighter.hp = fighter.maxHp;
    io.emit('fighter_shield', { id: username });
    logEvent('gift', `🛡️ ${nickname} ส่ง ${giftName} เสกเกราะสะท้อนพลัง!`, { avatar });
  }
  // Tier 4: สกิลระเบิดคลื่นพลังผลักรอบตัว (100-299 💎)
  else if (diamondCount >= 100 && diamondCount < 300) {
    io.emit('fighter_shockwave', { id: username });
    logEvent('gift', `🔥 ${nickname} ส่ง ${giftName} ระเบิดคลื่นพลังผลักศัตรูรอบตัว!`, { avatar });
  }
  // Tier 5: อัลติเมท ฟ้าผ่า/ทุบทั้งสนาม (300-999 💎)
  else if (diamondCount >= 300 && diamondCount < 1000) {
    io.emit('fighter_ultimate', { id: username });
    logEvent('gift', `🚀 ${nickname} ส่ง ${giftName} ปล่อยท่าไม้ตายอัลติเมททุบทั้งเวที!`, { avatar });
  }
  // Tier 6: มหาบอส (1000+ 💎)
  else if (diamondCount >= 1000) {
    fighter.maxHp += 300;
    fighter.hp = fighter.maxHp;
    fighter.weapon = 'giant_glove';
    io.emit('fighter_boss', { id: username });
    logEvent('gift', `🐍 ${nickname} ส่ง ${giftName} แปลงร่างเป็นบอสยักษ์ครองเวที!`, { avatar });
  }

  broadcastState();
}

// 4. Handle Follow & Share
function handleFollow(data) {
  const username = data.uniqueId;
  if (username && gameState.fighters[username]) {
    gameState.fighters[username].hasShield = true;
    io.emit('fighter_shield', { id: username });
    logEvent('game', `➕ ${data.nickname || username} กดติดตามช่อง ได้รับโล่ป้องกัน!`);
  }
}

function handleShare(data) {
  const username = data.uniqueId;
  if (username && gameState.fighters[username]) {
    gameState.fighters[username].speedBoost = 1.6;
    io.emit('fighter_speed', { id: username, speed: 1.6 });
    logEvent('game', `🔗 ${data.nickname || username} แชร์ไลฟ์สด ได้รับบัฟวิ่งไวติดสปีด!`);
  }
}

// ==========================================
// MATCH LOOP & ROUND CONTROLLER
// ==========================================
setInterval(() => {
  if (gameState.status === 'FIGHTING') {
    gameState.timeLeft -= 1;

    // Check winner condition (Last fighter standing)
    const aliveFighters = Object.values(gameState.fighters).filter(f => f.alive);

    if ((aliveFighters.length === 1 && Object.keys(gameState.fighters).length >= 2) || gameState.timeLeft <= 0) {
      endRound(aliveFighters[0] || null);
    }
  } else if (gameState.status === 'ROUND_END') {
    gameState.nextRoundCountdown -= 1;
    if (gameState.nextRoundCountdown <= 0) {
      startNewRound();
    }
    broadcastState();
  }
}, 1000);

function endRound(winnerFighter) {
  gameState.status = 'ROUND_END';
  gameState.nextRoundCountdown = 5;

  if (winnerFighter) {
    gameState.lastWinner = {
      nickname: winnerFighter.nickname,
      avatar: winnerFighter.avatar,
      kills: winnerFighter.kills || 0,
      round: gameState.roundNumber
    };

    // Update Leaderboard
    const lbEntry = gameState.leaderboard.find(l => l.nickname === winnerFighter.nickname);
    if (lbEntry) {
      lbEntry.wins += 1;
      lbEntry.kills += (winnerFighter.kills || 0);
    } else {
      gameState.leaderboard.push({
        nickname: winnerFighter.nickname,
        avatar: winnerFighter.avatar,
        wins: 1,
        kills: winnerFighter.kills || 0
      });
    }
    gameState.leaderboard.sort((a, b) => (b.wins * 100 + b.kills) - (a.wins * 100 + a.kills));
    if (gameState.leaderboard.length > 5) gameState.leaderboard.pop();

    logEvent('game', `🏆 ${winnerFighter.nickname} ชนะรอบที่ ${gameState.roundNumber} น็อคไป ${winnerFighter.kills} คน!`);
    io.emit('round_winner', gameState.lastWinner);
  } else {
    logEvent('game', `⌛ จบรอบที่ ${gameState.roundNumber} เสมอ ไม่มีผู้รอดชีวิต!`);
    io.emit('round_draw');
  }

  broadcastState();
}

function startNewRound() {
  gameState.roundNumber += 1;
  gameState.timeLeft = ROUND_TIME_LIMIT;
  gameState.status = 'FIGHTING';
  gameState.lastWinner = null;

  // Reset all participating fighters to alive with full HP for the new round
  Object.values(gameState.fighters).forEach(f => {
    f.alive = true;
    f.hp = f.maxHp || 100;
    f.kills = 0;
    f.weapon = 'none';
    f.hasShield = false;
  });

  io.emit('new_round_started', {
    roundNumber: gameState.roundNumber,
    fighters: gameState.fighters
  });

  logEvent('game', `🔔 ระฆังดังเริ่มศึกมวยวัดรอบที่ ${gameState.roundNumber}!`);
  broadcastState();
}

function broadcastState() {
  io.emit('state_update', gameState);
}

// ==========================================
// SOCKET.IO EVENTS & ADMIN SIMULATOR
// ==========================================
io.on('connection', socket => {
  socket.emit('state_update', gameState);

  socket.on('tiktok_connect', username => connectToTikTok(username));
  socket.on('tiktok_disconnect', () => disconnectTikTok());

  // Knockout notification from client physics engine
  socket.on('fighter_knocked_out', payload => {
    const victim = gameState.fighters[payload.victimId];
    if (victim) {
      victim.alive = false;
      logEvent('game', `💀 ${victim.nickname} เลือดหมด โดน K.O.! (ส่งกุหลาบเพื่อฟื้นชีพ)`, { avatar: victim.avatar });
    }

    if (payload.attackerId && gameState.fighters[payload.attackerId]) {
      gameState.fighters[payload.attackerId].kills += 1;
    }

    broadcastState();
  });

  // Simulator Events for Testing
  const botPresets = [
    { nickname: 'พี่มารวยขายประกัน', avatar: '/assets/avatar-1.svg' },
    { nickname: 'กฤษดา ประเสริฐสังข์', avatar: '/assets/avatar-2.svg' },
    { nickname: 'KOJiji', avatar: '/assets/avatar-3.svg' },
    { nickname: 'สิบสาม เมษา', avatar: '/assets/avatar-4.svg' },
    { nickname: 'น้องแว่นสายบู๊', avatar: '/assets/avatar-5.svg' },
    { nickname: 'จอมมารจี้จัง', avatar: '/assets/avatar-6.svg' }
  ];

  socket.on('sim_join', (payload) => {
    const preset = botPresets[Math.floor(Math.random() * botPresets.length)];
    const randName = payload?.nickname || preset.nickname;
    const randId = payload?.username || 'user_' + Math.floor(Math.random() * 9000 + 1000);
    const randAvatar = payload?.avatar || preset.avatar;
    spawnFighter(randId, randName, randAvatar);
  });

  socket.on('sim_spawn_bots', () => {
    botPresets.forEach((bot, idx) => {
      setTimeout(() => {
        const botId = 'bot_' + (idx + 1) + '_' + Math.floor(Math.random() * 100);
        spawnFighter(botId, bot.nickname, bot.avatar);
      }, idx * 180);
    });
  });

  socket.on('sim_follow', () => {
    const keys = Object.keys(gameState.fighters);
    if (keys.length > 0) {
      const randId = keys[Math.floor(Math.random() * keys.length)];
      handleFollow({ uniqueId: randId, nickname: gameState.fighters[randId].nickname });
    }
  });

  socket.on('sim_share', () => {
    const keys = Object.keys(gameState.fighters);
    if (keys.length > 0) {
      const randId = keys[Math.floor(Math.random() * keys.length)];
      handleShare({ uniqueId: randId, nickname: gameState.fighters[randId].nickname });
    }
  });

  socket.on('sim_gift', (payload) => {
    const keys = Object.keys(gameState.fighters);
    const targetId = keys.length > 0 ? keys[Math.floor(Math.random() * keys.length)] : 'fighter_test';
    const target = gameState.fighters[targetId] || { nickname: 'นักมวยสายเปย์', avatar: '/assets/avatar-1.svg' };

    handleGift({
      uniqueId: targetId,
      nickname: target.nickname,
      profilePictureUrl: target.avatar,
      giftName: payload?.giftName || 'Rose',
      diamondCount: payload?.diamonds || 1,
      repeatCount: 1
    });
  });

  socket.on('sim_reset_round', () => {
    startNewRound();
  });

  socket.on('sim_force_win', () => {
    const alive = Object.values(gameState.fighters).find(f => f.alive);
    if (alive) endRound(alive);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🥊 ARENA LIVE: BATTLE ROYALE GAME SERVER RUNNING!`);
  console.log(`🌐 Stream & Admin: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
