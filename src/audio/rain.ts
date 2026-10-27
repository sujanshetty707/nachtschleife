// Web Audio pink noise synthesized rain layer

export class RainAudio {
  private ctx: AudioContext;
  private node: AudioNode | null = null;
  private gainNode: GainNode;
  private filter: BiquadFilterNode;
  private isPlaying = false;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = 0;

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 1400;
    this.filter.Q.value = 0.5;

    this.filter.connect(this.gainNode);
    this.gainNode.connect(destination);
  }

  public start(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Generate 4 seconds of pink noise in a looping buffer
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.filter);
    source.start();
    this.node = source;

    // Fade in rain
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 1.5);
  }

  public setIntensity(intensity: number): void {
    if (!this.isPlaying) return;
    const clamped = Math.max(0, Math.min(1, intensity));
    const targetFreq = 800 + clamped * 3500;
    const targetGain = 0.1 + clamped * 0.35;

    this.filter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.2);
    this.gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);
  }

  public stop(): void {
    if (!this.isPlaying) return;
    this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    setTimeout(() => {
      if (this.node && 'stop' in this.node) {
        (this.node as AudioBufferSourceNode).stop();
      }
      this.isPlaying = false;
    }, 600);
  }
}
