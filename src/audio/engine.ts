// Web Audio multi-oscillator endurance prototype engine tone generator

export class EngineAudio {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private filter: BiquadFilterNode;
  private waveshaper: WaveShaperNode;
  private isRunning = false;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0;

    // Distortion / saturation curve
    this.waveshaper = ctx.createWaveShaper();
    this.waveshaper.curve = this.makeDistortionCurve(20);
    this.waveshaper.oversample = '2x';

    // Lowpass filter to emulate intake / cockpit resonance
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 450;
    this.filter.Q.value = 3.0;

    this.waveshaper.connect(this.filter);
    this.filter.connect(this.masterGain);
    this.masterGain.connect(destination);
  }

  private makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const k = amount;
    const n = 256;
    const buffer = new ArrayBuffer(n * 4);
    const curve = new Float32Array(buffer);
    const deg = Math.PI / 180;
    for (let i = 0; i < n; ++i) {
      const x = (i * 2) / n - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const t = this.ctx.currentTime;

    // Fundamental oscillator (sawtooth)
    this.osc1 = this.ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc1.frequency.setValueAtTime(92, t); // ~1800 rpm idle rumble

    // Detuned second harmonic
    this.osc2 = this.ctx.createOscillator();
    this.osc2.type = 'sawtooth';
    this.osc2.frequency.setValueAtTime(184.8, t);

    // Deep sub-bass pulse
    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'triangle';
    this.subOsc.frequency.setValueAtTime(46, t);

    const gain1 = this.ctx.createGain();
    gain1.gain.value = 0.5;
    this.osc1.connect(gain1);
    gain1.connect(this.waveshaper);

    const gain2 = this.ctx.createGain();
    gain2.gain.value = 0.35;
    this.osc2.connect(gain2);
    gain2.connect(this.waveshaper);

    const gainSub = this.ctx.createGain();
    gainSub.gain.value = 0.45;
    this.subOsc.connect(gainSub);
    gainSub.connect(this.waveshaper);

    this.osc1.start();
    this.osc2.start();
    this.subOsc.start();

    this.masterGain.gain.setValueAtTime(0, t);
    this.masterGain.gain.linearRampToValueAtTime(0.18, t + 1.2);
  }

  /** Map scroll velocity (0 to ~5) to prototype engine RPM and acoustic open-throttle roar */
  public setThrottle(velocity: number): void {
    if (!this.isRunning || !this.osc1 || !this.osc2 || !this.subOsc) return;

    const t = this.ctx.currentTime;
    const v = Math.min(Math.abs(velocity), 6.0);
    const normalized = Math.min(1.0, v / 4.0);

    // Base idle: 92Hz -> Max load: 360Hz
    const baseFreq = 92 + normalized * 240;
    this.osc1.frequency.setTargetAtTime(baseFreq, t, 0.08);
    this.osc2.frequency.setTargetAtTime(baseFreq * 2.01, t, 0.08);
    this.subOsc.frequency.setTargetAtTime(baseFreq * 0.5, t, 0.08);

    // Filter opens under throttle
    const targetFilter = 450 + normalized * 3200;
    this.filter.frequency.setTargetAtTime(targetFilter, t, 0.08);

    // Volume swells slightly under heavy load
    const targetVol = 0.18 + normalized * 0.12;
    this.masterGain.gain.setTargetAtTime(targetVol, t, 0.08);
  }

  public stop(): void {
    if (!this.isRunning) return;
    const t = this.ctx.currentTime;
    this.masterGain.gain.linearRampToValueAtTime(0, t + 0.4);
    setTimeout(() => {
      this.osc1?.stop();
      this.osc2?.stop();
      this.subOsc?.stop();
      this.isRunning = false;
    }, 500);
  }
}
