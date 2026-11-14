// Connect to Socket.IO
const socket = io();

// Canvas Elements
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
const arenaCanvas = document.getElementById('arenaCanvas');
const ctx = arenaCanvas.getContext('2d');

// HUD Elements
const arenaTimerVal = document.getElementById('arenaTimerVal');
const roundInfoText = document.getElementById('roundInfoText');
const champList = document.getElementById('champList');
const victoryOverlay = document.getElementById('victoryOverlay');
const nextRoundSec = document.getElementById('nextRoundSec');
const winnerNameText = document.getElementById('winnerNameText');
const winnerDescText = document.getElementById('winnerDescText');
const winnerAvatarImg = document.getElementById('winnerAvatarImg');
const chatBubbleLayer = document.getElementById('chatBubbleLayer');

// Sidebar Elements
const adminSidebar = document.getElementById('adminSidebar');
const toggleAdminBtn = document.getElementById('toggleAdminBtn');
const toggleAdminText = document.getElementById('toggleAdminText');
const obsModeBtn = document.getElementById('obsModeBtn');

const sideUsernameInput = document.getElementById('sideUsernameInput');
const sideConnectBtn = document.getElementById('sideConnectBtn');
const sideDisconnectBtn = document.getElementById('sideDisconnectBtn');
const sideConnStatus = document.getElementById('sideConnStatus');
const sideViewerCount = document.getElementById('sideViewerCount');
const sideLikeCount = document.getElementById('sideLikeCount');
const sideFighterCount = document.getElementById('sideFighterCount');
const sideFighterTable = document.getElementById('sideFighterTable');
const sideEventLog = document.getElementById('sideEventLog');
const sideClearLogBtn = document.getElementById('sideClearLogBtn');

const tiktokPill = document.getElementById('tiktokPill');
const tiktokPillText = document.getElementById('tiktokPillText');

// ==========================================
// AUDIO SYNTHESIZER (Web Audio API)
// ==========================================
class ArenaSoundFX {
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

  // Punch hit sound ("ผัวะ!")
  playPunch() {
    this.ensure();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch(e) {}
  }

  // Boxing bell ("เก๊งงง!")
  playBell() {
    this.ensure();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(987.77, now);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    } catch(e) {}
  }

  // Shockwave / Ultimate blast
  playShockwave() {
    this.ensure();
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.5);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch(e) {}
  }

  // Victory Fanfare
  playVictory() {
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
        }, idx * 120);
      });
    } catch(e) {}
  }
}
const sfx = new ArenaSoundFX();
window.addEventListener('click', () => sfx.ensure(), { once: true });

// ==========================================
// RESIZE & CANVAS SETUP
// ==========================================
function resizeCanvases() {
  const rect = arenaCanvas.parentElement.getBoundingClientRect();
  bgCanvas.width = rect.width;
  bgCanvas.height = rect.height;
  arenaCanvas.width = rect.width;
  arenaCanvas.height = rect.height;
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

// Ring Geometry
function getRing() {
  const cx = arenaCanvas.width / 2;
  const cy = arenaCanvas.height * 0.54;
  const rx = arenaCanvas.width * 0.42; // Elliptical ring radius X
  const ry = arenaCanvas.height * 0.22; // Elliptical ring radius Y
  return { cx, cy, rx, ry };
}

// Image cache for fighter avatars
const avatarImgCache = new Map();
function getAvatarImg(url) {
  if (!url) return null;
  if (avatarImgCache.has(url)) return avatarImgCache.get(url);
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  avatarImgCache.set(url, img);
  return img;
}

// ==========================================
// PARTICLES & COMBAT VISUALS
// ==========================================
let hitParticles = [];
let damageFloats = [];
let ghosts = [];
let confetti = [];

function spawnHitSparks(x, y) {
  for (let i = 0; i < 7; i++) {
    hitParticles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 1,
      color: Math.random() > 0.5 ? '#fbbf24' : '#ef4444',
      size: Math.random() * 3 + 2
    });
  }
}

