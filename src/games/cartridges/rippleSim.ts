/**
 * Cartridge 6: Ripple Sim
 * "Interactive 2D fluid wave equation simulation in deep ocean blue with procedural raindrop splash SFX."
 */

import { BaseCartridge, EquationInfo } from '../gameEngine';
import { ThemePalette } from '../../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../../font/proceduralFont';
import { HardwareInputState } from '../../graphics/consoleShell';

export class RippleSimCartridge implements BaseCartridge {
  id = 'ripple_sim';
  name = 'Ripple Wave Lab';
  description = 'Interactive 2D wave equation fluid ripple simulation.';
  mathTopic = 'Partial Differential Wave Equations';

  waveDamping = 0.96;
  cols = 60;
  rows = 40;
  buffer1: number[][] = [];
  buffer2: number[][] = [];

  cursorX = 30;
  cursorY = 20;

  rainMode = true;
  rainTimer = 0;

  constructor() {
    this.reset();
  }

  getEquations(): EquationInfo[] {
    return [
      {
        name: '2D Wave Equation',
        expression: 'd2u/dt2 = c^2 * (d2u/dx2 + d2u/dy2)',
        description: 'Discrete Laplace 2D grid wave propagation',
        variables: { damping: this.waveDamping },
      },
    ];
  }

  setVariable(eqName: string, varName: string, val: number): void {
    if (varName === 'damping') this.waveDamping = val;
  }

  reset(): void {
    this.buffer1 = Array.from({ length: this.cols }, () => new Array(this.rows).fill(0));
    this.buffer2 = Array.from({ length: this.cols }, () => new Array(this.rows).fill(0));
    this.cursorX = 30;
    this.cursorY = 20;
    this.rainMode = true;
    this.rainTimer = 0;
  }

  update(dt: number, input: HardwareInputState, soundEngine: any): void {
    if (input.dpadLeft && this.cursorX > 1) this.cursorX--;
    if (input.dpadRight && this.cursorX < this.cols - 2) this.cursorX++;
    if (input.dpadUp && this.cursorY > 1) this.cursorY--;
    if (input.dpadDown && this.cursorY < this.rows - 2) this.cursorY++;

    // Single-press Heavy Water Splash (Button A)
    if (input.justPressedA) {
      this.buffer1[this.cursorX][this.cursorY] = 255;
      soundEngine.playWaterSplash();
    }

    // Toggle Rain Generator (Button Select)
    if (input.buttonSelect) {
      this.rainMode = !this.rainMode;
      soundEngine.playClick(500);
    }

    // Automatic Rain Drops with Procedural Water Droplet Splash SFX
    if (this.rainMode) {
      this.rainTimer += dt;
      if (this.rainTimer > 0.16) {
        this.rainTimer = 0;
        const rx = Math.floor(Math.random() * (this.cols - 4)) + 2;
        const ry = Math.floor(Math.random() * (this.rows - 4)) + 2;
        this.buffer1[rx][ry] = 180 + Math.random() * 75;

        // Play procedural raindrop droplet sound!
        soundEngine.playRaindrop();
      }
    }

    // Discrete Laplace 2D Wave Propagation Engine
    for (let x = 1; x < this.cols - 1; x++) {
      for (let y = 1; y < this.rows - 1; y++) {
        this.buffer2[x][y] =
          (this.buffer1[x - 1][y] +
            this.buffer1[x + 1][y] +
            this.buffer1[x][y - 1] +
            this.buffer1[x][y + 1]) /
            2 -
          this.buffer2[x][y];
        this.buffer2[x][y] *= this.waveDamping;
      }
    }

    const temp = this.buffer1;
    this.buffer1 = this.buffer2;
    this.buffer2 = temp;
  }

  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ): void {
    // Deep Ocean Background
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(0, 0, width, height);

    const cellW = width / this.cols;
    const cellH = height / this.rows;

    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const val = this.buffer1[x][y];
        if (Math.abs(val) > 1) {
          const alpha = Math.min(1, Math.abs(val) / 120);
          ctx.fillStyle = val > 0 ? '#38bdf8' : '#e0f2fe';
          ctx.globalAlpha = alpha;
          ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
        }
      }
    }
    ctx.globalAlpha = 1.0;

    // Glowing Cursor
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(this.cursorX * cellW, this.cursorY * cellH, cellW * 2, cellH * 2);

    ProceduralFontEngine.renderText(
      ctx,
      `RAIN GENERATOR: ${this.rainMode ? 'ON' : 'OFF'} (PRESS A: HEAVY SPLASH)`,
      15,
      25,
      11,
      '#f8fafc',
      fontParams,
      time
    );

    ProceduralFontEngine.renderText(
      ctx,
      'DPAD: MOVE CURSOR',
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

    ProceduralFontEngine.renderText(ctx, 'LESSON: WAVE EQUATION', 25, 40, 14, '#f8fafc', fontParams, time);
  }
}
