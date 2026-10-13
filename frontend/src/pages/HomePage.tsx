/**
 * The landing page.
 *
 * Everything it renders arrives in one `/landing` request, so the page does
 * not stage in piece by piece as six separate calls resolve.
 *
 * The bands run in a fixed order and are numbered in their labels, so the
 * page reads as a contents list: who we are, what we do, what we run, who
 * we do it with, who we are made of, what you get, and how to join. Any
 * band whose data or setting is empty removes itself, and the numbering is
 * given per band rather than computed - a gap in the sequence is the price
 * of a section the branch has not filled in yet, and it is a cheaper price
 * than a renumbering that makes last week's screenshot wrong.
 */

import { publicApi } from '@/api/endpoints';
import { useAsync } from '@/hooks/useAsync';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Seo } from '@/components/Seo';
import { Hero } from '@/components/home/Hero';
import { AboutPreview, WhatWeDo } from '@/components/home/WhatWeDo';
import {
  AlumniBand,
  CollaborationsBand,
  CoreTeamBand,
  FaqBand,
  FeaturedBlogs,
  FeaturedEvents,
  IeeeDayBand,
  JoinCta,
  PerksBand,
  StatsBand,
  VoicesBand,
} from '@/components/home/Sections';
import { ErrorState, PageLoader } from '@/components/ui/States';
import { toFaqs, toTestimonials, toTitledList } from '@/utils/settings';

export default function HomePage() {
  const { data, error, loading, reload } = useAsync((signal) => publicApi.landing(signal), []);
  const { text, link } = useSiteSettings();

  const description = text(
    'meta_description',
    'The IEEE student branch at IIIT Delhi. Technical events, workshops, talks and competitions run by students.',
  );
  const email = text('contact_email', 'ieee@iiitd.ac.in');
  const joinUrl = link('join_url');

  // The organisation's structured data, so search results can show the
  // branch as an entity rather than just a page.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'IEEE Student Branch, IIIT Delhi',
    alternateName: 'IEEE IIIT Delhi',
    description,
    email,
    parentOrganization: { '@type': 'Organization', name: 'IEEE' },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Okhla Industrial Estate, Phase III',
      addressLocality: 'New Delhi',
      postalCode: '110020',
      addressCountry: 'IN',
    },
  };

  return (
    <>
      <Seo title="IEEE IIIT Delhi" description={description} canonicalPath="/" jsonLd={jsonLd} />

      {/* The hero renders immediately with whatever it has, so the first
          paint is the headline rather than a spinner. */}
      <Hero featured={data?.featured_events[0] ?? null} />

      {loading && !data && <PageLoader label="Loading the page" />}

      {error && !data && (
        <div className="shell py-16">
          <ErrorState error={error} onRetry={reload} />
        </div>
      )}

      {data && (
        <>
          <StatsBand stats={data.stats} alumni={data.featured_alumni} />

          <AboutPreview
            summary={text(
              'about_short',
              "IEEE-IIITD is the student branch of the world's largest technical professional organisation.",
            )}
            body={text('about_body', '')}
          />

          <WhatWeDo />

          <FeaturedEvents events={data.featured_events} />

          <IeeeDayBand edition={data.ieee_day} />

          <CollaborationsBand collaborations={data.featured_collaborations} />

          <CoreTeamBand members={data.core_team} />

          <FeaturedBlogs posts={data.featured_posts} />

          <AlumniBand alumni={data.featured_alumni} />

          <PerksBand perks={toTitledList(text('join_perks', ''))} joinUrl={joinUrl} />

          <VoicesBand testimonials={toTestimonials(text('testimonials', ''))} />

          <FaqBand faqs={toFaqs(text('faqs', ''))} email={email} />

          <JoinCta
            heading={text('join_heading', 'Take the\n*seat.*')}
            body={text('join_body', '')}
            joinUrl={joinUrl}
          />
        </>
      )}
    </>
  );
}
