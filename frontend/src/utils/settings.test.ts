/**
 * The settings readers.
 *
 * These parse editorial content the branch types into a textarea, so the
 * cases that matter are the malformed ones: a half-finished line must drop
 * out rather than render as an empty row, because an empty row is what the
 * sections use to decide whether to appear at all.
 */

import { describe, expect, it } from 'vitest';
import { toFaqs, toList, toParagraphs, toTestimonials, toTitledList } from './settings';

describe('toParagraphs', () => {
  it('splits on blank lines and joins wrapped lines', () => {
    expect(toParagraphs('One line\nwrapped.\n\nSecond para.')).toEqual([
      'One line wrapped.',
      'Second para.',
    ]);
  });

  it('is empty for an empty setting', () => {
    expect(toParagraphs('')).toEqual([]);
    expect(toParagraphs('\n\n  \n')).toEqual([]);
  });
});

describe('toList', () => {
  it('trims and drops blank lines', () => {
    expect(toList('  a  \n\n b \n')).toEqual(['a', 'b']);
  });
});

describe('toTitledList', () => {
  it('splits a title from its body on the first pipe', () => {
    expect(toTitledList('Grants | Eligibility for IEEE grants.')).toEqual([
      { title: 'Grants', body: 'Eligibility for IEEE grants.' },
    ]);
  });

  it('keeps later pipes in the body', () => {
    expect(toTitledList('A | b | c')).toEqual([{ title: 'A', body: 'b | c' }]);
  });

  it('accepts a bare line as a title with no body', () => {
    // The perks list was a plain list before it gained bodies, so existing
    // content has to keep working unchanged.
    expect(toTitledList('Just a perk.')).toEqual([{ title: 'Just a perk.', body: '' }]);
  });

  it('drops a line that is only a pipe', () => {
    expect(toTitledList('| body only')).toEqual([]);
  });
});

describe('toFaqs', () => {
  it('reads a question and its answer', () => {
    expect(toFaqs('Do I need ECE? | No, any programme.')).toEqual([
      { question: 'Do I need ECE?', answer: 'No, any programme.' },
    ]);
  });

  it('drops a question with no answer, which would open onto nothing', () => {
    expect(toFaqs('Unanswered?\nAnswered? | Yes.')).toEqual([
      { question: 'Answered?', answer: 'Yes.' },
    ]);
  });

  it('is empty for an empty setting, which hides the section', () => {
    expect(toFaqs('')).toEqual([]);
  });
});

describe('toTestimonials', () => {
  it('reads quote, name and role', () => {
    expect(toTestimonials('It was good. | A. Member | ECE, Robotics')).toEqual([
      { quote: 'It was good.', name: 'A. Member', role: 'ECE, Robotics' },
    ]);
  });

  it('keeps a pipe inside the quote by splitting from the right', () => {
    expect(toTestimonials('Signal | noise, mostly. | A. Member | Research')).toEqual([
      { quote: 'Signal | noise, mostly.', name: 'A. Member', role: 'Research' },
    ]);
  });

  it('drops a line missing its attribution', () => {
    // An unattributed testimonial is not usable, and rendering one with a
    // blank byline looks like a bug rather than like missing data.
    expect(toTestimonials('No attribution at all')).toEqual([]);
    expect(toTestimonials('Quote | Name only')).toEqual([]);
    expect(toTestimonials('Quote |  | Role')).toEqual([]);
  });

  it('reads several lines', () => {
    const parsed = toTestimonials('A. | One | R1\nB. | Two | R2');
    expect(parsed).toHaveLength(2);
    expect(parsed[1]).toEqual({ quote: 'B.', name: 'Two', role: 'R2' });
  });
});
