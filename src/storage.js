const KEY = 'flappy.best';

export function loadBest() {
  try {
    return parseInt(localStorage.getItem(KEY), 10) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(value) {
  try {
    localStorage.setItem(KEY, String(value));
  } catch {
    /* 無痕模式等情況存不了就算了 */
  }
}
