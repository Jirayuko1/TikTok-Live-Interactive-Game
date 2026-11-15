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

// Rooftop Arena Combat Boundary (Center Safe Zone: Top 11% & Bottom 33% Clear for TikTok Live)
function getRing() {
  const cx = viewW / 2;
  const cy = viewH * 0.49; // Centered vertically in safe zone
  const rx = viewW * 0.39; // Leaves >10% clearance on left & right (>5% required)
  const ry = viewH * 0.14; // Height: bottom edge at 63% (leaves 37% / >650px clear at bottom)
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

function spawnFloatingText(x, y, text, color = '#38bdf8') {
  damageFloats.push({
    x: x + (Math.random() - 0.5) * 10,
    y: y - 30,
    text,
    life: 1.2,
    color
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
          other.lastAttackerId = this.ownerId;
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
    this.lastAttackerId = null;

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

    // Laser Barrier Boundary Physics (Strictly NO falling off the stage)
    // Fighters bounce off the holographic boundary wall with sparks and remain inside the arena.
    const dx = (this.x - ring.cx) / ring.rx;
    const dy = (this.y - ring.cy) / ring.ry;
    const distRatio = Math.sqrt(dx * dx + dy * dy);

    if (distRatio >= 0.98) {
      const angle = Math.atan2(dy, dx);
      // Clamp inside the arena boundary
      const clampRatio = 0.96;
      this.x = ring.cx + Math.cos(angle) * (ring.rx * clampRatio);
      this.y = ring.cy + Math.sin(angle) * (ring.ry * clampRatio);

      // Normal vector of the boundary ellipse
      const normX = Math.cos(angle);
      const normY = Math.sin(angle);
      const dot = this.vx * normX + this.vy * normY;

      // Elastic rebound off the laser forcefield
      if (dot > 0) {
        this.vx -= 1.6 * dot * normX;
        this.vy -= 1.6 * dot * normY;
      } else {
        this.vx += -normX * 1.5;
        this.vy += -normY * 1.5;
      }

      // Barrier sparks impact effect
      spawnPixelHitSparks(this.x, this.y, true);
    }

    // Knockout Check: Fighters ONLY die when HP drops to 0 or below (Strictly NO ring-out deaths)
    if (this.hp <= 0) {
      this.alive = false;
      spawnPixelGhost(this.x, this.y, this.palette);
      socket.emit('fighter_knocked_out', { victimId: this.id, attackerId: this.lastAttackerId });
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
        closest.lastAttackerId = this.id;
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

    // Status Badges & Crown for Kill Leader
    ctx.textAlign = 'center';
    if (this.isBoss) {
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('👹 BOSS', 0, -84);
    } else {
      if (this.kills >= 2) {
        ctx.font = '16px sans-serif';
        ctx.fillText('👑', 0, -84);
      }
      if (this.weapon === 'sword') {
        ctx.font = '12px sans-serif';
        ctx.fillText('⚔️', 18, -72);
      }
      if (this.hasShield) {
        ctx.font = '12px sans-serif';
        ctx.fillText('🛡️', -18, -72);
      }
      if (this.speedBoost > 1.2) {
        ctx.font = '12px sans-serif';
        ctx.fillText('⚡', 0, -72);
      }
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
// CYBER COMBAT ARENA STAGE (เวทีประลองไซเบอร์ลอยฟ้า 2.5D)
// ========================================================
function drawCyberStagePlatform(ctx, ring, time) {
  const { cx, cy, rx, ry } = ring;
  const depth = Math.max(18, Math.round(ry * 0.22)); // 3D platform thickness

  ctx.save();

  // 1. Under-Platform Ground Shadow & Ambient Occlusion (เงาทอดลงเบื้องล่าง)
  const shadowGrad = ctx.createRadialGradient(cx, cy + ry + depth * 0.8, 10, cx, cy + ry + depth * 0.8, rx * 1.15);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
  shadowGrad.addColorStop(0.55, 'rgba(2, 6, 23, 0.45)');
  shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy + ry + depth * 0.8, rx * 1.1, ry * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Heavy Industrial Support Struts & Suspension Links (เสาไฮดรอลิกยึดโครงสร้าง)
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.9)';
  ctx.lineWidth = 3.5;
  // Left angled steel gantry strut
  ctx.beginPath();
  ctx.moveTo(cx - rx * 0.72, cy + ry * 0.6 + depth);
  ctx.lineTo(cx - rx * 1.15, cy + ry * 1.5 + depth * 2);
  ctx.stroke();
  // Right angled steel gantry strut
  ctx.beginPath();
  ctx.moveTo(cx + rx * 0.72, cy + ry * 0.6 + depth);
  ctx.lineTo(cx + rx * 1.15, cy + ry * 1.5 + depth * 2);
  ctx.stroke();
  // Center main hydraulic piston
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(cx, cy + ry * 0.9 + depth);
  ctx.lineTo(cx, cy + ry * 1.6 + depth * 2);
  ctx.stroke();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.stroke(); // Glowing blue core

  // 3. Anti-Gravity Repulsor / Ion Thrusters (ไอพ่นต้านแรงโน้มถ่วงลอยฟ้า)
  const thrusters = [
    { x: cx - rx * 0.55, y: cy + depth + ry * 0.75, scale: 0.85 },
    { x: cx,             y: cy + depth + ry * 0.95, scale: 1.0 },
    { x: cx + rx * 0.55, y: cy + depth + ry * 0.75, scale: 0.85 }
  ];

  thrusters.forEach((th, idx) => {
    // Metal thruster nozzle housing
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.fillRect(th.x - 7 * th.scale, th.y - 2, 14 * th.scale, 7 * th.scale);
    ctx.strokeRect(th.x - 7 * th.scale, th.y - 2, 14 * th.scale, 7 * th.scale);

    // Glowing cyan ion thruster plume
    const flameFlicker = Math.sin(time * 20 + idx * 2.1) * 3;
    const flameH = (24 + flameFlicker) * th.scale;
    const flameGrad = ctx.createLinearGradient(th.x, th.y + 4, th.x, th.y + 4 + flameH);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.2, '#00f0ff');
    flameGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.4)');
    flameGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(th.x - 5 * th.scale, th.y + 4);
    ctx.lineTo(th.x + 5 * th.scale, th.y + 4);
    ctx.lineTo(th.x, th.y + 4 + flameH);
    ctx.closePath();
    ctx.fill();
  });

  // 4. Platform 3D Rim / Side Wall Extrusion (ความหนาฐานเวที 3 มิติ)
  // Draw the curved front rim between cy and cy + depth
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI, false); // top front arc
  ctx.lineTo(cx - rx, cy + depth);
  ctx.ellipse(cx, cy + depth, rx, ry, 0, Math.PI, 0, true); // bottom front arc (counterclockwise back to right)
  ctx.closePath();

  // Dark titanium rim gradient
  const rimGrad = ctx.createLinearGradient(0, cy, 0, cy + ry + depth);
  rimGrad.addColorStop(0, '#1e293b');
  rimGrad.addColorStop(0.35, '#0f172a');
  rimGrad.addColorStop(0.85, '#090d16');
  rimGrad.addColorStop(1, '#030712');
  ctx.fillStyle = rimGrad;
  ctx.fill();

  // 4.1 Cyber Industrial Hazard Stripes on Rim (แถบลายบั้งสีส้ม/ดำ สไตล์ Cyberpunk)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI, false);
  ctx.lineTo(cx - rx, cy + depth);
  ctx.ellipse(cx, cy + depth, rx, ry, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.clip();

  const stripeWidth = 14;
  const numStripes = Math.ceil((rx * 2) / stripeWidth) + 4;
  ctx.lineWidth = 6;
  for (let i = -2; i < numStripes; i++) {
    const sx = cx - rx + i * stripeWidth;
    ctx.strokeStyle = (i % 2 === 0) ? 'rgba(245, 158, 11, 0.45)' : 'rgba(15, 23, 42, 0.65)';
    ctx.beginPath();
    ctx.moveTo(sx, cy);
    ctx.lineTo(sx - 16, cy + ry + depth);
    ctx.stroke();
  }

  // Metallic rim panel vertical division seams
  [-0.7, -0.35, 0, 0.35, 0.7].forEach(ratio => {
    const px = cx + rx * ratio;
    const dy = ry * Math.sqrt(Math.max(0, 1 - ratio * ratio));
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, cy + dy);
    ctx.lineTo(px, cy + depth + dy);
    ctx.stroke();
  });
  ctx.restore();

  // 4.2 Glowing Neon Underglow on Bottom Rim
  ctx.save();
  ctx.strokeStyle = '#00f0ff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 10;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy + depth, rx, ry, 0, 0, Math.PI, false);
  ctx.stroke();
  ctx.restore();

  // 5. Solid Stage Surface Floor (พื้นเวทีสังเวียนประลองด้านบน)
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

  const floorGrad = ctx.createRadialGradient(cx, cy, 15, cx, cy, rx);
  floorGrad.addColorStop(0, '#151f38'); // Center cyan-tinted metal
  floorGrad.addColorStop(0.55, '#0c1222'); // Mid titanium steel
  floorGrad.addColorStop(0.9, '#070b14'); // Outer dark perimeter
  floorGrad.addColorStop(1, '#05070f');
  ctx.fillStyle = floorGrad;
  ctx.fill();

  // Clip floor textures to top ellipse
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();

  // 5.1 Cyber Isometric Floor Grid Lines (ลายตารางกระเบื้องไฮเทค)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;
  const gridSpacingY = 11;
  for (let gy = cy - ry + 4; gy < cy + ry; gy += gridSpacingY) {
    ctx.beginPath();
    ctx.moveTo(cx - rx, gy);
    ctx.lineTo(cx + rx, gy);
    ctx.stroke();
  }

  // Radial combat sector lines (แบ่ง 8 แฉกสังเวียน)
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
    ctx.stroke();
  }

  // 5.2 Concentric Combat Ring Markings (วงแหวนสังเวียนไฟนีออน)
  // Outer dashed warning circle
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.76, ry * 0.76, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Inner duel circle (สังเวียนใจกลาง)
  const innerPulse = 0.5 + 0.25 * Math.sin(time * 3);
  ctx.strokeStyle = `rgba(0, 240, 255, ${innerPulse})`;
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.44, ry * 0.44, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Center Emblem: Glowing Cyber Crosshair & Swords
  ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.18, ry * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy); ctx.lineTo(cx + 10, cy);
  ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6);
  ctx.stroke();

  // Center Typography "⚡ BLAZE ARENA ⚡"
  ctx.font = 'bold 8px "Chakra Petch", sans-serif';
  ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡ BLAZE ARENA ⚡', cx, cy - ry * 0.18);

  ctx.restore(); // end floor clip

  // 6. Perimeter Glowing Neon Edge Rail (ขอบไฟนีออนรอบสังเวียน)
  ctx.save();
  ctx.strokeStyle = '#00f0ff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 12;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 7. Holographic Forcefield Fence & Energy Pylons (เสาม่านพลังงาน 8 เสา)
  const numPylons = 8;
  const pylonHeight = 14;

  // Translucent holographic energy curtain wall
  ctx.save();
  const wallAlpha = 0.12 + 0.06 * Math.sin(time * 4);
  const wallGrad = ctx.createLinearGradient(0, cy - pylonHeight, 0, cy + ry);
  wallGrad.addColorStop(0, `rgba(0, 240, 255, ${wallAlpha})`);
  wallGrad.addColorStop(1, 'rgba(0, 240, 255, 0.02)');
  ctx.fillStyle = wallGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy - pylonHeight * 0.5, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  for (let i = 0; i < numPylons; i++) {
    const ang = i * (Math.PI * 2 / numPylons);
    const px = cx + Math.cos(ang) * rx;
    const py = cy + Math.sin(ang) * ry;

    // Metal Mount Base
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.fillRect(px - 3, py - 3, 6, 6);
    ctx.strokeRect(px - 3, py - 3, 6, 6);

    // Glowing Neon Pylon Rod
    ctx.save();
    ctx.strokeStyle = (i % 2 === 0) ? '#00f0ff' : '#f59e0b';
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - pylonHeight);
    ctx.stroke();

    // Pylon Crystal Emitter Tip
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px - 1.5, py - pylonHeight - 2, 3, 3);
    ctx.restore();
  }

  // Connecting laser beam wire between top of pylons
  ctx.save();
  const beamPulse = 0.5 + 0.3 * Math.sin(time * 5);
  ctx.strokeStyle = `rgba(56, 189, 248, ${beamPulse})`;
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 6;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.ellipse(cx, cy - pylonHeight, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  ctx.restore();
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

  // 6. High-Tech 2.5D Cyber Arena Combat Platform (เวทีประลองไซเบอร์ 3D ลอยฟ้า)
  const ring = getRing();
  drawCyberStagePlatform(bgCtx, ring, time);

  // 7. Animated Neon Signs (ป้ายไฟนีออนกะพริบ)
  // Caution Neon Sign positioned at the ring's left edge
  const cautionX = ring.cx - ring.rx * 0.95;
  const cautionY = ring.cy;
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
    { x: ring.cx + ring.rx * 1.05, y: ring.cy + ring.ry * 0.5, size: 1.0 }, // Right side of combat ring
    { x: ring.cx - ring.rx * 1.05, y: ring.cy + ring.ry * 0.4, size: 0.9 }  // Left side of combat ring
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
    { x: w * 0.14, y: ring.cy + ring.ry * 0.8 }, // Left vent near ring bottom
    { x: w * 0.08, y: ring.cy - ring.ry * 0.3 }  // Pipe vent on left wall
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
  const crowdY = ring.cy - ring.ry * 0.25;
  // Left crowd glow visors
  bgCtx.fillStyle = '#38bdf8';
  bgCtx.fillRect(w * 0.08, crowdY + crowdBob, 3, 1.5);
  bgCtx.fillRect(w * 0.12, crowdY - 4 - crowdBob, 3, 1.5);
  bgCtx.fillRect(w * 0.16, crowdY + 2 + crowdBob, 3, 1.5);

  // Right crowd glow visors
  bgCtx.fillStyle = '#4ade80';
  bgCtx.fillRect(w * 0.84, crowdY - crowdBob, 3, 1.5);
  bgCtx.fillRect(w * 0.89, crowdY + 3 + crowdBob, 3, 1.5);
  bgCtx.fillRect(w * 0.93, crowdY - 2 - crowdBob, 3, 1.5);

  // 10. Bottom TikTok Live Chat Scrim (Gradient to keep live stream chat legible over bottom 33%)
  const chatScrim = bgCtx.createLinearGradient(0, h * 0.67, 0, h);
  chatScrim.addColorStop(0, 'rgba(0, 0, 0, 0)');
  chatScrim.addColorStop(0.3, 'rgba(8, 12, 26, 0.45)');
  chatScrim.addColorStop(1, 'rgba(8, 12, 26, 0.85)');
  bgCtx.fillStyle = chatScrim;
  bgCtx.fillRect(0, h * 0.67, w, h * 0.33);
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
    spawnFloatingText(fighter.x, fighter.y, '💥 SHOCKWAVE!', '#f97316');

    // Push all nearby enemies away radially with damage
    clientFighters.forEach(other => {
      if (other.id !== fighter.id && other.alive) {
        const d = Math.hypot(other.x - fighter.x, other.y - fighter.y);
        if (d < 160) {
          const angle = Math.atan2(other.y - fighter.y, other.x - fighter.x);
          const pushForce = Math.max(8, 20 - (d / 12));
          other.vx += Math.cos(angle) * pushForce;
          other.vy += Math.sin(angle) * pushForce;
          other.hp -= 20;
          other.lastAttackerId = fighter.id;
          other.state = 'hurt';
          other.animTicks = 0;
          spawnPixelHitSparks(other.x, other.y, true);
          spawnPixelDamage(other.x, other.y, 20);
        }
      }
    });
    spawnPixelHitSparks(fighter.x, fighter.y, true);
  }
  sfx.playSpecial();
});

