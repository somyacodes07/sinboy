/**
 * SinBoy Procedural Console Shell Hardware Engine
 * "Authentic retro GameBoy slate gray casing with enlarged widescreen bezel & 3D tactile controls."
 */

import { SDFEngine, SpringVal, NoiseEngine, TWO_PI, PI } from '../math/mathCore';
import { ThemePalette } from './themes';
import { ProceduralFontEngine, FontParams, DEFAULT_FONT_PARAMS } from '../font/proceduralFont';

export interface HardwareInputState {
  dpadLeft: boolean;
  dpadRight: boolean;
  dpadUp: boolean;
  dpadDown: boolean;
  buttonA: boolean;
  buttonB: boolean;
  buttonX: boolean;
  buttonY: boolean;
  buttonSelect: boolean;
  buttonStart: boolean;

  justPressedA?: boolean;
  justPressedB?: boolean;
  justPressedUp?: boolean;
  justPressedDown?: boolean;
  justPressedLeft?: boolean;
  justPressedRight?: boolean;
}

export interface ControlHitbox {
  id: 'dpadLeft' | 'dpadRight' | 'dpadUp' | 'dpadDown' | 'btnA' | 'btnB' | 'btnX' | 'btnY' | 'btnSelect' | 'btnStart';
  x: number;
  y: number;
  r?: number;
  w?: number;
  h?: number;
}

export class ConsoleShellEngine {
  private springs = {
    dpadLeft: new SpringVal(0, 300, 20),
    dpadRight: new SpringVal(0, 300, 20),
    dpadUp: new SpringVal(0, 300, 20),
    dpadDown: new SpringVal(0, 300, 20),
    btnA: new SpringVal(0, 300, 20),
    btnB: new SpringVal(0, 300, 20),
    btnX: new SpringVal(0, 300, 20),
    btnY: new SpringVal(0, 300, 20),
    btnSelect: new SpringVal(0, 300, 20),
    btnStart: new SpringVal(0, 300, 20),
  };

  private hitboxes: ControlHitbox[] = [];

  public getControlHitboxes(): ControlHitbox[] {
    return this.hitboxes;
  }

  updatePhysics(dt: number, input: HardwareInputState) {
    this.springs.dpadLeft.target = input.dpadLeft ? 1 : 0;
    this.springs.dpadRight.target = input.dpadRight ? 1 : 0;
    this.springs.dpadUp.target = input.dpadUp ? 1 : 0;
    this.springs.dpadDown.target = input.dpadDown ? 1 : 0;

    this.springs.btnA.target = input.buttonA ? 1 : 0;
    this.springs.btnB.target = input.buttonB ? 1 : 0;
    this.springs.btnX.target = input.buttonX ? 1 : 0;
    this.springs.btnY.target = input.buttonY ? 1 : 0;

    this.springs.btnSelect.target = input.buttonSelect ? 1 : 0;
    this.springs.btnStart.target = input.buttonStart ? 1 : 0;

    Object.values(this.springs).forEach((s) => s.update(dt));
  }

