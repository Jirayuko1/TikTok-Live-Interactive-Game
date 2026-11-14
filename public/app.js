// ========================================================
// ARENA LIVE: FIGHTER BLAZE (16-BIT CYBERPUNK ROOFTOP ARENA)
// สังเวียนดาดฟ้าไซเบอร์พังก์ TikTok Live สไตล์ Retro 16-Bit
// ========================================================

const socket = io();

// DOM Elements
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
const arenaCanvas = document.getElementById('arenaCanvas');
const ctx = arenaCanvas.getContext('2d');

bgCtx.imageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

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
const popoutOverlayBtn = document.getElementById('popoutOverlayBtn');
const sfxToggleBtn = document.getElementById('sfxToggleBtn');
const sfxIcon = document.getElementById('sfxIcon');

// Admin Sidebar
const adminSidebar = document.getElementById('adminSidebar');
const sidePopoutBtn = document.getElementById('sidePopoutBtn');
const sideCopyUrlBtn = document.getElementById('sideCopyUrlBtn');
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

// ========================================================
// RETRO 16-BIT / 8-BIT AUDIO SYNTHESIZER
// ========================================================
class RetroSoundFX {
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

  playBell() {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [587.33, 880, 1174.66].forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);
        gain.gain.setValueAtTime(0.18, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } catch(e) {}
  }

  playPunch() {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch(e) {}
  }

  playSpecial() {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.28);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch(e) {}
  }

  playBlock() {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch(e) {}
  }

  playVictory() {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          if (this.muted || !this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.25);
        }, idx * 85);
      });
    } catch(e) {}
  }
}
const sfx = new RetroSoundFX();
window.addEventListener('click', () => sfx.ensure(), { once: true });

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

