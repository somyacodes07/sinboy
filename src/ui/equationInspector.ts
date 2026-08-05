/**
 * SinBoy Equation Inspector & Developer Mode
 * "Press TAB to transform console into Developer Mode to inspect & live edit equations."
 */

import { BaseCartridge } from '../games/gameEngine';
import { ThemePalette } from '../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../font/proceduralFont';
import { TWO_PI } from '../math/mathCore';

export class EquationInspectorEngine {
  private isActive: boolean = false;
  private selectedEqIdx: number = 0;

  toggleActive(): boolean {
    this.isActive = !this.isActive;
    return this.isActive;
  }

  isInspectorActive(): boolean {
    return this.isActive;
  }

  selectNextEquation(cartridge: BaseCartridge) {
    const eqs = cartridge.getEquations();
    if (eqs.length > 0) {
      this.selectedEqIdx = (this.selectedEqIdx + 1) % eqs.length;
    }
  }

  adjustSelectedVariable(cartridge: BaseCartridge, delta: number) {
    const eqs = cartridge.getEquations();
    if (eqs.length === 0) return;

    const eq = eqs[this.selectedEqIdx % eqs.length];
    const keys = Object.keys(eq.variables);
    if (keys.length > 0) {
      const k = keys[0];
      const current = eq.variables[k];
      const newVal = current + delta;
      cartridge.setVariable(eq.name, k, newVal);
    }
  }

  /**
   * Renders the Developer Equation Inspector overlay on console display.
   */
  renderInspector(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cartridge: BaseCartridge,
    palette: ThemePalette,
    fontParams: FontParams,
    fps: number,
    time: number
  ) {
    if (!this.isActive) return;

    ctx.save();
    ctx.fillStyle = 'rgba(2, 8, 14, 0.92)';
    ctx.fillRect(0, 0, width, height);

    // Inspector Header Bar
    ctx.fillStyle = palette.shellAccent;
    ctx.fillRect(0, 0, width, 24);

    ProceduralFontEngine.renderText(
      ctx,
      `[DEV MODE] EQUATION INSPECTOR | FPS: ${fps.toFixed(0)}`,
      10,
      16,
      11,
      '#000000',
      fontParams,
      time
    );

    const equations = cartridge.getEquations();
    if (equations.length === 0) {
      ProceduralFontEngine.renderText(ctx, 'NO EQUATIONS IN CARTRIDGE', 20, 50, 12, palette.textPrimary, fontParams, time);
      ctx.restore();
      return;
    }

    const currentEq = equations[this.selectedEqIdx % equations.length];

    // 1. Equation Meta
    ProceduralFontEngine.renderText(
      ctx,
      `TARGET: ${currentEq.name.toUpperCase()}`,
      15,
      45,
      13,
      palette.textPrimary,
      fontParams,
      time
    );

    ProceduralFontEngine.renderText(
      ctx,
      `EXPR: ${currentEq.expression}`,
      15,
      70,
      11,
      palette.textSecondary,
      fontParams,
      time
    );

    // 2. Interactive Function Graph Preview Box
    const graphX = 15;
    const graphY = 85;
    const graphW = width - 30;
    const graphH = 110;

    ctx.strokeStyle = palette.screenGrid;
    ctx.lineWidth = 1;
    ctx.strokeRect(graphX, graphY, graphW, graphH);

    // Live Graph Plot
    ctx.strokeStyle = palette.shellAccent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let gx = 0; gx <= graphW; gx += 3) {
      const normX = gx / graphW;
      const wave = Math.sin(normX * TWO_PI * 3 + time * 4) * (graphH * 0.35);
      const gy = graphY + graphH * 0.5 + wave;

      if (gx === 0) ctx.moveTo(graphX + gx, gy);
      else ctx.lineTo(graphX + gx, gy);
    }
    ctx.stroke();

    // 3. Live Variables List
    let varY = graphY + graphH + 20;
    ProceduralFontEngine.renderText(ctx, 'LIVE VARIABLES:', 15, varY, 11, palette.textPrimary, fontParams, time);
    varY += 20;

    Object.entries(currentEq.variables).forEach(([k, v]) => {
      ProceduralFontEngine.renderText(
        ctx,
        `> ${k} = ${typeof v === 'number' ? v.toFixed(3) : v}`,
        25,
        varY,
        11,
        palette.textSecondary,
        fontParams,
        time
      );
      varY += 18;
    });

    // Instructions
    ProceduralFontEngine.renderText(
      ctx,
      'DPAD LEFT/RIGHT: EDIT VAR | UP/DOWN: NEXT EQ | TAB: EXIT',
      15,
      height - 12,
      9,
      palette.textPrimary,
      fontParams,
      time
    );

    ctx.restore();
  }
}
