/**
 * Cartridge 5: Fractal Forest
 * "Interactive recursive procedural tree explorer with brown wood trunks, wind physics & interactive seasonal foliage."
 */

import { BaseCartridge, EquationInfo } from '../gameEngine';
import { ThemePalette } from '../../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../../font/proceduralFont';
import { HardwareInputState } from '../../graphics/consoleShell';
import { PI } from '../../math/mathCore';

export class FractalForestCartridge implements BaseCartridge {
  id = 'fractal_forest';
  name = 'Fractal Forest';
  description = 'Recursive procedural tree explorer driven by parametric equations.';
  mathTopic = 'Recursive Fractals & Tree Bifurcation';

  angleStep = PI / 6;
  branchScale = 0.72;
  maxDepth = 7;
  seasonIdx = 0;

  seasons = [
    { name: 'SPRING', primary: '#22c55e', tip1: '#4ade80', tip2: '#16a34a', bg1: '#e0f2fe', bg2: '#f1f5f9' },
    { name: 'AUTUMN', primary: '#ea580c', tip1: '#f97316', tip2: '#eab308', bg1: '#fff7ed', bg2: '#ffedd5' },
    { name: 'SAKURA', primary: '#db2777', tip1: '#f472b6', tip2: '#fbcfe8', bg1: '#fdf2f8', bg2: '#fce7f3' },
    { name: 'CYBER NEON', primary: '#06b6d4', tip1: '#a855f7', tip2: '#38bdf8', bg1: '#0f172a', bg2: '#020617' },
  ];

  constructor() {
    this.reset();
  }

  getEquations(): EquationInfo[] {
    return [
      {
        name: 'Recursive Branching',
        expression: 'L_{n+1} = r * L_n, theta_{n+1} = theta_n +/- delta',
        description: 'Bifurcating fractal tree equation',
        variables: { angle: this.angleStep, scale: this.branchScale, depth: this.maxDepth },
      },
    ];
  }

  setVariable(eqName: string, varName: string, val: number): void {
    if (varName === 'angle') this.angleStep = val;
    if (varName === 'scale') this.branchScale = val;
    if (varName === 'depth') this.maxDepth = Math.min(8, Math.max(2, Math.floor(val)));
  }

  reset(): void {
    this.angleStep = PI / 6;
    this.branchScale = 0.72;
    this.maxDepth = 7;
    this.seasonIdx = 0;
  }

  update(dt: number, input: HardwareInputState, soundEngine: any): void {
    // Single-press Switch Season (Button A) with harmonic season chime!
    if (input.justPressedA) {
      this.seasonIdx = (this.seasonIdx + 1) % this.seasons.length;
      soundEngine.playSeasonChime();
    }

    if (input.dpadLeft) this.angleStep -= 0.5 * dt;
    if (input.dpadRight) this.angleStep += 0.5 * dt;
    if (input.dpadUp) this.branchScale = Math.min(0.85, this.branchScale + 0.1 * dt);
    if (input.dpadDown) this.branchScale = Math.max(0.4, this.branchScale - 0.1 * dt);
  }

  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ): void {
    const s = this.seasons[this.seasonIdx];

    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, s.bg1);
    bgGrad.addColorStop(1, s.bg2);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const startX = width * 0.5;
    const startY = height * 0.9;
    const initialLen = 70;

    this.drawBranch(ctx, startX, startY, initialLen, -PI / 2, 0, palette, time, s);

    const textColor = this.seasonIdx === 3 ? '#f8fafc' : '#0f172a';
    ProceduralFontEngine.renderText(
      ctx,
      `SEASON: ${s.name} (PRESS A TO MORPH)`,
      15,
      25,
      11,
      textColor,
      fontParams,
      time
    );

    ProceduralFontEngine.renderText(
      ctx,
      `ANGLE: ${(this.angleStep * (180 / PI)).toFixed(1)}deg SCALE: ${this.branchScale.toFixed(2)} (DPAD: ADJ)`,
      15,
      height - 15,
      9,
      this.seasonIdx === 3 ? '#38bdf8' : '#0284c7',
      fontParams,
      time
    );
  }

  private drawBranch(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    len: number,
    angle: number,
    depth: number,
    palette: ThemePalette,
    time: number,
    s: { primary: string; tip1: string; tip2: string }
  ) {
    if (depth >= this.maxDepth) return;

    const animatedAngle = angle + Math.sin(time * 2.0 + depth) * 0.04;
    const x2 = x + Math.cos(animatedAngle) * len;
    const y2 = y + Math.sin(animatedAngle) * len;

    if (depth <= 2) {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = Math.max(2, (this.maxDepth - depth) * 1.5);
    } else {
      ctx.strokeStyle = s.primary;
      ctx.lineWidth = Math.max(1, (this.maxDepth - depth) * 1.2);
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (depth >= 4) {
      ctx.fillStyle = depth % 2 === 0 ? s.tip1 : s.tip2;
      ctx.beginPath();
      ctx.arc(x2, y2, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    this.drawBranch(ctx, x2, y2, len * this.branchScale, animatedAngle - this.angleStep, depth + 1, palette, time, s);
    this.drawBranch(ctx, x2, y2, len * this.branchScale, animatedAngle + this.angleStep, depth + 1, palette, time, s);
  }

  renderEducationOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ): void {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(10, 10, width - 20, height - 20);

    ProceduralFontEngine.renderText(ctx, 'LESSON: RECURSIVE TREES', 25, 40, 14, '#0f172a', fontParams, time);
  }
}