// ========================================================
// RESIZE & HIGH-DPI PIXEL CANVAS SETUP
// ========================================================
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
  bgCtx.imageSmoothingEnabled = false;

  arenaCanvas.width = viewW * dpr;
  arenaCanvas.height = viewH * dpr;
  arenaCanvas.style.width = `${viewW}px`;
  arenaCanvas.style.height = `${viewH}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

// Rooftop Arena Combat Boundary (Positioned on the wet rooftop floor)
function getRing() {
  const cx = viewW / 2;
  const cy = viewH * 0.72; // Centered on the open concrete rooftop
  const rx = viewW * 0.43; // Width
  const ry = viewH * 0.18; // 2.5D perspective height
  return { cx, cy, rx, ry };
}

// ========================================================
// ASSET LOADERS (CYBERPUNK BG & FIGHTER BLAZE SPRITES)
// ========================================================
const cyberpunkBgImg = new Image();
cyberpunkBgImg.src = '/assets/cyberpunk-bg.png';

const cyberSharkImg = new Image();
cyberSharkImg.src = '/assets/cyber_shark.png';

const cyberCarImg = new Image();
cyberCarImg.src = '/assets/cyber_car1.png';

const projectileImg = new Image();
projectileImg.src = '/assets/fighter/projectile_0.png';

// Pre-load all 6 palettes of Fighter: Blaze
const SPRITE_NAMES = {
  idle: ['idle_0', 'idle_1', 'idle_2', 'idle_3', 'idle_4'],
  attack: ['attack_0', 'attack_1', 'attack_2', 'attack_3', 'attack_4', 'attack_5'],
  special: ['special_0', 'special_1', 'special_2', 'special_3'],
  run: ['run_0', 'run_1', 'run_2', 'run_3'],
  block: ['block_0', 'block_1', 'block_2'],
  hurt: ['hurt_0'],
  projectile: ['projectile_0']
};

const SPRITE_CACHE = {};
for (let pal = 0; pal < 6; pal++) {
  SPRITE_CACHE[pal] = {};
  const basePath = pal === 0 ? '/assets/fighter' : `/assets/fighter/pal_${pal}`;
  for (const [cat, names] of Object.entries(SPRITE_NAMES)) {
    SPRITE_CACHE[pal][cat] = names.map(name => {
      const im = new Image();
      im.src = `${basePath}/${name}.png`;
      return im;
    });
  }
}

// ========================================================
// DYNAMIC CYBERPUNK SCENE OBJECTS & PARTICLES
// ========================================================
// 1. Flying Cyberpunk Hovercars (รถบินข้ามตึกในอากาศ)
const hoverCars = [
  { x: -60, yRel: 0.28, speed: 1.7, dir: 1, type: 'police' },
  { x: 500, yRel: 0.33, speed: -1.3, dir: -1, type: 'taxi' },
  { x: -120, yRel: 0.23, speed: 0.9, dir: 1, type: 'transport' }
];

// 2. Rising Steam & Smoke from Pipes (ควันลอยพวยพุ่งจากท่อ)
let steamParticles = [];

// 3. Fire Particles for the Barrels (ไฟลุกในถังน้ำมัน)
let fireParticles = [];

// 4. Combat Hit Sparks & Damage Numbers
let hitParticles = [];
let damageFloats = [];
let ghosts = [];
let activeProjectiles = [];

// Rotating Moon HUD angle & Searchlight angles
let moonHudAngle = 0;
let searchlightAngle = 0;

// Spawn Hit Sparks
function spawnPixelHitSparks(x, y, isSpecial = false) {
  const count = isSpecial ? 16 : 8;
  const colors = isSpecial ? ['#38bdf8', '#0284c7', '#ffffff'] : ['#facc15', '#ef4444', '#ffffff'];

  for (let i = 0; i < count; i++) {
    hitParticles.push({
      x, y,
      vx: (Math.random() - 0.5) * (isSpecial ? 9 : 6),
      vy: (Math.random() - 0.5) * (isSpecial ? 9 : 6),
      size: Math.floor(Math.random() * 3 + 2),
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

function spawnPixelDamage(x, y, amount) {
  damageFloats.push({
    x: x + (Math.random() - 0.5) * 14,
    y: y - 25,
    text: `-${amount}`,
    life: 1,
    color: amount >= 25 ? '#fbbf24' : '#ef4444'
  });
}

function spawnPixelGhost(x, y, palette) {
  ghosts.push({
    x, y,
    vy: -1.6,
    palette,
    alpha: 0.95,
    life: 1.8
  });
}

// Special Projectile Class (แถวที่ 3 Special Plasma Blast)
class SpecialProjectile {
  constructor(x, y, vx, vy, ownerId, palette) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.ownerId = ownerId;
    this.palette = palette;
    this.radius = 18;
    this.life = 1;
    this.alive = true;
    this.angle = 0;
  }

  update(allFighters) {
    this.x += this.vx;
    this.y += this.vy;
    this.angle += 0.2;

    hitParticles.push({
      x: this.x + (Math.random() - 0.5) * 8,
      y: this.y + (Math.random() - 0.5) * 8,
      vx: -this.vx * 0.15,
      vy: -this.vy * 0.15,
      size: Math.floor(Math.random() * 3 + 2),
      life: 0.5,
      color: '#38bdf8'
    });

    allFighters.forEach(other => {
      if (other.id !== this.ownerId && other.alive && this.alive) {
        const d = Math.hypot(other.x - this.x, other.y - this.y);
        if (d < this.radius + 16) {
          this.alive = false;

          other.hp -= 35;
          other.state = 'hurt';
          other.animTicks = 0;

          const angle = Math.atan2(other.y - this.y, other.x - this.x);
          other.vx += Math.cos(angle) * 16;
          other.vy += Math.sin(angle) * 16;

          spawnPixelHitSparks(this.x, this.y, true);
          spawnPixelDamage(other.x, other.y, 35);
          sfx.playPunch();
        }
      }
    });

    const ring = getRing();
    if (Math.hypot(this.x - ring.cx, this.y - ring.cy) > ring.rx * 1.5) {
      this.alive = false;
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;

    if (projectileImg && projectileImg.complete) {
      ctx.drawImage(projectileImg, -14, -14, 28, 28);
    } else {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-8, -8, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -4, 8, 8);
    }
    ctx.restore();
  }
}

// ========================================================
// CLIENT FIGHTER (FIGHTER: BLAZE ANIMATION ENGINE)
// ========================================================
let clientFighters = [];

class ClientFighter {
  constructor(data) {
    const ring = getRing();
    const spawnAngle = Math.random() * Math.PI * 2;
    const dist = Math.random() * (ring.rx * 0.65);

    this.id = data.id;
    this.nickname = data.nickname;
    this.avatar = data.avatar;
    this.color = data.color || '#f43f5e';
    this.palette = data.palette !== undefined ? data.palette % 6 : 0;
    this.hp = data.hp || 100;
    this.maxHp = data.maxHp || 100;
    this.alive = true;
    this.weapon = data.weapon || 'none';
    this.hasShield = data.hasShield || false;
    this.speedBoost = data.speedBoost || 1;
    this.kills = 0;
    this.isBoss = false;

    this.x = ring.cx + Math.cos(spawnAngle) * dist;
    this.y = ring.cy + Math.sin(spawnAngle) * (dist * (ring.ry / ring.rx));
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;

    // Sprite State: 'idle', 'run', 'attack', 'special', 'block', 'hurt'
    this.state = 'idle';
    this.frameIndex = 0;
    this.animTicks = 0;
    this.facingLeft = false;
    this.attackCooldown = Math.floor(Math.random() * 20);
    this.attackType = 0;
  }

  update(dt, allFighters) {
    if (!this.alive) return;

    const ring = getRing();

    // Friction & Velocity
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.86;
    this.vy *= 0.86;

    if (Math.abs(this.vx) > 0.2) {
      this.facingLeft = this.vx < 0;
    }

    // Check Ring-Out (Falls off the skyscraper rooftop!)
    const dx = (this.x - ring.cx) / ring.rx;
    const dy = (this.y - ring.cy) / ring.ry;
    const distRatio = Math.sqrt(dx * dx + dy * dy);

    if (distRatio > 1.05 || this.hp <= 0) {
      this.alive = false;
      spawnPixelGhost(this.x, this.y, this.palette);
      socket.emit('fighter_knocked_out', { victimId: this.id });
      return;
    }

    // AI Target Closest Enemy
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

    const isAttacking = (this.state === 'attack' || this.state === 'special');

    if (closest && !isAttacking && this.state !== 'hurt') {
      const angle = Math.atan2(closest.y - this.y, closest.x - this.x);
      this.facingLeft = (closest.x < this.x);

      const moveSpeed = (0.8 + Math.random() * 0.4) * (this.speedBoost || 1);
      this.vx += Math.cos(angle) * moveSpeed;
      this.vy += Math.sin(angle) * (moveSpeed * (ring.ry / ring.rx));

      if (Math.hypot(this.vx, this.vy) > 0.4) {
        this.state = 'run';
      } else {
        this.state = 'idle';
      }

      // Attack when close
      const attackRange = 36;
      if (closestDist < attackRange && this.attackCooldown <= 0) {
        this.attackCooldown = 24 + Math.floor(Math.random() * 15);
        this.state = 'attack';
        this.frameIndex = 0;
        this.animTicks = 0;
        this.attackType = Math.floor(Math.random() * 4);

        const damage = this.isBoss ? 45 : (this.weapon === 'sword' ? 28 : 18);
        closest.hp -= damage;
        closest.state = 'hurt';
        closest.animTicks = 0;

        spawnPixelHitSparks(closest.x, closest.y);
        spawnPixelDamage(closest.x, closest.y, damage);
        sfx.playPunch();

        const knockForce = this.isBoss ? 14 : 7;
        closest.vx += Math.cos(angle) * knockForce;
        closest.vy += Math.sin(angle) * knockForce;

        if (closest.hp <= 0 && closest.alive) {
          this.kills += 1;
        }
      }
    }

    if (this.attackCooldown > 0) this.attackCooldown--;

    this.updateAnimation();
  }

  updateAnimation() {
    this.animTicks++;

    if (this.state === 'idle') {
      if (this.animTicks >= 7) {
        this.animTicks = 0;
        this.frameIndex = (this.frameIndex + 1) % 5;
      }
    } 
    else if (this.state === 'run') {
      if (this.animTicks >= 5) {
        this.animTicks = 0;
        this.frameIndex = (this.frameIndex + 1) % 4;

        if (Math.random() > 0.4) {
          hitParticles.push({
            x: this.x + (this.facingLeft ? 8 : -8),
            y: this.y + 12,
            vx: (this.facingLeft ? 1 : -1) * (Math.random() * 1.5 + 0.5),
            vy: -Math.random() * 0.8,
            size: 2,
            life: 0.4,
            color: '#94a3b8'
          });
        }
      }
    } 
    else if (this.state === 'attack') {
      if (this.animTicks >= 4) {
        this.animTicks = 0;
        this.frameIndex++;

        if (this.frameIndex >= 6) {
          this.state = 'idle';
          this.frameIndex = 0;
        }
      }
    } 
    else if (this.state === 'special') {
      if (this.animTicks >= 6) {
        this.animTicks = 0;
        this.frameIndex++;

        if (this.frameIndex === 2) {
          const dir = this.facingLeft ? -1 : 1;
          activeProjectiles.push(new SpecialProjectile(
            this.x + dir * 25, this.y - 12, dir * 9, 0, this.id, this.palette
          ));
          sfx.playSpecial();
        }

        if (this.frameIndex >= 4) {
          this.state = 'idle';
          this.frameIndex = 0;
        }
      }
    } 
    else if (this.state === 'block') {
      if (this.animTicks >= 6) {
        this.animTicks = 0;
        this.frameIndex = (this.frameIndex + 1) % 3;
      }
    } 
    else if (this.state === 'hurt') {
      if (this.animTicks >= 14) {
        this.animTicks = 0;
        this.state = 'idle';
        this.frameIndex = 0;
      }
    }
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const scale = this.isBoss ? 1.4 : 0.72;
    ctx.scale(scale, scale);

    // Realistic Drop Shadow on Wet Rooftop Floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(-18, 12, 36, 6);
    ctx.fillRect(-12, 10, 24, 10);

    // Orientation Flip
    if (this.facingLeft) {
      ctx.scale(-1, 1);
    }

    // Active Sprite Frame
    const palSprites = SPRITE_CACHE[this.palette] || SPRITE_CACHE[0];
    let spriteImg = null;

    if (this.state === 'idle') {
      spriteImg = palSprites.idle[this.frameIndex % 5];
    } else if (this.state === 'run') {
      spriteImg = palSprites.run[this.frameIndex % 4];
    } else if (this.state === 'attack') {
      spriteImg = palSprites.attack[this.frameIndex % 6];
    } else if (this.state === 'special') {
      spriteImg = palSprites.special[this.frameIndex % 4];
    } else if (this.state === 'block' || this.hasShield) {
      spriteImg = palSprites.block[this.frameIndex % 3];
    } else if (this.state === 'hurt') {
      spriteImg = palSprites.hurt[0];
    }

    if (spriteImg && spriteImg.complete) {
      const sw = spriteImg.naturalWidth || 70;
      const sh = spriteImg.naturalHeight || 95;
      ctx.drawImage(spriteImg, -sw / 2, 16 - sh);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(-12, -40, 24, 52);
    }

    if (this.facingLeft) {
      ctx.scale(-1, 1);
    }

    // Crown for Kill Leader
    if (this.kills >= 2) {
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', 0, -82);
    }

    // Retro 16-Bit Arcade HP Bar
    const hpW = 42;
    const hpH = 5;
    const hpY = -68;
    const hpRatio = Math.max(0, this.hp / this.maxHp);

    ctx.fillStyle = '#000000';
    ctx.fillRect(-hpW / 2 - 2, hpY - 2, hpW + 4, hpH + 4);

    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-hpW / 2, hpY, hpW, hpH);

    ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : (hpRatio > 0.25 ? '#eab308' : '#ef4444');
    ctx.fillRect(-hpW / 2, hpY, Math.floor(hpW * hpRatio), hpH);

    // Player Nickname
    ctx.fillStyle = '#000000';
    ctx.fillRect(-35, hpY - 14, 70, 11);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "Chakra Petch", monospace';
    ctx.textAlign = 'center';
    const displayName = this.nickname.length > 9 ? this.nickname.substring(0, 8) + '…' : this.nickname;
    ctx.fillText(displayName, 0, hpY - 5);

    ctx.restore();
  }
}

// ========================================================
// CYBERPUNK ROOFTOP BACKGROUND & ANIMATED SCENE OBJECTS
// ========================================================
function drawCyberpunkBackground() {
  const w = viewW;
  const h = viewH;
  const time = Date.now() * 0.001;

  bgCtx.clearRect(0, 0, w, h);

  // 1. Base High-Fidelity Cyberpunk Rooftop Background Image
  if (cyberpunkBgImg.complete && cyberpunkBgImg.naturalWidth > 0) {
    bgCtx.drawImage(cyberpunkBgImg, 0, 0, w, h);
  } else {
    bgCtx.fillStyle = '#090d1f';
    bgCtx.fillRect(0, 0, w, h);
  }

  // 2. Animated Sky Searchlights (ลำแสงสปอตไลท์ส่องฟ้ากวาดไปมา)
  searchlightAngle += 0.01;
  [w * 0.38, w * 0.55].forEach((sx, idx) => {
    bgCtx.save();
    const beamAng = Math.sin(searchlightAngle + idx * 2.2) * 0.3 - (Math.PI / 2);
    const grad = bgCtx.createLinearGradient(sx, h * 0.42, sx + Math.cos(beamAng) * 280, h * 0.42 + Math.sin(beamAng) * 280);
    grad.addColorStop(0, idx === 0 ? 'rgba(56, 189, 248, 0.22)' : 'rgba(168, 85, 247, 0.18)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    bgCtx.fillStyle = grad;
    bgCtx.beginPath();
    bgCtx.moveTo(sx - 10, h * 0.42);
    bgCtx.lineTo(sx + Math.cos(beamAng - 0.12) * 280, h * 0.42 + Math.sin(beamAng - 0.12) * 280);
    bgCtx.lineTo(sx + Math.cos(beamAng + 0.12) * 280, h * 0.42 + Math.sin(beamAng + 0.12) * 280);
    bgCtx.closePath();
    bgCtx.fill();
    bgCtx.restore();
  });

  // 3. Animated Cyber Moon & Rotating Tech HUD Reticle (พระจันทร์และวงแหวน HUD หมุน)
  const mx = w * 0.68;
  const my = h * 0.12;
  moonHudAngle += 0.008;

  bgCtx.save();
  bgCtx.translate(mx, my);

  // Rotating Outer HUD Ring
  bgCtx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
  bgCtx.lineWidth = 1.5;
  bgCtx.beginPath();
  bgCtx.arc(0, 0, 22, moonHudAngle, moonHudAngle + Math.PI * 1.5);
  bgCtx.stroke();

  // Rotating Inner Dashed Ring
  bgCtx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
  bgCtx.setLineDash([3, 4]);
  bgCtx.beginPath();
  bgCtx.arc(0, 0, 16, -moonHudAngle * 1.4, -moonHudAngle * 1.4 + Math.PI * 2);
  bgCtx.stroke();
  bgCtx.setLineDash([]);

  // Crosshairs & Target Text
  bgCtx.fillStyle = 'rgba(56, 189, 248, 0.8)';
  bgCtx.font = 'bold 6.5px monospace';
  bgCtx.textAlign = 'center';
  bgCtx.fillText('TARGET:LOCK', 0, 32);

  bgCtx.restore();

  // 4. Animated Holographic Shark (ป้ายโฮโลแกรมฉลามขยับได้ / ลอยว่ายน้ำ)
  const sharkBaseX = w * 0.22;
  const sharkBaseY = h * 0.16;
  const sharkFloatY = sharkBaseY + Math.sin(time * 3) * 2.5;

  bgCtx.save();
  // Cyan Holographic Glow
  bgCtx.shadowColor = '#38bdf8';
  bgCtx.shadowBlur = 10;

  if (cyberSharkImg.complete && cyberSharkImg.naturalWidth > 0) {
    const sw = 56;
    const sh = 38;
    // Occasional micro glitch
    const glitchX = (Math.random() > 0.96) ? (Math.random() - 0.5) * 4 : 0;
    bgCtx.drawImage(cyberSharkImg, sharkBaseX - sw / 2 + glitchX, sharkFloatY - sh / 2, sw, sh);

    // Holographic Scanline Sweep passing through the shark
    const scanlineY = sharkFloatY - sh / 2 + ((Date.now() * 0.05) % sh);
    bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    bgCtx.lineWidth = 1.5;
    bgCtx.beginPath();
    bgCtx.moveTo(sharkBaseX - sw / 2 + 4, scanlineY);
    bgCtx.lineTo(sharkBaseX + sw / 2 - 4, scanlineY);
    bgCtx.stroke();
  }
  bgCtx.restore();

  // 5. Animated Flying Hovercars across Skyway (รถบินข้ามตึกไป-มา)
  hoverCars.forEach(car => {
    car.x += car.speed;
    const cy = h * car.yRel;

    // Wrap around screen edges
    if (car.dir > 0 && car.x > w + 60) car.x = -60;
    if (car.dir < 0 && car.x < -60) car.x = w + 60;

    bgCtx.save();
    bgCtx.translate(car.x, cy);
    if (car.dir < 0) bgCtx.scale(-1, 1);

    // Draw Cyber Hovercar
    if (cyberCarImg.complete && cyberCarImg.naturalWidth > 0) {
      bgCtx.drawImage(cyberCarImg, -18, -10, 36, 20);
    } else {
      bgCtx.fillStyle = '#0284c7';
      bgCtx.fillRect(-14, -6, 28, 12);
    }

    // Jet Thruster Flame
    bgCtx.fillStyle = '#38bdf8';
    bgCtx.fillRect(-22 - Math.random() * 4, -2, 6 + Math.random() * 4, 4);

    // Headlight Beam
    const headBeam = bgCtx.createLinearGradient(16, 0, 60, 0);
    headBeam.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    headBeam.addColorStop(1, 'rgba(254, 240, 138, 0)');
    bgCtx.fillStyle = headBeam;
    bgCtx.beginPath();
    bgCtx.moveTo(16, -3);
    bgCtx.lineTo(65, -10);
    bgCtx.lineTo(65, 10);
    bgCtx.lineTo(16, 3);
    bgCtx.closePath();
    bgCtx.fill();

    // Police Flashing Strobe (if police type)
    if (car.type === 'police') {
      const isRed = Math.floor(Date.now() * 0.01) % 2 === 0;
      bgCtx.fillStyle = isRed ? '#ef4444' : '#38bdf8';
      bgCtx.fillRect(0, -9, 4, 3);
    }

    bgCtx.restore();
  });

  // 6. Animated Neon Signs (ป้ายไฟนีออนกะพริบ)
  // Caution Neon Sign on the Rooftop Ledge
  const cautionX = w * 0.26;
  const cautionY = h * 0.66;
  const cautionPulse = 0.7 + 0.3 * Math.sin(time * 6);
  bgCtx.save();
  bgCtx.strokeStyle = `rgba(251, 191, 36, ${cautionPulse})`;
  bgCtx.lineWidth = 2;
  bgCtx.shadowColor = '#fbbf24';
  bgCtx.shadowBlur = 10;
  bgCtx.strokeRect(cautionX - 16, cautionY - 24, 32, 40);

  // Micro flicker on caution sign
  if (Math.random() > 0.04) {
    bgCtx.fillStyle = `rgba(254, 240, 138, ${cautionPulse})`;
    bgCtx.beginPath();
    bgCtx.moveTo(cautionX, cautionY - 14);
    bgCtx.lineTo(cautionX - 8, cautionY);
    bgCtx.lineTo(cautionX + 8, cautionY);
    bgCtx.closePath();
    bgCtx.fill();
  }
  bgCtx.restore();

  // 7. Animated Barrels with Fire (ไฟลุกโชนในถังน้ำมัน ขยับลุกเป็นเปลว)
  const barrelPositions = [
    { x: w * 0.94, y: h * 0.81, size: 1.2 }, // Right foreground barrel
    { x: w * 0.70, y: h * 0.64, size: 0.9 }  // Mid-right barrel
  ];

  barrelPositions.forEach(b => {
    // Warm firelight glow on concrete floor
    const firePulse = 0.8 + 0.2 * Math.sin(time * 12 + b.x);
    const fireGlow = bgCtx.createRadialGradient(b.x, b.y, 4, b.x, b.y, 45 * b.size);
    fireGlow.addColorStop(0, `rgba(249, 115, 22, ${0.4 * firePulse})`);
    fireGlow.addColorStop(0.6, `rgba(239, 68, 68, ${0.15 * firePulse})`);
    fireGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    bgCtx.fillStyle = fireGlow;
    bgCtx.beginPath();
    bgCtx.arc(b.x, b.y, 45 * b.size, 0, Math.PI * 2);
    bgCtx.fill();

    // Dancing flame tongues (Yellow, Orange, Red)
    for (let f = 0; f < 5; f++) {
      const flOffset = (f - 2) * (3 * b.size);
      const flHeight = (12 + Math.sin(time * 15 + f * 2.5) * 6 + Math.random() * 4) * b.size;

      // Outer Red Flame
      bgCtx.fillStyle = '#ef4444';
      bgCtx.fillRect(b.x + flOffset - 2, b.y - flHeight, 4, flHeight);

      // Mid Orange Flame
      bgCtx.fillStyle = '#f97316';
      bgCtx.fillRect(b.x + flOffset - 1.5, b.y - flHeight * 0.8, 3, flHeight * 0.8);

      // Inner Yellow Core
      bgCtx.fillStyle = '#fef08a';
      bgCtx.fillRect(b.x + flOffset - 1, b.y - flHeight * 0.5, 2, flHeight * 0.5);
    }

    // Spawn rising sparks/embers
    if (Math.random() > 0.4) {
      fireParticles.push({
        x: b.x + (Math.random() - 0.5) * (10 * b.size),
        y: b.y - 12 * b.size,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 1.8 - 0.8,
        size: Math.floor(Math.random() * 2 + 1),
        life: 0.8,
        color: Math.random() > 0.3 ? '#fde047' : '#f97316'
      });
    }
  });

  // Update & Draw Fire Sparks
  for (let i = fireParticles.length - 1; i >= 0; i--) {
    const p = fireParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.03;

    bgCtx.fillStyle = p.color;
    bgCtx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);

    if (p.life <= 0) fireParticles.splice(i, 1);
  }

  // 8. Animated Steam & Smoke Venting from Pipes (ควันลอยพวยพุ่ง)
  const ventPositions = [
    { x: w * 0.14, y: h * 0.86 }, // Sewer pipe on left
    { x: w * 0.08, y: h * 0.68 }  // Pipe vent on wall
  ];

  ventPositions.forEach(v => {
    if (Math.random() > 0.6) {
      steamParticles.push({
        x: v.x + (Math.random() - 0.5) * 4,
        y: v.y,
        vx: Math.random() * 0.5 + 0.2, // Drift rightward with city breeze
        vy: -Math.random() * 1.2 - 0.6,
        size: 3,
        alpha: 0.5,
        life: 1
      });
    }
  });

  for (let i = steamParticles.length - 1; i >= 0; i--) {
    const s = steamParticles[i];
    s.x += s.vx;
    s.y += s.vy;
    s.size += 0.18; // Expand puff
    s.life -= 0.02;
    s.alpha = Math.max(0, s.life * 0.45);

    bgCtx.fillStyle = `rgba(224, 242, 254, ${s.alpha})`;
    bgCtx.fillRect(Math.floor(s.x), Math.floor(s.y), Math.floor(s.size), Math.floor(s.size));

    if (s.life <= 0) steamParticles.splice(i, 1);
  }

  // 9. Spectator Crowd Cheering & Bobbing (กองเชียร์ดาดฟ้าโยกตัวเชียร์)
  const crowdBob = Math.sin(time * 6) * 1.5;
  // Left crowd glow visors
  bgCtx.fillStyle = '#38bdf8';
  bgCtx.fillRect(w * 0.08, h * 0.66 + crowdBob, 3, 1.5);
  bgCtx.fillRect(w * 0.12, h * 0.65 - crowdBob, 3, 1.5);
  bgCtx.fillRect(w * 0.16, h * 0.67 + crowdBob, 3, 1.5);

  // Right crowd glow visors
  bgCtx.fillStyle = '#4ade80';
  bgCtx.fillRect(w * 0.84, h * 0.65 - crowdBob, 3, 1.5);
  bgCtx.fillRect(w * 0.89, h * 0.66 + crowdBob, 3, 1.5);
  bgCtx.fillRect(w * 0.93, h * 0.64 - crowdBob, 3, 1.5);

  // 10. High-Tech Holographic Arena Floor Boundary
  const ring = getRing();
  bgCtx.save();
  bgCtx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  bgCtx.lineWidth = 1.5;
  bgCtx.setLineDash([6, 6]);
  bgCtx.beginPath();
  bgCtx.ellipse(ring.cx, ring.cy, ring.rx, ring.ry, 0, 0, Math.PI * 2);
  bgCtx.stroke();
  bgCtx.setLineDash([]);

  // Corner holographic laser nodes
  [-1, 1].forEach(sideX => {
    [-1, 1].forEach(sideY => {
      const px = ring.cx + sideX * (ring.rx * 0.85);
      const py = ring.cy + sideY * (ring.ry * 0.85);
      bgCtx.fillStyle = '#38bdf8';
      bgCtx.fillRect(px - 2, py - 2, 4, 4);
    });
  });
  bgCtx.restore();
}

// ========================================================
// GAME COMBAT ANIMATION LOOP (60 FPS)
// ========================================================
function gameLoop() {
  requestAnimationFrame(gameLoop);

  // 1. Draw Living Animated Cyberpunk Scene
  drawCyberpunkBackground();

  // 2. Clear Fighter Canvas
  ctx.clearRect(0, 0, viewW, viewH);

  // 3. Update & Draw Projectiles (Special Plasma Blast)
  for (let i = activeProjectiles.length - 1; i >= 0; i--) {
    const proj = activeProjectiles[i];
    proj.update(clientFighters);
    proj.draw(ctx);
    if (!proj.alive) activeProjectiles.splice(i, 1);
  }

  // 4. Update & Draw Fighters (Sorted by Y for isometric depth)
  clientFighters.sort((a, b) => a.y - b.y);

  clientFighters.forEach(f => {
    f.update(1 / 60, clientFighters);
    f.draw(ctx);
  });

  // 5. Draw Pixel Hit Sparks
  for (let i = hitParticles.length - 1; i >= 0; i--) {
    const p = hitParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.05;

    ctx.fillStyle = p.color;
    ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);

    if (p.life <= 0) hitParticles.splice(i, 1);
  }

  // 6. Draw Retro Floating Damage Numbers
  for (let i = damageFloats.length - 1; i >= 0; i--) {
    const d = damageFloats[i];
    d.y -= 1.1;
    d.life -= 0.03;

    ctx.font = 'bold 12px "Press Start 2P", monospace';
    ctx.fillStyle = d.color;
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 3;
    ctx.fillText(d.text, Math.floor(d.x), Math.floor(d.y));
    ctx.shadowBlur = 0;

    if (d.life <= 0) damageFloats.splice(i, 1);
  }

  // 7. Draw Retro Pixel Knockout Ghosts (👻)
  for (let i = ghosts.length - 1; i >= 0; i--) {
    const g = ghosts[i];
    g.y += g.vy;
    g.life -= 0.02;
    g.alpha = Math.max(0, g.life);

    ctx.save();
    ctx.globalAlpha = g.alpha;
    ctx.translate(g.x, g.y);

    ctx.fillStyle = '#facc15';
    ctx.fillRect(-8, -20, 16, 3);

    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('👻', 0, 0);

    ctx.restore();

    if (g.life <= 0) ghosts.splice(i, 1);
  }
}
requestAnimationFrame(gameLoop);

// ========================================================
// SOCKET.IO EVENT HANDLERS
// ========================================================
socket.on('state_update', (state) => {
  const mins = Math.floor(state.timeLeft / 60);
  const secs = state.timeLeft % 60;
  arenaTimerVal.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  const fightersList = Object.values(state.fighters || {});
  const aliveCount = fightersList.filter(f => f.alive).length;
  roundInfoText.innerText = `รอบที่ ${state.roundNumber} • เหลือ ${aliveCount}/${fightersList.length} คน`;

  syncFighters(state.fighters || {});
  renderLeaderboard(state.leaderboard || []);
  renderSidebar(state);

  if (state.status === 'ROUND_END' && state.lastWinner) {
    victoryOverlay.classList.remove('hidden');
    nextRoundSec.innerText = state.nextRoundCountdown || 5;
    winnerNameText.innerText = state.lastWinner.nickname;
    winnerDescText.innerText = `ชนะรอบที่ ${state.lastWinner.round} • น็อคไป ${state.lastWinner.kills} คน!`;
    winnerAvatarImg.src = '/assets/fighter/idle_0.png';
  } else {
    victoryOverlay.classList.add('hidden');
  }
});

function syncFighters(serverFighters) {
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
      local.palette = sf.palette !== undefined ? sf.palette % 6 : local.palette;
      local.isBoss = sf.weapon === 'giant_glove';
    }
  });

  clientFighters = clientFighters.filter(f => serverFighters[f.id]);
}

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

socket.on('round_winner', () => sfx.playVictory());
socket.on('new_round_started', () => sfx.playBell());

socket.on('fighter_shockwave', (payload) => {
  const fighter = clientFighters.find(f => f.id === payload.id);
  if (fighter) {
    fighter.state = 'special';
    fighter.frameIndex = 0;
    fighter.animTicks = 0;
  }
  sfx.playSpecial();
});

socket.on('fighter_ultimate', (payload) => {
  const ring = getRing();
  sfx.playSpecial();

  [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(ang => {
    activeProjectiles.push(new SpecialProjectile(
      ring.cx, ring.cy, Math.cos(ang) * 9, Math.sin(ang) * 9, payload.id, 0
    ));
  });

  spawnPixelHitSparks(ring.cx, ring.cy, true);
});

socket.on('fighter_shield', (payload) => {
  const fighter = clientFighters.find(f => f.id === payload.id);
  if (fighter) {
    fighter.hasShield = true;
    fighter.state = 'block';
    fighter.animTicks = 0;
    sfx.playBlock();
  }
});

socket.on('chat_bubble', (data) => {
  const fighter = clientFighters.find(f => f.id === data.username);
  if (!fighter) return;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerText = `${data.nickname}: ${data.comment}`;
  bubble.style.left = `${fighter.x}px`;
  bubble.style.top = `${fighter.y - 45}px`;
  chatBubbleLayer.appendChild(bubble);
  setTimeout(() => bubble.remove(), 3000);
});

function renderLeaderboard(board) {
  if (!board || board.length === 0) {
    champList.innerHTML = '<div class="text-[9px] text-slate-500 text-center py-1">รอแชมเปียน...</div>';
    return;
  }
  champList.innerHTML = board.slice(0, 3).map((item, idx) => `
    <div class="champ-row">
      <div class="flex items-center gap-1 min-w-0">
        <span class="champ-rank">${idx + 1}.</span>
        <span class="champ-name font-bold">${escapeHtml(item.nickname)}</span>
      </div>
      <span class="champ-score">${item.wins || 0}🏆 ${item.kills || 0}🥊</span>
    </div>
  `).join('');
}

function renderSidebar(state) {
  if (state.tiktok.isConnected) {
    sideConnStatus.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800";
    sideConnStatus.innerText = "เชื่อมต่อสด";
    tiktokPill.className = "px-2 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold flex items-center gap-1.5 inline-flex";
    tiktokPillText.innerText = `@${state.tiktok.username}`;
    sideConnectBtn.classList.add('hidden');
    sideDisconnectBtn.classList.remove('hidden');
  } else {
    sideConnStatus.className = "text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800";
    sideConnStatus.innerText = "ออฟไลน์";
    tiktokPill.className = "px-2 py-0.2 rounded bg-rose-950 border border-rose-800 text-rose-300 font-semibold flex items-center gap-1.5 inline-flex";
    tiktokPillText.innerText = "ออฟไลน์";
    sideConnectBtn.classList.remove('hidden');
    sideDisconnectBtn.classList.add('hidden');
  }

  sideViewerCount.innerText = Number(state.tiktok.viewerCount || 0).toLocaleString();
  sideLikeCount.innerText = Number(state.tiktok.likeCount || 0).toLocaleString();

  const fighters = Object.values(state.fighters || {});
  sideFighterCount.innerText = fighters.length;

  if (fighters.length === 0) {
    sideFighterTable.innerHTML = `<tr><td class="text-slate-500 italic text-center py-4">ยังไม่มีนักสู้ลงเวที... กด "เติมบอท 5 ตัว" ได้เลย!</td></tr>`;
    return;
  }

  sideFighterTable.innerHTML = fighters.map(f => {
    const hpRatio = Math.max(0, f.hp / (f.maxHp || 100));
    const hpColor = hpRatio > 0.5 ? 'bg-emerald-500' : (hpRatio > 0.25 ? 'bg-amber-500' : 'bg-rose-500');
    const palIdx = f.palette !== undefined ? f.palette % 6 : 0;
    const palPath = palIdx === 0 ? '/assets/fighter/idle_0.png' : `/assets/fighter/pal_${palIdx}/idle_0.png`;

    return `
      <tr class="hover:bg-slate-950/70 transition">
        <td class="py-1 px-1 flex items-center gap-1.5">
          <img src="${palPath}" class="w-5 h-6 object-contain image-rendering-pixelated">
          <div class="min-w-0">
            <span class="font-bold text-slate-200 block truncate max-w-[85px] text-[10px] leading-tight">${escapeHtml(f.nickname)}</span>
            <div class="w-16 h-1.5 bg-slate-800 rounded-sm mt-0.5 overflow-hidden">
              <div class="h-full ${hpColor}" style="width: ${hpRatio * 100}%"></div>
            </div>
          </div>
        </td>
        <td class="py-1 px-1 ${f.alive ? 'text-emerald-400 font-bold' : 'text-slate-500 line-through'} font-mono text-[10px]">
          ${f.alive ? `HP ${Math.floor(f.hp)}` : '💀 น็อค'}
        </td>
        <td class="py-1 px-1 text-amber-300 font-bold text-right pr-2 text-[10px]">⚔️ ${f.kills || 0}</td>
      </tr>
    `;
  }).join('');
}

socket.on('new_event', (event) => {
  if (sideEventLog.querySelector('.italic')) sideEventLog.innerHTML = '';
  const div = document.createElement('div');
  div.className = "flex items-start gap-1.5 p-1 bg-slate-950/80 rounded border border-slate-800/60";
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

sideConnectBtn.addEventListener('click', () => {
  const user = sideUsernameInput.value.trim();
  if (user) socket.emit('tiktok_connect', user);
});
sideDisconnectBtn.addEventListener('click', () => socket.emit('tiktok_disconnect'));

toggleAdminBtn.addEventListener('click', () => {
  adminSidebar.classList.toggle('hidden');
  const isHidden = adminSidebar.classList.contains('hidden');
  toggleAdminText.innerText = isHidden ? 'เปิดเมนูแอดมิน' : 'ซ่อนเมนูแอดมิน';
  resizeCanvases();
});

// ========================================================
// OVERLAY & OBS STREAM POP-OUT HANDLERS
// ========================================================
function openPopoutOverlay() {
  const url = `${window.location.origin}/overlay`;
  const popW = 540;
  const popH = 960;
  const left = Math.max(0, Math.floor((window.screen.width - popW) / 2));
  const top = Math.max(0, Math.floor((window.screen.height - popH) / 2));
  window.open(
    url, 
    'TikTokLiveOverlay', 
    `width=${popW},height=${popH},top=${top},left=${left},resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no,location=no`
  );
}

if (popoutOverlayBtn) popoutOverlayBtn.addEventListener('click', openPopoutOverlay);
if (sidePopoutBtn) sidePopoutBtn.addEventListener('click', openPopoutOverlay);

function copyOverlayUrl(btnElement) {
  const url = `${window.location.origin}/overlay`;
  navigator.clipboard.writeText(url).then(() => {
    const origHtml = btnElement.innerHTML;
    btnElement.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i> <span>คัดลอกสำเร็จ!</span>`;
    setTimeout(() => { btnElement.innerHTML = origHtml; }, 2500);
  });
}

