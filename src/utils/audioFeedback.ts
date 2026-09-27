// Web Audio API synthesizer for workout demo audio feedback
// Zero external asset dependencies, works offline and respects browser autoplay policies

class AudioFeedbackService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playTone(frequency: number, durationSeconds: number, type: OscillatorType = 'sine', volume: number = 0.15) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSeconds);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSeconds);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Countdown tick (3, 2, 1)
  public playCountdownTick(isFinal: boolean = false) {
    if (isFinal) {
      this.playTone(880, 0.35, 'triangle', 0.25); // Higher pitch 'Go!'
    } else {
      this.playTone(520, 0.12, 'sine', 0.18);
    }
  }

  // Rep completion or metronome pulse
  public playRepTick() {
    this.playTone(660, 0.1, 'sine', 0.15);
  }

  // Rest countdown start
  public playRestStart() {
    this.playTone(392, 0.3, 'sine', 0.2);
  }

  // Set completed chime (two ascending notes)
  public playSetCompleted() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.24); // G5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(now + 0.45);
    } catch {
      // Ignore
    }
  }

  // Workout completed victory fanfare
  public playVictoryFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [
        { f: 523.25, t: 0.0, d: 0.12 }, // C5
        { f: 659.25, t: 0.12, d: 0.12 }, // E5
        { f: 783.99, t: 0.24, d: 0.14 }, // G5
        { f: 1046.50, t: 0.38, d: 0.45 }, // C6
      ];

      notes.forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + t);

        gain.gain.setValueAtTime(0.25, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + d);
      });
    } catch {
      // Ignore
    }
  }

  // Gentle push notification reminder chime (soft two-tone harmonic bell)
  public playGentleReminderChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Gentle bell tone: D5 (587.33Hz) -> A5 (880.00Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.12);
      gain2.gain.setValueAtTime(0.14, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch {
      // Ignore
    }
  }
}

export const audioFeedback = new AudioFeedbackService();
