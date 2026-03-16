import React from 'react';

export default function GlassButton({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur active:scale-95 active:bg-white/20 ${className}`}
    >
      {children}
    </button>
  );
}
