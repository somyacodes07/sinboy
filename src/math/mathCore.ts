/**
 * SinBoy Mathematical Core Engine
 * "Every visual, shape, movement, and sound originates from equations."
 */

export const PI = Math.PI;
export const TWO_PI = Math.PI * 2;
export const HALF_PI = Math.PI / 2;
export const TAU = TWO_PI;
export const PHI = (1 + Math.sqrt(5)) / 2; // Golden Ratio

// Linear interpolation & clamping
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

export function fract(x: number): number {
  return x - Math.floor(x);
}

// ---------------------------------------------------------------------------
// 1. TRIGONOMETRIC WAVE ENGINE
// ---------------------------------------------------------------------------

export interface WaveComponent {
  amplitude: number;
  frequency: number;
  phase: number;
  type?: 'sin' | 'cos' | 'square' | 'saw' | 'triangle';
}

export class TrigWaveEngine {
  /** Evaluates a sum of harmonic trigonometric waves at time t */
  static evaluateSum(components: WaveComponent[], t: number): number {
    let val = 0;
    for (let i = 0; i < components.length; i++) {
      const c = components[i];
      const arg = TWO_PI * c.frequency * t + c.phase;
      const type = c.type || 'sin';
      
      let wave = 0;
      switch (type) {
        case 'sin':
          wave = Math.sin(arg);
          break;
        case 'cos':
          wave = Math.cos(arg);
          break;
        case 'square':
          wave = Math.sin(arg) >= 0 ? 1 : -1;
          break;
        case 'saw':
          wave = 2 * (arg / TWO_PI - Math.floor(0.5 + arg / TWO_PI));
          break;
        case 'triangle':
          wave = 2 * Math.abs(2 * (arg / TWO_PI - Math.floor(0.5 + arg / TWO_PI))) - 1;
          break;
      }
      val += c.amplitude * wave;
    }
    return val;
  }

  /** Modulated wave: Carrier amplitude modulated by Modulator frequency */
  static evaluateAM(carrierFreq: number, modFreq: number, modDepth: number, t: number): number {
    const mod = 1 + modDepth * Math.sin(TWO_PI * modFreq * t);
    return mod * Math.sin(TWO_PI * carrierFreq * t);
  }

  /** Frequency modulated wave */
  static evaluateFM(carrierFreq: number, modFreq: number, modIndex: number, t: number): number {
    const mod = modIndex * Math.sin(TWO_PI * modFreq * t);
    return Math.sin(TWO_PI * carrierFreq * t + mod);
  }

  /** Breathing pulse function (smooth sinusoidal breathing [0, 1]) */
  static breathe(t: number, speed: number = 1.0): number {
    return 0.5 + 0.5 * Math.sin(t * speed * TWO_PI);
  }

  /** Organic wave distortion pulse */
  static pulseWave(x: number, y: number, t: number, freq: number = 2.0): number {
    const dist = Math.sqrt(x * x + y * y);
    return Math.sin(dist * freq - t * 4.0) * Math.exp(-dist * 0.5);
  }
}

// ---------------------------------------------------------------------------
// 2. FOURIER SERIES EPICYCLE SOLVER
// ---------------------------------------------------------------------------

export interface FourierTerm {
  freq: number;
  amp: number;
  phase: number;
}

export class FourierEngine {
  /**
   * Computes Discrete Fourier Transform (DFT) for a 2D complex path (x_k + i y_k)
   */
  static computeDFT(points: { x: number; y: number }[]): FourierTerm[] {
    const N = points.length;
    const fourier: FourierTerm[] = [];

    for (let k = 0; k < N; k++) {
      // Shift frequency range to center around 0: -N/2 to N/2
      const n = k - Math.floor(N / 2);
      let re = 0;
      let im = 0;

      for (let m = 0; m < N; m++) {
        const phi = (TWO_PI * n * m) / N;
        re += points[m].x * Math.cos(phi) + points[m].y * Math.sin(phi);
        im += -points[m].x * Math.sin(phi) + points[m].y * Math.cos(phi);
      }

      re /= N;
      im /= N;

      const freq = n;
      const amp = Math.sqrt(re * re + im * im);
      const phase = Math.atan2(im, re);

      fourier.push({ freq, amp, phase });
    }

    // Sort by amplitude descending for efficient epicycle rendering
    return fourier.sort((a, b) => b.amp - a.amp);
  }

