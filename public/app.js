// ==========================================
// ARENA LIVE: BATTLE ROYALE CLIENT ENGINE
// สังเวียนประลองมวยวัด TikTok Live (9:16)
// ==========================================

const socket = io();

// DOM Elements
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
const arenaCanvas = document.getElementById('arenaCanvas');
const ctx = arenaCanvas.getContext('2d');

// HUD & Overlays
const roundInfoText = document.getElementById('roundInfoText');
const arenaTimerVal = document.getElementById('arenaTimerVal');
const champList = document.getElementById('champList');
const victoryOverlay = document.getElementById('victoryOverlay');
const nextRoundSec = document.getElementById('nextRoundSec');
const winnerNameText = document.getElementById('winnerNameText');
const winnerDescText = document.getElementById('winnerDescText');
const winnerAvatarImg = document.getElementById('winnerAvatarImg');
const chatBubbleLayer = document.getElementById('chatBubbleLayer');

// Header & Controls
const tiktokPill = document.getElementById('tiktokPill');
const tiktokPillText = document.getElementById('tiktokPillText');
const toggleAdminBtn = document.getElementById('toggleAdminBtn');
const toggleAdminText = document.getElementById('toggleAdminText');
const copyObsBtn = document.getElementById('copyObsBtn');
const sfxToggleBtn = document.getElementById('sfxToggleBtn');
const sfxIcon = document.getElementById('sfxIcon');

// Admin Sidebar
const adminSidebar = document.getElementById('adminSidebar');
const sideConnStatus = document.getElementById('sideConnStatus');
const sideUsernameInput = document.getElementById('sideUsernameInput');
const sideConnectBtn = document.getElementById('sideConnectBtn');
const sideDisconnectBtn = document.getElementById('sideDisconnectBtn');
const sideViewerCount = document.getElementById('sideViewerCount');
const sideLikeCount = document.getElementById('sideLikeCount');
const sideFighterCount = document.getElementById('sideFighterCount');
const sideFighterTable = document.getElementById('sideFighterTable');
const sideEventLog = document.getElementById('sideEventLog');
const sideClearLogBtn = document.getElementById('sideClearLogBtn');

// ==========================================
// SOUND FX ENGINE (Web Audio API Synthesizer)
// ==========================================
class ArenaSoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx && typeof AudioContext !== 'undefined') {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Boxing Bell (Ding Ding!)
  playBell() {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [880, 1760].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      });
    } catch(e) {}
  }

  // Punch Impact (Pow!)
  playPunch() {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch(e) {}
  }

  // Sword Slash
  playSlash() {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch(e) {}
  }

  // Shockwave Explosion
  playShockwave() {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.4);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch(e) {}
  }

  // Victory Fanfare
  playVictory() {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (this.muted || !this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.35);
        }, idx * 110);
      });
    } catch(e) {}
  }
}
const sfx = new ArenaSoundFX();
window.addEventListener('click', () => sfx.ensure(), { once: true });

// Toggle Mute Audio
sfxToggleBtn.addEventListener('click', () => {
  sfx.muted = !sfx.muted;
  if (sfx.muted) {
    sfxIcon.className = "fa-solid fa-volume-xmark text-slate-500";
    sfxToggleBtn.title = "เปิดเสียงเอฟเฟกต์";
  } else {
    sfx.ensure();
    sfxIcon.className = "fa-solid fa-volume-high text-amber-400";
    sfxToggleBtn.title = "ปิดเสียงเอฟเฟกต์";
  }
});

// ==========================================
// RESIZE & HIGH-DPI CANVAS SETUP
// ==========================================
let viewW = 440;
let viewH = 780;
let dpr = 1;

