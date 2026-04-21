import { getBest, saveBest } from './scores.js';
import { theme } from './themes.js';
import { initParticles, spawnParticles, updateParticles, drawParticles, clearParticles } from './particles.js';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlaySub = document.getElementById('overlay-sub');
const btn = document.getElementById('btn');
const modeTextEl = document.getElementById('mode-text');
const boostBarEl = document.getElementById('boost-bar');
const canvasWrapper = document.getElementById('canvas-wrapper');

const CELL = 20;
const COLS = canvas.width / CELL;
const ROWS = canvas.height / CELL;

initParticles(ctx, CELL);

const DIRS = {
  ArrowUp: [0, -1], w: [0, -1],
  ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0],
};

// ── State ──────────────────────────────────────────────────────────
let snake, dir, nextDir, food, score, loopId, baseSpeed, speed;

// Feature 1: Wall Wrap Mode
let wrapMode = false;

// Feature 2: Speed Boost
const BOOST_MAX = 5;
let boostEnergy = BOOST_MAX;
let boostHeld = false;
const BOOST_DRAIN = 0.1;   // per frame
const BOOST_REGEN = 0.04;  // per frame

// Feature 3: Bonus Food
const BONUS_DURATION = 80;       // frames the bonus food lasts (~10s at normal speed)
const BONUS_INTERVAL_MIN = 200;  // min frames between bonus spawns
const BONUS_INTERVAL_MAX = 350;
let bonusFood = null;            // { pos: [x,y], timer: number }
let bonusFoodTick = 0;
let nextBonusAt = randomBonusInterval();

let best = getBest();
bestEl.textContent = best;

// ── Helpers ────────────────────────────────────────────────────────
function randomBonusInterval() {
  return BONUS_INTERVAL_MIN + Math.floor(Math.random() * (BONUS_INTERVAL_MAX - BONUS_INTERVAL_MIN));
}

function randCell(avoid) {
  let pos;
  do {
    pos = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)];
  } while (avoid.some(s => s[0] === pos[0] && s[1] === pos[1]));
  return pos;
}

function updateBoostBar() {
  const filled = Math.round(boostEnergy);
  const full = Math.max(0, filled);
  const empty = Math.max(0, BOOST_MAX - filled);
  boostBarEl.textContent = '■'.repeat(full) + '□'.repeat(empty);
  boostBarEl.classList.toggle('empty', boostEnergy <= 0);
}

// ── Game lifecycle ─────────────────────────────────────────────────
function startGame() {
  snake = [[Math.floor(COLS / 2), Math.floor(ROWS / 2)]];
  dir = [1, 0];
  nextDir = [1, 0];
  food = randCell(snake);
  score = 0;
  baseSpeed = 120;
  speed = baseSpeed;
  bonusFood = null;
  bonusFoodTick = 0;
  nextBonusAt = randomBonusInterval();
  boostEnergy = BOOST_MAX;
  clearParticles();
  scoreEl.textContent = 0;
  overlay.style.display = 'none';
  if (loopId) clearTimeout(loopId);
  loop();
}

function loop() {
  update();
  draw();
  loopId = setTimeout(loop, speed);
}

