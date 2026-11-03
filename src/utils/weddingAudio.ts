// Synthesizes a soft, authentic, royal South Asian ambient Sitar & Santoor / Harp wedding melody
// using the native Web Audio API so it works 100% offline/hermetically without external MP3 failures.

class RoyalWeddingAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;
  private masterGain: GainNode | null = null;
  private stepIndex: number = 0;

  // Raag Yaman / Royal Wedding inspired notes (in Hz)
  // C4, D4, E4, F#4, G4, A4, B4, C5, D5, E5
  private scale = [
    261.63, // Sa (C4)
    293.66, // Re (D4)
    329.63, // Ga (E4)
    369.99, // Ma# (F#4 - Yaman तीव्र मध्यम)
    392.00, // Pa (G4)
    440.00, // Dha (A4)
    493.88, // Ni (B4)
    523.25, // Sa' (C5)
    587.33, // Re' (D5)
    659.25, // Ga' (E5)
  ];

  // Expressive melodic pattern (indices into scale)
  private melodyPattern = [
    6, 1, 2, 3, 4, 3, 2, 1,
    0, 2, 4, 6, 7, 7, 6, 4,
    3, 4, 5, 6, 7, 8, 7, 5,
    4, 3, 2, 1, 2, 4, 2, 0,
  ];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.02;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playPluck(freq: number, duration: number, isDrone = false) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Primary harmonic oscillator (warm santoor/harp string)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    // Subtle low-pass filter for warm acoustic resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isDrone ? 650 : 1800, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + duration);

    osc1.type = isDrone ? 'sine' : 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(freq, now);
    // Slight shimmer detune for sitar/santoor sympathetic string resonance
    osc2.frequency.setValueAtTime(freq * (isDrone ? 1.5 : 2.002), now);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = isDrone ? 0.15 : 0.22;

    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(isDrone ? 0.16 : 0.35, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc1.connect(filter);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);

    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }

  public start(): boolean {
    try {
      this.initContext();
      if (this.isPlaying) return true;
      this.isPlaying = true;

      // Play initial gentle tanpura drone & first note immediately
      this.playPluck(130.81, 4.2, true); // C3 Tanpura Sa
      this.playPluck(196.00, 4.2, true); // G3 Tanpura Pa
      this.playPluck(this.scale[this.melodyPattern[this.stepIndex]], 2.2, false);

      this.intervalId = window.setInterval(() => {
        if (!this.isPlaying) return;
        this.stepIndex = (this.stepIndex + 1) % this.melodyPattern.length;
        const noteFreq = this.scale[this.melodyPattern[this.stepIndex]];
        this.playPluck(noteFreq, 2.1, false);

        // Every 4 steps, trigger a soft Tanpura Sa-Pa sympathetic drone
        if (this.stepIndex % 4 === 0) {
          this.playPluck(130.81, 3.8, true);
          this.playPluck(196.00, 3.8, true);
        }
      }, 680);

      return true;
    } catch {
      return false;
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const weddingAudio = new RoyalWeddingAudioEngine();
