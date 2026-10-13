/**
 * The landing-page bands below the hero.
 *
 * Each one takes the data it needs as a prop and renders nothing when that
 * data is empty, so a fresh database produces a shorter but still coherent
 * page rather than a run of empty headings. The editorial bands - perks,
 * testimonials, FAQ - do the same with site settings, which is why none of
 * them ships placeholder copy.
 */

import { useRef, useState } from 'react';
import { useInView } from 'motion/react';
import { Link } from 'react-router-dom';
import { Section, SectionHeader } from '@/components/ui/Section';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { Marquee, SectionLabel, Words } from '@/components/ui/Display';
import { Tilt } from '@/components/ui/Interactive';
import { Image } from '@/components/ui/Media';
import { useCountUp } from '@/hooks/useInteraction';
import { BlogCard } from '@/components/cards/BlogCard';
import { AlumniTile, TeamCard } from '@/components/cards/PersonCard';
import { CollaborationMarquee } from '@/components/cards/CollaborationCard';
import { ArrowRightIcon, ArrowUpRightIcon, PlusIcon } from '@/components/ui/Icons';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/format';
import type {
  Alumnus,
  BlogPostSummary,
  Collaboration,
  IeeeDayEdition,
  SiteEvent,
  SiteStats,
  TeamMember,
} from '@/types/api';

/* --- Stats -------------------------------------------------------------- */

function Stat({
  value,
  suffix,
  label,
  note,
  index,
}: {
  value: number;
  suffix?: string;
  label: string;
  note: string;
  index: number;
}) {
  const { ref, value: shown } = useCountUp(value);

  return (
    <Reveal
      delay={index * 0.09}
      className="border-line sm:border-l sm:pl-6 sm:first:border-l-0 sm:first:pl-0"
    >
      <div ref={ref as React.Ref<HTMLDivElement>}>
        <p className="cond text-[clamp(3rem,7vw,7rem)] leading-[0.8] tabular">
          {shown}
          {suffix && <span className="text-signal">{suffix}</span>}
        </p>
        <p className="mono mt-4">{label}</p>
        <p className="mt-1 text-sm text-muted">{note}</p>
      </div>
    </Reveal>
  );
}

/**
 * The branch in numbers, closing on where its alumni went.
 *
 * The organisations in the marquee are read off the alumni records rather
 * than being a hand-kept list, so it cannot drift out of date. It is hidden
 * below four distinct names, where a marquee would visibly loop and read as
 * padding.
 */
