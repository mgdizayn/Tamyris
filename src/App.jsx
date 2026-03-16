import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 28;

const PIECES = {
  I: { color: 'cyan', cells: [[[0,1],[1,1],[2,1],[3,1]], [[2,0],[2,1],[2,2],[2,3]], [[0,2],[1,2],[2,2],[3,2]], [[1,0],[1,1],[1,2],[1,3]]] },
  O: { color: 'yellow', cells: [[[1,0],[2,0],[1,1],[2,1]], [[1,0],[2,0],[1,1],[2,1]], [[1,0],[2,0],[1,1],[2,1]], [[1,0],[2,0],[1,1],[2,1]]] },
  T: { color: 'violet', cells: [[[1,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[2,1],[1,2]], [[0,1],[1,1],[2,1],[1,2]], [[1,0],[0,1],[1,1],[1,2]]] },
  L: { color: 'orange', cells: [[[2,0],[0,1],[1,1],[2,1]], [[1,0],[1,1],[1,2],[2,2]], [[0,1],[1,1],[2,1],[0,2]], [[0,0],[1,0],[1,1],[1,2]]] },
  J: { color: 'blue', cells: [[[0,0],[0,1],[1,1],[2,1]], [[1,0],[2,0],[1,1],[1,2]], [[0,1],[1,1],[2,1],[2,2]], [[1,0],[1,1],[0,2],[1,2]]] },
  S: { color: 'green', cells: [[[1,0],[2,0],[0,1],[1,1]], [[1,0],[1,1],[2,1],[2,2]], [[1,1],[2,1],[0,2],[1,2]], [[0,0],[0,1],[1,1],[1,2]]] },
  Z: { color: 'rose', cells: [[[0,0],[1,0],[1,1],[2,1]], [[2,0],[1,1],[2,1],[1,2]], [[0,1],[1,1],[1,2],[2,2]], [[1,0],[0,1],[1,1],[0,2]]] },
};

const PIECE_KEYS = Object.keys(PIECES);

const MESSAGES = [
  'Tamay, ışığın bayağı güçlü ✨',
  'Bugün de oyunun yıldızı sensin 🌟',
  'Tamay, zekân ve enerjin şahane 🚀',
  'Harikasın Tamay, devam et! 🔥',
  'Tamay, 16 yaşına giderken efsane mod açıldı 👑',
  'Bir hamle daha, bir başarı daha 🌈',
  'Senin modun: zarif ama çok güçlü ⚡',
  'Tamay, ritmi sen kuruyorsun 🎧',
  'Bu oyun senden stil öğreniyor 💫',
];

const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const randomPiece = () => ({
  type: PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)],
  rotation: 0,
  x: 3,
  y: 0,
});

const getCells = (piece) => PIECES[piece.type].cells[piece.rotation % 4];

const collision = (board, piece, moveX = 0, moveY = 0, rotateTo = piece.rotation) => {
  const cells = PIECES[piece.type].cells[rotateTo % 4];
  return cells.some(([dx, dy]) => {
    const x = piece.x + dx + moveX;
    const y = piece.y + dy + moveY;
    if (x < 0 || x >= COLS || y >= ROWS) return true;
    if (y < 0) return false;
    return Boolean(board[y][x]);
  });
};

const mergePiece = (board, piece) => {
  const merged = board.map((row) => [...row]);
  for (const [dx, dy] of getCells(piece)) {
    const x = piece.x + dx;
    const y = piece.y + dy;
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
      merged[y][x] = { color: PIECES[piece.type].color };
    }
  }
  return merged;
};

const clearLines = (board) => {
  const kept = board.filter((row) => row.some((cell) => cell === null));
  const cleared = ROWS - kept.length;
  while (kept.length < ROWS) kept.unshift(Array(COLS).fill(null));
  return { board: kept, cleared };
};

const scoreFor = (count) => {
  if (count === 1) return 100;
  if (count === 2) return 250;
  if (count === 3) return 450;
  if (count >= 4) return 800;
  return 0;
};

