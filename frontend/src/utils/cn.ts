import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Join class names, resolving Tailwind conflicts in favour of the last one.
 *
 * This is the one to reach for in a component that takes a `variant` or a
 * `className`: `cn('bg-ink-surface', variant === 'accent' && 'bg-signal')`
 * yields only `bg-signal`, whereas a plain join would emit both and leave
 * the winner to be decided by the order the two rules happen to sit in the
 * generated stylesheet - which is not something a caller can reason about.
 *
 * For a fixed set of class names with nothing to conflict, `cx` in
 * `./format` is cheaper and says the same thing.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
