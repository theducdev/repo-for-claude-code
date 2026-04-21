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

function startGame() {
  snake = [[Math.floor(COLS/2), Math.floor(ROWS/2)]];
  dir = [1, 0]; nextDir = [1, 0];
  food = randFood(snake);
  score = 0; speed = getInitialSpeed();
  resetParticles();
  paused = false; running = true;
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
  const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];

  if (head[0] < 0 || head[0] >= COLS || head[1] < 0 || head[1] >= ROWS) return endGame();
  if (snake.some(s => s[0] === head[0] && s[1] === head[1])) return endGame();

  snake.unshift(head);

  if (head[0] === food[0] && head[1] === food[1]) {
    score += 10;
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      bestEl.textContent = best;
      localStorage.setItem('snake_best', best);
    }
    spawnParticles(food[0], food[1], CELL);
    playEat();
    food = randFood(snake);
    speed = Math.max(40, speed - 2);
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

  const [fx, fy] = food;
  ctx.fillStyle = t.food;
  ctx.beginPath();
  ctx.arc(fx*CELL + CELL/2, fy*CELL + CELL/2, CELL/2 - 2, 0, Math.PI*2);
  ctx.fill();

  snake.forEach(([x, y], i) => {
    const ratio = i / snake.length;
    ctx.fillStyle = i === 0
      ? t.snake
      : `hsl(${t.snakeHue - ratio*40}, 70%, ${50 - ratio*15}%)`;
    ctx.beginPath();
    ctx.roundRect(x*CELL + 1, y*CELL + 1, CELL - 2, CELL - 2, 4);
    ctx.fill();
  });
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
  overlayTitle.textContent = 'GAME OVER';
  overlaySub.textContent   = `Score: ${score}`;
  btn.textContent = 'PLAY AGAIN';
  overlay.style.display = 'flex';
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
}
