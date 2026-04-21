let _ctx, _CELL;
const _particles = [];

export function initParticles(ctx, CELL) {
  _ctx = ctx;
  _CELL = CELL;
}

export function spawnParticles(gx, gy, count = 14, hueStart = 10) {
  const cx = gx * _CELL + _CELL / 2;
  const cy = gy * _CELL + _CELL / 2;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const spd = 1.8 + Math.random() * 2.8;
    const hue = hueStart + Math.random() * 60;
    _particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: 1, hue,
    });
  }
}

export function updateParticles() {
  for (let i = _particles.length - 1; i >= 0; i--) {
    const p = _particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.12;
    p.vx *= 0.96;
    p.life -= 0.035;
    if (p.life <= 0) _particles.splice(i, 1);
  }
}

export function drawParticles() {
  _particles.forEach(p => {
    _ctx.globalAlpha = p.life * p.life;
    _ctx.fillStyle = `hsl(${p.hue}, 90%, 62%)`;
    _ctx.beginPath();
    _ctx.arc(p.x, p.y, 3.5 * p.life, 0, Math.PI * 2);
    _ctx.fill();
  });
  _ctx.globalAlpha = 1;
}

export function clearParticles() {
  _particles.length = 0;
}
