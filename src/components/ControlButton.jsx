import React from 'react';

export default function ControlButton({ label, onClick, wide = false }) {
  return (
    <button
      onClick={onClick}
      className={`select-none rounded-3xl border border-white/10 bg-gradient-to-b from-white/15 to-white/5 text-white shadow-xl backdrop-blur transition active:scale-95 ${wide ? 'px-6 py-4 min-w-[96px]' : 'w-16 h-16'}`}
    >
      <span className="text-lg font-bold">{label}</span>
    </button>
  );
}
