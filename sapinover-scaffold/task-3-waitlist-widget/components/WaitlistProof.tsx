'use client';

import { useEffect, useState } from 'react';

type RecentJoin = {
  role: string;
  location: string;
  timeAgo: string;
};

// Seed data for launch - replace with Supabase realtime when available
const SEED_JOINS: RecentJoin[] = [
  { role: 'Risk Manager', location: 'New York', timeAgo: '4 minutes ago' },
  { role: 'Portfolio Manager', location: 'Chicago', timeAgo: '12 minutes ago' },
  { role: 'Quantitative Trader', location: 'San Francisco', timeAgo: '18 minutes ago' },
  { role: 'Compliance Director', location: 'Boston', timeAgo: '31 minutes ago' },
  { role: 'Market Strategist', location: 'London', timeAgo: '45 minutes ago' },
  { role: 'Head of Trading', location: 'Singapore', timeAgo: '1 hour ago' },
  { role: 'Investment Analyst', location: 'Toronto', timeAgo: '1 hour ago' },
  { role: 'Hedge Fund Manager', location: 'Greenwich', timeAgo: '2 hours ago' },
];

export default function WaitlistProof() {
  const [count, setCount] = useState(0);
  const [currentJoinIndex, setCurrentJoinIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Animated count-up effect
  useEffect(() => {
    // TODO: Replace with actual Vercel KV or Supabase query
    const targetCount = 847; // Seed number for launch
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetCount / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setCount(targetCount);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, []);

  // Rotate through recent joins
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentJoinIndex((prev) => (prev + 1) % SEED_JOINS.length);
        setIsVisible(true);
      }, 300);
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const currentJoin = SEED_JOINS[currentJoinIndex];

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {/* Waitlist count */}
      <div className="text-center">
        <div className="text-5xl font-bold font-mono text-[#00FF41] mb-2">
          {count.toLocaleString()}
        </div>
        <p className="text-gray-400 text-lg">
          traders and institutions on the waitlist
        </p>
      </div>

      {/* Recent join ticker */}
      <div
        className={`bg-gray-900 border border-gray-800 rounded-lg px-6 py-3 min-w-[400px] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse" />
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-white">{currentJoin.role}</span> in{' '}
            <span className="text-[#00FF41]">{currentJoin.location}</span> joined{' '}
            <span className="text-gray-500">{currentJoin.timeAgo}</span>
          </p>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="flex items-center gap-6 text-xs text-gray-500 mt-2">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#00FF41]" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>SECURE</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#00FF41]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <span>NO SPAM</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#00FF41]" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <span>7-DAY FREE TRIAL</span>
        </div>
      </div>
    </div>
  );
}
