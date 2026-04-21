// High score board — keeps top 5 in localStorage.
let highScores = JSON.parse(localStorage.getItem('snake_hiscores') || '[]');

export function renderScores() {
  const scList = document.getElementById('sc-list');
  scList.innerHTML = '';
  if (highScores.length === 0) {
    scList.innerHTML = '<div class="sc-empty">No scores yet — play a game!</div>';
    return;
  }
  const rankClass = ['gold', 'silver', 'bronze'];
  highScores.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'sc-entry';
    el.innerHTML = `
      <span class="sc-rank ${rankClass[i] || ''}">#${i + 1}</span>
      <span class="sc-score">${s.score}</span>
      <span class="sc-date">${s.date}</span>
    `;
    scList.appendChild(el);
  });
}

export function saveScore(pts) {
  const now = new Date();
  const p = n => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}`;
  highScores.push({ score: pts, date: dateStr });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 5);
  localStorage.setItem('snake_hiscores', JSON.stringify(highScores));
  renderScores();
}

export function initScores() {
  renderScores();
}
