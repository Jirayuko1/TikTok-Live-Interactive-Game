// Connect to Socket.IO
const socket = io();

// UI Elements: HUD 4 Corners
const hudP1 = { root: document.getElementById('hudP1'), avatar: document.getElementById('p1Avatar'), nick: document.getElementById('p1Nick'), marbles: document.getElementById('p1Marbles'), stars: document.getElementById('p1Stars') };
const hudP2 = { root: document.getElementById('hudP2'), avatar: document.getElementById('p2Avatar'), nick: document.getElementById('p2Nick'), marbles: document.getElementById('p2Marbles'), stars: document.getElementById('p2Stars') };
const hudP3 = { root: document.getElementById('hudP3'), avatar: document.getElementById('p3Avatar'), nick: document.getElementById('p3Nick'), marbles: document.getElementById('p3Marbles'), stars: document.getElementById('p3Stars') };
const hudP4 = { root: document.getElementById('hudP4'), avatar: document.getElementById('p4Avatar'), nick: document.getElementById('p4Nick'), marbles: document.getElementById('p4Marbles'), stars: document.getElementById('p4Stars') };
const cornerHUDs = [hudP1, hudP2, hudP3, hudP4];

// Center Pond HUD
const roundTimerText = document.getElementById('roundTimerText');
const roundNumText = document.getElementById('roundNumText');
const jackpotPoolText = document.getElementById('jackpotPoolText');
const centerRollBtn = document.getElementById('centerRollBtn');

// Dice Showcase & Popups
const diceShowcase = document.getElementById('diceShowcase');
const rollerImg = document.getElementById('rollerImg');
const rollerName = document.getElementById('rollerName');
const dice1 = document.getElementById('dice1');
const dice2 = document.getElementById('dice2');
const diceSummary = document.getElementById('diceSummary');

const eventPopup = document.getElementById('eventPopup');
const popupIcon = document.getElementById('popupIcon');
const popupTitle = document.getElementById('popupTitle');
const popupDesc = document.getElementById('popupDesc');
const popupAvatar = document.getElementById('popupAvatar');

const chatBubbleLayer = document.getElementById('chatBubbleLayer');
const tilesContainer = document.getElementById('tilesContainer');

// Sidebar & Layout Controls
const adminSidebar = document.getElementById('adminSidebar');
const toggleAdminBtn = document.getElementById('toggleAdminBtn');
const toggleAdminText = document.getElementById('toggleAdminText');
const obsModeBtn = document.getElementById('obsModeBtn');
const viewModeToggleBtn = document.getElementById('viewModeToggleBtn');
const viewModeToggleText = document.getElementById('viewModeToggleText');
const gameArenaWrapper = document.getElementById('gameArenaWrapper');

const sideUsernameInput = document.getElementById('sideUsernameInput');
const sideConnectBtn = document.getElementById('sideConnectBtn');
const sideDisconnectBtn = document.getElementById('sideDisconnectBtn');
const sideConnStatus = document.getElementById('sideConnStatus');
const sideViewerCount = document.getElementById('sideViewerCount');
const sideLikeCount = document.getElementById('sideLikeCount');
const sidePlayerCount = document.getElementById('sidePlayerCount');
const sidePlayerTable = document.getElementById('sidePlayerTable');
const sideEventLog = document.getElementById('sideEventLog');
const sideClearLogBtn = document.getElementById('sideClearLogBtn');
const sideResetBtn = document.getElementById('sideResetBtn');

const tiktokPill = document.getElementById('tiktokPill');
const tiktokPillText = document.getElementById('tiktokPillText');

const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// ==========================================
// AUDIO SYNTHESIZER (Web Audio API)
// ==========================================
class RichSoundFX {
  constructor() {
    this.ctx = null;
  }
  ensure() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playDice() {
    this.ensure();
    if (!this.ctx) return;
    try {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(320 + Math.random() * 200, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.08);
        }, i * 70);
      }
    } catch(e) {}
  }
  playStep() {
    this.ensure();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, this.ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch(e) {}
  }
  playCoin() {
    this.ensure();
    if (!this.ctx) return;
    try {
      const notes = [987.77, 1318.51];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.25);
        }, idx * 90);
      });
    } catch(e) {}
  }
  playFanfare() {
    this.ensure();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.4);
        }, idx * 110);
      });
    } catch(e) {}
  }
}
const sfx = new RichSoundFX();
window.addEventListener('click', () => sfx.ensure(), { once: true });

