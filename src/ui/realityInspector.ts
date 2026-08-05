/**
 * SinBoy OS Reality Inspector Engine (`M` Key)
 * "Freeze reality and inspect any hardware component, glyph, enemy, or wave equation live."
 */

import { ThemePalette } from '../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../font/proceduralFont';
import { HardwareInputState } from '../graphics/consoleShell';

export interface RealityTarget {
  name: string;
  category: 'HARDWARE' | 'GAME ENTITY' | 'TYPOGRAPHY' | 'SHADER';
  equation: string;
  variables: Record<string, number>;
  x: number;
  y: number;
  w: number;
  h: number;
}

export class RealityInspectorEngine {
  private isActive: boolean = false;
  private inspectX: number = 240;
  private inspectY: number = 160;
  private selectedTargetIdx: number = 0;

  private targets: RealityTarget[] = [
    {
      name: 'SPEAKER GRILLE',
      category: 'HARDWARE',
      equation: 'r_i = 0.08 * size, theta_i = (i * 2pi) / N',
      variables: { N: 18, radius: 24, count: 6 },
      x: 390,
      y: 295,
      w: 40,
      h: 40,
    },
    {
      name: 'MATTE CHARCOAL D-PAD',
      category: 'HARDWARE',
      equation: 'Cross(x, y) = max(|x| - armW, |y| - armL) <= 0',
      variables: { armW: 32, armL: 50, pivot: 12 },
      x: 120,
      y: 245,
      w: 80,
      h: 80,
    },
    {
      name: 'ACTION BUTTON A',
      category: 'HARDWARE',
      equation: 'SDF_Circle(p) = |p - c| - R, specularArc = [-3pi/4, -pi/4]',
      variables: { R: 22, shadowBlur: 6 },
      x: 360,
      y: 245,
      w: 45,
      h: 45,
    },
    {
      name: 'POWER LED INDICATOR',
      category: 'HARDWARE',
      equation: 'I(t) = I_0 * (0.5 + 0.5 * sin(3 * t))',
      variables: { R: 6, glow: 10 },
      x: 50,
      y: 45,
      w: 20,
      h: 20,
    },
    {
      name: 'HARDWARE SCREEN BEZEL',
      category: 'HARDWARE',
      equation: 'Superellipse(x, y) = (|x/a|^m + |y/b|^n <= 1)',
      variables: { widthRatio: 0.90, heightRatio: 0.54, cornerR: 14 },
      x: 240,
      y: 110,
      w: 430,
      h: 170,
    },
  ];

  public toggleActive(): boolean {
    this.isActive = !this.isActive;
    return this.isActive;
  }

  public isInspectorActive(): boolean {
    return this.isActive;
  }

  public updateInput(dt: number, input: HardwareInputState, soundEngine: any) {
    if (!this.isActive) return;

    const speed = 220;
    if (input.dpadLeft && this.inspectX > 30) this.inspectX -= speed * dt;
    if (input.dpadRight && this.inspectX < 450) this.inspectX += speed * dt;
    if (input.dpadUp && this.inspectY > 30) this.inspectY -= speed * dt;
    if (input.dpadDown && this.inspectY < 290) this.inspectY += speed * dt;

    if (input.justPressedA) {
      this.selectedTargetIdx = (this.selectedTargetIdx + 1) % this.targets.length;
      const t = this.targets[this.selectedTargetIdx];
      this.inspectX = t.x;
      this.inspectY = t.y;
      soundEngine.playClick(850);
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ) {
    if (!this.isActive) return;

    ctx.save();

    // Semi-transparent Freeze Backdrop
    ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
    ctx.fillRect(0, 0, width, height);

    const target = this.targets[this.selectedTargetIdx];

    // Highlight Target Box
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(target.x - target.w * 0.5, target.y - target.h * 0.5, target.w, target.h);
    ctx.setLineDash([]);

    // Crosshair Cursor
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.inspectX, this.inspectY, 12, 0, Math.PI * 2);
    ctx.moveTo(this.inspectX - 18, this.inspectY);
    ctx.lineTo(this.inspectX + 18, this.inspectY);
    ctx.moveTo(this.inspectX, this.inspectY - 18);
    ctx.lineTo(this.inspectX, this.inspectY + 18);
    ctx.stroke();

    // Floating Reality Inspector Info Card
    const cardW = 340;
    const cardH = 140;
    const cardX = Math.min(width - cardW - 15, Math.max(15, this.inspectX - cardW * 0.5));
    const cardY = this.inspectY > height * 0.5 ? this.inspectY - cardH - 25 : this.inspectY + 25;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 12);
    ctx.fill();
    ctx.stroke();

    let curY = cardY + 20;

    ProceduralFontEngine.renderText(
      ctx,
      `REALITY INSPECTOR: ${target.name}`,
      cardX + 15,
      curY,
      11,
      '#38bdf8',
      fontParams,
      time
    );

    curY += 22;
    ProceduralFontEngine.renderText(
      ctx,
      `CATEGORY: ${target.category}`,
      cardX + 15,
      curY,
      9,
      '#f8fafc',
      fontParams,
      time
    );

    curY += 20;
    ProceduralFontEngine.renderText(
      ctx,
      `MATH: ${target.equation}`,
      cardX + 15,
      curY,
      8.5,
      '#fde047',
      fontParams,
      time
    );

    curY += 22;
    const varText = Object.entries(target.variables)
      .map(([k, v]) => `${k}=${v}`)
      .join('  ');
    ProceduralFontEngine.renderText(ctx, `PARAMS: ${varText}`, cardX + 15, curY, 8.5, '#94a3b8', fontParams, time);

    curY += 25;
    ProceduralFontEngine.renderText(
      ctx,
      'PRESS A: CYCLE TARGETS | PRESS M: RESUME REALITY',
      cardX + 15,
      curY,
      8,
      '#38bdf8',
      fontParams,
      time
    );

    ctx.restore();
  }
}
