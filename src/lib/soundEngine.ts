import { SoundscapeType } from '../types';

class ProceduralSoundEngine {
  private ctx: AudioContext | null = null;
  private currentSourceNodes: AudioNode[] = [];
  private activeSoundscape: SoundscapeType = 'none';
  private masterGain: GainNode | null = null;
  private currentVolume: number = 0.7;
  private isMuted: boolean = false;

  private async initContext(): Promise<AudioContext | null> {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        const effectiveVol = this.isMuted ? 0 : this.currentVolume;
        this.masterGain.gain.setValueAtTime(effectiveVol, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      return this.ctx;
    } catch (e) {
      console.warn('AudioContext initialization error:', e);
      return null;
    }
  }

  public async resume() {
    await this.initContext();
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      const effectiveVol = this.isMuted ? 0 : this.currentVolume;
      this.masterGain.gain.setValueAtTime(effectiveVol, this.ctx.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.currentVolume, this.ctx.currentTime);
    }
  }

  public stopSoundscape() {
    this.currentSourceNodes.forEach(node => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore disconnect on already stopped node
      }
    });
    this.currentSourceNodes = [];
    this.activeSoundscape = 'none';
  }

  public async playSoundscape(type: SoundscapeType) {
    const ctx = await this.initContext();
    if (!ctx || !this.masterGain) return;

    if (this.activeSoundscape === type) return;
    this.stopSoundscape();

    if (type === 'none' || this.isMuted) return;

    this.activeSoundscape = type;

    switch (type) {
      case 'rain':
        this.startRainSoundscape();
        break;
      case 'lofi-noise':
        this.startBrownNoise();
        break;
      case 'cafe':
        this.startCafeAmbiance();
        break;
      case 'binaural-alpha':
        this.startBinauralAlpha();
        break;
      case 'night-crickets':
        this.startNightCrickets();
        break;
    }
  }

  /**
   * Procedural Pink/Rain noise generator
   */
  private startRainSoundscape() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.25;
      b6 = white * 0.115926;
    }

    const whiteNoiseSource = this.ctx.createBufferSource();
    whiteNoiseSource.buffer = noiseBuffer;
    whiteNoiseSource.loop = true;

    // Filter to sound like soft soothing rain
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

    whiteNoiseSource.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.masterGain);

    whiteNoiseSource.start();
    this.currentSourceNodes.push(whiteNoiseSource, filter, rainGain);
  }

  /**
   * Brown noise generator (deep cozy focus)
   */
  private startBrownNoise() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 4.5;
    }

    const brownSource = this.ctx.createBufferSource();
    brownSource.buffer = noiseBuffer;
    brownSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    brownSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    brownSource.start();

    this.currentSourceNodes.push(brownSource, filter, gain);
  }

  /**
   * Cozy cafe gentle ambient murmur
   */
  private startCafeAmbiance() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.35;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(700, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.65, this.ctx.currentTime);

    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.currentSourceNodes.push(source, bandpass, gain);
  }

  /**
   * 10Hz Alpha wave binaural generator
   */
  private startBinauralAlpha() {
    if (!this.ctx || !this.masterGain) return;
    const oscLeft = this.ctx.createOscillator();
    const oscRight = this.ctx.createOscillator();
    const panLeft = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const panRight = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    // 216Hz and 226Hz -> 10Hz difference creates Alpha flow frequency
    oscLeft.frequency.setValueAtTime(216, this.ctx.currentTime);
    oscRight.frequency.setValueAtTime(226, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    if (panLeft && panRight) {
      panLeft.pan.setValueAtTime(-0.85, this.ctx.currentTime);
      panRight.pan.setValueAtTime(0.85, this.ctx.currentTime);

      oscLeft.connect(panLeft);
      panLeft.connect(gain);

      oscRight.connect(panRight);
      panRight.connect(gain);
      this.currentSourceNodes.push(panLeft, panRight);
    } else {
      oscLeft.connect(gain);
      oscRight.connect(gain);
    }

    gain.connect(this.masterGain);
    oscLeft.start();
    oscRight.start();

    this.currentSourceNodes.push(oscLeft, oscRight, gain);
  }

  private startNightCrickets() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(4200, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(12, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    lfo.connect(gain.gain);
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    lfo.start();
    this.currentSourceNodes.push(osc, lfo, lfoGain, gain);
  }

  /**
   * Whimsical 8-bit retro sound effects
   */
  public async playRetroChime(type: 'coin' | 'levelUp' | 'pomodoroDone' | 'cardFlip' | 'click') {
    const ctx = await this.initContext();
    if (!ctx || !this.masterGain || this.isMuted) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    if (type === 'coin') {
      // Classic 8-bit coin sound (B5 -> E6)
      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, t);
      osc.frequency.setValueAtTime(1318.51, t + 0.08);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      osc.start(t);
      osc.stop(t + 0.38);
    } else if (type === 'cardFlip') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      osc.start(t);
      osc.stop(t + 0.08);
    } else if (type === 'click') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(550, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.start(t);
      osc.stop(t + 0.05);
    } else if (type === 'levelUp') {
      // 8-bit victory arpeggio: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const noteOsc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        noteOsc.type = 'square';
        noteOsc.frequency.setValueAtTime(freq, t + idx * 0.09);
        noteGain.gain.setValueAtTime(0.28, t + idx * 0.09);
        noteGain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.18);
        noteOsc.connect(noteGain);
        noteGain.connect(this.masterGain!);
        noteOsc.start(t + idx * 0.09);
        noteOsc.stop(t + idx * 0.09 + 0.19);
      });
    } else if (type === 'pomodoroDone') {
      // Cozy bell chord
      const chords = [523.25, 659.25, 783.99, 1046.5];
      chords.forEach(freq => {
        const chordOsc = ctx.createOscillator();
        const chordGain = ctx.createGain();
        chordOsc.type = 'sine';
        chordOsc.frequency.setValueAtTime(freq, t);
        chordGain.gain.setValueAtTime(0.35, t);
        chordGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
        chordOsc.connect(chordGain);
        chordGain.connect(this.masterGain!);
        chordOsc.start(t);
        chordOsc.stop(t + 2.2);
      });
    }
  }
}

export const soundEngine = new ProceduralSoundEngine();
