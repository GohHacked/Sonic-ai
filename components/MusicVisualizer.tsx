import React, { useEffect, useState } from 'react';

interface MusicVisualizerProps {
  isPlaying: boolean;
  color?: string;
}

export const MusicVisualizer: React.FC<MusicVisualizerProps> = ({ isPlaying, color = 'bg-purple-500' }) => {
  // Simulate bars for visualization since we don't have WebAudio API analyzer connected to the simple audio element here
  // Using CSS animation for "fake" but cool looking visualization
  const barCount = 20;
  
  return (
    <div className="flex items-end justify-center h-24 gap-1 w-full max-w-md mx-auto overflow-hidden">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={`w-2 rounded-t-sm transition-all duration-75 ${color} ${isPlaying ? 'animate-music-bar' : 'h-1 opacity-30'}`}
          style={{
            height: isPlaying ? `${Math.random() * 100}%` : '4px',
            animationDelay: `-${Math.random()}s`,
            animationDuration: `${0.4 + Math.random() * 0.4}s`
          }}
        />
      ))}
      <style>{`
        @keyframes music-bar {
          0% { height: 10%; opacity: 0.5; }
          50% { height: 90%; opacity: 1; }
          100% { height: 10%; opacity: 0.5; }
        }
        .animate-music-bar {
          animation-name: music-bar;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }
      `}</style>
    </div>
  );
};
