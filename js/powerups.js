const CELL = 20;
const COLS = 20;
const ROWS = 20;
const INTERVAL = 5;   // every N food eaten
const TTL = 7000;     // disappears after 7s

let foodCount = 0;
let powerup = null;

export function resetPowerups() {
  foodCount = 0;
  powerup = null;
}

export function onFoodEaten(snake) {
  foodCount++;
  if (foodCount % INTERVAL === 0) _spawn(snake);
}

function _spawn(snake) {
  let pos;
  do {
    pos = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)];
  } while (snake.some(s => s[0] === pos[0] && s[1] === pos[1]));
  powerup = { x: pos[0], y: pos[1], expires: Date.now() + TTL, t: 0 };
}

export function updatePowerup() {
  if (!powerup) return;
  if (Date.now() > powerup.expires) { powerup = null; return; }
  powerup.t += 0.15;
}

export function drawPowerup(ctx) {
  if (!powerup) return;
  const { x, y, t } = powerup;
  const cx = x * CELL + CELL / 2;
  const cy = y * CELL + CELL / 2;
  const remaining = (powerup.expires - Date.now()) / TTL;
  const r = CELL / 2 - 2 + 2 * Math.sin(t * 0.7);

  // outer glow
  ctx.globalAlpha = (0.25 + 0.2 * Math.sin(t)) * remaining;
  ctx.fillStyle = '#fde68a';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
  ctx.fill();

  // star body
  ctx.globalAlpha = (0.75 + 0.25 * Math.sin(t)) * remaining;
  ctx.fillStyle = '#fde68a';
  _star(ctx, cx, cy, 5, r, r * 0.42);

  ctx.globalAlpha = 1;
}

function _star(ctx, cx, cy, spikes, outerR, innerR) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
}

export function checkPowerupCollision(head) {
  if (!powerup) return false;
  if (head[0] === powerup.x && head[1] === powerup.y) {
    powerup = null;
    return true;
  }
  return false;
}
