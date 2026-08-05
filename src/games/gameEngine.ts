/**
 * SinBoy Cartridge & Game Engine Architecture
 * "Every cartridge is a collection of equations that override game behavior."
 */

import { ThemePalette } from '../graphics/themes';
import { FontParams } from '../font/proceduralFont';
import { HardwareInputState } from '../graphics/consoleShell';

export interface EquationInfo {
  name: string;
  expression: string;
  description: string;
  variables: Record<string, number>;
}

export interface BaseCartridge {
  id: string;
  name: string;
  description: string;
  mathTopic: string;

  /** Returns list of editable live equations for Developer Equation Inspector */
  getEquations(): EquationInfo[];

  /** Updates variable override from developer mode */
  setVariable(eqName: string, varName: string, val: number): void;

  /** Resets game state */
  reset(): void;

  /** Updates cartridge physics / simulation state */
  update(dt: number, input: HardwareInputState, soundEngine: any): void;

  /** Renders cartridge screen graphics onto console display canvas */
  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ): void;

  /** Renders mathematical education overlay for Education Mode (M key) */
  renderEducationOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: ThemePalette,
    fontParams: FontParams,
    time: number
  ): void;
}