function spawnDamageNumber(x, y, amount) {
  damageFloats.push({
    x: x + (Math.random() - 0.5) * 10,
    y: y - 10,
    text: `-${amount}`,
    life: 1,
    color: '#ef4444'
  });
}

function spawnGhost(x, y, avatar) {
  ghosts.push({
    x, y,
    vy: -1.5,
    avatar,
    alpha: 0.9,
    life: 2
  });
}

// ==========================================
// CLIENT FIGHTERS (Physics & AI State)
// ==========================================
let clientFighters = []; // local physics fighters
let ferrisAngle = 0;
let spotlightAngle = 0;

class ClientFighter {
  constructor(data) {
    const ring = getRing();
    const spawnAngle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (ring.rx * 0.6);

    this.id = data.id;
    this.nickname = data.nickname;
    this.avatar = data.avatar;
    this.color = data.color || '#f43f5e';
    this.hp = data.hp || 100;
    this.maxHp = data.maxHp || 100;
    this.alive = true;
    this.weapon = data.weapon || 'none';
    this.hasShield = data.hasShield || false;
    this.speedBoost = data.speedBoost || 1;
    this.kills = 0;

    // Physics position on ring
    this.x = ring.cx + Math.cos(spawnAngle) * dist;
    this.y = ring.cy + Math.sin(spawnAngle) * (dist * (ring.ry / ring.rx));
    this.vx = 0;
    this.vy = 0;
    this.radius = 16;

    // Combat state
    this.punchCooldown = 0;
    this.punchProgress = 0; // 0 to 1 for punching arm extend
    this.punchAngle = 0;
  }

  update(dt, allFighters) {
    if (!this.alive) return;

    const ring = getRing();

    // 1. Friction & Velocity
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.88;
    this.vy *= 0.88;

    // 2. Check Ring-Out (Elliptical boundary)
    const dx = (this.x - ring.cx) / ring.rx;
    const dy = (this.y - ring.cy) / ring.ry;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);

    if (distFromCenter > 1.05 || this.hp <= 0) {
      this.alive = false;
      spawnGhost(this.x, this.y, this.avatar);
      socket.emit('fighter_knocked_out', { victimId: this.id });
      return;
    }

    // 3. AI Target Closest Enemy
    let closest = null;
    let closestDist = 9999;
    allFighters.forEach(other => {
      if (other.id !== this.id && other.alive) {
        const d = Math.hypot(other.x - this.x, other.y - this.y);
        if (d < closestDist) {
          closestDist = d;
          closest = other;
        }
      }
    });

    if (closest) {
      const angle = Math.atan2(closest.y - this.y, closest.x - this.x);
      const moveSpeed = (0.7 + Math.random() * 0.4) * (this.speedBoost || 1);

      this.vx += Math.cos(angle) * moveSpeed;
      this.vy += Math.sin(angle) * (moveSpeed * (ring.ry / ring.rx));

      // 4. Attack when in range
      const attackRange = this.weapon === 'sword' ? 36 : 28;
      if (closestDist < attackRange && this.punchCooldown <= 0) {
        this.punchCooldown = 18 + Math.floor(Math.random() * 10);
        this.punchProgress = 1;
        this.punchAngle = angle;

        // Damage & Knockback
        const damage = this.weapon === 'sword' ? 28 : 16;
        closest.hp -= damage;
        spawnHitSparks(closest.x, closest.y);
        spawnDamageNumber(closest.x, closest.y, damage);
        sfx.playPunch();

        // Push opponent
        const knockForce = this.weapon === 'sword' ? 8 : 5;
        closest.vx += Math.cos(angle) * knockForce;
        closest.vy += Math.sin(angle) * knockForce;

        if (closest.hp <= 0 && closest.alive) {
          this.kills += 1;
        }
      }
    }

