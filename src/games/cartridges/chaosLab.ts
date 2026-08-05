/**
 * Cartridge 7: Chaos Lab
 * "Interactive chaotic math laboratory (Lorenz Attractor, Double Pendulum, Logistic Map) with 3D camera rotation."
 */

import { BaseCartridge, EquationInfo } from '../gameEngine';
import { ThemePalette } from '../../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../../font/proceduralFont';
import { HardwareInputState } from '../../graphics/consoleShell';
import { ChaosEngine } from '../../math/mathCore';

export class ChaosLabCartridge implements BaseCartridge {
  id = 'chaos_lab';
  name = 'Chaos Laboratory';
  description = 'Explore non-linear chaotic dynamical systems: Lorenz Attractor & Pendulum.';
  mathTopic = 'Non-Linear Chaotic Systems';

  sigma = 10;
  rho = 28;
  beta = 8 / 3;

  lx = 0.1;
  ly = 0;
  lz = 0;
  lorenzTrail: { x: number; y: number; z: number }[] = [];

  camAngleX = 0;
  camAngleY = 0;

  mode: 'lorenz' | 'pendulum' | 'logistic' = 'lorenz';

  constructor() {
    this.reset();
  }

  getEquations(): EquationInfo[] {
    return [
      {
        name: 'Lorenz Attractor',
        expression: 'dx/dt = sigma*(y-x), dy/dt = x*(rho-z)-y, dz/dt = x*y - beta*z',
        description: 'Differential equations of atmospheric chaos',
        variables: { sigma: this.sigma, rho: this.rho, beta: this.beta },
      },
    ];
  }

  setVariable(eqName: string, varName: string, val: number): void {
    if (varName === 'sigma') this.sigma = val;
    if (varName === 'rho') this.rho = val;
    if (varName === 'beta') this.beta = val;
  }

  reset(): void {
    this.lx = 0.1;
    this.ly = 0;
    this.lz = 0;
    this.lorenzTrail = [];
    this.camAngleX = 0;
    this.camAngleY = 0;
  }

  update(dt: number, input: HardwareInputState, soundEngine: any): void {
    // Single-press Switch Chaos Mode (Button A)
    if (input.justPressedA) {
      this.mode = this.mode === 'lorenz' ? 'pendulum' : this.mode === 'pendulum' ? 'logistic' : 'lorenz';
      soundEngine.playClick(500);
    }

    // D-Pad rotates 3D Camera Angles
    if (input.dpadLeft) this.camAngleY -= 2.0 * dt;
    if (input.dpadRight) this.camAngleY += 2.0 * dt;
    if (input.dpadUp) this.camAngleX -= 2.0 * dt;
    if (input.dpadDown) this.camAngleX += 2.0 * dt;

    if (this.mode === 'lorenz') {
      for (let i = 0; i < 4; i++) {
        const next = ChaosEngine.stepLorenz(this.lx, this.ly, this.lz, dt * 0.5, this.sigma, this.rho, this.beta);
        this.lx = next.x;
        this.ly = next.y;
        this.lz = next.z;
        this.lorenzTrail.push({ x: this.lx, y: this.ly, z: this.lz });
        if (this.lorenzTrail.length > 600) this.lorenzTrail.shift();
      }
    }
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
    const cy = height * 0.55;

    // Dark Space Backdrop
    ctx.fillStyle = '#090514';
    ctx.fillRect(0, 0, width, height);

    if (this.mode === 'lorenz') {
      // 3D Lorenz Attractor Ribbon Projection
      ctx.lineWidth = 1.6;

      for (let i = 1; i < this.lorenzTrail.length; i++) {
        const pt1 = this.lorenzTrail[i - 1];
        const pt2 = this.lorenzTrail[i];

        const rot1X = pt1.x * Math.cos(this.camAngleY + time * 0.2) - pt1.y * Math.sin(this.camAngleY + time * 0.2);
        const px1 = cx + rot1X * 6;
        const py1 = cy - (pt1.z - 25) * 6 + Math.sin(this.camAngleX) * 20;

        const rot2X = pt2.x * Math.cos(this.camAngleY + time * 0.2) - pt2.y * Math.sin(this.camAngleY + time * 0.2);
        const px2 = cx + rot2X * 6;
        const py2 = cy - (pt2.z - 25) * 6 + Math.sin(this.camAngleX) * 20;

        const hue = (i * 0.6 + time * 40) % 360;
        ctx.strokeStyle = `hsl(${hue}, 85%, 60%)`;

        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.stroke();
      }
    } else if (this.mode === 'logistic') {
      // Logistic Map Bifurcation Diagram
      for (let r = 2.8; r <= 4.0; r += 0.005) {
        const vals = ChaosEngine.evaluateLogisticMap(r, 60);
        const px = (r - 2.8) * (width / 1.2) + 20;
        const hue = (r * 200 + time * 20) % 360;
        ctx.fillStyle = `hsl(${hue}, 80%, 55%)`;
        for (const v of vals) {
          const py = height - v * (height * 0.7) - 30;
          ctx.fillRect(px, py, 1.5, 1.5);
        }
      }
    }

    ProceduralFontEngine.renderText(
      ctx,
      `CHAOS MODE: ${this.mode.toUpperCase()} (PRESS A TO SWITCH)`,
      15,
      25,
      11,
      '#f8fafc',
      fontParams,
      time
    );

    ProceduralFontEngine.renderText(
      ctx,
      'DPAD: ROTATE 3D CAMERA',
      15,
      height - 15,
      9,
      '#a855f7',
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

    ProceduralFontEngine.renderText(ctx, 'LESSON: CHAOS & ATTRACTORS', 25, 40, 14, '#f8fafc', fontParams, time);
  }
}
