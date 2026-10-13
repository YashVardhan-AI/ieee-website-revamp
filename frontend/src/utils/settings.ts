/**
 * Readers for the multi-line site settings.
 *
 * A few sections - the perks list, the testimonials, the FAQ - are editorial
 * rather than records in the database. Giving each one a table, a migration
 * and an admin screen would be a lot of machinery for a list that changes
 * once a year, so they live in site settings as text and are parsed here.
 *
 * The formats are chosen to be obvious in a textarea and in `site.yaml`:
 * one item per line, fields separated by `|`. Every reader returns an empty
 * array for empty or malformed input, and the sections that use them render
 * nothing when the array is empty - so an unfilled setting shows no section
 * rather than an empty heading.
 */

/** Split a block of prose into paragraphs on blank lines. */
export function toParagraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

/** Split a newline-separated setting into items. */
export function toList(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * `Title | body text` per line.
 *
 * Split on the *first* pipe only, so the body may contain pipes of its own.
 * Used for the perks list and anywhere else a heading needs a sentence
 * under it. A line with no pipe becomes a title with no body, which is what
 * lets the same setting carry a plain list.
 */
export function toTitledList(value: string): { title: string; body: string }[] {
  return toList(value)
    .map((line) => {
      const at = line.indexOf('|');
      if (at === -1) return { title: line, body: '' };
      return { title: line.slice(0, at).trim(), body: line.slice(at + 1).trim() };
    })
    .filter((item) => item.title.length > 0);
}

/**
 * `Question? | answer` per line, split on the first pipe.
 *
 * Lines without an answer are dropped: a question with nothing under it
 * would open onto an empty panel.
 */
export function toFaqs(value: string): { question: string; answer: string }[] {
  return toTitledList(value)
    .filter((item) => item.body.length > 0)
    .map((item) => ({ question: item.title, answer: item.body }));
}

/**
 * `Quote | Name | Role` per line.
 *
 * Split from the right, taking the last two fields as the attribution, so a
 * quote containing a pipe survives. A line with fewer than three fields is
 * dropped - an unattributed testimonial is not usable.
 */
export function toTestimonials(value: string): { quote: string; name: string; role: string }[] {
  return toList(value)
    .map((line) => {
      const lastPipe = line.lastIndexOf('|');
      if (lastPipe === -1) return null;
      const firstPart = line.slice(0, lastPipe);
      const role = line.slice(lastPipe + 1).trim();

      const secondPipe = firstPart.lastIndexOf('|');
      if (secondPipe === -1) return null;

      const quote = firstPart.slice(0, secondPipe).trim();
      const name = firstPart.slice(secondPipe + 1).trim();

      if (!quote || !name || !role) return null;
      return { quote, name, role };
    })
    .filter((item): item is { quote: string; name: string; role: string } => item !== null);
}
