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

// Root route now serves the Unified All-in-One Game & Admin Screen!
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/overlay', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ==========================================
// 32 TILES: LINE เกมเศรษฐี MAP (1:1 Layout)
// 4 Sides x 8 Tiles per side = 32 Tiles
// ==========================================
const BOARD_TILES = [
  // SIDE 1: Bottom-Right (Start -> Train)
  { id: 0,  type: 'start',      name: 'จุดเริ่มต้น',   desc: 'รับเงินเดือน ⭐ +300M', icon: '🏁', color: '#f59e0b', corner: true },
  { id: 1,  type: 'city',       name: 'กรุงเทพฯ',      desc: 'เมืองหลวง +450M',      icon: '🏙️', color: '#ef4444', points: 450 },
  { id: 2,  type: 'city',       name: 'เชียงใหม่',     desc: 'เมืองเหนือ +350M',     icon: '🌸', color: '#ef4444', points: 350 },
  { id: 3,  type: 'chance',     name: 'การ์ดดวง',      desc: 'สุ่มการ์ดพลิกเกม',     icon: '❓', color: '#eab308' },
  { id: 4,  type: 'city',       name: 'ภูเก็ต',        desc: 'ไข่มุกอันดามัน +300M', icon: '🏖️', color: '#f97316', points: 300 },
  { id: 5,  type: 'city',       name: 'ปัตตานี',       desc: 'เมืองใต้ +250M',       icon: '🕌', color: '#f97316', points: 250 },
  { id: 6,  type: 'city',       name: 'พัทยา',         desc: 'เมืองท่องเที่ยว +250M', icon: '⛵', color: '#f43f5e', points: 250 },
  { id: 7,  type: 'train',      name: 'เที่ยวทางรถไฟ', desc: 'นั่งรถไฟพุ่งไป 5 ช่อง', icon: '🚆', color: '#38bdf8', corner: true },

  // SIDE 2: Top-Right (Train -> Expo)
  { id: 8,  type: 'city',       name: 'บุรีรัมย์',     desc: 'เมืองปราสาท +200M',   icon: '🏰', color: '#a855f7', points: 200 },
  { id: 9,  type: 'city',       name: 'ขอนแก่น',       desc: 'เมืองการศึกษา +220M', icon: '🎓', color: '#a855f7', points: 220 },
  { id: 10, type: 'city',       name: 'นครราชสีมา',    desc: 'ประตูอีสาน +240M',    icon: '🌾', color: '#a855f7', points: 240 },
  { id: 11, type: 'chance',     name: 'การ์ดดวง',      desc: 'สุ่มการ์ดพลิกเกม',     icon: '❓', color: '#eab308' },
  { id: 12, type: 'city',       name: 'พิษณุโลก',      desc: 'เมืองสองแคว +180M',   icon: '🛶', color: '#ec4899', points: 180 },
  { id: 13, type: 'island',     name: 'เกาะพะงัน',     desc: 'ฟูลมูนปาร์ตี้ +200M',   icon: '🌕', color: '#06b6d4', points: 200 },
  { id: 14, type: 'city_x2',    name: 'หัวหิน (x2)',   desc: 'เมืองพักผ่อน โบนัส x2', icon: '⚡', color: '#06b6d4', multiplier: 2 },
  { id: 15, type: 'expo',       name: 'จัดงานเอ็กซ์โป', desc: 'เทศกาลระดับโลก +500M', icon: '🎡', color: '#10b981', corner: true },

  // SIDE 3: Top-Left (Expo -> Jail Island)
  { id: 16, type: 'city_x2',    name: 'จันทบุรี (x2)', desc: 'เมืองผลไม้ โบนัส x2',   icon: '⚡', color: '#3b82f6', multiplier: 2 },
  { id: 17, type: 'island',     name: 'เกาะเสม็ด',     desc: 'หาดทรายแก้ว +220M',   icon: '🏝️', color: '#3b82f6', points: 220 },
  { id: 18, type: 'city',       name: 'ระยอง',         desc: 'เมืองอุตสาหกรรม +240M', icon: '🏭', color: '#3b82f6', points: 240 },
  { id: 19, type: 'chance',     name: 'การ์ดดวง',      desc: 'สุ่มการ์ดพลิกเกม',     icon: '❓', color: '#eab308' },
  { id: 20, type: 'city',       name: 'ราชบุรี',       desc: 'เมืองโอ่งมังกร +180M',  icon: '🏺', color: '#0284c7', points: 180 },
  { id: 21, type: 'city',       name: 'สุพรรณบุรี',    desc: 'เมืองขุนแผน +190M',   icon: '🗡️', color: '#0284c7', points: 190 },
  { id: 22, type: 'trap',       name: 'กับดักแกล้งเพื่อน', desc: 'พิมพ์ @ชื่อเพื่อนขังคุก', icon: '💣', color: '#a855f7' },
  { id: 23, type: 'jail',       name: 'เกาะร้าง / คุก', desc: 'ขัง 3 เทิร์น (กุหลาบช่วยได้)', icon: '⛓️', color: '#ef4444', corner: true },

  // SIDE 4: Bottom-Left (Jail Island -> Start)
  { id: 24, type: 'city',       name: 'อยุธยา',        desc: 'กรุงเก่า +280M',       icon: '🏯', color: '#10b981', points: 280 },
  { id: 25, type: 'city',       name: 'สมุทรปราการ',   desc: 'เมืองปากน้ำ +260M',    icon: '🦀', color: '#10b981', points: 260 },
  { id: 26, type: 'city',       name: 'นครสวรรค์',     desc: 'ปากน้ำโพ +220M',       icon: '🐉', color: '#10b981', points: 220 },
  { id: 27, type: 'chance',     name: 'การ์ดดวง',      desc: 'สุ่มการ์ดพลิกเกม',     icon: '❓', color: '#eab308' },
  { id: 28, type: 'city_x2',    name: 'เกาะช้าง (x2)', desc: 'เกาะช้าง โบนัส x2',    icon: '⚡', color: '#10b981', multiplier: 2 },
  { id: 29, type: 'city',       name: 'นครปฐม',        desc: 'องค์พระปฐมฯ +210M',    icon: '🛕', color: '#10b981', points: 210 },
  { id: 30, type: 'gameroom',   name: 'ห้องเกมมินิเกม', desc: 'ทอยรับแจ็กพอตสุ่มแต้ม', icon: '🎮', color: '#f59e0b' },
  { id: 31, type: 'city',       name: 'ลพบุรี',        desc: 'เมืองพระปรางค์ +200M',  icon: '🐒', color: '#10b981', points: 200 }
];

