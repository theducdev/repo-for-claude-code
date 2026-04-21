const SCORES_KEY = 'snake_scores';

export function saveScore(score) {
  const scores = getScores();
  scores.push({
    score,
    date: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
  });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(0, 10)));
}

export function getScores() {
  try {
    return JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function renderScores() {
  const list = document.getElementById('scores-list');
  if (!list) return;

  function render() {
    const scores = getScores();
    if (!scores.length) {
      list.innerHTML = '<p class="scores-empty">Chưa có điểm số nào. Hãy chơi và lập kỷ lục!</p>';
      return;
    }
    list.innerHTML = scores.map((s, i) => `
      <div class="score-entry${i === 0 ? ' score-top' : ''}">
        <span class="score-rank">#${i + 1}</span>
        <span class="score-value">${s.score}</span>
        <span class="score-date">${s.date}</span>
      </div>
    `).join('');
  }

  render();
  window.addEventListener('snakeScoreUpdate', render);
}