    if (this.punchCooldown > 0) this.punchCooldown--;
    if (this.punchProgress > 0) this.punchProgress -= 0.15;
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // 1. Soft Shadow on Ring Floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Shield Bubble (if active)
    if (this.hasShield) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 3. Stickman Body
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Torso
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 12);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(-6, 20);
    ctx.moveTo(0, 12);
    ctx.lineTo(6, 20);
    ctx.stroke();

    // Arms & Punching Glove
    if (this.punchProgress > 0) {
      const punchDist = this.punchProgress * 18;
      const px = Math.cos(this.punchAngle) * punchDist;
      const py = Math.sin(this.punchAngle) * punchDist;

      // Punching Arm
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Glove
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Idle Arms
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.lineTo(-8, 8);
      ctx.moveTo(0, 4);
      ctx.lineTo(8, 8);
      ctx.stroke();
    }

    // 4. Weapon (Sword / Club)
    if (this.weapon === 'sword') {
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(8, 4);
      ctx.lineTo(22, -10);
      ctx.stroke();
    }

    // 5. Head (Profile Avatar with Golden Ring)
    const headRadius = 14;
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, -10, headRadius, 0, Math.PI * 2);
    ctx.clip();

    const avatarImg = getAvatarImg(this.avatar);
    if (avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0) {
      ctx.drawImage(avatarImg, -headRadius, -10 - headRadius, headRadius * 2, headRadius * 2);
    } else {
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    ctx.restore();

    // Head border ring
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -10, headRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 6. HP Bar above head
    const hpWidth = 28;
    const hpHeight = 3.5;
    const hpRatio = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(-hpWidth / 2, -30, hpWidth, hpHeight);
    ctx.fillStyle = hpRatio > 0.5 ? '#10b981' : (hpRatio > 0.25 ? '#f59e0b' : '#ef4444');
    ctx.fillRect(-hpWidth / 2, -30, hpWidth * hpRatio, hpHeight);

    // 7. Nickname
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px Kanit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.nickname, 0, -34);

    ctx.restore();
  }
}

