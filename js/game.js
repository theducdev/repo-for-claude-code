import { getCurrentTheme } from './themes.js';
import { resetParticles, spawnParticles, updateParticles, drawParticles } from './particles.js';
import { saveScore } from './scores.js';
import { playEat, playGameOver } from './sounds.js';

const CELL = 20;

const DIRS = {
  ArrowUp:    [0, -1], w: [0, -1],
  ArrowDown:  [0,  1], s: [0,  1],
  ArrowLeft:  [-1, 0], a: [-1,  0],
  ArrowRight: [1,  0], d: [1,   0],
};

let canvas, ctx, scoreEl, bestEl, overlay, overlayTitle, overlaySub, btn;
let COLS, ROWS;
let snake, dir, nextDir, food, score, best, loopId, speed, paused, running;
let touchStartX = 0, touchStartY = 0;

// Bonus food state
let bonusFood = null, bonusFoodExpiry = 0, foodEaten = 0;

// Combo state
let comboCount = 0, comboExpiry = 0, comboFadeAt = 0;

// Warp walls toggle
let warpMode = false;

// New best flash
let newBestExpiry = 0;
const NEW_BEST_DURATION = 2500;

// Shield power-up
let shieldFood = null, shieldFoodExpiry = 0;
let shieldActive = false, shieldExpiry = 0;

// Poison food
let poisonFood = null, poisonFoodExpiry = 0;

// Score milestones
const MILESTONES = [50, 100, 200, 300, 500];
let milestonesHit = new Set();
let milestoneFlashAt = 0, milestoneFlashScore = 0;
const MILESTONE_DURATION = 2200;

function getInitialSpeed() {
  const active = document.querySelector('.diff-btn.active');
  return active ? parseInt(active.dataset.speed, 10) : 120;
}

function randFood(sn) {
  let pos;
  do {
    pos = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)];
  } while (sn.some(s => s[0] === pos[0] && s[1] === pos[1]));
  return pos;
}

// ── Screen shake ─────────────────────────────────────────────────────
function startShake(duration, intensity, callback) {
  const start = performance.now();
  (function step(now) {
    const elapsed = now - start;
    if (elapsed >= duration) {
      canvas.style.transform = '';
      if (callback) callback();
      return;
    }
    const decay = 1 - elapsed / duration;
    const x = (Math.random() - 0.5) * 2 * intensity * decay;
    const y = (Math.random() - 0.5) * 2 * intensity * decay;
    canvas.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    requestAnimationFrame(step);
  })(performance.now());
}

// ── Milestone celebration ─────────────────────────────────────────────
function triggerMilestone(pts) {
  milestoneFlashAt = Date.now();
  milestoneFlashScore = pts;
  // Rainbow burst: 8 locations with evenly-spaced hues
  for (let i = 0; i < 8; i++) {
    spawnParticles(
      Math.floor(Math.random() * COLS),
      Math.floor(Math.random() * ROWS),
      CELL,
      (i * 45) % 360,
    );
  }
}

function startGame() {
  snake = [[Math.floor(COLS/2), Math.floor(ROWS/2)]];
  dir = [1, 0]; nextDir = [1, 0];
  food = randFood(snake);
  score = 0; speed = getInitialSpeed();
  resetParticles();
  paused = false; running = true;
  bonusFood = null; bonusFoodExpiry = 0; foodEaten = 0;
  comboCount = 0; comboExpiry = 0; comboFadeAt = 0;
  newBestExpiry = 0;
  shieldFood = null; shieldFoodExpiry = 0;
  shieldActive = false; shieldExpiry = 0;
  poisonFood = null; poisonFoodExpiry = 0;
  milestonesHit = new Set();
  milestoneFlashAt = 0;
  scoreEl.textContent = 0;
  overlay.style.display = 'none';
  clearTimeout(loopId);
  loop();
}

function loop() {
  if (!running) return;
  update();
  draw();
  loopId = setTimeout(loop, speed);
}