// ==========================================
// 32 TILES GRID COORDINATE GENERATOR (9x9)
// ==========================================
const TILE_COORDS = [
  // Side 1 (Start -> Train): 8 tiles (row 9, col 9) -> (row 1, col 9)
  { row: 9, col: 9 }, // 0: Start
  { row: 8, col: 9 }, // 1: กรุงเทพ
  { row: 7, col: 9 }, // 2: เชียงใหม่
  { row: 6, col: 9 }, // 3: ดวง
  { row: 5, col: 9 }, // 4: ภูเก็ต
  { row: 4, col: 9 }, // 5: ปัตตานี
  { row: 3, col: 9 }, // 6: พัทยา
  { row: 2, col: 9 }, // 7: Train Travel (Corner)

  // Side 2 (Train -> Expo): 8 tiles (row 1, col 9) -> (row 1, col 1)
  { row: 1, col: 8 }, // 8: บุรีรัมย์
  { row: 1, col: 7 }, // 9: ขอนแก่น
  { row: 1, col: 6 }, // 10: โคราช
  { row: 1, col: 5 }, // 11: ดวง
  { row: 1, col: 4 }, // 12: พิษณุโลก
  { row: 1, col: 3 }, // 13: เกาะพะงัน
  { row: 1, col: 2 }, // 14: หัวหิน
  { row: 1, col: 1 }, // 15: Expo (Corner)

  // Side 3 (Expo -> Jail): 8 tiles (row 2, col 1) -> (row 9, col 1)
  { row: 2, col: 1 }, // 16: จันทบุรี
  { row: 3, col: 1 }, // 17: เกาะเสม็ด
  { row: 4, col: 1 }, // 18: ระยอง
  { row: 5, col: 1 }, // 19: ดวง
  { row: 6, col: 1 }, // 20: ราชบุรี
  { row: 7, col: 1 }, // 21: สุพรรณบุรี
  { row: 8, col: 1 }, // 22: กับดัก
  { row: 9, col: 1 }, // 23: Jail Island (Corner)

  // Side 4 (Jail -> Start): 8 tiles (row 9, col 2) -> (row 9, col 8)
  { row: 9, col: 2 }, // 24: อยุธยา
  { row: 9, col: 3 }, // 25: สมุทรปราการ
  { row: 9, col: 4 }, // 26: นครสวรรค์
  { row: 9, col: 5 }, // 27: ดวง
  { row: 9, col: 6 }, // 28: เกาะช้าง
  { row: 9, col: 7 }, // 29: นครปฐม
  { row: 9, col: 8 }, // 30: ห้องเกม
  { row: 9, col: 8.5 } // 31: ลพบุรี
];

let tileElements = [];

function initBoard32Tiles(tiles) {
  tilesContainer.innerHTML = '';
  tileElements = [];

  tiles.forEach((t, idx) => {
    const pos = TILE_COORDS[idx] || { row: 1, col: 1 };
    const div = document.createElement('div');
    div.className = `tile-cube ${t.corner ? 'corner-tile' : ''}`;
    div.id = `tile_${idx}`;
    div.style.gridRow = Math.floor(pos.row);
    div.style.gridColumn = Math.floor(pos.col);

    let priceTag = t.points ? `+${t.points}M` : (t.multiplier ? `x${t.multiplier}` : '');
    let tagBg = t.color || '#3b82f6';

    div.innerHTML = `
      <div class="tile-badge" style="background: ${t.color}">${idx}</div>
      <div class="tile-main-icon">${t.icon}</div>
      <div class="tile-label-th" title="${t.name}">${t.name}</div>
      ${priceTag ? `<div class="tile-cost-tag" style="background: ${tagBg}">${priceTag}</div>` : ''}
      <div id="tile_box_${idx}" class="tile-players-box"></div>
    `;

    tilesContainer.appendChild(div);
    tileElements.push(div);
  });
}

// ==========================================
// STATE UPDATE & HUD RENDERING
// ==========================================
let currentGameState = null;
let diceTimeout = null;
let popupTimeout = null;

socket.on('state_update', (state) => {
  currentGameState = state;

  if (tileElements.length === 0 && state.board) {
    initBoard32Tiles(state.board);
  }

  // Timer
  const mins = Math.floor(state.roundTimeLeft / 60);
  const secs = state.roundTimeLeft % 60;
  roundTimerText.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  roundNumText.innerText = state.roundNumber;

  // Render 4 Corner HUDs
  renderCornerHUDs(state.players);

  // Render 3D Chibi Tokens on 32 Tiles
  renderTokensOnBoard(state.players);

  // Render Sidebar
  renderSidebar(state);
});

