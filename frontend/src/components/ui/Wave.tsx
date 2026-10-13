/**
 * The oscilloscope trace: noise in, signal out.
 *
 * The left of the trace is chaotic and the right resolves into a clean
 * waveform, which is the branch's whole pitch drawn in one line. It is the
 * only canvas on the site, and it earns that by doing something no amount of
 * CSS could: a continuous curve whose shape, frequency and noise floor all
 * respond to the visitor.
 *
 * It fills its positioned parent, so the parent needs `position: relative`.
 *
 * WHAT DRIVES IT
 *
 *   `drive="pointer"` - frequency follows the pointer's x, amplitude its y.
 *   `drive="scroll"`  - the trace cleans up as its host scrolls past: high
 *                       frequency and a loud noise floor at the top,
 *                       resolving to a slow clean wave by the bottom.
 *
 * Scroll mode measures its own host rather than being handed a progress
 * value from a parent. That keeps the parent from re-rendering sixty times a
 * second to feed it, and avoids the obvious alternative of passing the value
 * through a synthetic DOM event, which works but hides a data dependency
 * inside the event system where nothing can see it.
 *
 * COST
 *
 * One rAF loop, gated on an IntersectionObserver, so it stops entirely when
 * scrolled out of view. Under `prefers-reduced-motion` it draws exactly one
 * static frame and never starts the loop.
 */

import { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';

export type WaveKind = 'sine' | 'square' | 'saw' | 'tri';

const TAU = Math.PI * 2;

/** The idealised waveform, before noise is mixed in. */
function shape(kind: WaveKind, phase: number): number {
  switch (kind) {
    case 'square':
      // tanh rather than a sign test, so the edges are steep but still
      // antialias instead of stair-stepping.
      return Math.tanh(7 * Math.sin(phase));
    case 'saw': {
      const fraction = (phase / TAU) % 1;
      return 2 * (fraction < 0 ? fraction + 1 : fraction) - 1;
    }
    case 'tri':
      return (2 / Math.PI) * Math.asin(Math.sin(phase));
    default:
      return Math.sin(phase);
  }
}

/** Smoothstep between two edges. */
function smooth(from: number, to: number, at: number): number {
  const t = Math.min(Math.max((at - from) / (to - from), 0), 1);
  return t * t * (3 - 2 * t);
}

interface WaveProps {
  kind?: WaveKind;
  drive?: 'pointer' | 'scroll';
  className?: string;
}

export function Wave({ kind = 'sine', drive = 'pointer', className }: WaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Held in a ref so changing the waveform does not tear down the loop.
  const kindRef = useRef(kind);
  kindRef.current = kind;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let frame = 0;
    let scrollFrame = 0;
    let visible = true;
    let phase = 0;
    let last = performance.now();
    // The trace eases toward its target rather than snapping to it, so a
    // flick of the pointer reads as the beam catching up.
    const target = { frequency: 2.2, amplitude: 0.5 };
    const current = { frequency: 2.2, amplitude: 0.5 };

    /* --- Colour ------------------------------------------------------
       Canvas cannot resolve `currentColor`, so the stroke colour is read
       off the element's computed `color` - which the class list sets from
       a theme token. Re-read only when something could have changed it,
       since getComputedStyle forces a style recalculation. */
    let stroke = '#00629b';
    const readColour = () => {
      stroke = getComputedStyle(canvas).color || stroke;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const bounds = host.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColour();
    };

    const draw = (now: number) => {
      // Clamped, so a tab restored after a minute in the background does
      // not advance the phase by a minute's worth in one step.
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      const time = now / 1000;

      current.frequency += (target.frequency - current.frequency) * 0.06;
      current.amplitude += (target.amplitude - current.amplitude) * 0.06;
      phase += delta * (0.55 + current.frequency * 0.16);

      ctx.clearRect(0, 0, width, height);
      const mid = height * 0.5;
      const amp = height * (0.06 + current.amplitude * 0.2);
      const thickness = Math.max(2.5, width / 420);
      const kindNow = kindRef.current;

      ctx.lineWidth = thickness;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = stroke;
      ctx.beginPath();

      const step = Math.max(2, Math.round(width / 700));
      let endY = mid;

      for (let x = 0; x <= width + step; x += step) {
        const t = x / width;
        const clean = shape(kindNow, TAU * (current.frequency * t - phase));
        // Three detuned sines standing in for noise: cheaper than a PRNG
        // per pixel, and it drifts rather than crawling.
        const noise =
          Math.sin(x * 0.61 + time * 11.3) * 0.55 +
          Math.sin(x * 1.37 - time * 17.1) * 0.3 +
          Math.sin(x * 0.17 + time * 5.3) * 0.5;
        // Noise fades out left to right while the clean wave fades in.
        const chaos = 1 - smooth(0.05, 0.72, t);
        const y =
          mid + clean * amp * (0.45 + 0.55 * smooth(0, 0.6, t)) + noise * amp * 0.85 * chaos;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        endY = y;
      }

      ctx.stroke();

      // The trigger marker, where a scope would show the beam.
      ctx.fillStyle = stroke;
      ctx.beginPath();
      ctx.arc(width - thickness * 2, endY, thickness * 2.2, 0, TAU);
      ctx.fill();
    };

    const loop = (now: number) => {
      if (visible) draw(now);
      frame = requestAnimationFrame(loop);
    };

    /* --- Drivers ------------------------------------------------------ */

    const onPointerMove = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      const x = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
      const y = Math.min(Math.max((event.clientY - bounds.top) / bounds.height, 0), 1);
      target.frequency = 1.4 + x * 4.2;
      target.amplitude = 1 - Math.abs(y - 0.5) * 1.4;
    };

    const measureScroll = () => {
      scrollFrame = 0;
      const bounds = host.getBoundingClientRect();
      // 0 while the host's top is at the top of the viewport, 1 once it has
      // scrolled a full host-height past.
      const progress = Math.min(Math.max(-bounds.top / Math.max(bounds.height, 1), 0), 1);
      target.frequency = 3.5 - progress * 2.2;
      target.amplitude = 0.25 + progress * 0.55;
    };

    // Coalesced into one measurement per frame: the listener fires far more
    // often than the screen refreshes, and each measurement reads layout.
    const onScroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(measureScroll);
    };

    /* --- Wiring ------------------------------------------------------- */

    const intersection = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    intersection.observe(host);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      // A static trace still has to be redrawn when its canvas is resized,
      // because resizing clears it.
      if (reduced) draw(performance.now());
    });
    resizeObserver.observe(host);
    resize();

    // The stroke colour is a theme token, so follow both ways the theme can
    // change: the explicit toggle, and the system preference.
    const themeObserver = new MutationObserver(readColour);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    const colourScheme = window.matchMedia('(prefers-color-scheme: dark)');
    colourScheme.addEventListener('change', readColour);

    if (drive === 'scroll') {
      measureScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    } else {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }

    // One static frame under reduced motion; otherwise start the loop.
    // Both drivers need this - an earlier version returned before reaching
    // it in scroll mode, which left the canvas permanently blank.
    if (reduced) draw(performance.now());
    else frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      intersection.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      colourScheme.removeEventListener('change', readColour);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [drive]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 text-signal', className)}
    />
  );
}