function update() {
  dir = nextDir;
  let head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];

  if (warpMode) {
    head = [(head[0] + COLS) % COLS, (head[1] + ROWS) % ROWS];
  } else {
    if (head[0] < 0 || head[0] >= COLS || head[1] < 0 || head[1] >= ROWS) return endGame();
  }

  // Self-collision — shield absorbs one hit
  if (snake.some(s => s[0] === head[0] && s[1] === head[1])) {
    if (shieldActive) {
      shieldActive = false;
      shieldExpiry = 0;
    } else {
      return endGame();
    }
  }

  snake.unshift(head);
  let grew = false;

  const now = Date.now();

  // Expire power-up foods and active shield
  if (shieldFood && now >= shieldFoodExpiry) shieldFood = null;
  if (poisonFood && now >= poisonFoodExpiry) poisonFood = null;
  if (shieldActive && now >= shieldExpiry) shieldActive = false;

  // ── Regular food ──
  if (head[0] === food[0] && head[1] === food[1]) {
    comboCount = now < comboExpiry ? Math.min(comboCount + 1, 3) : 1;
    comboExpiry = now + 3000;
    comboFadeAt = now + 1500;
    score += 10 * comboCount;
    grew = true;
    spawnParticles(food[0], food[1], CELL);
    playEat();
    food = randFood([...snake]);
    foodEaten++;
    speed = Math.max(40, speed - 2);
    if (foodEaten % 5 === 0 && !bonusFood) {
      bonusFood = randFood([...snake, food]);
      bonusFoodExpiry = now + 5000;
    }
    // Shield food every 8th regular food
    if (foodEaten % 8 === 0 && !shieldFood) {
      const excl = [...snake, food, ...(bonusFood ? [bonusFood] : [])];
      shieldFood = randFood(excl);
      shieldFoodExpiry = now + 6000;
    }
    // Poison food at offset interval (3, 10, 17, ...)
    if (foodEaten % 7 === 3 && !poisonFood) {
      const excl = [...snake, food,
        ...(bonusFood  ? [bonusFood]  : []),
        ...(shieldFood ? [shieldFood] : [])];
      poisonFood = randFood(excl);
      poisonFoodExpiry = now + 5000;
    }
  }

  // ── Bonus food ──
  if (bonusFood) {
    if (head[0] === bonusFood[0] && head[1] === bonusFood[1]) {
      score += 30;
      grew = true;
      spawnParticles(bonusFood[0], bonusFood[1], CELL);
      playEat();
      bonusFood = null;
    } else if (now >= bonusFoodExpiry) {
      bonusFood = null;
    }
  }

  // ── Shield food pickup ──
  if (shieldFood && head[0] === shieldFood[0] && head[1] === shieldFood[1]) {
    shieldActive = true;
    shieldExpiry = now + 5000;
    grew = true;
    spawnParticles(shieldFood[0], shieldFood[1], CELL, 200);
    playEat();
    shieldFood = null;
  }

  // ── Poison food ──
  if (poisonFood && head[0] === poisonFood[0] && head[1] === poisonFood[1]) {
    grew = true; // prevent normal tail pop; we do manual shrink
    score += 5;
    // Net shrink 2: unshift already added 1, pop 3 → net −2
    for (let i = 0; i < 3; i++) {
      if (snake.length > 2) snake.pop();
    }
    spawnParticles(poisonFood[0], poisonFood[1], CELL, 270);
    playEat();
    poisonFood = null;
  }

  if (grew) {
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      localStorage.setItem('snake_best', best);
      newBestExpiry = now + NEW_BEST_DURATION;
    }
    // Milestone celebration
    for (const m of MILESTONES) {
      if (!milestonesHit.has(m) && score >= m) {
        milestonesHit.add(m);
        triggerMilestone(m);
      }
    }
  } else {
    snake.pop();
  }

  updateParticles();
}

