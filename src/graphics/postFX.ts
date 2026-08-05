/**
 * SinBoy Post-Processing & Shader FX Engine
 * "Mathematical post-processing effects (Glow, CRT scanlines, Chromatic Aberration, Wave Distortion)."
 */

import { ThemePalette } from './themes';

export class PostFXEngine {
  /**
   * Applies CRT Scanlines & Screen Curvature Glare onto the console screen.
   */
  static renderCRTOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    time: number
  ) {
    ctx.save();

    // 1. Scanlines
    if (palette.crtScanlineOpacity > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, ' + palette.crtScanlineOpacity + ')';
      const scanlineHeight = 3;
      for (let y = 0; y < height; y += scanlineHeight * 2) {
        ctx.fillRect(0, y, width, scanlineHeight);
      }
    }

    // 2. Chromatic Aberration fringe at edges
    ctx.strokeStyle = palette.accentGlow;
    ctx.globalAlpha = 0.12;
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // 3. Screen Glass Vignette & Curved Reflection
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      width * 0.25,
      width * 0.5,
      height * 0.5,
      width * 0.65
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.55)');

    ctx.fillStyle = grad;
    ctx.globalAlpha = 1.0;
    ctx.fillRect(0, 0, width, height);

    // Dynamic diagonal glass sheen glare
    ctx.beginPath();
    ctx.moveTo(width * 0.1, 0);
    ctx.lineTo(width * 0.45, 0);
    ctx.lineTo(0, height * 0.45);
    ctx.lineTo(0, height * 0.1);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fill();

    ctx.restore();
  }

  /**
   * Wave distortion transition effect (evaluated mathematically during screen transitions).
   */
  static applyWaveDistortion(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progress: number, // [0, 1]
    time: number
  ) {
    if (progress <= 0 || progress >= 1) return;

    ctx.save();
    const amp = Math.sin(progress * Math.PI) * 25;
    const freq = 0.05;

    // Draw distorted wave slices
    const sliceH = 4;
    for (let y = 0; y < height; y += sliceH) {
      const offsetX = Math.sin(y * freq + time * 10) * amp;
      ctx.drawImage(
        ctx.canvas,
        0,
        y,
        width,
        sliceH,
        offsetX,
        y,
        width,
        sliceH
      );
    }

    ctx.restore();
  }
}
