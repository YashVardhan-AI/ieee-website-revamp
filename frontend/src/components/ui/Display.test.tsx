/**
 * The headline component.
 *
 * Two things matter here and neither is visual: the accent markup has to
 * survive being split into words, and the heading has to reach a screen
 * reader as one sentence rather than as a stream of separate words.
 */

import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Words } from './Display';
import { renderWithProviders } from '@/test/utils';

/** The plain string offered to assistive technology. */
function spokenText(container: HTMLElement): string {
  return container.querySelector('.sr-only')?.textContent ?? '';
}

/** The words rendered for sighted readers, in order. */
function visibleWords(container: HTMLElement): string[] {
  return [...container.querySelectorAll('.wm > span')].map((el) => el.textContent ?? '');
}

describe('Words', () => {
  it('reads as one sentence, with the split-up copy hidden from the reader', () => {
    const { container } = renderWithProviders(<Words text={'Build.\n*Publish.*\nShip.'} />);

    expect(spokenText(container)).toBe('Build. Publish. Ship.');
    // The visual copy is hidden so the heading is not announced twice.
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('splits into one maskable span per word', () => {
    const { container } = renderWithProviders(<Words text={'Build.\nShip.'} />);

    expect(visibleWords(container)).toEqual(['Build.', 'Ship.']);
  });

  it('accents the words inside asterisks and no others', () => {
    const { container } = renderWithProviders(
      <Words text={'Plain *accented* plain'} accent="text-signal" />,
    );

    const accented = [...container.querySelectorAll('.wm > span')].filter((el) =>
      el.classList.contains('text-signal'),
    );
    expect(accented.map((el) => el.textContent)).toEqual(['accented']);
  });

  it('accents every word of a multi-word span', () => {
    // Asterisks delimit a span rather than a word, so an author does not
    // have to mark each word of a phrase separately.
    const { container } = renderWithProviders(
      <Words text={'Lead *two words* trail'} accent="text-signal" />,
    );

    const accented = [...container.querySelectorAll('.wm > span')]
      .filter((el) => el.classList.contains('text-signal'))
      .map((el) => el.textContent);
    expect(accented).toEqual(['two', 'words']);
  });

  it('strips the markup from what is spoken', () => {
    const { container } = renderWithProviders(<Words text={'Take the\n*seat.*'} />);

    expect(spokenText(container)).toBe('Take the seat.');
  });

  it('staggers the words, so each one moves after the last', () => {
    const { container } = renderWithProviders(<Words text="One two three" delay={100} step={70} />);

    const delays = [...container.querySelectorAll<HTMLElement>('.wm > span')].map((el) =>
      el.style.getPropertyValue('--wm-d'),
    );
    expect(delays).toEqual(['100ms', '170ms', '240ms']);
  });

  it('renders the requested element, so a heading is a heading', () => {
    renderWithProviders(<Words as="h2" text="A heading" />);

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('collapses extra whitespace rather than emitting empty words', () => {
    const { container } = renderWithProviders(<Words text={'One   two\n\nthree'} />);

    expect(visibleWords(container)).toEqual(['One', 'two', 'three']);
  });
});