  /**
   * Evaluates position (x, y) and epicycle chain radii at parameter time t in [0, 1]
   */
  static evaluateEpicycles(terms: FourierTerm[], t: number, maxTerms?: number): {
    x: number;
    y: number;
    circles: { cx: number; cy: number; radius: number; endX: number; endY: number }[];
  } {
    let x = 0;
    let y = 0;
    const circles: { cx: number; cy: number; radius: number; endX: number; endY: number }[] = [];
    const limit = maxTerms ? Math.min(maxTerms, terms.length) : terms.length;

    for (let i = 0; i < limit; i++) {
      const prevX = x;
      const prevY = y;
      const term = terms[i];
      const rad = term.phase + term.freq * TWO_PI * t;

      x += term.amp * Math.cos(rad);
      y += term.amp * Math.sin(rad);

      circles.push({
        cx: prevX,
        cy: prevY,
        radius: term.amp,
        endX: x,
        endY: y,
      });
    }

    return { x, y, circles };
  }
}

// ---------------------------------------------------------------------------
// 3. PURE MATHEMATICAL NOISE (NO ASSET DEPENDENCY)
// ---------------------------------------------------------------------------

// Permutation table generated deterministically via hash
const PERM_SIZE = 256;
const p: number[] = new Array(PERM_SIZE * 2);
(function initPermutation() {
  const perm = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
    8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
    35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
    134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
    55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,
    18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,
    226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,
    17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,
    167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,
    246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,
    14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,
    150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
  ];
  for (let i = 0; i < PERM_SIZE; i++) {
    p[i] = perm[i];
    p[256 + i] = perm[i];
  }
})();

function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function grad2d(hash: number, x: number, y: number): number {
  const h = hash & 7;
  const u = h < 4 ? x : y;
  const v = h < 4 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export class NoiseEngine {
  /** Pure 2D Perlin Noise [-1, 1] */
  static perlin2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = fade(xf);
    const v = fade(yf);

    const aa = p[p[X] + Y];
    const ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y];
    const bb = p[p[X + 1] + Y + 1];

    const x1 = lerp(grad2d(aa, xf, yf), grad2d(ba, xf - 1, yf), u);
    const x2 = lerp(grad2d(ab, xf, yf - 1), grad2d(bb, xf - 1, yf - 1), u);

    return lerp(x1, x2, v);
  }

  /** Fractional Brownian Motion (FBM) */
  static fbm2D(x: number, y: number, octaves: number = 4, lacunarity: number = 2.0, gain: number = 0.5): number {
    let total = 0;
    let frequency = 1.0;
    let amplitude = 1.0;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += NoiseEngine.perlin2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      frequency *= lacunarity;
      amplitude *= gain;
    }

    return total / maxValue;
  }

  /** Domain Warping: f(p) = FBM(p + FBM(p)) */
  static domainWarp(x: number, y: number, t: number): { value: number; qx: number; qy: number } {
    const qx = NoiseEngine.fbm2D(x + t * 0.1, y + t * 0.1, 3);
    const qy = NoiseEngine.fbm2D(x + 5.2, y + 1.3 + t * 0.1, 3);

    const rx = NoiseEngine.fbm2D(x + 4.0 * qx + 1.7, y + 4.0 * qy + 9.2, 3);
    const ry = NoiseEngine.fbm2D(x + 4.0 * qx + 8.3, y + 4.0 * qy + 2.8, 3);

    const value = NoiseEngine.fbm2D(x + 4.0 * rx, y + 4.0 * ry, 4);
    return { value, qx: rx, qy: ry };
  }

  /** Voronoi / Cellular noise returning distance to nearest point */
  static voronoi2D(x: number, y: number): { dist: number; id: number } {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;

    let minDist = 1e9;
    let cellId = 0;

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const hash = p[p[(xi + dx) & 255] + ((yi + dy) & 255)];
        const px = dx + (hash / 255);
        const py = dy + (p[hash] / 255);
        const dist = Math.sqrt((xf - px) * (xf - px) + (yf - py) * (yf - py));

        if (dist < minDist) {
          minDist = dist;
          cellId = hash;
        }
      }
    }

    return { dist: minDist, id: cellId };
  }
}

