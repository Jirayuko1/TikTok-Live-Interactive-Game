// ========================================================
// ARENA LIVE: FIGHTER BLAZE (16-BIT RETRO PIXEL EDITION)
// สังเวียนประลองมวยวัด TikTok Live สไตล์ Retro Arcade 16-Bit
// ========================================================

const socket = io();

// DOM Elements
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
const arenaCanvas = document.getElementById('arenaCanvas');
const ctx = arenaCanvas.getContext('2d');

// Enable pixelated rendering on all contexts
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

// ========================================================
// RETRO 16-BIT / 8-BIT AUDIO SYNTHESIZER (Web Audio API)
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

  // 8-Bit Boxing Bell (Ring Ring!)
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

  // Retro Punch / Kick Impact (Noise + Square drop)
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

  // Special Laser Projectile Blast (Cybernetic Arm Beam)
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

  // Energy Block / Shield Deflect (High ping)
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

  // Retro Arcade Victory Jingle (8-bit Arpeggio)
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

// Ring Geometry (Elliptical 16-Bit Battle Stage in Perspective)
function getRing() {
  const cx = viewW / 2;
  const cy = viewH * 0.58;
  const rx = viewW * 0.44;
  const ry = viewH * 0.22;
  return { cx, cy, rx, ry };
}

// ========================================================
// FIGHTER BLAZE SPRITE SYSTEM (Loading all 6 Palettes)
// ========================================================
const SPRITE_NAMES = {
  idle: ['idle_0', 'idle_1', 'idle_2', 'idle_3', 'idle_4'],
  attack: ['attack_0', 'attack_1', 'attack_2', 'attack_3', 'attack_4', 'attack_5'],
  special: ['special_0', 'special_1', 'special_2', 'special_3'],
  run: ['run_0', 'run_1', 'run_2', 'run_3'],
  block: ['block_0', 'block_1', 'block_2'],
  hurt: ['hurt_0'],
  projectile: ['projectile_0']
};

// Cache for all loaded sprite images
const SPRITE_CACHE = {};

function loadSpriteImage(url) {
  const img = new Image();
  img.src = url;
  return img;
}

// Pre-load all 6 palettes
for (let pal = 0; pal < 6; pal++) {
  SPRITE_CACHE[pal] = {};
  const basePath = pal === 0 ? '/assets/fighter' : `/assets/fighter/pal_${pal}`;

  for (const [cat, names] of Object.entries(SPRITE_NAMES)) {
    SPRITE_CACHE[pal][cat] = names.map(name => loadSpriteImage(`${basePath}/${name}.png`));
  }
}

// Projectile image
const projectileImg = loadSpriteImage('/assets/fighter/projectile_0.png');

// Avatar Image Cache
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

// ========================================================
// PARTICLES, PROJECTILES & COMBAT VISUALS
// ========================================================
let hitParticles = [];
let damageFloats = [];
let ghosts = [];
let activeProjectiles = [];

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

