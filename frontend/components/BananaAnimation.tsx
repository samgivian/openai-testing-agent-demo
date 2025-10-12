"use client";

import { cn } from "@/lib/utils";

interface BananaAnimationProps {
  className?: string;
}

export default function BananaAnimation({
  className,
}: BananaAnimationProps) {
  return (
    <div className={cn("banana-animation", className)} aria-hidden="true">
      <svg
        viewBox="0 0 240 200"
        xmlns="http://www.w3.org/2000/svg"
        className="banana-svg"
        focusable="false"
      >
        <defs>
          <linearGradient id="bananaBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff5b1" />
            <stop offset="45%" stopColor="#f8d750" />
            <stop offset="100%" stopColor="#e6a73c" />
          </linearGradient>
          <linearGradient id="bananaHighlight" x1="20%" y1="10%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#fffadc" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#ffe17b" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#ffd35f" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bananaShadow" x1="0%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#d18e2f" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#d18e2f" stopOpacity="0" />
          </linearGradient>
          <filter id="bananaGlow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#f0c53f" floodOpacity="0.35" />
          </filter>
        </defs>

        <g className="banana-sway" filter="url(#bananaGlow)">
          {/* Banana body */}
          <path
            d="M39 102c-9 22-13 43 14 68 46 44 120 44 162-9 19-24 30-54 23-75-7-20-26-26-47-21-12 3-27 11-44 28-19 18-38 27-58 24-21-3-36-12-50-15z"
            fill="url(#bananaBody)"
            stroke="#c37a2f"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Inner shadow */}
          <path
            d="M46 106c-6 16-9 34 12 54 40 38 104 37 140-7 16-19 26-43 21-60-4-12-16-18-32-15-10 2-23 9-38 23-17 15-34 23-51 21-18-3-32-10-52-16z"
            fill="url(#bananaShadow)"
          />
          {/* Highlight */}
          <path
            d="M60 120c10 7 32 16 57 11 18-3 36-13 56-38 9-11 17-17 23-19 4-1 8 0 10 2 5 5 6 15 2 30-2 7-6 15-10 22-35 14-84 21-138-8z"
            fill="url(#bananaHighlight)"
          />
          {/* Stem */}
          <path
            d="M211 67c2-10 2-20-3-25-4-4-13-3-22 2 9 6 18 14 25 23z"
            fill="#6f4a1f"
          />
          {/* Tip */}
          <path
            d="M44 115c-8-2-13-7-16-11-1 7 0 15 5 21 5 6 12 9 21 11-5-7-8-14-10-21z"
            fill="#6f4a1f"
          />
        </g>
      </svg>
    </div>
  );
}
