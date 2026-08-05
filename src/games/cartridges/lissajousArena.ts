/**
 * Cartridge 9: Lissajous Arena
 * "Dynamic Boss Battle with Lissajous Kinematics, Polar Rose Shield Morphing, Targeted Plasma Projectiles & 8-Way Radial Shockwaves."
 */

import { BaseCartridge, EquationInfo } from '../gameEngine';
import { ThemePalette } from '../../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../../font/proceduralFont';
import { HardwareInputState } from '../../graphics/consoleShell';
import { TWO_PI } from '../../math/mathCore';

interface BossProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

export class LissajousArenaCartridge implements BaseCartridge {
  id = 'lissajous_arena';
  name = 'Lissajous Arena';
  description = 'Dynamic Boss battle against parametric rose-curve entities.';
  mathTopic = 'Parametric Curve Collision & Polar Kinematics';

  bossHp = 100;
  bossPhase = 1;
  bossAttackTimer = 0;

  playerHp = 100;
  playerX = 240;
  playerY = 250;

  bullets: { x: number; y: number; vy: number }[] = [];
  bossProjectiles: BossProjectile[] = [];
  particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

  gameOver = false;
  victory = false;

  constructor() {
    this.reset();
  }

  getEquations(): EquationInfo[] {
    return [
      {
        name: 'Boss Parametric Shield',
        expression: 'R(theta) = R0 + A * cos(k * theta + omega * t)',
        description: 'Dynamic polar rose-curve boss forcefield',
        variables: { R0: 45, A: 16, k: 5 },
      },
      {
        name: 'Boss Lissajous Orbit',
        expression: 'X_b = Cx + A*sin(2t), Y_b = Cy + B*sin(3t)',
        description: 'Harmonic 2D trajectory of boss movement',
        variables: { freqX: 2, freqY: 3 },
      },
    ];
  }

  setVariable(eqName: string, varName: string, val: number): void {}

  reset(): void {
    this.bossHp = 100;
    this.bossPhase = 1;
    this.bossAttackTimer = 0;
    this.playerHp = 100;
    this.playerX = 240;
    this.playerY = 250;
    this.bullets = [];
    this.bossProjectiles = [];
    this.particles = [];
    this.gameOver = false;
    this.victory = false;
  }

  update(dt: number, input: HardwareInputState, soundEngine: any): void {
    if (this.gameOver || this.victory) {
      if (input.justPressedA || input.buttonStart) this.reset();
      return;
    }

    // Player Movement
    const speed = 190;
    if (input.dpadLeft && this.playerX > 35) this.playerX -= speed * dt;
    if (input.dpadRight && this.playerX < 445) this.playerX += speed * dt;
    if (input.dpadUp && this.playerY > 150) this.playerY -= speed * dt;
    if (input.dpadDown && this.playerY < 285) this.playerY += speed * dt;

    // Single-press Laser Shooting (Button A)
    if (input.justPressedA) {
      this.bullets.push({ x: this.playerX, y: this.playerY - 14, vy: -420 });
      soundEngine.playLaser();
    }

    // Boss Position (Dynamic Lissajous Trajectory)
    const timeSec = performance.now() / 1000;
    const bossX = 240 + Math.sin(1.8 * timeSec) * 110;
    const bossY = 75 + Math.sin(2.7 * timeSec) * 25;

    // Boss Phase Logic
    if (this.bossHp <= 50 && this.bossPhase === 1) {
      this.bossPhase = 2;
      soundEngine.playExplosion();
    }

    // Boss Attacks
    this.bossAttackTimer += dt;
    const attackInterval = this.bossPhase === 1 ? 1.5 : 1.0;

    if (this.bossAttackTimer >= attackInterval) {
      this.bossAttackTimer = 0;

      if (this.bossPhase === 1) {
        // Targeted Plasma Orbs at Player
        const angle = Math.atan2(this.playerY - bossY, this.playerX - bossX);
        const pSpeed = 160;
        this.bossProjectiles.push({
          x: bossX,
          y: bossY,
          vx: Math.cos(angle) * pSpeed,
          vy: Math.sin(angle) * pSpeed,
          color: '#f43f5e',
        });
        soundEngine.playClick(600);
      } else {
        // 8-Way Radial Energy Shockwave
        for (let i = 0; i < 8; i++) {
          const angle = (i * TWO_PI) / 8 + timeSec;
          const pSpeed = 140;
          this.bossProjectiles.push({
            x: bossX,
            y: bossY,
            vx: Math.cos(angle) * pSpeed,
            vy: Math.sin(angle) * pSpeed,
            color: '#a855f7',
          });
        }
        soundEngine.playExplosion();
      }
    }

    // Update Player Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.y += b.vy * dt;

      // Boss Collision Check
      const distBoss = Math.sqrt((b.x - bossX) ** 2 + (b.y - bossY) ** 2);
      if (distBoss < 46) {
        this.bossHp = Math.max(0, this.bossHp - 2.5);
        this.bullets.splice(i, 1);
        soundEngine.playBossHit();

        // Sparks
        for (let p = 0; p < 3; p++) {
          this.particles.push({
            x: b.x,
            y: b.y,
            vx: (Math.random() - 0.5) * 120,
            vy: (Math.random() - 0.5) * 120,
            life: 0.3,
            color: '#fde047',
          });
        }

        if (this.bossHp <= 0) {
          this.victory = true;
          soundEngine.playExplosion();
        }
      } else if (b.y < 5) {
        this.bullets.splice(i, 1);
      }
    }

