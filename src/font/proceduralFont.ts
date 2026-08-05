/**
 * SinBoy Procedural Typography & Font Engine
 * "Zero font files. Every letterform is computed frame-by-frame via pure mathematics."
 */

import { FourierEngine, FourierTerm, NoiseEngine, TWO_PI, PI, lerp } from '../math/mathCore';

export type FontMode =
  | 'bezier'
  | 'fourier'
  | 'wave'
  | 'sdf'
  | 'noise'
  | 'skeleton'
  | 'geometric'
  | 'parametric'
  | 'lissajous';

export interface FontParams {
  mode: FontMode;
  amplitude: number;    // [0.5, 2.0]
  frequency: number;    // [0.5, 5.0]
  weight: number;       // [1, 12]
  noise: number;        // [0, 1]
  curvature: number;    // [0, 2]
  thickness: number;    // [1, 10]
  roundness: number;    // [0, 1]
  compression: number;  // [0.5, 1.5]
  expansion: number;    // [0.8, 1.5]
  randomness: number;   // [0, 0.5]
}

export const DEFAULT_FONT_PARAMS: FontParams = {
  mode: 'bezier',
  amplitude: 1.0,
  frequency: 1.0,
  weight: 3.5,
  noise: 0.0,
  curvature: 0.4,
  thickness: 3.5,
  roundness: 0.8,
  compression: 0.95,
  expansion: 1.05,
  randomness: 0.0,
};

// Base mathematical keypoint stroke definitions for normalized [0,1] x [0,1] box
type Stroke = { x: number; y: number }[];
type GlyphDef = Stroke[];

