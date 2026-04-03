'use client';

import { useEffect, useState } from 'react';
import { useFinnhub } from '@/hooks/useFinnhub';

const TICKER_SYMBOLS = [
  { symbol: 'SPY', label: 'SPY' },
  { symbol: 'QQQ', label: 'QQQ' },
  { symbol: 'DIA', label: 'DIA' },
  { symbol: 'BINANCE:BTCUSDT', label: 'BTC', display: 'BTC' },
  { symbol: 'BINANCE:ETHUSDT', label: 'ETH', display: 'ETH' },
  { symbol: 'OANDA:XAU_USD', label: 'GOLD', display: 'GOLD' },
  { symbol: 'IC MARKETS:BCOUSD', label: 'OIL', display: 'OIL' },
  { symbol: 'OANDA:US30_USD', label: 'DXY', display: 'DXY' },
];

export default function LiveTicker() {
  const { prices, isConnected } = useFinnhub(TICKER_SYMBOLS.map(s => s.symbol));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-black border-b border-gray-800 py-2 overflow-hidden">
        <div className="flex items-center gap-8 px-4">
          <span className="text-xs text-gray-500 font-mono">LOADING MARKET DATA...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border-b border-gray-800 py-2 overflow-hidden relative">
      {/* Ticker content */}
      <div className="ticker-wrapper">
        <div className="ticker-content flex items-center gap-8 px-4">
          {TICKER_SYMBOLS.map((item) => {
            const price = prices[item.symbol];
            const change = price?.change || 0;
            const changePercent = price?.changePercent || 0;
            const currentPrice = price?.price || 0;

            return (
              <div key={item.symbol} className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xs font-bold text-white font-mono">
                  {item.display || item.label}
                </span>
                <span className="text-xs font-mono text-gray-300">
                  {currentPrice > 0 ? currentPrice.toFixed(2) : '---'}
                </span>
                <span
                  className={`text-xs font-mono ${
                    change > 0
                      ? 'text-[#00FF41]'
                      : change < 0
                      ? 'text-red-500'
                      : 'text-gray-500'
                  }`}
                >
                  {change > 0 ? '+' : ''}
                  {change !== 0 ? changePercent.toFixed(2) : '0.00'}%
                </span>
              </div>
            );
          })}

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-[#00FF41]' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-gray-500 font-mono">
              {isConnected ? 'LIVE' : 'RECONNECTING...'}
            </span>
          </div>

          {/* Delayed notice */}
          <span className="text-xs text-gray-600 font-mono">
            DELAYED 15MIN
          </span>
        </div>
      </div>

      <style jsx>{`
        .ticker-wrapper {
          overflow: hidden;
        }
        .ticker-content {
          display: flex;
          animation: scroll 40s linear infinite;
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .ticker-content:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
