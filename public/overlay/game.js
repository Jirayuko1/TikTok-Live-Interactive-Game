// Connect to Socket.IO
const socket = io();

// UI Elements
const boardPerimeter = document.getElementById('boardPerimeter');
const roundTimerVal = document.getElementById('roundTimerVal');
const roundLabel = document.getElementById('roundLabel');
const playerCountVal = document.getElementById('playerCountVal');
const leaderboardList = document.getElementById('leaderboardList');

const diceShowcase = document.getElementById('diceShowcase');
const rollerAvatar = document.getElementById('rollerAvatar');
const rollerNick = document.getElementById('rollerNick');
const diceCube1 = document.getElementById('diceCube1');
const diceCube2 = document.getElementById('diceCube2');
const diceResultText = document.getElementById('diceResultText');

const eventPopup = document.getElementById('eventPopup');
const popupIcon = document.getElementById('popupIcon');
const popupTitle = document.getElementById('popupTitle');
const popupDesc = document.getElementById('popupDesc');
const popupAvatar = document.getElementById('popupAvatar');

const bubbleLayer = document.getElementById('bubbleLayer');

// Dice Face Unicode Map
const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// ==========================================
// AUDIO SYNTHESIZER (Web Audio API)
// ==========================================
class BoardSoundFX {
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