function renderCornerHUDs(players) {
  const sorted = Object.values(players || {})
    .sort((a, b) => (b.stars * 1000 + b.marbles) - (a.stars * 1000 + a.marbles));

  for (let i = 0; i < 4; i++) {
    const hud = cornerHUDs[i];
    const p = sorted[i];
    if (p) {
      hud.root.style.opacity = '1';
      hud.avatar.src = p.avatar || (p.team === 'red' ? '/assets/default-avatar-red.svg' : '/assets/default-avatar-blue.svg');
      hud.nick.innerText = p.nickname;
      hud.marbles.innerText = `${p.marbles}M`;
      hud.stars.innerText = p.stars;
    } else {
      hud.root.style.opacity = '0.45';
      hud.nick.innerText = 'รอผู้เล่น...';
      hud.marbles.innerText = '200M';
      hud.stars.innerText = '0';
    }
  }
}

// ==========================================
// ✨ RENDER 3D CHIBI FIGURINES ON TILES
// ==========================================
function renderTokensOnBoard(players) {
  for (let i = 0; i < 32; i++) {
    const box = document.getElementById(`tile_box_${i}`);
    if (box) box.innerHTML = '';
  }

  Object.values(players || {}).forEach(p => {
    const box = document.getElementById(`tile_box_${p.position}`);
    if (!box) return;

    const chibi = document.createElement('div');
    chibi.className = `chibi-char ${p.hasAura ? 'has-aura' : ''} ${p.isJailed ? 'is-jailed' : ''}`;
    chibi.id = `token_${p.id}`;
    chibi.title = `${p.nickname} (${p.marbles}M | ⭐${p.stars})`;

    const teamClass = p.team || (p.position % 2 === 0 ? 'red' : 'blue');
    const avatarUrl = p.avatar || (teamClass === 'red' ? '/assets/default-avatar-red.svg' : '/assets/default-avatar-blue.svg');

    chibi.innerHTML = `
      <!-- Soft Ground Shadow -->
      <div class="chibi-shadow"></div>

      <!-- Floating Name Tag -->
      <div class="chibi-nametag ${teamClass}">
        ${p.stars > 0 ? `<span>⭐${p.stars}</span>` : ''}
        <span>${escapeHtml(p.nickname)}</span>
      </div>

      <!-- 3D Chibi Head with Avatar Face -->
      <div class="chibi-head ${teamClass}">
        <img src="${avatarUrl}" class="chibi-face" alt="${p.nickname}">
      </div>

      <!-- Cute Chibi Torso (Jacket) with Arms -->
      <div class="chibi-torso ${teamClass}">
        <div class="chibi-arm left"></div>
        <div class="chibi-arm right"></div>
      </div>

      <!-- Chibi Legs & Sneakers -->
      <div class="chibi-legs">
        <div class="chibi-foot"></div>
        <div class="chibi-foot"></div>
      </div>

      <!-- Jail State Chain (if jailed) -->
      ${p.isJailed ? '<div class="chibi-jail-chain">⛓️</div>' : ''}
    `;

    box.appendChild(chibi);
  });
}