const GLYPH_LIBRARY: Record<string, GlyphDef> = {
  A: [
    [{ x: 0.15, y: 1.0 }, { x: 0.5, y: 0.0 }, { x: 0.85, y: 1.0 }],
    [{ x: 0.28, y: 0.6 }, { x: 0.72, y: 0.6 }],
  ],
  B: [
    [{ x: 0.2, y: 0.0 }, { x: 0.2, y: 1.0 }],
    [{ x: 0.2, y: 0.0 }, { x: 0.65, y: 0.0 }, { x: 0.78, y: 0.22 }, { x: 0.65, y: 0.48 }, { x: 0.2, y: 0.48 }],
    [{ x: 0.2, y: 0.48 }, { x: 0.7, y: 0.48 }, { x: 0.82, y: 0.72 }, { x: 0.7, y: 1.0 }, { x: 0.2, y: 1.0 }],
  ],
  C: [
    [{ x: 0.8, y: 0.2 }, { x: 0.5, y: 0.0 }, { x: 0.2, y: 0.25 }, { x: 0.2, y: 0.75 }, { x: 0.5, y: 1.0 }, { x: 0.8, y: 0.8 }],
  ],
  D: [
    [{ x: 0.2, y: 0.0 }, { x: 0.2, y: 1.0 }],
    [{ x: 0.2, y: 0.0 }, { x: 0.6, y: 0.0 }, { x: 0.82, y: 0.3 }, { x: 0.82, y: 0.7 }, { x: 0.6, y: 1.0 }, { x: 0.2, y: 1.0 }],
  ],
  E: [
    [{ x: 0.2, y: 0.0 }, { x: 0.2, y: 1.0 }],
    [{ x: 0.2, y: 0.0 }, { x: 0.8, y: 0.0 }],
    [{ x: 0.2, y: 0.5 }, { x: 0.7, y: 0.5 }],
    [{ x: 0.2, y: 1.0 }, { x: 0.8, y: 1.0 }],
  ],
  F: [
    [{ x: 0.2, y: 0.0 }, { x: 0.2, y: 1.0 }],
    [{ x: 0.2, y: 0.0 }, { x: 0.8, y: 0.0 }],
    [{ x: 0.2, y: 0.5 }, { x: 0.7, y: 0.5 }],
  ],
  G: [
    [{ x: 0.8, y: 0.2 }, { x: 0.5, y: 0.0 }, { x: 0.2, y: 0.25 }, { x: 0.2, y: 0.75 }, { x: 0.5, y: 1.0 }, { x: 0.8, y: 1.0 }, { x: 0.8, y: 0.55 }, { x: 0.5, y: 0.55 }],
  ],
  H: [
    [{ x: 0.2, y: 0.0 }, { x: 0.2, y: 1.0 }],
    [{ x: 0.8, y: 0.0 }, { x: 0.8, y: 1.0 }],
    [{ x: 0.2, y: 0.5 }, { x: 0.8, y: 0.5 }],
  ],
  I: [
    [{ x: 0.5, y: 0.0 }, { x: 0.5, y: 1.0 }],
    [{ x: 0.25, y: 0.0 }, { x: 0.75, y: 0.0 }],
    [{ x: 0.25, y: 1.0 }, { x: 0.75, y: 1.0 }],
  ],
  J: [
    [{ x: 0.35, y: 0.0 }, { x: 0.75, y: 0.0 }],
    [{ x: 0.75, y: 0.0 }, { x: 0.75, y: 0.75 }, { x: 0.5, y: 1.0 }, { x: 0.2, y: 0.8 }],
  ],
  K: [
    [{ x: 0.2, y: 0.0 }, { x: 0.2, y: 1.0 }],
    [{ x: 0.8, y: 0.0 }, { x: 0.2, y: 0.55 }, { x: 0.8, y: 1.0 }],
  ],
  L: [
    [{ x: 0.2, y: 0.0 }, { x: 0.2, y: 1.0 }, { x: 0.8, y: 1.0 }],
  ],
  M: [
    [{ x: 0.15, y: 1.0 }, { x: 0.15, y: 0.0 }, { x: 0.5, y: 0.55 }, { x: 0.85, y: 0.0 }, { x: 0.85, y: 1.0 }],
  ],
  N: [
    [{ x: 0.2, y: 1.0 }, { x: 0.2, y: 0.0 }, { x: 0.8, y: 1.0 }, { x: 0.8, y: 0.0 }],
  ],
  O: [
    [{ x: 0.5, y: 0.0 }, { x: 0.2, y: 0.25 }, { x: 0.2, y: 0.75 }, { x: 0.5, y: 1.0 }, { x: 0.8, y: 0.75 }, { x: 0.8, y: 0.25 }, { x: 0.5, y: 0.0 }],
  ],
  P: [
    [{ x: 0.2, y: 0.0 }, { x: 0.2, y: 1.0 }],
    [{ x: 0.2, y: 0.0 }, { x: 0.7, y: 0.0 }, { x: 0.8, y: 0.25 }, { x: 0.7, y: 0.5 }, { x: 0.2, y: 0.5 }],
  ],
  Q: [
    [{ x: 0.5, y: 0.0 }, { x: 0.2, y: 0.25 }, { x: 0.2, y: 0.75 }, { x: 0.5, y: 1.0 }, { x: 0.8, y: 0.75 }, { x: 0.8, y: 0.25 }, { x: 0.5, y: 0.0 }],
    [{ x: 0.55, y: 0.65 }, { x: 0.85, y: 1.0 }],
  ],
  R: [
    [{ x: 0.2, y: 0.0 }, { x: 0.2, y: 1.0 }],
    [{ x: 0.2, y: 0.0 }, { x: 0.7, y: 0.0 }, { x: 0.8, y: 0.25 }, { x: 0.7, y: 0.5 }, { x: 0.2, y: 0.5 }],
    [{ x: 0.45, y: 0.5 }, { x: 0.85, y: 1.0 }],
  ],
  S: [
    // Flawless S-curve stroke without diagonal center line intersection
    [{ x: 0.78, y: 0.2 }, { x: 0.5, y: 0.0 }, { x: 0.22, y: 0.22 }, { x: 0.22, y: 0.42 }, { x: 0.5, y: 0.5 }, { x: 0.78, y: 0.58 }, { x: 0.78, y: 0.78 }, { x: 0.5, y: 1.0 }, { x: 0.22, y: 0.8 }],
  ],
  T: [
    [{ x: 0.5, y: 0.0 }, { x: 0.5, y: 1.0 }],
    [{ x: 0.15, y: 0.0 }, { x: 0.85, y: 0.0 }],
  ],
  U: [
    [{ x: 0.2, y: 0.0 }, { x: 0.2, y: 0.75 }, { x: 0.5, y: 1.0 }, { x: 0.8, y: 0.75 }, { x: 0.8, y: 0.0 }],
  ],
  V: [
    [{ x: 0.15, y: 0.0 }, { x: 0.5, y: 1.0 }, { x: 0.85, y: 0.0 }],
  ],
  W: [
    [{ x: 0.12, y: 0.0 }, { x: 0.3, y: 1.0 }, { x: 0.5, y: 0.45 }, { x: 0.7, y: 1.0 }, { x: 0.88, y: 0.0 }],
  ],
  X: [
    [{ x: 0.2, y: 0.0 }, { x: 0.8, y: 1.0 }],
    [{ x: 0.8, y: 0.0 }, { x: 0.2, y: 1.0 }],
  ],
  Y: [
    [{ x: 0.15, y: 0.0 }, { x: 0.5, y: 0.5 }, { x: 0.85, y: 0.0 }],
    [{ x: 0.5, y: 0.5 }, { x: 0.5, y: 1.0 }],
  ],
  Z: [
    [{ x: 0.2, y: 0.0 }, { x: 0.8, y: 0.0 }, { x: 0.2, y: 1.0 }, { x: 0.8, y: 1.0 }],
  ],
  '0': [
    [{ x: 0.5, y: 0.0 }, { x: 0.2, y: 0.25 }, { x: 0.2, y: 0.75 }, { x: 0.5, y: 1.0 }, { x: 0.8, y: 0.75 }, { x: 0.8, y: 0.25 }, { x: 0.5, y: 0.0 }],
    [{ x: 0.35, y: 0.65 }, { x: 0.65, y: 0.35 }],
  ],
  '1': [
    [{ x: 0.3, y: 0.2 }, { x: 0.5, y: 0.0 }, { x: 0.5, y: 1.0 }],
    [{ x: 0.25, y: 1.0 }, { x: 0.75, y: 1.0 }],
  ],
  '2': [
    [{ x: 0.2, y: 0.25 }, { x: 0.5, y: 0.0 }, { x: 0.8, y: 0.25 }, { x: 0.2, y: 1.0 }, { x: 0.8, y: 1.0 }],
  ],
  '3': [
    [{ x: 0.2, y: 0.15 }, { x: 0.5, y: 0.0 }, { x: 0.8, y: 0.25 }, { x: 0.5, y: 0.5 }, { x: 0.8, y: 0.75 }, { x: 0.5, y: 1.0 }, { x: 0.2, y: 0.85 }],
  ],
  '4': [
    [{ x: 0.75, y: 0.0 }, { x: 0.2, y: 0.6 }, { x: 0.85, y: 0.6 }],
    [{ x: 0.75, y: 0.3 }, { x: 0.75, y: 1.0 }],
  ],
  '5': [
    [{ x: 0.8, y: 0.0 }, { x: 0.2, y: 0.0 }, { x: 0.2, y: 0.45 }, { x: 0.75, y: 0.45 }, { x: 0.8, y: 0.7 }, { x: 0.5, y: 1.0 }, { x: 0.2, y: 0.85 }],
  ],
  '6': [
    [{ x: 0.8, y: 0.15 }, { x: 0.5, y: 0.0 }, { x: 0.2, y: 0.3 }, { x: 0.2, y: 0.7 }, { x: 0.5, y: 1.0 }, { x: 0.8, y: 0.7 }, { x: 0.8, y: 0.5 }, { x: 0.2, y: 0.5 }],
  ],
  '7': [
    [{ x: 0.2, y: 0.0 }, { x: 0.8, y: 0.0 }, { x: 0.4, y: 1.0 }],
  ],
  '8': [
    [{ x: 0.5, y: 0.0 }, { x: 0.2, y: 0.25 }, { x: 0.5, y: 0.5 }, { x: 0.8, y: 0.25 }, { x: 0.5, y: 0.0 }],
    [{ x: 0.5, y: 0.5 }, { x: 0.2, y: 0.75 }, { x: 0.5, y: 1.0 }, { x: 0.8, y: 0.75 }, { x: 0.5, y: 0.5 }],
  ],
  '9': [
    [{ x: 0.8, y: 0.5 }, { x: 0.2, y: 0.5 }, { x: 0.2, y: 0.3 }, { x: 0.5, y: 0.0 }, { x: 0.8, y: 0.3 }, { x: 0.8, y: 0.7 }, { x: 0.5, y: 1.0 }, { x: 0.2, y: 0.85 }],
  ],
  '&': [
    [{ x: 0.75, y: 0.85 }, { x: 0.35, y: 0.4 }, { x: 0.5, y: 0.15 }, { x: 0.65, y: 0.4 }, { x: 0.2, y: 0.85 }, { x: 0.5, y: 1.0 }, { x: 0.85, y: 0.6 }],
  ],
  ':': [
    [{ x: 0.5, y: 0.3 }, { x: 0.5, y: 0.35 }],
    [{ x: 0.5, y: 0.7 }, { x: 0.5, y: 0.75 }],
  ],
  '-': [
    [{ x: 0.2, y: 0.5 }, { x: 0.8, y: 0.5 }],
  ],
  '+': [
    [{ x: 0.2, y: 0.5 }, { x: 0.8, y: 0.5 }],
    [{ x: 0.5, y: 0.2 }, { x: 0.5, y: 0.8 }],
  ],
  '<': [
    [{ x: 0.8, y: 0.2 }, { x: 0.2, y: 0.5 }, { x: 0.8, y: 0.8 }],
  ],
  '>': [
    [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.5 }, { x: 0.2, y: 0.8 }],
  ],
  '!': [
    [{ x: 0.5, y: 0.0 }, { x: 0.5, y: 0.65 }],
    [{ x: 0.5, y: 0.85 }, { x: 0.5, y: 0.95 }],
  ],
  '.': [
    [{ x: 0.45, y: 0.9 }, { x: 0.55, y: 0.9 }, { x: 0.55, y: 1.0 }, { x: 0.45, y: 1.0 }, { x: 0.45, y: 0.9 }],
  ],
  ',': [
    [{ x: 0.45, y: 0.85 }, { x: 0.55, y: 0.85 }, { x: 0.4, y: 1.05 }],
  ],
  '=': [
    [{ x: 0.2, y: 0.38 }, { x: 0.8, y: 0.38 }],
    [{ x: 0.2, y: 0.62 }, { x: 0.8, y: 0.62 }],
  ],
  '(': [
    [{ x: 0.7, y: 0.0 }, { x: 0.3, y: 0.5 }, { x: 0.7, y: 1.0 }],
  ],
  ')': [
    [{ x: 0.3, y: 0.0 }, { x: 0.7, y: 0.5 }, { x: 0.3, y: 1.0 }],
  ],
  '%': [
    [{ x: 0.2, y: 0.2 }, { x: 0.4, y: 0.2 }, { x: 0.4, y: 0.4 }, { x: 0.2, y: 0.4 }, { x: 0.2, y: 0.2 }],
    [{ x: 0.8, y: 0.0 }, { x: 0.2, y: 1.0 }],
    [{ x: 0.6, y: 0.6 }, { x: 0.8, y: 0.6 }, { x: 0.8, y: 0.8 }, { x: 0.6, y: 0.8 }, { x: 0.6, y: 0.6 }],
  ],
  "'": [
    [{ x: 0.5, y: 0.0 }, { x: 0.5, y: 0.25 }],
  ],
  ' ': [],
};

