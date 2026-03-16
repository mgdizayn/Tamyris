import React from 'react';
import ControlButton from './ControlButton';

export default function MobileControls({ moveLeft, moveRight, rotate, softDrop, hardDrop, togglePause, isRunning, mobileOnly = false }) {
  return (
    <div className={`${mobileOnly ? 'sm:hidden' : 'hidden sm:block'} rounded-[30px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl`}>
      {!mobileOnly && (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">Dokunmatik Panel</h3>
          <span className="text-xs text-slate-400">Phone / Tablet</span>
        </div>
      )}
      <div className={`grid grid-cols-3 gap-3 justify-items-center ${mobileOnly ? 'items-center' : ''}`}>
        <ControlButton label="◀" onClick={moveLeft} />
        <ControlButton label="⟳" onClick={rotate} />
        <ControlButton label="▶" onClick={moveRight} />
        <ControlButton label="▼" onClick={softDrop} />
        <ControlButton label="⤓" onClick={hardDrop} wide />
        <ControlButton label={isRunning ? 'Ⅱ' : '▶'} onClick={togglePause} />
      </div>
    </div>
  );
}
