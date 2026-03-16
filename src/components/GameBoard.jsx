import React from 'react';
import { BLOCK, COLS, ROWS } from '../constants/pieces';
import Block from './Block';
import MessageBursts from './MessageBursts';

export default function GameBoard({ visibleBoard, messageBursts, gameOver, onRestart, onTouchStart, onTouchEnd }) {
  return (
    <section className="relative rounded-[32px] border border-white/10 bg-black/20 p-3 shadow-2xl backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-sm text-slate-200">
        <span>Dokun, kaydır, yönlendir.</span>
        <span className="rounded-full bg-fuchsia-500/15 px-3 py-1 text-fuchsia-200">Mobil / Tablet uyumlu</span>
      </div>

      <div
        className="relative mx-auto overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/90 p-2"
        style={{ maxWidth: COLS * BLOCK + 16 }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="grid gap-[4px]"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            width: COLS * BLOCK,
            height: ROWS * BLOCK,
          }}
        >
          {visibleBoard.flatMap((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <Block key={`${rowIndex}-${colIndex}`} cell={cell} ghost={!!cell?.ghost} />
            ))
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.04)_100%)] opacity-60" />
        <MessageBursts messages={messageBursts} />

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm">
            <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-6 text-center shadow-2xl">
              <div className="mb-2 text-xs uppercase tracking-[0.35em] text-rose-200">Oyun Bitti</div>
              <h2 className="text-3xl font-black">Tamay tekrar denerse rekor gelir.</h2>
              <p className="mt-2 text-sm text-slate-300">Bir tur daha ve ekran yine parlasın.</p>
              <button
                onClick={onRestart}
                className="mt-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 font-bold text-slate-950 shadow-xl active:scale-95"
              >
                Yeniden Başlat
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
