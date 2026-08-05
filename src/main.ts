/**
 * SinBoy Master Controller & System Entry Point
 * "The handheld console where mathematics creates reality."
 */

import { ConsoleShellEngine, HardwareInputState } from './graphics/consoleShell';
import { THEMES, ThemeName, ThemePalette } from './graphics/themes';
import { PostFXEngine } from './graphics/postFX';
import { WallpaperEngine, WallpaperStyle } from './graphics/wallpapers';
import { soundEngine } from './audio/soundEngine';
import { ProceduralFontEngine, FontParams, DEFAULT_FONT_PARAMS, FontMode } from './font/proceduralFont';
import { ProceduralIconEngine } from './ui/proceduralIcons';
import { BaseCartridge } from './games/gameEngine';

// Cartridges
import { WaveRunnerCartridge } from './games/cartridges/waveRunner';
import { OrbitSurvivorCartridge } from './games/cartridges/orbitSurvivor';
import { ParticleDodgeCartridge } from './games/cartridges/particleDodge';
import { WaveSnakeCartridge } from './games/cartridges/waveSnake';
import { FractalForestCartridge } from './games/cartridges/fractalForest';
import { RippleSimCartridge } from './games/cartridges/rippleSim';
import { ChaosLabCartridge } from './games/cartridges/chaosLab';
import { FourierPainterCartridge } from './games/cartridges/fourierPainter';
import { LissajousArenaCartridge } from './games/cartridges/lissajousArena';

// Inspector & Education Mode
import { EquationInspectorEngine } from './ui/equationInspector';
import { EducationModeEngine } from './ui/educationMode';

class SinBoyApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private consoleShell: ConsoleShellEngine;
  private inspector: EquationInspectorEngine;
  private education: EducationModeEngine;

  // System State
  private isPoweredOn: boolean = false;
  private isBooting: boolean = false;
  private bootProgress: number = 0;
  private currentThemeKey: ThemeName = 'classicGray';
  private currentPalette: ThemePalette = THEMES['classicGray'];
  private fontParams: FontParams = { ...DEFAULT_FONT_PARAMS };
  private wallpaperStyle: WallpaperStyle = 'domainWarp';

  // Cartridges Library
  private cartridges: BaseCartridge[] = [];
  private activeCartridgeIdx: number = 0;
  private inMenu: boolean = true;
  private menuSelection: number = 0;

  // Modals & Panels
  private showThemeMenu: boolean = false;
  private showFontMenu: boolean = false;

  // Inputs & Single-Press Buffers
  private inputState: HardwareInputState = {
    dpadLeft: false,
    dpadRight: false,
    dpadUp: false,
    dpadDown: false,
    buttonA: false,
    buttonB: false,
    buttonX: false,
    buttonY: false,
    buttonSelect: false,
    buttonStart: false,
    justPressedA: false,
    justPressedB: false,
    justPressedUp: false,
    justPressedDown: false,
    justPressedLeft: false,
    justPressedRight: false,
  };

  private prevInputState = {
    buttonA: false,
    buttonB: false,
    dpadUp: false,
    dpadDown: false,
    dpadLeft: false,
    dpadRight: false,
  };

  // FPS & Time Loop
  private lastTime: number = 0;
  private frameCount: number = 0;
  private currentFPS: number = 60;
  private fpsTimer: number = 0;

  // Side Panel Bounds & Clickables
  private themeButtonsBounds: { key: ThemeName; x: number; y: number; w: number; h: number }[] = [];
  private fontButtonsBounds: { mode: FontMode; x: number; y: number; w: number; h: number }[] = [];
  private devVarButtonsBounds: { eqName: string; varName: string; delta: number; x: number; y: number; w: number; h: number }[] = [];

  constructor() {
    this.canvas = document.getElementById('sinboy-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.consoleShell = new ConsoleShellEngine();
    this.inspector = new EquationInspectorEngine();
    this.education = new EducationModeEngine();

    this.initCartridges();
    this.setupWindowEvents();
    this.setupInputListeners();

    this.resizeCanvas();
    this.powerOn();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private initCartridges() {
    this.cartridges = [
      new WaveRunnerCartridge(),
      new OrbitSurvivorCartridge(),
      new ParticleDodgeCartridge(),
      new WaveSnakeCartridge(),
      new FractalForestCartridge(),
      new RippleSimCartridge(),
      new ChaosLabCartridge(),
      new FourierPainterCartridge(),
      new LissajousArenaCartridge(),
    ];
  }

  private powerOn() {
    this.isPoweredOn = true;
    this.isBooting = true;
    this.bootProgress = 0;
    soundEngine.playBootChime();
  }

  private resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }

  private setupWindowEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private setupInputListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.inspector.toggleActive();
        soundEngine.playClick(900);
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        this.education.toggleActive();
        soundEngine.playClick(700);
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        this.toggleThemeMenu();
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        this.toggleFontMenu();
        return;
      }

      this.updateKeyboardState(e.code, true);
    });

    window.addEventListener('keyup', (e) => {
      this.updateKeyboardState(e.code, false);
    });

    this.canvas.addEventListener('pointerdown', (e) => this.handlePointerInput(e, true));
    this.canvas.addEventListener('pointerup', (e) => this.handlePointerInput(e, false));
  }

  private updateKeyboardState(code: string, isPressed: boolean) {
    switch (code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.inputState.dpadLeft = isPressed;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.inputState.dpadRight = isPressed;
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.inputState.dpadUp = isPressed;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.inputState.dpadDown = isPressed;
        break;
      case 'KeyZ':
      case 'KeyJ':
      case 'Space':
        this.inputState.buttonA = isPressed;
        break;
      case 'KeyX':
      case 'KeyK':
        this.inputState.buttonB = isPressed;
        break;
      case 'KeyC':
        this.inputState.buttonX = isPressed;
        break;
      case 'KeyV':
        this.inputState.buttonY = isPressed;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.inputState.buttonSelect = isPressed;
        break;
      case 'Enter':
        this.inputState.buttonStart = isPressed;
        break;
    }
  }

  /** Compute single-press leading-edge triggers once per frame */
  private updateInputTriggers() {
    this.inputState.justPressedA = this.inputState.buttonA && !this.prevInputState.buttonA;
    this.inputState.justPressedB = this.inputState.buttonB && !this.prevInputState.buttonB;
    this.inputState.justPressedUp = this.inputState.dpadUp && !this.prevInputState.dpadUp;
    this.inputState.justPressedDown = this.inputState.dpadDown && !this.prevInputState.dpadDown;
    this.inputState.justPressedLeft = this.inputState.dpadLeft && !this.prevInputState.dpadLeft;
    this.inputState.justPressedRight = this.inputState.dpadRight && !this.prevInputState.dpadRight;

    this.prevInputState.buttonA = this.inputState.buttonA;
    this.prevInputState.buttonB = this.inputState.buttonB;
    this.prevInputState.dpadUp = this.inputState.dpadUp;
    this.prevInputState.dpadDown = this.inputState.dpadDown;
    this.prevInputState.dpadLeft = this.inputState.dpadLeft;
    this.prevInputState.dpadRight = this.inputState.dpadRight;
  }

  private handlePointerInput(e: PointerEvent, isPressed: boolean) {
    if (!isPressed) return;

    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (const btn of this.themeButtonsBounds) {
      if (clickX >= btn.x && clickX <= btn.x + btn.w && clickY >= btn.y && clickY <= btn.y + btn.h) {
        this.currentThemeKey = btn.key;
        this.currentPalette = THEMES[btn.key];
        soundEngine.playClick(600);
        return;
      }
    }

    for (const btn of this.fontButtonsBounds) {
      if (clickX >= btn.x && clickX <= btn.x + btn.w && clickY >= btn.y && clickY <= btn.y + btn.h) {
        this.fontParams.mode = btn.mode;
        soundEngine.playClick(650);
        return;
      }
    }

    for (const btn of this.devVarButtonsBounds) {
      if (clickX >= btn.x && clickX <= btn.x + btn.w && clickY >= btn.y && clickY <= btn.y + btn.h) {
        const cart = this.cartridges[this.activeCartridgeIdx];
        cart.setVariable(btn.eqName, btn.varName, (cart.getEquations()[0]?.variables[btn.varName] || 0) + btn.delta);
        soundEngine.playClick(800);
        return;
      }
    }

    if (this.inMenu) {
      this.handleMenuInput();
    }
  }

  private toggleThemeMenu() {
    this.showThemeMenu = !this.showThemeMenu;
    this.showFontMenu = false;
    soundEngine.playClick(650);
  }

  private toggleFontMenu() {
    this.showFontMenu = !this.showFontMenu;
    this.showThemeMenu = false;
    soundEngine.playClick(650);
  }

  private handleMenuInput() {
    if (this.showThemeMenu) {
      if (this.inputState.justPressedA) {
        const themesList = Object.keys(THEMES) as ThemeName[];
        const idx = (themesList.indexOf(this.currentThemeKey) + 1) % themesList.length;
        this.currentThemeKey = themesList[idx];
        this.currentPalette = THEMES[this.currentThemeKey];
        soundEngine.playClick(440);
      }
      return;
    }

    if (this.showFontMenu) {
      if (this.inputState.justPressedA) {
        const fontModes: FontMode[] = [
          'bezier',
          'fourier',
          'wave',
          'sdf',
          'noise',
          'skeleton',
          'geometric',
          'parametric',
          'lissajous',
        ];
        const idx = (fontModes.indexOf(this.fontParams.mode) + 1) % fontModes.length;
        this.fontParams.mode = fontModes[idx];
        soundEngine.playClick(440);
      }
      return;
    }

    if (this.inputState.justPressedUp) {
      this.menuSelection = (this.menuSelection - 1 + this.cartridges.length) % this.cartridges.length;
      soundEngine.playClick(500);
    } else if (this.inputState.justPressedDown) {
      this.menuSelection = (this.menuSelection + 1) % this.cartridges.length;
      soundEngine.playClick(500);
    } else if (this.inputState.justPressedA || (this.inputState.buttonStart && !this.prevInputState.buttonA)) {
      this.activeCartridgeIdx = this.menuSelection;
      this.cartridges[this.activeCartridgeIdx].reset();
      this.inMenu = false;
      soundEngine.playClick(750);
      soundEngine.startBGM(this.activeCartridgeIdx % 2 === 0 ? 'default' : 'synthwave');
    }
  }

  // -------------------------------------------------------------------------
  // MASTER GAME LOOP
  // -------------------------------------------------------------------------

  private gameLoop(timestamp: number) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    const timeInSec = timestamp / 1000;

    // Update single-press inputs
    this.updateInputTriggers();

    if (this.inMenu) {
      this.handleMenuInput();
    }

    this.frameCount++;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 1.0) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    const canvasW = window.innerWidth;
    const canvasH = window.innerHeight;
    this.ctx.fillStyle = '#0b0f19';
    this.ctx.fillRect(0, 0, canvasW, canvasH);

    // 1. Console Shell Hardware
    this.consoleShell.updatePhysics(dt, this.inputState);
    const screenRect = this.consoleShell.renderConsole(
      this.ctx,
      canvasW,
      canvasH,
      this.currentPalette,
      timeInSec,
      this.fontParams
    );

    // 2. Screen Display
    this.renderScreenContent(screenRect.x, screenRect.y, screenRect.width, screenRect.height, dt, timeInSec);

    // 3. Compact Desktop Side Control Card (Right Side)
    this.renderSideControlPanel(canvasW, canvasH, timeInSec);

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private renderScreenContent(
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dt: number,
    time: number
  ) {
    this.ctx.save();

    this.ctx.beginPath();
    this.ctx.rect(sx, sy, sw, sh);
    this.ctx.clip();

    this.ctx.translate(sx, sy);

    WallpaperEngine.renderBackground(
      this.ctx,
      sw,
      sh,
      this.wallpaperStyle,
      this.currentPalette,
      time
    );

    if (this.isBooting) {
      this.bootProgress += dt * 0.8;
      this.renderBootSequence(sw, sh, time);
      if (this.bootProgress >= 1.0) {
        this.isBooting = false;
      }
      this.ctx.restore();
      return;
    }

    const activeCartridge = this.cartridges[this.activeCartridgeIdx];

    if (this.inMenu) {
      this.renderCartridgeMenu(sw, sh, time);
    } else {
      activeCartridge.update(dt, this.inputState, soundEngine);
      activeCartridge.render(this.ctx, sw, sh, this.currentPalette, this.fontParams, time);

      if (this.inputState.justPressedB || this.inputState.buttonSelect) {
        this.inMenu = true;
        soundEngine.stopBGM();
        soundEngine.playClick(400);
      }
    }

    if (this.showThemeMenu) {
      this.renderThemeModal(sw, sh, time);
    }
    if (this.showFontMenu) {
      this.renderFontModal(sw, sh, time);
    }

    this.inspector.renderInspector(
      this.ctx,
      sw,
      sh,
      activeCartridge,
      this.currentPalette,
      this.fontParams,
      this.currentFPS,
      time
    );

    this.education.renderOverlay(
      this.ctx,
      sw,
      sh,
      activeCartridge,
      this.currentPalette,
      this.fontParams,
      time
    );

    this.renderStatusBar(sw, sh, time);
    PostFXEngine.renderCRTOverlay(this.ctx, sw, sh, this.currentPalette, time);

    this.ctx.restore();
  }

  // -------------------------------------------------------------------------
  // CLEAN & COMPACT DESKTOP SIDE CONTROL CARD
  // -------------------------------------------------------------------------

  private renderSideControlPanel(canvasW: number, canvasH: number, time: number) {
    if (canvasW < 780) return;

    const cardW = Math.min(320, canvasW * 0.26);
    const cardX = canvasW - cardW - 20;
    const cardY = 25;
    const cardH = canvasH - 50;

    this.themeButtonsBounds = [];
    this.fontButtonsBounds = [];
    this.devVarButtonsBounds = [];

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 1.5;

    this.ctx.beginPath();
    this.ctx.roundRect(cardX, cardY, cardW, cardH, 16);
    this.ctx.fill();
    this.ctx.stroke();

    let curY = cardY + 25;

    // Card Header
    ProceduralFontEngine.renderText(
      this.ctx,
      'CONTROLS & DEV STUDIO',
      cardX + 15,
      curY,
      12,
      '#38bdf8',
      this.fontParams,
      time
    );
    curY += 25;

    // SECTION 1: KEYBOARD LEGEND CARD
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(cardX + 15, curY, cardW - 30, 90);

    ProceduralFontEngine.renderText(this.ctx, 'CONTROLS MAP:', cardX + 22, curY + 16, 10, '#f8fafc', this.fontParams, time);
    ProceduralFontEngine.renderText(this.ctx, 'MOVE / DPAD : ARROWS / WASD', cardX + 22, curY + 34, 9, '#94a3b8', this.fontParams, time);
    ProceduralFontEngine.renderText(this.ctx, 'ACTION (BTN A) : Z / SPACE / ENTER', cardX + 22, curY + 50, 9, '#94a3b8', this.fontParams, time);
    ProceduralFontEngine.renderText(this.ctx, 'BACK (BTN B)   : X / SHIFT', cardX + 22, curY + 66, 9, '#94a3b8', this.fontParams, time);
    ProceduralFontEngine.renderText(this.ctx, 'SHORTCUTS    : TAB:DEV M:MATH T:THEME F:FONT', cardX + 22, curY + 82, 8, '#38bdf8', this.fontParams, time);

    curY += 105;

    // SECTION 2: THEMES QUICK SELECTOR
    ProceduralFontEngine.renderText(this.ctx, 'THEME SELECTOR:', cardX + 15, curY, 10, '#f8fafc', this.fontParams, time);
    curY += 15;

    const themeKeys: ThemeName[] = ['classicGray', 'paperMath', 'holographic', 'pastelWave', 'cyberpunk', 'synthwave'];
    const btnW = (cardW - 40) / 2;
    const btnH = 22;

    themeKeys.forEach((key, idx) => {
      const bx = cardX + 15 + (idx % 2) * (btnW + 10);
      const by = curY + Math.floor(idx / 2) * (btnH + 6);
      const isSelected = key === this.currentThemeKey;

      this.ctx.fillStyle = isSelected ? '#2563eb' : '#1e293b';
      this.ctx.fillRect(bx, by, btnW, btnH);

      ProceduralFontEngine.renderText(
        this.ctx,
        THEMES[key].name.toUpperCase(),
        bx + 4,
        by + 14,
        7.5,
        isSelected ? '#ffffff' : '#cbd5e1',
        this.fontParams,
        time
      );

      this.themeButtonsBounds.push({ key, x: bx, y: by, w: btnW, h: btnH });
    });

    curY += Math.ceil(themeKeys.length / 2) * (btnH + 6) + 15;

    // SECTION 3: FONT MODE QUICK SELECTOR
    ProceduralFontEngine.renderText(this.ctx, 'PROCEDURAL FONT MODE:', cardX + 15, curY, 10, '#f8fafc', this.fontParams, time);
    curY += 15;

    const fontModes: FontMode[] = ['bezier', 'fourier', 'wave', 'sdf', 'noise', 'lissajous'];
    fontModes.forEach((mode, idx) => {
      const bx = cardX + 15 + (idx % 2) * (btnW + 10);
      const by = curY + Math.floor(idx / 2) * (btnH + 6);
      const isSelected = mode === this.fontParams.mode;

      this.ctx.fillStyle = isSelected ? '#10b981' : '#1e293b';
      this.ctx.fillRect(bx, by, btnW, btnH);

      ProceduralFontEngine.renderText(
        this.ctx,
        mode.toUpperCase(),
        bx + 6,
        by + 14,
        8,
        isSelected ? '#ffffff' : '#cbd5e1',
        this.fontParams,
        time
      );

      this.fontButtonsBounds.push({ mode, x: bx, y: by, w: btnW, h: btnH });
    });

    curY += Math.ceil(fontModes.length / 2) * (btnH + 6) + 15;

    // SECTION 4: DEV MODE PARAMETER TUNER (TAB KEY)
    ProceduralFontEngine.renderText(this.ctx, 'DEV MATH TUNER (TAB KEY):', cardX + 15, curY, 10, '#f8fafc', this.fontParams, time);
    curY += 15;

    const activeCart = this.cartridges[this.activeCartridgeIdx];
    const eqs = activeCart.getEquations();

    if (eqs.length > 0) {
      const eq = eqs[0];
      Object.entries(eq.variables).forEach(([vName, vVal]) => {
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(cardX + 15, curY, cardW - 30, 26);

        ProceduralFontEngine.renderText(
          this.ctx,
          `${vName} = ${typeof vVal === 'number' ? vVal.toFixed(2) : vVal}`,
          cardX + 22,
          curY + 16,
          9,
          '#f8fafc',
          this.fontParams,
          time
        );

        const minusX = cardX + cardW - 65;
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(minusX, curY + 3, 20, 20);
        ProceduralFontEngine.renderText(this.ctx, '-', minusX + 7, curY + 16, 10, '#ffffff', this.fontParams, time);
        this.devVarButtonsBounds.push({ eqName: eq.name, varName: vName, delta: -2, x: minusX, y: curY + 3, w: 20, h: 20 });

        const plusX = cardX + cardW - 40;
        this.ctx.fillStyle = '#10b981';
        this.ctx.fillRect(plusX, curY + 3, 20, 20);
        ProceduralFontEngine.renderText(this.ctx, '+', plusX + 6, curY + 16, 10, '#ffffff', this.fontParams, time);
        this.devVarButtonsBounds.push({ eqName: eq.name, varName: vName, delta: 2, x: plusX, y: curY + 3, w: 20, h: 20 });

        curY += 30;
      });
    }

    this.ctx.restore();
  }

  private renderBootSequence(width: number, height: number, time: number) {
    const cx = width * 0.5;
    const cy = height * 0.45;

    const scale = Math.min(1.0, this.bootProgress * 1.2);
    ProceduralFontEngine.renderText(
      this.ctx,
      'SINBOY OS',
      cx - 90 * scale,
      cy,
      24 * scale,
      this.currentPalette.textPrimary,
      { ...this.fontParams, mode: 'fourier' },
      time
    );

    ProceduralFontEngine.renderText(
      this.ctx,
      'MATHEMATICS CREATES REALITY',
      cx - 120,
      cy + 40,
      10,
      this.currentPalette.textSecondary,
      this.fontParams,
      time
    );

    this.ctx.strokeStyle = this.currentPalette.textPrimary;
    this.ctx.strokeRect(cx - 100, cy + 70, 200, 10);
    this.ctx.fillStyle = this.currentPalette.shellAccent;
    this.ctx.fillRect(cx - 98, cy + 72, 196 * Math.min(1, this.bootProgress), 6);
  }

  private renderStatusBar(width: number, height: number, time: number) {
    ProceduralIconEngine.renderIcon(this.ctx, 'wifi', width - 60, 12, 14, this.currentPalette.textPrimary, time);
    ProceduralIconEngine.renderIcon(this.ctx, 'battery', width - 30, 12, 16, this.currentPalette.textPrimary, time);

    ProceduralFontEngine.renderText(
      this.ctx,
      'TAB:DEV  M:MATH  T:THEME  F:FONT',
      10,
      14,
      9,
      this.currentPalette.textSecondary,
      this.fontParams,
      time
    );
  }

  private renderCartridgeMenu(width: number, height: number, time: number) {
    const cx = width * 0.5;

    ProceduralFontEngine.renderText(
      this.ctx,
      'CARTRIDGE LIBRARY',
      cx - 90,
      38,
      15,
      this.currentPalette.textPrimary,
      this.fontParams,
      time
    );

    const startY = 65;
    const itemH = 24;

    this.cartridges.forEach((cart, idx) => {
      const itemY = startY + idx * itemH;
      const isSelected = idx === this.menuSelection;
      const color = isSelected ? this.currentPalette.shellAccent : this.currentPalette.textSecondary;

      if (isSelected) {
        const waveX = 25 + Math.sin(time * 6.0) * 4;
        ProceduralFontEngine.renderText(this.ctx, '>', waveX, itemY, 12, color, this.fontParams, time);
      }

      ProceduralFontEngine.renderText(
        this.ctx,
        `${idx + 1}. ${cart.name.toUpperCase()}`,
        42,
        itemY,
        12,
        color,
        this.fontParams,
        time
      );
    });

    const selectedCart = this.cartridges[this.menuSelection];
    const infoY = height - 42;

    this.ctx.fillStyle = this.currentPalette.isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.4)';
    this.ctx.fillRect(15, infoY - 10, width - 30, 42);

    ProceduralFontEngine.renderText(
      this.ctx,
      `TOPIC: ${selectedCart.mathTopic}`,
      22,
      infoY + 6,
      10,
      this.currentPalette.textPrimary,
      this.fontParams,
      time
    );

    ProceduralFontEngine.renderText(
      this.ctx,
      'PRESS A OR ENTER TO LAUNCH',
      22,
      infoY + 22,
      9,
      this.currentPalette.shellAccent,
      this.fontParams,
      time
    );
  }

  private renderThemeModal(width: number, height: number, time: number) {
    this.ctx.fillStyle = 'rgba(2, 6, 12, 0.92)';
    this.ctx.fillRect(20, 30, width - 40, height - 60);

    ProceduralFontEngine.renderText(this.ctx, 'THEME SELECTOR (PRESS T)', 35, 55, 13, this.currentPalette.textPrimary, this.fontParams, time);
    ProceduralFontEngine.renderText(this.ctx, `ACTIVE THEME: ${this.currentPalette.name.toUpperCase()}`, 35, 80, 11, this.currentPalette.shellAccent, this.fontParams, time);
    ProceduralFontEngine.renderText(this.ctx, 'PRESS A TO CYCLE THEMES', 35, 110, 10, this.currentPalette.textSecondary, this.fontParams, time);
  }

  private renderFontModal(width: number, height: number, time: number) {
    this.ctx.fillStyle = 'rgba(2, 6, 12, 0.92)';
    this.ctx.fillRect(20, 30, width - 40, height - 60);

    ProceduralFontEngine.renderText(this.ctx, 'PROCEDURAL FONT ENGINE (PRESS F)', 35, 55, 12, this.currentPalette.textPrimary, this.fontParams, time);
    ProceduralFontEngine.renderText(this.ctx, `FONT MODE: ${this.fontParams.mode.toUpperCase()}`, 35, 80, 11, this.currentPalette.shellAccent, this.fontParams, time);
    ProceduralFontEngine.renderText(this.ctx, 'PRESS A TO CYCLE FONT MODES', 35, 110, 10, this.currentPalette.textSecondary, this.fontParams, time);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new SinBoyApp();
});
