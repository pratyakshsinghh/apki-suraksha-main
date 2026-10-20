// Web Audio API Synthesizer for Emergency Sirens and Audio Beeps
class AudioAlertService {
  private audioCtx: AudioContext | null = null;
  private sirenOscillator: OscillatorNode | null = null;
  private sirenModulator: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private isSirenPlaying = false;

  private initCtx() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // High-intensity Emergency Siren (wailing frequency modulation)
  public startSiren() {
    try {
      this.initCtx();
      if (!this.audioCtx || this.isSirenPlaying) return;

      const now = this.audioCtx.currentTime;

      // Primary carrier oscillator
      const osc = this.audioCtx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);

      // Low frequency modulation (wailing wave)
      const mod = this.audioCtx.createOscillator();
      mod.type = 'sine';
      mod.frequency.setValueAtTime(1.5, now); // 1.5 Hz cycle

      const modGain = this.audioCtx.createGain();
      modGain.gain.setValueAtTime(350, now); // modulates between 400Hz and 1100Hz

      mod.connect(modGain);
      modGain.connect(osc.frequency);

      // Master siren gain
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.4, now);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      mod.start(now);
      osc.start(now);

      this.sirenOscillator = osc;
      this.sirenModulator = mod;
      this.sirenGain = gain;
      this.isSirenPlaying = true;
    } catch (e) {
      console.warn('Unable to start siren audio:', e);
    }
  }

  public stopSiren() {
    try {
      if (this.sirenOscillator) {
        this.sirenOscillator.stop();
        this.sirenOscillator.disconnect();
        this.sirenOscillator = null;
      }
      if (this.sirenModulator) {
        this.sirenModulator.stop();
        this.sirenModulator.disconnect();
        this.sirenModulator = null;
      }
      if (this.sirenGain) {
        this.sirenGain.disconnect();
        this.sirenGain = null;
      }
      this.isSirenPlaying = false;
    } catch (e) {
      console.warn('Error stopping siren:', e);
      this.isSirenPlaying = false;
    }
  }

  public isPlaying(): boolean {
    return this.isSirenPlaying;
  }

  // Short sonar / scanning chirp when AI scans a frame
  public playScanChirp() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // ignore
    }
  }

  // Urgent double-beep on Threat Detected
  public playThreatAlarm() {
    try {
      this.initCtx();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      [0, 0.18].forEach((offset) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(950, now + offset);

        gain.gain.setValueAtTime(0.25, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.12);
      });
    } catch {
      // ignore
    }
  }

  // Voice assistant sound removed - visual titles used instead
  public speakAnnouncement(_text: string) {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }
}

export const audioAlertService = new AudioAlertService();
