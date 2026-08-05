/**
 * Cartridge 7: Chaos Lab
 * "Interactive 3D chaotic math laboratory: Lorenz Attractor, Double Pendulum & Animated Logistic Bifurcation."
 */

import { BaseCartridge, EquationInfo } from '../gameEngine';
import { ThemePalette } from '../../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../../font/proceduralFont';
import { HardwareInputState } from '../../graphics/consoleShell';
import { ChaosEngine, TWO_PI, PI } from '../../math/mathCore';

export class ChaosLabCartridge implements BaseCartridge {
  id = 'chaos_lab';
  name = 'Chaos Laboratory';
  description = 'Explore 3D Lorenz Attractors, Double Pendulums & Logistic Bifurcation.';
  mathTopic = 'Non-Linear Chaotic Dynamical Systems';

  // Mode 1: Lorenz Attractor
  sigma = 10;
  rho = 28;
  beta = 8 / 3;
  lx = 0.1;
  ly = 0;
  lz = 0;
  lorenzTrail: { x: number; y: number; z: number }[] = [];

  // Mode 2: Double Pendulum Simulation
  theta1 = PI / 2;
  theta2 = PI / 2;
  omega1 = 0;
  omega2 = 0;
  l1 = 85;
  l2 = 75;
  m1 = 10;
  m2 = 8;
  g = 9.81;
  pendulumTrail: { x: number; y: number }[] = [];

  // Mode 3: Dynamic Logistic Map
  logisticR = 3.6;
  logisticTrail: { r: number; x: number }[] = [];

  camAngleX = 0;
  camAngleY = 0;

  mode: 'lorenz' | 'pendulum' | 'logistic' = 'lorenz';

  constructor() {
    this.reset();
  }

