import React from 'react';

export default function ScorePanel({ score, lines, level, highScore, combo }) {
  return (
    <>
      <div className="rounded-[30px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="mb-4 grid grid-cols-2 gap-3 text-center sm:grid-cols-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-cyan-400/10 p-3">
            <div className="text-xs uppercase tracking-widest text-cyan-200/70">Skor</div>
            <div className="mt-1 text-2xl font-black">{score}</div>
          </div>
          <div className="rounded-2xl bg-fuchsia-400/10 p-3">
            <div className="text-xs uppercase tracking-widest text-fuchsia-200/70">Satır</div>
            <div className="mt-1 text-2xl font-black">{lines}</div>
          </div>
          <div className="rounded-2xl bg-emerald-400/10 p-3">
            <div className="text-xs uppercase tracking-widest text-emerald-200/70">Level</div>
            <div className="mt-1 text-2xl font-black">{level}</div>
          </div>
          <div className="rounded-2xl bg-yellow-300/10 p-3">
            <div className="text-xs uppercase tracking-widest text-yellow-100/70">Rekor</div>
            <div className="mt-1 text-2xl font-black">{highScore}</div>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-fuchsia-500/15 to-cyan-400/10 p-4 backdrop-blur-xl">
          <div className="mb-2 text-xs uppercase tracking-[0.35em] text-fuchsia-200/70">Tamay Boost</div>
          <h3 className="text-xl font-black">Her satır temizliğinde motive edici mesaj patlaması</h3>
          <p className="mt-2 text-sm text-slate-300">
            Combo arttıkça skor yükselir. 4 satır silersen özel “TAMAY TETRIS” mesajı çıkar.
          </p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-cyan-100">
            Aktif combo: <span className="font-black">x{combo}</span>
          </div>
        </div>
      </div>
    </>
  );
}