function draw() {
  const t = getCurrentTheme();

  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = t.grid;
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath(); ctx.moveTo(x*CELL, 0); ctx.lineTo(x*CELL, canvas.height); ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath(); ctx.moveTo(0, y*CELL); ctx.lineTo(canvas.width, y*CELL); ctx.stroke();
  }

  drawParticles(ctx);

  // Regular food
  const [fx, fy] = food;
  ctx.fillStyle = t.food;
  ctx.beginPath();
  ctx.arc(fx*CELL + CELL/2, fy*CELL + CELL/2, CELL/2 - 2, 0, Math.PI*2);
  ctx.fill();

  // Bonus food — golden, pulsing glow, countdown bar
  if (bonusFood) {
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 150);
    const [bx, by] = bonusFood;
    ctx.shadowColor = 'hsl(45, 100%, 65%)';
    ctx.shadowBlur = 8 + pulse * 8;
    ctx.fillStyle = `hsl(45, 100%, ${55 + pulse * 15}%)`;
    ctx.beginPath();
    ctx.arc(bx*CELL + CELL/2, by*CELL + CELL/2, CELL/2 - 1, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    const ratio = Math.max(0, (bonusFoodExpiry - Date.now()) / 5000);
    ctx.fillStyle = 'rgba(251,191,36,0.8)';
    ctx.fillRect(bx*CELL + 1, by*CELL + CELL - 4, (CELL - 2) * ratio, 3);
  }

  // Shield food — cyan diamond, pulsing glow, countdown bar
  if (shieldFood) {
    const now = Date.now();
    const pulse = 0.7 + 0.3 * Math.sin(now / 180);
    const [sx, sy] = shieldFood;
    const cx = sx * CELL + CELL / 2;
    const cy = sy * CELL + CELL / 2;
    const r = (CELL / 2 - 1) * pulse;
    ctx.save();
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8 + pulse * 6;
    ctx.fillStyle = `hsl(200, 90%, ${55 + 15 * pulse}%)`;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    const ratio = Math.max(0, (shieldFoodExpiry - now) / 6000);
    ctx.fillStyle = 'rgba(56,189,248,0.8)';
    ctx.fillRect(sx*CELL + 1, sy*CELL + CELL - 4, (CELL - 2) * ratio, 3);
  }

  // Poison food — dark purple circle, countdown bar
  if (poisonFood) {
    const now = Date.now();
    const pulse = 0.6 + 0.4 * Math.sin(now / 250);
    const [px, py] = poisonFood;
    const cx = px * CELL + CELL / 2;
    const cy = py * CELL + CELL / 2;
    ctx.save();
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 6 + pulse * 4;
    ctx.fillStyle = `hsl(270, 70%, ${30 + 10 * pulse}%)`;
    ctx.beginPath();
    ctx.arc(cx, cy, CELL / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const ratio = Math.max(0, (poisonFoodExpiry - now) / 5000);
    ctx.fillStyle = 'rgba(168,85,247,0.8)';
    ctx.fillRect(px*CELL + 1, py*CELL + CELL - 4, (CELL - 2) * ratio, 3);
  }

  // Snake
  snake.forEach(([x, y], i) => {
    const ratio = i / snake.length;
    ctx.fillStyle = i === 0
      ? t.snake
      : `hsl(${t.snakeHue - ratio*40}, 70%, ${50 - ratio*15}%)`;
    ctx.beginPath();
    ctx.roundRect(x*CELL + 1, y*CELL + 1, CELL - 2, CELL - 2, 4);
    ctx.fill();
  });

  // Shield glow ring around snake head
  if (shieldActive && Date.now() < shieldExpiry) {
    const [hx, hy] = snake[0];
    const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 100);
    ctx.save();
    ctx.strokeStyle = `rgba(56, 189, 248, ${pulse})`;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(hx * CELL + CELL / 2, hy * CELL + CELL / 2, CELL / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Snake eyes — drawn on head, oriented toward movement direction
  if (snake.length > 0 && dir) {
    const [hx, hy] = snake[0];
    const [dx, dy] = dir;
    const cx = hx * CELL + CELL / 2;
    const cy = hy * CELL + CELL / 2;
    const fwd = 3, side = 3.5;
    [-1, 1].forEach(s => {
      const ex = cx + dx * fwd - dy * s * side;
      const ey = cy + dy * fwd + dx * s * side;
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.beginPath(); ctx.arc(ex, ey, 2.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(ex + dx * 0.9, ey + dy * 0.9, 1.1, 0, Math.PI * 2); ctx.fill();
    });
  }

  const now = Date.now();

  // Combo label — fades after 1.5 s
  if (comboCount >= 2 && now < comboFadeAt) {
    const alpha = (comboFadeAt - now) / 1500;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = comboCount >= 3 ? '#ff6b6b' : '#facc15';
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`x${comboCount} COMBO!`, canvas.width / 2, 28);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  // Shield active indicator — bottom-left corner
  if (shieldActive && now < shieldExpiry) {
    const remaining = Math.ceil((shieldExpiry - now) / 1000);
    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`SHIELD ${remaining}s`, 5, canvas.height - 5);
    ctx.restore();
  }

  // New best badge — top-right, fades after NEW_BEST_DURATION ms
  if (newBestExpiry > now) {
    const ratio = (newBestExpiry - now) / NEW_BEST_DURATION;
    ctx.globalAlpha = Math.min(ratio * 4, 1);
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('★ NEW BEST', canvas.width - 8, 20);
    ctx.textAlign = 'left';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // Score milestone flash — centered, fades over MILESTONE_DURATION
  if (milestoneFlashAt > 0) {
    const elapsed = now - milestoneFlashAt;
    if (elapsed < MILESTONE_DURATION) {
      const p = elapsed / MILESTONE_DURATION;
      const alpha = p < 0.15 ? p / 0.15 : Math.max(0, 1 - (p - 0.15) / 0.85);
      ctx.save();
      ctx.globalAlpha = alpha * 0.9;
      ctx.font = `bold ${44 - p * 8}px "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#4ade80';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 18;
      ctx.fillText(`${milestoneFlashScore}!`, canvas.width / 2, canvas.height / 2 + 30);
      ctx.restore();
    }
  }
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) {
    clearTimeout(loopId);
    overlayTitle.textContent = 'PAUSED';
    overlaySub.textContent   = 'Press P to resume';
    btn.textContent = 'RESUME';
    overlay.style.display = 'flex';
  } else {
    overlay.style.display = 'none';
    loop();
  }
}

function endGame() {
  running = false; paused = false;
  clearTimeout(loopId);
  playGameOver();
  if (score > 0) saveScore(score);
  startShake(380, 7, () => {
    overlayTitle.textContent = 'GAME OVER';
    overlaySub.textContent   = `Score: ${score}`;
    btn.textContent = 'PLAY AGAIN';
    overlay.style.display = 'flex';
  });
}

export function initGame() {
  canvas = document.getElementById('c');
  ctx = canvas.getContext('2d');
  scoreEl = document.getElementById('score');
  bestEl  = document.getElementById('best');
  overlay = document.getElementById('overlay');
  overlayTitle = document.getElementById('overlay-title');
  overlaySub   = document.getElementById('overlay-sub');
  btn = document.getElementById('btn');

  COLS = canvas.width  / CELL;
  ROWS = canvas.height / CELL;

  best = parseInt(localStorage.getItem('snake_best') || '0');
  bestEl.textContent = best;

  btn.addEventListener('click', () => {
    if (paused) togglePause();
    else startGame();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      togglePause();
      return;
    }
    const d = DIRS[e.key];
    if (!d) return;
    e.preventDefault();
    if (dir && d[0] === -dir[0] && d[1] === -dir[1]) return;
    nextDir = d;
  });

  canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
    let newDir;
    if (Math.abs(dx) > Math.abs(dy)) {
      newDir = dx > 0 ? [1, 0] : [-1, 0];
    } else {
      newDir = dy > 0 ? [0, 1] : [0, -1];
    }
    if (dir && newDir[0] === -dir[0] && newDir[1] === -dir[1]) return;
    nextDir = newDir;
    e.preventDefault();
  }, { passive: false });

  document.querySelectorAll('.diff-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
  });

  const warpBtn = document.getElementById('warp-btn');
  warpBtn?.addEventListener('click', () => {
    warpMode = !warpMode;
    warpBtn.textContent = warpMode ? 'WARP ON' : 'WARP OFF';
    warpBtn.classList.toggle('active', warpMode);
  });
}
