import React from 'react';
import { PIECES } from '../constants/pieces';

export default function NextPiecePreview({ nextPiece }) {
  const nextCells = PIECES[nextPiece.type].cells[0];

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">Sıradaki Tuğla</h3>
        <span className="text-xs text-slate-400">Preview</span>
      </div>
      <div className="grid w-[112px] grid-cols-4 gap-[4px]">
        {Array.from({ length: 16 }).map((_, index) => {
          const x = index % 4;
          const y = Math.floor(index / 4);
          const active = nextCells.some(([cx, cy]) => cx === x && cy === y);
          return (
            <div key={index} className="h-6 w-6 rounded-lg border border-white/5 bg-white/[0.03]">
              {active && <div className={`h-full w-full rounded-lg ${PIECES[nextPiece.type].color} shadow-lg`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
