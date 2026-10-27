// Web Audio procedural thunder synthesizer with distance reverberation

export class ThunderAudio {
  private ctx: AudioContext;
  private destination: AudioNode;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.destination = destination;
  }

  public trigger(intensity = 1.0): void {
    const t = this.ctx.currentTime;
    const duration = 2.5 + intensity * 1.5;

    // Buffer of filtered noise
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown/red noise filter
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Resonant lowpass
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140 + intensity * 120, t);
    filter.frequency.exponentialRampToValueAtTime(45, t + duration);

    // Envelope
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4 * intensity, t + 0.05); // sharp crack
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.destination);

    noise.start(t);
    noise.stop(t + duration);
  }
}
