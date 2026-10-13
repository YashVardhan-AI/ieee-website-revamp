/**
 * Display typography and the editorial furniture around it.
 *
 * These are the pieces that carry the site's voice: headlines that set
 * themselves a word at a time, the numbered labels that annotate each
 * section, a marquee, and the rotating badge. Everything here is about type
 * rather than data, so none of it touches the API.
 */

import { Fragment, useId, useMemo, useRef } from 'react';
import { useInView } from 'motion/react';
import { cn } from '@/utils/cn';
import { ArrowUpRightIcon } from './Icons';
import type { CSSProperties, ElementType, ReactNode } from 'react';

/* --- Headline ----------------------------------------------------------- */

/**
 * Split a headline into words, carrying an accent flag through.
 *
 * The authoring format is `"Build.\n*Publish.*\nShip."`:
 *   - `\n` is a hard line break;
 *   - text between a pair of asterisks takes the accent treatment.
 *
 * Asterisks delimit a *span*, not a word, so `*two words*` works and the
 * author does not have to mark each one. Splitting on the asterisk and
 * alternating is what buys that: every odd chunk is inside a pair.
 */
function parseHeadline(text: string): { word: string; accent: boolean }[][] {
  return text.split('\n').map((line) =>
    line.split('*').flatMap((chunk, index) => {
      if (!chunk) return [];
      const accent = index % 2 === 1;
      return chunk
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => ({ word, accent }));
    }),
  );
}

interface WordsProps {
  /** `\n` breaks a line; `*text*` takes the accent treatment. */
  text: string;
  as?: ElementType;
  className?: string;
  /** Class applied to accented words. */
  accent?: string;
  /** Milliseconds before the first word moves. */
  delay?: number;
  /** Milliseconds between words. */
  step?: number;
  /**
   * Animate on mount rather than on scroll. For a headline above the fold,
   * which should not wait for an observer that has already fired.
   */
  onLoad?: boolean;
}

/**
 * A headline whose words rise into place from behind their own baseline.
 *
 * Each word sits in an overflow-hidden box and is translated down out of it,
 * then released on a stagger. It reads as type being set rather than as an
 * element fading in, which is worth the extra markup on the one or two
 * headings that carry a page.
 *
 * The whole visual effect is `aria-hidden`, with the plain string offered to
 * screen readers alongside it - otherwise the heading would be announced as
 * a stream of separate words.
 */
export function Words({
  text,
  as: Tag = 'span',
  className,
  accent = 'text-signal',
  delay = 0,
  step = 70,
  onLoad = false,
}: WordsProps) {
  const ref = useRef<HTMLElement>(null);
  // `once` matches the entrance everywhere else on the site: a headline
  // should not re-set itself every time it is scrolled back past.
  const inView = useInView(ref, { once: true, amount: 0.2, margin: '0px 0px -6% 0px' });

  const lines = useMemo(() => parseHeadline(text), [text]);
  const plain = useMemo(() => text.replace(/\*/g, '').replace(/\n/g, ' '), [text]);

  let wordIndex = 0;

  return (
    <Tag ref={ref} className={cn('caps', onLoad ? 'wm-auto' : inView && 'wm-in', className)}>
      <span className="sr-only">{plain}</span>
      <span aria-hidden="true">
        {lines.map((line, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {line.map(({ word, accent: isAccent }, index) => {
              const wordDelay = delay + wordIndex * step;
              wordIndex += 1;
              return (
                <Fragment key={index}>
                  {index > 0 && ' '}
                  <span className="wm">
                    <span
                      className={isAccent ? accent : undefined}
                      style={{ '--wm-d': `${wordDelay}ms` } as CSSProperties}
                    >
                      {word}
                    </span>
                  </span>
                </Fragment>
              );
            })}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

/* --- Section label ------------------------------------------------------ */

/**
 * The numbered label above a section heading: `(01) —— What we do`.
 *
 * The number is part of the editorial conceit - the page reads as a printed
 * contents list - so it is given rather than derived, and the rule between
 * the two is decorative.
 */
export function SectionLabel({
  n,
  children,
  className,
}: {
  n: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('mono flex items-center gap-3', className)}>
      <span>({n})</span>
      <span aria-hidden="true" className="h-px w-10 bg-current opacity-40" />
      <span>{children}</span>
    </p>
  );
}

/* --- Marquee ------------------------------------------------------------ */

/**
 * A horizontally looping band.
 *
 * The children are rendered twice and the track is translated by exactly
 * -50%, which is what makes the loop seamless: at the moment the animation
 * resets, the second copy is sitting precisely where the first began. The
 * duplicate is `aria-hidden`, so the content is announced once.
 *
 * It pauses on hover, so anything in it can actually be read.
 */
export function Marquee({
  children,
  className,
  reverse = false,
  duration,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  duration?: string;
}) {
  return (
    <div className={cn('marquee mask-fade-x flex overflow-hidden', className)}>
      <div
        className="marquee-track flex w-max will-change-transform"
        style={{
          animationDirection: reverse ? 'reverse' : undefined,
          animationDuration: duration,
        }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- Spin badge --------------------------------------------------------- */

/**
 * A circular badge with text running around its edge.
 *
 * The text follows a `<textPath>` on a circle, and the whole SVG rotates
 * slowly. `useId` keeps the path's id unique, so two badges on one page do
 * not both resolve to the first one's path.
 */
export function SpinBadge({
  href,
  text,
  label,
  className,
  external = false,
}: {
  href: string;
  text: string;
  /** The accessible name; the circular text is decorative. */
  label: string;
  className?: string;
  external?: boolean;
}) {
  const pathId = `spin-${useId().replace(/:/g, '')}`;

  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'group relative flex size-[132px] items-center justify-center rounded-full bg-signal-fill text-on-accent transition-transform duration-500 hover:scale-110 sm:size-[148px]',
        className,
      )}
    >
      <svg viewBox="0 0 160 160" className="absolute inset-0 animate-spin-slow" aria-hidden="true">
        <defs>
          <path id={pathId} d="M80 80m-60 0a60 60 0 1 1 120 0a60 60 0 1 1-120 0" />
        </defs>
        <text className="fill-current font-display text-[13px] font-extrabold tracking-[0.2em] uppercase [font-stretch:100%]">
          <textPath href={`#${pathId}`}>{text}</textPath>
        </text>
      </svg>
      <ArrowUpRightIcon className="relative size-9 transition-transform duration-500 group-hover:rotate-45" />
    </a>
  );
}