export function StatsBand({ stats, alumni }: { stats: SiteStats; alumni: Alumnus[] }) {
  const tiles = [
    { value: stats.members, suffix: '', label: 'Members', note: 'across the branch' },
    { value: stats.events, suffix: '+', label: 'Events run', note: 'talks, sprints, builds' },
    { value: stats.collaborations, suffix: '', label: 'Partners', note: 'industry and academia' },
    { value: stats.years_active, suffix: '', label: 'Years active', note: 'at IIIT Delhi' },
  ];

  const organisations = [
    ...new Set(
      alumni
        .map((alumnus) => alumnus.current_organization?.trim())
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  return (
    <section aria-label="The branch in numbers" className="relative bg-paper">
      <div className="shell pt-4 pb-20 sm:pb-24">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4">
          {tiles.map((tile, index) => (
            <Stat key={tile.label} index={index} {...tile} />
          ))}
        </div>
      </div>

      {organisations.length >= 4 && (
        <div className="grain relative bg-ink-surface pt-7 pb-16 text-on-contrast">
          <p className="shell mono relative z-10 mb-5 text-on-contrast/60">Alumni now at</p>
          <div className="relative z-10">
            <Marquee duration="44s">
              {organisations.map((name) => (
                <span
                  key={name}
                  className="cond flex items-center gap-8 pr-8 text-[clamp(2rem,5vw,4rem)] leading-none whitespace-nowrap"
                >
                  {name}
                  <span aria-hidden="true" className="size-3 rotate-45 bg-signal-on-dark" />
                </span>
              ))}
            </Marquee>
          </div>
        </div>
      )}
    </section>
  );
}

/* --- Events ------------------------------------------------------------- */

/**
 * The featured events, as a stack of full-bleed cards.
 *
 * On a wide screen each card is sticky at a slightly lower offset than the
 * last, so they gather into a pile as you scroll instead of scrolling past
 * one by one - the event you are reading stays put while the next slides
 * over it. On narrow screens they are simply stacked, because stickiness in
 * a single column just holds content off the screen.
 *
 * The four tones cycle, so an arbitrary number of events still alternates.
 */
const EVENT_TONES = [
  {
    card: 'bg-silk text-ink border border-line-strong',
    rule: 'border-line',
    number: 'text-ink/10',
  },
  {
    card: 'bg-signal-fill text-on-accent',
    rule: 'border-on-accent/30',
    number: 'text-on-accent/20',
  },
  {
    card: 'bg-board text-on-contrast',
    rule: 'border-on-contrast/25',
    number: 'text-on-contrast/15',
  },
  {
    card: 'bg-ink-surface text-on-contrast',
    rule: 'border-on-contrast/25',
    number: 'text-on-contrast/15',
  },
] as const;

export function FeaturedEvents({ events }: { events: SiteEvent[] }) {
  if (events.length === 0) return null;

  return (
    <Section id="events" tone="paper" divided>
      <div className="shell">
        <SectionHeader
          n="03"
          eyebrow="Events"
          title={'What we run,\nand run *well.*'}
          description="The branch runs something most months. These are the ones it is known for."
          action={{ label: 'Full archive', to: '/events' }}
        />

        <div className="mt-16">
          {events.map((event, index) => {
            const tone = EVENT_TONES[index % EVENT_TONES.length]!;
            const date = formatDate(event.event_date);
            const isLast = index === events.length - 1;

            return (
              <article
                key={event.slug}
                className={cn('mb-6 lg:sticky', isLast ? 'lg:mb-0' : 'lg:mb-[14vh]')}
                style={{ top: `${84 + index * 18}px` }}
              >
                <Reveal direction="up" blur={false}>
                  <div
                    className={cn(
                      'grid overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-lifted)] lg:min-h-[32rem] lg:grid-cols-12',
                      tone.card,
                    )}
                  >
                    <div className="relative order-2 flex flex-col justify-between gap-10 p-6 sm:p-9 lg:order-1 lg:col-span-5">
                      <span
                        aria-hidden="true"
                        className={cn(
                          'cond pointer-events-none absolute -top-2 right-5 text-[8rem] leading-none select-none lg:text-[11rem]',
                          tone.number,
                        )}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="relative">
                        <h3 className="caps text-[clamp(1.75rem,3.2vw,3rem)]">{event.title}</h3>
                        {event.description && (
                          <p className="mt-5 max-w-[40ch] leading-relaxed opacity-80">
                            {event.description}
                          </p>
                        )}
                      </div>

                      <div className="relative">
                        <dl className={cn('grid grid-cols-2 border-t sm:grid-cols-3', tone.rule)}>
                          {[
                            date && { term: date, detail: 'When' },
                            event.location && { term: event.location, detail: 'Where' },
                            event.category && { term: event.category, detail: 'Track' },
                          ]
                            .filter((fact): fact is { term: string; detail: string } =>
                              Boolean(fact),
                            )
                            .map((fact, factIndex) => (
                              <div
                                key={fact.detail}
                                className={cn(
                                  'pt-4',
                                  factIndex > 0 && cn('border-l pl-4', tone.rule),
                                )}
                              >
                                <dt className="mono opacity-70">{fact.detail}</dt>
                                <dd className="mt-2 text-[0.9375rem] font-semibold">{fact.term}</dd>
                              </div>
                            ))}
                        </dl>

                        <Link
                          to="/events"
                          className="group mt-5 -ml-1 inline-flex items-center gap-3 px-1 py-3 font-display text-[0.8125rem] font-bold tracking-[0.07em] uppercase [font-stretch:100%]"
                        >
                          <span className="u-sweep">See the archive</span>
                          <ArrowUpRightIcon className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>

                    {event.poster && (
                      <div className="group ink-photo-wrap order-1 aspect-[16/10] overflow-hidden lg:order-2 lg:col-span-7 lg:aspect-auto">
                        <Image
                          src={event.poster}
                          alt={event.title}
                          className="ink-photo size-full object-cover group-hover:scale-[1.04]"
                        />
                      </div>
                    )}
                  </div>
                </Reveal>
              </article>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

/* --- IEEE Day ----------------------------------------------------------- */

export function IeeeDayBand({ edition }: { edition: IeeeDayEdition | null }) {
  if (!edition) return null;

  const celebrated = formatDate(edition.celebrated_on);

  return (
    <Section tone="accent" compact divided>
      <div className="shell grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <Reveal>
            <SectionLabel n="04">
              IEEE Day {edition.year}
              {celebrated ? ` · ${celebrated}` : ''}
            </SectionLabel>
          </Reveal>

          <Words
            as="h2"
            className="fluid-heading mt-7 block"
            text={edition.theme ?? 'IEEE Day at IIIT Delhi'}
          />

          {edition.tagline && (
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-[46ch] text-lg leading-relaxed opacity-80">
                {edition.tagline}
              </p>
            </Reveal>
          )}

          <Reveal delay={0.3}>
            <Link to="/ieee-day" className="btn btn-primary btn-lg mt-8">
              Explore IEEE Day
              <ArrowRightIcon className="size-4" />
            </Link>
          </Reveal>
        </div>

        {edition.stats.length > 0 && (
          <Reveal delay={0.15} className="lg:col-span-5">
            <dl className="grid grid-cols-2 border-t border-l border-on-accent/25">
              {edition.stats.slice(0, 4).map((stat) => (
                <div key={stat.label} className="border-r border-b border-on-accent/25 p-5 sm:p-7">
                  <dd className="cond text-[clamp(2rem,4vw,3.25rem)] leading-none">{stat.value}</dd>
                  <dt className="mono mt-2 opacity-70">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </Section>
  );
}

/* --- Collaborations ----------------------------------------------------- */

export function CollaborationsBand({ collaborations }: { collaborations: Collaboration[] }) {
  if (collaborations.length === 0) return null;

  return (
    <Section tone="sunken" compact divided>
      <div className="shell">
        <SectionHeader
          n="05"
          eyebrow="Collaborations"
          title={'Who we build\n*with.*'}
          description="Sponsors, workshop partners and prize partners across the branch's events."
          action={{ label: 'All collaborations', to: '/collaborations' }}
        />
      </div>

      <Reveal className="mt-14">
        <CollaborationMarquee collaborations={collaborations} />
      </Reveal>
    </Section>
  );
}

/* --- Team --------------------------------------------------------------- */

export function CoreTeamBand({ members }: { members: TeamMember[] }) {
  if (members.length === 0) return null;

  return (
    <Section id="team" tone="paper" divided>
      <div className="shell">
        <SectionHeader
          n="06"
          eyebrow="The team"
          title={'Who runs\n*the branch.*'}
          description="The executive board for this term. The full roster, including the executive committee and faculty advisors, is on the team page."
          action={{ label: 'Meet everyone', to: '/team' }}
        />

        <Stagger
          as="ul"
          className="tilt-scene mt-16 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
        >
          {members.slice(0, 8).map((member) => (
            <StaggerItem as="li" key={member.slug}>
              <Tilt className="h-full" max={4}>
                <TeamCard member={member} />
              </Tilt>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}

/* --- Blogs -------------------------------------------------------------- */

export function FeaturedBlogs({ posts }: { posts: BlogPostSummary[] }) {
  if (posts.length === 0) return null;

  return (
    <Section id="blog" tone="sunken" divided>
      <div className="shell">
        <SectionHeader
          n="07"
          eyebrow="Writing"
          title={'From the\n*blog.*'}
          description="Members writing about the technology they find interesting - spacesuits, 6G, autonomous vehicles, oxytocin."
          action={{ label: 'Read the blog', to: '/blogs' }}
        />

        <Stagger as="ul" className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <StaggerItem as="li" key={post.slug}>
              <BlogCard post={post} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}

/* --- Alumni ------------------------------------------------------------- */

/**
 * Alumni as a horizontally scrolling strip.
 *
 * A strip signals "there are more of these" better than a truncated grid,
 * and keeps a long list from dominating the page.
 */
export function AlumniBand({ alumni }: { alumni: Alumnus[] }) {
  if (alumni.length === 0) return null;

  return (
    <Section tone="paper" divided>
      <div className="shell">
        <SectionHeader
          n="08"
          eyebrow="Alumni"
          title={'Where members\n*end up.*'}
          description="Former members of the branch, and what they went on to do."
          action={{ label: 'All alumni', to: '/alumni' }}
        />
      </div>

      <Reveal className="mt-14">
        {/* Padded to the shell's own inset on wide screens, so the first
            tile lines up with the heading above it while the strip itself
            still runs to the edge of the viewport. */}
        <ul className="scroll-x no-scrollbar flex snap-x snap-proximity gap-5 px-6 pb-4 sm:px-12 lg:px-[max(3rem,calc((100vw-95rem)/2+3rem))]">
          {alumni.map((alumnus) => (
            <li key={alumnus.slug} className="snap-start">
              <AlumniTile alumnus={alumnus} />
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}

/* --- Perks -------------------------------------------------------------- */

/**
 * One perk, lit while it crosses the middle band of the viewport.
 *
 * The observer deliberately does not use `once`: the point is that exactly
 * the row you are reading is at full strength and the rest are dimmed, which
 * means it has to turn back off on the way past. A tall inset on both edges
 * is what defines "the middle" - without it every row on a short screen
 * would be lit at once.
 */
function Perk({ index, title, body }: { index: number; title: string; body: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const lit = useInView(ref, { margin: '-38% 0px -38% 0px' });

  return (
    <li
      ref={ref}
      className={cn(
        'grid grid-cols-[2.4rem_1fr] gap-x-4 border-t border-on-contrast/20 py-9 transition-opacity duration-700 sm:grid-cols-[4rem_1fr] sm:py-12',
        lit ? 'opacity-100' : 'opacity-35',
      )}
    >
      <span className="mono flex items-start gap-2 pt-2">
        <span
          aria-hidden="true"
          className={cn(
            'mt-[3px] size-2 bg-signal-on-dark transition-transform duration-500',
            lit ? 'scale-100' : 'scale-0',
          )}
        />
        {String(index + 1).padStart(2, '0')}
      </span>

      <div>
        <h3 className="cond text-[clamp(1.9rem,4.4vw,3.75rem)] leading-[0.92] tracking-[-0.015em]">
          {title}
        </h3>
        {body && <p className="mt-4 max-w-[52ch] leading-relaxed text-on-contrast/70">{body}</p>}
      </div>
    </li>
  );
}

export function PerksBand({
  perks,
  joinUrl,
}: {
  perks: { title: string; body: string }[];
  joinUrl?: string;
}) {
  if (perks.length === 0) return null;

  return (
    <Section id="why" tone="contrast" divided>
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <SectionLabel n="09">Why join</SectionLabel>
            </Reveal>

            <Words
              as="h2"
              className="fluid-heading mt-7 block"
              text={'What you\nactually *get.*'}
              accent="text-signal-on-dark"
            />

            <Reveal delay={0.2}>
              <p className="mt-7 max-w-[36ch] leading-relaxed text-on-contrast/70">
                Membership is a real IEEE membership, with everything that comes with it.
              </p>
              {joinUrl && (
                <a
                  href={joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-on-dark mt-9"
                >
                  Become a member
                  <ArrowUpRightIcon className="size-4" />
                </a>
              )}
            </Reveal>
          </div>
        </div>

        <ol className="border-b border-on-contrast/20 lg:col-span-7">
          {perks.map((perk, index) => (
            <Perk key={perk.title} index={index} title={perk.title} body={perk.body} />
          ))}
        </ol>
      </div>
    </Section>
  );
}

/* --- Testimonials ------------------------------------------------------- */

/**
 * Members in their own words, one at a time.
 *
 * A single large quote with explicit controls, rather than a carousel that
 * advances on a timer: a quote this size takes longer to read than any
 * interval would allow, and moving it under the reader is hostile. The
 * figure is a live region so the swap is announced.
 */
export function VoicesBand({
  testimonials,
}: {
  testimonials: { quote: string; name: string; role: string }[];
}) {
  const [index, setIndex] = useState(0);

  if (testimonials.length === 0) return null;

  const current = testimonials[index] ?? testimonials[0]!;
  const go = (next: number) => setIndex((next + testimonials.length) % testimonials.length);

  return (
    <Section id="voices" tone="brand" divided>
      <div className="shell">
        <Reveal>
          <SectionLabel n="10" className="text-on-contrast/70">
            Members
          </SectionLabel>
        </Reveal>

        <div className="relative mt-10">
          <span
            aria-hidden="true"
            className="cond pointer-events-none absolute -top-16 -left-2 text-[16rem] leading-none text-on-contrast/10 select-none sm:-top-28 sm:text-[28rem]"
          >
            &ldquo;
          </span>

          <figure aria-live="polite" className="relative">
            {/* Keyed on the index so React replaces the node rather than
                mutating it, which is what re-triggers the entrance. */}
            <blockquote
              key={index}
              className="swap max-w-[22ch] font-display text-[clamp(1.9rem,5.6vw,5rem)] leading-[0.98] font-bold tracking-[-0.03em] [font-stretch:70%] sm:max-w-[26ch]"
            >
              {current.quote}
            </blockquote>

            <figcaption
              key={`caption-${index}`}
              className="swap mt-10 flex items-center gap-4"
              style={{ animationDelay: '120ms' }}
            >
              <span aria-hidden="true" className="h-px w-12 bg-current" />
              <span>
                <span className="block text-[1.0625rem] font-semibold">{current.name}</span>
                <span className="mono mt-1 block opacity-70">{current.role}</span>
              </span>
            </figcaption>
          </figure>
        </div>

        {testimonials.length > 1 && (
          <div className="mt-14 flex items-center justify-between gap-6 border-t border-on-contrast/30 pt-6">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a testimonial">
              {testimonials.map((item, dot) => (
                <button
                  key={item.name + dot}
                  type="button"
                  onClick={() => setIndex(dot)}
                  aria-pressed={dot === index}
                  aria-label={`Testimonial ${dot + 1} of ${testimonials.length}: ${item.name}`}
                  className={cn(
                    'mono flex size-11 items-center justify-center border border-on-contrast/40 transition-all duration-300',
                    dot === index
                      ? 'bg-silk text-ink'
                      : 'hover:-translate-y-0.5 hover:bg-on-contrast/10',
                  )}
                >
                  {String(dot + 1).padStart(2, '0')}
                </button>
              ))}
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous testimonial"
                className="flex size-11 items-center justify-center border border-on-contrast/40 transition-all duration-300 hover:-translate-x-0.5 hover:bg-silk hover:text-ink"
              >
                <ArrowRightIcon className="size-4 rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next testimonial"
                className="flex size-11 items-center justify-center border border-on-contrast/40 transition-all duration-300 hover:translate-x-0.5 hover:bg-silk hover:text-ink"
              >
                <ArrowRightIcon className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

/* --- FAQ ---------------------------------------------------------------- */

/**
 * The questions the branch is actually asked.
 *
 * The panels animate on `grid-template-rows: 0fr → 1fr` rather than on a
 * measured pixel height, so each one sizes itself to its own content and
 * nothing has to be read back out of the DOM to animate it.
 */
export function FaqBand({
  faqs,
  email,
}: {
  faqs: { question: string; answer: string }[];
  email: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  if (faqs.length === 0) return null;

  return (
    <Section id="faq" tone="paper" divided>
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <SectionLabel n="11">FAQ</SectionLabel>
            </Reveal>

            <Words as="h2" className="fluid-heading mt-7 block" text={'Fair\n*questions.*'} />

            <Reveal delay={0.2}>
              <p className="mt-7 max-w-[34ch] leading-relaxed text-secondary">
                Still wondering? Write to the branch directly.
              </p>
              <a href={`mailto:${email}`} className="mono mt-2 inline-block py-2">
                <span className="u-sweep">{email}</span>
              </a>
            </Reveal>
          </div>
        </div>

        <ul className="border-b border-line lg:col-span-7">
          {faqs.map((faq, index) => {
            const isOpen = open === index;

            return (
              <li key={faq.question} className="border-t border-line">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${index}`}
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="group flex w-full items-start justify-between gap-6 py-6 text-left sm:py-8"
                  >
                    <span
                      className={cn(
                        'cond text-[clamp(1.4rem,3vw,2.25rem)] leading-[0.98] tracking-[-0.01em] transition-transform duration-500',
                        !isOpen && 'group-hover:translate-x-2',
                      )}
                    >
                      {faq.question}
                    </span>

                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center border transition-all duration-500',
                        isOpen
                          ? 'border-ink bg-ink-surface text-on-contrast'
                          : 'border-line-strong group-hover:bg-signal-fill group-hover:text-on-accent',
                      )}
                    >
                      <PlusIcon
                        className={cn(
                          'size-4 transition-transform duration-500',
                          isOpen && 'rotate-[135deg]',
                        )}
                      />
                    </span>
                  </button>
                </h3>

                <div className="accordion-grid" data-open={isOpen}>
                  <div>
                    <p
                      id={`faq-a-${index}`}
                      role="region"
                      aria-labelledby={`faq-q-${index}`}
                      className="max-w-[58ch] pr-14 pb-8 leading-[1.7] text-secondary"
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

/* --- Call to action ----------------------------------------------------- */

/**
 * The closing call to action.
 *
 * The join form itself lives on Google Forms, so this is a link rather than
 * a form - which is the honest thing to render. A form here that posted
 * nowhere would be worse than a button.
 */
export function JoinCta({
  heading,
  body,
  joinUrl,
}: {
  heading: string;
  body: string;
  joinUrl?: string;
}) {
  return (
    <Section id="join" tone="brand" divided>
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col justify-between gap-12 lg:col-span-7">
          <Words
            as="h2"
            className="block text-[clamp(3rem,11vw,9rem)] leading-[0.84]"
            text={heading}
            accent="text-signal-on-dark"
            step={120}
          />

          {body && (
            <Reveal delay={0.2}>
              <p className="max-w-[42ch] text-lg leading-relaxed text-on-contrast/75">{body}</p>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.15} className="lg:col-span-5">
          <div className="bg-silk p-7 text-ink shadow-[8px_8px_0_0_var(--accent)] sm:p-9">
            <p className="mono text-muted">Membership</p>

            <p className="mt-6 text-[1.0625rem] leading-relaxed text-secondary">
              Membership runs through the IEEE student branch form. It takes a couple of minutes,
              and the branch will follow up over email.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {joinUrl && (
                <a
                  href={joinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-lg w-full"
                >
                  Apply to join
                  <ArrowUpRightIcon className="size-4" />
                </a>
              )}
              <Link to="/contact" className="btn btn-secondary btn-lg w-full">
                Collaborate with us
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
