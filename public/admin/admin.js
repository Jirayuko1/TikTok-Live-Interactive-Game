// Connect to Socket.IO
const socket = io();

// UI Elements
const connectionBadge = document.getElementById('connectionStatusBadge');
const tiktokIndicator = document.getElementById('tiktokLiveIndicator');
const tiktokUsernameInput = document.getElementById('tiktokUsernameInput');
const connectTiktokBtn = document.getElementById('connectTiktokBtn');
const disconnectTiktokBtn = document.getElementById('disconnectTiktokBtn');
const tiktokErrorBox = document.getElementById('tiktokErrorBox');
const tiktokErrorText = document.getElementById('tiktokErrorText');

const statViewerCount = document.getElementById('statViewerCount');
const statLikeCount = document.getElementById('statLikeCount');
const statPlayerCount = document.getElementById('statPlayerCount');

const adminRoundLabel = document.getElementById('adminRoundLabel');
const adminTimerVal = document.getElementById('adminTimerVal');
const resetRoundBtn = document.getElementById('resetRoundBtn');
const copyOverlayBtn = document.getElementById('copyOverlayBtn');

const playerTableBody = document.getElementById('playerTableBody');
const eventLogContainer = document.getElementById('eventLogContainer');
const clearLogBtn = document.getElementById('clearLogBtn');

let currentGameState = null;

// ==========================================
// SOCKET STATUS
// ==========================================
socket.on('connect', () => {
  connectionBadge.innerHTML = `
    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
    <span class="font-medium text-emerald-300">เซิร์ฟเวอร์ออนไลน์</span>
  `;
});

socket.on('disconnect', () => {
  connectionBadge.innerHTML = `
    <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
    <span class="font-medium text-rose-300">หลุดการเชื่อมต่อ</span>
  `;
});

// ==========================================
// STATE UPDATES
// ==========================================
socket.on('state_update', (state) => {
  currentGameState = state;

  // TikTok connection status
  if (state.tiktok.isConnected) {
    tiktokIndicator.className = "px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-800/60 text-emerald-300";
    tiktokIndicator.innerHTML = `🟢 กำลังเชื่อมสด: @${state.tiktok.username}`;
    connectTiktokBtn.classList.add('hidden');
    disconnectTiktokBtn.classList.remove('hidden');
    tiktokErrorBox.classList.add('hidden');
  } else {
    tiktokIndicator.className = "px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/60 border border-rose-800/60 text-rose-300";
    tiktokIndicator.innerHTML = `🔴 ออฟไลน์`;
    connectTiktokBtn.classList.remove('hidden');
    disconnectTiktokBtn.classList.add('hidden');

    if (state.tiktok.lastError) {
      tiktokErrorBox.classList.remove('hidden');
      tiktokErrorText.innerText = state.tiktok.lastError;
    } else {
      tiktokErrorBox.classList.add('hidden');
    }
  }

  // Room Stats
  statViewerCount.innerText = Number(state.tiktok.viewerCount || 0).toLocaleString();
  statLikeCount.innerText = Number(state.tiktok.likeCount || 0).toLocaleString();

  const players = Object.values(state.players || {});
  statPlayerCount.innerText = players.length;

  // Round Timer
  adminRoundLabel.innerText = `รอบปัจจุบัน: รอบที่ ${state.roundNumber}`;
  const minutes = Math.floor(state.roundTimeLeft / 60);
  const seconds = state.roundTimeLeft % 60;
  adminTimerVal.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Players Table
  renderPlayerTable(players, state.board);
});

