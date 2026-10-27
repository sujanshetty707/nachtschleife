// Web Audio pit-wall radio transmission effect with squelch and mic clicks

export class RadioAudio {
  private ctx: AudioContext;
  private destination: AudioNode;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.destination = destination;
  }

  /** Play 2-way pit radio Roger beep / squelch click */
  public playRogerBeep(): void {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1750, t);
    osc.frequency.setValueAtTime(1400, t + 0.06);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /** Short burst of white noise bandpass squelch when entering pit or telemetry section */
  public playSquelchBurst(): void {
    const t = this.ctx.currentTime;
    const duration = 0.08;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * duration), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const bpf = this.ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(2200, t);
    bpf.Q.setValueAtTime(4, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    src.connect(bpf);
    bpf.connect(gain);
    gain.connect(this.destination);

    src.start(t);
  }
}
