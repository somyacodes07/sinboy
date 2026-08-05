/**
 * SinBoy Procedural Icon System
 * "Zero SVG/PNG assets. Icons are rendered dynamically from distance fields and parametric equations."
 */

import { SDFEngine, TWO_PI, PI } from '../math/mathCore';

export type IconType =
  | 'battery'
  | 'wifi'
  | 'speaker'
  | 'settings'
  | 'home'
  | 'back'
  | 'play'
  | 'pause'
  | 'heart'
  | 'star'
  | 'folder'
  | 'cartridge'
  | 'math'
  | 'developer';

export class ProceduralIconEngine {
  /**
   * Renders a icon of given type inside a canvas context at (x, y) with radius size.
   */
  static renderIcon(
    ctx: CanvasRenderingContext2D,
    type: IconType,
    cx: number,
    cy: number,
    size: number,
    color: string,
    time: number = 0
  ) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1.5, size * 0.08);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const r = size * 0.5;

    switch (type) {
      case 'battery':
        this.renderBattery(ctx, cx, cy, r, time);
        break;
      case 'wifi':
        this.renderWifi(ctx, cx, cy, r, time);
        break;
      case 'speaker':
        this.renderSpeaker(ctx, cx, cy, r);
        break;
      case 'settings':
        this.renderSettings(ctx, cx, cy, r, time);
        break;
      case 'home':
        this.renderHome(ctx, cx, cy, r);
        break;
      case 'back':
        this.renderBack(ctx, cx, cy, r);
        break;
      case 'play':
        this.renderPlay(ctx, cx, cy, r);
        break;
      case 'pause':
        this.renderPause(ctx, cx, cy, r);
        break;
      case 'heart':
        this.renderHeart(ctx, cx, cy, r, time);
        break;
      case 'star':
        this.renderStar(ctx, cx, cy, r, time);
        break;
      case 'folder':
        this.renderFolder(ctx, cx, cy, r);
        break;
      case 'cartridge':
        this.renderCartridge(ctx, cx, cy, r);
        break;
      case 'math':
        this.renderMathSymbol(ctx, cx, cy, r, time);
        break;
      case 'developer':
        this.renderDeveloper(ctx, cx, cy, r);
        break;
    }

    ctx.restore();
  }

  private static renderBattery(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number) {
    const w = r * 1.6;
    const h = r * 0.9;
    ctx.strokeRect(cx - w * 0.5, cy - h * 0.5, w, h);
    ctx.fillRect(cx + w * 0.5, cy - h * 0.2, r * 0.2, h * 0.4);

    // Dynamic battery level fill pulse
    const level = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 2.0));
    ctx.fillRect(cx - w * 0.4, cy - h * 0.35, w * 0.8 * level, h * 0.7);
  }

  private static renderWifi(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number) {
    for (let i = 1; i <= 3; i++) {
      const radius = r * (i / 3);
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.4, radius, -PI * 0.75, -PI * 0.25);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.4, r * 0.15, 0, TWO_PI);
    ctx.fill();
  }

  private static renderSpeaker(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.6, cy - r * 0.3);
    ctx.lineTo(cx - r * 0.2, cy - r * 0.3);
    ctx.lineTo(cx + r * 0.2, cy - r * 0.7);
    ctx.lineTo(cx + r * 0.2, cy + r * 0.7);
    ctx.lineTo(cx - r * 0.2, cy + r * 0.3);
    ctx.lineTo(cx - r * 0.6, cy + r * 0.3);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx + r * 0.4, cy, r * 0.3, -PI * 0.3, PI * 0.3);
    ctx.stroke();
  }

  private static renderSettings(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number) {
    const teeth = 8;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.5);

    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
      const angle = (i * PI) / teeth;
      const radius = i % 2 === 0 ? r : r * 0.7;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, TWO_PI);
    ctx.stroke();

    ctx.restore();
  }

  private static renderHome(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy - r * 0.1);
    ctx.lineTo(cx + r * 0.7, cy - r * 0.1);
    ctx.lineTo(cx + r * 0.7, cy + r * 0.8);
    ctx.lineTo(cx - r * 0.7, cy + r * 0.8);
    ctx.lineTo(cx - r * 0.7, cy - r * 0.1);
    ctx.lineTo(cx - r, cy - r * 0.1);
    ctx.closePath();
    ctx.stroke();
  }

  private static renderBack(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.4, cy - r * 0.7);
    ctx.lineTo(cx - r * 0.4, cy);
    ctx.lineTo(cx + r * 0.4, cy + r * 0.7);
    ctx.stroke();
  }

  private static renderPlay(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.4, cy - r * 0.7);
    ctx.lineTo(cx + r * 0.6, cy);
    ctx.lineTo(cx - r * 0.4, cy + r * 0.7);
    ctx.closePath();
    ctx.fill();
  }

  private static renderPause(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    const w = r * 0.3;
    const h = r * 1.2;
    ctx.fillRect(cx - r * 0.4 - w * 0.5, cy - h * 0.5, w, h);
    ctx.fillRect(cx + r * 0.4 - w * 0.5, cy - h * 0.5, w, h);
  }

  private static renderHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number) {
    const pulse = 1 + Math.sin(time * 5.0) * 0.08;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);

    ctx.beginPath();
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * TWO_PI;
      // Parametric heart formula: x = 16 sin^3(t), y = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
      const x = (16 * Math.pow(Math.sin(t), 3)) * (r / 16);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * (r / 16);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private static renderStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number) {
    const points = 5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.3);

    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * PI) / points - PI * 0.5;
      const radius = i % 2 === 0 ? r : r * 0.4;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private static renderFolder(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    const w = r * 1.6;
    const h = r * 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.5, cy - h * 0.4);
    ctx.lineTo(cx - w * 0.1, cy - h * 0.4);
    ctx.lineTo(cx + w * 0.1, cy - h * 0.2);
    ctx.lineTo(cx + w * 0.5, cy - h * 0.2);
    ctx.lineTo(cx + w * 0.5, cy + h * 0.5);
    ctx.lineTo(cx - w * 0.5, cy + h * 0.5);
    ctx.closePath();
    ctx.stroke();
  }

  private static renderCartridge(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    const w = r * 1.2;
    const h = r * 1.5;
    ctx.beginPath();
    ctx.rect(cx - w * 0.5, cy - h * 0.5, w, h);
    ctx.stroke();

    ctx.strokeRect(cx - w * 0.35, cy - h * 0.35, w * 0.7, h * 0.4);

    // Pin connectors
    for (let i = -3; i <= 3; i++) {
      ctx.fillRect(cx + i * (w * 0.1) - 1, cy + h * 0.35, 2, h * 0.12);
    }
  }

  private static renderMathSymbol(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number) {
    // Integral symbol + sine wave
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.5, r * 0.2, 0, PI, true);
    ctx.lineTo(cx + r * 0.3, cy + r * 0.5);
    ctx.arc(cx + r * 0.3, cy + r * 0.5, r * 0.2, PI, 0, true);
    ctx.stroke();

    // Wave through integral
    ctx.beginPath();
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = cx - r * 0.8 + t * (r * 1.6);
      const py = cy + Math.sin(t * TWO_PI + time * 3.0) * (r * 0.3);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  private static renderDeveloper(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    // Code angle brackets < / >
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.4, cy - r * 0.5);
    ctx.lineTo(cx - r * 0.8, cy);
    ctx.lineTo(cx - r * 0.4, cy + r * 0.5);

    ctx.moveTo(cx + r * 0.4, cy - r * 0.5);
    ctx.lineTo(cx + r * 0.8, cy);
    ctx.lineTo(cx + r * 0.4, cy + r * 0.5);

    ctx.moveTo(cx + r * 0.2, cy - r * 0.6);
    ctx.lineTo(cx - r * 0.2, cy + r * 0.6);
    ctx.stroke();
  }
}
