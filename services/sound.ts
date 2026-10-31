/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BGMTrack = 'SPOOKY_MYSTERY' | 'REALLY_SCARY' | 'CHEESY_ROMANTIC';

class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private currentTrack: BGMTrack | null = null;
  private bgmIntervalId: number | null = null;
  private bgmStep: number = 0;
  private bgmMasterGain: GainNode | null = null;
  private sfxMasterGain: GainNode | null = null;

  public initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.bgmMasterGain = this.ctx.createGain();
        this.bgmMasterGain.gain.setValueAtTime(0.26, this.ctx.currentTime);
        this.bgmMasterGain.connect(this.ctx.destination);

        this.sfxMasterGain = this.ctx.createGain();
        this.sfxMasterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.sfxMasterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleSound(): boolean {
    this.enabled = !this.enabled;
    if (this.ctx && this.bgmMasterGain && this.sfxMasterGain) {
      const gainVal = this.enabled ? 0.26 : 0;
      this.bgmMasterGain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      this.sfxMasterGain.gain.setValueAtTime(this.enabled ? 0.35 : 0, this.ctx.currentTime);
    }
    if (this.enabled && this.currentTrack && !this.bgmIntervalId) {
      this.startBgmLoop();
    }
    return this.enabled;
  }

  private mtof(note: number): number {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  // --- SOUND EFFECTS ---

  public playJump() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(390, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playDash() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playInteract() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(783.99, now + 0.05);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playSwitch() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playCheckpoint() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain) return;

    const now = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880, 1174.66];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxMasterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.25, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.2);
    });
  }

  public playHit() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playLevelClear() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain) return;

    const now = this.ctx.currentTime;
    const melody = [
      { f: 440, d: 0.12 },
      { f: 554.37, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 880, d: 0.32 },
    ];

    let t = now;
    melody.forEach((note) => {
      if (!this.ctx || !this.sfxMasterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain);

      osc.start(t);
      osc.stop(t + note.d);
      t += note.d + 0.03;
    });
  }

  public playVictory() {
    this.playBGM('CHEESY_ROMANTIC');
  }

  public playBlip() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.sfxMasterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // --- BACKGROUND MUSIC ENGINE ---

  public playBGM(track: BGMTrack) {
    if (this.currentTrack === track && this.bgmIntervalId) return;

    this.stopBGM();
    this.currentTrack = track;
    this.bgmStep = 0;
    this.initCtx();

    if (this.enabled) {
      this.startBgmLoop();
    }
  }

  public stopBGM() {
    if (this.bgmIntervalId !== null) {
      window.clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.currentTrack = null;
  }

  private startBgmLoop() {
    if (!this.ctx || !this.currentTrack) return;

    let stepMs = 140;
    if (this.currentTrack === 'SPOOKY_MYSTERY') stepMs = 150;
    if (this.currentTrack === 'REALLY_SCARY') stepMs = 145; // Slow, suspenseful, horror tempo
    if (this.currentTrack === 'CHEESY_ROMANTIC') stepMs = 160; // Tender love ballad tempo

    this.bgmIntervalId = window.setInterval(() => {
      this.tickBgm();
    }, stepMs);
  }

  private playSynthNote(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    vibrato: boolean = false,
    cutoff: number = 2400
  ) {
    if (!this.ctx || !this.bgmMasterGain || !this.enabled) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, now);

    if (vibrato) {
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(5.2, now);
      lfoGain.gain.setValueAtTime(freq * 0.02, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now + 0.08);
      lfo.stop(now + duration);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.03);
    gain.gain.setValueAtTime(volume * 0.8, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmMasterGain);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private playNoiseHit(volume: number, duration: number = 0.06) {
    if (!this.ctx || !this.bgmMasterGain || !this.enabled) return;

    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmMasterGain);

    noise.start();
  }

  private tickBgm() {
    if (!this.ctx || !this.enabled) return;

    const step = this.bgmStep;
    this.bgmStep++;

    // ==========================================
    // 1. SPOOKY & MYSTERIOUS BGM (Intro & Cutscene)
    // ==========================================
    if (this.currentTrack === 'SPOOKY_MYSTERY') {
      const loopLen = 32;
      const s = step % loopLen;

      if (s === 0) {
        this.playSynthNote(this.mtof(36), 2.2, 'triangle', 0.22, false, 450); // C2
      } else if (s === 16) {
        this.playSynthNote(this.mtof(32), 2.2, 'triangle', 0.22, false, 400); // Ab1
      }

      const spookyNotes: { [key: number]: number } = {
        0: 72, // C5
        2: 75, // Eb5
        4: 79, // G5
        6: 71, // B4
        8: 78, // F#5
        10: 75,
        12: 79,
        14: 84, // C6
        16: 68, // Ab4
        18: 72,
        20: 75,
        22: 70, // Bb4
        24: 74,
        26: 71,
        28: 68,
        30: 67, // G4
      };

      if (spookyNotes[s] !== undefined) {
        this.playSynthNote(this.mtof(spookyNotes[s]), 0.28, 'sine', 0.16, true, 1800);
      }

      if (s % 8 === 0) {
        this.playNoiseHit(0.04, 0.15);
      }
    }

    // =========================================================
    // 2. REALLY SCARY MUSIC (Gameplay Levels - Sections 1, 2, 3)
    // Dark horror, ominous heartbeat, screeching dissonant stabs
    // =========================================================
    else if (this.currentTrack === 'REALLY_SCARY') {
      const loopLen = 32;
      const s = step % loopLen;

      // Heavy, unsettling horror heartbeat (thump-thump)
      if (s === 0 || s === 2 || s === 16 || s === 18) {
        this.playSynthNote(48, 0.18, 'sine', 0.42, false, 120); // Sub-bass heartbeat thump
        this.playSynthNote(this.mtof(25), 0.35, 'sawtooth', 0.25, false, 280); // Low C#1 dissonance
      }

      // Menacing low horror drone / pulse
      if (s === 0) {
        this.playSynthNote(this.mtof(37), 2.1, 'sawtooth', 0.22, false, 320); // C#2
        this.playSynthNote(this.mtof(43), 2.1, 'triangle', 0.18, false, 360); // G2 (tritone dissonance!)
      } else if (s === 16) {
        this.playSynthNote(this.mtof(36), 2.1, 'sawtooth', 0.22, false, 320); // C2
        this.playSynthNote(this.mtof(42), 2.1, 'triangle', 0.18, false, 360); // F#2 (tritone dissonance!)
      }

      // Ghostly breath / eerie floorboard shiver every 8 steps
      if (s % 8 === 4) {
        this.playNoiseHit(0.07, 0.22);
      }

      // Terrifying high-pitched horror stabs & shivering minor 2nds (Psycho / Halloween style)
      // Dissonant clusters: E6 + F6, C#6 + D6, G#5 + A5
      const horrorStabs: { [key: number]: number[] } = {
        0: [88, 89],   // E6 + F6 (terrifying minor 2nd clash!)
        1: [88, 89],
        4: [85, 86],   // C#6 + D6
        5: [85, 86],
        8: [80, 81],   // G#5 + A5
        10: [74, 80],  // D5 + G#5 (tritone!)
        12: [88, 89],
        13: [88, 89],
        16: [87, 88],  // Eb6 + E6
        17: [87, 88],
        20: [85, 86],
        22: [79, 85],  // G5 + C#6
        24: [88, 89],
        26: [86, 92],  // D6 + G#6
        28: [80, 81],
        30: [73, 79],  // C#5 + G5
      };

      if (horrorStabs[s]) {
        horrorStabs[s].forEach((note) => {
          this.playSynthNote(this.mtof(note), 0.12, 'sawtooth', 0.11, true, 3500);
        });
      }

      // Ominous bell ping echoing in the empty dark science building
      if (s === 8 || s === 24) {
        this.playSynthNote(this.mtof(96), 0.65, 'sine', 0.12, false, 2800); // C7 bell toll
      }
    }

    // =========================================================================
    // 3. CHEESY ROMANTIC MUSIC (Final Scene & Victory)
    // Sentimental 80s/90s love ballad: sweet arpeggios, tender love melody, romantic pads
    // =========================================================================
    else if (this.currentTrack === 'CHEESY_ROMANTIC') {
      const loopLen = 32;
      const s = step % loopLen;

      // Ultra-cheesy slow-dance Love Ballad progression:
      // F Major -> C Major -> D Minor -> Bb Major (Classic "I Will Always Love You" style)
      if (s === 0) {
        // F Major chord
        this.playSynthNote(this.mtof(41), 2.2, 'triangle', 0.32, false, 400); // F2 bass
        this.playSynthNote(this.mtof(53), 1.2, 'sine', 0.14, false, 650); // F3
        this.playSynthNote(this.mtof(57), 1.2, 'sine', 0.12, false, 650); // A3
        this.playSynthNote(this.mtof(60), 1.2, 'sine', 0.14, false, 650); // C4
      } else if (s === 8) {
        // C Major chord
        this.playSynthNote(this.mtof(36), 2.2, 'triangle', 0.32, false, 400); // C2 bass
        this.playSynthNote(this.mtof(52), 1.2, 'sine', 0.12, false, 650); // E3
        this.playSynthNote(this.mtof(55), 1.2, 'sine', 0.12, false, 650); // G3
        this.playSynthNote(this.mtof(60), 1.2, 'sine', 0.14, false, 650); // C4
      } else if (s === 16) {
        // D Minor chord
        this.playSynthNote(this.mtof(38), 2.2, 'triangle', 0.32, false, 400); // D2 bass
        this.playSynthNote(this.mtof(50), 1.2, 'sine', 0.12, false, 650); // D3
        this.playSynthNote(this.mtof(53), 1.2, 'sine', 0.12, false, 650); // F3
        this.playSynthNote(this.mtof(57), 1.2, 'sine', 0.14, false, 650); // A3
      } else if (s === 24) {
        // Bb Major chord
        this.playSynthNote(this.mtof(34), 2.2, 'triangle', 0.32, false, 400); // Bb1 bass
        this.playSynthNote(this.mtof(53), 1.2, 'sine', 0.12, false, 650); // F3
        this.playSynthNote(this.mtof(58), 1.2, 'sine', 0.14, false, 650); // Bb3
        this.playSynthNote(this.mtof(62), 1.2, 'sine', 0.12, false, 650); // D4
      }

      // Romantic slow ballad drum beat: soft kick on 0, gentle rimshot/snare on 4, 12, 20, 28
      if (s % 8 === 0) {
        this.playSynthNote(65, 0.12, 'sine', 0.28, false, 160); // Soft heart-thump kick
      }
      if (s % 8 === 4) {
        this.playNoiseHit(0.09, 0.08); // Tender rimshot
      }
      if (s % 2 === 0) {
        this.playNoiseHit(0.03, 0.02); // Shimmering hi-hat
      }

      // Sparkly electric piano arpeggios (cheesy 80s love theme!)
      const arps: { [key: number]: number } = {
        0: 65,  // F4
        2: 69,  // A4
        4: 72,  // C5
        6: 77,  // F5
        8: 64,  // E4
        10: 67, // G4
        12: 72, // C5
        14: 76, // E5
        16: 62, // D4
        18: 65, // F4
        20: 69, // A4
        22: 74, // D5
        24: 58, // Bb3
        26: 62, // D4
        28: 65, // F4
        30: 70, // Bb4
      };
      if (arps[s]) {
        this.playSynthNote(this.mtof(arps[s]), 0.22, 'sine', 0.11, false, 1400);
      }

      // Soaring, melodramatic cheesy love song lead melody (sweet vibrato!)
      // Melody: "Don't go breaking my heart... let's never leave each other again"
      const cheesyLead: { [key: number]: { note: number; dur: number } } = {
        0: { note: 77, dur: 0.55 },  // F5 (high emotional opening)
        4: { note: 76, dur: 0.35 },  // E5
        6: { note: 72, dur: 0.8 },   // C5 (tender hold)

        8: { note: 74, dur: 0.4 },   // D5
        10: { note: 76, dur: 0.4 },  // E5
        12: { note: 79, dur: 0.9 },  // G5 (soaring romantic peak!)

        16: { note: 77, dur: 0.55 }, // F5
        20: { note: 76, dur: 0.35 }, // E5
        22: { note: 74, dur: 0.8 },  // D5 (emotional hold)

        24: { note: 70, dur: 0.4 },  // Bb4
        26: { note: 72, dur: 0.4 },  // C5
        28: { note: 74, dur: 0.4 },  // D5
        30: { note: 72, dur: 0.95 }, // C5 (sweet resolution)
      };

      if (cheesyLead[s]) {
        this.playSynthNote(
          this.mtof(cheesyLead[s].note),
          cheesyLead[s].dur,
          'triangle',
          0.26,
          true, // Rich romantic vibrato!
          2200
        );
      }
    }
  }
}

export const sound = new RetroSoundEngine();

// Compatibility exports
export const initAudio = () => sound.playBlip();
export const playDot = () => sound.playInteract();
export const playSuperCharge = () => sound.playLevelClear();
export const playEatVillain = () => sound.playBlip();
export const playGameOver = () => sound.playHit();
export const playLevelWin = () => sound.playVictory();
export const playCountdownBeep = () => sound.playBlip();
export const playGoSignal = () => sound.playBlip();
