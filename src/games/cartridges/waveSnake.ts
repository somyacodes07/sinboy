/**
 * Cartridge 4: Wave Snake
 * "Snake body segments follow continuous trigonometric sine wave equations in a vibrant meadow environment."
 */

import { BaseCartridge, EquationInfo } from '../gameEngine';
import { ThemePalette } from '../../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../../font/proceduralFont';
import { HardwareInputState } from '../../graphics/consoleShell';
import { TWO_PI } from '../../math/mathCore';

export class WaveSnakeCartridge implements BaseCartridge {
  id = 'wave_snake';
  name = 'Wave Snake';
  description = 'Snake body segments follow continuous trigonometric wave equations.';
  mathTopic = 'Continuous Trigonometric Interpolation';

  waveAmp = 12;
  waveFreq = 0.15;

  dirX = 1;
  dirY = 0;
  headX = 240;
  headY = 150;
  history: { x: number; y: number }[] = [];
  snakeLength = 20;

  foodX = 320;
  foodY = 150;
  score = 0;
  gameOver = false;

  constructor() {
    this.reset();
  }

  getEquations(): EquationInfo[] {
    return [
      {
        name: 'Snake Wave Modulation',
        expression: 'offset(i) = A * sin(f * i + omega * t)',
        description: 'Trigonometric snake body undulation',
        variables: { A: this.waveAmp, f: this.waveFreq },
      },
    ];
  }

  setVariable(eqName: string, varName: string, val: number): void {
    if (varName === 'A') this.waveAmp = val;
    if (varName === 'f') this.waveFreq = val;
  }

  reset(): void {
    this.headX = 240;
    this.headY = 150;
    this.dirX = 1;
    this.dirY = 0;
    this.history = [];
    this.snakeLength = 25;
    this.score = 0;
    this.gameOver = false;

    this.spawnFood();
  }

  spawnFood() {
    this.foodX = Math.floor(Math.random() * 380) + 50;
    this.foodY = Math.floor(Math.random() * 220) + 40;
  }

  update(dt: number, input: HardwareInputState, soundEngine: any): void {
    if (this.gameOver) {
      if (input.justPressedA || input.buttonStart) this.reset();
      return;
    }

    if (input.dpadLeft && this.dirX !== 1) { this.dirX = -1; this.dirY = 0; }
    if (input.dpadRight && this.dirX !== -1) { this.dirX = 1; this.dirY = 0; }
    if (input.dpadUp && this.dirY !== 1) { this.dirX = 0; this.dirY = -1; }
    if (input.dpadDown && this.dirY !== -1) { this.dirX = 0; this.dirY = 1; }

    const speed = 140;
    this.headX += this.dirX * speed * dt;
    this.headY += this.dirY * speed * dt;

    this.history.unshift({ x: this.headX, y: this.headY });
    if (this.history.length > this.snakeLength * 4) {
      this.history.pop();
    }

    if (this.headX < 15 || this.headX > 465 || this.headY < 15 || this.headY > 285) {
      this.gameOver = true;
      soundEngine.playExplosion();
    }

    const distFood = Math.sqrt((this.headX - this.foodX) ** 2 + (this.headY - this.foodY) ** 2);
    if (distFood < 16) {
      this.score += 10;
      this.snakeLength += 5;
      soundEngine.playPickup();
      this.spawnFood();
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
    // Soft Meadow Background Gradient
    const meadowGrad = ctx.createLinearGradient(0, 0, 0, height);
    meadowGrad.addColorStop(0, '#f0fdf4');
    meadowGrad.addColorStop(1, '#dcfce7');
    ctx.fillStyle = meadowGrad;
    ctx.fillRect(0, 0, width, height);

    // Golden Apple Food (Pulsing Glow)
    const foodPulse = 8 + Math.sin(time * 6.0) * 2;
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(this.foodX, this.foodY, foodPulse, 0, TWO_PI);
    ctx.fill();
    ctx.fillStyle = '#15803d'; // Stem
    ctx.fillRect(this.foodX - 1, this.foodY - foodPulse - 4, 3, 5);
    ctx.shadowBlur = 0;

    // Vibrant Emerald Green Snake Body
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';

    ctx.beginPath();
    for (let i = 0; i < this.history.length; i += 3) {
      const pt = this.history[i];
      const wave = Math.sin(i * this.waveFreq + time * 8.0) * this.waveAmp;
      const px = pt.x + this.dirY * wave;
      const py = pt.y + this.dirX * wave;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Snake Eyes at Head
    if (this.history.length > 0) {
      const head = this.history[0];
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(head.x - 3, head.y - 3, 3, 0, TWO_PI);
      ctx.arc(head.x + 3, head.y - 3, 3, 0, TWO_PI);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(head.x - 3, head.y - 3, 1.5, 0, TWO_PI);
      ctx.arc(head.x + 3, head.y - 3, 1.5, 0, TWO_PI);
      ctx.fill();
    }

    ProceduralFontEngine.renderText(ctx, `SCORE: ${this.score}`, 20, 30, 14, '#0f172a', fontParams, time);

    if (this.gameOver) {
      ProceduralFontEngine.renderText(ctx, 'GAME OVER - PRESS A', width * 0.2, height * 0.5, 18, '#dc2626', fontParams, time);
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

    ProceduralFontEngine.renderText(ctx, 'LESSON: WAVE INTERPOLATION', 25, 40, 14, '#0f172a', fontParams, time);
  }
}
