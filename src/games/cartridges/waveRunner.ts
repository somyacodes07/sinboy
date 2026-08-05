/**
 * Cartridge 1: Wave Runner
 * "Multi-harmonic terrain runner with infinite smooth scrolling clouds/trees & single-press jump controls."
 */

import { BaseCartridge, EquationInfo } from '../gameEngine';
import { ThemePalette } from '../../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../../font/proceduralFont';
import { HardwareInputState } from '../../graphics/consoleShell';
import { NoiseEngine, LSystemEngine, TWO_PI } from '../../math/mathCore';

function posMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export class WaveRunnerCartridge implements BaseCartridge {
  id = 'wave_runner';
  name = 'Wave Runner';
  description = 'Multi-harmonic wave terrain runner with infinite cloud & tree scrolling.';
  mathTopic = 'Multi-Harmonic Fourier Waves & L-Systems';

  waveFreq = 0.015;
  waveAmp = 28;
  speed = 190;

  playerX = 85;
  playerY = 0;
  playerVy = 0;
  isGrounded = false;
  score = 0;
  gameOver = false;

  obstacles: { x: number; width: number; height: number }[] = [];
  spawnTimer = 0;
  lTreeSegments: { x1: number; y1: number; x2: number; y2: number; depth: number }[] = [];

  constructor() {
    this.reset();
  }

  private getTerrainY(x: number, scrollX: number): number {
    const worldX = x + scrollX;
    const w1 = Math.sin(worldX * this.waveFreq) * this.waveAmp;
    const w2 = Math.sin(worldX * (this.waveFreq * 2.3) + 1.4) * (this.waveAmp * 0.4);
    const w3 = Math.cos(worldX * (this.waveFreq * 4.1) + 2.8) * (this.waveAmp * 0.2);
    return 215 + w1 + w2 + w3;
  }

  getEquations(): EquationInfo[] {
    return [
      {
        name: 'Harmonic Terrain Equation',
        expression: 'y(x) = y0 + A1*sin(f*x) + A2*sin(2.3f*x + 1.4) + A3*cos(4.1f*x + 2.8)',
        description: 'Multi-octave Fourier wave summation for rich terrain variation',
        variables: { A: this.waveAmp, f: this.waveFreq, speed: this.speed },
      },
      {
        name: 'L-System Tree Growth',
        expression: 'F -> FF+[+F-F-F]-[-F+F+F]',
        description: 'Recursive fractal branching rule',
        variables: { iter: 3 },
      },
    ];
  }

  setVariable(eqName: string, varName: string, val: number): void {
    if (varName === 'A') this.waveAmp = Math.max(5, val);
    if (varName === 'f') this.waveFreq = Math.max(0.005, val);
    if (varName === 'speed') this.speed = Math.max(50, val);
  }

  reset(): void {
    this.playerX = 85;
    this.playerY = 180;
    this.playerVy = 0;
    this.isGrounded = false;
    this.score = 0;
    this.gameOver = false;
    this.obstacles = [];
    this.spawnTimer = 0;

    const lString = LSystemEngine.generateString('F', { F: 'FF+[+F-F-F]-[-F+F+F]' }, 3);
    this.lTreeSegments = LSystemEngine.getTurtleSegments(lString, 0, 0, 10, Math.PI / 7);
  }

  update(dt: number, input: HardwareInputState, soundEngine: any): void {
    if (this.gameOver) {
      if (input.justPressedA || input.buttonStart) this.reset();
      return;
    }

    this.score += dt * 10;
    const scrollX = this.score * this.speed * 0.1;
    const groundY = this.getTerrainY(this.playerX, scrollX);

    // Responsive Single-Press Jump Logic
    if ((input.justPressedA || input.buttonA) && this.isGrounded) {
      this.playerVy = -420;
      this.isGrounded = false;
      soundEngine.playJump();
    }

    this.playerVy += 850 * dt;
    this.playerY += this.playerVy * dt;

    if (this.playerY >= groundY - 14) {
      this.playerY = groundY - 14;
      this.playerVy = 0;
      this.isGrounded = true;
    }

    // Spawn Obstacles with Fair Spacing
    this.spawnTimer += dt;
    if (this.spawnTimer > 2.4) {
      this.spawnTimer = 0;
      this.obstacles.push({
        x: 520 + Math.random() * 60,
        width: 18,
        height: 26 + Math.random() * 14,
      });
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= this.speed * dt;
      const obsGroundY = this.getTerrainY(obs.x, scrollX);

      if (Math.abs(this.playerX - obs.x) < 13 && this.playerY + 12 > obsGroundY - obs.height) {
        this.gameOver = true;
        soundEngine.playExplosion();
      }

      if (obs.x < -50) this.obstacles.splice(i, 1);
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
    const scrollX = this.score * this.speed * 0.1;

    // 1. Sky Background Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.75);
    skyGrad.addColorStop(0, '#38bdf8');
    skyGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Sun Disc
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(width - 65, 45, 22, 0, TWO_PI);
    ctx.fill();

    // 2. INFINITE SMOOTH SCROLLING CLOUDS (posMod fix)
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.85;
    const cloudSpan = width + 140;
    for (let c = 0; c < 5; c++) {
      const rawX = c * 150 - scrollX * 0.2;
      const cx = posMod(rawX, cloudSpan) - 40;
      const cy = 42 + NoiseEngine.perlin2D(cx * 0.01, time * 0.5) * 14;

      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, TWO_PI);
      ctx.arc(cx + 14, cy - 6, 15, 0, TWO_PI);
      ctx.arc(cx + 28, cy, 16, 0, TWO_PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 3. INFINITE SMOOTH SCROLLING L-SYSTEM TREES (posMod fix)
    const treeSpan = width + 180;
    for (let t = 0; t < 4; t++) {
      const rawTreeX = t * 180 - scrollX * 0.5;
      const treeX = posMod(rawTreeX, treeSpan) - 40;
      const treeGroundY = this.getTerrainY(treeX, scrollX);

      ctx.save();
      ctx.translate(treeX, treeGroundY);

      for (const seg of this.lTreeSegments) {
        if (seg.depth <= 2) {
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = Math.max(2, 5 - seg.depth);
        } else {
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2;
        }

        ctx.beginPath();
        ctx.moveTo(seg.x1 * 0.7, seg.y1 * 0.7);
        ctx.lineTo(seg.x2 * 0.7, seg.y2 * 0.7);
        ctx.stroke();

        if (seg.depth >= 3) {
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.arc(seg.x2 * 0.7, seg.y2 * 0.7, 3.5, 0, TWO_PI);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 4. Multi-Harmonic Terrain (Emerald Green)
    const groundGrad = ctx.createLinearGradient(0, 180, 0, height);
    groundGrad.addColorStop(0, '#22c55e');
    groundGrad.addColorStop(1, '#15803d');

    ctx.fillStyle = groundGrad;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 4) {
      const gy = this.getTerrainY(x, scrollX);
      ctx.lineTo(x, gy);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Grass Top Line
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 4) {
      const gy = this.getTerrainY(x, scrollX);
      if (x === 0) ctx.moveTo(x, gy);
      else ctx.lineTo(x, gy);
    }
    ctx.stroke();

    // 5. Red Obstacle Spikes
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;
    for (const obs of this.obstacles) {
      const obsGroundY = this.getTerrainY(obs.x, scrollX);
      ctx.beginPath();
      ctx.moveTo(obs.x - obs.width * 0.5, obsGroundY);
      ctx.lineTo(obs.x, obsGroundY - obs.height);
      ctx.lineTo(obs.x + obs.width * 0.5, obsGroundY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // 6. Orange Runner Avatar
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.fillRect(this.playerX - 12, this.playerY - 12, 24, 24);
    ctx.strokeRect(this.playerX - 12, this.playerY - 12, 24, 24);

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.playerX + 2, this.playerY - 7, 5, 5);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(this.playerX + 4, this.playerY - 5, 2.5, 2.5);

    // Score HUD
    ProceduralFontEngine.renderText(ctx, `SCORE: ${Math.floor(this.score)}`, 20, 30, 14, '#0f172a', fontParams, time);

    if (this.gameOver) {
      ProceduralFontEngine.renderText(ctx, 'GAME OVER - PRESS A TO RESTART', width * 0.12, height * 0.5, 16, '#dc2626', fontParams, time);
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
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(10, 10, width - 20, height - 20);

    ProceduralFontEngine.renderText(ctx, 'LESSON: MULTI-HARMONIC WAVES', 25, 40, 14, '#0f172a', fontParams, time);
    ProceduralFontEngine.renderText(ctx, 'y(x) = y0 + A1 sin(f x) + A2 sin(2.3f x + 1.4)', 25, 75, 11, '#0284c7', fontParams, time);
  }
}