// CHANCE CARDS POOL
const CHANCE_CARDS = [
  { id: 'tycoon', title: 'ยศเศรษฐีชั่วคราว', desc: 'ได้รับเงินโบนัสทันที +500M!', points: 500, type: 'points' },
  { id: 'steal_first', title: 'ขโมยเงินอันดับ 1', desc: 'ขโมยเงินจากอันดับ 1 มา 20%!', type: 'steal_first' },
  { id: 'swap_lead', title: 'สลับร่างคนข้างหน้า', desc: 'สลับตำแหน่งกับผู้เล่นที่อยู่ข้างหน้าคุณ!', type: 'swap' },
  { id: 'tax_audit', title: 'สรรพากรเรียกเก็บภาษี', desc: 'เสียภาษีบำรุงเมือง -150M', points: -150, type: 'points' },
  { id: 'free_boost', title: 'นั่งสปีดโบ๊ทเร่งด่วน', desc: 'พุ่งไปข้างหน้าอีก 4 ช่องทันที!', steps: 4, type: 'move' },
  { id: 'golden_ticket', title: 'ลูกเต๋าทองคำ', desc: 'ได้รับลูกเต๋าทองคำเดินเบิ้ล 2 เท่า!', type: 'golden_dice' }
];

const SETTINGS = {
  freeRollCooldown: 120, // 2 minutes cooldown
  likesPerRoll: 50,      // 50 likes gives 1 roll
  roundDuration: 1800,   // 30 minutes round
  maxVisiblePlayers: 35,
  inactivityTimeout: 300
};