function renderSidebar(state) {
  if (state.tiktok.isConnected) {
    sideConnStatus.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800";
    sideConnStatus.innerText = "เชื่อมต่อสด";
    tiktokPill.className = "text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-semibold flex items-center gap-1.5";
    tiktokPillText.innerText = `@${state.tiktok.username}`;
    sideConnectBtn.classList.add('hidden');
    sideDisconnectBtn.classList.remove('hidden');
  } else {
    sideConnStatus.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800";
    sideConnStatus.innerText = "ออฟไลน์";
    tiktokPill.className = "text-[11px] px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 font-semibold flex items-center gap-1.5";
    tiktokPillText.innerText = "ออฟไลน์";
    sideConnectBtn.classList.remove('hidden');
    sideDisconnectBtn.classList.add('hidden');
  }

  sideViewerCount.innerText = Number(state.tiktok.viewerCount || 0).toLocaleString();
  sideLikeCount.innerText = Number(state.tiktok.likeCount || 0).toLocaleString();

  const playerList = Object.values(state.players || {});
  sidePlayerCount.innerText = playerList.length;

  if (playerList.length === 0) {
    sidePlayerTable.innerHTML = `<tr><td class="text-slate-500 italic text-center py-4">ยังไม่มีผู้เล่น</td></tr>`;
    return;
  }

  sidePlayerTable.innerHTML = playerList.map(p => {
    const tileName = state.board && state.board[p.position] ? `${state.board[p.position].icon} #${p.position} ${state.board[p.position].name}` : `#${p.position}`;
    return `
      <tr class="hover:bg-slate-900">
        <td class="py-1 px-1 flex items-center gap-1.5">
          <img src="${p.avatar || '/assets/default-avatar-red.svg'}" class="w-4 h-4 rounded-full">
          <span class="font-bold text-slate-200 truncate max-w-[80px]">${escapeHtml(p.nickname)}</span>
        </td>
        <td class="py-1 px-1 text-slate-400">${tileName}</td>
        <td class="py-1 px-1 text-amber-300 font-bold">⭐${p.stars}</td>
        <td class="py-1 px-1 text-sky-300 font-bold">${p.marbles}M</td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// DICE ROLL SHOWCASE
// ==========================================
socket.on('dice_roll', (data) => {
  sfx.playDice();
  clearTimeout(diceTimeout);

  rollerImg.src = data.player.avatar || '/assets/default-avatar-red.svg';
  rollerName.innerText = `${data.player.nickname} กำลังทอย...`;

  // Animate chibi jumping
  const activeToken = document.getElementById(`token_${data.player.id}`);
  if (activeToken) activeToken.classList.add('jumping');

  dice1.innerText = '🎲';
  if (data.isGolden) {
    dice2.classList.remove('hidden');
    dice2.innerText = '🎲';
  } else {
    dice2.classList.add('hidden');
  }

  diceSummary.innerText = data.isGolden ? '✨ ลูกเต๋าทองคำเดินเบิ้ล 2 เท่า!' : 'กำลังสุ่มลูกเต๋า...';
  diceShowcase.classList.remove('hidden');

  setTimeout(() => {
    sfx.playStep();
    dice1.innerText = DICE_FACES[data.dice1] || '⚅';
    if (data.isGolden) {
      dice2.innerText = DICE_FACES[data.dice2 || data.dice1] || '⚅';
      diceSummary.innerText = `🎲 ได้เลข ${data.dice1} x 2 = ${data.totalSteps} ช่อง!`;
    } else {
      diceSummary.innerText = `🎲 ได้เลข ${data.totalSteps} ช่อง!`;
    }

    if (activeToken) activeToken.classList.remove('jumping');

    diceTimeout = setTimeout(() => {
      diceShowcase.classList.add('hidden');
    }, 2500);
  }, 900);
});

// ==========================================
// POPUP EVENTS
// ==========================================
socket.on('board_popup', (data) => {
  clearTimeout(popupTimeout);

  if (data.type === 'star') {
    sfx.playFanfare();
    popupIcon.innerText = '⭐';
  } else if (data.type === 'jail') {
    popupIcon.innerText = '⛓️';
  } else if (data.type === 'jackpot') {
    sfx.playCoin();
    popupIcon.innerText = '👑';
  } else if (data.type === 'warp') {
    sfx.playCoin();
    popupIcon.innerText = '🚀';
  } else {
    sfx.playCoin();
    popupIcon.innerText = '❓';
  }

  popupTitle.innerText = data.title;
  popupDesc.innerText = data.desc;
  if (data.avatar) {
    popupAvatar.src = data.avatar;
    popupAvatar.classList.remove('hidden');
  } else {
    popupAvatar.classList.add('hidden');
  }

  eventPopup.classList.remove('hidden');
  popupTimeout = setTimeout(() => {
    eventPopup.classList.add('hidden');
  }, 4000);
});

// ==========================================
// CHAT BUBBLES
// ==========================================
socket.on('chat_bubble', (data) => {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble-item';

  bubble.innerHTML = `
    <img src="${data.avatar || '/assets/default-avatar-red.svg'}">
    <span><b>${escapeHtml(data.nickname)}:</b> ${escapeHtml(data.comment)}</span>
  `;

  const token = document.getElementById(`token_${data.username}`);
  if (token) {
    const rect = token.getBoundingClientRect();
    bubble.style.left = `${rect.left}px`;
    bubble.style.top = `${rect.top - 35}px`;
  } else {
    bubble.style.left = `${window.innerWidth * 0.35 + (Math.random() - 0.5) * 80}px`;
    bubble.style.top = `${window.innerHeight * 0.45 + (Math.random() - 0.5) * 60}px`;
  }

  chatBubbleLayer.appendChild(bubble);
  setTimeout(() => bubble.remove(), 4000);
});

// ==========================================
// SIDEBAR EVENTS & LOGS
// ==========================================
socket.on('new_event', (event) => {
  if (sideEventLog.querySelector('.italic')) sideEventLog.innerHTML = '';

  const div = document.createElement('div');
  div.className = "flex items-start gap-1.5 p-1 bg-slate-900/60 rounded";
  div.innerHTML = `
    <span class="text-slate-500 shrink-0">${event.time}</span>
    <span class="text-slate-200 break-words">${event.text}</span>
  `;
  sideEventLog.prepend(div);
  while (sideEventLog.children.length > 40) sideEventLog.removeChild(sideEventLog.lastChild);
});

sideClearLogBtn.addEventListener('click', () => {
  sideEventLog.innerHTML = '<div class="text-slate-500 italic text-center py-3">ล้างแล้ว</div>';
});

// Sidebar Buttons
sideConnectBtn.addEventListener('click', () => {
  const user = sideUsernameInput.value.trim();
  if (user) socket.emit('tiktok_connect', user);
});
sideDisconnectBtn.addEventListener('click', () => socket.emit('tiktok_disconnect'));

sideResetBtn.addEventListener('click', () => {
  if (confirm('คุณต้องการรีเซ็ตรอบกระดานใหม่หรือไม่?')) {
    socket.emit('admin_reset_round');
  }
});

// Big Center Roll Button
centerRollBtn.addEventListener('click', () => {
  socket.emit('sim_roll', {});
});

// Toggle Admin Sidebar
toggleAdminBtn.addEventListener('click', () => {
  adminSidebar.classList.toggle('sidebar-collapsed');
  const isCollapsed = adminSidebar.classList.contains('sidebar-collapsed');
  toggleAdminText.innerText = isCollapsed ? 'เปิดเมนูแอดมิน' : 'ซ่อนเมนูแอดมิน';
});

// Toggle Vertical Mobile (TikTok 9:16) vs Widescreen
viewModeToggleBtn.addEventListener('click', () => {
  gameArenaWrapper.classList.toggle('widescreen-mode');
  const isWide = gameArenaWrapper.classList.contains('widescreen-mode');
  viewModeToggleText.innerText = isWide ? 'โหมดแนวนอน (Desktop)' : 'โหมดมือถือแนวตั้ง (TikTok 9:16)';
  viewModeToggleBtn.className = isWide 
    ? 'px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition'
    : 'px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition';
});

// OBS Fullscreen Mode
obsModeBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    obsModeBtn.innerHTML = `<i class="fa-solid fa-compress"></i> <span>ย่อจอ</span>`;
  } else {
    document.exitFullscreen().catch(() => {});
    obsModeBtn.innerHTML = `<i class="fa-solid fa-expand"></i> <span>ขยายเต็มจอ (OBS)</span>`;
  }
});

// ==========================================
// SIMULATOR FUNCTIONS (ปุ่มกดทดสอบ)
// ==========================================
const TEST_NAMES = ['น้องแว่น', 'ป๋าเบิร์ด', 'กัปตันมาร์เวล', 'มาดามแพรว', 'เสี่ยท็อป', 'เด็กวัดสายเปย์'];

window.simJoin = function() {
  const randName = TEST_NAMES[Math.floor(Math.random() * TEST_NAMES.length)];
  const randId = 'user_' + Math.floor(Math.random() * 900 + 100);
  const randAvatar = Math.random() > 0.5 ? '/assets/default-avatar-red.svg' : '/assets/default-avatar-blue.svg';
  socket.emit('sim_join', { username: randId, nickname: randName, avatar: randAvatar });
};

window.simRoll = function() {
  socket.emit('sim_roll', {});
};

window.simRose = function() {
  socket.emit('sim_gift', { giftName: 'Rose', diamonds: 1 });
};

window.simDonut = function() {
  socket.emit('sim_gift', { giftName: 'Donut', diamonds: 30 });
};

window.simBigGift = function() {
  socket.emit('sim_gift', { giftName: 'Dragon', diamonds: 100 });
};

window.simChance = function() {
  socket.emit('sim_chance');
};

window.simJail = function() {
  socket.emit('sim_jail');
};

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
