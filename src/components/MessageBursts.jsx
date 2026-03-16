import React from 'react';

export default function MessageBursts({ messages }) {
  return messages.map((message) => (
    <div
      key={message.id}
      className="pointer-events-none absolute animate-[burst_2.2s_ease-out_forwards] rounded-full border border-white/20 bg-white/10 px-4 py-2 text-center text-sm font-bold text-white shadow-2xl backdrop-blur"
      style={message.style}
    >
      {message.text}
    </div>
  ));
}
