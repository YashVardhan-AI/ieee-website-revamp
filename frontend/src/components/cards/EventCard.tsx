/** Event cards, for the landing page and the events archive. */

import { cx, formatDate, getYear, isUpcoming } from '@/utils/format';
import { Image } from '@/components/ui/Media';
import { ArrowUpRightIcon, CalendarIcon, MapPinIcon } from '@/components/ui/Icons';
import type { SiteEvent } from '@/types/api';

/**
 * The "this has not happened yet" marker.
 *
 * A dot plus the word, so the status never depends on colour alone, and
 * solder-mask green rather than the brand blue - this is a status, and
 * statuses are the one thing on the site allowed a colour of their own.
 */
function UpcomingBadge({ date }: { date: string | null }) {
  if (!isUpcoming(date)) return null;

  return (
    <span className="mono inline-flex items-center gap-1.5 border border-[var(--color-ok)] bg-paper px-2.5 py-1 text-[var(--color-ok)]">
      <span className="size-1.5 bg-current" aria-hidden="true" />
      Upcoming
    </span>
  );
}

export function EventCard({ event, className }: { event: SiteEvent; className?: string }) {
  const date = formatDate(event.event_date);

  return (
    <article className={cx('card card-interactive group flex h-full flex-col', className)}>
      <div className="relative">
        <Image
          src={event.poster}
          alt={event.poster ? `${event.title} poster` : ''}
          aspect="aspect-4/3"
          className="halftone-screen"
          imageClassName="group-hover:scale-[1.04]"
        />
        <div className="absolute top-3 left-3 z-[2] flex flex-col items-start gap-2">
          <UpcomingBadge date={event.event_date} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="mono flex flex-wrap items-center gap-x-3 gap-y-1.5 text-muted">
          {date && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="size-3.5" />
              <time dateTime={event.event_date ?? undefined}>{date}</time>
            </span>
          )}
          {event.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPinIcon className="size-3.5" />
              {event.location}
            </span>
          )}
        </div>

        <h3 className="caps text-base leading-[1.1]">{event.title}</h3>

        {event.description && (
          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
            {event.description}
          </p>
        )}

        {event.registration_url && isUpcoming(event.event_date) && (
          <a
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mono mt-auto inline-flex items-center gap-1.5 text-signal"
          >
            <span className="u-sweep">Register</span>
            <ArrowUpRightIcon className="size-3.5" />
          </a>
        )}
      </div>
    </article>
  );
}

/**
 * A dense list row for the events archive.
 *
 * Forty-three events in a card grid is a wall; as a dated list it reads as
 * a history, which is what an archive is for. The year is set in condensed
 * display type so the left edge scans as a timeline.
 */
export function EventRow({ event }: { event: SiteEvent }) {
  const date = formatDate(event.event_date);
  const year = getYear(event.event_date);

  return (
    <article className="group grid gap-4 border-b border-line-subtle py-6 sm:grid-cols-[7rem_1fr] sm:gap-6 md:grid-cols-[9rem_10rem_1fr]">
      <div className="flex items-baseline gap-2 sm:flex-col sm:gap-1">
        <span className="cond text-4xl leading-none tabular">{year ?? '—'}</span>
        {date && (
          <time dateTime={event.event_date ?? undefined} className="mono text-muted">
            {date}
          </time>
        )}
      </div>

      <Image
        src={event.poster}
        alt={event.poster ? `${event.title} poster` : ''}
        aspect="aspect-4/3"
        className="halftone-screen hidden md:block"
        imageClassName="group-hover:scale-[1.04]"
      />

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="caps text-base leading-[1.1]">{event.title}</h3>
          <UpcomingBadge date={event.event_date} />
        </div>

        {event.description && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted">{event.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          {event.location && (
            <span className="mono inline-flex items-center gap-1.5 text-muted">
              <MapPinIcon className="size-3.5" />
              {event.location}
            </span>
          )}
          {event.registration_url && isUpcoming(event.event_date) && (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mono inline-flex items-center gap-1 text-signal"
            >
              <span className="u-sweep">Register</span>
              <ArrowUpRightIcon className="size-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
