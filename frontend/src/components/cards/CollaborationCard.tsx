/** Collaboration cards and the logo marquee. */

import { cx, displayHost } from '@/utils/format';
import { LogoMark } from '@/components/ui/Media';
import { ArrowUpRightIcon } from '@/components/ui/Icons';
import type { Collaboration } from '@/types/api';

export function CollaborationCard({
  collaboration,
  className,
}: {
  collaboration: Collaboration;
  className?: string;
}) {
  const host = displayHost(collaboration.website_url);

  const content = (
    <>
      <div className="flex h-16 items-center">
        <LogoMark src={collaboration.logo} name={collaboration.name} />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="caps text-base leading-[1.1]">{collaboration.name}</h3>
          {collaboration.year && <span className="chip tabular">{collaboration.year}</span>}
        </div>

        {collaboration.collaboration_type && (
          <p className="mono text-signal">{collaboration.collaboration_type}</p>
        )}

        {collaboration.description && (
          <p className="text-sm leading-relaxed text-muted">{collaboration.description}</p>
        )}
      </div>

      {host && (
        <span className="mono inline-flex items-center gap-1.5 text-muted transition-colors group-hover:text-signal">
          {host}
          <ArrowUpRightIcon className="size-3.5" />
        </span>
      )}
    </>
  );

  const shared = cx('card card-interactive group flex h-full flex-col gap-4 p-5', className);

  // Only render an anchor when there is somewhere to go; a link to nowhere
  // is worse than a plain card.
  return collaboration.website_url ? (
    <a
      href={collaboration.website_url}
      target="_blank"
      rel="noopener noreferrer"
      className={shared}
    >
      {content}
    </a>
  ) : (
    <article className={shared}>{content}</article>
  );
}

/**
 * A continuously scrolling band of logos.
 *
 * The track holds two copies of the list and translates by exactly -50%, so
 * the loop is seamless. It is a CSS animation, which keeps it off the main
 * thread, pauses on hover, and stops entirely under reduced motion.
 */
export function CollaborationMarquee({ collaborations }: { collaborations: Collaboration[] }) {
  if (collaborations.length === 0) return null;

  const items = [...collaborations, ...collaborations];

  return (
    <div
      className="marquee mask-fade-x relative overflow-hidden py-2"
      // Decorative duplication would be read twice by a screen reader; the
      // collaborations page lists them properly.
      aria-hidden="true"
    >
      {/* The ends fade so logos enter and leave rather than being cut off.
          Done with a mask rather than two overlaid gradients, so it works on
          whichever band the marquee is placed on instead of having to match
          that band's background colour. */}
      <ul className="marquee-track flex w-max items-center gap-10 md:gap-16">
        {items.map((collaboration, index) => (
          <li
            key={`${collaboration.slug}-${index}`}
            className="flex h-14 shrink-0 items-center opacity-55 grayscale transition-[opacity,filter] duration-300 hover:opacity-100 hover:grayscale-0"
          >
            <LogoMark src={collaboration.logo} name={collaboration.name} className="max-h-8" />
          </li>
        ))}
      </ul>
    </div>
  );
}
