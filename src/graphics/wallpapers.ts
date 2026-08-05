/**
 * SinBoy Procedural Wallpaper Generator Engine
 * "Backgrounds generated dynamically from noise, flow fields, voronoi, and wave interference with vibrant HSL math."
 */

import { NoiseEngine, TWO_PI, PI } from '../math/mathCore';
import { ThemePalette } from './themes';

export type WallpaperStyle =
  | 'domainWarp'
  | 'waveInterference'
  | 'voronoi'
  | 'flowField'
  | 'lissajousWeb'
  | 'cellular';

export class WallpaperEngine {
  static renderBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    style: WallpaperStyle,
    palette: ThemePalette,
    time: number
  ) {
    ctx.save();

    // Fill screen background
    ctx.fillStyle = palette.screenBg;
    ctx.fillRect(0, 0, width, height);

    switch (style) {
      case 'domainWarp':
        this.renderDomainWarp(ctx, width, height, palette, time);
        break;
      case 'waveInterference':
        this.renderWaveInterference(ctx, width, height, palette, time);
        break;
      case 'voronoi':
        this.renderVoronoi(ctx, width, height, palette, time);
        break;
      case 'flowField':
        this.renderFlowField(ctx, width, height, palette, time);
        break;
      case 'lissajousWeb':
        this.renderLissajousWeb(ctx, width, height, palette, time);
        break;
      case 'cellular':
        this.renderCellular(ctx, width, height, palette, time);
        break;
    }

    ctx.restore();
  }

  private static renderDomainWarp(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    time: number
  ) {
    const cols = 36;
    const rows = 22;
    const cellW = width / cols;
    const cellH = height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = c * 0.08;
        const ny = r * 0.08;
        const warp = NoiseEngine.domainWarp(nx, ny, time * 0.15);

        const hue = (c * 8 + r * 8 + time * 25) % 360;
        const sat = palette.isLight ? '75%' : '85%';
        const light = palette.isLight ? '85%' : '45%';
        const alpha = Math.max(0.04, Math.min(0.3, warp.value * 0.4));

        ctx.fillStyle = `hsla(${hue}, ${sat}, ${light}, ${alpha})`;
        ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
      }
    }
  }

  private static renderWaveInterference(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    time: number
  ) {
    const lines = 18;
    for (let i = 0; i < lines; i++) {
      const yBase = (height / lines) * i;
      const hue = (i * 20 + time * 30) % 360;

      ctx.strokeStyle = palette.isLight
        ? `hsla(${hue}, 80%, 45%, 0.35)`
        : `hsla(${hue}, 90%, 65%, 0.4)`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();

      for (let x = 0; x <= width; x += 6) {
        const w1 = Math.sin(x * 0.015 + time * 2.0 + i * 0.4) * 18;
        const w2 = Math.cos(x * 0.008 - time * 1.5 + i * 0.25) * 14;
        const py = yBase + w1 + w2;

        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();
    }
  }

  private static renderVoronoi(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    time: number
  ) {
    const scale = 0.005;
    for (let y = 0; y < height; y += 16) {
      for (let x = 0; x < width; x += 16) {
        const v = NoiseEngine.voronoi2D(x * scale + time * 0.05, y * scale);
        if (v.dist < 0.28) {
          const hue = (v.id + time * 20) % 360;
          ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${(0.28 - v.dist) * 0.6})`;
          ctx.fillRect(x, y, 14, 14);
        }
      }
    }
  }

  private static renderFlowField(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    time: number
  ) {
    const spacing = 25;
    for (let y = 12; y < height; y += spacing) {
      for (let x = 12; x < width; x += spacing) {
        const angle = NoiseEngine.perlin2D(x * 0.004 + time * 0.1, y * 0.004) * TWO_PI * 2;
        const len = 12;
        const ex = x + Math.cos(angle) * len;
        const ey = y + Math.sin(angle) * len;

        const hue = (angle * (180 / PI) + time * 40) % 360;
        ctx.strokeStyle = `hsla(${hue}, 80%, 55%, 0.35)`;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
    }
  }

  private static renderLissajousWeb(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    time: number
  ) {
    const cx = width * 0.5;
    const cy = height * 0.5;
    const rx = width * 0.42;
    const ry = height * 0.38;

    const steps = 300;
    for (let i = 0; i < steps; i++) {
      const t1 = (i / steps) * TWO_PI * 4;
      const t2 = ((i + 1) / steps) * TWO_PI * 4;

      const x1 = cx + Math.sin(3 * t1 + time * 0.5) * rx;
      const y1 = cy + Math.sin(4 * t1) * ry;

      const x2 = cx + Math.sin(3 * t2 + time * 0.5) * rx;
      const y2 = cy + Math.sin(4 * t2) * ry;

      const hue = (i * 2 + time * 40) % 360;
      ctx.strokeStyle = `hsla(${hue}, 85%, 55%, 0.4)`;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  private static renderCellular(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    time: number
  ) {
    const gridSize = 22;
    for (let y = 0; y < height; y += gridSize) {
      for (let x = 0; x < width; x += gridSize) {
        const n = NoiseEngine.perlin2D(x * 0.02 + time * 0.2, y * 0.02);
        if (n > 0.05) {
          const hue = (n * 360 + time * 30) % 360;
          ctx.fillStyle = `hsla(${hue}, 75%, 55%, ${Math.min(0.35, n * 0.6)})`;
          ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
        }
      }
    }
  }

  static exportWallpaperPNG(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/png');
  }
}