const FOURIER_CACHE: Map<string, FourierTerm[][]> = new Map();

export class ProceduralFontEngine {
  static renderText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: string,
    params: FontParams = DEFAULT_FONT_PARAMS,
    time: number = 0
  ) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1.5, params.weight * (fontSize / 24));
    ctx.lineCap = params.roundness > 0.4 ? 'round' : 'square';
    ctx.lineJoin = 'round';

    const charWidth = fontSize * 0.65 * params.compression;
    const spacing = charWidth * params.expansion;
    const upperText = text.toUpperCase();

    let curX = x;

    for (let i = 0; i < upperText.length; i++) {
      const char = upperText[i];
      if (char === ' ') {
        curX += spacing * 0.65;
        continue;
      }

      const glyph = GLYPH_LIBRARY[char] || GLYPH_LIBRARY['?'] || GLYPH_LIBRARY['O'];

      this.renderGlyph(ctx, glyph, char, curX, y, charWidth, fontSize, params, time + i * 0.15);
      curX += spacing;
    }

    ctx.restore();
  }

  private static renderGlyph(
    ctx: CanvasRenderingContext2D,
    glyph: GlyphDef,
    charKey: string,
    gx: number,
    gy: number,
    w: number,
    h: number,
    params: FontParams,
    time: number
  ) {
    if (!glyph || glyph.length === 0) return;

    ctx.save();

    switch (params.mode) {
      case 'bezier':
        this.renderBezierGlyph(ctx, glyph, gx, gy, w, h, params);
        break;
      case 'fourier':
        this.renderFourierGlyph(ctx, glyph, charKey, gx, gy, w, h, params, time);
        break;
      case 'wave':
        this.renderWaveGlyph(ctx, glyph, gx, gy, w, h, params, time);
        break;
      case 'noise':
        this.renderNoiseGlyph(ctx, glyph, gx, gy, w, h, params, time);
        break;
      case 'lissajous':
        this.renderLissajousGlyph(ctx, glyph, gx, gy, w, h, params, time);
        break;
      case 'geometric':
        this.renderGeometricGlyph(ctx, glyph, gx, gy, w, h, params);
        break;
      default:
        this.renderStandardGlyph(ctx, glyph, gx, gy, w, h, params, time);
        break;
    }

    ctx.restore();
  }

  private static renderBezierGlyph(
    ctx: CanvasRenderingContext2D,
    glyph: GlyphDef,
    gx: number,
    gy: number,
    w: number,
    h: number,
    params: FontParams
  ) {
    for (const stroke of glyph) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(gx + stroke[0].x * w, gy + stroke[0].y * h);

      if (stroke.length === 2) {
        ctx.lineTo(gx + stroke[1].x * w, gy + stroke[1].y * h);
      } else {
        for (let i = 1; i < stroke.length; i++) {
          const p0 = stroke[i - 1];
          const p1 = stroke[i];
          const cx = gx + ((p0.x + p1.x) / 2 + (p1.y - p0.y) * 0.12 * params.curvature) * w;
          const cy = gy + ((p0.y + p1.y) / 2 - (p1.x - p0.x) * 0.12 * params.curvature) * h;
          ctx.quadraticCurveTo(cx, cy, gx + p1.x * w, gy + p1.y * h);
        }
      }
      ctx.stroke();
    }
  }

  private static renderFourierGlyph(
    ctx: CanvasRenderingContext2D,
    glyph: GlyphDef,
    charKey: string,
    gx: number,
    gy: number,
    w: number,
    h: number,
    params: FontParams,
    time: number
  ) {
    let fourierStrokes = FOURIER_CACHE.get(charKey);

    if (!fourierStrokes) {
      fourierStrokes = [];
      for (const stroke of glyph) {
        const samples: { x: number; y: number }[] = [];
        const N = 32;
        for (let k = 0; k < N; k++) {
          const t = k / N;
          const idx = t * (stroke.length - 1);
          const i0 = Math.floor(idx);
          const i1 = Math.min(stroke.length - 1, i0 + 1);
          const frac = idx - i0;
          samples.push({
            x: lerp(stroke[i0].x, stroke[i1].x, frac),
            y: lerp(stroke[i0].y, stroke[i1].y, frac),
          });
        }
        fourierStrokes.push(FourierEngine.computeDFT(samples));
      }
      FOURIER_CACHE.set(charKey, fourierStrokes);
    }

    for (const terms of fourierStrokes) {
      ctx.beginPath();
      const steps = 30;
      for (let s = 0; s <= steps; s++) {
        const paramT = s / steps;
        const res = FourierEngine.evaluateEpicycles(terms, paramT);

        const px = gx + res.x * w;
        const py = gy + res.y * h;

        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  private static renderWaveGlyph(
    ctx: CanvasRenderingContext2D,
    glyph: GlyphDef,
    gx: number,
    gy: number,
    w: number,
    h: number,
    params: FontParams,
    time: number
  ) {
    for (const stroke of glyph) {
      if (stroke.length < 2) continue;
      ctx.beginPath();

      const samples = 25;
      for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const idx = t * (stroke.length - 1);
        const i0 = Math.floor(idx);
        const i1 = Math.min(stroke.length - 1, i0 + 1);
        const frac = idx - i0;

        let bx = lerp(stroke[i0].x, stroke[i1].x, frac);
        let by = lerp(stroke[i0].y, stroke[i1].y, frac);

        const waveOffset = Math.sin(bx * params.frequency * 4.0 + time * 3.0) * params.amplitude * 2.5;
        const px = gx + bx * w;
        const py = gy + by * h + waveOffset;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  private static renderNoiseGlyph(
    ctx: CanvasRenderingContext2D,
    glyph: GlyphDef,
    gx: number,
    gy: number,
    w: number,
    h: number,
    params: FontParams,
    time: number
  ) {
    for (const stroke of glyph) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      const samples = 20;

      for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const idx = t * (stroke.length - 1);
        const i0 = Math.floor(idx);
        const i1 = Math.min(stroke.length - 1, i0 + 1);
        const frac = idx - i0;

        const bx = lerp(stroke[i0].x, stroke[i1].x, frac);
        const by = lerp(stroke[i0].y, stroke[i1].y, frac);

        const nx = NoiseEngine.perlin2D(bx * 3.0 + time, by * 3.0) * params.noise * 4;
        const ny = NoiseEngine.perlin2D(bx * 3.0, by * 3.0 + time) * params.noise * 4;

        const px = gx + bx * w + nx;
        const py = gy + by * h + ny;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  private static renderLissajousGlyph(
    ctx: CanvasRenderingContext2D,
    glyph: GlyphDef,
    gx: number,
    gy: number,
    w: number,
    h: number,
    params: FontParams,
    time: number
  ) {
    for (const stroke of glyph) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      const samples = 25;

      for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const idx = t * (stroke.length - 1);
        const i0 = Math.floor(idx);
        const i1 = Math.min(stroke.length - 1, i0 + 1);
        const frac = idx - i0;

        const bx = lerp(stroke[i0].x, stroke[i1].x, frac);
        const by = lerp(stroke[i0].y, stroke[i1].y, frac);

        const lissX = Math.sin(t * params.frequency * TWO_PI + time * 2.0) * params.amplitude * 2;
        const lissY = Math.cos(t * params.frequency * 1.5 * TWO_PI + time * 2.0) * params.amplitude * 2;

        const px = gx + bx * w + lissX;
        const py = gy + by * h + lissY;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }

  private static renderGeometricGlyph(
    ctx: CanvasRenderingContext2D,
    glyph: GlyphDef,
    gx: number,
    gy: number,
    w: number,
    h: number,
    params: FontParams
  ) {
    for (const stroke of glyph) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(gx + stroke[0].x * w, gy + stroke[0].y * h);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(gx + stroke[i].x * w, gy + stroke[i].y * h);
      }
      ctx.stroke();
    }
  }

  private static renderStandardGlyph(
    ctx: CanvasRenderingContext2D,
    glyph: GlyphDef,
    gx: number,
    gy: number,
    w: number,
    h: number,
    params: FontParams,
    time: number
  ) {
    for (const stroke of glyph) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(gx + stroke[0].x * w, gy + stroke[0].y * h);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(gx + stroke[i].x * w, gy + stroke[i].y * h);
      }
      ctx.stroke();
    }
  }

  static measureText(text: string, fontSize: number, params: FontParams = DEFAULT_FONT_PARAMS): number {
    const charWidth = fontSize * 0.65 * params.compression;
    const spacing = charWidth * params.expansion;
    return text.length * spacing;
  }

  static exportFontSpec(params: FontParams): string {
    return JSON.stringify(params, null, 2);
  }
}
