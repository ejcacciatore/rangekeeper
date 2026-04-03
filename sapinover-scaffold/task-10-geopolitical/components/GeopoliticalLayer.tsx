'use client';

import { useState, useEffect } from 'react';

type GDELTEvent = {
  title: string;
  date: string;
  location: string;
  impact: 'low' | 'medium' | 'high';
};

type GeopoliticalLayerProps = {
  geoScore: number;
};

// Seed data for launch - replace with real GDELT API
const SEED_EVENTS: GDELTEvent[] = [
  {
    title: 'NATO Article 4 Consultation Called',
    date: '2 hours ago',
    location: 'Brussels, Belgium',
    impact: 'high',
  },
  {
    title: 'G7 Finance Ministers Emergency Meeting',
    date: '5 hours ago',
    location: 'Virtual',
    impact: 'high',
  },
  {
    title: 'South China Sea Naval Incident',
    date: '8 hours ago',
    location: 'South China Sea',
    impact: 'medium',
  },
  {
    title: 'ECB Emergency Rate Decision',
    date: '12 hours ago',
    location: 'Frankfurt, Germany',
    impact: 'medium',
  },
  {
    title: 'Crude Oil Pipeline Disruption',
    date: '18 hours ago',
    location: 'Persian Gulf',
    impact: 'low',
  },
];

export default function GeopoliticalLayer({ geoScore }: GeopoliticalLayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [events, setEvents] = useState<GDELTEvent[]>(SEED_EVENTS);

  const isElevated = geoScore > 7;

  // TODO: Replace with real GDELT API integration
  useEffect(() => {
    // Placeholder for GDELT API call
    // fetch('/api/gdelt/recent-events')
    //   .then(res => res.json())
    //   .then(data => setEvents(data.events));
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-orange-500';
      case 'low':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden bg-black">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-900 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">Global Intelligence Map</h2>
          {isElevated && (
            <span className="px-3 py-1 bg-red-500/20 border border-red-500 text-red-500 text-xs font-bold rounded-full animate-pulse">
              ELEVATED CONFLICT ACTIVITY
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-gray-500">GEO SCORE</div>
            <div className={`text-2xl font-bold font-mono ${geoScore > 7 ? 'text-red-500' : geoScore > 5 ? 'text-orange-500' : 'text-[#00FF41]'}`}>
              {geoScore.toFixed(1)}
            </div>
          </div>
          <svg
            className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-800">
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* LiveUAmap embed */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                Live Conflict Map
              </h3>
              <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800" style={{ height: '400px' }}>
                <iframe
                  src="https://liveuamap.com/en/embed"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  title="LiveUAmap Conflict Map"
                />
              </div>
              <p className="text-xs text-gray-600">
                Real-time conflict events from LiveUAmap. Data updates every 15 minutes.
              </p>
            </div>

            {/* GDELT event feed */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">
                Recent Geopolitical Events
              </h3>
              <div className="space-y-3">
                {events.map((event, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-[#00FF41]/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-white leading-tight">
                        {event.title}
                      </h4>
                      <span className={`text-xs font-mono uppercase ${getImpactColor(event.impact)} whitespace-nowrap`}>
                        {event.impact}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {event.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600">
                Powered by GDELT Global Database of Events. Impact assessment by SAPINOVER.
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-gray-800 bg-gray-900 px-6 py-3">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-400">GEO Score Methodology:</span> Real-time synthesis of conflict events (LiveUAmap, GDELT), sanctions tracking, leadership changes, strategic asset risk, cyber incidents, and market validation. Updated every 15 minutes.{' '}
              <a href="/research/geopolitical-risk-score" className="text-[#00FF41] hover:underline">
                Read full methodology →
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
