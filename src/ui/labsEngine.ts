/**
 * SinBoy OS Creation & Labs Subsystem Engine
 * "Font Lab, Icon Lab, Wallpaper Lab, Audio Lab, and Math Concept Library with Split-Screen Graphing."
 */

import { ThemePalette } from '../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../font/proceduralFont';
import { ProceduralIconEngine } from './proceduralIcons';
import { WallpaperEngine, WallpaperStyle } from '../graphics/wallpapers';
import { HardwareInputState } from '../graphics/consoleShell';
import { TWO_PI } from '../math/mathCore';

export type LabMode = 'none' | 'fontLab' | 'iconLab' | 'wallpaperLab' | 'audioLab' | 'mathLibrary';

export class LabsEngine {
  private activeLab: LabMode = 'none';
  private fontLabText = 'SINBOY';
  private activeIcon: 'battery' | 'heart' | 'star' | 'settings' | 'play' | 'cartridge' = 'heart';

  // Audio Lab State
  private synthWaveform: 'sine' | 'square' | 'triangle' | 'noise' = 'sine';
  private synthPitch = 440;
  private synthDecay = 0.2;

  // Math Library Selection
  private selectedMathIdx = 0;
  private mathTopics = [
    { name: 'Trigonometric Wave Motion', formula: 'y = A * sin(f * x + omega * t)', desc: 'Fundamental harmonic oscillation driving terrain, sound, and font strokes.' },
    { name: 'Fourier Series Epicycles', formula: 'f(t) = sum( c_n * e^(i * n * omega * t) )', desc: 'Complex harmonic series reconstructing vector shapes and typography.' },
    { name: 'L-System Fractal Growth', formula: 'F -> FF+[+F-F-F]-[-F+F+F]', desc: 'Grammar-based recursive branching generating natural trees and vegetation.' },
    { name: 'Lorenz Chaotic Attractor', formula: 'dx/dt = sigma*(y-x), dy/dt = x*(rho-z)-y', desc: 'Non-linear differential equations demonstrating deterministic atmospheric chaos.' },
    { name: 'Boids Flocking Math', formula: 'F_total = w1*F_sep + w2*F_ali + w3*F_coh', desc: 'Emergent swarm intelligence and vector field flow dynamics.' },
    { name: 'Signed Distance Fields (SDF)', formula: 'd(p) = |p| - r', desc: 'Implicit distance geometry creating crisp mathematical UI icons.' },
  ];

  public setActiveLab(mode: LabMode) {
    this.activeLab = mode;
  }

  public getActiveLab(): LabMode {
    return this.activeLab;
  }