// ---------------------------------------------------------------------------
// 4. SIGNED DISTANCE FIELDS (SDF) & SUPERELLIPSE MATH
// ---------------------------------------------------------------------------

export class SDFEngine {
  /**
   * Superellipse implicit equation: (|x/a|^n + |y/b|^n)^(1/n) - 1
   * n = 2 is circle/ellipse, n = 4 is squircle (perfect GameBoy button / body curve)
   */
  static superellipse(x: number, y: number, a: number, b: number, n: number): number {
    const xTerm = Math.pow(Math.abs(x / a), n);
    const yTerm = Math.pow(Math.abs(y / b), n);
    return Math.pow(xTerm + yTerm, 1.0 / n) - 1.0;
  }

  /** SDF for a rounded rectangle */
  static sdRoundedBox(x: number, y: number, w: number, h: number, r: number): number {
    const qx = Math.abs(x) - w + r;
    const qy = Math.abs(y) - h + r;
    return Math.min(Math.max(qx, qy), 0.0) + Math.sqrt(Math.max(qx, 0.0) ** 2 + Math.max(qy, 0.0) ** 2) - r;
  }

  /** SDF for a circle */
  static sdCircle(x: number, y: number, r: number): number {
    return Math.sqrt(x * x + y * y) - r;
  }

  /** SDF for a capsule segment */
  static sdCapsule(x: number, y: number, ax: number, ay: number, bx: number, by: number, r: number): number {
    const pax = x - ax;
    const pay = y - ay;
    const bax = bx - ax;
    const bay = by - ay;
    const h = clamp((pax * bax + pay * bay) / (bax * bax + bay * bay), 0.0, 1.0);
    const dx = pax - bax * h;
    const dy = pay - bay * h;
    return Math.sqrt(dx * dx + dy * dy) - r;
  }

  /** Smooth minimum boolean union */
  static smin(a: number, b: number, k: number): number {
    const h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return lerp(b, a, h) - k * h * (1.0 - h);
  }

  /** Smooth difference boolean operation */
  static smax(a: number, b: number, k: number): number {
    return -SDFEngine.smin(-a, -b, k);
  }
}

// ---------------------------------------------------------------------------
// 5. DYNAMICS, PHYSICS & CHAOS SIMULATION MATH
// ---------------------------------------------------------------------------

export class SpringVal {
  val: number;
  target: number;
  vel: number;
  stiffness: number;
  damping: number;

  constructor(val: number, stiffness: number = 180, damping: number = 14) {
    this.val = val;
    this.target = val;
    this.vel = 0;
    this.stiffness = stiffness;
    this.damping = damping;
  }

  update(dt: number) {
    const force = -this.stiffness * (this.val - this.target);
    const dampingForce = -this.damping * this.vel;
    const accel = force + dampingForce;
    this.vel += accel * dt;
    this.val += this.vel * dt;
  }
}

export class ChaosEngine {
  /** Lorenz Attractor Euler step */
  static stepLorenz(
    x: number,
    y: number,
    z: number,
    dt: number,
    sigma: number = 10,
    rho: number = 28,
    beta: number = 8 / 3
  ): { x: number; y: number; z: number } {
    const dx = sigma * (y - x);
    const dy = x * (rho - z) - y;
    const dz = x * y - beta * z;
    return {
      x: x + dx * dt,
      y: y + dy * dt,
      z: z + dz * dt,
    };
  }

