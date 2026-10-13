/**
 * "What we do" - the branch's areas of work - and the short about block.
 *
 * Fixed rather than database-driven: these are the categories of work the
 * branch does, not a content list that changes between terms. The events,
 * blogs and team sections next to it carry the live data. The copy is the
 * branch's own and names real events - add a category here rather than
 * inventing one to fill the grid, which reflows cleanly at any count.
 *
 * Laid out as a bordered grid of cells on the navy band, each one filling
 * with brand blue on hover while its icon draws itself in. The drawing is
 * triggered by `.cell` in CSS rather than by React, so hovering sixty times
 * costs no renders - and `focus-within` fires the same effect, so the
 * keyboard sees what the pointer does.
 */

import { Section, SectionHeader } from '@/components/ui/Section';
import { Reveal } from '@/components/ui/Reveal';
import { toParagraphs } from '@/utils/settings';
import {
  WingCircuitsIcon,
  WingCompeteIcon,
  WingResearchIcon,
  WingRoboticsIcon,
  WingStudioIcon,
  WingTalksIcon,
} from '@/components/ui/Icons';
import type { ComponentType } from 'react';

interface Activity {
  Icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const ACTIVITIES: Activity[] = [
  {
    Icon: WingCompeteIcon,
    title: 'Competitions',
    description:
      'Cryptic hunts, lockout coding duels, quizzes and hardware challenges. Slash, Xgrid and Bachmanity Insanity have run for years and still fill a room.',
  },
  {
    Icon: WingRoboticsIcon,
    title: 'Hardware & robotics',
    description:
      'Build a mini oscilloscope, fight a battle bot, wire up an Arduino. The sessions that get you away from a screen.',
  },
  {
    Icon: WingCircuitsIcon,
    title: 'Workshops',
    description:
      'Web development, CTFs, machine learning, home electronics labs. Hands on keyboards, something working by the end.',
  },
  {
    Icon: WingTalksIcon,
    title: 'Talks & seminars',
    description:
      "Engineers and researchers on what they actually work on - India's semiconductor ecosystem, packaging, the problems that are still open.",
  },
  {
    Icon: WingStudioIcon,
    title: 'Student initiatives',
    description:
      'The Women in Engineering and Computer Society sub-chapters run their own programmes, including STEM outreach to school students.',
  },
  {
    Icon: WingResearchIcon,
    title: 'Research culture',
    description:
      "Access to IEEE's publications and a membership that puts you in the same room as the people writing them.",
  },
];

export function WhatWeDo() {
  return (
    <Section id="what-we-do" tone="brand" divided>
      <div className="shell">
        <SectionHeader
          n="02"
          eyebrow="What we do"
          title={'Pick a corner.\n*Go deep.*'}
          accent="text-signal-on-dark"
          description="Everything here is run by students and open to any programme. About a third of members move between areas mid-semester, and nobody minds."
        />

        {/* One grid, bordered on the top and left, with each cell drawing
            its own right and bottom edge - so the rules never double up at
            a seam however the grid reflows. */}
        <ul className="mt-16 grid border-t border-l border-on-contrast/25 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVITIES.map(({ Icon, title, description }, index) => (
            <li key={title}>
              <Reveal delay={(index % 3) * 0.08} className="h-full">
                <div className="cell group relative flex h-full min-h-[18rem] flex-col justify-between border-r border-b border-on-contrast/25 p-6 transition-colors duration-500 hover:bg-signal-fill hover:text-on-accent focus-within:bg-signal-fill focus-within:text-on-accent sm:p-8">
                  <div className="flex items-start justify-between">
                    <Icon className="ico size-14 text-signal-on-dark transition-colors duration-500 group-hover:text-on-accent group-focus-within:text-on-accent" />
                    <span className="mono opacity-60">{String(index + 1).padStart(2, '0')}</span>
                  </div>

                  <div>
                    <h3 className="caps text-[clamp(1.3rem,2.1vw,1.75rem)] leading-[0.98] transition-transform duration-500 group-hover:translate-x-1">
                      {title}
                    </h3>
                    <p className="mt-4 max-w-[34ch] text-[0.9375rem] leading-relaxed opacity-70 transition-opacity duration-500 group-hover:opacity-100">
                      {description}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/**
 * The short "who we are" block.
 *
 * The summary is set large as a standfirst and the body runs beside it in
 * two columns, which is how a magazine would open a feature and keeps a
 * five-paragraph block from reading as a wall.
 */
export function AboutPreview({ summary, body }: { summary: string; body: string }) {
  const paragraphs = toParagraphs(body);

  return (
    <Section id="about" tone="paper" divided>
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeader n="01" eyebrow="The branch" title={'Who\n*we are.*'} />
        </div>

        <div className="lg:col-span-7">
          <Reveal>
            <p className="text-[clamp(1.25rem,2.1vw,1.6rem)] leading-[1.35] font-medium text-ink">
              {summary}
            </p>
          </Reveal>

          {paragraphs.length > 0 && (
            <Reveal delay={0.15}>
              <div className="mt-8 columns-1 gap-10 text-[0.9375rem] leading-relaxed text-secondary md:columns-2 [&>p]:mb-4">
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </Section>
  );
}