let gameState = {
  board: BOARD_TILES,
  players: {},          // key: username -> player object
  hallOfFame: [],       // Top 4 of previous round
  roundNumber: 1,
  roundTimeLeft: SETTINGS.roundDuration,
  roundStatus: 'ACTIVE',
  currentRollAnimation: null,
  activePopupEvent: null,
  settings: { ...SETTINGS },
  tiktok: {
    username: '',
    isConnected: false,
    viewerCount: 0,
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
// CORE GAME MECHANICS
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

function getOrCreatePlayer(uniqueId, nickname, avatar) {
  if (!gameState.players[uniqueId]) {
    // Alternate team red/blue for drama
    const count = Object.keys(gameState.players).length;
    const team = count % 2 === 0 ? 'red' : 'blue';

    gameState.players[uniqueId] = {
      id: uniqueId,
      nickname: nickname || uniqueId,
      avatar: avatar || (team === 'red' ? '/assets/default-avatar-red.svg' : '/assets/default-avatar-blue.svg'),
      position: 0,
      stars: 0,
      marbles: 200, // starting marble money 200M
      team: team,
      isJailed: false,
      jailTurnsLeft: 0,
      isGoldenDice: false,
      hasAura: false,
      lastRollTime: 0,
      likesContributed: 0,
      lastActiveTime: Date.now(),
      pendingTrap: false
    };
    logEvent('game', `🎉 ${nickname} ลงทะเบียนเข้าสู่เกมเศรษฐีที่จุดเริ่มต้น!`, { avatar });
  } else {
    gameState.players[uniqueId].lastActiveTime = Date.now();
    if (nickname) gameState.players[uniqueId].nickname = nickname;
    if (avatar) gameState.players[uniqueId].avatar = avatar;
  }
  return gameState.players[uniqueId];
}

function handleChat(data) {
  const comment = (data.comment || '').trim();
  const commentLower = comment.toLowerCase();
  const username = data.uniqueId || 'viewer';
  const nickname = data.nickname || username;
  const avatar = data.profilePictureUrl || '';

  if (commentLower === 'เล่น' || commentLower === 'เข้าเกม' || commentLower === 'join' || commentLower === 'start') {
    getOrCreatePlayer(username, nickname, avatar);
    broadcastState();
    return;
  }

  if (commentLower === 'ทอย' || commentLower === 'เดิน' || commentLower === 'roll') {
    const player = getOrCreatePlayer(username, nickname, avatar);

    if (player.isJailed) {
      if (player.jailTurnsLeft > 0) {
        player.jailTurnsLeft -= 1;
        if (player.jailTurnsLeft <= 0) {
          player.isJailed = false;
          logEvent('game', `⛓️ ${player.nickname} รับโทษครบกำหนด หลุดออกจากเกาะร้าง!`);
        } else {
          logEvent('game', `⛓️ ${player.nickname} ยังติดเกาะร้าง! (เหลือ ${player.jailTurnsLeft} เทิร์น หรือส่งกุหลาบเพื่อประกันตัว)`);
          broadcastState();
          return;
        }
      }
    }

    const now = Date.now();
    const elapsed = (now - player.lastRollTime) / 1000;
    if (elapsed < gameState.settings.freeRollCooldown) {
      const waitSec = Math.ceil(gameState.settings.freeRollCooldown - elapsed);
      io.emit('chat_bubble', {
        username,
        nickname,
        avatar,
        comment: `รอคูลดาวน์อีก ${waitSec} วิ (ส่งกุหลาบเพื่อทอยทันที!)`
      });
      return;
    }

    player.lastRollTime = now;
    rollDiceForPlayer(player, { isGolden: player.isGoldenDice, isFree: true });
    player.isGoldenDice = false;
    return;
  }

  if (comment.includes('@')) {
    const player = gameState.players[username];
    if (player && player.pendingTrap) {
      player.pendingTrap = false;
      const targetMatch = comment.match(/@([a-zA-Z0-9_.]+)/);
      if (targetMatch && targetMatch[1]) {
        const targetUsername = targetMatch[1];
        const targetPlayer = gameState.players[targetUsername];
        if (targetPlayer) {
          targetPlayer.isJailed = true;
          targetPlayer.jailTurnsLeft = 3;
          targetPlayer.position = 23; // Jail Island (Tile 23)
          logEvent('game', `💣 ${player.nickname} แกล้งสำเร็จ! สั่งส่ง @${targetPlayer.nickname} ไปติดเกาะร้าง!`);
          triggerPopup('jail', {
            title: `💣 โดนแกล้งส่งไปเกาะร้าง!`,
            desc: `@${player.nickname} สั่งขัง @${targetPlayer.nickname} 3 เทิร์น!`,
            avatar: targetPlayer.avatar
          });
          broadcastState();
          return;
        }
      }
    }
  }

  io.emit('chat_bubble', { username, nickname, avatar, comment });
  logEvent('chat', `${nickname}: "${comment}"`, { avatar });
}

function handleLike(data) {
  const count = data.likeCount || 1;
  gameState.tiktok.likeCount += count;

  const username = data.uniqueId;
  if (username && gameState.players[username]) {
    const player = gameState.players[username];
    player.likesContributed += count;
    if (player.likesContributed >= gameState.settings.likesPerRoll) {
      player.likesContributed = 0;
      logEvent('game', `❤️ ${player.nickname} เคาะจอครบ 50 ครั้ง ปลดล็อกสิทธิ์ทอยฟรี!`);
      rollDiceForPlayer(player, { isGolden: player.isGoldenDice, isFree: true });
      player.isGoldenDice = false;
    }
  }
  io.emit('like_burst', { count });
}

function handleGift(data) {
  const giftName = data.giftName || 'Gift';
  const diamondCount = (data.diamondCount || 1) * (data.repeatCount || 1);
  const username = data.uniqueId || 'supporter';
  const nickname = data.nickname || username;
  const avatar = data.profilePictureUrl || '';

  const player = getOrCreatePlayer(username, nickname, avatar);

  if (player.isJailed) {
    player.isJailed = false;
    player.jailTurnsLeft = 0;
    logEvent('game', `🔓 ${nickname} ส่ง ${giftName} ประกันตัวออกจากเกาะร้างสำเร็จ!`, { avatar });
    triggerPopup('jail_free', {
      title: '🔓 ประกันตัวสำเร็จ!',
      desc: `${nickname} ได้รับอิสรภาพแล้ว!`,
      avatar: player.avatar
    });
  }

  if (diamondCount >= 1 && diamondCount < 30) {
    logEvent('gift', `🌹 ${nickname} ส่ง ${giftName} x${data.repeatCount || 1} ทอยลูกเต๋าเพิ่มทันที!`, { avatar });
    rollDiceForPlayer(player, { isGolden: false, isFree: false });
  } else if (diamondCount >= 30 && diamondCount < 100) {
    player.hasAura = true;
    player.isGoldenDice = true;
    logEvent('gift', `🍩 ${nickname} ส่ง ${giftName} ปลุกพลัง "ลูกเต๋าทองคำ" เดินเบิ้ล 2 เท่า!`, { avatar });
    rollDiceForPlayer(player, { isGolden: true, isFree: false });
  } else if (diamondCount >= 100) {
    logEvent('gift', `🚀 ${nickname} ส่ง ${giftName} มหาของขวัญ! "วาร์ปมหาเศรษฐี" พุ่ง 15 ช่อง!`, { avatar });
    performTeleportWarp(player, 15);
  }

  broadcastState();
}

function rollDiceForPlayer(player, opts = {}) {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = opts.isGolden ? Math.floor(Math.random() * 6) + 1 : 0;
  const totalSteps = opts.isGolden ? (dice1 * 2) : dice1;

  gameState.currentRollAnimation = {
    player: { id: player.id, nickname: player.nickname, avatar: player.avatar, team: player.team },
    dice1,
    dice2,
    totalSteps,
    isGolden: opts.isGolden
  };
  io.emit('dice_roll', gameState.currentRollAnimation);

  setTimeout(() => {
    movePlayerSteps(player, totalSteps);
  }, 1200);
}

function movePlayerSteps(player, steps) {
  const oldPos = player.position;
  let newPos = (oldPos + steps);

  // 32 Tiles Loop
  if (newPos >= 32) {
    newPos = newPos % 32;
    player.stars += 1;
    player.marbles += 300; // Lap bonus salary
    logEvent('game', `⭐ ${player.nickname} ครบรอบกระดาน! ได้รับดาว ⭐ ดวงที่ ${player.stars} + เงินเดือน 300M!`, { avatar: player.avatar });
    triggerPopup('star', {
      title: '⭐ ครบรอบกระดานสำเร็จ!',
      desc: `${player.nickname} รับดาวดวงที่ ${player.stars} + 300M!`,
      avatar: player.avatar
    });
  }

  player.position = newPos;
  resolveTileLanding(player, BOARD_TILES[newPos]);
  broadcastState();
}

function resolveTileLanding(player, tile) {
  logEvent('game', `📍 ${player.nickname} เดินมาตกช่อง [${tile.name}] (${tile.desc})`);

  switch (tile.type) {
    case 'city':
      player.marbles += (tile.points || 200);
      break;

    case 'city_x2':
      player.marbles += Math.floor(player.marbles * 0.2) + 300;
      break;

    case 'island':
      player.marbles += (tile.points || 200);
      break;

    case 'train':
      // Fast travel: jump 5 steps ahead!
      logEvent('game', `🚆 ${player.nickname} นั่งรถไฟด่วน พุ่งไปข้างหน้า 5 ช่อง!`);
      setTimeout(() => movePlayerSteps(player, 5), 800);
      break;

    case 'expo':
      player.hasAura = true;
      player.marbles += 500;
      triggerPopup('jackpot', {
        title: '🎡 จัดงานเอ็กซ์โปสำเร็จ!',
        desc: `${player.nickname} ได้รับโบนัสงานเทศกาล +500M!`,
        avatar: player.avatar
      });
      break;

    case 'gameroom':
      const prize = Math.floor(Math.random() * 400) + 300;
      player.marbles += prize;
      triggerPopup('jackpot', {
        title: '🎮 ชนะมินิเกมห้องเกม!',
        desc: `${player.nickname} ทายถูก รับเงินรางวัล +${prize}M!`,
        avatar: player.avatar
      });
      break;

    case 'chance':
      drawChanceCard(player);
      break;

    case 'jail':
      player.isJailed = true;
      player.jailTurnsLeft = 3;
      player.position = 23; // Tile 23 is Jail Island
      triggerPopup('jail', {
        title: '⛓️ ติดเกาะร้าง / สรรพากรเรียกพบ!',
        desc: `${player.nickname} ติดคุก 3 เทิร์น (หรือส่งกุหลาบประกันตัว)`,
        avatar: player.avatar
      });
      break;

    case 'trap':
      player.pendingTrap = true;
      triggerPopup('trap', {
        title: '💣 กับดักแกล้งเพื่อน!',
        desc: `พิมพ์ @ชื่อเพื่อน ในแชทเพื่อสั่งส่งเพื่อนไปเกาะร้าง!`,
        avatar: player.avatar
      });
      break;

    default:
      break;
  }
}

function drawChanceCard(player) {
  const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
  logEvent('game', `❓ ${player.nickname} เปิดการ์ดดวง: [${card.title}] - ${card.desc}`, { avatar: player.avatar });

  if (card.type === 'points') {
    player.marbles = Math.max(0, player.marbles + (card.points || 0));
  } else if (card.type === 'steal_first') {
    const sorted = Object.values(gameState.players).sort((a, b) => (b.stars * 1000 + b.marbles) - (a.stars * 1000 + a.marbles));
    if (sorted.length > 1 && sorted[0].id !== player.id) {
      const target = sorted[0];
      const stolen = Math.floor(target.marbles * 0.2);
      target.marbles -= stolen;
      player.marbles += stolen;
      logEvent('game', `🦹 ${player.nickname} ขโมยเงินจาก ${target.nickname} มาได้ ${stolen}M!`);
    }
  } else if (card.type === 'swap') {
    const candidates = Object.values(gameState.players).filter(p => p.id !== player.id && p.position > player.position);
    if (candidates.length > 0) {
      const target = candidates[0];
      const tempPos = player.position;
      player.position = target.position;
      target.position = tempPos;
      logEvent('game', `🔄 ${player.nickname} สลับตำแหน่งกับ ${target.nickname}!`);
    }
  } else if (card.type === 'move') {
    movePlayerSteps(player, card.steps || 4);
  } else if (card.type === 'golden_dice') {
    player.isGoldenDice = true;
    player.hasAura = true;
  }

  triggerPopup('chance', {
    title: `❓ การ์ดดวง: ${card.title}`,
    desc: card.desc,
    avatar: player.avatar
  });
}

function performTeleportWarp(player, steps = 15) {
  const oldPos = player.position;
  let newPos = (oldPos + steps);

  if (newPos >= 32) {
    newPos = newPos % 32;
    player.stars += 1;
    player.marbles += 500;
  }

  player.position = newPos;

  // Knock backward any competitors in the landing tile!
  const knockedPlayers = Object.values(gameState.players).filter(p => p.id !== player.id && p.position === newPos);
  knockedPlayers.forEach(kp => {
    kp.position = (kp.position - 3 + 32) % 32;
    logEvent('game', `💥 ${kp.nickname} โดนพลังวาร์ปของ ${player.nickname} ชนกระเด็นถอยหลัง 3 ช่อง!`);
  });

  triggerPopup('warp', {
    title: '🚀 วาร์ปมหาเศรษฐี!',
    desc: `${player.nickname} พุ่งทะยาน 15 ช่อง ชนคู่แข่งกระเด็น!`,
    avatar: player.avatar
  });

  resolveTileLanding(player, BOARD_TILES[newPos]);
  broadcastState();
}

function triggerPopup(type, data) {
  gameState.activePopupEvent = { type, ...data, timestamp: Date.now() };
  io.emit('board_popup', gameState.activePopupEvent);
}

// 30-Minute Round Timer
setInterval(() => {
  if (gameState.roundStatus === 'ACTIVE') {
    gameState.roundTimeLeft -= 1;
    if (gameState.roundTimeLeft <= 0) {
      endRoundAndCrownWinners();
    }
  }
}, 1000);

function endRoundAndCrownWinners() {
  const sorted = Object.values(gameState.players)
    .sort((a, b) => (b.stars * 1000 + b.marbles) - (a.stars * 1000 + a.marbles));

  gameState.hallOfFame = sorted.slice(0, 4).map((p, idx) => ({
    rank: idx + 1,
    nickname: p.nickname,
    avatar: p.avatar,
    stars: p.stars,
    marbles: p.marbles,
    team: p.team
  }));

  logEvent('game', `🏆 จบรอบที่ ${gameState.roundNumber}! ยอดเศรษฐี 4 อันดับแรก: ${gameState.hallOfFame.map(h => h.nickname).join(', ')}`);

  triggerPopup('round_finish', {
    title: `🏆 แชมป์เกมเศรษฐีรอบที่ ${gameState.roundNumber}!`,
    winners: gameState.hallOfFame
  });

  gameState.roundNumber += 1;
  gameState.roundTimeLeft = gameState.settings.roundDuration;
  Object.values(gameState.players).forEach(p => {
    p.position = 0;
    p.stars = 0;
    p.marbles = 200;
    p.isJailed = false;
  });

  broadcastState();
}

function broadcastState() {
  io.emit('state_update', gameState);
}

// ==========================================
// SOCKET LISTENERS
// ==========================================
io.on('connection', socket => {
  socket.emit('state_update', gameState);

  socket.on('tiktok_connect', username => connectToTikTok(username));
  socket.on('tiktok_disconnect', () => disconnectTikTok());

  socket.on('admin_reset_round', () => {
    gameState.roundTimeLeft = gameState.settings.roundDuration;
    Object.values(gameState.players).forEach(p => {
      p.position = 0;
      p.stars = 0;
      p.marbles = 200;
      p.isJailed = false;
    });
    logEvent('system', 'แอดมินสั่งรีเซ็ตรอบกระดานใหม่');
    broadcastState();
  });

  socket.on('sim_join', (payload) => {
    handleChat({
      uniqueId: payload.username || 'user_' + Math.floor(Math.random() * 900 + 100),
      nickname: payload.nickname || 'เศรษฐีมือใหม่',
      profilePictureUrl: payload.avatar || '/assets/default-avatar-red.svg',
      comment: 'เล่น'
    });
  });

  socket.on('sim_roll', (payload) => {
    const playerKeys = Object.keys(gameState.players);
    const username = payload.username || (playerKeys.length > 0 ? playerKeys[Math.floor(Math.random() * playerKeys.length)] : null);
    if (username && gameState.players[username]) {
      handleChat({
        uniqueId: username,
        nickname: gameState.players[username].nickname,
        profilePictureUrl: gameState.players[username].avatar,
        comment: 'ทอย'
      });
    } else {
      const p = getOrCreatePlayer('test_player', 'สายทอยทิพย์', '/assets/default-avatar-blue.svg');
      rollDiceForPlayer(p, { isGolden: false, isFree: true });
    }
  });

  socket.on('sim_gift', (payload) => {
    const playerKeys = Object.keys(gameState.players);
    const username = payload.username || (playerKeys.length > 0 ? playerKeys[0] : 'vip_player');
    const player = gameState.players[username] || getOrCreatePlayer(username, 'ป๋าเปย์เบอร์หนึ่ง', '/assets/default-avatar-red.svg');

    handleGift({
      uniqueId: player.id,
      nickname: player.nickname,
      profilePictureUrl: player.avatar,
      giftName: payload.giftName || 'Rose',
      diamondCount: payload.diamonds || 1,
      repeatCount: 1
    });
  });

  socket.on('sim_jail', () => {
    const firstPlayer = Object.values(gameState.players)[0] || getOrCreatePlayer('jail_test', 'ผู้ต้องหาทดสอบ', '/assets/default-avatar-red.svg');
    firstPlayer.isJailed = true;
    firstPlayer.jailTurnsLeft = 3;
    firstPlayer.position = 23;
    triggerPopup('jail', {
      title: '⛓️ เข้าเกาะร้าง / สรรพากรเรียกพบ!',
      desc: `${firstPlayer.nickname} โดนจับติดเกาะร้าง!`,
      avatar: firstPlayer.avatar
    });
    broadcastState();
  });

  socket.on('sim_chance', () => {
    const firstPlayer = Object.values(gameState.players)[0] || getOrCreatePlayer('test_tycoon', 'เศรษฐีตัวตึง', '/assets/default-avatar-red.svg');
    drawChanceCard(firstPlayer);
    broadcastState();
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎲 LINE LET'S GET RICH STYLE BOARD GAME SERVER RUNNING!`);
  console.log(`🌐 Unified App (Game + Admin): http://localhost:${PORT}`);
  console.log(`====================================================`);
});
