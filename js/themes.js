export const THEMES = {
  classic: {
    name: 'Classic',
    bg: '#111',
    grid: '#1a1a1a',
    snakeHead: '#4ade80',
    snakeHue: 140,
    foodColor: '#f87171',
  },
  neon: {
    name: 'Neon',
    bg: '#0a0015',
    grid: '#150028',
    snakeHead: '#c084fc',
    snakeHue: 280,
    foodColor: '#22d3ee',
  },
  retro: {
    name: 'Retro',
    bg: '#1a1200',
    grid: '#2a1e00',
    snakeHead: '#fbbf24',
    snakeHue: 45,
    foodColor: '#fb923c',
  },
  ocean: {
    name: 'Ocean',
    bg: '#001a2e',
    grid: '#002244',
    snakeHead: '#38bdf8',
    snakeHue: 200,
    foodColor: '#f472b6',
  },
};

let current = localStorage.getItem('snake_theme') || 'classic';

export function getTheme() {
  return THEMES[current] || THEMES.classic;
}

export function initThemes(onThemeChange) {
  const buttons = document.querySelectorAll('.theme-btn');
  const h1 = document.querySelector('h1');
  const playBtn = document.getElementById('btn');

  function apply(key) {
    current = key;
    localStorage.setItem('snake_theme', key);
    const theme = THEMES[key];
    h1.style.color = theme.snakeHead;
    playBtn.style.background = theme.snakeHead;
    buttons.forEach(b => b.classList.toggle('active', b.dataset.theme === key));
    if (onThemeChange) onThemeChange(theme);
  }

  apply(current);

  buttons.forEach(btn => {
    btn.addEventListener('click', () => apply(btn.dataset.theme));
  });
}