function renderPlayerTable(players, board) {
  if (players.length === 0) {
    playerTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-8 text-slate-500 italic">ยังไม่มีผู้เล่นในกระดาน... กดปุ่มจำลองด้านบนได้เลย!</td>
      </tr>
    `;
    return;
  }

  playerTableBody.innerHTML = players.map(p => {
    const tileName = board && board[p.position] ? `${board[p.position].icon} #${p.position} ${board[p.position].name}` : `#${p.position}`;
    
    let statusBadges = [];
    if (p.isJailed) {
      statusBadges.push(`<span class="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40">⛓️ คุก (${p.jailTurnsLeft} รอบ)</span>`);
    }
    if (p.isGoldenDice) {
      statusBadges.push(`<span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">✨ ลูกเต๋าทองคำ</span>`);
    }
    if (p.hasAura) {
      statusBadges.push(`<span class="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">🌟 ออร่าทอง</span>`);
    }
    if (statusBadges.length === 0) {
      statusBadges.push(`<span class="text-slate-500">ปกติ</span>`);
    }

    return `
      <tr class="hover:bg-slate-900/50 transition">
        <td class="p-2.5 flex items-center gap-2">
          <img src="${p.avatar || '/assets/default-avatar-red.svg'}" class="w-6 h-6 rounded-full border border-slate-700 object-cover">
          <span class="font-bold text-slate-200">${escapeHtml(p.nickname)}</span>
        </td>
        <td class="p-2.5 text-slate-300">${tileName}</td>
        <td class="p-2.5 font-bold text-amber-400">⭐ ${p.stars}</td>
        <td class="p-2.5 font-bold text-emerald-400">🪙 ${p.points}</td>
        <td class="p-2.5">${statusBadges.join(' ')}</td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// EVENT LOGS
// ==========================================
socket.on('new_event', (event) => {
  addLogItem(event);
});

function addLogItem(event) {
  if (eventLogContainer.querySelector('.italic')) {
    eventLogContainer.innerHTML = '';
  }

  const div = document.createElement('div');
  div.className = "p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start gap-2 text-[11px]";

  let badge = '';
  if (event.type === 'gift') {
    badge = `<span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">GIFT</span>`;
  } else if (event.type === 'chat') {
    badge = `<span class="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">CHAT</span>`;
  } else if (event.type === 'game') {
    badge = `<span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">GAME</span>`;
  } else {
    badge = `<span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">INFO</span>`;
  }

  div.innerHTML = `
    <span class="text-slate-500 shrink-0">${event.time}</span>
    ${badge}
    <span class="text-slate-200 flex-1 break-words">${event.text}</span>
  `;

  eventLogContainer.prepend(div);

  while (eventLogContainer.children.length > 50) {
    eventLogContainer.removeChild(eventLogContainer.lastChild);
  }
}

clearLogBtn.addEventListener('click', () => {
  eventLogContainer.innerHTML = '<div class="text-slate-500 italic text-center py-8">ล้างฟีดแล้ว</div>';
});

// ==========================================
// CONTROLS & ACTIONS
// ==========================================
connectTiktokBtn.addEventListener('click', () => {
  const username = tiktokUsernameInput.value.trim();
  if (!username) {
    alert('กรุณากรอกชื่อช่อง TikTok ก่อน');
    return;
  }
  socket.emit('tiktok_connect', username);
});

disconnectTiktokBtn.addEventListener('click', () => {
  socket.emit('tiktok_disconnect');
});

resetRoundBtn.addEventListener('click', () => {
  if (confirm('คุณต้องการรีเซ็ตเวลารอบและกระดานใหม่หรือไม่?')) {
    socket.emit('admin_reset_round');
  }
});

copyOverlayBtn.addEventListener('click', () => {
  const url = `${window.location.origin}/overlay`;
  navigator.clipboard.writeText(url).then(() => {
    const old = copyOverlayBtn.innerHTML;
    copyOverlayBtn.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i> คัดลอกแล้ว!`;
    setTimeout(() => copyOverlayBtn.innerHTML = old, 2000);
  });
});

// ==========================================
// SIMULATOR FUNCTIONS (ทดสอบตรงตามรูปทั้ง 3 รูป!)
// ==========================================
const TEST_NAMES = ['เสี่ยเบิร์ด', 'น้องมายด์', 'ป๋าดันสายเปย์', 'ช่างบอย', 'แม่ค้าแซ่บ', 'วัยรุ่นพันล้าน'];

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

window.simJail = function() {
  socket.emit('sim_jail');
};

window.simChance = function() {
  socket.emit('sim_chance');
};

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