// ==========================================
// BACKGROUND STAGE RENDERING (Temple Fair งานวัด)
// ==========================================
function drawTempleFairBackground() {
  const w = bgCanvas.width;
  const h = bgCanvas.height;
  const ring = getRing();

  bgCtx.clearRect(0, 0, w, h);

  // 1. Deep Night Sky
  const skyGrad = bgCtx.createLinearGradient(0, 0, 0, h * 0.7);
  skyGrad.addColorStop(0, '#090d1f');
  skyGrad.addColorStop(0.5, '#131835');
  skyGrad.addColorStop(1, '#1e1c38');
  bgCtx.fillStyle = skyGrad;
  bgCtx.fillRect(0, 0, w, h);

  // 2. Rotating Spotlights in Night Sky
  spotlightAngle += 0.015;
  const spotSources = [w * 0.2, w * 0.5, w * 0.8];
  spotSources.forEach((sx, idx) => {
    bgCtx.save();
    const beamAngle = Math.sin(spotlightAngle + idx * 1.5) * 0.35 - (Math.PI / 2);
    const grad = bgCtx.createLinearGradient(sx, h * 0.45, sx + Math.cos(beamAngle) * 400, (h * 0.45) + Math.sin(beamAngle) * 400);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    bgCtx.fillStyle = grad;
    bgCtx.beginPath();
    bgCtx.moveTo(sx - 10, h * 0.45);
    bgCtx.lineTo(sx + Math.cos(beamAngle - 0.15) * 400, (h * 0.45) + Math.sin(beamAngle - 0.15) * 400);
    bgCtx.lineTo(sx + Math.cos(beamAngle + 0.15) * 400, (h * 0.45) + Math.sin(beamAngle + 0.15) * 400);
    bgCtx.closePath();
    bgCtx.fill();
    bgCtx.restore();
  });

  // 3. Golden Ferris Wheel (Left side)
  ferrisAngle += 0.008;
  const fwx = w * 0.18;
  const fwy = h * 0.28;
  const fwr = 48;
  bgCtx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
  bgCtx.lineWidth = 2;
  bgCtx.beginPath();
  bgCtx.arc(fwx, fwy, fwr, 0, Math.PI * 2);
  bgCtx.stroke();

  // Ferris Spokes & Cabins
  for (let a = 0; a < 8; a++) {
    const ang = ferrisAngle + (a * Math.PI / 4);
    bgCtx.beginPath();
    bgCtx.moveTo(fwx, fwy);
    bgCtx.lineTo(fwx + Math.cos(ang) * fwr, fwy + Math.sin(ang) * fwr);
    bgCtx.stroke();
    // Bulb cabin
    bgCtx.fillStyle = ['#f43f5e', '#38bdf8', '#fbbf24', '#a855f7'][a % 4];
    bgCtx.beginPath();
    bgCtx.arc(fwx + Math.cos(ang) * fwr, fwy + Math.sin(ang) * fwr, 4, 0, Math.PI * 2);
    bgCtx.fill();
  }

  // 4. Golden Thai Temple Pagoda (Center/Right)
  const px = w * 0.5;
  const py = h * 0.35;
  bgCtx.fillStyle = 'rgba(245, 158, 11, 0.25)';
  bgCtx.beginPath();
  bgCtx.moveTo(px, py - 60);
  bgCtx.lineTo(px - 22, py);
  bgCtx.lineTo(px + 22, py);
  bgCtx.closePath();
  bgCtx.fill();

  // 5. Carnival Tents (งานวัดผ้าใบสลับสี)
  const tentX = w * 0.82;
  const tentY = h * 0.36;
  bgCtx.fillStyle = '#e11d48';
  bgCtx.fillRect(tentX - 25, tentY, 50, 20);
  bgCtx.fillStyle = '#ffffff';
  for (let s = 0; s < 5; s++) {
    bgCtx.fillRect(tentX - 25 + s * 10, tentY, 5, 20);
  }

  // 6. MAIN CIRCULAR RING PLATFORM (เวทีวงกลมมวยวัด)
  // Ring Platform Base (Drop shadow & depth)
  bgCtx.fillStyle = '#451a03';
  bgCtx.beginPath();
  bgCtx.ellipse(ring.cx, ring.cy + 12, ring.rx, ring.ry, 0, 0, Math.PI * 2);
  bgCtx.fill();

  // Ring Floor (Warm Yellow/Gold Canvas)
  const ringGrad = bgCtx.createRadialGradient(ring.cx, ring.cy, 10, ring.cx, ring.cy, ring.rx);
  ringGrad.addColorStop(0, '#92400e');
  ringGrad.addColorStop(0.7, '#78350f');
  ringGrad.addColorStop(1, '#451a03');
  bgCtx.fillStyle = ringGrad;
  bgCtx.beginPath();
  bgCtx.ellipse(ring.cx, ring.cy, ring.rx, ring.ry, 0, 0, Math.PI * 2);
  bgCtx.fill();

  // Concentric Stage Ring Lines
  bgCtx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
  bgCtx.lineWidth = 1.5;
  bgCtx.beginPath();
  bgCtx.ellipse(ring.cx, ring.cy, ring.rx * 0.65, ring.ry * 0.65, 0, 0, Math.PI * 2);
  bgCtx.stroke();
  bgCtx.beginPath();
  bgCtx.ellipse(ring.cx, ring.cy, ring.rx * 0.35, ring.ry * 0.35, 0, 0, Math.PI * 2);
  bgCtx.stroke();

  // Glowing Neon Border with Festive Bulbs
  bgCtx.strokeStyle = '#f59e0b';
  bgCtx.lineWidth = 4;
  bgCtx.shadowColor = '#fbbf24';
  bgCtx.shadowBlur = 15;
  bgCtx.beginPath();
  bgCtx.ellipse(ring.cx, ring.cy, ring.rx, ring.ry, 0, 0, Math.PI * 2);
  bgCtx.stroke();
  bgCtx.shadowBlur = 0;

  // Bulbs around the perimeter
  const numBulbs = 28;
  for (let b = 0; b < numBulbs; b++) {
    const bAngle = (b / numBulbs) * Math.PI * 2;
    const bx = ring.cx + Math.cos(bAngle) * ring.rx;
    const by = ring.cy + Math.sin(bAngle) * ring.ry;
    bgCtx.fillStyle = (b % 2 === 0) ? '#fef08a' : '#f59e0b';
    bgCtx.beginPath();
    bgCtx.arc(bx, by, 3, 0, Math.PI * 2);
    bgCtx.fill();
  }
}

