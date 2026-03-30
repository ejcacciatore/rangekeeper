'use client';

import Link from 'next/link';
import { useState } from 'react';

type BriefTeaserProps = {
  briefContent: string;
  date: string;
  session: string;
};

function extractFirstTwoSentences(content: string): { teaser: string; remaining: string } {
  // Match first two sentences (ending with . ! or ?)
  const sentenceRegex = /[^.!?]+[.!?]+/g;
  const sentences = content.match(sentenceRegex) || [];
  
  const teaser = sentences.slice(0, 2).join(' ').trim();
  const remaining = sentences.slice(2).join(' ').trim();
  
  return { teaser, remaining };
}

export default function BriefTeaser({ briefContent, date, session }: BriefTeaserProps) {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { teaser, remaining } = extractFirstTwoSentences(briefContent);

  return (
    <div className="relative">
      {/* Public teaser - first 2 sentences */}
      <div className="prose prose-invert max-w-none mb-6">
        <p className="text-lg leading-relaxed">{teaser}</p>
      </div>

      {/* Blurred remaining content */}
      <div className="relative">
        <div className="prose prose-invert max-w-none blur-sm select-none pointer-events-none">
          <p className="text-lg leading-relaxed">{remaining.slice(0, 200)}...</p>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />

        {/* Join CTA overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-black/80 backdrop-blur-md border border-[#00FF41]/30 rounded-lg p-8 max-w-md">
            <h3 className="text-2xl font-bold text-white mb-3">
              Continue Reading
            </h3>
            <p className="text-gray-400 mb-6">
              Join the waitlist to access full daily briefs, overnight ATS analytics, and real-time market intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-6 py-3 bg-[#00FF41] text-black font-bold rounded-lg hover:bg-[#00FF41]/90 transition-colors"
              >
                Join Waitlist
              </button>
              <Link
                href="/"
                className="px-6 py-3 border border-[#00FF41] text-[#00FF41] font-bold rounded-lg hover:bg-[#00FF41]/10 transition-colors flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              7-day free trial • No credit card required
            </p>
          </div>
        </div>
      </div>

      {/* Join modal (simplified - integrate with existing waitlist form) */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-[#00FF41] rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Join Waitlist</h2>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#00FF41] focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Company / Institution (optional)"
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#00FF41] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full px-6 py-3 bg-[#00FF41] text-black font-bold rounded-lg hover:bg-[#00FF41]/90 transition-colors"
              >
                Get Early Access
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
