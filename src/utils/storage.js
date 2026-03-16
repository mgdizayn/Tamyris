const HIGH_SCORE_KEY = 'tamay-tetris-high-score';

export const loadHighScore = () => {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
  const parsed = Number(raw || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const saveHighScore = (score) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
};
