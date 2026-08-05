/**
 * Cartridge 2: Orbit Survivor
 * "Survive & shoot orbital attacks governed by Lissajous parametric curves."
 */

import { BaseCartridge, EquationInfo } from '../gameEngine';
import { ThemePalette } from '../../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../../font/proceduralFont';
import { HardwareInputState } from '../../graphics/consoleShell';
import { TWO_PI, PI } from '../../math/mathCore';

export class OrbitSurvivorCartridge implements BaseCartridge {
  id = 'orbit_survivor';
  name = 'Orbit Survivor';
  description = 'Survive & shoot orbital attacks governed by Lissajous parametric curves.';
  mathTopic = 'Lissajous Curves & Polar Kinematics';

  lissA = 3;
  lissB = 4;
  speed = 1.2;

  playerAngle = 0;
  playerRadius = 110;
  score = 0;
  gameOver = false;

  enemies: { id: number; t: number; delta: number; r: number; hp: number }[] = [];
  playerBullets: { x: number; y: number; vx: number; vy: number }[] = [];

  constructor() {
    this.reset();
  }

  getEquations(): EquationInfo[] {
    return [
      {
        name: 'Lissajous Trajectory',
        expression: 'x(t) = A * sin(a * t + delta), y(t) = B * sin(b * t)',
        description: 'Orthogonal harmonic oscillation curve',
        variables: { a: this.lissA, b: this.lissB, speed: this.speed },
      },
    ];
  }

  setVariable(eqName: string, varName: string, val: number): void {
    if (varName === 'a') this.lissA = val;
    if (varName === 'b') this.lissB = val;
    if (varName === 'speed') this.speed = val;
  }

  reset(): void {
    this.playerAngle = 0;
    this.playerRadius = 110;
    this.score = 0;
    this.gameOver = false;
    this.enemies = [];
    this.playerBullets = [];

    for (let i = 0; i < 7; i++) {
      this.enemies.push({ id: i, t: i * 0.8, delta: (i * PI) / 3.5, r: 120, hp: 1 });
    }
  }

  update(dt: number, input: HardwareInputState, soundEngine: any): void {
    if (this.gameOver) {
      if (input.justPressedA || input.buttonStart) this.reset();
      return;
    }

    this.score += dt * 5;

    if (input.dpadLeft) this.playerAngle -= 3.2 * dt;
    if (input.dpadRight) this.playerAngle += 3.2 * dt;

    const px = 240 + Math.cos(this.playerAngle) * this.playerRadius;
    const py = 150 + Math.sin(this.playerAngle) * this.playerRadius;

    // Single-press Shoot Plasma Counter-Missiles (Button A)
    if (input.justPressedA) {
      const shootAngle = this.playerAngle + PI; // Shoot inward towards core/enemies
      this.playerBullets.push({
        x: px,
        y: py,
        vx: Math.cos(shootAngle) * 280,
        vy: Math.sin(shootAngle) * 280,
      });
      soundEngine.playLaser();
    }

    // Update Bullets
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const b = this.playerBullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      // Enemy hit check
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        const ex = 240 + Math.sin(this.lissA * e.t + e.delta) * 110;
        const ey = 150 + Math.sin(this.lissB * e.t) * 90;

        const distBullet = Math.sqrt((b.x - ex) ** 2 + (b.y - ey) ** 2);
        if (distBullet < 16) {
          this.score += 50;
          this.playerBullets.splice(i, 1);
          soundEngine.playExplosion();

          // Respawn Enemy
          e.t = Math.random() * TWO_PI;
          break;
        }
      }

      if (b.x < 0 || b.x > 480 || b.y < 0 || b.y > 320) {
        this.playerBullets.splice(i, 1);
      }
    }

    // Update Enemies & Player Collision
    for (const enemy of this.enemies) {
      enemy.t += dt * this.speed;
      const ex = 240 + Math.sin(this.lissA * enemy.t + enemy.delta) * 110;
      const ey = 150 + Math.sin(this.lissB * enemy.t) * 90;

      const dist = Math.sqrt((px - ex) ** 2 + (py - ey) ** 2);
      if (dist < 18) {
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
    const cx = width * 0.5;
    const cy = height * 0.5;

    // Deep Cosmic Background
    const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, width * 0.6);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Starfield
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97 + Math.sin(time + i) * 10) % width;
      const sy = (i * 53 + Math.cos(time + i) * 10) % height;
      ctx.globalAlpha = 0.3 + 0.7 * Math.sin(time * 3 + i);
      ctx.fillRect(sx, sy, (i % 3) + 1, (i % 3) + 1);
    }
    ctx.globalAlpha = 1.0;

    // Render Lissajous Trajectory Track
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    const steps = 180;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * TWO_PI;
      const lx = cx + Math.sin(this.lissA * t) * 110;
      const ly = cy + Math.sin(this.lissB * t) * 90;
      if (i === 0) ctx.moveTo(lx, ly);
      else ctx.lineTo(lx, ly);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Player Orbit Ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, this.playerRadius, 0, TWO_PI);
    ctx.stroke();

    // Player Bullets
    ctx.fillStyle = '#fde047';
    for (const b of this.playerBullets) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, TWO_PI);
      ctx.fill();
    }

    // Glowing Cyan Player Orb
    const px = cx + Math.cos(this.playerAngle) * this.playerRadius;
    const py = cy + Math.sin(this.playerAngle) * this.playerRadius;

    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(px, py, 11, 0, TWO_PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px - 3, py - 3, 4, 0, TWO_PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ruby Red Lissajous Enemies
    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      const ex = cx + Math.sin(this.lissA * enemy.t + enemy.delta) * 110;
      const ey = cy + Math.sin(this.lissB * enemy.t) * 90;

      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(ex, ey, 9, 0, TWO_PI);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ProceduralFontEngine.renderText(ctx, `SCORE: ${Math.floor(this.score)}`, 20, 30, 14, '#f8fafc', fontParams, time);

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

    ProceduralFontEngine.renderText(ctx, 'LESSON: LISSAJOUS CURVES', 25, 40, 14, '#f8fafc', fontParams, time);
  }
}