function playClearSound(lineCount) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  if (!window.__tamyrisAudioCtx) {
    window.__tamyrisAudioCtx = new AudioCtx();
  }

  const ctx = window.__tamyrisAudioCtx;
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;
  const notes = lineCount >= 4 ? [440, 660, 880, 990] : [392, 523, 659];

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = index % 2 === 0 ? 'triangle' : 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + index * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.14, now + index * 0.05 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.05 + 0.20);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + index * 0.05);
    osc.stop(now + index * 0.05 + 0.22);
  });
}

function App() {
  const [board, setBoard] = useState(emptyBoard);
  const [piece, setPiece] = useState(randomPiece);
  const [nextPiece, setNextPiece] = useState(randomPiece);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [bursts, setBursts] = useState([]);

  const touchStartRef = useRef(null);
  const rafRef = useRef(null);
  const lastTickRef = useRef(0);

  const speed = Math.max(140, 720 - (level - 1) * 55);

  const spawnBurst = useCallback((cleared) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const text = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    const finalText = cleared >= 4 ? `TAMAY TETRIS! ${text}` : text;

    setBursts((prev) => [
      ...prev,
      {
        id,
        text: finalText,
        style: {
          left: `${18 + Math.random() * 50}%`,
          top: `${20 + Math.random() * 55}%`,
        }
      }
    ]);

    window.setTimeout(() => {
      setBursts((prev) => prev.filter((item) => item.id !== id));
    }, 2200);
  }, []);

  const resetGame = useCallback(() => {
    setBoard(emptyBoard());
    setPiece(randomPiece());
    setNextPiece(randomPiece());
    setScore(0);
    setLines(0);
    setLevel(1);
    setCombo(0);
    setRunning(true);
    setGameOver(false);
    setBursts([]);
    lastTickRef.current = 0;
  }, []);

  const lockCurrentPiece = useCallback((currentBoard, currentPiece) => {
    const merged = mergePiece(currentBoard, currentPiece);
    const result = clearLines(merged);

    if (result.cleared > 0) {
      playClearSound(result.cleared);
      spawnBurst(result.cleared);
      setCombo((prev) => prev + 1);
      setScore((prev) => prev + scoreFor(result.cleared) + combo * 25);
      setLines((prev) => {
        const total = prev + result.cleared;
        setLevel(Math.floor(total / 8) + 1);
        return total;
      });
    } else {
      setCombo(0);
    }

    const incoming = nextPiece;
    const preparedNext = randomPiece();

    if (collision(result.board, incoming)) {
      setBoard(result.board);
      setGameOver(true);
      setRunning(false);
      return;
    }

    setBoard(result.board);
    setPiece(incoming);
    setNextPiece(preparedNext);
  }, [combo, nextPiece, spawnBurst]);

  const movePiece = useCallback((dir) => {
    if (!running || gameOver) return;
    setPiece((prev) => collision(board, prev, dir, 0) ? prev : { ...prev, x: prev.x + dir });
  }, [board, running, gameOver]);

  const rotatePiece = useCallback(() => {
    if (!running || gameOver) return;
    setPiece((prev) => {
      const nextRotation = (prev.rotation + 1) % 4;
      if (!collision(board, prev, 0, 0, nextRotation)) return { ...prev, rotation: nextRotation };
      if (!collision(board, prev, -1, 0, nextRotation)) return { ...prev, x: prev.x - 1, rotation: nextRotation };
      if (!collision(board, prev, 1, 0, nextRotation)) return { ...prev, x: prev.x + 1, rotation: nextRotation };
      return prev;
    });
  }, [board, running, gameOver]);

  const softDrop = useCallback(() => {
    if (!running || gameOver) return;
    setPiece((prev) => {
      if (!collision(board, prev, 0, 1)) return { ...prev, y: prev.y + 1 };
      lockCurrentPiece(board, prev);
      return prev;
    });
  }, [board, running, gameOver, lockCurrentPiece]);

  const hardDrop = useCallback(() => {
    if (!running || gameOver) return;
    setPiece((prev) => {
      let y = prev.y;
      while (!collision(board, prev, 0, y - prev.y + 1)) {
        y += 1;
      }
      const dropped = { ...prev, y };
      lockCurrentPiece(board, dropped);
      return dropped;
    });
  }, [board, running, gameOver, lockCurrentPiece]);

  const ghostPiece = useMemo(() => {
    let y = piece.y;
    while (!collision(board, piece, 0, y - piece.y + 1)) {
      y += 1;
    }
    return { ...piece, y };
  }, [board, piece]);

  const visibleBoard = useMemo(() => {
    const view = board.map((row) => [...row]);

    for (const [dx, dy] of getCells(ghostPiece)) {
      const x = ghostPiece.x + dx;
      const y = ghostPiece.y + dy;
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS && !view[y][x]) {
        view[y][x] = { color: PIECES[ghostPiece.type].color, ghost: true };
      }
    }

    for (const [dx, dy] of getCells(piece)) {
      const x = piece.x + dx;
      const y = piece.y + dy;
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
        view[y][x] = { color: PIECES[piece.type].color };
      }
    }

    return view;
  }, [board, piece, ghostPiece]);

  const nextCells = PIECES[nextPiece.type].cells[0];

  useEffect(() => {
    const loop = (time) => {
      if (running && !gameOver) {
        if (!lastTickRef.current) lastTickRef.current = time;
        if (time - lastTickRef.current >= speed) {
          setPiece((prev) => {
            if (!collision(board, prev, 0, 1)) return { ...prev, y: prev.y + 1 };
            lockCurrentPiece(board, prev);
            return prev;
          });
          lastTickRef.current = time;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [board, running, gameOver, speed, lockCurrentPiece]);

  useEffect(() => {
    const onKey = (event) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) {
        event.preventDefault();
      }
      if (event.key === 'ArrowLeft') movePiece(-1);
      if (event.key === 'ArrowRight') movePiece(1);
      if (event.key === 'ArrowUp') rotatePiece();
      if (event.key === 'ArrowDown') softDrop();
      if (event.key === ' ') hardDrop();
      if (event.key.toLowerCase() === 'p') setRunning((prev) => !prev);
    };
    window.addEventListener('keydown', onKey, { passive: false });
    return () => window.removeEventListener('keydown', onKey);
  }, [movePiece, rotatePiece, softDrop, hardDrop]);

  const onTouchStart = (event) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event) => {
    if (!touchStartRef.current) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < 12 && absY < 12) rotatePiece();
    else if (absX > absY) dx > 0 ? movePiece(1) : movePiece(-1);
    else dy > 0 ? hardDrop() : rotatePiece();

    touchStartRef.current = null;
  };

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <div className="brand-label">Tamyris Edition</div>
          <h1 className="brand-title">Glow Tetris</h1>
        </div>

        <div className="actions">
          <button className="glass-btn" onClick={() => setRunning((prev) => !prev)}>
            {running ? 'Duraklat' : 'Başlat'}
          </button>
          <button className="glass-btn" onClick={resetGame}>
            Yeniden Başlat
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="panel">
          <div className="tipbar">
            <span>Dokun, kaydır, yönlendir.</span>
            <span className="badge">Mobil / Tablet uyumlu</span>
          </div>

          <div
            className="board-wrap"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="board"
              style={{
                gridTemplateColumns: `repeat(${COLS}, ${BLOCK_SIZE}px)`,
                width: COLS * BLOCK_SIZE + (COLS - 1) * 4,
                height: ROWS * BLOCK_SIZE + (ROWS - 1) * 4
              }}
            >
              {visibleBoard.flatMap((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`cell ${cell ? `block ${cell.color}` : ''} ${cell?.ghost ? 'ghost' : ''}`}
                  />
                ))
              )}
            </div>

            {bursts.map((item) => (
              <div key={item.id} className="burst" style={item.style}>
                {item.text}
              </div>
            ))}

            {!running && !gameOver && (
              <div className="overlay">
                <div className="overlay-card">
                  <div className="brand-label">For Tamay ❤️</div>
                  <h2>Tamyris Tetris</h2>
                  <p>Başlat düğmesine bas ve neon blokları dans ettir.</p>
                  <button className="start-btn" onClick={() => setRunning(true)}>
                    Oyunu Başlat
                  </button>
                </div>
              </div>
            )}

            {gameOver && (
              <div className="overlay">
                <div className="overlay-card">
                  <div className="brand-label">Oyun Bitti</div>
                  <h2>Tekrar dene ✨</h2>
                  <p>Tamay tekrar oynarsa rekor gelir. Bayağı gelir.</p>
                  <button className="start-btn" onClick={resetGame}>
                    Yeniden Başlat
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mobile-controls">
            <button className="ctrl" onClick={() => movePiece(-1)}>◀</button>
            <button className="ctrl" onClick={rotatePiece}>⟳</button>
            <button className="ctrl" onClick={() => movePiece(1)}>▶</button>
            <button className="ctrl" onClick={softDrop}>▼</button>
            <button className="ctrl" onClick={hardDrop}>⤓</button>
            <button className="ctrl" onClick={() => setRunning((prev) => !prev)}>{running ? 'Ⅱ' : '▶'}</button>
          </div>
        </section>

        <aside className="sidebar">
          <section className="panel">
            <div className="stats">
              <div className="stat c1">
                <small>Skor</small>
                <strong>{score}</strong>
              </div>
              <div className="stat c2">
                <small>Satır</small>
                <strong>{lines}</strong>
              </div>
              <div className="stat c3">
                <small>Level</small>
                <strong>{level}</strong>
              </div>
            </div>
          </section>

          <section className="panel">
            <h3 className="section-title">Sıradaki Tuğla</h3>
            <div className="preview-grid">
              {Array.from({ length: 16 }).map((_, idx) => {
                const x = idx % 4;
                const y = Math.floor(idx / 4);
                const active = nextCells.some(([cx, cy]) => cx === x && cy === y);
                return (
                  <div key={idx} className={`preview-cell ${active ? `block ${PIECES[nextPiece.type].color}` : ''}`} />
                );
              })}
            </div>
          </section>

          <section className="panel hero-card">
            <div className="brand-label">Tamay Boost</div>
            <h3 className="section-title">Her satır temizliğinde motive edici mesaj patlaması</h3>
            <p className="muted">
              4 satır silersen özel “TAMAY TETRIS” mesajı çıkar. Combo arttıkça skor da şişer.
            </p>
            <p className="muted"><strong>Aktif combo:</strong> x{combo}</p>
          </section>

          <section className="panel">
            <h3 className="section-title">Kontroller</h3>
            <div className="muted">
              <div>• Klavye: ← → ↑ ↓ ve Space</div>
              <div>• Mobil: dokun dönsün, kaydır hareket etsin</div>
              <div>• Aşağı kaydır: sert düşüş</div>
              <div>• P tuşu: duraklat</div>
            </div>
          </section>

          <section className="panel">
            <h3 className="section-title">Dokunmatik Panel</h3>
            <div className="controls">
              <button className="ctrl" onClick={() => movePiece(-1)}>◀</button>
              <button className="ctrl" onClick={rotatePiece}>⟳</button>
              <button className="ctrl" onClick={() => movePiece(1)}>▶</button>
              <button className="ctrl" onClick={softDrop}>▼</button>
              <button className="ctrl wide" onClick={hardDrop}>⤓</button>
              <button className="ctrl" onClick={() => setRunning((prev) => !prev)}>{running ? 'Ⅱ' : '▶'}</button>
            </div>
          </section>
        </aside>
      </main>

      <footer className="footer">CaĞnım Kızıma :)</footer>
    </div>
  );
}

export default App;