// ==========================================
// GAME COMBAT ANIMATION LOOP
// ==========================================
function gameLoop() {
  requestAnimationFrame(gameLoop);

  drawTempleFairBackground();

  ctx.clearRect(0, 0, arenaCanvas.width, arenaCanvas.height);

  // Update & Draw Fighters
  clientFighters.forEach(f => {
    f.update(0.016, clientFighters);
    f.draw(ctx);
  });

  // Draw Hit Sparks
  for (let i = hitParticles.length - 1; i >= 0; i--) {
    const p = hitParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.05;
    if (p.life <= 0) {
      hitParticles.splice(i, 1);
      continue;
    }
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Draw Floating Damage Numbers
  for (let i = damageFloats.length - 1; i >= 0; i--) {
    const d = damageFloats[i];
    d.y -= 1;
    d.life -= 0.03;
    if (d.life <= 0) {
      damageFloats.splice(i, 1);
      continue;
    }
    ctx.fillStyle = d.color;
    ctx.globalAlpha = d.life;
    ctx.font = 'bold 13px Chakra Petch, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(d.text, d.x, d.y);
    ctx.globalAlpha = 1;
  }

  // Draw Floating Defeated Ghosts 👻
  for (let i = ghosts.length - 1; i >= 0; i--) {
    const g = ghosts[i];
    g.y += g.vy;
    g.life -= 0.02;
    if (g.life <= 0) {
      ghosts.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = g.life;
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👻', g.x, g.y);
    ctx.globalAlpha = 1;
  }
}
requestAnimationFrame(gameLoop);

// ==========================================
// SOCKET STATE LISTENERS
// ==========================================
socket.on('state_update', (state) => {
  // Update Timer
  const mins = Math.floor(state.timeLeft / 60);
  const secs = state.timeLeft % 60;
  arenaTimerVal.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;

  // Update Round & Alive Count
  const fightersList = Object.values(state.fighters || {});
  const aliveCount = fightersList.filter(f => f.alive).length;
  roundInfoText.innerText = `รอบที่ ${state.roundNumber} • เหลือ ${aliveCount}/${fightersList.length} คน`;

  // Update Leaderboard
  champList.innerHTML = (state.leaderboard || []).slice(0, 3).map((c, idx) => `
    <div class="champ-row">
      <span class="champ-name">${idx + 1}. ${escapeHtml(c.nickname)}</span>
      <span class="champ-score">${c.wins} 🏆 | ${c.kills} ⚔️</span>
    </div>
  `).join('');

  // Update Victory Screen (Screenshot 2)
  if (state.status === 'ROUND_END' && state.lastWinner) {
    victoryOverlay.classList.remove('hidden');
    nextRoundSec.innerText = state.nextRoundCountdown;
    winnerNameText.innerText = state.lastWinner.nickname;
    winnerDescText.innerText = `ชนะรอบที่ ${state.lastWinner.round} • น็อคไป ${state.lastWinner.kills} คน!`;
    winnerAvatarImg.src = state.lastWinner.avatar || '/assets/default-avatar-red.svg';
  } else {
    victoryOverlay.classList.add('hidden');
  }

  // Update Sidebar
  renderSidebar(state);
});

// Spawn Fighter Event
socket.on('spawn_fighter', (fighterData) => {
  let existing = clientFighters.find(f => f.id === fighterData.id);
  if (existing) {
    existing.alive = true;
    existing.hp = fighterData.hp;
    existing.maxHp = fighterData.maxHp;
    // Reposition to ring
    const ring = getRing();
    existing.x = ring.cx + (Math.random() - 0.5) * 80;
    existing.y = ring.cy + (Math.random() - 0.5) * 50;
    existing.vx = 0;
    existing.vy = 0;
  } else {
    clientFighters.push(new ClientFighter(fighterData));
  }
  sfx.playBell();
});

// New Round Started
socket.on('new_round_started', (data) => {
  sfx.playBell();
  victoryOverlay.classList.add('hidden');

  // Reset all client fighters
  clientFighters.forEach(f => {
    f.alive = true;
    f.hp = f.maxHp;
    f.weapon = 'none';
    f.hasShield = false;
    const ring = getRing();
    const spawnAngle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (ring.rx * 0.65);
    f.x = ring.cx + Math.cos(spawnAngle) * dist;
    f.y = ring.cy + Math.sin(spawnAngle) * (dist * (ring.ry / ring.rx));
    f.vx = 0;
    f.vy = 0;
  });
});

// Round Winner Fanfare
socket.on('round_winner', (winner) => {
  sfx.playVictory();
});

// Combat Buffs & Weapons
socket.on('fighter_weapon', (data) => {
  const f = clientFighters.find(cf => cf.id === data.id);
  if (f) f.weapon = data.weapon;
});

socket.on('fighter_shield', (data) => {
  const f = clientFighters.find(cf => cf.id === data.id);
  if (f) f.hasShield = true;
});

socket.on('fighter_shockwave', (data) => {
  sfx.playShockwave();
  const source = clientFighters.find(cf => cf.id === data.id);
  if (!source) return;

  clientFighters.forEach(f => {
    if (f.id !== source.id && f.alive) {
      const angle = Math.atan2(f.y - source.y, f.x - source.x);
      f.vx += Math.cos(angle) * 16;
      f.vy += Math.sin(angle) * 16;
      f.hp -= 25;
      spawnHitSparks(f.x, f.y);
      spawnDamageNumber(f.x, f.y, 25);
    }
  });
});

socket.on('fighter_ultimate', (data) => {
  sfx.playShockwave();
  clientFighters.forEach(f => {
    if (f.alive) {
      f.hp -= 35;
      f.vx += (Math.random() - 0.5) * 18;
      f.vy += (Math.random() - 0.5) * 18;
      spawnHitSparks(f.x, f.y);
      spawnDamageNumber(f.x, f.y, 35);
    }
  });
});

// Floating Chat Bubble
socket.on('chat_bubble', (data) => {
  const bubble = document.createElement('div');
  bubble.className = 'fighter-chat-bubble';
  bubble.innerHTML = `
    <img src="${data.avatar || '/assets/default-avatar-red.svg'}">
    <span><b>${escapeHtml(data.nickname)}:</b> ${escapeHtml(data.comment)}</span>
  `;

  const fighter = clientFighters.find(cf => cf.id === data.username);
  if (fighter) {
    bubble.style.left = `${fighter.x}px`;
    bubble.style.top = `${fighter.y - 45}px`;
  } else {
    bubble.style.left = `${arenaCanvas.width * 0.4}px`;
    bubble.style.top = `${arenaCanvas.height * 0.5}px`;
  }

  chatBubbleLayer.appendChild(bubble);
  setTimeout(() => bubble.remove(), 3500);
});

// ==========================================
// SIDEBAR & LOGS
// ==========================================
function renderSidebar(state) {
  if (state.tiktok.isConnected) {
    sideConnStatus.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800";
    sideConnStatus.innerText = "เชื่อมต่อสด";
    tiktokPill.className = "text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-semibold flex items-center gap-1.5";
    tiktokPillText.innerText = `@${state.tiktok.username}`;
    sideConnectBtn.classList.add('hidden');
    sideDisconnectBtn.classList.remove('hidden');
  } else {
    sideConnStatus.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800";
    sideConnStatus.innerText = "ออฟไลน์";
    tiktokPill.className = "text-[10px] px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 font-semibold flex items-center gap-1.5";
    tiktokPillText.innerText = "ออฟไลน์";
    sideConnectBtn.classList.remove('hidden');
    sideDisconnectBtn.classList.add('hidden');
  }

  sideViewerCount.innerText = Number(state.tiktok.viewerCount || 0).toLocaleString();
  sideLikeCount.innerText = Number(state.tiktok.likeCount || 0).toLocaleString();

  const fighters = Object.values(state.fighters || {});
  sideFighterCount.innerText = fighters.length;

  if (fighters.length === 0) {
    sideFighterTable.innerHTML = `<tr><td class="text-slate-500 italic text-center py-4">ยังไม่มีนักสู้ลงเวที... กดปุ่มจำลองได้เลย!</td></tr>`;
    return;
  }

  sideFighterTable.innerHTML = fighters.map(f => `
    <tr class="hover:bg-slate-900">
      <td class="py-1 px-1 flex items-center gap-1.5">
        <img src="${f.avatar || '/assets/default-avatar-red.svg'}" class="w-4 h-4 rounded-full">
        <span class="font-bold text-slate-200 truncate max-w-[85px]">${escapeHtml(f.nickname)}</span>
      </td>
      <td class="py-1 px-1 ${f.alive ? 'text-emerald-400 font-bold' : 'text-slate-500 line-through'}">
        ${f.alive ? `HP ${Math.floor(f.hp)}` : '💀 น็อค'}
      </td>
      <td class="py-1 px-1 text-amber-300 font-bold">⚔️ ${f.kills || 0}</td>
    </tr>
  `).join('');
}

// Event Log Feed
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

// Toggle Admin Sidebar
toggleAdminBtn.addEventListener('click', () => {
  adminSidebar.classList.toggle('sidebar-collapsed');
  const isCollapsed = adminSidebar.classList.contains('sidebar-collapsed');
  toggleAdminText.innerText = isCollapsed ? 'เปิดเมนูแอดมิน' : 'ซ่อนเมนูแอดมิน';
});

// OBS Fullscreen
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
// SIMULATOR ACTIONS (ทดสอบระบบ)
// ==========================================
const TEST_NAMES = ['พี่มารวยขายประกัน', 'กฤษดา ประเสริฐสังข์', 'KOJiji', 'สิบสาม เมษา', 'จอมมารจี้', 'น้องแว่นสายบู๊'];

window.simJoin = function() {
  const randName = TEST_NAMES[Math.floor(Math.random() * TEST_NAMES.length)];
  const randId = 'user_' + Math.floor(Math.random() * 900 + 100);
  const randAvatar = Math.random() > 0.5 ? '/assets/default-avatar-red.svg' : '/assets/default-avatar-blue.svg';
  socket.emit('sim_join', { username: randId, nickname: randName, avatar: randAvatar });
};

window.simLike = function() {
  socket.emit('sim_like', { count: 30 });
};

window.simRose = function() {
  socket.emit('sim_gift', { giftName: 'Rose', diamonds: 1 });
};

window.simWeapon = function() {
  socket.emit('sim_gift', { giftName: 'Sword', diamonds: 15 });
};

window.simShield = function() {
  socket.emit('sim_gift', { giftName: 'Shield', diamonds: 50 });
};

window.simShockwave = function() {
  socket.emit('sim_gift', { giftName: 'Fireball', diamonds: 150 });
};

window.simUltimate = function() {
  socket.emit('sim_gift', { giftName: 'Rocket', diamonds: 500 });
};

window.simReset = function() {
  socket.emit('sim_reset_round');
};

window.simForceWin = function() {
  socket.emit('sim_force_win');
};

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
