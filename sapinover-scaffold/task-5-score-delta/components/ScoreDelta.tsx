'use client';

import { useEffect, useRef, useState } from 'react';

type ScoreDeltaProps = {
  currentScore: number;
  previousScore: number;
  label: string;
  methodology: string;
  sparklineData: number[]; // Last 24 hours of data points
};

export default function ScoreDelta({
  currentScore,
  previousScore,
  label,
  methodology,
  sparklineData,
}: ScoreDeltaProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const delta = currentScore - previousScore;
  const deltaFormatted = delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
  const deltaColor = delta > 0 ? 'text-[#00FF41]' : delta < 0 ? 'text-red-500' : 'text-gray-500';
  const deltaIcon = delta > 0 ? '▲' : delta < 0 ? '▼' : '━';

  // Draw sparkline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || sparklineData.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 80;
    const height = 24;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate scaling
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;

    // Draw line
    ctx.strokeStyle = delta >= 0 ? '#00FF41' : '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    sparklineData.forEach((value, index) => {
      const x = (index / (sparklineData.length - 1)) * width;
      const y = height - ((value - min) / range) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw current point
    const lastX = width;
    const lastY = height - ((sparklineData[sparklineData.length - 1] - min) / range) * height;
    ctx.fillStyle = delta >= 0 ? '#00FF41' : '#ef4444';
    ctx.beginPath();
    ctx.arc(lastX, lastY, 2, 0, 2 * Math.PI);
    ctx.fill();
  }, [sparklineData, delta]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold font-mono">{currentScore.toFixed(1)}</span>
          <span className="text-xs text-gray-500">/ 10</span>
        </div>
        <div className={`flex items-center gap-1 ${deltaColor} font-mono text-sm`}>
          <span>{deltaIcon}</span>
          <span>{deltaFormatted}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">vs last session</span>
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button className="text-gray-500 hover:text-[#00FF41] transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900 border border-[#00FF41] rounded-lg p-3 text-xs text-gray-300 z-10 shadow-xl">
              <div className="font-bold text-white mb-1">{label} Methodology</div>
              {methodology}
            </div>
          )}
        </div>
      </div>

      {/* 24-hour sparkline */}
      <div className="flex items-center gap-2">
        <canvas
          ref={canvasRef}
          className="opacity-70"
          style={{ width: '80px', height: '24px' }}
        />
        <span className="text-xs text-gray-600 font-mono">24h</span>
      </div>

      {/* Previous score reference */}
      <div className="mt-2 text-xs text-gray-600 font-mono">
        Previous: {previousScore.toFixed(1)}
      </div>
    </div>
  );
}