  public handleInput(input: HardwareInputState, soundEngine: any) {
    if (this.activeLab === 'none') return;

    if (input.justPressedB || input.buttonSelect) {
      this.activeLab = 'none';
      soundEngine.playClick(400);
      return;
    }

    if (this.activeLab === 'mathLibrary') {
      if (input.justPressedUp) {
        this.selectedMathIdx = (this.selectedMathIdx - 1 + this.mathTopics.length) % this.mathTopics.length;
        soundEngine.playClick(500);
      } else if (input.justPressedDown) {
        this.selectedMathIdx = (this.selectedMathIdx + 1) % this.mathTopics.length;
        soundEngine.playClick(500);
      }
    } else if (this.activeLab === 'iconLab') {
      if (input.justPressedLeft || input.justPressedRight) {
        const icons: ('battery' | 'heart' | 'star' | 'settings' | 'play' | 'cartridge')[] = ['battery', 'heart', 'star', 'settings', 'play', 'cartridge'];
        const idx = (icons.indexOf(this.activeIcon) + 1) % icons.length;
        this.activeIcon = icons[idx];
        soundEngine.playClick(650);
      }
    } else if (this.activeLab === 'audioLab') {
      if (input.justPressedA) {
        // Trigger Audio Lab Synthesizer Test
        const forms: ('sine' | 'square' | 'triangle' | 'noise')[] = ['sine', 'square', 'triangle', 'noise'];
        this.synthWaveform = forms[(forms.indexOf(this.synthWaveform) + 1) % forms.length];
        soundEngine.playClick(800);
      }
      if (input.dpadUp) this.synthPitch = Math.min(1600, this.synthPitch + 20);
      if (input.dpadDown) this.synthPitch = Math.max(100, this.synthPitch - 20);
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
    if (this.activeLab === 'none') return;

    ctx.save();
    ctx.fillStyle = palette.isLight ? '#f8fafc' : '#0f172a';
    ctx.fillRect(0, 0, width, height);

    switch (this.activeLab) {
      case 'fontLab':
        this.renderFontLab(ctx, width, height, palette, fontParams, time);
        break;
      case 'iconLab':
        this.renderIconLab(ctx, width, height, palette, fontParams, time);
        break;
      case 'wallpaperLab':
        this.renderWallpaperLab(ctx, width, height, palette, fontParams, time);
        break;
      case 'audioLab':
        this.renderAudioLab(ctx, width, height, palette, fontParams, time);
        break;
      case 'mathLibrary':
        this.renderMathLibrary(ctx, width, height, palette, fontParams, time);
        break;
    }

    ctx.restore();
  }

  // 1. FONT LAB
  private renderFontLab(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ) {
    const cx = width * 0.5;

    ProceduralFontEngine.renderText(ctx, 'FONT LAB — LIVE TYPOGRAPHY REGENERATOR', cx - 140, 25, 12, palette.textPrimary, fontParams, time);

    // Live Large Font Preview
    ctx.fillStyle = palette.isLight ? '#ffffff' : '#1e293b';
    ctx.fillRect(20, 45, width - 40, 110);
    ctx.strokeStyle = palette.shellAccent;
    ctx.strokeRect(20, 45, width - 40, 110);

    ProceduralFontEngine.renderText(
      ctx,
      this.fontLabText,
      cx - 110,
      115,
      36,
      palette.shellAccent,
      fontParams,
      time
    );

    // Parameter Controls
    const startY = 175;
    const paramsList = [
      { name: 'MODE', val: fontParams.mode.toUpperCase() },
      { name: 'WEIGHT / THICKNESS', val: fontParams.weight.toFixed(1) },
      { name: 'WAVE AMPLITUDE', val: (fontParams.amplitude || 0).toFixed(1) },
      { name: 'NOISE DISPLACEMENT', val: (fontParams.noise || 0).toFixed(2) },
    ];

    paramsList.forEach((p, idx) => {
      const py = startY + idx * 26;
      ProceduralFontEngine.renderText(ctx, `${p.name}: ${p.val}`, 30, py, 10, palette.textPrimary, fontParams, time);
    });

    ProceduralFontEngine.renderText(ctx, 'PRESS F TO CYCLE FONT MODES | PRESS B TO EXIT', 25, height - 15, 9, palette.textSecondary, fontParams, time);
  }

  // 2. ICON LAB
  private renderIconLab(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ) {
    const cx = width * 0.5;
    const cy = height * 0.45;

    ProceduralFontEngine.renderText(ctx, 'ICON LAB — PROCEDURAL SDF GENERATOR', cx - 130, 25, 12, palette.textPrimary, fontParams, time);

    // Render Large Icon Preview
    ctx.save();
    ctx.shadowColor = palette.shellAccent;
    ctx.shadowBlur = 20;
    ProceduralIconEngine.renderIcon(ctx, this.activeIcon, cx, cy, 75, palette.shellAccent, time);
    ctx.restore();

    ProceduralFontEngine.renderText(ctx, `ICON: ${this.activeIcon.toUpperCase()}`, cx - 45, cy + 65, 12, palette.textPrimary, fontParams, time);
    ProceduralFontEngine.renderText(ctx, 'GENERATED BY SIGNED DISTANCE FIELDS (SDF)', cx - 120, cy + 85, 9, palette.textSecondary, fontParams, time);
    ProceduralFontEngine.renderText(ctx, 'DPAD LEFT/RIGHT: SWITCH ICON | PRESS B: EXIT', 25, height - 15, 9, palette.textSecondary, fontParams, time);
  }

  // 3. WALLPAPER LAB
  private renderWallpaperLab(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ) {
    WallpaperEngine.renderBackground(ctx, width, height, 'domainWarp', palette, time);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(15, 15, width - 30, 45);

    ProceduralFontEngine.renderText(ctx, 'WALLPAPER LAB — DOMAIN WARPING MATH', 25, 35, 12, '#f8fafc', fontParams, time);
    ProceduralFontEngine.renderText(ctx, 'f(p) = perlin(p + perlin(p + perlin(p)))', 25, 50, 9, '#38bdf8', fontParams, time);

    ProceduralFontEngine.renderText(ctx, 'PRESS T TO CYCLE THEMES | PRESS B: EXIT', 25, height - 15, 9, '#f8fafc', fontParams, time);
  }

  // 4. AUDIO LAB
  private renderAudioLab(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ) {
    const cx = width * 0.5;

    ProceduralFontEngine.renderText(ctx, 'AUDIO LAB — PROCEDURAL SYNTHESIZER', cx - 130, 25, 12, palette.textPrimary, fontParams, time);

    ctx.fillStyle = palette.isLight ? '#ffffff' : '#1e293b';
    ctx.fillRect(20, 50, width - 40, 110);
    ctx.strokeStyle = palette.shellAccent;
    ctx.strokeRect(20, 50, width - 40, 110);

    // Render Synthetic Waveform Display
    ctx.strokeStyle = palette.shellAccent;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 25; x < width - 25; x += 3) {
      const t = (x - 25) * 0.05;
      let yVal = 0;
      if (this.synthWaveform === 'sine') yVal = Math.sin(t * (this.synthPitch * 0.01) + time * 5);
      else if (this.synthWaveform === 'square') yVal = Math.sin(t * (this.synthPitch * 0.01) + time * 5) > 0 ? 1 : -1;
      else if (this.synthWaveform === 'triangle') yVal = Math.asin(Math.sin(t * (this.synthPitch * 0.01) + time * 5)) * (2 / Math.PI);
      else yVal = Math.random() * 2 - 1;

      const py = 105 + yVal * 35;
      if (x === 25) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    ctx.stroke();

    const startY = 180;
    ProceduralFontEngine.renderText(ctx, `WAVEFORM  : ${this.synthWaveform.toUpperCase()} (PRESS A TO SWITCH)`, 30, startY, 10, palette.textPrimary, fontParams, time);
    ProceduralFontEngine.renderText(ctx, `FREQUENCY : ${this.synthPitch} Hz (DPAD UP/DOWN)`, 30, startY + 25, 10, palette.textPrimary, fontParams, time);

    ProceduralFontEngine.renderText(ctx, 'PRESS B TO EXIT AUDIO LAB', 25, height - 15, 9, palette.textSecondary, fontParams, time);
  }

  // 5. MATH LIBRARY & SPLIT-SCREEN GRAPH
  private renderMathLibrary(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ) {
    const topic = this.mathTopics[this.selectedMathIdx];
    const halfW = width * 0.5;

    // LEFT PANEL: MATH DICTIONARY
    ctx.fillStyle = palette.isLight ? '#f1f5f9' : '#1e293b';
    ctx.fillRect(10, 10, halfW - 15, height - 20);

    ProceduralFontEngine.renderText(ctx, 'MATH CONCEPT LIBRARY', 20, 32, 12, palette.textPrimary, fontParams, time);

    this.mathTopics.forEach((t, idx) => {
      const itemY = 58 + idx * 36;
      const isSelected = idx === this.selectedMathIdx;
      const color = isSelected ? palette.shellAccent : palette.textSecondary;

      if (isSelected) {
        ProceduralFontEngine.renderText(ctx, '>', 18, itemY, 11, color, fontParams, time);
      }
      ProceduralFontEngine.renderText(ctx, `${idx + 1}. ${t.name.toUpperCase()}`, 30, itemY, 10, color, fontParams, time);
    });

    // RIGHT PANEL: SPLIT-SCREEN LIVE GRAPH
    ctx.fillStyle = palette.isLight ? '#ffffff' : '#0f172a';
    ctx.fillRect(halfW + 5, 10, halfW - 15, height - 20);
    ctx.strokeStyle = palette.shellAccent;
    ctx.strokeRect(halfW + 5, 10, halfW - 15, height - 20);

    ProceduralFontEngine.renderText(ctx, 'LIVE GRAPH MONITOR', halfW + 18, 32, 11, palette.shellAccent, fontParams, time);
    ProceduralFontEngine.renderText(ctx, topic.formula, halfW + 18, 52, 9, palette.textPrimary, fontParams, time);

    // Draw Live Graph
    const graphCx = halfW + halfW * 0.5;
    const graphCy = height * 0.55;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(halfW + 15, graphCy);
    ctx.lineTo(width - 15, graphCy);
    ctx.moveTo(graphCx, 70);
    ctx.lineTo(graphCx, height - 30);
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = halfW + 15; x < width - 15; x += 3) {
      const gx = (x - graphCx) * 0.05;
      const gy = Math.sin(gx * 2.0 + time * 3.0) * 45;
      if (x === halfW + 15) ctx.moveTo(x, graphCy - gy);
      else ctx.lineTo(x, graphCy - gy);
    }
    ctx.stroke();

    ProceduralFontEngine.renderText(ctx, 'DPAD UP/DOWN: SELECT CONCEPT | PRESS B: EXIT', 25, height - 15, 9, palette.textSecondary, fontParams, time);
  }
}
