import { getTheme } from './themes.js';
import { spawnParticles, updateParticles, drawParticles, resetParticles } from './particles.js';
import { getBest, saveBest } from './scores.js';
import { playEat, playDie, playPowerup } from './sounds.js';
import { resetPowerups, onFoodEaten, updatePowerup, drawPowerup, checkPowerupCollision } from './powerups.js';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlaySub = document.getElementById('overlay-sub');
const btn = document.getElementById('btn');
const canvasWrapper = document.getElementById('canvas-wrapper');

const CELL = 20;
const COLS = canvas.width / CELL;
const ROWS = canvas.height / CELL;

const DIRS = {
  ArrowUp: [0, -1], w: [0, -1],
  ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0],
};

let snake, dir, nextDir, food, score, loopId, speed, slowUntil;

dir = [1, 0];
nextDir = [1, 0];
slowUntil = 0;

bestEl.textContent = getBest();

function randFood() {
  let pos;
  do {
    pos = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)];
  } while (snake.some(s => s[0] === pos[0] && s[1] === pos[1]));
  return pos;
}

function startGame() {
  snake = [[Math.floor(COLS / 2), Math.floor(ROWS / 2)]];
  dir = [1, 0];
  nextDir = [1, 0];
  food = randFood();
  score = 0;
  speed = 120;
  slowUntil = 0;
  scoreEl.textContent = 0;
  resetParticles();
  resetPowerups();
  canvasWrapper.classList.remove('slow-active');
  overlay.style.display = 'none';
  if (loopId) clearTimeout(loopId);
  loop();
}

function loop() {
  update();
  draw();
  if (Date.now() >= slowUntil) canvasWrapper.classList.remove('slow-active');
  const effectiveSpeed = Date.now() < slowUntil ? Math.max(speed, 110) : speed;
  loopId = setTimeout(loop, effectiveSpeed);
}

function update() {
  dir = nextDir;
  const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];

  if (head[0] < 0 || head[0] >= COLS || head[1] < 0 || head[1] >= ROWS) return endGame();
  if (snake.some(s => s[0] === head[0] && s[1] === head[1])) return endGame();

  snake.unshift(head);

  if (head[0] === food[0] && head[1] === food[1]) {
    score += 10;
    scoreEl.textContent = score;
    bestEl.textContent = saveBest(score);
    const theme = getTheme();
    spawnParticles(food[0], food[1], theme.snakeHue);
    playEat();
    onFoodEaten(snake);
    food = randFood();
    speed = Math.max(60, speed - 2);
  } else {
    snake.pop();
  }

  if (checkPowerupCollision(head)) {
    score += 50;
    scoreEl.textContent = score;
    bestEl.textContent = saveBest(score);
    spawnParticles(head[0], head[1], 45);
    playPowerup();
    slowUntil = Date.now() + 3500;
    canvasWrapper.classList.add('slow-active');
  }

  updateParticles();
  updatePowerup();
}

function draw() {
  const theme = getTheme();

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, canvas.height); ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(canvas.width, y * CELL); ctx.stroke();
  }

  drawParticles(ctx);
  drawPowerup(ctx);

  const [fx, fy] = food;
  ctx.fillStyle = theme.foodColor;
  ctx.beginPath();
  ctx.arc(fx * CELL + CELL / 2, fy * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

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

function endGame() {
  clearTimeout(loopId);
  canvasWrapper.classList.remove('slow-active');
  playDie();
  overlayTitle.textContent = 'GAME OVER';
  overlaySub.textContent = `Score: ${score}`;
  btn.textContent = 'PLAY AGAIN';
  overlay.style.display = 'flex';
}

export function initGame() {
  btn.addEventListener('click', startGame);

  document.addEventListener('keydown', e => {
    const d = DIRS[e.key];
    if (!d) return;
    e.preventDefault();
    if (d[0] === -dir[0] && d[1] === -dir[1]) return;
    nextDir = d;
  });
}
