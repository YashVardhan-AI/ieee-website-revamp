/**
 * The IEEE IIIT Delhi wordmark.
 *
 * The mark is the IEEE arrow-and-diamond form, drawn rather than bitmapped
 * so it stays sharp at any size, and held in IEEE's own secondary blues
 * (#001489 and #58B4E0) rather than in theme tokens - a logo that changes
 * colour with the page is not a logo.
 *
 * The one thing that does move is which of the two blues carries the solid
 * bars. IEEE dark blue on a navy or near-black band is about 1.3:1 and the
 * mark simply disappears, so on dark grounds the bars take the light blue
 * and the diamonds go to silk. That is a legibility fix, not a recolour:
 * both values stay inside the brand palette.
 */

import { Link } from 'react-router-dom';
import { cx } from '@/utils/format';

/** IEEE secondary palette. */
const IEEE_DARK_BLUE = '#001489';
const IEEE_LIGHT_BLUE = '#58b4e0';
const SILK = '#f7f8fa';

export function BrandMark({
  className = 'size-10',
  tone = 'light',
}: {
  className?: string;
  /** The ground the mark sits on, not the colour of the mark. */
  tone?: 'light' | 'dark';
}) {
  const bars = tone === 'dark' ? IEEE_LIGHT_BLUE : IEEE_DARK_BLUE;
  const diamonds = tone === 'dark' ? SILK : IEEE_LIGHT_BLUE;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Top diamond */}
      <polygon points="50,2 62,14 50,26 38,14" fill={diamonds} />

      {/* Upper arrow bar */}
      <polygon points="20,30 36,30 48,42 80,42 92,36 80,30 36,30" fill={bars} />
      <polygon points="20,30 36,30 36,42 24,42" fill={diamonds} />

      {/* Centre bar, with the diamond cut out of it */}
      <polygon points="8,46 92,46 92,54 8,54" fill={bars} />
      <polygon points="8,46 24,46 8,54" fill={diamonds} />
      <polygon points="50,46 58,50 50,54 42,50" fill={diamonds} />

      {/* Lower arrow bar */}
      <polygon points="20,58 36,58 48,58 80,58 92,64 80,70 36,70" fill={bars} />
      <polygon points="20,58 36,58 36,70 24,70" fill={diamonds} />

      {/* Bottom diamond */}
      <polygon points="50,74 62,86 50,98 38,86" fill={diamonds} />
    </svg>
  );
}

interface BrandProps {
  /** Hide the text on narrow screens, where the mark alone is enough. */
  compact?: boolean;
  tone?: 'light' | 'dark';
  className?: string;
}

/**
 * The mark plus the branch name, linking home.
 *
 * The institute's name leads and the branch sits under it, because on this
 * campus "IIIT Delhi" is what identifies the page and "IEEE Student Branch"
 * is what qualifies it.
 */
export function Brand({ compact = false, tone = 'light', className }: BrandProps) {
  return (
    <Link
      to="/"
      className={cx('group flex items-center gap-3 py-2', className)}
      aria-label="IEEE Student Branch, IIIT Delhi — home"
    >
      <BrandMark
        tone={tone}
        className="size-10 shrink-0 transition-transform duration-500 ease-[var(--ease-spring)] group-hover:rotate-[8deg]"
      />
      <span className={cx('leading-none', compact && 'hidden sm:block')}>
        <span className="wide block text-[0.9375rem] tracking-[-0.01em]">IIIT Delhi</span>
        <span
          className={cx(
            'mt-1 block font-sans text-[0.625rem] font-normal tracking-[0.15em] normal-case',
            tone === 'dark' ? 'text-on-contrast/60' : 'text-muted',
          )}
        >
          IEEE Student Branch
        </span>
      </span>
    </Link>
  );
}
