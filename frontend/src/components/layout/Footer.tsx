/**
 * Site footer: identity, navigation, affiliations, socials and contact.
 *
 * Everything here reads from site settings, so the branch can change an
 * address, a social handle or the join link from the dashboard.
 *
 * It closes the page the way every other band opens one - overlapping the
 * section above it with a rounded lip - and ends on the branch name set as
 * large as the viewport allows. That lettering is sized in container-query
 * units rather than viewport units so it tracks the shell's width instead
 * of the window's, which keeps it from colliding with the gutters.
 */

import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  ArrowUpIcon,
  ArrowUpRightIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  MapPinIcon,
  XIcon,
  YouTubeIcon,
} from '@/components/ui/Icons';
import { Brand } from './Brand';

const SITE_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/team', label: 'Team' },
  { to: '/events', label: 'Events' },
  { to: '/blogs', label: 'Blog' },
  { to: '/ieee-day', label: 'IEEE Day' },
  { to: '/alumni', label: 'Alumni' },
  { to: '/collaborations', label: 'Collaborations' },
  { to: '/contact', label: 'Contact' },
] as const;

export function Footer() {
  const { text, link } = useSiteSettings();
  const email = text('contact_email', 'ieee@iiitd.ac.in');
  const address = text(
    'contact_address',
    'IIIT Delhi, Okhla Industrial Estate, Phase III, New Delhi 110020',
  );

  const socials = [
    { key: 'instagram_url', label: 'Instagram', Icon: InstagramIcon },
    { key: 'linkedin_url', label: 'LinkedIn', Icon: LinkedInIcon },
    { key: 'twitter_url', label: 'X', Icon: XIcon },
    { key: 'youtube_url', label: 'YouTube', Icon: YouTubeIcon },
    { key: 'facebook_url', label: 'Facebook', Icon: FacebookIcon },
  ]
    .map((social) => ({ ...social, href: link(social.key) }))
    .filter((social): social is typeof social & { href: string } => Boolean(social.href));

  const affiliations = [
    { key: 'institute_url', label: 'IIIT Delhi' },
    { key: 'ieee_url', label: 'IEEE' },
    { key: 'wie_url', label: 'Women in Engineering' },
    { key: 'compsoc_url', label: 'IEEE Computer Society' },
  ]
    .map((item) => ({ ...item, href: link(item.key) }))
    .filter((item): item is typeof item & { href: string } => Boolean(item.href));

  const brandingUrl = link('branding_url');

  return (
    <footer className="band grain mt-auto bg-ink-surface text-on-contrast">
      <div className="shell relative pt-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Identity and the email, set as a heading because it is the one
              thing most visitors come down here for. */}
          <div className="lg:col-span-5">
            <Brand tone="dark" />

            <p className="mt-6 max-w-[38ch] text-[0.9375rem] leading-relaxed text-on-contrast/70">
              {text(
                'about_short',
                "The student branch of the world's largest technical professional organisation, at IIIT Delhi.",
              )}
            </p>

            <a
              href={`mailto:${email}`}
              className="group mt-6 inline-flex items-center gap-2 font-display text-[clamp(1.1rem,2.2vw,1.5rem)] font-bold [font-stretch:100%]"
            >
              <span className="u-sweep break-all">{email}</span>
              <ArrowUpRightIcon className="size-5 shrink-0 text-signal-on-dark transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>

            <p className="mt-5 flex items-start gap-2 text-sm text-on-contrast/60">
              <MapPinIcon className="mt-0.5 size-4 shrink-0 text-signal-on-dark" />
              <span>{address}</span>
            </p>
          </div>

          <nav aria-labelledby="footer-site" className="lg:col-span-3 lg:col-start-7">
            <h2 id="footer-site" className="mono mb-5 text-on-contrast/60">
              Explore
            </h2>
            <ul className="grid grid-cols-2 gap-y-1 lg:grid-cols-1">
              {SITE_LINKS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="inline-block py-1.5 text-[0.9375rem]">
                    <span className="u-sweep">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            {affiliations.length > 0 && (
              <nav aria-labelledby="footer-affiliations">
                <h2 id="footer-affiliations" className="mono mb-5 text-on-contrast/60">
                  Affiliations
                </h2>
                <ul className="space-y-1">
                  {affiliations.map((item) => (
                    <li key={item.key}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-2 py-1.5 text-[0.9375rem]"
                      >
                        <span className="u-sweep">{item.label}</span>
                        <ArrowUpRightIcon className="size-3.5 opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {socials.length > 0 && (
              <>
                <h2 className="mono mt-9 mb-4 text-on-contrast/60">Elsewhere</h2>
                <ul className="flex flex-wrap items-center gap-2">
                  {socials.map(({ key, label, href, Icon }) => (
                    <li key={key}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`IEEE IIIT Delhi on ${label}`}
                        title={label}
                        className="grid size-10 place-items-center border border-on-contrast/25 transition-colors duration-200 hover:bg-silk hover:text-ink"
                      >
                        <Icon className="size-[1.0625rem]" />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* The branch name, as large as the shell allows. Decorative, so it
            is hidden from the accessibility tree rather than read out as a
            second wordmark. */}
        <div className="mt-20 [container-type:inline-size]" aria-hidden="true">
          <p className="wide -mb-[2cqw] text-center text-[16.6cqw] leading-[0.8] tracking-[-0.05em] whitespace-nowrap text-on-contrast/[0.07] transition-colors duration-700 select-none hover:text-signal-on-dark/40">
            IEEE IIITD
          </p>
        </div>
      </div>

      <div className="relative border-t border-on-contrast/15">
        <div className="shell flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono max-w-[70ch] text-on-contrast/55">
            © {new Date().getFullYear()} IEEE Student Branch, IIIT Delhi. IEEE is a registered
            trademark of the Institute of Electrical and Electronics Engineers.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {brandingUrl && (
              <a
                href={brandingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-on-contrast/55"
              >
                <span className="u-sweep">Graphic identity</span>
              </a>
            )}
            <Link to="/admin" className="mono text-on-contrast/55">
              <span className="u-sweep">Admin</span>
            </Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mono inline-flex items-center gap-1.5 text-on-contrast/55"
            >
              <span className="u-sweep">Back to top</span>
              <ArrowUpIcon className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
