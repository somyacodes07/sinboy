/**
 * Cartridge 8: Fourier Painter
 * "Reconstruct parametric vector artwork via rotating Fourier epicycles with multi-shape gallery."
 */

import { BaseCartridge, EquationInfo } from '../gameEngine';
import { ThemePalette } from '../../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../../font/proceduralFont';
import { HardwareInputState } from '../../graphics/consoleShell';
import { FourierEngine, FourierTerm, TWO_PI } from '../../math/mathCore';

export class FourierPainterCartridge implements BaseCartridge {
  id = 'fourier_painter';
  name = 'Fourier Epicycle Painter';
  description = 'Reconstruct vector curves via rotating complex Fourier epicycles.';
  mathTopic = 'Fourier Analysis & Harmonic Epicycles';

  fourierTerms: FourierTerm[] = [];
  pathHistory: { x: number; y: number }[] = [];
  tParam = 0;
  maxEpicycles = 15;
  shapeIdx = 0;

  constructor() {
    this.reset();
  }

  getEquations(): EquationInfo[] {
    return [
      {
        name: 'Fourier Complex Series',
        expression: 'f(t) = sum( c_n * e^(i * n * omega * t) )',
        description: 'Harmonic decomposition of continuous curves',
        variables: { epicycles: this.maxEpicycles },
      },
    ];
  }

  setVariable(eqName: string, varName: string, val: number): void {
    if (varName === 'epicycles') this.maxEpicycles = Math.max(1, Math.floor(val));
  }

  reset(): void {
    this.tParam = 0;
    this.pathHistory = [];
    this.loadShape(this.shapeIdx);
  }

  private loadShape(idx: number) {
    const points: { x: number; y: number }[] = [];
    const N = 90;

    if (idx === 0) {
      // 5-Point Star
      for (let i = 0; i < N; i++) {
        const theta = (i / N) * TWO_PI;
        const r = 75 + 30 * Math.sin(5 * theta);
        points.push({ x: Math.cos(theta) * r, y: Math.sin(theta) * r });
      }
    } else if (idx === 1) {
      // Parametric Heart
      for (let i = 0; i < N; i++) {
        const t = (i / N) * TWO_PI;
        const x = 16 * Math.pow(Math.sin(t), 3) * 5;
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 5;
        points.push({ x, y });
      }
    } else {
      // Butterfly Curve
      for (let i = 0; i < N; i++) {
        const t = (i / N) * TWO_PI;
        const r = 70 * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5));
        points.push({ x: Math.cos(t) * r * 0.4, y: Math.sin(t) * r * 0.4 });
      }
    }

    this.fourierTerms = FourierEngine.computeDFT(points);
  }

  update(dt: number, input: HardwareInputState, soundEngine: any): void {
    // Single-press Switch Shape Gallery (Button A)
    if (input.justPressedA) {
      this.shapeIdx = (this.shapeIdx + 1) % 3;
      this.reset();
      soundEngine.playClick(750);
    }

    if (input.dpadLeft && this.maxEpicycles > 1) this.maxEpicycles--;
    if (input.dpadRight && this.maxEpicycles < this.fourierTerms.length) this.maxEpicycles++;

    this.tParam = (this.tParam + dt * 0.15) % 1.0;

    const res = FourierEngine.evaluateEpicycles(this.fourierTerms, this.tParam, this.maxEpicycles);
    this.pathHistory.push({ x: res.x, y: res.y });
    if (this.pathHistory.length > 260) this.pathHistory.shift();
  }

  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ): void {
    const cx = width * 0.5;
    const cy = height * 0.5;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(cx, cy);

    // Render Epicycle Circles
    const res = FourierEngine.evaluateEpicycles(this.fourierTerms, this.tParam, this.maxEpicycles);

    for (let c = 0; c < res.circles.length; c++) {
      const circle = res.circles[c];
      const cHue = (c * 25 + time * 30) % 360;
      ctx.strokeStyle = `hsla(${cHue}, 80%, 65%, 0.4)`;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.arc(circle.cx, circle.cy, circle.radius, 0, TWO_PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(circle.cx, circle.cy);
      ctx.lineTo(circle.endX, circle.endY);
      ctx.stroke();
    }

    // Render Reconstructed Path (Golden Yellow)
    ctx.strokeStyle = '#fde047';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3;

    ctx.beginPath();
    for (let i = 0; i < this.pathHistory.length; i++) {
      const pt = this.pathHistory[i];
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();

    const shapeNames = ['STAR', 'HEART', 'BUTTERFLY'];
    ProceduralFontEngine.renderText(
      ctx,
      `SHAPE: ${shapeNames[this.shapeIdx]} (PRESS A TO SWITCH)`,
      15,
      25,
      11,
      '#f8fafc',
      fontParams,
      time
    );

    ProceduralFontEngine.renderText(
      ctx,
      `EPICYCLES: ${this.maxEpicycles} (DPAD: ADJ)`,
      15,
      height - 15,
      9,
      '#38bdf8',
      fontParams,
      time
    );
  }

  renderEducationOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ): void {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(10, 10, width - 20, height - 20);

    ProceduralFontEngine.renderText(ctx, 'LESSON: FOURIER SERIES', 25, 40, 14, '#f8fafc', fontParams, time);
  }
}
