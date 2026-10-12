/**
 * 用 Web Audio 合成接近原版的五種音效：wing / point / hit / die / swoosh。
 * 第二版的麥克風輸入會共用 this.ctx（同一個 AudioContext）。
 */
export class Sfx {
  constructor() {
    this.ctx = null;
    this.out = null;
    this.muted = false;
  }

  /** 瀏覽器規定要在使用者操作後才能啟動音訊 */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.out = this.ctx.createGain();
      this.out.gain.value = 0.45;
      this.out.connect(this.ctx.destination);
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  get on() {
    return !!this.ctx && !this.muted;
  }

  env(gainNode, t, vol, dur, attack = 0.004) {
    const g = gainNode.gain;
    g.setValueAtTime(0.0001, t);
    g.linearRampToValueAtTime(vol, t + attack);
    g.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  tone(type, f0, f1, start, dur, vol) {
    const c = this.ctx;
    const t = c.currentTime + start;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = c.createGain();
    this.env(g, t, vol, dur);
    o.connect(g).connect(this.out);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  noise(filterType, f0, f1, q, start, dur, vol, attack = 0.004) {
    const c = this.ctx;
    const t = c.currentTime + start;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = filterType;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = c.createGain();
    this.env(g, t, vol, dur, attack);
    src.connect(f).connect(g).connect(this.out);
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }

  wing() {
    if (!this.on) return;
    this.noise('bandpass', 900, 2600, 1.4, 0, 0.1, 0.9, 0.01);
    this.tone('triangle', 260, 520, 0, 0.07, 0.12);
  }

  point() {
    if (!this.on) return;
    this.tone('square', 988, 988, 0, 0.08, 0.16);
    this.tone('square', 1319, 1319, 0.08, 0.35, 0.16);
  }

  hit() {
    if (!this.on) return;
    this.noise('lowpass', 3000, 300, 0.8, 0, 0.2, 1.0, 0.002);
    this.tone('sine', 220, 55, 0, 0.18, 0.9);
  }

  die() {
    if (!this.on) return;
    this.tone('triangle', 900, 160, 0, 0.55, 0.4);
    this.tone('square', 900, 160, 0, 0.55, 0.05);
  }

  swoosh() {
    if (!this.on) return;
    this.noise('bandpass', 350, 4200, 0.9, 0, 0.35, 0.55, 0.12);
  }
}
