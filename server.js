const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

let WebcastPushConnection = null;
try {
  WebcastPushConnection = require('tiktok-live-connector').WebcastPushConnection;
} catch (err) {
  console.log('TikTok Live Connector library ready.');
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html')));
app.get('/overlay', (req, res) => res.sendFile(path.join(__dirname, 'public', 'overlay', 'index.html')));

// ==========================================
// 24 BOARD TILES DEFINITION (วงสี่เหลี่ยมรอบจอ)
// ==========================================
const BOARD_TILES = [
  { id: 0,  type: 'start',   name: 'จุดเริ่มต้น',   desc: 'ครบรอบรับ ⭐ + 300 แต้ม', icon: '⭐', color: '#f59e0b', corner: true },
  { id: 1,  type: 'bonus',   name: 'โบนัสแต้ม',     desc: '+100 แต้ม',              icon: '🪙', color: '#10b981', points: 100 },
  { id: 2,  type: 'chance',  name: 'การ์ดดวง',      desc: 'สุ่มการ์ดพลิกเกม',       icon: '❓', color: '#eab308' },
  { id: 3,  type: 'bonus',   name: 'โบนัสแต้ม',     desc: '+200 แต้ม',              icon: '💰', color: '#10b981', points: 200 },
  { id: 4,  type: 'trap',    name: 'กับดักแกล้งเพื่อน', desc: 'พิมพ์ @ชื่อเพื่อนเพื่อแกล้ง', icon: '💣', color: '#a855f7' },
  { id: 5,  type: 'bonus_x', name: 'แต้มดับเบิ้ล',  desc: 'แต้ม x2 ในรอบนี้',       icon: '⚡', color: '#06b6d4', multiplier: 2 },
  { id: 6,  type: 'jail',    name: 'คุก / สรรพากร', desc: 'ขัง 3 เทิร์น (กุหลาบช่วยได้)', icon: '⛓️', color: '#ef4444', corner: true },
  { id: 7,  type: 'bonus',   name: 'โบนัสแต้ม',     desc: '+150 แต้ม',              icon: '🪙', color: '#10b981', points: 150 },
  { id: 8,  type: 'chance',  name: 'การ์ดดวง',      desc: 'สุ่มการ์ดพลิกเกม',       icon: '❓', color: '#eab308' },
  { id: 9,  type: 'bonus',   name: 'โบนัสแต้ม',     desc: '+300 แต้ม',              icon: '💰', color: '#10b981', points: 300 },
  { id: 10, type: 'trap_step', name: 'หลุมดำ',     desc: 'ถอยหลัง 3 ช่อง',         icon: '🌀', color: '#a855f7', step: -3 },
  { id: 11, type: 'bonus_x', name: 'โบนัส x3',     desc: 'แต้ม x3 พิเศษ',         icon: '🔥', color: '#06b6d4', multiplier: 3 },
  { id: 12, type: 'jackpot', name: 'แจ็กพอต',       desc: 'สุ่มรับแต้มมหาศาล',     icon: '👑', color: '#f59e0b', corner: true },
  { id: 13, type: 'bonus',   name: 'โบนัสแต้ม',     desc: '+200 แต้ม',              icon: '🪙', color: '#10b981', points: 200 },
  { id: 14, type: 'chance',  name: 'การ์ดดวง',      desc: 'สุ่มการ์ดพลิกเกม',       icon: '❓', color: '#eab308' },
  { id: 15, type: 'bonus',   name: 'โบนัสแต้ม',     desc: '+350 แต้ม',              icon: '💰', color: '#10b981', points: 350 },
  { id: 16, type: 'gotojail', name: 'ส่งเข้าคุก!', desc: 'โดนจับส่งคุกทันที',    icon: '🚨', color: '#ef4444' },
  { id: 17, type: 'bonus',   name: 'โบนัสแต้ม',     desc: '+250 แต้ม',              icon: '🪙', color: '#10b981', points: 250 },
  { id: 18, type: 'rest',    name: 'โรงแรมหรู',     desc: 'พักผ่อน + ได้ออร่าทอง',  icon: '🏨', color: '#f59e0b', corner: true },
  { id: 19, type: 'bonus',   name: 'โบนัสแต้ม',     desc: '+400 แต้ม',              icon: '💰', color: '#10b981', points: 400 },
  { id: 20, type: 'chance',  name: 'การ์ดดวง',      desc: 'สุ่มการ์ดพลิกเกม',       icon: '❓', color: '#eab308' },
  { id: 21, type: 'trap_steal', name: 'ดูดแต้ม',    desc: 'ดูดแต้มคนข้างๆ 100 แต้ม', icon: '🧲', color: '#a855f7' },
  { id: 22, type: 'bonus_x', name: 'แต้ม x2',       desc: 'แต้ม x2 มั่งคั่ง',       icon: '⚡', color: '#06b6d4', multiplier: 2 },
  { id: 23, type: 'bonus',   name: 'โค้งสุดท้าย',   desc: '+150 แต้มก่อนเข้าเส้นชัย', icon: '🏁', color: '#10b981', points: 150 }
];

// CHANCE CARDS POOL
const CHANCE_CARDS = [
  { id: 'tycoon', title: 'ยศเศรษฐีชั่วคราว', desc: 'ได้รับโบนัสทันที +500 แต้ม!', points: 500, type: 'points' },
  { id: 'steal_first', title: 'ขโมยแต้มอันดับ 1', desc: 'ขโมยแต้มจากอันดับ 1 มา 15%!', type: 'steal_first' },
  { id: 'swap_lead', title: 'สลับร่างคนข้างหน้า', desc: 'สลับตำแหน่งกับผู้เล่นที่อยู่ข้างหน้าคุณ!', type: 'swap' },
  { id: 'tax_audit', title: 'สรรพากรตรวจสอบ', desc: 'เสียภาษีให้รัฐ -150 แต้ม', points: -150, type: 'points' },
  { id: 'free_boost', title: 'สปีดโบ๊ทเร่งด่วน', desc: 'พุ่งไปข้างหน้าอีก 3 ช่องทันที!', steps: 3, type: 'move' },
  { id: 'golden_ticket', title: 'ตั๋วทองคำ', desc: 'ได้รับลูกเต๋าทองคำในรอบถัดไป!', type: 'golden_dice' }
];

// DEFAULT SETTINGS
const SETTINGS = {
  freeRollCooldown: 120, // 2 minutes cooldown for free roll
  likesPerRoll: 50,      // 50 likes gives 1 roll
  roundDuration: 1800,   // 30 minutes round
  maxVisiblePlayers: 35, // max visible tokens to prevent clutter
  inactivityTimeout: 300 // 5 minutes inactivity hides token
};

// GAME STATE
let gameState = {
  board: BOARD_TILES,
  players: {},          // key: username -> player object
  hallOfFame: [],       // Top 3 of previous round
  roundNumber: 1,
  roundTimeLeft: SETTINGS.roundDuration,
  roundStatus: 'ACTIVE', // 'ACTIVE', 'PAUSED'
  currentRollAnimation: null, // { player, dice1, dice2, total, isGolden, isWarp }
  activePopupEvent: null,    // { type: 'chance'|'jail'|'star'|'warp', ... }
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
        console.log(`[TikTok] Connected to @${cleanUsername} (Room: ${state.roomId})`);
        gameState.tiktok.isConnected = true;
        gameState.tiktok.lastError = null;
        broadcastState();
        logEvent('system', `เชื่อมต่อห้องสด @${cleanUsername} สำเร็จ!`);
      })
      .catch(err => {
        console.error('[TikTok] Error:', err.message);
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
// CORE BOARD GAME MECHANICS
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

// Get or register player
function getOrCreatePlayer(uniqueId, nickname, avatar) {
  if (!gameState.players[uniqueId]) {
    gameState.players[uniqueId] = {
      id: uniqueId,
      nickname: nickname || uniqueId,
      avatar: avatar || '/assets/default-avatar-red.svg',
      position: 0,            // Start at tile 0
      stars: 0,               // ⭐ Lap count
      points: 0,              // Leaderboard score
      isJailed: false,        // In Jail
      jailTurnsLeft: 0,       // 3 turns lock
      isGoldenDice: false,    // Double move next turn
      hasAura: false,         // Cosmetic golden aura
      lastRollTime: 0,        // Timestamp of last roll
      likesContributed: 0,    // Likes counter for free roll
      lastActiveTime: Date.now(),
      pendingTrap: false      // Waiting for @friend
    };
    logEvent('game', `🎉 ${nickname} ลงทะเบียนเข้าสู่กระดานเศรษฐีที่จุดเริ่มต้น!`, { avatar });
  } else {
    // Update player info & active time
    gameState.players[uniqueId].lastActiveTime = Date.now();
    if (nickname) gameState.players[uniqueId].nickname = nickname;
    if (avatar) gameState.players[uniqueId].avatar = avatar;
  }
  return gameState.players[uniqueId];
}

// 1. Handle Chat
function handleChat(data) {
  const comment = (data.comment || '').trim();
  const commentLower = comment.toLowerCase();
  const username = data.uniqueId || 'viewer';
  const nickname = data.nickname || username;
  const avatar = data.profilePictureUrl || '';

  // Register command ("เล่น" หรือ "เข้าเกม")
  if (commentLower === 'เล่น' || commentLower === 'เข้าเกม' || commentLower === 'join' || commentLower === 'start') {
    getOrCreatePlayer(username, nickname, avatar);
    broadcastState();
    return;
  }

  // Roll command ("ทอย" หรือ "เดิน")
  if (commentLower === 'ทอย' || commentLower === 'เดิน' || commentLower === 'roll') {
    const player = getOrCreatePlayer(username, nickname, avatar);
    
    // Check if player is in jail
    if (player.isJailed) {
      if (player.jailTurnsLeft > 0) {
        player.jailTurnsLeft -= 1;
        if (player.jailTurnsLeft <= 0) {
          player.isJailed = false;
          logEvent('game', `⛓️ ${player.nickname} รับโทษครบกำหนด ได้รับการปล่อยตัวจากคุก!`);
        } else {
          logEvent('game', `⛓️ ${player.nickname} ยังติดคุกอยู่! (เหลืออีก ${player.jailTurnsLeft} เทิร์น หรือส่งกุหลาบเพื่อประกันตัว)`);
          broadcastState();
          return;
        }
      }
    }

    // Check cooldown for free roll (2 minutes)
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

    // Perform Normal Roll
    player.lastRollTime = now;
    rollDiceForPlayer(player, { isGolden: player.isGoldenDice, isFree: true });
    player.isGoldenDice = false;
    return;
  }

  // Check if player is resolving a Trap (@friend)
  if (comment.includes('@')) {
    const player = gameState.players[username];
    if (player && player.pendingTrap) {
      player.pendingTrap = false;
      const targetMatch = comment.match(/@([a-zA-Z0-9_.]+)/);
      if (targetMatch && targetMatch[1]) {
        const targetUsername = targetMatch[1];
        const targetPlayer = gameState.players[targetUsername];
        if (targetPlayer) {
          // Trap target: send to jail or knock back 5 tiles
          targetPlayer.isJailed = true;
          targetPlayer.jailTurnsLeft = 3;
          targetPlayer.position = 6; // Jail tile
          logEvent('game', `💣 ${player.nickname} แกล้งสำเร็จ! สั่งส่ง @${targetPlayer.nickname} เข้าคุกทันที!`);
          triggerPopup('jail', {
            title: `💣 โดนแกล้งส่งเข้าคุก!`,
            desc: `@${player.nickname} สั่งขัง @${targetPlayer.nickname} 3 เทิร์น!`,
            avatar: targetPlayer.avatar
          });
          broadcastState();
          return;
        }
      }
    }
  }

  // Regular chat bubble
  io.emit('chat_bubble', { username, nickname, avatar, comment });
  logEvent('chat', `${nickname}: "${comment}"`, { avatar });
}

// 2. Handle Likes (กดหัวใจครบ 50 ครั้ง = 1 สิทธิ์ทอย)
function handleLike(data) {
  const count = data.likeCount || 1;
  const totalLikes = data.totalLikes || (gameState.tiktok.likeCount + count);
  gameState.tiktok.likeCount = totalLikes;

  const username = data.uniqueId;
  if (username && gameState.players[username]) {
    const player = gameState.players[username];
    player.likesContributed += count;
    if (player.likesContributed >= gameState.settings.likesPerRoll) {
      player.likesContributed = 0;
      // Free roll unlocked via likes!
      logEvent('game', `❤️ ${player.nickname} เคาะจอครบ 50 ครั้ง ปลดล็อกสิทธิ์ทอยฟรี!`);
      rollDiceForPlayer(player, { isGolden: player.isGoldenDice, isFree: true });
      player.isGoldenDice = false;
    }
  }
  io.emit('like_burst', { count });
}

// 3. Handle Gifts (สายเปย์)
function handleGift(data) {
  const giftName = data.giftName || 'Gift';
  const diamondCount = (data.diamondCount || 1) * (data.repeatCount || 1);
  const username = data.uniqueId || 'supporter';
  const nickname = data.nickname || username;
  const avatar = data.profilePictureUrl || '';

  const player = getOrCreatePlayer(username, nickname, avatar);

  // If in Jail -> Rose or any gift = Bail out!
  if (player.isJailed) {
    player.isJailed = false;
    player.jailTurnsLeft = 0;
    logEvent('game', `🔓 ${nickname} ส่ง ${giftName} ประกันตัวออกจากคุกสำเร็จ! พร้อมก้าวเดินต่อ!`, { avatar });
    triggerPopup('jail_free', {
      title: '🔓 ประกันตัวสำเร็จ!',
      desc: `${nickname} ได้รับอิสรภาพแล้ว!`,
      avatar: player.avatar
    });
  }

  // Tier 1: 1-5 Coins (กุหลาบ) -> ทอยลูกเต๋าเพิ่มทันที 1 ครั้ง (ข้ามคูลดาวน์)
  if (diamondCount >= 1 && diamondCount < 30) {
    logEvent('gift', `🌹 ${nickname} ส่ง ${giftName} x${data.repeatCount || 1} ทอยลูกเต๋าเพิ่มทันที!`, { avatar });
    rollDiceForPlayer(player, { isGolden: false, isFree: false });
  }
  // Tier 2: 30-99 Coins (โดนัท / ของขวัญกลาง) -> ได้ "ลูกเต๋าทองคำ" เดินเบิ้ล 2 เท่า + ออร่าทอง
  else if (diamondCount >= 30 && diamondCount < 100) {
    player.hasAura = true;
    player.isGoldenDice = true;
    logEvent('gift', `🍩 ${nickname} ส่ง ${giftName} ปลุกพลัง "ลูกเต๋าทองคำ" เดินเบิ้ล 2 เท่า!`, { avatar });
    rollDiceForPlayer(player, { isGolden: true, isFree: false });
  }
  // Tier 3: 100+ Coins (ของขวัญใหญ่) -> กด "วาร์ป (Teleport)" พุ่ง 15 ช่องทันที + ชนคนอื่นถอยหลัง 3 ช่อง!
  else if (diamondCount >= 100) {
    logEvent('gift', `🚀 ${nickname} ส่ง ${giftName} มหาของขวัญ! "วาร์ปมหาเศรษฐี" พุ่ง 15 ช่อง!`, { avatar });
    performTeleportWarp(player, 15);
  }

  broadcastState();
}

// Roll Dice & Move Player
function rollDiceForPlayer(player, opts = {}) {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = opts.isGolden ? Math.floor(Math.random() * 6) + 1 : 0;
  const totalSteps = opts.isGolden ? (dice1 * 2) : dice1;

  // Broadcast dice animation to overlay
  gameState.currentRollAnimation = {
    player: { id: player.id, nickname: player.nickname, avatar: player.avatar },
    dice1,
    dice2,
    totalSteps,
    isGolden: opts.isGolden
  };
  io.emit('dice_roll', gameState.currentRollAnimation);

  // Animate movement step-by-step
  setTimeout(() => {
    movePlayerSteps(player, totalSteps);
  }, 1200);
}

// Move player step by step and resolve tile
function movePlayerSteps(player, steps) {
  const oldPos = player.position;
  let newPos = (oldPos + steps);

  // Check Lap Completion (ผ่าน/ครบรอบจุดเริ่มต้น)
  if (newPos >= 24) {
    newPos = newPos % 24;
    player.stars += 1;
    player.points += 300; // Lap bonus
    logEvent('game', `⭐ ${player.nickname} ครบรอบกระดาน! ได้รับดาวดวงที่ ${player.stars} + 300 แต้ม!`, { avatar: player.avatar });
    triggerPopup('star', {
      title: '⭐ ครบรอบกระดานสำเร็จ!',
      desc: `${player.nickname} ได้รับดาวดวงที่ ${player.stars}!`,
      avatar: player.avatar
    });
  }

  player.position = newPos;
  resolveTileLanding(player, BOARD_TILES[newPos]);
  broadcastState();
}

// Resolve Tile Effect
function resolveTileLanding(player, tile) {
  logEvent('game', `📍 ${player.nickname} เดินมาตกช่อง [${tile.name}] (${tile.desc})`);

  switch (tile.type) {
    case 'bonus':
      player.points += (tile.points || 100);
      break;

    case 'bonus_x':
      player.points += Math.floor(player.points * 0.2) + 200;
      break;

    case 'jackpot':
      const jackpotReward = Math.floor(Math.random() * 500) + 500;
      player.points += jackpotReward;
      triggerPopup('jackpot', {
        title: '👑 แตกแจ็กพอต!',
        desc: `${player.nickname} ได้รับแต้มมหาศาล +${jackpotReward} แต้ม!`,
        avatar: player.avatar
      });
      break;

    case 'chance':
      drawChanceCard(player);
      break;

    case 'jail':
    case 'gotojail':
      player.isJailed = true;
      player.jailTurnsLeft = 3;
      player.position = 6; // Move to Jail tile
      triggerPopup('jail', {
        title: '⛓️ เข้าคุก / สรรพากรเรียกพบ!',
        desc: `${player.nickname} ติดคุก 3 เทิร์น (หรือส่งกุหลาบประกันตัว)`,
        avatar: player.avatar
      });
      break;

    case 'trap':
      player.pendingTrap = true;
      triggerPopup('trap', {
        title: '💣 กับดักแกล้งเพื่อน!',
        desc: `พิมพ์ @ชื่อเพื่อน ในแชทเพื่อสั่งส่งเพื่อนเข้าคุก!`,
        avatar: player.avatar
      });
      break;

    case 'trap_step':
      player.position = (player.position + (tile.step || -3) + 24) % 24;
      logEvent('game', `🌀 ${player.nickname} โดนหลุมดำดูด ถอยหลัง 3 ช่อง!`);
      break;

    case 'rest':
      player.hasAura = true;
      player.points += 150;
      break;

    default:
      break;
  }
}

// Draw Chance Card
function drawChanceCard(player) {
  const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
  logEvent('game', `❓ ${player.nickname} เปิดการ์ดดวง: [${card.title}] - ${card.desc}`, { avatar: player.avatar });

  if (card.type === 'points') {
    player.points = Math.max(0, player.points + (card.points || 0));
  } else if (card.type === 'steal_first') {
    const sorted = Object.values(gameState.players).sort((a, b) => (b.stars * 1000 + b.points) - (a.stars * 1000 + a.points));
    if (sorted.length > 1 && sorted[0].id !== player.id) {
      const target = sorted[0];
      const stolen = Math.floor(target.points * 0.15);
      target.points -= stolen;
      player.points += stolen;
      logEvent('game', `🦹 ${player.nickname} ขโมยแต้มจาก ${target.nickname} มาได้ ${stolen} แต้ม!`);
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
    movePlayerSteps(player, card.steps || 3);
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

// Perform Teleport Warp (100+ coin gift)
function performTeleportWarp(player, steps = 15) {
  const oldPos = player.position;
  let newPos = (oldPos + steps);

  if (newPos >= 24) {
    newPos = newPos % 24;
    player.stars += 1;
    player.points += 500;
  }

  player.position = newPos;

  // Knock backward any players in destination tile!
  const knockedPlayers = Object.values(gameState.players).filter(p => p.id !== player.id && p.position === newPos);
  knockedPlayers.forEach(kp => {
    kp.position = (kp.position - 3 + 24) % 24;
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

// Round Timer Tick (30 mins countdown)
setInterval(() => {
  if (gameState.roundStatus === 'ACTIVE') {
    gameState.roundTimeLeft -= 1;
    if (gameState.roundTimeLeft <= 0) {
      endRoundAndCrownWinners();
    }
  }
}, 1000);

// End Round and populate Hall of Fame
function endRoundAndCrownWinners() {
  const sorted = Object.values(gameState.players)
    .sort((a, b) => (b.stars * 1000 + b.points) - (a.stars * 1000 + a.points));

  gameState.hallOfFame = sorted.slice(0, 3).map((p, idx) => ({
    rank: idx + 1,
    nickname: p.nickname,
    avatar: p.avatar,
    stars: p.stars,
    points: p.points
  }));

  logEvent('game', `🏆 จบรอบที่ ${gameState.roundNumber}! ผู้ครองแท่นเกียรติยศ Hall of Fame: ${gameState.hallOfFame.map(h => h.nickname).join(', ')}`);

  triggerPopup('round_finish', {
    title: `🏆 แชมป์เศรษฐีรอบที่ ${gameState.roundNumber}!`,
    winners: gameState.hallOfFame
  });

  // Reset board for new round
  gameState.roundNumber += 1;
  gameState.roundTimeLeft = gameState.settings.roundDuration;
  Object.values(gameState.players).forEach(p => {
    p.position = 0;
    p.stars = 0;
    p.points = 0;
    p.isJailed = false;
  });

  broadcastState();
}

function broadcastState() {
  io.emit('state_update', gameState);
}

// ==========================================
// SOCKET.IO LISTENERS
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
      p.points = 0;
      p.isJailed = false;
    });
    logEvent('system', 'แอดมินสั่งรีเซ็ตรอบกระดานใหม่');
    broadcastState();
  });

  socket.on('admin_update_settings', newSettings => {
    gameState.settings = { ...gameState.settings, ...newSettings };
    logEvent('system', 'อัปเดตการตั้งค่าระบบแล้ว');
    broadcastState();
  });

  // Simulator Events for Testing
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
    firstPlayer.position = 6;
    triggerPopup('jail', {
      title: '⛓️ เข้าคุก / สรรพากรเรียกพบ!',
      desc: `${firstPlayer.nickname} โดนจับติดคุก!`,
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
  console.log(`🎲 TIKTOK LIVE INTERACTIVE BOARD GAME SERVER RUNNING!`);
  console.log(`🌐 OBS Overlay:   http://localhost:${PORT}/overlay`);
  console.log(`⚙️ Admin Panel:   http://localhost:${PORT}/admin`);
  console.log(`====================================================`);
});
