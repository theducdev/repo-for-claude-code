// Particle burst system — spawned when the snake eats food.
let particles = [];

export function resetParticles() {
  particles = [];
}

export function spawnParticles(gx, gy, cellSize) {
  const cx = gx * cellSize + cellSize / 2;
  const cy = gy * cellSize + cellSize / 2;
  const count = 14;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const spd = 1.8 + Math.random() * 2.8;
    const hue = Math.random() * 60 + 10;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: 1, hue,
    });
  }
}

export function updateParticles() {
  particles = particles.filter(p => {
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.12; p.vx *= 0.96;
    p.life -= 0.035;
    return p.life > 0;
  });
}

export function drawParticles(ctx) {
  particles.forEach(p => {
    ctx.globalAlpha = p.life * p.life;
    ctx.fillStyle = `hsl(${p.hue}, 90%, 62%)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5 * p.life, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}
