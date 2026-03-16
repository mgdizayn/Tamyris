import { COLS, PIECES, PIECE_KEYS, ROWS } from '../constants/pieces';

export const createEmptyBoard = () =>
  Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null));

export const randomPiece = () => {
  const type = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
  return { type, rotation: 0, x: 3, y: 0 };
};

export const getCells = (piece) => PIECES[piece.type].cells[piece.rotation % 4];

export const hasCollision = (board, piece, moveX = 0, moveY = 0, rotateTo = piece.rotation) => {
  const cells = PIECES[piece.type].cells[rotateTo % 4];
  return cells.some(([dx, dy]) => {
    const x = piece.x + dx + moveX;
    const y = piece.y + dy + moveY;
    if (x < 0 || x >= COLS || y >= ROWS) return true;
    if (y < 0) return false;
    return !!board[y][x];
  });
};

export const mergePiece = (board, piece) => {
  const next = board.map((row) => [...row]);
  for (const [dx, dy] of getCells(piece)) {
    const x = piece.x + dx;
    const y = piece.y + dy;
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
      next[y][x] = {
        type: piece.type,
        color: PIECES[piece.type].color,
        glow: PIECES[piece.type].glow,
      };
    }
  }
  return next;
};

export const clearLines = (board) => {
  const keptRows = board.filter((row) => row.some((cell) => cell === null));
  const cleared = ROWS - keptRows.length;
  const freshRows = Array.from({ length: cleared }, () => Array.from({ length: COLS }, () => null));
  return { board: [...freshRows, ...keptRows], cleared };
};

export const scoreForLines = (count) => {
  if (count === 1) return 100;
  if (count === 2) return 250;
  if (count === 3) return 450;
  if (count >= 4) return 800;
  return 0;
};
