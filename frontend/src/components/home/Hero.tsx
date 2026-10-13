/**
 * The landing hero.
 *
 * The idea is the branch's own: noise in, signal out. The headline sits on
 * an oscilloscope trace that is chaotic at the top of the page and resolves
 * into a clean waveform as you scroll past it, so the thing the branch says
 * it does is the thing the page does while you read it.
 *
 * Everything else is deliberately flat and printed - a rule above and below
 * the status line, graph-paper grid, film grain, and a photograph treated as
 * ink that returns to colour under the pointer. There are no gradients and
 * no soft shadows anywhere in it.
 *
 * The headline is authored in site settings, so the branch controls it. Two
 * characters are markup: `\n` breaks a line, and `*text*` takes the halftone
 * treatment. See `Words` in ui/Display.
 */

import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Magnetic } from '@/components/ui/Interactive';
import { Words } from '@/components/ui/Display';
import { Wave } from '@/components/ui/Wave';
import { Image } from '@/components/ui/Media';
import { ArrowRightIcon, ArrowUpRightIcon } from '@/components/ui/Icons';
import type { CSSProperties } from 'react';
import type { SiteEvent } from '@/types/api';

/**
 * A tilted mono caption pinned to the hero photograph.
 *
 * The rotation is set twice - once as a `rotate` so it holds at rest, and
 * once as a custom property the `drift` keyframes add to - because a
 * keyframe that animated `transform` alone would reset the tilt to zero on
 * its first frame.
 */
function PhotoTag({
  children,
  className,
  rotate,
  delay,
  tone = 'paper',
}: {
  children: React.ReactNode;
  className?: string;
  rotate: string;
  delay?: string;
  tone?: 'paper' | 'accent';
}) {
  return (
    <span
      className={[
        'mono animate-drift absolute px-3 py-2',
        tone === 'paper'
          ? 'border border-line bg-paper text-ink shadow-[2px_2px_0_0_var(--text-primary)]'
          : 'bg-signal-fill text-on-accent',
        className,
      ].join(' ')}
      style={{ '--r': rotate, rotate, animationDelay: delay } as CSSProperties}
    >
      {children}
    </span>
  );
}

/**
 * A container-relative font size that makes the headline's longest line fill
 * the shell.
 *
 * The headline is authored in site settings, so its length is not knowable
 * here: "Build. Publish. Ship." and "Technology for humanity, built by
 * students." want very different sizes, and a single hard-coded one either
 * leaves the short headline looking timid or pushes the long one off the
 * side of the screen.
 *
 * Archivo at 125% width and weight 900 averages a little over 0.6em per
 * uppercase glyph, so a line of N characters needs roughly 100/(N × 0.62)
 * container-width units to span the container. The result is clamped by the
 * caller, so neither a one-word headline nor a pathological one escapes.
 */
function headlineSizeFor(heading: string): number {
  const longestLine = heading
    .replace(/\*/g, '')
    .split('\n')
    .reduce((longest, line) => Math.max(longest, line.trim().length), 0);

  if (longestLine === 0) return 11;
  return Math.min(16, 100 / (longestLine * 0.62));
}

export function Hero({ featured }: { featured?: SiteEvent | null }) {
  const { text, link } = useSiteSettings();
  const reducedMotion = useReducedMotion();
  const joinUrl = link('join_url');

  const heading = text('hero_heading', 'Technology for\n*humanity*,\nbuilt by students.');
  const subheading = text(
    'hero_subheading',
    "The IEEE student branch at IIIT Delhi, where the institute's biggest technical events are imagined, engineered and run.",
  );
  const eyebrow = text('hero_eyebrow', 'IEEE Student Branch · IIIT Delhi');
  // Both optional: shown only once the branch has something true to put
  // there, rather than carrying a plausible-looking default.
  const meta = text('hero_meta', '');
  const status = text('hero_status', '');

  const headlineSize = headlineSizeFor(heading);

  return (
    <section id="top" className="grid-paper grain relative bg-paper pt-[var(--header-height)]">
      <div className="shell relative z-10">
        {/* Status line. Ruled above and below, like a masthead's dateline. */}
        <div
          className="mono load-in flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-y border-line py-3"
          style={{ '--load-d': '100ms' } as CSSProperties}
        >
          <span>{eyebrow}</span>
          {meta && <span className="hidden text-muted sm:inline">{meta}</span>}
          {status && (
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="size-2 animate-blink bg-signal" />
              {status}
            </span>
          )}
        </div>

        {/* The headline, sized against its own container rather than the
            viewport, so it fills the shell at every width - and sized from
            its own longest line, so it fills it without overflowing however
            long the branch's headline is. */}
        <div className="relative mt-6 [container-type:inline-size] sm:mt-8">
          {/* The trace sits behind the type. It is the ground the headline
              is printed on, not something laid over it. */}
          <Wave kind="sine" drive="scroll" className="z-0" />

          <h1
            className="relative z-10 leading-[0.86] tracking-[-0.045em]"
            style={{ fontSize: `clamp(2.25rem, ${headlineSize}cqw, 11rem)` }}
          >
            <Words onLoad delay={200} step={110} accent="noise-text" text={heading} />
          </h1>
        </div>

        <div className="mt-10 grid gap-10 pb-16 sm:mt-12 lg:grid-cols-12 lg:gap-8 lg:pb-28">
          <div className="flex flex-col gap-8 lg:col-span-5">
            <div className="load-in space-y-7" style={{ '--load-d': '900ms' } as CSSProperties}>
              <p className="max-w-[46ch] text-[1.125rem] leading-[1.65] text-secondary sm:text-[1.1875rem]">
                {subheading}
              </p>

              <div className="flex flex-wrap gap-4">
                {joinUrl && (
                  <Magnetic>
                    <a
                      href={joinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-lg min-w-[160px]"
                    >
                      Join the branch
                      <ArrowUpRightIcon className="size-4" />
                    </a>
                  </Magnetic>
                )}
                <Link to="/events" className="btn btn-secondary btn-lg">
                  See what we run
                  <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* The photograph. Uses whichever event the branch has featured,
              so the hero changes with the season rather than being a fixed
              asset someone has to remember to replace. */}
          {featured?.poster && (
            <motion.div
              className="relative lg:col-span-7"
              initial={reducedMotion ? undefined : { opacity: 0 }}
              animate={reducedMotion ? undefined : { opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <figure
                className="ink-photo-wrap clip-open aspect-[4/3] overflow-hidden sm:aspect-[16/9]"
                style={{ '--load-d': '500ms' } as CSSProperties}
              >
                <Image
                  src={featured.poster}
                  alt={featured.title}
                  className="ink-photo size-full object-cover"
                  loading="eager"
                />
              </figure>

              <PhotoTag rotate="-2deg" className="bottom-5 left-4 sm:left-6">
                {featured.title}
              </PhotoTag>

              {featured.location && (
                <PhotoTag
                  rotate="1.5deg"
                  delay="-5s"
                  tone="accent"
                  className="top-5 right-5 hidden sm:block"
                >
                  {featured.location}
                </PhotoTag>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
