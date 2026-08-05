/**
 * Cartridge 3: Particle Dodge
 * "Evade particles driven by Boids flocking rules and Perlin vector flow fields with EMP shockwave ability."
 */

import { BaseCartridge, EquationInfo } from '../gameEngine';
import { ThemePalette } from '../../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../../font/proceduralFont';
import { HardwareInputState } from '../../graphics/consoleShell';
import { NoiseEngine, TWO_PI } from '../../math/mathCore';

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export class ParticleDodgeCartridge implements BaseCartridge {
  id = 'particle_dodge';
  name = 'Particle Dodge';
  description = 'Dodge autonomous particles governed by Boids flocking math.';
  mathTopic = 'Boids Flocking Math & Vector Fields';

  separationWeight = 1.5;
  alignmentWeight = 1.0;
  cohesionWeight = 1.0;

  px = 240;
  py = 150;
  score = 0;
  empCharges = 3;
  empRadius = 0;
  gameOver = false;
  boids: Boid[] = [];

  constructor() {
    this.reset();
  }

  getEquations(): EquationInfo[] {
    return [
      {
        name: 'Boids Flocking Vector',
        expression: 'F_total = w1 * F_sep + w2 * F_ali + w3 * F_coh',
        description: 'Emergent flocking dynamics',
        variables: { sep: this.separationWeight, ali: this.alignmentWeight, coh: this.cohesionWeight },
      },
    ];
  }

  setVariable(eqName: string, varName: string, val: number): void {
    if (varName === 'sep') this.separationWeight = val;
    if (varName === 'ali') this.alignmentWeight = val;
    if (varName === 'coh') this.cohesionWeight = val;
  }

  reset(): void {
    this.px = 240;
    this.py = 150;
    this.score = 0;
    this.empCharges = 3;
    this.empRadius = 0;
    this.gameOver = false;
    this.boids = [];

    for (let i = 0; i < 30; i++) {
      this.boids.push({
        x: Math.random() * 400 + 40,
        y: Math.random() * 200 + 40,
        vx: (Math.random() - 0.5) * 70,
        vy: (Math.random() - 0.5) * 70,
      });
    }
  }

  update(dt: number, input: HardwareInputState, soundEngine: any): void {
    if (this.gameOver) {
      if (input.justPressedA || input.buttonStart) this.reset();
      return;
    }

    this.score += dt * 5;

    const speed = 190;
    if (input.dpadLeft && this.px > 15) this.px -= speed * dt;
    if (input.dpadRight && this.px < 465) this.px += speed * dt;
    if (input.dpadUp && this.py > 15) this.py -= speed * dt;
    if (input.dpadDown && this.py < 285) this.py += speed * dt;

    // Trigger EMP Shockwave (Button A)
    if (input.justPressedA && this.empCharges > 0 && this.empRadius <= 0) {
      this.empCharges--;
      this.empRadius = 1;
      soundEngine.playExplosion();
    }

    // Expand EMP Shockwave
    if (this.empRadius > 0) {
      this.empRadius += dt * 450;
      if (this.empRadius > 140) this.empRadius = 0;
    }

    for (const b of this.boids) {
      const flowAngle = NoiseEngine.perlin2D(b.x * 0.005, b.y * 0.005) * TWO_PI;
      b.vx += Math.cos(flowAngle) * 35 * dt;
      b.vy += Math.sin(flowAngle) * 35 * dt;

      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.x < 10) b.x = 470;
      if (b.x > 470) b.x = 10;
      if (b.y < 10) b.y = 290;
      if (b.y > 290) b.y = 10;

      // EMP Shockwave Repulsion
      if (this.empRadius > 0) {
        const distEmp = Math.sqrt((this.px - b.x) ** 2 + (this.py - b.y) ** 2);
        if (Math.abs(distEmp - this.empRadius) < 25) {
          const pushAngle = Math.atan2(b.y - this.py, b.x - this.px);
          b.vx = Math.cos(pushAngle) * 300;
          b.vy = Math.sin(pushAngle) * 300;
          this.score += 2;
        }
      }

      // Player Collision Check
      const dist = Math.sqrt((this.px - b.x) ** 2 + (this.py - b.y) ** 2);
      if (dist < 13) {
        this.gameOver = true;
        soundEngine.playExplosion();
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
    // Deep Navy Vector Field Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Vector Flow Field Grid Lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    for (let y = 15; y < height; y += 30) {
      for (let x = 15; x < width; x += 30) {
        const angle = NoiseEngine.perlin2D(x * 0.005, y * 0.005) * TWO_PI;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * 10, y + Math.sin(angle) * 10);
        ctx.stroke();
      }
    }

    // Expanding EMP Shockwave Ring
    if (this.empRadius > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(this.px, this.py, this.empRadius, 0, TWO_PI);
      ctx.stroke();
    }

    // Velocity-Colored Boids Particles
    for (const b of this.boids) {
      const speedVal = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      ctx.fillStyle = speedVal > 40 ? '#f43f5e' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 5, 0, TWO_PI);
      ctx.fill();
    }

    // Glowing Amber Player Vessel
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(this.px, this.py, 10, 0, TWO_PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.px - 3, this.py - 3, 3, 0, TWO_PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    ProceduralFontEngine.renderText(ctx, `SCORE: ${Math.floor(this.score)} | EMP: ${this.empCharges}`, 20, 30, 14, '#f8fafc', fontParams, time);

    if (this.gameOver) {
      ProceduralFontEngine.renderText(ctx, 'GAME OVER - PRESS A TO RESTART', width * 0.12, height * 0.5, 16, '#f43f5e', fontParams, time);
    }
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

    ProceduralFontEngine.renderText(ctx, 'LESSON: BOIDS & FLOW FIELDS', 25, 40, 14, '#f8fafc', fontParams, time);
  }
}
