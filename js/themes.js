// Theme config + DOM applier.
export const THEMES = {
  classic: { snake: '#4ade80', snakeHue: 140, food: '#f87171', bg: '#111',    grid: '#1a1a1a' },
  neon:    { snake: '#00d4ff', snakeHue: 190, food: '#ff6b9d', bg: '#0a0a1a', grid: '#12122a' },
  retro:   { snake: '#fbbf24', snakeHue:  45, food: '#f97316', bg: '#1a0f00', grid: '#241500' },
  mono:    { snake: '#e2e8f0', snakeHue: 215, food: '#94a3b8', bg: '#0f172a', grid: '#1e293b' },
};

let currentTheme = localStorage.getItem('snake_theme') || 'classic';

export function getCurrentTheme() {
  return THEMES[currentTheme];
}

export function applyTheme(name) {
  if (!THEMES[name]) return;
  currentTheme = name;
  localStorage.setItem('snake_theme', name);
  const t = THEMES[name];
  document.querySelector('h1').style.color = t.snake;
  const btn = document.getElementById('btn');
  if (btn) btn.style.background = t.snake;
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.theme === name);
  });
}

export function initThemes() {
  document.querySelectorAll('.theme-btn').forEach(b => {
    b.addEventListener('click', () => applyTheme(b.dataset.theme));
  });
  applyTheme(currentTheme);
}