  getEquations(): EquationInfo[] {
    return [
      {
        name: 'Lorenz & Chaotic Physics',
        expression: 'dx/dt = sigma*(y-x), dy/dt = x*(rho-z)-y, dz/dt = x*y - beta*z',
        description: 'Differential equations of non-linear atmospheric chaos',
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
    // Lorenz Reset
    this.lx = 0.1;
    this.ly = 0;
    this.lz = 0;
    this.lorenzTrail = [];

    // Pendulum Reset
    this.theta1 = PI / 2;
    this.theta2 = PI / 2;
    this.omega1 = 0;
    this.omega2 = 0;
    this.pendulumTrail = [];

    // Logistic Reset
    this.logisticR = 3.6;

    this.camAngleX = 0;
    this.camAngleY = 0;
  }

  update(dt: number, input: HardwareInputState, soundEngine: any): void {
    // Single-press Switch Chaos Mode (Button A)
    if (input.justPressedA) {
      this.mode = this.mode === 'lorenz' ? 'pendulum' : this.mode === 'pendulum' ? 'logistic' : 'lorenz';
      soundEngine.playClick(600);
    }

    // D-Pad rotates 3D Camera Angles / Tunes Parameters
    if (input.dpadLeft) this.camAngleY -= 2.5 * dt;
    if (input.dpadRight) this.camAngleY += 2.5 * dt;
    if (input.dpadUp) this.camAngleX -= 2.5 * dt;
    if (input.dpadDown) this.camAngleX += 2.5 * dt;

    if (this.mode === 'lorenz') {
      for (let i = 0; i < 4; i++) {
        const next = ChaosEngine.stepLorenz(this.lx, this.ly, this.lz, dt * 0.5, this.sigma, this.rho, this.beta);
        this.lx = next.x;
        this.ly = next.y;
        this.lz = next.z;
        this.lorenzTrail.push({ x: this.lx, y: this.ly, z: this.lz });
        if (this.lorenzTrail.length > 700) this.lorenzTrail.shift();
      }
    } else if (this.mode === 'pendulum') {
      // Numerical Euler-Lagrange Integration for Double Pendulum
      const num1 = -this.g * (2 * this.m1 + this.m2) * Math.sin(this.theta1) - this.m2 * this.g * Math.sin(this.theta1 - 2 * this.theta2) - 2 * Math.sin(this.theta1 - this.theta2) * this.m2 * (this.omega2 * this.omega2 * this.l2 + this.omega1 * this.omega1 * this.l1 * Math.cos(this.theta1 - this.theta2));
      const den1 = this.l1 * (2 * this.m1 + this.m2 - this.m2 * Math.cos(2 * this.theta1 - 2 * this.theta2));
      const alpha1 = num1 / den1;

      const num2 = 2 * Math.sin(this.theta1 - this.theta2) * (this.omega1 * this.omega1 * this.l1 * (this.m1 + this.m2) + this.g * (this.m1 + this.m2) * Math.cos(this.theta1) + this.omega2 * this.omega2 * this.l2 * this.m2 * Math.cos(this.theta1 - this.theta2));
      const den2 = this.l2 * (2 * this.m1 + this.m2 - this.m2 * Math.cos(2 * this.theta1 - 2 * this.theta2));
      const alpha2 = num2 / den2;

      this.omega1 += alpha1 * dt * 8.0;
      this.omega2 += alpha2 * dt * 8.0;
      this.theta1 += this.omega1 * dt * 8.0;
      this.theta2 += this.omega2 * dt * 8.0;

      // Dampening
      this.omega1 *= 0.999;
      this.omega2 *= 0.999;

      const cx = 240;
      const cy = 90;
      const x1 = cx + this.l1 * Math.sin(this.theta1);
      const y1 = cy + this.l1 * Math.cos(this.theta1);
      const x2 = x1 + this.l2 * Math.sin(this.theta2);
      const y2 = y1 + this.l2 * Math.cos(this.theta2);

      this.pendulumTrail.push({ x: x2, y: y2 });
      if (this.pendulumTrail.length > 350) this.pendulumTrail.shift();
    } else if (this.mode === 'logistic') {
      // Dynamic Scanning Logistic Bifurcation
      this.logisticR = 2.8 + (Math.sin(dt * 2.0) * 0.6 + 0.6);
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
      // MODE 1: 3D LORENZ ATTRACTOR
      ctx.lineWidth = 1.8;

      for (let i = 1; i < this.lorenzTrail.length; i++) {
        const pt1 = this.lorenzTrail[i - 1];
        const pt2 = this.lorenzTrail[i];

        const rot1X = pt1.x * Math.cos(this.camAngleY + time * 0.3) - pt1.y * Math.sin(this.camAngleY + time * 0.3);
        const px1 = cx + rot1X * 6.5;
        const py1 = cy - (pt1.z - 25) * 6.5 + Math.sin(this.camAngleX) * 25;

        const rot2X = pt2.x * Math.cos(this.camAngleY + time * 0.3) - pt2.y * Math.sin(this.camAngleY + time * 0.3);
        const px2 = cx + rot2X * 6.5;
        const py2 = cy - (pt2.z - 25) * 6.5 + Math.sin(this.camAngleX) * 25;

        const hue = (i * 0.6 + time * 50) % 360;
        ctx.strokeStyle = `hsl(${hue}, 90%, 60%)`;

        ctx.beginPath();
        ctx.moveTo(px1, py1);
        ctx.lineTo(px2, py2);
        ctx.stroke();
      }

      // Glowing Trajectory Head
      if (this.lorenzTrail.length > 0) {
        const head = this.lorenzTrail[this.lorenzTrail.length - 1];
        const rotX = head.x * Math.cos(this.camAngleY + time * 0.3) - head.y * Math.sin(this.camAngleY + time * 0.3);
        const hx = cx + rotX * 6.5;
        const hy = cy - (head.z - 25) * 6.5 + Math.sin(this.camAngleX) * 25;

        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(hx, hy, 5, 0, TWO_PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    } else if (this.mode === 'pendulum') {
      // MODE 2: DOUBLE CHAOTIC PENDULUM
      const pivotX = cx;
      const pivotY = 75;

      const x1 = pivotX + this.l1 * Math.sin(this.theta1);
      const y1 = pivotY + this.l1 * Math.cos(this.theta1);
      const x2 = x1 + this.l2 * Math.sin(this.theta2);
      const y2 = y1 + this.l2 * Math.cos(this.theta2);

      // Trajectory Ribbon Trail
      ctx.lineWidth = 2;
      for (let i = 1; i < this.pendulumTrail.length; i++) {
        const p1 = this.pendulumTrail[i - 1];
        const p2 = this.pendulumTrail[i];
        const hue = (i * 1.2 + time * 60) % 360;
        ctx.strokeStyle = `hsl(${hue}, 90%, 60%)`;
        ctx.globalAlpha = i / this.pendulumTrail.length;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // Brass Rod 1 & Rod 2
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Pivot Joints
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 5, 0, TWO_PI);
      ctx.arc(x1, y1, 7, 0, TWO_PI);
      ctx.fill();

      // Glowing Neon Bob
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(x2, y2, 9, 0, TWO_PI);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (this.mode === 'logistic') {
      // MODE 3: DYNAMIC LOGISTIC MAP BIFURCATION DENSITY
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';

      for (let r = 2.8; r <= 4.0; r += 0.004) {
        const vals = ChaosEngine.evaluateLogisticMap(r, 60);
        const px = (r - 2.8) * (width / 1.25) + 30;

        const hue = (r * 220 + time * 30) % 360;
        ctx.fillStyle = `hsl(${hue}, 85%, 60%)`;

        for (const v of vals) {
          const py = height - v * (height * 0.72) - 25;
          ctx.fillRect(px, py, 1.8, 1.8);
        }
      }

      // Dynamic Scanning Line
      const scanX = (Math.sin(time * 1.5) * 0.5 + 0.5) * (width - 60) + 30;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(scanX, 40);
      ctx.lineTo(scanX, height - 25);
      ctx.stroke();
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
      'DPAD: ROTATE 3D CAMERA / TUNE DYNAMICS',
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

    ProceduralFontEngine.renderText(ctx, 'LESSON: CHAOS & DYNAMICAL SYSTEMS', 25, 40, 14, '#f8fafc', fontParams, time);
  }
}
