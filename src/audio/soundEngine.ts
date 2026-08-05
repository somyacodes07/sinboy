/**
 * SinBoy Multi-Voice Procedural Audio Synthesizer Engine
 * "Zero audio samples. All rain drops, water splashes, chiptunes, and SFX are synthesized live via Web Audio math."
 */

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private tempoMultiplier: number = 1.0;
  private waveformData: Uint8Array = new Uint8Array(128);

  constructor() {
    const unlock = () => {
      this.initCtx();
      if (this.ctx && this.ctx.state === 'running') {
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
      }
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.waveformData = new Uint8Array(this.analyser.frequencyBinCount);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getWaveformData(): Uint8Array {
    if (this.analyser) {
      this.analyser.getByteTimeDomainData(this.waveformData as any);
    }
    return this.waveformData;
  }

  public setTempoMultiplier(multiplier: number) {
    this.tempoMultiplier = Math.max(0.7, Math.min(2.0, multiplier));
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  // -------------------------------------------------------------------------
  // TAILORED PROCEDURAL SOUND EFFECTS FOR EACH GAME
  // -------------------------------------------------------------------------

  /** Realistic Procedural Water Raindrop Splash SFX */
  playRaindrop() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // High frequency upward water droplet pitch sweep (1200Hz to 2100Hz)
    osc.type = 'sine';
    const startFreq = 1200 + Math.random() * 400;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.6, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /** Heavy Water Ripple Splash SFX */
  playWaterSplash() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /** EMP Shockwave Blast SFX (Particle Dodge) */
  playEmp() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /** Landing Thud SFX (Wave Runner) */
  playLand() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.06);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /** Season Morph Chime SFX (Fractal Forest) */
  playSeasonChime() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.12, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.09);
    });
  }

  /** Boss Spark Hit SFX (Lissajous Arena) */
  playBossHit() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  /** Power-On Boot Chime */
  playBootChime() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.2, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.45);
    });
  }

  playClick(freq: number = 600) {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  playJump() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.14);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playLaser() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  playPickup() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.2, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.09);
    });
  }

  playExplosion() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(80, now + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.36);
  }

  // -------------------------------------------------------------------------
  // MULTI-VOICE POLYPHONIC BGM SYNTHESIZER
  // -------------------------------------------------------------------------

  startBGM(style: 'default' | 'synthwave' = 'default') {
    this.stopBGM();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    let step = 0;
    const leadNotes = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
    const bassNotes = [130.81, 146.83, 164.81, 174.61];

    const baseInterval = style === 'synthwave' ? 140 : 180;

    this.bgmInterval = window.setInterval(() => {
      if (!this.ctx || !this.masterGain || this.isMuted) return;

      const now = this.ctx.currentTime;

      const leadFreq = leadNotes[(step * 3 + (step % 5)) % leadNotes.length] * this.tempoMultiplier;
      const oscLead = this.ctx.createOscillator();
      const gainLead = this.ctx.createGain();
      oscLead.type = 'square';
      oscLead.frequency.setValueAtTime(leadFreq, now);

      gainLead.gain.setValueAtTime(0.06, now);
      gainLead.gain.exponentialRampToValueAtTime(0.001, now + 0.12 / this.tempoMultiplier);

      oscLead.connect(gainLead);
      gainLead.connect(this.masterGain);
      oscLead.start(now);
      oscLead.stop(now + 0.13 / this.tempoMultiplier);

      if (step % 2 === 0) {
        const bassFreq = bassNotes[(step / 2) % bassNotes.length];
        const oscBass = this.ctx.createOscillator();
        const gainBass = this.ctx.createGain();
        oscBass.type = 'sawtooth';
        oscBass.frequency.setValueAtTime(bassFreq, now);

        gainBass.gain.setValueAtTime(0.08, now);
        gainBass.gain.exponentialRampToValueAtTime(0.001, now + 0.22 / this.tempoMultiplier);

        oscBass.connect(gainBass);
        gainBass.connect(this.masterGain);
        oscBass.start(now);
        oscBass.stop(now + 0.23 / this.tempoMultiplier);
      }

      step++;
    }, baseInterval / this.tempoMultiplier);
  }

  stopBGM() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
