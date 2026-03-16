import React from 'react';
import GameBoard from './components/GameBoard';
import GlassButton from './components/GlassButton';
import MobileControls from './components/MobileControls';
import NextPiecePreview from './components/NextPiecePreview';
import ScorePanel from './components/ScorePanel';
import { useTetrisGame } from './hooks/useTetrisGame';

export default function App() {
  const {
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
  } = useTetrisGame();

  return (
    <div className="min-h-screen w-full overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_bottom,_rgba(244,114,182,0.18),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#020617_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-3 pb-5 pt-4 sm:px-5">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Tamay Edition</div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Glow Tetris</h1>
          </div>

          <div className="flex gap-2">
            <GlassButton onClick={() => setIsRunning((prev) => !prev)}>
              {isRunning ? 'Duraklat' : 'Başlat'}
            </GlassButton>
            <GlassButton onClick={resetGame}>Yeniden Başlat</GlassButton>
          </div>
        </header>

        <main className="grid flex-1 gap-4 lg:grid-cols-[1.2fr_360px]">
          <div>
            <GameBoard
              visibleBoard={visibleBoard}
              messageBursts={messageBursts}
              gameOver={gameOver}
              onRestart={resetGame}
              onTouchStart={startTouch}
              onTouchEnd={endTouch}
            />

            <div className="mt-4 sm:hidden">
              <MobileControls
                moveLeft={() => movePiece(-1)}
                moveRight={() => movePiece(1)}
                rotate={rotatePiece}
                softDrop={softDrop}
                hardDrop={hardDrop}
                togglePause={() => setIsRunning((prev) => !prev)}
                isRunning={isRunning}
                mobileOnly
              />
            </div>
          </div>

          <aside className="grid gap-4 content-start">
            <ScorePanel
              score={score}
              lines={lines}
              level={level}
              highScore={highScore}
              combo={combo}
            />

            <div className="rounded-[30px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <NextPiecePreview nextPiece={nextPiece} />

                <div className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <h3 className="mb-3 font-bold text-white">Kontroller</h3>
                  <div className="space-y-2">
                    <p>• Klavye: ← → ↑ ↓ ve Space</p>
                    <p>• Dokunmatik: Sağa/sola kaydır, dokun dönsün, aşağı kaydır sert düşsün</p>
                    <p>• Mobil butonlar alt bölümde</p>
                    <p>• P tuşu ile duraklat</p>
                  </div>
                </div>
              </div>
            </div>

            <MobileControls
              moveLeft={() => movePiece(-1)}
              moveRight={() => movePiece(1)}
              rotate={rotatePiece}
              softDrop={softDrop}
              hardDrop={hardDrop}
              togglePause={() => setIsRunning((prev) => !prev)}
              isRunning={isRunning}
            />
          </aside>
        </main>

        <footer className="mt-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-slate-300 backdrop-blur-xl">
          CaĞnım Kızıma :)
        </footer>
      </div>
    </div>
  );
}
