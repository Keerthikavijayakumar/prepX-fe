import React from 'react';

interface LogoProps {
  variant?: 'symbol' | 'lockup-light' | 'lockup-dark' | 'app-icon';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  className?: string;
  alt?: string;
}

const sizeMap = {
  xs: 'h-4',
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-12',
  xl: 'h-16',
  xxl: 'h-24',
};

// For symbol variant (square) - use fixed dimensions
const symbolSizeMap = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  xxl: 'w-24 h-24',
};

const LOGO_SOURCES = {
  'symbol': '/logos/PrepX-symbol.svg',
  'lockup-light': '/logos/PrepX-lockup-light.svg',
  'lockup-dark': '/logos/PrepX-lockup-dark.svg',
  'app-icon': '/logos/PrepX-app-icon.svg',
};

/**
 * PrepX Logo Component
 * 
 * @example
 * // Icon variant
 * <Logo variant="symbol" size="md" />
 * 
 * // Header lockup
 * <Logo variant="lockup-light" size="lg" />
 * 
 * // Dark mode
 * <Logo variant="lockup-dark" size="lg" />
 */
export function Logo({
  variant = 'symbol',
  size = 'md',
  className = '',
  alt = 'PrepX',
}: LogoProps) {
  // Use square sizes for symbol/app-icon, use height-based sizing for lockups
  const isSquareVariant = variant === 'symbol' || variant === 'app-icon';
  const sizeClass = isSquareVariant ? symbolSizeMap[size] : sizeMap[size];
  
  return (
    <img
      src={LOGO_SOURCES[variant]}
      alt={alt}
      className={`${sizeClass} w-auto object-contain ${className}`}
    />
  );
}

/**
 * Logo Symbol Only - Icon variant
 */
export function LogoSymbol({ size = 'md', className = '' }: Omit<LogoProps, 'variant'>) {
  return <Logo variant="symbol" size={size} className={className} />;
}

/**
 * Logo with Text - Light Mode (default for light backgrounds)
 */
export function LogoLockupLight({ size = 'lg', className = '' }: Omit<LogoProps, 'variant'>) {
  const sizeClass = sizeMap[size];
  return (
    <svg
      viewBox="0 0 285 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClass} w-auto object-contain text-foreground ${className}`}
      role="img"
      aria-label="PrepX"
    >
      <defs>
        <linearGradient id="magmaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--magma-1)" />
          <stop offset="50%" stopColor="var(--magma-2)" />
          <stop offset="100%" stopColor="var(--magma-3)" />
        </linearGradient>
      </defs>
      <g>
        <circle cx="19" cy="19" r="10" stroke="currentColor" strokeWidth="3" fill="transparent" />
        <rect x="8" y="34" width="22" height="22" rx="6" fill="url(#magmaGradient)" />
        <rect x="34" y="8" width="22" height="48" rx="6" fill="url(#magmaGradient)" />
      </g>
      <text
        x="74"
        y="44"
        fill="currentColor"
        fontWeight="600"
        fontSize="36"
        letterSpacing="-1.2"
        style={{ fontFamily: 'var(--font-custom, Circular, custom-font, "Helvetica Neue", Helvetica, Arial, sans-serif)' }}
      >
        PrepX
      </text>
    </svg>
  );
}

/**
 * Logo with Text - Dark Mode (for dark backgrounds)
 */
export function LogoLockupDark({ size = 'lg', className = '' }: Omit<LogoProps, 'variant'>) {
  const sizeClass = sizeMap[size];
  return (
    <svg
      viewBox="0 0 285 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClass} w-auto object-contain text-foreground ${className}`}
      role="img"
      aria-label="PrepX"
    >
      <defs>
        <linearGradient id="magmaGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--magma-1)" />
          <stop offset="50%" stopColor="var(--magma-2)" />
          <stop offset="100%" stopColor="var(--magma-3)" />
        </linearGradient>
      </defs>
      <g>
        <circle cx="19" cy="19" r="10" stroke="currentColor" strokeWidth="3" fill="transparent" />
        <rect x="8" y="34" width="22" height="22" rx="6" fill="url(#magmaGradientDark)" />
        <rect x="34" y="8" width="22" height="48" rx="6" fill="url(#magmaGradientDark)" />
      </g>
      <text
        x="74"
        y="44"
        fill="currentColor"
        fontWeight="600"
        fontSize="36"
        letterSpacing="-1.2"
        style={{ fontFamily: 'var(--font-custom, Circular, custom-font, "Helvetica Neue", Helvetica, Arial, sans-serif)' }}
      >
        PrepX
      </text>
    </svg>
  );
}

/**
 * App Icon - Use for app stores & home screen
 */
export function LogoAppIcon({ className = '' }: Omit<LogoProps, 'variant' | 'size'>) {
  return <Logo variant="app-icon" size="xxl" className={className} />;
}
