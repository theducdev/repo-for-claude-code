const KEY = 'snake_best';

export function getBest() {
  return parseInt(localStorage.getItem(KEY) || '0');
}

export function saveBest(score) {
  const current = getBest();
  if (score > current) {
    localStorage.setItem(KEY, score);
    return score;
  }
  return current;
}
