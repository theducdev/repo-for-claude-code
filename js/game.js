import { spawnParticles, updateParticles, drawParticles, resetParticles } from './particles.js';
import { saveScore } from './scores.js';

const CELL = 20;
const DIRS = {
  ArrowUp: [0,-1], w: [0,-1],
  ArrowDown: [0,1], s: [0,1],
  ArrowLeft: [-1,0], a: [-1,0],
  ArrowRight: [1,0], d: [1,0],
};

export function initGame() {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlaySub = document.getElementById('overlay-sub');
  const btn = document.getElementById('btn');

  const COLS = canvas.width / CELL;
  const ROWS = canvas.height / CELL;

  let snake, dir, nextDir, food, bonusFood, bonusFoodExpiry;
  let score, loopId, speed;
  let paused = false;
  let running = false;
  let foodEaten = 0;

  let best = parseInt(localStorage.getItem('snake_best') || '0');
  bestEl.textContent = best;

  function randPos(occupied = []) {
    let pos;
    do {
      pos = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)];
    } while (occupied.some(([ox, oy]) => ox === pos[0] && oy === pos[1]));
    return pos;
  }

  function startGame() {
    snake = [[Math.floor(COLS / 2), Math.floor(ROWS / 2)]];
    dir = [1, 0];
    nextDir = [1, 0];
    food = randPos(snake);
    bonusFood = null;
    bonusFoodExpiry = 0;
    score = 0;
    speed = 120;
    paused = false;
    running = true;
    foodEaten = 0;
    resetParticles();
    scoreEl.textContent = 0;
    overlay.style.display = 'none';
    clearTimeout(loopId);
    loop();
  }

  function loop() {
    if (!paused) {
      update();
      draw();
    }
    loopId = setTimeout(loop, speed);
  }

  function update() {
    dir = nextDir;
    const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];

    if (head[0] < 0 || head[0] >= COLS || head[1] < 0 || head[1] >= ROWS) return endGame();
    if (snake.some(([x, y]) => x === head[0] && y === head[1])) return endGame();

    snake.unshift(head);
    let ate = false;

    if (head[0] === food[0] && head[1] === food[1]) {
      score += 10;
      ate = true;
      spawnParticles(food[0], food[1], CELL);
      food = randPos([...snake]);
      foodEaten++;
      speed = Math.max(60, speed - 2);
      if (foodEaten % 5 === 0 && !bonusFood) {
        bonusFood = randPos([...snake, food]);
        bonusFoodExpiry = Date.now() + 5000;
      }
    }

    if (bonusFood) {
      if (head[0] === bonusFood[0] && head[1] === bonusFood[1]) {
        score += 30;
        ate = true;
        spawnParticles(bonusFood[0], bonusFood[1], CELL);
        bonusFood = null;
      } else if (Date.now() >= bonusFoodExpiry) {
        bonusFood = null;
      }
    }

    if (ate) {
      scoreEl.textContent = score;
      if (score > best) {
        best = score;
        bestEl.textContent = best;
        localStorage.setItem('snake_best', best);
      }
    } else {
      snake.pop();
    }

    updateParticles();
  }

  function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(canvas.width, y * CELL); ctx.stroke();
    }

    drawParticles(ctx);

    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(food[0] * CELL + CELL / 2, food[1] * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    if (bonusFood) {
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 150);
      const [bx, by] = bonusFood;
      ctx.shadowColor = 'hsl(45, 100%, 65%)';
      ctx.shadowBlur = 8 + pulse * 8;
      ctx.fillStyle = `hsl(45, 100%, ${55 + pulse * 15}%)`;
      ctx.beginPath();
      ctx.arc(bx * CELL + CELL / 2, by * CELL + CELL / 2, CELL / 2 - 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      const ratio = Math.max(0, (bonusFoodExpiry - Date.now()) / 5000);
      ctx.fillStyle = 'hsl(45, 100%, 55%)';
      ctx.fillRect(bx * CELL + 1, by * CELL + CELL - 4, (CELL - 2) * ratio, 3);
    }

    snake.forEach(([x, y], i) => {
      const ratio = i / snake.length;
      ctx.fillStyle = i === 0
        ? '#4ade80'
        : `hsl(${140 - ratio * 40}, 70%, ${50 - ratio * 15}%)`;
      ctx.beginPath();
      ctx.roundRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();
    });

    if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 36px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 8);
      ctx.font = '13px "Segoe UI", sans-serif';
      ctx.fillStyle = '#888';
      ctx.fillText('Press P or Esc to resume', canvas.width / 2, canvas.height / 2 + 22);
    }
  }

  function endGame() {
    running = false;
    clearTimeout(loopId);
    if (score > 0) {
      saveScore(score);
      window.dispatchEvent(new CustomEvent('snakeScoreUpdate'));
    }
    overlayTitle.textContent = 'GAME OVER';
    overlaySub.textContent = `Score: ${score}`;
    btn.textContent = 'PLAY AGAIN';
    overlay.style.display = 'flex';
  }

  btn.addEventListener('click', startGame);

  document.addEventListener('keydown', e => {
    if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && running) {
      e.preventDefault();
      paused = !paused;
      draw();
      return;
    }
    const d = DIRS[e.key];
    if (!d) return;
    e.preventDefault();
    if (d[0] === -dir[0] && d[1] === -dir[1]) return;
    nextDir = d;
  });
}
