/**
 * SinBoy Procedural Themes Engine
 * "11 mathematical visual themes featuring classic GameBoy slate gray hardware & vibrant full-color screens."
 */

export interface ThemePalette {
  name: string;
  isLight: boolean;
  shellPrimary: string;
  shellSecondary: string;
  shellAccent: string;
  buttonColor: string;
  buttonActive: string;
  screenBg: string;
  screenGrid: string;
  textPrimary: string;
  textSecondary: string;
  accentGlow: string;
  crtScanlineOpacity: number;
  bloomIntensity: number;
  waveNoiseColor: string;
}

export type ThemeName =
  | 'classicGray'
  | 'paperMath'
  | 'holographic'
  | 'pastelWave'
  | 'cyberpunk'
  | 'synthwave'
  | 'neon'
  | 'aurora'
  | 'galaxy'
  | 'lava'
  | 'oscilloscope';

export const THEMES: Record<ThemeName, ThemePalette> = {
  classicGray: {
    name: 'Classic GameBoy Gray',
    isLight: true,
    shellPrimary: '#c4cad4', // Authentic retro GameBoy slate gray
    shellSecondary: '#a0a8b6',
    shellAccent: '#2563eb',
    buttonColor: '#2d333e', // Matte charcoal D-Pad
    buttonActive: '#1d4ed8',
    screenBg: '#f0f9ff',
    screenGrid: 'rgba(56, 189, 248, 0.18)',
    textPrimary: '#0f172a',
    textSecondary: '#0284c7',
    accentGlow: 'rgba(37, 99, 235, 0.4)',
    crtScanlineOpacity: 0.02,
    bloomIntensity: 0.3,
    waveNoiseColor: '#e0f2fe',
  },
  paperMath: {
    name: 'Graph Paper',
    isLight: true,
    shellPrimary: '#cbd5e1',
    shellSecondary: '#94a3b8',
    shellAccent: '#0284c7',
    buttonColor: '#334155',
    buttonActive: '#0369a1',
    screenBg: '#f1f5f9',
    screenGrid: 'rgba(2, 132, 199, 0.18)',
    textPrimary: '#0f172a',
    textSecondary: '#0284c7',
    accentGlow: 'rgba(2, 132, 199, 0.3)',
    crtScanlineOpacity: 0.03,
    bloomIntensity: 0.3,
    waveNoiseColor: '#e0f2fe',
  },
  holographic: {
    name: 'Holographic Spectrum',
    isLight: true,
    shellPrimary: '#f5d0fe',
    shellSecondary: '#e879f9',
    shellAccent: '#d946ef',
    buttonColor: '#701a75',
    buttonActive: '#c026d3',
    screenBg: '#fff1f2',
    screenGrid: 'rgba(236, 72, 153, 0.18)',
    textPrimary: '#831843',
    textSecondary: '#be185d',
    accentGlow: 'rgba(236, 72, 153, 0.4)',
    crtScanlineOpacity: 0.04,
    bloomIntensity: 0.6,
    waveNoiseColor: '#ffe4e6',
  },
  pastelWave: {
    name: 'Pastel Aurora',
    isLight: true,
    shellPrimary: '#cbd5e1',
    shellSecondary: '#94a3b8',
    shellAccent: '#10b981',
    buttonColor: '#1e293b',
    buttonActive: '#059669',
    screenBg: '#ecfdf5',
    screenGrid: 'rgba(16, 185, 129, 0.16)',
    textPrimary: '#064e3b',
    textSecondary: '#047857',
    accentGlow: 'rgba(16, 185, 129, 0.4)',
    crtScanlineOpacity: 0.03,
    bloomIntensity: 0.5,
    waveNoiseColor: '#d1fae5',
  },
  cyberpunk: {
    name: 'Cyberpunk 2099',
    isLight: false,
    shellPrimary: '#1a092b',
    shellSecondary: '#0e0419',
    shellAccent: '#ff0055',
    buttonColor: '#2d0f47',
    buttonActive: '#00ffff',
    screenBg: '#090212',
    screenGrid: 'rgba(255, 0, 85, 0.18)',
    textPrimary: '#00ffff',
    textSecondary: '#ff0055',
    accentGlow: 'rgba(0, 255, 255, 0.8)',
    crtScanlineOpacity: 0.25,
    bloomIntensity: 1.5,
    waveNoiseColor: '#4d0026',
  },
  synthwave: {
    name: '80s Synthwave',
    isLight: false,
    shellPrimary: '#220833',
    shellSecondary: '#12031c',
    shellAccent: '#ff007f',
    buttonColor: '#3d0e5c',
    buttonActive: '#ff007f',
    screenBg: '#120024',
    screenGrid: 'rgba(255, 0, 127, 0.22)',
    textPrimary: '#ff007f',
    textSecondary: '#00f0ff',
    accentGlow: 'rgba(255, 0, 127, 0.8)',
    crtScanlineOpacity: 0.25,
    bloomIntensity: 1.4,
    waveNoiseColor: '#4d004d',
  },
  neon: {
    name: 'Neon Vector',
    isLight: false,
    shellPrimary: '#1a1a1a',
    shellSecondary: '#0d0d0d',
    shellAccent: '#39ff14',
    buttonColor: '#2a2a2a',
    buttonActive: '#39ff14',
    screenBg: '#050505',
    screenGrid: 'rgba(57, 255, 20, 0.2)',
    textPrimary: '#39ff14',
    textSecondary: '#ff007f',
    accentGlow: 'rgba(57, 255, 20, 0.9)',
    crtScanlineOpacity: 0.2,
    bloomIntensity: 1.6,
    waveNoiseColor: '#123305',
  },
  aurora: {
    name: 'Aurora Borealis',
    isLight: false,
    shellPrimary: '#0b1d28',
    shellSecondary: '#051017',
    shellAccent: '#00ffcc',
    buttonColor: '#143347',
    buttonActive: '#00ffcc',
    screenBg: '#04121a',
    screenGrid: 'rgba(0, 255, 204, 0.15)',
    textPrimary: '#a6ffeb',
    textSecondary: '#00b38f',
    accentGlow: 'rgba(0, 255, 204, 0.6)',
    crtScanlineOpacity: 0.15,
    bloomIntensity: 1.1,
    waveNoiseColor: '#004d3d',
  },
  galaxy: {
    name: 'Deep Galaxy',
    isLight: false,
    shellPrimary: '#140c24',
    shellSecondary: '#0a0614',
    shellAccent: '#bd93f9',
    buttonColor: '#23153d',
    buttonActive: '#ff79c6',
    screenBg: '#080410',
    screenGrid: 'rgba(189, 147, 249, 0.15)',
    textPrimary: '#ff79c6',
    textSecondary: '#bd93f9',
    accentGlow: 'rgba(189, 147, 249, 0.7)',
    crtScanlineOpacity: 0.15,
    bloomIntensity: 1.0,
    waveNoiseColor: '#361559',
  },
  lava: {
    name: 'Magma Core',
    isLight: false,
    shellPrimary: '#280b0b',
    shellSecondary: '#170505',
    shellAccent: '#ff3300',
    buttonColor: '#401212',
    buttonActive: '#ff6600',
    screenBg: '#140303',
    screenGrid: 'rgba(255, 51, 0, 0.18)',
    textPrimary: '#ff6600',
    textSecondary: '#cc2600',
    accentGlow: 'rgba(255, 102, 0, 0.8)',
    crtScanlineOpacity: 0.2,
    bloomIntensity: 1.3,
    waveNoiseColor: '#4d0f00',
  },
  oscilloscope: {
    name: 'Oscilloscope Retro',
    isLight: false,
    shellPrimary: '#121c16',
    shellSecondary: '#0a100c',
    shellAccent: '#00ff66',
    buttonColor: '#1a2b20',
    buttonActive: '#00ff66',
    screenBg: '#051109',
    screenGrid: 'rgba(0, 255, 102, 0.15)',
    textPrimary: '#00ff66',
    textSecondary: '#00b347',
    accentGlow: 'rgba(0, 255, 102, 0.6)',
    crtScanlineOpacity: 0.2,
    bloomIntensity: 1.2,
    waveNoiseColor: '#003314',
  },
};