  // Dice roll shake sound
  playDiceRoll() {
    this.ensure();
    if (!this.ctx) return;
    try {
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(300 + Math.random() * 200, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.08);
        }, i * 70);
      }
    } catch(e) {}
  }

  // Token jump step
  playStep() {
    this.ensure();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch(e) {}
  }

  // Coin / Bonus Collect
  playCoin() {
    this.ensure();
    if (!this.ctx) return;
    try {
      const notes = [987.77, 1318.51]; // B5, E6
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

  // Jail lock bars sound
  playJail() {
    this.ensure();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch(e) {}
  }

  // Star Fanfare (Lap complete)
  playFanfare() {
    this.ensure();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
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

const sfx = new BoardSoundFX();
window.addEventListener('click', () => sfx.ensure(), { once: true });

// ==========================================
// 24 TILE PERIMETER COORDINATE MAP (7x7 Grid)
// ==========================================
// Tile 0..6: Top row (row 1, col 1..7)
// Tile 7..11: Right col (row 2..6, col 7)
// Tile 12..18: Bottom row (row 7, col 7..1)
// Tile 19..23: Left col (row 6..2, col 1)
const TILE_GRID_POS = [
  { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 5 }, { row: 1, col: 6 }, { row: 1, col: 7 },
  { row: 2, col: 7 }, { row: 3, col: 7 }, { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 },
  { row: 7, col: 7 }, { row: 7, col: 6 }, { row: 7, col: 5 }, { row: 7, col: 4 }, { row: 7, col: 3 }, { row: 7, col: 2 }, { row: 7, col: 1 },
  { row: 6, col: 1 }, { row: 5, col: 1 }, { row: 4, col: 1 }, { row: 3, col: 1 }, { row: 2, col: 1 }
];

let tileElements = [];

function initBoardTiles(tiles) {
  boardPerimeter.innerHTML = '';
  tileElements = [];

  tiles.forEach((tile, idx) => {
    const pos = TILE_GRID_POS[idx];
    const div = document.createElement('div');
    div.className = `board-tile ${tile.type}-tile`;
    div.id = `tile_${idx}`;
    div.style.gridRow = pos.row;
    div.style.gridColumn = pos.col;

    div.innerHTML = `
      <div class="tile-head">
        <span class="tile-num">#${idx}</span>
        <span>${tile.type === 'start' ? 'GO' : ''}</span>
      </div>
      <div class="tile-icon">${tile.icon}</div>
      <div class="tile-name">${tile.name}</div>
      <div class="tile-desc">${tile.desc}</div>
      <div id="tile_tokens_${idx}" class="tile-tokens-container"></div>
    `;

    boardPerimeter.appendChild(div);
    tileElements.push(div);
  });
}

// ==========================================
// RENDER PLAYERS & LEADERBOARD
// ==========================================
let currentGameState = null;
let popupTimeout = null;
let diceTimeout = null;

socket.on('state_update', (state) => {
  currentGameState = state;

  // Initialize board tiles if not already done
  if (tileElements.length === 0 && state.board) {
    initBoardTiles(state.board);
  }

  // Update Round timer & label
  roundLabel.innerText = `รอบที่ ${state.roundNumber}`;
  const minutes = Math.floor(state.roundTimeLeft / 60);
  const seconds = state.roundTimeLeft % 60;
  roundTimerVal.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Update Players on Board
  renderPlayerTokens(state.players);

  // Update Leaderboard
  renderLeaderboard(state.players);
});

function renderPlayerTokens(players) {
  // Clear all token containers
  for (let i = 0; i < 24; i++) {
    const container = document.getElementById(`tile_tokens_${i}`);
    if (container) container.innerHTML = '';
  }

  const playerList = Object.values(players || {});
  playerCountVal.innerText = playerList.length;

  playerList.forEach(p => {
    const container = document.getElementById(`tile_tokens_${p.position}`);
    if (!container) return;

    const token = document.createElement('div');
    token.className = `player-token ${p.hasAura ? 'has-aura' : ''} ${p.isJailed ? 'is-jailed' : ''}`;
    token.id = `token_${p.id}`;
    token.title = `${p.nickname} (⭐${p.stars} | 🪙${p.points})`;

    token.innerHTML = `
      <img src="${p.avatar || '/assets/default-avatar-red.svg'}" alt="${p.nickname}">
      ${p.stars > 0 ? `<div class="token-stars-badge">⭐${p.stars}</div>` : ''}
    `;

    container.appendChild(token);
  });
}

function renderLeaderboard(players) {
  const sorted = Object.values(players || {})
    .sort((a, b) => (b.stars * 1000 + b.points) - (a.stars * 1000 + a.points))
    .slice(0, 6);

  if (sorted.length === 0) {
    leaderboardList.innerHTML = `<div class="lb-empty">พิมพ์ "เล่น" หรือ "เข้าเกม" เพื่อเริ่มก้าวสู่ความมั่งคั่ง!</div>`;
    return;
  }

  leaderboardList.innerHTML = sorted.map((p, idx) => {
    const rankColors = ['#f59e0b', '#94a3b8', '#b45309', '#38bdf8', '#a855f7', '#64748b'];
    const rankMedals = ['🥇', '🥈', '🥉', '4', '5', '6'];

    return `
      <div class="lb-item">
        <span class="lb-rank" style="color: ${rankColors[idx]}">${rankMedals[idx]}</span>
        <img class="lb-avatar" src="${p.avatar || '/assets/default-avatar-red.svg'}">
        <div class="lb-info">
          <div class="lb-nick">${escapeHtml(p.nickname)}</div>
          <div class="lb-score">⭐ ${p.stars} | 🪙 ${p.points}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// DICE ROLL ANIMATION
// ==========================================
socket.on('dice_roll', (data) => {
  sfx.playDiceRoll();
  clearTimeout(diceTimeout);

  rollerAvatar.src = data.player.avatar || '/assets/default-avatar-red.svg';
  rollerNick.innerText = `${data.player.nickname} กำลังทอย...`;

  diceCube1.innerText = '🎲';
  if (data.isGolden) {
    diceCube2.classList.remove('hidden');
    diceCube2.innerText = '🎲';
  } else {
    diceCube2.classList.add('hidden');
  }

  diceResultText.innerText = data.isGolden ? '✨ ลูกเต๋าทองคำเดินเบิ้ล x2!' : 'กำลังสุ่มลูกเต๋า...';
  diceShowcase.classList.remove('hidden');

  // Reveal results after roll delay
  setTimeout(() => {
    sfx.playStep();
    diceCube1.innerText = DICE_FACES[data.dice1] || '⚅';
    if (data.isGolden) {
      diceCube2.innerText = DICE_FACES[data.dice2 || data.dice1] || '⚅';
      diceResultText.innerText = `🎲 ได้เลข ${data.dice1} x 2 = ${data.totalSteps} ช่อง!`;
    } else {
      diceResultText.innerText = `🎲 ได้เลข ${data.totalSteps} ช่อง!`;
    }

    diceTimeout = setTimeout(() => {
      diceShowcase.classList.add('hidden');
    }, 2800);
  }, 900);
});

// ==========================================
// POPUP EVENT DISPLAY
// ==========================================
socket.on('board_popup', (data) => {
  clearTimeout(popupTimeout);

  if (data.type === 'star') {
    sfx.playFanfare();
    popupIcon.innerText = '⭐';
  } else if (data.type === 'jail') {
    sfx.playJail();
    popupIcon.innerText = '⛓️';
  } else if (data.type === 'jackpot') {
    sfx.playCoin();
    popupIcon.innerText = '👑';
  } else if (data.type === 'warp') {
    sfx.playCoin();
    popupIcon.innerText = '🚀';
  } else if (data.type === 'chance') {
    sfx.playCoin();
    popupIcon.innerText = '❓';
  } else {
    popupIcon.innerText = '🎉';
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
  }, 4200);
});

// ==========================================
// CHAT BUBBLES
// ==========================================
socket.on('chat_bubble', (data) => {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';

  bubble.innerHTML = `
    <img src="${data.avatar || '/assets/default-avatar-red.svg'}" class="chat-avatar">
    <span><b>${escapeHtml(data.nickname)}:</b> ${escapeHtml(data.comment)}</span>
  `;

  // Position over the player token or center
  const token = document.getElementById(`token_${data.username}`);
  if (token) {
    const rect = token.getBoundingClientRect();
    bubble.style.left = `${rect.left - 20}px`;
    bubble.style.top = `${rect.top - 40}px`;
  } else {
    bubble.style.left = `${window.innerWidth * 0.4 + (Math.random() - 0.5) * 150}px`;
    bubble.style.top = `${window.innerHeight * 0.5 + (Math.random() - 0.5) * 100}px`;
  }

  bubbleLayer.appendChild(bubble);
  setTimeout(() => bubble.remove(), 4000);
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