socket.on('fighter_heal', (payload) => {
  const fighter = clientFighters.find(f => f.id === payload.id);
  if (fighter) {
    fighter.hp = payload.hp;
    spawnFloatingText(fighter.x, fighter.y, '+HP ❤️', '#4ade80');
  }
});

socket.on('fighter_buff', (payload) => {
  const fighter = clientFighters.find(f => f.id === payload.id);
  if (fighter) {
    fighter.hp = payload.hp;
    spawnFloatingText(fighter.x, fighter.y, 'BUFF! 🩸', '#fbbf24');
    spawnPixelHitSparks(fighter.x, fighter.y, true);
  }
});

socket.on('fighter_weapon', (payload) => {
  const fighter = clientFighters.find(f => f.id === payload.id);
  if (fighter) {
    fighter.weapon = payload.weapon;
    spawnFloatingText(fighter.x, fighter.y, '⚔️ KATANA!', '#38bdf8');
    sfx.playPunch();
  }
});

socket.on('fighter_boss', (payload) => {
  const fighter = clientFighters.find(f => f.id === payload.id);
  if (fighter) {
    fighter.isBoss = true;
    fighter.weapon = 'giant_glove';
    fighter.maxHp += 300;
    fighter.hp = fighter.maxHp;
    spawnFloatingText(fighter.x, fighter.y, '👹 TITAN BOSS!', '#f43f5e');
    sfx.playSpecial();
    spawnPixelHitSparks(fighter.x, fighter.y, true);
  }
});

