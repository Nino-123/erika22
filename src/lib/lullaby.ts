/**
 * "A Garden Lullaby" — an original piece, generated live with the Web Audio
 * API (no audio file, no licensing). A music-box melody in F major over a
 * warm, slowly breathing pad, sparse arpeggios and a soft bass, all washed
 * in a long reverb. The arrangement changes on each pass so it never feels
 * like a short loop.
 */

const BPM = 64;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

type Chord = { bass: number; pad: number[]; arp: number[] };

// Fmaj7 → Dm9 → B♭maj7 → C6/9, two bars each
const CHORDS: Chord[] = [
  { bass: 41, pad: [53, 57, 60, 64], arp: [65, 69, 72, 76] },
  { bass: 38, pad: [50, 53, 57, 64], arp: [62, 65, 69, 72] },
  { bass: 34, pad: [50, 53, 57, 62], arp: [62, 65, 69, 74] },
  { bass: 36, pad: [48, 55, 62, 64], arp: [60, 62, 67, 69] },
];

// [midi note or null for a rest, length in beats] — eight bars
const MELODY: [number | null, number][][] = [
  [[81, 1], [84, 1], [81, 0.5], [79, 0.5], [77, 1]],
  [[76, 2], [72, 2]],
  [[74, 1], [77, 1], [81, 1], [79, 1]],
  [[77, 3], [null, 1]],
  [[86, 1], [84, 1], [81, 1], [77, 1]],
  [[79, 2], [81, 1], [79, 1]],
  [[76, 1], [79, 1], [84, 1], [86, 1]],
  [[84, 3], [null, 1]],
];

const ARP_PATTERN = [0, 1, 2, 3, 2, 1, 2, 0];

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
const human = (amount: number) => (Math.random() - 0.5) * amount;

export class GardenLullaby {
  private ctx: AudioContext;
  private master: GainNode;
  private dry: GainNode;
  private wet: GainNode;
  private padFilter: BiquadFilterNode;
  private toneNode: BiquadFilterNode;
  private timer: number | null = null;
  private nextBar = 0;
  private bar = 0;
  private outputEl: HTMLAudioElement | null = null;

  constructor() {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    const ctx = this.ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;

    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 7000;
    this.master.connect(tone);

    this.dry = ctx.createGain();
    this.dry.gain.value = 0.75;
    this.wet = ctx.createGain();
    this.wet.gain.value = 0.5;

    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(3.8);
    this.dry.connect(this.master);
    this.wet.connect(reverb);
    reverb.connect(this.master);

    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = "lowpass";
    this.padFilter.frequency.value = 1100;
    this.padFilter.Q.value = 0.3;
    this.padFilter.connect(this.dry);
    this.padFilter.connect(this.wet);

    // Play through a media element where possible, so iPhones in silent
    // mode still play it (plain Web Audio follows the ringer switch).
    try {
      const stream = ctx.createMediaStreamDestination();
      tone.connect(stream);
      const el = new Audio();
      el.srcObject = stream.stream;
      el.setAttribute("playsinline", "");
      this.outputEl = el;
    } catch {
      tone.connect(ctx.destination);
    }
    this.toneNode = tone;
  }

  get playing() {
    return this.timer !== null;
  }

  /** Must be called from a click/tap handler. */
  async start() {
    const ctx = this.ctx;
    await ctx.resume();
    if (this.outputEl) {
      try {
        await this.outputEl.play();
      } catch {
        // media-element route refused: fall back to plain Web Audio
        this.toneNode.connect(ctx.destination);
        this.outputEl = null;
      }
    }
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.9, now + 3);
    this.nextBar = now + 0.15;
    this.schedule();
    this.timer = window.setInterval(() => this.schedule(), 250);
  }

  stop() {
    const ctx = this.ctx;
    const now = ctx.currentTime;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 1.2);
    window.setTimeout(() => {
      if (this.timer === null) {
        void ctx.suspend();
        this.outputEl?.pause();
      }
    }, 1400);
  }

  dispose() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.outputEl?.pause();
    void this.ctx.close();
  }

  // ── scheduling ────────────────────────────────────────────────────────────

  private schedule() {
    while (this.nextBar < this.ctx.currentTime + 4) {
      this.scheduleBar(this.bar, this.nextBar);
      this.nextBar += BAR;
      this.bar += 1;
    }
  }

  private scheduleBar(i: number, t: number) {
    const cycle = Math.floor(i / 8);
    const inCycle = i % 8;
    const chord = CHORDS[Math.floor(inCycle / 2)];
    // 0: opening (no melody) · 1: melody · 2: melody + sparkles · 3: hushed
    const variation = cycle === 0 ? 0 : 1 + ((cycle - 1) % 3);

    if (inCycle % 2 === 0) {
      this.pad(chord.pad, t, BAR * 2, variation === 3 ? 0.035 : 0.05);
      this.bass(chord.bass, t, BAR * 2);
    }

    for (let e = 0; e < 8; e++) {
      if (variation === 3 && e % 2 === 1) continue;
      if (e === 7 && inCycle % 2 === 1) continue;
      const note = chord.arp[ARP_PATTERN[e]] - (variation === 3 ? 12 : 0);
      this.bell(note, t + e * (BEAT / 2) + human(0.02), 0.045 + human(0.015), 1.4);
    }

    if (variation === 1 || variation === 2) {
      let offset = 0;
      for (const [note, beats] of MELODY[inCycle]) {
        if (note !== null) this.bell(note, t + offset * BEAT + human(0.015), 0.15 + human(0.03), 2.6);
        offset += beats;
      }
    }

    if (variation === 2 && inCycle % 2 === 1) {
      this.bell(chord.arp[3] + 12, t + BEAT * 3.5, 0.04, 3);
    }
  }

  // ── instruments ───────────────────────────────────────────────────────────

  /** Music-box / celesta: a few bell partials with a quick strike and long decay. */
  private bell(midi: number, t: number, vel: number, decay: number) {
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, t);
    out.gain.linearRampToValueAtTime(vel, t + 0.005);
    out.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    out.connect(this.dry);
    out.connect(this.wet);

    const f = hz(midi);
    [
      [1, 1],
      [2.0, 0.3],
      [3.01, 0.08],
      [5.4, 0.025],
    ].forEach(([ratio, gain]) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f * ratio;
      const g = ctx.createGain();
      g.gain.value = gain;
      osc.connect(g).connect(out);
      osc.start(t);
      osc.stop(t + decay + 0.05);
    });
  }

  /** Warm pad that swells in and lingers into the next chord. */
  private pad(notes: number[], t: number, dur: number, level: number) {
    const ctx = this.ctx;
    for (const midi of notes) {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(level, t + 1.8);
      g.gain.setValueAtTime(level, t + dur - 0.3);
      g.gain.linearRampToValueAtTime(0, t + dur + 2.2);
      g.connect(this.padFilter);
      for (const cents of [-7, 7]) {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = hz(midi);
        osc.detune.value = cents;
        osc.connect(g);
        osc.start(t);
        osc.stop(t + dur + 2.4);
      }
    }
  }

  private bass(midi: number, t: number, dur: number) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.5);
    g.gain.linearRampToValueAtTime(0.06, t + dur * 0.6);
    g.gain.linearRampToValueAtTime(0, t + dur + 1);
    g.connect(this.dry);
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = hz(midi);
    osc.connect(g);
    osc.start(t);
    osc.stop(t + dur + 1.1);
  }

  /** A soft, decaying stereo noise tail used as the reverb's impulse response. */
  private impulse(seconds: number) {
    const ctx = this.ctx;
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.8);
      }
    }
    return buffer;
  }
}