    // Update Boss Projectiles
    for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
      const bp = this.bossProjectiles[i];
      bp.x += bp.vx * dt;
      bp.y += bp.vy * dt;

      // Player Collision Check
      const distPlayer = Math.sqrt((bp.x - this.playerX) ** 2 + (bp.y - this.playerY) ** 2);
      if (distPlayer < 14) {
        this.playerHp = Math.max(0, this.playerHp - 20);
        this.bossProjectiles.splice(i, 1);
        soundEngine.playExplosion();

        if (this.playerHp <= 0) {
          this.gameOver = true;
        }
      } else if (bp.x < 0 || bp.x > 480 || bp.y < 0 || bp.y > 320) {
        this.bossProjectiles.splice(i, 1);
      }
    }

    // Update Sparks & Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
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
    const timeSec = time;
    const bossX = 240 + Math.sin(1.8 * timeSec) * 110;
    const bossY = 75 + Math.sin(2.7 * timeSec) * 25;

    // Deep Magenta Space Arena Background
    const bgGrad = ctx.createRadialGradient(240, 150, 30, 240, 150, width * 0.65);
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(1, '#090514');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Glowing Boss Parametric Rose-Curve Shield
    const shieldColor = this.bossPhase === 1 ? '#f472b6' : '#c084fc';
    ctx.shadowColor = shieldColor;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = shieldColor;
    ctx.lineWidth = 3;

    ctx.beginPath();
    const steps = 140;
    const petNum = this.bossPhase === 1 ? 5 : 8;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * TWO_PI;
      const r = 40 + 16 * Math.cos(petNum * theta + timeSec * 3.0);
      const bx = bossX + Math.cos(theta) * r;
      const by = bossY + Math.sin(theta) * r;

      if (i === 0) ctx.moveTo(bx, by);
      else ctx.lineTo(bx, by);
    }
    ctx.stroke();

    // Inner Boss Core
    ctx.fillStyle = this.bossPhase === 1 ? '#db2777' : '#9333ea';
    ctx.beginPath();
    ctx.arc(bossX, bossY, 15, 0, TWO_PI);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Boss Projectiles
    for (const bp of this.bossProjectiles) {
      ctx.fillStyle = bp.color;
      ctx.shadowColor = bp.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(bp.x, bp.y, 5, 0, TWO_PI);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Player Bullets
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 10;
    for (const b of this.bullets) {
      ctx.fillRect(b.x - 2.5, b.y - 7, 5, 12);
    }
    ctx.shadowBlur = 0;

    // Spark Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 3, 3);
    }

    // Glowing Cyan Player Fighter Ship
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(this.playerX, this.playerY - 12);
    ctx.lineTo(this.playerX - 12, this.playerY + 10);
    ctx.lineTo(this.playerX, this.playerY + 5);
    ctx.lineTo(this.playerX + 12, this.playerY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // HUD: Boss Health Bar & Player Health Bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ProceduralFontEngine.renderText(ctx, `BOSS HP: ${Math.ceil(this.bossHp)}% (PHASE ${this.bossPhase})`, 20, 20, 10, '#f472b6', fontParams, time);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(20, 26, 200, 8);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(21, 27, (198 * this.bossHp) / 100, 6);

    ProceduralFontEngine.renderText(ctx, `PLAYER HP: ${Math.ceil(this.playerHp)}%`, 260, 20, 10, '#38bdf8', fontParams, time);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(260, 26, 200, 8);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(261, 27, (198 * this.playerHp) / 100, 6);

    if (this.victory) {
      ProceduralFontEngine.renderText(ctx, 'VICTORY! BOSS DEFEATED!', width * 0.15, height * 0.5, 18, '#38bdf8', fontParams, time);
      ProceduralFontEngine.renderText(ctx, 'PRESS A TO RESTART', width * 0.28, height * 0.58, 12, '#ffffff', fontParams, time);
    } else if (this.gameOver) {
      ProceduralFontEngine.renderText(ctx, 'GAME OVER - DESTROYED', width * 0.15, height * 0.5, 18, '#f43f5e', fontParams, time);
      ProceduralFontEngine.renderText(ctx, 'PRESS A TO RESTART', width * 0.28, height * 0.58, 12, '#ffffff', fontParams, time);
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

    ProceduralFontEngine.renderText(ctx, 'LESSON: POLAR PARAMETRIC CURVES', 25, 40, 14, '#f8fafc', fontParams, time);
  }
}