function resizeCanvases() {
  const rect = arenaCanvas.parentElement.getBoundingClientRect();
  viewW = rect.width;
  viewH = rect.height;
  dpr = window.devicePixelRatio || 1;

  bgCanvas.width = viewW * dpr;
  bgCanvas.height = viewH * dpr;
  bgCanvas.style.width = `${viewW}px`;
  bgCanvas.style.height = `${viewH}px`;
  bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  arenaCanvas.width = viewW * dpr;
  arenaCanvas.height = viewH * dpr;
  arenaCanvas.style.width = `${viewW}px`;
  arenaCanvas.style.height = `${viewH}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

// Ring Geometry (Elliptical Battle Platform in Perspective)
function getRing() {
  const cx = viewW / 2;
  const cy = viewH * 0.58;       // Positioned nicely in lower-mid zone
  const rx = viewW * 0.44;       // Radius X
  const ry = viewH * 0.22;       // Radius Y (2.5D tilt)
  return { cx, cy, rx, ry };
}

// Pre-computed Stars for Fairground Sky
const STARS = [];
for (let i = 0; i < 45; i++) {
  STARS.push({
    x: Math.random(),
    y: Math.random() * 0.45,
    size: Math.random() * 1.8 + 0.8,
    pulseSpeed: Math.random() * 0.05 + 0.02,
    phase: Math.random() * Math.PI * 2
  });
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

// Pre-load default bot avatars
['/assets/avatar-1.svg', '/assets/avatar-2.svg', '/assets/avatar-3.svg', 
 '/assets/avatar-4.svg', '/assets/avatar-5.svg', '/assets/avatar-6.svg'].forEach(getAvatarImg);

// ==========================================
// PARTICLES & COMBAT VISUALS
// ==========================================
let hitParticles = [];
let damageFloats = [];
let ghosts = [];
let shockwaveRings = [];

function spawnHitSparks(x, y) {
  for (let i = 0; i < 9; i++) {
    hitParticles.push({
      x, y,
      vx: (Math.random() - 0.5) * 7,
      vy: (Math.random() - 0.5) * 7,
      life: 1,
      color: Math.random() > 0.4 ? '#facc15' : '#f43f5e',
      size: Math.random() * 3 + 2
    });
  }
}

function spawnDamageNumber(x, y, amount) {
  damageFloats.push({
    x: x + (Math.random() - 0.5) * 12,
    y: y - 18,
    text: `-${amount}`,
    life: 1,
    color: amount >= 25 ? '#fbbf24' : '#ef4444'
  });
}

function spawnGhost(x, y, avatar) {
  ghosts.push({
    x, y,
    vy: -1.8,
    avatar,
    alpha: 0.95,
    life: 1.8,
    rot: (Math.random() - 0.5) * 0.2
  });
}

function spawnShockwaveEffect(x, y) {
  shockwaveRings.push({
    x, y,
    radius: 10,
    maxRadius: viewW * 0.45,
    life: 1,
    color: '#fbbf24'
  });
}

// ==========================================
// CLIENT FIGHTERS (Chibi Brawlers)
// ==========================================
let clientFighters = [];
let ferrisAngle = 0;
let spotlightAngle = 0;

class ClientFighter {
  constructor(data) {
    const ring = getRing();
    const spawnAngle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (ring.rx * 0.65);

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
    this.isBoss = false;

    // Physics position on ring
    this.x = ring.cx + Math.cos(spawnAngle) * dist;
    this.y = ring.cy + Math.sin(spawnAngle) * (dist * (ring.ry / ring.rx));
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;
    this.radius = 18;

    // Combat & Animation state
    this.facingAngle = 0;
    this.stepCycle = Math.random() * Math.PI * 2;
    this.punchCooldown = Math.floor(Math.random() * 20);
    this.punchProgress = 0; // 0 to 1
    this.punchAngle = 0;
    this.tumbleAngle = 0;
  }

  update(dt, allFighters) {
    if (!this.alive) return;

    const ring = getRing();

    // 1. Velocity & Friction
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.88;
    this.vy *= 0.88;

    // Step cycle for cute bouncy chibi walking
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > 0.2) {
      this.stepCycle += speed * 0.45;
    }

    // 2. Check Ring-Out (Elliptical boundary check)
    const dx = (this.x - ring.cx) / ring.rx;
    const dy = (this.y - ring.cy) / ring.ry;
    const distRatio = Math.sqrt(dx * dx + dy * dy);

    if (distRatio > 1.05 || this.hp <= 0) {
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
      this.facingAngle = angle;

      const baseSpeed = (0.75 + Math.random() * 0.35) * (this.speedBoost || 1);
      this.vx += Math.cos(angle) * baseSpeed;
      this.vy += Math.sin(angle) * (baseSpeed * (ring.ry / ring.rx));

      // 4. Attack when in range
      const attackRange = this.weapon === 'sword' ? 44 : 32;
      if (closestDist < attackRange && this.punchCooldown <= 0) {
        this.punchCooldown = 18 + Math.floor(Math.random() * 12);
        this.punchProgress = 1;
        this.punchAngle = angle;

        // Damage & Impact
        const damage = this.weapon === 'sword' ? 28 : (this.isBoss ? 45 : 16);
        closest.hp -= damage;
        spawnHitSparks(closest.x, closest.y);
        spawnDamageNumber(closest.x, closest.y, damage);

        if (this.weapon === 'sword') sfx.playSlash();
        else sfx.playPunch();

        // Push opponent backward
        const knockForce = this.weapon === 'sword' ? 9.5 : (this.isBoss ? 15 : 6);
        closest.vx += Math.cos(angle) * knockForce;
        closest.vy += Math.sin(angle) * knockForce;

        if (closest.hp <= 0 && closest.alive) {
          this.kills += 1;
        }
      }
    }

    if (this.punchCooldown > 0) this.punchCooldown--;
    if (this.punchProgress > 0) this.punchProgress -= 0.16;
  }

  // Draw Cute Chibi Brawler (Style: Fall Guys / Gang Beasts / Chibi Anime)
  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const scale = this.isBoss ? 2.2 : 1;
    ctx.scale(scale, scale);

    // 1. Realistic Perspective Drop Shadow on Ring Floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Shield Forcefield Dome (if active)
    if (this.hasShield) {
      ctx.save();
      const shieldPulse = Math.sin(Date.now() * 0.008) * 2;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 26 + shieldPulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fill();
      ctx.restore();
    }

    // 3. Speed Electricity Trail (if speed boosted)
    if (this.speedBoost > 1) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.lineTo(-18 + Math.random() * 4, 12);
      ctx.moveTo(10, 8);
      ctx.lineTo(18 - Math.random() * 4, 12);
      ctx.stroke();
    }

    // 4. Chibi Bouncy Feet (Sneakers)
    const legOffset = Math.sin(this.stepCycle) * 4;
    ctx.fillStyle = '#0f172a'; // dark sneakers
    // Left shoe
    ctx.beginPath();
    ctx.ellipse(-6, 14 + legOffset, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right shoe
    ctx.beginPath();
    ctx.ellipse(6, 14 - legOffset, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Chibi Body (Capsule Torso with Colored Hoodie/Shirt)
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.roundRect(-10, -2, 20, 16, [6, 6, 8, 8]);
    ctx.fill();
    // Soft highlight on torso
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Arms & Punching Gloves / Weapons
    if (this.punchProgress > 0) {
      const punchDist = this.punchProgress * 22;
      const px = Math.cos(this.punchAngle) * punchDist;
      const py = Math.sin(this.punchAngle) * punchDist;

      // Punching Arm
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.lineTo(px * 0.7, py * 0.7);
      ctx.stroke();

      // Big Oversized Boxing Glove / Fist
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
      // White lace band on glove
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px * 0.85, py * 0.85, 4, 0, Math.PI * 2);
      ctx.fill();

      // Punch Impact Shock Arc
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 11, this.punchAngle - 0.7, this.punchAngle + 0.7);
      ctx.stroke();
    } else {
      // Idle Arms (Clenched boxing stance)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-11, 6, 5, 0, Math.PI * 2);
      ctx.arc(11, 6, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. Weapon (Sword Blade & Glow Arc)
    if (this.weapon === 'sword') {
      ctx.save();
      ctx.translate(10, 2);
      ctx.rotate(this.punchProgress > 0 ? this.punchAngle : 0.4);

      // Sword Blade
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(24, -8);
      ctx.lineTo(26, -4);
      ctx.lineTo(4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sword Hilt
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-2, -3, 5, 7);
      ctx.restore();
    }

    // 8. Chibi Head (Circular Avatar with Golden Champion Rim)
    const headR = 15;
    const headY = -12;

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, headY, headR, 0, Math.PI * 2);
    ctx.clip();

    const avatarImg = getAvatarImg(this.avatar);
    if (avatarImg && avatarImg.complete && avatarImg.naturalWidth > 0) {
      ctx.drawImage(avatarImg, -headR, headY - headR, headR * 2, headR * 2);
    } else {
      ctx.fillStyle = this.color;
      ctx.fill();
      // Cute eyes if no avatar loaded yet
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, headY - 2, 3, 0, Math.PI * 2);
      ctx.arc(4, headY - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-4, headY - 2, 1.5, 0, Math.PI * 2);
      ctx.arc(4, headY - 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Golden Rim around Head
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, headY, headR, 0, Math.PI * 2);
    ctx.stroke();

    // 9. Golden Crown for Top Killer / Leader
    if (this.kills >= 2) {
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', 0, headY - 14);
    }

    // 10. Overhead HUD (Curved HP Bar & Nickname Badge)
    const hpW = 34;
    const hpH = 4.5;
    const hpY = headY - 22;
    const hpRatio = Math.max(0, this.hp / this.maxHp);

    // HP Bar background pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(-hpW / 2 - 1, hpY - 1, hpW + 2, hpH + 2, 3);
    ctx.fill();

    // HP Bar fill gradient
    ctx.fillStyle = hpRatio > 0.5 ? '#10b981' : (hpRatio > 0.25 ? '#f59e0b' : '#ef4444');
    ctx.beginPath();
    ctx.roundRect(-hpW / 2, hpY, hpW * hpRatio, hpH, 2);
    ctx.fill();

    // Nickname Pill
    ctx.fillStyle = 'rgba(10, 14, 26, 0.85)';
    const nameText = this.nickname.length > 10 ? this.nickname.substring(0, 9) + '…' : this.nickname;
    ctx.font = 'bold 9.5px Kanit, sans-serif';
    const textWidth = ctx.measureText(nameText).width;

    ctx.beginPath();
    ctx.roundRect(-textWidth / 2 - 5, hpY - 14, textWidth + 10, 12, 4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(nameText, 0, hpY - 4.5);

    ctx.restore();
  }
}

// ==========================================
// BACKGROUND STAGE RENDERING (งานวัด & มวยวัด)
// ==========================================
function drawTempleFairBackground() {
  const w = viewW;
  const h = viewH;
  const ring = getRing();

  bgCtx.clearRect(0, 0, w, h);

  // 1. Deep Atmospheric Night Sky
  const skyGrad = bgCtx.createLinearGradient(0, 0, 0, h * 0.7);
  skyGrad.addColorStop(0, '#060814');
  skyGrad.addColorStop(0.4, '#0d132b');
  skyGrad.addColorStop(0.75, '#191738');
  skyGrad.addColorStop(1, '#241a30');
  bgCtx.fillStyle = skyGrad;
  bgCtx.fillRect(0, 0, w, h);

  // 2. Twinkling Stars in Upper Sky
  const now = Date.now() * 0.001;
  STARS.forEach(s => {
    const alpha = 0.4 + 0.5 * Math.sin(now * s.pulseSpeed * 20 + s.phase);
    bgCtx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    bgCtx.beginPath();
    bgCtx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
    bgCtx.fill();
  });

  // 3. Golden Full Moon (พระจันทร์วันเพ็ญงานวัด)
  const moonX = w * 0.82;
  const moonY = h * 0.13;
  const moonR = 24;

  // Moon Outer Glow
  const moonGlow = bgCtx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 2.8);
  moonGlow.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
  moonGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
  bgCtx.fillStyle = moonGlow;
  bgCtx.beginPath();
  bgCtx.arc(moonX, moonY, moonR * 2.8, 0, Math.PI * 2);
  bgCtx.fill();

  // Moon Disc & Soft Craters
  const moonBody = bgCtx.createRadialGradient(moonX - 5, moonY - 5, 2, moonX, moonY, moonR);
  moonBody.addColorStop(0, '#fffbeb');
  moonBody.addColorStop(0.8, '#fef08a');
  moonBody.addColorStop(1, '#fde047');
  bgCtx.fillStyle = moonBody;
  bgCtx.beginPath();
  bgCtx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  bgCtx.fill();

  // 4. Sweeping Spotlights in the Fair Night Sky
  spotlightAngle += 0.012;
  const spotSources = [w * 0.22, w * 0.5, w * 0.78];
  const spotColors = ['rgba(56, 189, 248, 0.2)', 'rgba(251, 191, 36, 0.18)', 'rgba(244, 63, 94, 0.18)'];

  spotSources.forEach((sx, idx) => {
    bgCtx.save();
    const beamAngle = Math.sin(spotlightAngle + idx * 1.6) * 0.38 - (Math.PI / 2);
    const beamLen = h * 0.65;
    const grad = bgCtx.createLinearGradient(sx, h * 0.52, sx + Math.cos(beamAngle) * beamLen, (h * 0.52) + Math.sin(beamAngle) * beamLen);
    grad.addColorStop(0, spotColors[idx % spotColors.length]);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    bgCtx.fillStyle = grad;
    bgCtx.beginPath();
    bgCtx.moveTo(sx - 12, h * 0.52);
    bgCtx.lineTo(sx + Math.cos(beamAngle - 0.18) * beamLen, (h * 0.52) + Math.sin(beamAngle - 0.18) * beamLen);
    bgCtx.lineTo(sx + Math.cos(beamAngle + 0.18) * beamLen, (h * 0.52) + Math.sin(beamAngle + 0.18) * beamLen);
    bgCtx.closePath();
    bgCtx.fill();
    bgCtx.restore();
  });

  // 5. Golden Thai Pagoda (ยอดเจดีย์ทองทรงระฆังคว่ำ & ยอดฉัตร)
  const pagodaX = w * 0.5;
  const pagodaY = h * 0.38;

  bgCtx.save();
  // Pagoda Warm Backlight
  const pagodaGlow = bgCtx.createRadialGradient(pagodaX, pagodaY - 40, 10, pagodaX, pagodaY - 30, 80);
  pagodaGlow.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
  pagodaGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
  bgCtx.fillStyle = pagodaGlow;
  bgCtx.beginPath();
  bgCtx.arc(pagodaX, pagodaY - 30, 80, 0, Math.PI * 2);
  bgCtx.fill();

  // Tiered Base
  bgCtx.fillStyle = '#b45309';
  bgCtx.beginPath();
  bgCtx.moveTo(pagodaX - 28, pagodaY);
  bgCtx.lineTo(pagodaX + 28, pagodaY);
  bgCtx.lineTo(pagodaX + 22, pagodaY - 14);
  bgCtx.lineTo(pagodaX - 22, pagodaY - 14);
  bgCtx.closePath();
  bgCtx.fill();

  // Bell Shape
  bgCtx.fillStyle = '#d97706';
  bgCtx.beginPath();
  bgCtx.moveTo(pagodaX - 20, pagodaY - 14);
  bgCtx.quadraticCurveTo(pagodaX - 24, pagodaY - 40, pagodaX - 10, pagodaY - 55);
  bgCtx.lineTo(pagodaX + 10, pagodaY - 55);
  bgCtx.quadraticCurveTo(pagodaX + 24, pagodaY - 40, pagodaX + 20, pagodaY - 14);
  bgCtx.closePath();
  bgCtx.fill();

  // Golden Spire (ยอดฉัตรแหลม)
  bgCtx.fillStyle = '#fef08a';
  bgCtx.beginPath();
  bgCtx.moveTo(pagodaX - 7, pagodaY - 55);
  bgCtx.lineTo(pagodaX + 7, pagodaY - 55);
  bgCtx.lineTo(pagodaX, pagodaY - 95);
  bgCtx.closePath();
  bgCtx.fill();
  bgCtx.restore();

  // 6. Golden Ferris Wheel (ชิงช้าสวรรค์หมุนได้)
  ferrisAngle += 0.007;
  const fwx = w * 0.18;
  const fwy = h * 0.32;
  const fwr = 48;

  bgCtx.save();
  // Support Struts
  bgCtx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
  bgCtx.lineWidth = 2.5;
  bgCtx.beginPath();
  bgCtx.moveTo(fwx, fwy);
  bgCtx.lineTo(fwx - 22, fwy + 55);
  bgCtx.moveTo(fwx, fwy);
  bgCtx.lineTo(fwx + 22, fwy + 55);
  bgCtx.stroke();

  // Double Outer Wheel Ring
  bgCtx.strokeStyle = '#f59e0b';
  bgCtx.lineWidth = 2;
  bgCtx.beginPath();
  bgCtx.arc(fwx, fwy, fwr, 0, Math.PI * 2);
  bgCtx.stroke();
  bgCtx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
  bgCtx.beginPath();
  bgCtx.arc(fwx, fwy, fwr - 8, 0, Math.PI * 2);
  bgCtx.stroke();

  // Ferris Spokes & Colorful Gondolas (กระเช้าชิงช้าสวรรค์)
  const gondolaColors = ['#f43f5e', '#38bdf8', '#facc15', '#a855f7', '#4ade80', '#fb923c'];
  for (let a = 0; a < 8; a++) {
    const ang = ferrisAngle + (a * Math.PI / 4);
    const gx = fwx + Math.cos(ang) * fwr;
    const gy = fwy + Math.sin(ang) * fwr;

    // Spoke Line
    bgCtx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
    bgCtx.lineWidth = 1.2;
    bgCtx.beginPath();
    bgCtx.moveTo(fwx, fwy);
    bgCtx.lineTo(gx, gy);
    bgCtx.stroke();

    // Passenger Gondola (hanging upright)
    bgCtx.fillStyle = gondolaColors[a % gondolaColors.length];
    bgCtx.beginPath();
    bgCtx.roundRect(gx - 4, gy - 2, 8, 8, 2);
    bgCtx.fill();

    // Gondola Roof
    bgCtx.fillStyle = '#fef08a';
    bgCtx.beginPath();
    bgCtx.arc(gx, gy - 2, 3, Math.PI, 0);
    bgCtx.fill();
  }

  // Wheel Center Hub
  bgCtx.fillStyle = '#f59e0b';
  bgCtx.beginPath();
  bgCtx.arc(fwx, fwy, 5, 0, Math.PI * 2);
  bgCtx.fill();
  bgCtx.restore();

  // 7. Festive Fair Tents & Bunting (ซุ้มผ้าใบงานวัด & ธงราว)
  // Left Stall Tent
  const tent1X = w * 0.08;
  const tent1Y = h * 0.41;
  bgCtx.fillStyle = '#e11d48';
  bgCtx.fillRect(tent1X - 25, tent1Y, 50, 18);
  bgCtx.fillStyle = '#ffffff';
  for (let i = 0; i < 4; i++) bgCtx.fillRect(tent1X - 25 + i * 12, tent1Y, 6, 18);

  // Right Stall Tent
  const tent2X = w * 0.85;
  const tent2Y = h * 0.40;
  bgCtx.fillStyle = '#0284c7';
  bgCtx.fillRect(tent2X - 30, tent2Y, 60, 20);
  bgCtx.fillStyle = '#facc15';
  for (let i = 0; i < 5; i++) bgCtx.fillRect(tent2X - 30 + i * 12, tent2Y, 6, 20);

  // Bunting Pennants (ธงราวงานวัดสามเหลี่ยมหลากสี)
  const pennantColors = ['#f43f5e', '#facc15', '#38bdf8', '#4ade80', '#c084fc'];
  const pY = h * 0.38;
  bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  bgCtx.lineWidth = 1;
  bgCtx.beginPath();
  bgCtx.moveTo(w * 0.05, pY);
  bgCtx.quadraticCurveTo(w * 0.5, pY + 12, w * 0.95, pY);
  bgCtx.stroke();

  for (let p = 1; p < 11; p++) {
    const px = (w * 0.05) + (p / 11) * (w * 0.9);
    const t = p / 11;
    const py = (1 - t) * (1 - t) * pY + 2 * (1 - t) * t * (pY + 12) + t * t * pY;
    bgCtx.fillStyle = pennantColors[p % pennantColors.length];
    bgCtx.beginPath();
    bgCtx.moveTo(px - 5, py);
    bgCtx.lineTo(px + 5, py);
    bgCtx.lineTo(px, py + 8);
    bgCtx.closePath();
    bgCtx.fill();
  }

  // 8. MAIN ARENA PLATFORM (สังเวียนวงกลมมวยวัด 2.5D Isometric)
  // 8.1 3D Stage Base & Skirting (Depth)
  bgCtx.fillStyle = '#290e02';
  bgCtx.beginPath();
  bgCtx.ellipse(ring.cx, ring.cy + 16, ring.rx, ring.ry, 0, 0, Math.PI * 2);
  bgCtx.fill();

  // Red Fabric Ring Skirting
  bgCtx.fillStyle = '#7f1d1d';
  bgCtx.beginPath();
  bgCtx.moveTo(ring.cx - ring.rx, ring.cy);
  bgCtx.ellipse(ring.cx, ring.cy, ring.rx, ring.ry, 0, Math.PI, 0, true);
  bgCtx.ellipse(ring.cx, ring.cy + 14, ring.rx, ring.ry, 0, 0, Math.PI, false);
  bgCtx.closePath();
  bgCtx.fill();

  // 8.2 Ring Floor Surface (Warm Mat Gradient)
  const ringGrad = bgCtx.createRadialGradient(ring.cx, ring.cy, 15, ring.cx, ring.cy, ring.rx);
  ringGrad.addColorStop(0, '#9a3412');
  ringGrad.addColorStop(0.65, '#78350f');
  ringGrad.addColorStop(0.95, '#451a03');
  ringGrad.addColorStop(1, '#290e02');
  bgCtx.fillStyle = ringGrad;
  bgCtx.beginPath();
  bgCtx.ellipse(ring.cx, ring.cy, ring.rx, ring.ry, 0, 0, Math.PI * 2);
  bgCtx.fill();

  // 8.3 Concentric Inner Rings
  bgCtx.strokeStyle = 'rgba(251, 191, 36, 0.22)';
  bgCtx.lineWidth = 1.5;
  bgCtx.beginPath();
  bgCtx.ellipse(ring.cx, ring.cy, ring.rx * 0.68, ring.ry * 0.68, 0, 0, Math.PI * 2);
  bgCtx.stroke();

  bgCtx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
  bgCtx.beginPath();
  bgCtx.ellipse(ring.cx, ring.cy, ring.rx * 0.35, ring.ry * 0.35, 0, 0, Math.PI * 2);
  bgCtx.stroke();

  // Center Emblem
  bgCtx.fillStyle = 'rgba(251, 191, 36, 0.15)';
  bgCtx.beginPath();
  bgCtx.ellipse(ring.cx, ring.cy, 18, 9, 0, 0, Math.PI * 2);
  bgCtx.fill();

  // 8.4 Bright Glowing Golden Ring Perimeter
  bgCtx.strokeStyle = '#f59e0b';
  bgCtx.lineWidth = 4.5;
  bgCtx.shadowColor = '#fbbf24';
  bgCtx.shadowBlur = 18;
  bgCtx.beginPath();
  bgCtx.ellipse(ring.cx, ring.cy, ring.rx, ring.ry, 0, 0, Math.PI * 2);
  bgCtx.stroke();
  bgCtx.shadowBlur = 0;

  // 8.5 Warm Incandescent Bulbs around the Ring Perimeter
  const numBulbs = 32;
  for (let b = 0; b < numBulbs; b++) {
    const bAngle = (b / numBulbs) * Math.PI * 2;
    const bx = ring.cx + Math.cos(bAngle) * ring.rx;
    const by = ring.cy + Math.sin(bAngle) * ring.ry;

    // Bulb glow halo
    bgCtx.fillStyle = (b % 2 === 0) ? 'rgba(254, 240, 138, 0.9)' : 'rgba(245, 158, 11, 0.9)';
    bgCtx.beginPath();
    bgCtx.arc(bx, by, 3.2, 0, Math.PI * 2);
    bgCtx.fill();
  }
}

// ==========================================
// GAME COMBAT ANIMATION LOOP (60 FPS)
// ==========================================
function gameLoop() {
  requestAnimationFrame(gameLoop);

  // 1. Draw Festive Background
  drawTempleFairBackground();

  // 2. Clear Fighter Canvas
  ctx.clearRect(0, 0, viewW, viewH);

  // 3. Update & Draw Fighters (Sorted by Y for correct isometric depth)
  clientFighters.sort((a, b) => a.y - b.y);

  clientFighters.forEach(f => {
    f.update(1 / 60, clientFighters);
    f.draw(ctx);
  });

  // 4. Draw Shockwaves
  for (let i = shockwaveRings.length - 1; i >= 0; i--) {
    const sw = shockwaveRings[i];
    sw.radius += 12;
    sw.life -= 0.04;

    ctx.save();
    ctx.strokeStyle = sw.color;
    ctx.lineWidth = 4 * sw.life;
    ctx.shadowColor = sw.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(sw.x, sw.y, sw.radius, sw.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (sw.life <= 0 || sw.radius >= sw.maxRadius) {
      shockwaveRings.splice(i, 1);
    }
  }

  // 5. Draw Hit Sparks
  for (let i = hitParticles.length - 1; i >= 0; i--) {
    const p = hitParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.05;

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();

    if (p.life <= 0) hitParticles.splice(i, 1);
  }

  // 6. Draw Floating Damage Numbers
  for (let i = damageFloats.length - 1; i >= 0; i--) {
    const d = damageFloats[i];
    d.y -= 1.2;
    d.life -= 0.03;

    ctx.font = 'black 14px Chakra Petch, sans-serif';
    ctx.fillStyle = d.color;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(d.text, d.x, d.y);
    ctx.shadowBlur = 0;

    if (d.life <= 0) damageFloats.splice(i, 1);
  }

  // 7. Draw Ascending Knockout Ghosts (👻)
  for (let i = ghosts.length - 1; i >= 0; i--) {
    const g = ghosts[i];
    g.y += g.vy;
    g.life -= 0.02;
    g.alpha = Math.max(0, g.life);

    ctx.save();
    ctx.globalAlpha = g.alpha;
    ctx.translate(g.x, g.y);

    // Golden Angel Halo
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, -18, 9, 3.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Cute Translucent Ghost
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👻', 0, 0);

    ctx.restore();

    if (g.life <= 0) ghosts.splice(i, 1);
  }
}
requestAnimationFrame(gameLoop);

// ==========================================
// SOCKET.IO EVENT HANDLERS
// ==========================================
socket.on('state_update', (state) => {
  // 1. Update Timer & Round HUD
  const mins = Math.floor(state.timeLeft / 60);
  const secs = state.timeLeft % 60;
  arenaTimerVal.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  const fightersList = Object.values(state.fighters || {});
  const aliveCount = fightersList.filter(f => f.alive).length;
  roundInfoText.innerText = `รอบที่ ${state.roundNumber} • เหลือ ${aliveCount}/${fightersList.length} คน`;

  // 2. Sync Local Fighters
  syncFighters(state.fighters || {});

  // 3. Render Leaderboard
  renderLeaderboard(state.leaderboard || []);

  // 4. Render Sidebar Stats
  renderSidebar(state);

  // 5. Handle Victory Overlay
  if (state.status === 'ROUND_END' && state.lastWinner) {
    victoryOverlay.classList.remove('hidden');
    nextRoundSec.innerText = state.nextRoundCountdown || 5;
    winnerNameText.innerText = state.lastWinner.nickname;
    winnerDescText.innerText = `ชนะรอบที่ ${state.lastWinner.round} • น็อคไป ${state.lastWinner.kills} คน!`;
    winnerAvatarImg.src = state.lastWinner.avatar || '/assets/avatar-1.svg';
  } else {
    victoryOverlay.classList.add('hidden');
  }
});

// Synchronize Server State to Client Fighters
function syncFighters(serverFighters) {
  const existingIds = new Set(clientFighters.map(f => f.id));

  Object.values(serverFighters).forEach(sf => {
    let local = clientFighters.find(f => f.id === sf.id);
    if (!local) {
      local = new ClientFighter(sf);
      clientFighters.push(local);
    } else {
      local.hp = sf.hp;
      local.maxHp = sf.maxHp;
      local.alive = sf.alive;
      local.weapon = sf.weapon;
      local.hasShield = sf.hasShield;
      local.speedBoost = sf.speedBoost;
      local.kills = sf.kills;
      local.isBoss = sf.weapon === 'giant_glove';
    }
  });

  // Remove stale fighters not in server state
  clientFighters = clientFighters.filter(f => serverFighters[f.id]);
}

// Spawn single fighter
socket.on('spawn_fighter', (fighterData) => {
  let existing = clientFighters.find(f => f.id === fighterData.id);
  if (!existing) {
    clientFighters.push(new ClientFighter(fighterData));
  } else {
    existing.alive = true;
    existing.hp = fighterData.hp;
    const ring = getRing();
    existing.x = ring.cx + (Math.random() - 0.5) * ring.rx * 0.8;
    existing.y = ring.cy + (Math.random() - 0.5) * ring.ry * 0.8;
  }
});

// Sound & Visual Event Triggers
socket.on('round_winner', () => sfx.playVictory());
socket.on('new_round_started', () => sfx.playBell());

socket.on('fighter_shockwave', (payload) => {
  const fighter = clientFighters.find(f => f.id === payload.id);
  const ring = getRing();
  const ox = fighter ? fighter.x : ring.cx;
  const oy = fighter ? fighter.y : ring.cy;

  spawnShockwaveEffect(ox, oy);
  sfx.playShockwave();

  // Push everyone else back
  clientFighters.forEach(other => {
    if (other.id !== payload.id && other.alive) {
      const angle = Math.atan2(other.y - oy, other.x - ox);
      other.vx += Math.cos(angle) * 14;
      other.vy += Math.sin(angle) * 14;
      other.hp -= 20;
      spawnDamageNumber(other.x, other.y, 20);
    }
  });
});

socket.on('fighter_ultimate', (payload) => {
  const ring = getRing();
  spawnShockwaveEffect(ring.cx, ring.cy);
  sfx.playShockwave();

  clientFighters.forEach(other => {
    if (other.id !== payload.id && other.alive) {
      const angle = Math.atan2(other.y - ring.cy, other.x - ring.cx);
      other.vx += Math.cos(angle) * 18;
      other.vy += Math.sin(angle) * 18;
      other.hp -= 35;
      spawnHitSparks(other.x, other.y);
      spawnDamageNumber(other.x, other.y, 35);
    }
  });
});

socket.on('chat_bubble', (data) => {
  const fighter = clientFighters.find(f => f.id === data.username);
  if (!fighter) return;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerText = `${data.nickname}: ${data.comment}`;
  bubble.style.left = `${fighter.x}px`;
  bubble.style.top = `${fighter.y - 35}px`;
  chatBubbleLayer.appendChild(bubble);
  setTimeout(() => bubble.remove(), 3200);
});

// Render Leaderboard Card
function renderLeaderboard(board) {
  if (!board || board.length === 0) {
    champList.innerHTML = '<div class="text-[9px] text-slate-500 text-center py-1">รอแชมเปียน...</div>';
    return;
  }
  champList.innerHTML = board.slice(0, 3).map((item, idx) => `
    <div class="champ-row">
      <div class="flex items-center gap-1 min-w-0">
        <span class="champ-rank">${idx + 1}.</span>
        <span class="champ-name">${escapeHtml(item.nickname)}</span>
      </div>
      <span class="champ-score">${item.wins || 0}🏆 ${item.kills || 0}🥊</span>
    </div>
  `).join('');
}

// ==========================================
// SIDEBAR & LOGS RENDERING
// ==========================================
function renderSidebar(state) {
  if (state.tiktok.isConnected) {
    sideConnStatus.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800";
    sideConnStatus.innerText = "เชื่อมต่อสด";
    tiktokPill.className = "px-2 py-0.2 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-semibold flex items-center gap-1.5 inline-flex";
    tiktokPillText.innerText = `@${state.tiktok.username}`;
    sideConnectBtn.classList.add('hidden');
    sideDisconnectBtn.classList.remove('hidden');
  } else {
    sideConnStatus.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800";
    sideConnStatus.innerText = "ออฟไลน์";
    tiktokPill.className = "px-2 py-0.2 rounded-full bg-rose-950/80 border border-rose-800/80 text-rose-300 font-semibold flex items-center gap-1.5 inline-flex";
    tiktokPillText.innerText = "ออฟไลน์";
    sideConnectBtn.classList.remove('hidden');
    sideDisconnectBtn.classList.add('hidden');
  }

  sideViewerCount.innerText = Number(state.tiktok.viewerCount || 0).toLocaleString();
  sideLikeCount.innerText = Number(state.tiktok.likeCount || 0).toLocaleString();

  const fighters = Object.values(state.fighters || {});
  sideFighterCount.innerText = fighters.length;

  if (fighters.length === 0) {
    sideFighterTable.innerHTML = `<tr><td class="text-slate-500 italic text-center py-4">ยังไม่มีนักสู้ลงเวที... กด "เติมบอท 5 คน" ได้เลย!</td></tr>`;
    return;
  }

  sideFighterTable.innerHTML = fighters.map(f => {
    const hpRatio = Math.max(0, f.hp / (f.maxHp || 100));
    const hpColor = hpRatio > 0.5 ? 'bg-emerald-500' : (hpRatio > 0.25 ? 'bg-amber-500' : 'bg-rose-500');

    return `
      <tr class="hover:bg-slate-950/60 transition">
        <td class="py-1.5 px-1.5 flex items-center gap-1.5">
          <img src="${f.avatar || '/assets/avatar-1.svg'}" class="w-5 h-5 rounded-full border border-amber-400/40">
          <div class="min-w-0">
            <span class="font-bold text-slate-200 block truncate max-w-[85px] leading-tight">${escapeHtml(f.nickname)}</span>
            <div class="w-16 h-1.5 bg-slate-800 rounded-full mt-0.5 overflow-hidden">
              <div class="h-full ${hpColor}" style="width: ${hpRatio * 100}%"></div>
            </div>
          </div>
        </td>
        <td class="py-1.5 px-1 ${f.alive ? 'text-emerald-400 font-bold' : 'text-slate-500 line-through'}">
          ${f.alive ? `HP ${Math.floor(f.hp)}` : '💀 ตกเวที'}
        </td>
        <td class="py-1.5 px-1 text-amber-300 font-bold text-right pr-2">⚔️ ${f.kills || 0}</td>
      </tr>
    `;
  }).join('');
}

// Live Event Feed
socket.on('new_event', (event) => {
  if (sideEventLog.querySelector('.italic')) sideEventLog.innerHTML = '';
  const div = document.createElement('div');
  div.className = "flex items-start gap-1.5 p-1 bg-slate-950/60 rounded border border-slate-800/40";
  div.innerHTML = `
    <span class="text-slate-500 shrink-0 font-mono text-[9px]">${event.time}</span>
    <span class="text-slate-200 break-words">${event.text}</span>
  `;
  sideEventLog.prepend(div);
  while (sideEventLog.children.length > 35) sideEventLog.removeChild(sideEventLog.lastChild);
});

sideClearLogBtn.addEventListener('click', () => {
  sideEventLog.innerHTML = '<div class="text-slate-500 italic text-center py-2">ล้างแล้ว</div>';
});

// TikTok Connect Buttons
sideConnectBtn.addEventListener('click', () => {
  const user = sideUsernameInput.value.trim();
  if (user) socket.emit('tiktok_connect', user);
});
sideDisconnectBtn.addEventListener('click', () => socket.emit('tiktok_disconnect'));

// Toggle Admin Sidebar
toggleAdminBtn.addEventListener('click', () => {
  adminSidebar.classList.toggle('hidden');
  const isHidden = adminSidebar.classList.contains('hidden');
  toggleAdminText.innerText = isHidden ? 'เปิดเมนูแอดมิน' : 'ซ่อนเมนูแอดมิน';
  resizeCanvases();
});

// Copy OBS URL Button
copyObsBtn.addEventListener('click', () => {
  const url = `${window.location.origin}/?mode=obs`;
  navigator.clipboard.writeText(url).then(() => {
    const orig = copyObsBtn.innerHTML;
    copyObsBtn.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i> <span>คัดลอกแล้ว!</span>`;
    setTimeout(() => { copyObsBtn.innerHTML = orig; }, 2000);
  });
});

// Check if loaded with ?mode=obs (auto fullscreen/OBS mode)
if (new URLSearchParams(window.location.search).get('mode') === 'obs') {
  document.body.classList.add('obs-mode');
  resizeCanvases();
}

// ==========================================
// SIMULATOR BUTTON HANDLERS
// ==========================================
window.simJoin = function() {
  socket.emit('sim_join');
};

window.simSpawnBots = function() {
  socket.emit('sim_spawn_bots');
};

window.simLike = function() {
  socket.emit('sim_like', { count: 30 });
};

window.simFollow = function() {
  socket.emit('sim_follow');
};

window.simShare = function() {
  socket.emit('sim_share');
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
