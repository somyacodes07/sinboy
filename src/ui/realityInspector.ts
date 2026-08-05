/**
 * SinBoy OS Reality Inspector Engine (`M` Key)
 * "Freeze reality and inspect any hardware component, glyph, enemy, or wave equation live."
 */

import { ThemePalette } from '../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../font/proceduralFont';
import { HardwareInputState } from '../graphics/consoleShell';

export interface RealityTarget {
  id: string;
  name: string;
  category: 'HARDWARE' | 'GAME ENTITY' | 'TYPOGRAPHY' | 'SHADER';
  equation: string;
  variables: Record<string, number>;
  // Relative position ratios (0..1) on the console shell or screen
  relX: number;
  relY: number;
  relW: number;
  relH: number;
  targetType: 'console' | 'screen';
}

export class RealityInspectorEngine {
  private isActive: boolean = false;
  private selectedTargetIdx: number = 0;
  private inspectX: number = 0;
  private inspectY: number = 0;

  private targets: RealityTarget[] = [
    {
      id: 'dpad',
      name: 'MATTE CHARCOAL D-PAD',
      category: 'HARDWARE',
      equation: 'Cross(x, y) = max(|x| - armW, |y| - armL) <= 0',
      variables: { armW: 32, armL: 50, pivot: 12 },
      relX: 0.25,
      relY: 0.78,
      relW: 0.24,
      relH: 0.24,
      targetType: 'console',
    },
    {
      id: 'btnA',
      name: 'ACTION BUTTON A',
      category: 'HARDWARE',
      equation: 'SDF_Circle(p) = |p - c| - R, specularArc = [-3pi/4, -pi/4]',
      variables: { R: 22, shadowBlur: 6 },
      relX: 0.84,
      relY: 0.78,
      relW: 0.12,
      relH: 0.12,
      targetType: 'console',
    },
    {
      id: 'btnB',
      name: 'ACTION BUTTON B',
      category: 'HARDWARE',
      equation: 'SDF_Circle(p) = |p - c| - R',
      variables: { R: 22, colorCode: 0xef4444 },
      relX: 0.75,
      relY: 0.87,
      relW: 0.12,
      relH: 0.12,
      targetType: 'console',
    },
    {
      id: 'speaker',
      name: 'SPEAKER GRILLE',
      category: 'HARDWARE',
      equation: 'r_i = 0.08 * size, theta_i = (i * 2pi) / N',
      variables: { N: 18, radius: 24, count: 6 },
      relX: 0.83,
      relY: 0.935,
      relW: 0.12,
      relH: 0.12,
      targetType: 'console',
    },
    {
      id: 'led',
      name: 'POWER LED INDICATOR',
      category: 'HARDWARE',
      equation: 'I(t) = I_0 * (0.5 + 0.5 * sin(3 * t))',
      variables: { R: 6, glow: 10 },
      relX: 0.10,
      relY: 0.057,
      relW: 0.04,
      relH: 0.04,
      targetType: 'console',
    },
    {
      id: 'bezel',
      name: 'HARDWARE SCREEN BEZEL',
      category: 'HARDWARE',
      equation: 'Superellipse(x, y) = (|x/a|^m + |y/b|^n <= 1)',
      variables: { widthRatio: 0.90, heightRatio: 0.54, cornerR: 14 },
      relX: 0.50,
      relY: 0.365,
      relW: 0.90,
      relH: 0.54,
      targetType: 'console',
    },
    {
      id: 'logo',
      name: 'SINBOY BRANDING LOGO',
      category: 'HARDWARE',
      equation: 'Glyph_Bezier(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2',
      variables: { weight: 4.5, fontMode: 1 },
      relX: 0.50,
      relY: 0.042,
      relW: 0.30,
      relH: 0.06,
      targetType: 'console',
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

    if (input.justPressedA) {
      this.selectedTargetIdx = (this.selectedTargetIdx + 1) % this.targets.length;
      soundEngine.playClick(850);
    }
  }

  public renderOverlay(
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ) {
    if (!this.isActive) return;

    // Calculate Console Shell Bounds
    const aspect = 0.64;
    let consoleH = Math.min(canvasH * 0.96, 950);
    let consoleW = consoleH * aspect;

    if (consoleW > canvasW * 0.94) {
      consoleW = canvasW * 0.94;
      consoleH = consoleW / aspect;
    }

    const consoleX = (canvasW - consoleW) * 0.5;
    const consoleY = (canvasH - consoleH) * 0.5;

    ctx.save();

    // Freeze Backdrop
    ctx.fillStyle = 'rgba(2, 6, 23, 0.70)';
    ctx.fillRect(0, 0, canvasW, canvasH);

    const target = this.targets[this.selectedTargetIdx];

    // Compute Target Screen Position based on console relative dimensions
    const targetX = consoleX + target.relX * consoleW;
    const targetY = consoleY + target.relY * consoleH;
    const targetW = target.relW * consoleW;
    const targetH = target.relH * consoleH;

    // Highlight Target Box
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(targetX - targetW * 0.5, targetY - targetH * 0.5, targetW, targetH);
    ctx.setLineDash([]);

    // Crosshair Cursor directly over the hardware component
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(targetX, targetY, 14, 0, Math.PI * 2);
    ctx.moveTo(targetX - 22, targetY);
    ctx.lineTo(targetX + 22, targetY);
    ctx.moveTo(targetX, targetY - 22);
    ctx.lineTo(targetX, targetY + 22);
    ctx.stroke();

    // Floating Reality Inspector Card
    const cardW = Math.min(360, canvasW * 0.45);
    const cardH = 150;
    const cardX = targetX > canvasW * 0.5 ? Math.max(20, targetX - cardW - 30) : Math.min(canvasW - cardW - 20, targetX + 30);
    const cardY = Math.min(canvasH - cardH - 30, Math.max(30, targetY - cardH * 0.5));

    ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 14);
    ctx.fill();
    ctx.stroke();

    let curY = cardY + 22;

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

    curY += 24;
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

    curY += 22;
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

    curY += 24;
    const varText = Object.entries(target.variables)
      .map(([k, v]) => `${k}=${v}`)
      .join('  ');
    ProceduralFontEngine.renderText(ctx, `PARAMS: ${varText}`, cardX + 15, curY, 8.5, '#94a3b8', fontParams, time);

    curY += 26;
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
