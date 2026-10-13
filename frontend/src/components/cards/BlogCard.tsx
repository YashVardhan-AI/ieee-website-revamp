/** Blog cards: the standard grid card and the wide featured variant. */

import { Link } from 'react-router-dom';
import { cx, formatDate } from '@/utils/format';
import { Avatar, Image } from '@/components/ui/Media';
import { ArrowUpRightIcon, ClockIcon } from '@/components/ui/Icons';
import type { BlogPostSummary } from '@/types/api';

function Meta({ post }: { post: BlogPostSummary }) {
  const published = formatDate(post.published_at);
  return (
    <div className="mono flex items-center gap-2 text-muted">
      {/* Historical posts carry no date, so the separator only appears when
          there is something on both sides of it. */}
      {published && <time dateTime={post.published_at ?? undefined}>{published}</time>}
      {published && post.reading_minutes ? <span aria-hidden="true">·</span> : null}
      {post.reading_minutes ? (
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="size-3" />
          {post.reading_minutes} min read
        </span>
      ) : null}
    </div>
  );
}

function Byline({ post }: { post: BlogPostSummary }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar src={post.author_image} name={post.author_name} size="size-8" />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold">{post.author_name}</p>
        {post.author_subtitle && <p className="mono truncate text-muted">{post.author_subtitle}</p>}
      </div>
    </div>
  );
}

export function BlogCard({ post, className }: { post: BlogPostSummary; className?: string }) {
  return (
    <article className={cx('card card-interactive group flex h-full flex-col', className)}>
      <Link to={`/blogs/${post.slug}`} className="flex h-full flex-col focus-visible:outline-none">
        <div className="relative">
          <Image
            src={post.cover_image}
            alt={post.cover_image_alt ?? ''}
            aspect="aspect-16/10"
            className="halftone-screen"
            imageClassName="group-hover:scale-[1.04]"
          />
          {post.category && (
            <span className="mono absolute top-3 left-3 z-[2] border border-line bg-paper px-2.5 py-1 text-ink">
              {post.category.name}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <Meta post={post} />

          <h3 className="caps text-[1.0625rem] leading-[1.1]">{post.title}</h3>

          {post.excerpt && (
            <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-subtle pt-4">
            <Byline post={post} />
            <ArrowUpRightIcon className="size-4 shrink-0 text-signal opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
          </div>
        </div>
      </Link>
    </article>
  );
}

/**
 * The lead article, given a two-column layout so it reads as the most
 * important thing on the page without needing a louder colour.
 */
export function FeaturedBlogCard({ post }: { post: BlogPostSummary }) {
  return (
    <article className="card card-interactive group overflow-hidden">
      <Link
        to={`/blogs/${post.slug}`}
        className="grid gap-0 focus-visible:outline-none md:grid-cols-5"
      >
        <div className="md:col-span-2">
          <Image
            src={post.cover_image}
            alt={post.cover_image_alt ?? ''}
            aspect="aspect-16/10 md:aspect-auto md:h-full"
            className="halftone-screen md:h-full"
            imageClassName="group-hover:scale-[1.04]"
          />
        </div>

        <div className="flex flex-col gap-4 p-6 md:col-span-3 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="chip chip-active">Featured</span>
            {post.category && <span className="chip">{post.category.name}</span>}
          </div>

          <h3 className="fluid-subheading caps">{post.title}</h3>

          {post.excerpt && (
            <p className="line-clamp-3 leading-relaxed text-muted">{post.excerpt}</p>
          )}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-line-subtle pt-5">
            <Byline post={post} />
            <Meta post={post} />
          </div>
        </div>
      </Link>
    </article>
  );
}

/** A compact row, used for "related reading" beneath an article. */
export function BlogCardCompact({ post }: { post: BlogPostSummary }) {
  return (
    <article className="group">
      <Link to={`/blogs/${post.slug}`} className="flex gap-4">
        <Image
          src={post.cover_image}
          alt=""
          aspect="aspect-square"
          className="w-20 shrink-0"
          imageClassName="group-hover:scale-[1.05]"
        />
        <div className="min-w-0 space-y-1.5">
          {post.category && <p className="mono text-signal">{post.category.name}</p>}
          <h4 className="caps line-clamp-2 font-display text-sm leading-[1.15] font-bold">
            {post.title}
          </h4>
          <Meta post={post} />
        </div>
      </Link>
    </article>
  );
}
