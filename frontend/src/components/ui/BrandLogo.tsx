import React from 'react';
import { Link } from 'react-router-dom';
import { BowolVectorLogo } from './BowolVectorLogo';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  asLink?: boolean;
  to?: string;
  showTagline?: boolean;
  variant?: 'combined' | 'emblem' | 'full' | 'wordmark' | 'vector';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  asLink = true,
  to = '/',
  showTagline = false,
  variant = 'combined',
  className = '',
}) => {
  // Sizing definitions
  const emblemSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const fullSizes = {
    sm: 'h-7 w-auto',
    md: 'h-9 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto',
  };

  const wordmarkSizes = {
    sm: 'h-4 w-auto',
    md: 'h-5 w-auto',
    lg: 'h-7 w-auto',
    xl: 'h-9 w-auto',
  };

  const textSizes = {
    sm: 'text-base tracking-wide',
    md: 'text-lg tracking-wider',
    lg: 'text-2xl tracking-widest',
    xl: 'text-3xl tracking-widest',
  };

  let logoInner = null;

  if (variant === 'vector') {
    logoInner = <BowolVectorLogo size={size} />;
  } else if (variant === 'full') {
    logoInner = (
      <div className={`relative flex items-center justify-center ${fullSizes[size]}`}>
        {/* Light theme official logo (black wings/letters + orange W) */}
        <img
          src="/logo/bowol_full_light.png"
          alt="BOWOL"
          className="h-full w-auto object-contain dark:hidden select-none transition-transform duration-300 group-hover:scale-105"
          loading="eager"
        />
        {/* Dark theme official logo (white wings/letters + orange W) */}
        <img
          src="/logo/bowol_full_dark.png"
          alt="BOWOL"
          className="h-full w-auto object-contain hidden dark:block select-none transition-transform duration-300 group-hover:scale-105"
          loading="eager"
        />
      </div>
    );
  } else if (variant === 'emblem') {
    logoInner = (
      <div className={`relative flex items-center justify-center ${emblemSizes[size]}`}>
        <img
          src="/logo/bowol_emblem_light.png"
          alt="BOWOL"
          className="w-full h-full object-contain dark:hidden select-none transition-transform duration-300 group-hover:scale-105"
          loading="eager"
        />
        <img
          src="/logo/bowol_emblem_dark.png"
          alt="BOWOL"
          className="w-full h-full object-contain hidden dark:block select-none transition-transform duration-300 group-hover:scale-105"
          loading="eager"
        />
      </div>
    );
  } else if (variant === 'wordmark') {
    logoInner = (
      <div className={`relative flex items-center justify-center ${wordmarkSizes[size]}`}>
        <img
          src="/logo/bowol_wordmark_light.png"
          alt="BOWOL"
          className="h-full w-auto object-contain dark:hidden select-none transition-transform duration-300 group-hover:scale-105"
          loading="eager"
        />
        <img
          src="/logo/bowol_wordmark_dark.png"
          alt="BOWOL"
          className="h-full w-auto object-contain hidden dark:block select-none transition-transform duration-300 group-hover:scale-105"
          loading="eager"
        />
      </div>
    );
  } else {
    // Default 'combined': Official rocket emblem asset + vector typography with orange W signature
    logoInner = (
      <div className="flex items-center gap-2.5">
        {/* Authentic Rocket Emblem from official logo */}
        <div
          className={`relative ${emblemSizes[size]} flex items-center justify-center rounded-xl p-0.5 transition-all duration-300 group-hover:scale-105`}
        >
          <img
            src="/logo/bowol_emblem_light.png"
            alt="BOWOL Emblem"
            className="w-full h-full object-contain dark:hidden select-none drop-shadow-sm"
            loading="eager"
          />
          <img
            src="/logo/bowol_emblem_dark.png"
            alt="BOWOL Emblem"
            className="w-full h-full object-contain hidden dark:block select-none drop-shadow-[0_0_8px_rgba(249,115,22,0.25)]"
            loading="eager"
          />
        </div>

        {/* Geometric Wordmark with official orange W signature */}
        <div className="flex flex-col leading-none">
          <span className={`font-display font-extrabold text-zinc-900 dark:text-white transition-colors ${textSizes[size]}`}>
            BO<span className="text-orange-500 dark:text-orange-400">W</span>OL
            <span className="text-orange-500 dark:text-orange-400 animate-pulse">.</span>
          </span>
          {showTagline && (
            <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">
              AI Innovation OS
            </span>
          )}
        </div>
      </div>
    );
  }

  const content = (
    <div className={`inline-flex items-center group select-none ${className}`}>
      {logoInner}
    </div>
  );

  if (asLink) {
    return (
      <Link to={to} className="inline-flex items-center focus:outline-none focus:ring-2 focus:ring-orange-500/40 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
};