if (copyObsBtn) copyObsBtn.addEventListener('click', () => copyOverlayUrl(copyObsBtn));
if (sideCopyUrlBtn) sideCopyUrlBtn.addEventListener('click', () => copyOverlayUrl(sideCopyUrlBtn));

// Check if loaded in Overlay / OBS Mode (Direct /overlay or ?mode=obs or ?mode=overlay)
const isOverlayRoute = window.location.pathname === '/overlay' || 
                       window.location.pathname.startsWith('/overlay') || 
                       new URLSearchParams(window.location.search).get('mode') === 'obs' ||
                       new URLSearchParams(window.location.search).get('mode') === 'overlay';

if (isOverlayRoute) {
  document.body.classList.add('obs-mode');
  document.body.classList.add('overlay-mode');
  resizeCanvases();
}

// Simulator Handlers
window.simJoin = function() { socket.emit('sim_join'); };
window.simSpawnBots = function() { socket.emit('sim_spawn_bots'); };
window.simLike = function() { socket.emit('sim_like', { count: 30 }); };
window.simFollow = function() { socket.emit('sim_follow'); };
window.simShare = function() { socket.emit('sim_share'); };
window.simRose = function() { socket.emit('sim_gift', { giftName: 'Rose', diamonds: 1 }); };
window.simWeapon = function() { socket.emit('sim_gift', { giftName: 'Sword', diamonds: 15 }); };
window.simShield = function() { socket.emit('sim_gift', { giftName: 'Shield', diamonds: 50 }); };
window.simSpecial = function() { socket.emit('sim_gift', { giftName: 'SpecialBeam', diamonds: 150 }); };
window.simUltimate = function() { socket.emit('sim_gift', { giftName: 'UltimateBlast', diamonds: 500 }); };
window.simReset = function() { socket.emit('sim_reset_round'); };
window.simForceWin = function() { socket.emit('sim_force_win'); };

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
