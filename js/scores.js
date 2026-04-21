const KEY = 'snake_best';

export function getBest() {
  return parseInt(localStorage.getItem(KEY) || '0');
}

export function saveBest(score) {
  localStorage.setItem(KEY, score);
}