  /** Double Pendulum Runge-Kutta step */
  static stepDoublePendulum(
    th1: number,
    th2: number,
    w1: number,
    w2: number,
    dt: number,
    m1: number = 1,
    m2: number = 1,
    l1: number = 1,
    l2: number = 1,
    g: number = 9.81
  ): { th1: number; th2: number; w1: number; w2: number } {
    const num1 = -g * (2 * m1 + m2) * Math.sin(th1) - m2 * g * Math.sin(th1 - 2 * th2) - 2 * Math.sin(th1 - th2) * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(th1 - th2));
    const den1 = l1 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));
    const alpha1 = num1 / den1;

    const num2 = 2 * Math.sin(th1 - th2) * (w1 * w1 * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(th1) + w2 * w2 * l2 * m2 * Math.cos(th1 - th2));
    const den2 = l2 * (2 * m1 + m2 - m2 * Math.cos(2 * th1 - 2 * th2));
    const alpha2 = num2 / den2;

    const newW1 = w1 + alpha1 * dt;
    const newW2 = w2 + alpha2 * dt;
    const newTh1 = th1 + newW1 * dt;
    const newTh2 = th2 + newW2 * dt;

    return { th1: newTh1, th2: newTh2, w1: newW1, w2: newW2 };
  }

  /** Logistic Map equation: x_{n+1} = r * x_n * (1 - x_n) */
  static evaluateLogisticMap(r: number, iterations: number = 100): number[] {
    let x = 0.5;
    const history: number[] = [];
    for (let i = 0; i < iterations; i++) {
      x = r * x * (1 - x);
      if (i > 50) history.push(x);
    }
    return history;
  }
}

// ---------------------------------------------------------------------------
// 6. L-SYSTEM PROCEDURAL TREE MATH
// ---------------------------------------------------------------------------

export interface LSystemRule {
  char: string;
  replacement: string;
}

export class LSystemEngine {
  static generateString(axiom: string, rules: Record<string, string>, iterations: number): string {
    let current = axiom;
    for (let iter = 0; iter < iterations; iter++) {
      let next = '';
      for (let i = 0; i < current.length; i++) {
        const c = current[i];
        next += rules[c] || c;
      }
      current = next;
    }
    return current;
  }

  /** Generates turtle drawing commands from L-system string */
  static getTurtleSegments(
    lString: string,
    startX: number,
    startY: number,
    length: number,
    angleStep: number,
    initialAngle: number = -HALF_PI
  ): { x1: number; y1: number; x2: number; y2: number; depth: number }[] {
    const segments: { x1: number; y1: number; x2: number; y2: number; depth: number }[] = [];
    const stack: { x: number; y: number; angle: number; depth: number }[] = [];

    let currX = startX;
    let currY = startY;
    let currAngle = initialAngle;
    let currDepth = 0;

    for (let i = 0; i < lString.length; i++) {
      const char = lString[i];
      if (char === 'F' || char === 'G') {
        const nextX = currX + Math.cos(currAngle) * length;
        const nextY = currY + Math.sin(currAngle) * length;
        segments.push({ x1: currX, y1: currY, x2: nextX, y2: nextY, depth: currDepth });
        currX = nextX;
        currY = nextY;
      } else if (char === '+') {
        currAngle += angleStep;
      } else if (char === '-') {
        currAngle -= angleStep;
      } else if (char === '[') {
        stack.push({ x: currX, y: currY, angle: currAngle, depth: currDepth });
        currDepth++;
      } else if (char === ']') {
        const state = stack.pop();
        if (state) {
          currX = state.x;
          currY = state.y;
          currAngle = state.angle;
          currDepth = state.depth;
        }
      }
    }

    return segments;
  }
}