// ── Update ─────────────────────────────────────────────────────────
function update() {
  dir = nextDir;
  let head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];

  // Feature 1: Wall Wrap vs Wall Death
  if (wrapMode) {
    head = [(head[0] + COLS) % COLS, (head[1] + ROWS) % ROWS];
  } else {
    if (head[0] < 0 || head[0] >= COLS || head[1] < 0 || head[1] >= ROWS) return endGame();
  }

  if (snake.some(s => s[0] === head[0] && s[1] === head[1])) return endGame();

  snake.unshift(head);

  let ate = false;

  if (head[0] === food[0] && head[1] === food[1]) {
    score += 10;
    spawnParticles(food[0], food[1]);
    food = randCell([...snake, ...(bonusFood ? [bonusFood.pos] : [])]);
    baseSpeed = Math.max(60, baseSpeed - 2);
    ate = true;
  } else if (bonusFood && head[0] === bonusFood.pos[0] && head[1] === bonusFood.pos[1]) {
    score += 30;
    spawnParticles(bonusFood.pos[0], bonusFood.pos[1], 22, 45); // golden burst
    bonusFood = null;
    ate = true;
  }

  if (!ate) snake.pop();

  scoreEl.textContent = score;
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    saveBest(best);
  }

  // Feature 2: Speed Boost energy
  if (boostHeld && boostEnergy > 0) {
    boostEnergy = Math.max(0, boostEnergy - BOOST_DRAIN);
  } else {
    boostEnergy = Math.min(BOOST_MAX, boostEnergy + BOOST_REGEN);
  }
  speed = (boostHeld && boostEnergy > 0) ? Math.max(30, Math.floor(baseSpeed / 2)) : baseSpeed;
  updateBoostBar();

  // Feature 3: Bonus Food lifecycle
  bonusFoodTick++;
  if (!bonusFood && bonusFoodTick >= nextBonusAt) {
    bonusFood = { pos: randCell([...snake, food]), timer: BONUS_DURATION };
    bonusFoodTick = 0;
    nextBonusAt = randomBonusInterval();
  }
  if (bonusFood) {
    bonusFood.timer--;
    if (bonusFood.timer <= 0) bonusFood = null;
  }

  updateParticles();
}

// ── Draw ───────────────────────────────────────────────────────────
function draw() {
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, canvas.height); ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(canvas.width, y * CELL); ctx.stroke();
  }

  drawParticles();

  // Normal food
  const [fx, fy] = food;
  ctx.fillStyle = theme.food;
  ctx.beginPath();
  ctx.arc(fx * CELL + CELL / 2, fy * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  // Feature 3: Bonus food with pulsing glow + urgency arc
  if (bonusFood) {
    const t = bonusFood.timer;
    const pulse = 0.5 + 0.5 * Math.sin(t * 0.25);
    const urgency = t / BONUS_DURATION;
    const [bx, by] = bonusFood.pos;
    const cx = bx * CELL + CELL / 2;
    const cy = by * CELL + CELL / 2;

    ctx.save();
    ctx.shadowBlur = 14 * pulse;
    ctx.shadowColor = '#facc15';
    ctx.fillStyle = `hsl(45, 95%, ${52 + 12 * pulse}%)`;
    ctx.beginPath();
    ctx.arc(cx, cy, (CELL / 2 - 1) * (0.85 + 0.15 * pulse), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Urgency countdown arc
    ctx.strokeStyle = `rgba(250, 204, 21, ${0.3 + urgency * 0.6})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, CELL / 2 + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * urgency);
    ctx.stroke();
  }

  // Snake
  snake.forEach(([x, y], i) => {
    const ratio = i / snake.length;
    ctx.fillStyle = i === 0
      ? theme.snakeHead
      : `hsl(${theme.snakeHue - ratio * 40}, 70%, ${50 - ratio * 15}%)`;
    ctx.beginPath();
    ctx.roundRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2, 4);
    ctx.fill();
  });
}

// ── End game ───────────────────────────────────────────────────────
function endGame() {
  clearTimeout(loopId);
  overlayTitle.textContent = 'GAME OVER';
  overlaySub.textContent = `Score: ${score}`;
  btn.textContent = 'PLAY AGAIN';
  overlay.style.display = 'flex';
}

// ── Input ──────────────────────────────────────────────────────────
btn.addEventListener('click', startGame);

document.addEventListener('keydown', e => {
  // Feature 1: Toggle wall wrap
  if (e.key === '[') {
    wrapMode = !wrapMode;
    modeTextEl.textContent = wrapMode ? 'WRAP' : 'NORMAL';
    canvasWrapper.classList.toggle('wrap-mode', wrapMode);
    return;
  }
  // Feature 2: Speed boost
  if (e.key === ' ') {
    e.preventDefault();
    boostHeld = true;
    return;
  }
  const d = DIRS[e.key];
  if (!d) return;
  e.preventDefault();
  if (d[0] === -dir[0] && d[1] === -dir[1]) return;
  nextDir = d;
});

document.addEventListener('keyup', e => {
  if (e.key === ' ') boostHeld = false;
});
