import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  to?: string;
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  asLink = true,
  to = '/',
  showTagline = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Liquid Glass Isotipo Icon */}
      <div
        className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-br from-orange-500/20 via-zinc-900 to-amber-500/10 border border-orange-500/30 flex items-center justify-center p-1.5 shadow-md shadow-orange-500/10 group-hover:border-orange-500/60 group-hover:scale-105 transition-all duration-300`}
      >
        {/* Subtle refractive inner glass reflection */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        {/* Vector SVG Emblem: Interconnected Innovation Nodes */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-orange-400 group-hover:text-orange-300 transition-colors"
        >
          <path
            d="M12 2L3 7V17L12 22L21 17V7L12 2Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />
          <path
            d="M12 6L7 9V15L12 18L17 15V9L12 6Z"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.25" fill="#EA580C" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <span className={`font-display font-extrabold tracking-wider text-white ${textSizes[size]}`}>
          BOWOL<span className="text-orange-500 font-black animate-pulse">.</span>
        </span>
        {showTagline && (
          <span className="text-[10px] tracking-widest uppercase font-medium text-zinc-500 -mt-0.5">
            AI Innovation OS
          </span>
        )}
      </div>
    </div>
  );

  if (asLink) {
    return (
      <Link to={to} className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};
