/**
 * SinBoy Math Education Overlay Engine
 * "Press M key to reveal the underlying mathematics for any active cartridge."
 */

import { BaseCartridge } from '../games/gameEngine';
import { ThemePalette } from '../graphics/themes';
import { FontParams, ProceduralFontEngine } from '../font/proceduralFont';

export class EducationModeEngine {
  private isActive: boolean = false;

  toggleActive(): boolean {
    this.isActive = !this.isActive;
    return this.isActive;
  }

  isEducationActive(): boolean {
    return this.isActive;
  }

  /**
   * Renders the interactive Math Education overlay.
   */
  renderOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cartridge: BaseCartridge,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ) {
    if (!this.isActive) return;

    ctx.save();
    cartridge.renderEducationOverlay(ctx, width, height, palette, fontParams, time);

    // Overlay Footer
    ProceduralFontEngine.renderText(
      ctx,
      'PRESS M TO EXIT MATH LESSON',
      width * 0.25,
      height - 18,
      10,
      palette.textPrimary,
      fontParams,
      time
    );

    ctx.restore();
  }
}
