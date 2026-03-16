import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PIECES } from '../constants/pieces';
import { TAMAY_MESSAGES } from '../constants/messages';
import { playClearSound } from '../utils/audio';
import { loadHighScore, saveHighScore } from '../utils/storage';
import {
  clearLines,
  createEmptyBoard,
  getCells,
  hasCollision,
  mergePiece,
  randomPiece,
  scoreForLines,
} from '../utils/tetris';

export function useTetrisGame() {
  const [board, setBoard] = useState(createEmptyBoard);
  const [piece, setPiece] = useState(randomPiece);
  const [nextPiece, setNextPiece] = useState(randomPiece);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [messageBursts, setMessageBursts] = useState([]);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const lastTickRef = useRef(0);
  const requestRef = useRef(null);
  const touchStartRef = useRef(null);

  const speed = Math.max(140, 720 - (level - 1) * 55);

  useEffect(() => {
    setHighScore(loadHighScore());
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      saveHighScore(score);
    }
  }, [highScore, score]);

  const spawnBurst = useCallback((cleared) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const text = TAMAY_MESSAGES[Math.floor(Math.random() * TAMAY_MESSAGES.length)];
    const verticalOffset = 24 + Math.random() * 55;

    setMessageBursts((prev) => [
      ...prev,
      {
        id,
        text: cleared >= 4 ? `TAMAY TETRIS! ${text}` : text,
        style: {
          left: `${16 + Math.random() * 48}%`,
          top: `${verticalOffset}%`,
        },
      },
    ]);

    window.setTimeout(() => {
      setMessageBursts((prev) => prev.filter((m) => m.id !== id));
    }, 2200);
  }, []);

  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setPiece(randomPiece());
    setNextPiece(randomPiece());
    setScore(0);
    setLines(0);
    setLevel(1);
    setCombo(0);
    setGameOver(false);
    setMessageBursts([]);
    setIsRunning(true);
    lastTickRef.current = 0;
  }, []);

  const lockAndContinue = useCallback((currentBoard, currentPiece) => {
    const merged = mergePiece(currentBoard, currentPiece);
    const { board: cleanedBoard, cleared } = clearLines(merged);

    if (cleared > 0) {
      playClearSound(cleared);
      spawnBurst(cleared);
      setCombo((prevCombo) => {
        const nextCombo = prevCombo + 1;
        setScore((prevScore) => prevScore + scoreForLines(cleared) + prevCombo * 25);
        return nextCombo;
      });
      setLines((prevLines) => {
        const nextLines = prevLines + cleared;
        setLevel(Math.floor(nextLines / 8) + 1);
        return nextLines;
      });
    } else {
      setCombo(0);
    }

    const incoming = nextPiece;
    const preparedNext = randomPiece();

    if (hasCollision(cleanedBoard, incoming)) {
      setBoard(cleanedBoard);
      setGameOver(true);
      setIsRunning(false);
      return;
    }

    setBoard(cleanedBoard);
    setPiece(incoming);
    setNextPiece(preparedNext);
  }, [nextPiece, spawnBurst]);

  const softDrop = useCallback(() => {
    if (!isRunning || gameOver) return;

    setPiece((prev) => {
      if (!hasCollision(board, prev, 0, 1)) {
        return { ...prev, y: prev.y + 1 };
      }
      lockAndContinue(board, prev);
      return prev;
    });
  }, [board, gameOver, isRunning, lockAndContinue]);

  const movePiece = useCallback((dir) => {
    if (!isRunning || gameOver) return;
    setPiece((prev) => {
      if (hasCollision(board, prev, dir, 0)) return prev;
      return { ...prev, x: prev.x + dir };
    });
  }, [board, gameOver, isRunning]);

  const rotatePiece = useCallback(() => {
    if (!isRunning || gameOver) return;
    setPiece((prev) => {
      const nextRotation = (prev.rotation + 1) % 4;
      if (!hasCollision(board, prev, 0, 0, nextRotation)) {
        return { ...prev, rotation: nextRotation };
      }
      if (!hasCollision(board, prev, -1, 0, nextRotation)) {
        return { ...prev, x: prev.x - 1, rotation: nextRotation };
      }
      if (!hasCollision(board, prev, 1, 0, nextRotation)) {
        return { ...prev, x: prev.x + 1, rotation: nextRotation };
      }
      return prev;
    });
  }, [board, gameOver, isRunning]);

  const hardDrop = useCallback(() => {
    if (!isRunning || gameOver) return;
    setPiece((prev) => {
      let y = prev.y;
      while (!hasCollision(board, prev, 0, y - prev.y + 1)) {
        y += 1;
      }
      const dropped = { ...prev, y };
      lockAndContinue(board, dropped);
      return dropped;
    });
  }, [board, gameOver, isRunning, lockAndContinue]);

  const ghostPiece = useMemo(() => {
    let y = piece.y;
    while (!hasCollision(board, piece, 0, y - piece.y + 1)) {
      y += 1;
    }
    return { ...piece, y };
  }, [board, piece]);

  const visibleBoard = useMemo(() => {
    const draft = board.map((row) => [...row]);

    for (const [dx, dy] of getCells(ghostPiece)) {
      const x = ghostPiece.x + dx;
      const y = ghostPiece.y + dy;
      if (y >= 0 && y < draft.length && x >= 0 && x < draft[0].length && !draft[y][x]) {
        draft[y][x] = {
          type: ghostPiece.type,
          color: PIECES[ghostPiece.type].color,
          glow: PIECES[ghostPiece.type].glow,
          ghost: true,
        };
      }
    }

    for (const [dx, dy] of getCells(piece)) {
      const x = piece.x + dx;
      const y = piece.y + dy;
      if (y >= 0 && y < draft.length && x >= 0 && x < draft[0].length) {
        draft[y][x] = {
          type: piece.type,
          color: PIECES[piece.type].color,
          glow: PIECES[piece.type].glow,
        };
      }
    }

    return draft;
  }, [board, ghostPiece, piece]);

  useEffect(() => {
    const loop = (time) => {
      if (isRunning && !gameOver) {
        if (!lastTickRef.current) lastTickRef.current = time;
        if (time - lastTickRef.current >= speed) {
          setPiece((prev) => {
            if (!hasCollision(board, prev, 0, 1)) {
              return { ...prev, y: prev.y + 1 };
            }
            lockAndContinue(board, prev);
            return prev;
          });
          lastTickRef.current = time;
        }
      }
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [board, gameOver, isRunning, lockAndContinue, speed]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft') movePiece(-1);
      if (e.key === 'ArrowRight') movePiece(1);
      if (e.key === 'ArrowUp') rotatePiece();
      if (e.key === 'ArrowDown') softDrop();
      if (e.key === ' ') hardDrop();
      if (e.key.toLowerCase() === 'p') setIsRunning((prev) => !prev);
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hardDrop, movePiece, rotatePiece, softDrop]);

  const startTouch = useCallback((event) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const endTouch = useCallback((event) => {
    if (!touchStartRef.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < 12 && absY < 12) {
      rotatePiece();
    } else if (absX > absY) {
      if (dx > 0) movePiece(1);
      else movePiece(-1);
    } else {
      if (dy > 0) hardDrop();
      else rotatePiece();
    }

    touchStartRef.current = null;
  }, [hardDrop, movePiece, rotatePiece]);

  return {
    board,
    piece,
    nextPiece,
    score,
    lines,
    level,
    isRunning,
    gameOver,
    messageBursts,
    combo,
    highScore,
    visibleBoard,
    setIsRunning,
    resetGame,
    movePiece,
    rotatePiece,
    softDrop,
    hardDrop,
    startTouch,
    endTouch,
  };
}