// Special Projectile Class (แถวที่ 3 Special Energy Ball)
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

    // Trail particle
    hitParticles.push({
      x: this.x + (Math.random() - 0.5) * 8,
      y: this.y + (Math.random() - 0.5) * 8,
      vx: -this.vx * 0.15,
      vy: -this.vy * 0.15,
      size: Math.floor(Math.random() * 3 + 2),
      life: 0.6,
      color: '#38bdf8'
    });

    // Check collision with enemy fighters
    allFighters.forEach(other => {
      if (other.id !== this.ownerId && other.alive && this.alive) {
        const d = Math.hypot(other.x - this.x, other.y - this.y);
        if (d < this.radius + 16) {
          this.alive = false;

          // Damage & Knockback
          other.hp -= 35;
          other.state = 'hurt';
          other.stateTimer = 18;

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

    // Glowing Cyan Core
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
// CLIENT FIGHTER (FIGHTER: BLAZE SPRITE ANIMATIONS)
// ========================================================
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
    this.palette = data.palette !== undefined ? data.palette % 6 : 0;
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

    // Sprite State Machine
    // 'idle', 'run', 'attack', 'special', 'block', 'hurt'
    this.state = 'idle';
    this.frameIndex = 0;
    this.animTicks = 0;
    this.facingLeft = false;
    this.attackCooldown = Math.floor(Math.random() * 20);
    this.attackType = 0; // 0: punch combo, 1: flying kick, 2: sweep kick, 3: dash punch
    this.tumbleAngle = 0;
  }

  update(dt, allFighters) {
    if (!this.alive) return;

    const ring = getRing();

    // 1. Friction & Velocity
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.86;
    this.vy *= 0.86;

    // Facing direction
    if (Math.abs(this.vx) > 0.2) {
      this.facingLeft = this.vx < 0;
    }

    // 2. Check Ring-Out (Elliptical Boundary)
    const dx = (this.x - ring.cx) / ring.rx;
    const dy = (this.y - ring.cy) / ring.ry;
    const distRatio = Math.sqrt(dx * dx + dy * dy);

    if (distRatio > 1.05 || this.hp <= 0) {
      this.alive = false;
      spawnPixelGhost(this.x, this.y, this.palette);
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

      // 4. Attack when in range
      const attackRange = 36;
      if (closestDist < attackRange && this.attackCooldown <= 0) {
        this.attackCooldown = 24 + Math.floor(Math.random() * 15);
        this.state = 'attack';
        this.frameIndex = 0;
        this.animTicks = 0;
        this.attackType = Math.floor(Math.random() * 4); // Variety of punch/kicks from Row 2

        // Deal damage on attack frame
        const damage = this.isBoss ? 45 : (this.weapon === 'sword' ? 28 : 18);
        closest.hp -= damage;
        closest.state = 'hurt';
        closest.animTicks = 0;

        spawnPixelHitSparks(closest.x, closest.y);
        spawnPixelDamage(closest.x, closest.y, damage);
        sfx.playPunch();

        // Push opponent
        const knockForce = this.isBoss ? 14 : 7;
        closest.vx += Math.cos(angle) * knockForce;
        closest.vy += Math.sin(angle) * knockForce;

        if (closest.hp <= 0 && closest.alive) {
          this.kills += 1;
        }
      }
    }

    if (this.attackCooldown > 0) this.attackCooldown--;

    // 5. Update Sprite Animation Frames
    this.updateAnimation();
  }

  // Handle frame progression for each animation state
  updateAnimation() {
    this.animTicks++;

    if (this.state === 'idle') {
      // Row 1 (IDLE): 5 frames, gentle breathing & cyber arm pulse
      if (this.animTicks >= 7) {
        this.animTicks = 0;
        this.frameIndex = (this.frameIndex + 1) % 5;
      }
    } 
    else if (this.state === 'run') {
      // Row 4 (MOVEMENT): 4 frames, running with pixel dust
      if (this.animTicks >= 5) {
        this.animTicks = 0;
        this.frameIndex = (this.frameIndex + 1) % 4;

        // Running dust particles
        if (Math.random() > 0.4) {
          hitParticles.push({
            x: this.x + (this.facingLeft ? 8 : -8),
            y: this.y + 12,
            vx: (this.facingLeft ? 1 : -1) * (Math.random() * 1.5 + 0.5),
            vy: -Math.random() * 0.8,
            size: 2,
            life: 0.4,
            color: '#cbd5e1'
          });
        }
      }
    } 
    else if (this.state === 'attack') {
      // Row 2 (PUNCH & KICK): 6 frames
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
      // Row 3 (SPECIAL): 4 frames
      if (this.animTicks >= 6) {
        this.animTicks = 0;
        this.frameIndex++;

        // Fire projectile on frame 2
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
      // Row 5 (HIT & BLOCK): 3 block frames
      if (this.animTicks >= 6) {
        this.animTicks = 0;
        this.frameIndex = (this.frameIndex + 1) % 3;
      }
    } 
    else if (this.state === 'hurt') {
      // Row 5 Hurt: hold for 14 ticks then return
      if (this.animTicks >= 14) {
        this.animTicks = 0;
        this.state = 'idle';
        this.frameIndex = 0;
      }
    }
  }

  // Render the 16-Bit Pixel Sprite
  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    const scale = this.isBoss ? 1.4 : 0.72;
    ctx.scale(scale, scale);

    // 1. Pixel Art Drop Shadow on Arena Floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(-18, 12, 36, 6);
    ctx.fillRect(-12, 10, 24, 10);

    // 2. Flip horizontally based on facing direction
    if (this.facingLeft) {
      ctx.scale(-1, 1);
    }

    // 3. Get Active Sprite Frame
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

    // 4. Draw Sprite Anchored to Ground
    if (spriteImg && spriteImg.complete) {
      const sw = spriteImg.naturalWidth || 70;
      const sh = spriteImg.naturalHeight || 95;
      // Anchor bottom-center at (0, 16)
      ctx.drawImage(spriteImg, -sw / 2, 16 - sh);
    } else {
      // Fallback pixel rect if image loading
      ctx.fillStyle = this.color;
      ctx.fillRect(-12, -40, 24, 52);
    }

    // Restore orientation for overhead HUD elements
    if (this.facingLeft) {
      ctx.scale(-1, 1);
    }

    // 5. Crown for Top Killer (👑 16-Bit Pixel Crown)
    if (this.kills >= 2) {
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👑', 0, -82);
    }

    // 6. Retro 16-Bit Arcade HP Bar
    const hpW = 42;
    const hpH = 5;
    const hpY = -68;
    const hpRatio = Math.max(0, this.hp / this.maxHp);

    // Black outer border
    ctx.fillStyle = '#000000';
    ctx.fillRect(-hpW / 2 - 2, hpY - 2, hpW + 4, hpH + 4);

    // Red background
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(-hpW / 2, hpY, hpW, hpH);

    // Green/Amber/Red Health Fill (Chunky pixel blocks)
    ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : (hpRatio > 0.25 ? '#eab308' : '#ef4444');
    ctx.fillRect(-hpW / 2, hpY, Math.floor(hpW * hpRatio), hpH);

    // 7. Player Nickname Badge (Retro Pixel Font)
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
// RETRO PIXEL ART TEMPLE FAIR BACKGROUND (16-BIT RETRO)
// ========================================================
// Offscreen Low-Res Canvas for authentic chunky pixel rasterization
const offBgCanvas = document.createElement('canvas');
const offBgCtx = offBgCanvas.getContext('2d');
offBgCtx.imageSmoothingEnabled = false;

// Pre-computed stars
const PIXEL_STARS = [];
for (let i = 0; i < 40; i++) {
  PIXEL_STARS.push({
    x: Math.random(),
    y: Math.random() * 0.42,
    blinkSpeed: Math.random() * 0.08 + 0.02
  });
}

function drawPixelTempleFairBackground() {
  const pw = 160; // 16-bit retro internal resolution
  const ph = 284;
  offBgCanvas.width = pw;
  offBgCanvas.height = ph;

  offBgCtx.clearRect(0, 0, pw, ph);

  // 1. Dithered 16-Bit Night Sky
  const skyColors = ['#04060f', '#090e24', '#121838', '#1c1b3f', '#2a1a3a'];
  skyColors.forEach((color, idx) => {
    offBgCtx.fillStyle = color;
    offBgCtx.fillRect(0, idx * (ph * 0.12), pw, ph * 0.13);
  });

  // 2. Pixel Stars
  const timeSec = Date.now() * 0.001;
  PIXEL_STARS.forEach((s, idx) => {
    if (Math.sin(timeSec * 8 * s.blinkSpeed + idx) > -0.2) {
      offBgCtx.fillStyle = idx % 2 === 0 ? '#fef08a' : '#ffffff';
      offBgCtx.fillRect(Math.floor(s.x * pw), Math.floor(s.y * ph), 1, 1);
    }
  });

  // 3. Pixel Full Moon (พระจันทร์พิกเซล)
  const mx = Math.floor(pw * 0.82);
  const my = Math.floor(ph * 0.12);
  const mr = 9;

  offBgCtx.fillStyle = '#fef08a';
  for (let y = -mr; y <= mr; y++) {
    for (let x = -mr; x <= mr; x++) {
      if (x * x + y * y <= mr * mr) {
        offBgCtx.fillRect(mx + x, my + y, 1, 1);
      }
    }
  }
  // Moon craters
  offBgCtx.fillStyle = '#facc15';
  offBgCtx.fillRect(mx - 3, my - 2, 2, 2);
  offBgCtx.fillRect(mx + 2, my + 1, 2, 2);

  // 4. Stepped Searchlight Beams in Night Sky
  spotlightAngle += 0.012;
  const spotSources = [pw * 0.22, pw * 0.5, pw * 0.78];
  spotSources.forEach((sx, idx) => {
    const beamAngle = Math.sin(spotlightAngle + idx * 1.6) * 0.35 - (Math.PI / 2);
    offBgCtx.strokeStyle = idx % 2 === 0 ? 'rgba(56, 189, 248, 0.18)' : 'rgba(251, 191, 36, 0.18)';
    offBgCtx.lineWidth = 3;
    offBgCtx.beginPath();
    offBgCtx.moveTo(sx, ph * 0.5);
    offBgCtx.lineTo(sx + Math.cos(beamAngle) * 90, ph * 0.5 + Math.sin(beamAngle) * 90);
    offBgCtx.stroke();
  });

  // 5. Pixel Golden Thai Pagoda (เจดีย์ทองพิกเซล)
  const pagX = Math.floor(pw * 0.5);
  const pagY = Math.floor(ph * 0.38);

  // Pagoda Spire (ยอดฉัตร)
  offBgCtx.fillStyle = '#fef08a';
  offBgCtx.fillRect(pagX - 1, pagY - 32, 2, 10);
  offBgCtx.fillRect(pagX - 2, pagY - 22, 4, 3);
  offBgCtx.fillRect(pagX - 3, pagY - 19, 6, 3);

  // Pagoda Bell Shape (ระฆังทอง)
  offBgCtx.fillStyle = '#d97706';
  for (let row = 0; row < 12; row++) {
    const rw = 4 + row * 1.5;
    offBgCtx.fillRect(pagX - Math.floor(rw), pagY - 16 + row, Math.floor(rw * 2), 1);
  }
  // Golden highlights
  offBgCtx.fillStyle = '#f59e0b';
  offBgCtx.fillRect(pagX - 4, pagY - 14, 3, 8);

  // Tiered Base
  offBgCtx.fillStyle = '#b45309';
  offBgCtx.fillRect(pagX - 12, pagY - 4, 24, 3);
  offBgCtx.fillRect(pagX - 14, pagY - 1, 28, 4);

  // 6. Pixel Ferris Wheel (ชิงช้าสวรรค์พิกเซล)
  ferrisAngle += 0.008;
  const fwx = Math.floor(pw * 0.18);
  const fwy = Math.floor(ph * 0.32);
  const fwr = 18;

  // Support Legs
  offBgCtx.strokeStyle = '#b45309';
  offBgCtx.lineWidth = 1;
  offBgCtx.beginPath();
  offBgCtx.moveTo(fwx, fwy);
  offBgCtx.lineTo(fwx - 8, fwy + 22);
  offBgCtx.moveTo(fwx, fwy);
  offBgCtx.lineTo(fwx + 8, fwy + 22);
  offBgCtx.stroke();

  // Outer Wheel Ring
  offBgCtx.strokeStyle = '#f59e0b';
  offBgCtx.beginPath();
  offBgCtx.arc(fwx, fwy, fwr, 0, Math.PI * 2);
  offBgCtx.stroke();

  // Spokes & Pixel Gondolas
  const gondolaColors = ['#f43f5e', '#38bdf8', '#facc15', '#a855f7', '#4ade80'];
  for (let a = 0; a < 6; a++) {
    const ang = ferrisAngle + (a * Math.PI / 3);
    const gx = Math.floor(fwx + Math.cos(ang) * fwr);
    const gy = Math.floor(fwy + Math.sin(ang) * fwr);

    offBgCtx.fillStyle = gondolaColors[a % gondolaColors.length];
    offBgCtx.fillRect(gx - 2, gy - 2, 4, 4);
  }
  offBgCtx.fillStyle = '#facc15';
  offBgCtx.fillRect(fwx - 1, fwy - 1, 3, 3);

  // 7. Striped Pixel Carnival Tents (ซุ้มผ้าใบงานวัด)
  // Left tent
  offBgCtx.fillStyle = '#e11d48';
  offBgCtx.fillRect(2, ph * 0.40, 20, 8);
  offBgCtx.fillStyle = '#ffffff';
  for (let s = 0; s < 4; s++) offBgCtx.fillRect(2 + s * 5, ph * 0.40, 2, 8);

  // Right tent
  offBgCtx.fillStyle = '#0284c7';
  offBgCtx.fillRect(pw - 24, ph * 0.40, 22, 8);
  offBgCtx.fillStyle = '#facc15';
  for (let s = 0; s < 4; s++) offBgCtx.fillRect(pw - 24 + s * 5, ph * 0.40, 2, 8);

  // Bunting Flags (ธงราวงานวัด)
  const pennantColors = ['#f43f5e', '#facc15', '#38bdf8', '#4ade80'];
  for (let i = 0; i < 12; i++) {
    offBgCtx.fillStyle = pennantColors[i % pennantColors.length];
    const bx = Math.floor(4 + i * (pw / 12));
    const by = Math.floor(ph * 0.36 + Math.sin(i * 0.5) * 2);
    offBgCtx.fillRect(bx, by, 3, 3);
  }

  // 8. PIXEL BATTLE RING PLATFORM (สังเวียนพิกเซล 2.5D)
  const ring = {
    cx: pw / 2,
    cy: ph * 0.58,
    rx: pw * 0.44,
    ry: ph * 0.22
  };

  // Ring Skirting (Depth)
  offBgCtx.fillStyle = '#3f1107';
  for (let y = 0; y <= ring.ry; y++) {
    const xr = Math.floor(Math.sqrt(Math.max(0, 1 - (y * y) / (ring.ry * ring.ry))) * ring.rx);
    offBgCtx.fillRect(ring.cx - xr, Math.floor(ring.cy + y), xr * 2, 8);
  }

  // Ring Mat Floor (Dithered wood/leather)
  offBgCtx.fillStyle = '#78350f';
  for (let y = -ring.ry; y <= ring.ry; y++) {
    const xr = Math.floor(Math.sqrt(Math.max(0, 1 - (y * y) / (ring.ry * ring.ry))) * ring.rx);
    offBgCtx.fillRect(ring.cx - xr, Math.floor(ring.cy + y), xr * 2, 1);
  }

  // Inner Ring Markings
  offBgCtx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
  offBgCtx.lineWidth = 1;
  offBgCtx.beginPath();
  offBgCtx.ellipse(ring.cx, ring.cy, ring.rx * 0.65, ring.ry * 0.65, 0, 0, Math.PI * 2);
  offBgCtx.stroke();

  // Bright Golden Perimeter Ring with Square Pixel LED Bulbs
  offBgCtx.strokeStyle = '#f59e0b';
  offBgCtx.lineWidth = 1.5;
  offBgCtx.beginPath();
  offBgCtx.ellipse(ring.cx, ring.cy, ring.rx, ring.ry, 0, 0, Math.PI * 2);
  offBgCtx.stroke();

  // Perimeter Bulbs (2x2 Pixel LEDs)
  const numBulbs = 24;
  for (let b = 0; b < numBulbs; b++) {
    const bAngle = (b / numBulbs) * Math.PI * 2;
    const bx = Math.floor(ring.cx + Math.cos(bAngle) * ring.rx);
    const by = Math.floor(ring.cy + Math.sin(bAngle) * ring.ry);

    offBgCtx.fillStyle = (b % 2 === 0) ? '#fef08a' : '#f59e0b';
    offBgCtx.fillRect(bx - 1, by - 1, 2, 2);
  }

  // 9. Scale up offscreen low-res canvas to view canvas with pixelated mode
  bgCtx.clearRect(0, 0, viewW, viewH);
  bgCtx.drawImage(offBgCanvas, 0, 0, viewW, viewH);
}

// ========================================================
// GAME COMBAT ANIMATION LOOP (60 FPS)
// ========================================================
function gameLoop() {
  requestAnimationFrame(gameLoop);

  // 1. Draw 16-Bit Pixel Fair Background
  drawPixelTempleFairBackground();

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

    // Pixel Halo
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-8, -20, 16, 3);

    // 8-Bit Ghost Face
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
  // Timer & Round HUD
  const mins = Math.floor(state.timeLeft / 60);
  const secs = state.timeLeft % 60;
  arenaTimerVal.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

  const fightersList = Object.values(state.fighters || {});
  const aliveCount = fightersList.filter(f => f.alive).length;
  roundInfoText.innerText = `รอบที่ ${state.roundNumber} • เหลือ ${aliveCount}/${fightersList.length} คน`;

  // Sync Fighters
  syncFighters(state.fighters || {});

  // Leaderboard & Sidebar
  renderLeaderboard(state.leaderboard || []);
  renderSidebar(state);

  // Victory Overlay
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

// Synchronize Server Fighters to Client
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

// Audio & Combat Event Triggers
socket.on('round_winner', () => sfx.playVictory());
socket.on('new_round_started', () => sfx.playBell());

// Trigger Special Beam Attack
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

  // Fire 4 cross-projectiles across arena
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

// Render Leaderboard
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

// Render Sidebar Stats & Fighters
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

// Live Event Feed
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

if (new URLSearchParams(window.location.search).get('mode') === 'obs') {
  document.body.classList.add('obs-mode');
  resizeCanvases();
}

// ========================================================
// SIMULATOR BUTTON HANDLERS (Arcade Actions)
// ========================================================
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

window.simSpecial = function() {
  socket.emit('sim_gift', { giftName: 'SpecialBeam', diamonds: 150 });
};

window.simUltimate = function() {
  socket.emit('sim_gift', { giftName: 'UltimateBlast', diamonds: 500 });
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