  renderConsole(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    palette: ThemePalette,
    time: number,
    fontParams: FontParams = DEFAULT_FONT_PARAMS
  ): { x: number; y: number; width: number; height: number } {
    ctx.save();
    this.hitboxes = [];

    const aspect = 0.64;
    let consoleH = Math.min(canvasHeight * 0.96, 950);
    let consoleW = consoleH * aspect;

    if (consoleW > canvasWidth * 0.94) {
      consoleW = canvasWidth * 0.94;
      consoleH = consoleW / aspect;
    }

    const cx = (canvasWidth - consoleW) * 0.5;
    const cy = (canvasHeight - consoleH) * 0.5;

    // 1. CONSOLE BODY OUTER SHELL (Slate Gray Superellipse)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 45;
    ctx.shadowOffsetY = 20;

    const cornerRadius = consoleW * 0.08;
    const r = cornerRadius;
    const x = cx;
    const y = cy;
    const w = consoleW;
    const h = consoleH;

    const shellGrad = ctx.createLinearGradient(x, y, x + w, y + h);
    shellGrad.addColorStop(0, palette.shellPrimary);
    shellGrad.addColorStop(1, palette.shellSecondary);
    ctx.fillStyle = shellGrad;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r * 1.5);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r * 1.5, y + h);
    ctx.lineTo(x + r * 1.5, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r * 1.5);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 2. PLASTIC SURFACE TEXTURE
    ctx.save();
    ctx.globalAlpha = 0.035;
    ctx.fillStyle = '#000000';

    const noiseGrid = 12;
    for (let ny = cy; ny < cy + consoleH; ny += noiseGrid) {
      for (let nx = cx; nx < cx + consoleW; nx += noiseGrid) {
        const val = NoiseEngine.perlin2D(nx * 0.05, ny * 0.05);
        if (val > 0) {
          ctx.fillRect(nx, ny, noiseGrid * 0.5, noiseGrid * 0.5);
        }
      }
    }
    ctx.restore();

    // 3. CONSOLE BRANDING LOGO ("SINBOY")
    const logoY = cy + consoleH * 0.042;
    ProceduralFontEngine.renderText(
      ctx,
      'SINBOY',
      cx + consoleW * 0.36,
      logoY,
      consoleW * 0.052,
      palette.shellAccent,
      { ...fontParams, mode: 'bezier', weight: 4.5 },
      time
    );

    // Power LED
    const ledX = cx + consoleW * 0.10;
    const ledY = logoY + consoleW * 0.015;
    const ledGlow = 0.5 + 0.5 * Math.sin(time * 3.0);

    ctx.save();
    ctx.shadowColor = palette.shellAccent;
    ctx.shadowBlur = 10 * ledGlow;
    ctx.fillStyle = palette.shellAccent;
    ctx.beginPath();
    ctx.arc(ledX, ledY, consoleW * 0.012, 0, TWO_PI);
    ctx.fill();
    ctx.restore();

    // 4. LARGE EXPANDED PLAYING SCREEN BEZEL
    const screenFrameX = cx + consoleW * 0.05;
    const screenFrameY = cy + consoleH * 0.095;
    const screenFrameW = consoleW * 0.90;
    const screenFrameH = consoleH * 0.54;

    ctx.save();
    const bezelGrad = ctx.createLinearGradient(screenFrameX, screenFrameY, screenFrameX, screenFrameY + screenFrameH);
    bezelGrad.addColorStop(0, '#2c323f');
    bezelGrad.addColorStop(1, '#1e232e');
    ctx.fillStyle = bezelGrad;

    ctx.beginPath();
    ctx.roundRect(screenFrameX, screenFrameY, screenFrameW, screenFrameH, 14);
    ctx.fill();

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(screenFrameX + 4, screenFrameY + 4, screenFrameW - 8, screenFrameH - 8);
    ctx.restore();

    const screenX = screenFrameX + screenFrameW * 0.035;
    const screenY = screenFrameY + screenFrameH * 0.045;
    const screenW = screenFrameW * 0.93;
    const screenH = screenFrameH * 0.91;

    // 5. HARDWARE CONTROLS
    const controlsCenterY = cy + consoleH * 0.78;

    // A) D-PAD (Dark Charcoal Matte)
    const dpadCenterX = cx + consoleW * 0.25;
    const dpadSize = consoleW * 0.24;
    this.renderDPad(ctx, dpadCenterX, controlsCenterY, dpadSize, palette);

    // B) ACTION BUTTONS A/B/X/Y (Colored 3D Buttons)
    const actionCenterX = cx + consoleW * 0.75;
    const actionRadius = consoleW * 0.15;
    this.renderActionButtons(ctx, actionCenterX, controlsCenterY, actionRadius, palette, fontParams, time);

    // C) SELECT & START BUTTONS
    const selectX = cx + consoleW * 0.42;
    const startX = cx + consoleW * 0.58;
    const pillY = cy + consoleH * 0.935;
    this.renderPillButton(ctx, selectX, pillY, consoleW * 0.09, consoleW * 0.03, 'SELECT', 'btnSelect', this.springs.btnSelect.val, palette, fontParams, time);
    this.renderPillButton(ctx, startX, pillY, consoleW * 0.09, consoleW * 0.03, 'START', 'btnStart', this.springs.btnStart.val, palette, fontParams, time);

    // 6. SPEAKER GRILLES
    const speakerX = cx + consoleW * 0.83;
    const speakerY = cy + consoleH * 0.935;
    this.renderSpeakerGrille(ctx, speakerX, speakerY, consoleW * 0.075, palette);

    ctx.restore();

    return { x: screenX, y: screenY, width: screenW, height: screenH };
  }

  private renderDPad(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, palette: ThemePalette) {
    const armW = size * 0.32;
    const armL = size * 0.5;

    // Register Hitboxes for D-Pad
    this.hitboxes.push({ id: 'dpadUp', x: cx - armW * 0.5, y: cy - armL, w: armW, h: armL });
    this.hitboxes.push({ id: 'dpadDown', x: cx - armW * 0.5, y: cy, w: armW, h: armL });
    this.hitboxes.push({ id: 'dpadLeft', x: cx - armL, y: cy - armW * 0.5, w: armL, h: armW });
    this.hitboxes.push({ id: 'dpadRight', x: cx, y: cy - armW * 0.5, w: armL, h: armW });

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = '#272b34';
    ctx.strokeStyle = '#1e2128';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.rect(cx - armW * 0.5, cy - armL, armW, armL);
    ctx.rect(cx - armW * 0.5, cy, armW, armL);
    ctx.rect(cx - armL, cy - armW * 0.5, armL, armW);
    ctx.rect(cx, cy - armW * 0.5, armL, armW);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1a1c23';
    ctx.beginPath();
    ctx.arc(cx, cy, armW * 0.28, 0, TWO_PI);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(cx, cy - armL + 6);
    ctx.lineTo(cx - 5, cy - armL + 12);
    ctx.lineTo(cx + 5, cy - armL + 12);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, cy + armL - 6);
    ctx.lineTo(cx - 5, cy + armL - 12);
    ctx.lineTo(cx + 5, cy + armL - 12);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - armL + 6, cy);
    ctx.lineTo(cx - armL + 12, cy - 5);
    ctx.lineTo(cx - armL + 12, cy + 5);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + armL - 6, cy);
    ctx.lineTo(cx + armL - 12, cy - 5);
    ctx.lineTo(cx + armL - 12, cy + 5);
    ctx.fill();

    ctx.restore();
  }

  private renderActionButtons(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ) {
    const btnRadius = radius * 0.38;
    const offsets: { name: string; id: 'btnY' | 'btnX' | 'btnB' | 'btnA'; dx: number; dy: number; spring: number; color: string }[] = [
      { name: 'Y', id: 'btnY', dx: -radius * 0.6, dy: 0, spring: this.springs.btnY.val, color: '#ec4899' },
      { name: 'X', id: 'btnX', dx: 0, dy: -radius * 0.6, spring: this.springs.btnX.val, color: '#3b82f6' },
      { name: 'B', id: 'btnB', dx: 0, dy: radius * 0.6, spring: this.springs.btnB.val, color: '#ef4444' },
      { name: 'A', id: 'btnA', dx: radius * 0.6, dy: 0, spring: this.springs.btnA.val, color: '#10b981' },
    ];

    offsets.forEach((btn) => {
      const bx = cx + btn.dx;
      const by = cy + btn.dy + btn.spring * 3.0;

      // Register Hitboxes for Buttons A, B, X, Y
      this.hitboxes.push({ id: btn.id, x: bx, y: by, r: btnRadius + 6 });

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = btn.spring > 0.5 ? palette.buttonActive : btn.color;

      ctx.beginPath();
      ctx.arc(bx, by, btnRadius, 0, TWO_PI);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx, by, btnRadius - 2, -PI * 0.75, -PI * 0.25);
      ctx.stroke();

      ProceduralFontEngine.renderText(
        ctx,
        btn.name,
        bx - btnRadius * 0.3,
        by - btnRadius * 0.4,
        btnRadius * 0.9,
        '#ffffff',
        { ...fontParams, mode: 'bezier', weight: 4.5 },
        time
      );

      ctx.restore();
    });
  }

  private renderPillButton(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    w: number,
    h: number,
    label: string,
    id: 'btnSelect' | 'btnStart',
    springVal: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ) {
    const py = cy + springVal * 2.0;

    // Register Hitboxes for Select & Start
    this.hitboxes.push({ id, x: cx - w * 0.5, y: py - h * 0.5, w, h });

    ctx.save();
    ctx.fillStyle = springVal > 0.5 ? palette.buttonActive : '#475569';
    ctx.beginPath();
    ctx.roundRect(cx - w * 0.5, py - h * 0.5, w, h, h * 0.5);
    ctx.fill();

    ProceduralFontEngine.renderText(
      ctx,
      label,
      cx - w * 0.4,
      py + h * 0.75,
      h * 0.7,
      '#475569',
      fontParams,
      time
    );

    ctx.restore();
  }

  private renderSpeakerGrille(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    size: number,
    palette: ThemePalette
  ) {
    ctx.save();
    ctx.fillStyle = '#475569';

    for (let r = 0.2; r <= 1.0; r += 0.4) {
      const radius = size * r;
      const count = Math.floor(6 * r);
      for (let i = 0; i < count; i++) {
        const angle = (i * TWO_PI) / count;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.arc(px, py, size * 0.08, 0, TWO_PI);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
