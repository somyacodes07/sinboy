/**
 * SinBoy Multi-Voice Procedural Audio Synthesizer Engine
 * "Zero audio samples. All music, sound effects, and multi-voice chiptunes are synthesized live via Web Audio math."
 */

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;

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
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
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
  // PROCEDURAL SOUND EFFECTS
  // -------------------------------------------------------------------------

  /** Power-On Boot Chime (Harmonic 5-chord cascade) */
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
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 1.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 1.5);
    });
  }

  /** Crisp Selection Click */
  playClick(pitch: number = 520) {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, now + 0.035);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /** Player Jump Sound (Chiptune pitch sweep) */
  playJump() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.14);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /** Laser / Plasma Bolt Shoot SFX */
  playLaser() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /** Coin / Item Pickup Chime */
  playPickup() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  /** Procedural Multi-Band Noise Explosion */
  playExplosion() {
    this.initCtx();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.45;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(30, now + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.42);
  }

  // -------------------------------------------------------------------------
  // 3-VOICE POLYPHONIC GENERATIVE MUSIC ENGINE
  // -------------------------------------------------------------------------

  startBGM(style: string = 'default') {
    this.stopBGM();
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    // Major / Minor scales in Hz
    const scaleMelody = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    const scaleBass = [130.81, 146.83, 164.81, 196.0, 220.0];

    let step = 0;
    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;

      // Voice 1: Lead Melody
      const mIdx = Math.floor(Math.abs(Math.sin(step * 0.5) * scaleMelody.length)) % scaleMelody.length;
      const mFreq = scaleMelody[mIdx];

      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      leadOsc.type = step % 4 === 0 ? 'square' : 'triangle';
      leadOsc.frequency.setValueAtTime(mFreq, now);

      leadGain.gain.setValueAtTime(0.06, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      leadOsc.connect(leadGain);
      leadGain.connect(this.masterGain);
      leadOsc.start(now);
      leadOsc.stop(now + 0.2);

      // Voice 2: Harmony Arpeggio
      if (step % 2 === 0) {
        const hIdx = (mIdx + 2) % scaleMelody.length;
        const hFreq = scaleMelody[hIdx];

        const harmOsc = this.ctx.createOscillator();
        const harmGain = this.ctx.createGain();
        harmOsc.type = 'sine';
        harmOsc.frequency.setValueAtTime(hFreq, now + 0.05);

        harmGain.gain.setValueAtTime(0.04, now + 0.05);
        harmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        harmOsc.connect(harmGain);
        harmGain.connect(this.masterGain);
        harmOsc.start(now + 0.05);
        harmOsc.stop(now + 0.2);
      }

      // Voice 3: Bass Line (On 1st & 5th beats)
      if (step % 4 === 0) {
        const bIdx = Math.floor(step / 4) % scaleBass.length;
        const bFreq = scaleBass[bIdx];

        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bFreq, now);

        bassGain.gain.setValueAtTime(0.08, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        bassOsc.connect(bassGain);
        bassGain.connect(this.masterGain);
        bassOsc.start(now);
        bassOsc.stop(now + 0.38);
      }

      // Voice 4: Percussive Hi-Hat Click
      if (step % 2 === 1) {
        const noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.02, this.ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.02, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        noiseSrc.connect(nGain);
        nGain.connect(this.masterGain);
        noiseSrc.start(now);
      }

      step++;
    }, 180);
  }

  stopBGM() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
