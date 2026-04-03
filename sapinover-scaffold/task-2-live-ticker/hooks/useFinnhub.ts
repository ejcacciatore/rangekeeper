'use client';

import { useEffect, useState, useRef } from 'react';

type PriceData = {
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
};

type PriceMap = Record<string, PriceData>;

export function useFinnhub(symbols: string[]) {
  const [prices, setPrices] = useState<PriceMap>({});
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef(1000); // Start at 1 second
  const previousPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

    if (!apiKey) {
      console.error('NEXT_PUBLIC_FINNHUB_API_KEY is not set');
      return;
    }

    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      const ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Finnhub] Connected');
        setIsConnected(true);
        reconnectDelayRef.current = 1000; // Reset delay on successful connection

        // Subscribe to all symbols
        symbols.forEach((symbol) => {
          ws.send(JSON.stringify({ type: 'subscribe', symbol }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'trade' && message.data) {
            message.data.forEach((trade: any) => {
              const symbol = trade.s;
              const price = trade.p;
              const previousPrice = previousPricesRef.current[symbol] || price;
              const change = price - previousPrice;
              const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;

              // Store current as previous for next calculation
              previousPricesRef.current[symbol] = price;

              setPrices((prev) => ({
                ...prev,
                [symbol]: {
                  price,
                  change,
                  changePercent,
                  timestamp: Date.now(),
                },
              }));
            });
          }
        } catch (error) {
          console.error('[Finnhub] Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[Finnhub] WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('[Finnhub] Disconnected');
        setIsConnected(false);

        // Exponential backoff reconnection
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`[Finnhub] Reconnecting in ${reconnectDelayRef.current}ms...`);
          connect();
          reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 32000); // Max 32 seconds
        }, reconnectDelayRef.current);
      };
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [symbols]);

  return { prices, isConnected };
}