socket.on('fighter_speed', (payload) => {
  const fighter = clientFighters.find(f => f.id === payload.id);
  if (fighter) {
    fighter.speedBoost = payload.speed;
    spawnFloatingText(fighter.x, fighter.y, '⚡ SPEED UP!', '#38bdf8');
  }
});

socket.on('like_burst', (payload) => {
  const ring = getRing();
  const count = Math.min(payload.count || 1, 6);
  for (let i = 0; i < count; i++) {
    hitParticles.push({
      x: ring.cx + (Math.random() - 0.5) * ring.rx * 0.9,
      y: ring.cy + (Math.random() - 0.5) * ring.ry * 0.9,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -Math.random() * 2 - 1,
      size: 3,
      life: 0.8,
      color: '#f43f5e'
    });
  }
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
    spawnFloatingText(fighter.x, fighter.y, '🛡️ SHIELD!', '#38bdf8');
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
    champList.innerHTML = '<div class="text-[9.5px] text-amber-200/70 text-center py-2 font-[\'Kanit\'] font-medium">รอแชมเปียนรอบแรก...</div>';
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
    sideConnectBtn.innerText = "เชื่อม";
    sideDisconnectBtn.classList.add('hidden');
  }

  const sideConnError = document.getElementById('sideConnError');
  if (sideConnError) {
    if (state.tiktok.lastError && !state.tiktok.isConnected) {
      sideConnError.innerText = `⚠️ ${state.tiktok.lastError}`;
      sideConnError.classList.remove('hidden');
    } else {
      sideConnError.classList.add('hidden');
    }
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
  if (user) {
    sideConnectBtn.innerText = 'กำลังเชื่อม...';
    socket.emit('tiktok_connect', user);
  }
});
sideUsernameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const user = sideUsernameInput.value.trim();
    if (user) {
      sideConnectBtn.innerText = 'กำลังเชื่อม...';
      socket.emit('tiktok_connect', user);
    }
  }
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
window.simBoss = function() { socket.emit('sim_gift', { giftName: 'TitanBoss', diamonds: 1000 }); };
window.simReset = function() { socket.emit('sim_reset_round'); };
window.simForceWin = function() { socket.emit('sim_force_win'); };

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

// Toggle TikTok Live Safe Zone Overlay Guide (ไกด์จำลอง Safe Zone สำหรับสตรีมเมอร์)
const toggleSafeZoneBtn = document.getElementById('toggleSafeZoneBtn');
const safeZoneGuide = document.getElementById('safeZoneGuide');
if (toggleSafeZoneBtn && safeZoneGuide) {
  toggleSafeZoneBtn.addEventListener('click', () => {
    safeZoneGuide.classList.toggle('hidden');
  });
}
