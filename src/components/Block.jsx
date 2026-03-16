import React from 'react';

export default function Block({ cell, ghost = false }) {
  if (!cell) {
    return <div className="rounded-xl border border-white/5 bg-white/[0.03]" />;
  }

  const opacity = ghost ? 'opacity-30' : 'opacity-100';

  return (
    <div className={`relative rounded-xl border border-white/20 ${cell.color} ${cell.glow} ${opacity} shadow-lg`}>
      <div className="absolute inset-[2px] rounded-[10px] bg-white/20" />
      <div className="absolute left-[4px] top-[4px] h-2 w-2 rounded-full bg-white/60" />
    </div>
  );
}
