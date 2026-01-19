'use client';

import { splitWordAtORP } from '@/lib/rsvp';

interface WordDisplayProps {
  /** The word to display */
  word: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Displays a single word with ORP (Optimal Recognition Point) highlighting.
 * The ORP character is highlighted in red and centered in the display.
 */
export function WordDisplay({ word, className = '' }: WordDisplayProps) {
  const { before, orp, after } = splitWordAtORP(word);

  return (
    <div className={`relative flex items-center justify-center h-32 select-none ${className}`}>
      {/* Top focus guide */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-300" />

      {/* Bottom focus guide */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-300" />

      {/* Center marker dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-red-500 rounded-full opacity-50" />

      {/* The word container - uses flex to position ORP at center */}
      <div className="flex items-center text-4xl md:text-5xl lg:text-6xl font-medium tracking-wide">
        {/* Before ORP - right-aligned to bring ORP to center */}
        <span className="text-right text-warm-gray min-w-0">{before}</span>

        {/* ORP character - this stays at center */}
        <span className="text-red-500 font-bold">{orp}</span>

        {/* After ORP - left-aligned */}
        <span className="text-left text-warm-gray min-w-0">{after}</span>
      </div>
    </div>
  );
}
