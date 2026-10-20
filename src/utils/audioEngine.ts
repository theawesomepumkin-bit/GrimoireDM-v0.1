/**
 * GrimoireDM Audio Engine
 * High-performance Web Audio API procedural sound generator and ambient player.
 * Works 100% offline with zero external audio assets required, plus supports
 * user uploaded sound files and web streams with volume control, crossfade & looping.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  // Active ambient nodes
  private currentAmbientSource: AudioNode | null = null;
  private currentAmbientType: string | null = null;
  private customAudioElement: HTMLAudioElement | null = null;
  private isAmbientPlaying: boolean = false;
  private ambientVolume: number = 0.6;
  private sfxVolume: number = 0.8;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(val: number) {
    this.initContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  public setAmbientVolume(val: number) {
    this.ambientVolume = Math.max(0, Math.min(1, val));
    this.initContext();
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(this.ambientVolume, this.ctx.currentTime, 0.05);
    }
    if (this.customAudioElement) {
      this.customAudioElement.volume = this.ambientVolume;
    }
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    this.initContext();
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  // --- TACTICAL SFX TRIGGERS ---

  public playSfx(soundType: string, customUrl?: string) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    if (customUrl) {
      try {
        const audio = new Audio(customUrl);
        audio.volume = this.sfxVolume;
        audio.play().catch(() => {});
        return;
      } catch {}
    }

    const t = this.ctx.currentTime;

    switch (soundType) {
      case 'dice':
        this.playDiceRoll(t);
        break;
      case 'sword':
        this.playSwordClash(t);
        break;
      case 'magic':
        this.playMagicBlast(t);
        break;
      case 'heal':
        this.playHealingChime(t);
        break;
      case 'roar':
        this.playMonsterRoar(t);
        break;
      case 'thunder':
        this.playThunderClap(t);
        break;
      case 'tavern':
        this.playMugClink(t);
        break;
      case 'horn':
        this.playWarHorn(t);
        break;
      case 'shield':
        this.playShieldBlock(t);
        break;
      case 'whisper':
        this.playEerieWhisper(t);
        break;
      default:
        this.playDiceRoll(t);
        break;
    }
  }

  // 1. Dice Roll: rhythmic wooden click bursts
  private playDiceRoll(t: number) {
    if (!this.ctx || !this.sfxGain) return;

    const clicks = 5;
    for (let i = 0; i < clicks; i++) {
      const clickTime = t + i * 0.06 + Math.random() * 0.03;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 + Math.random() * 600, clickTime);
      filter.Q.setValueAtTime(6, clickTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120 + Math.random() * 80, clickTime);
      osc.frequency.exponentialRampToValueAtTime(40, clickTime + 0.04);

      gain.gain.setValueAtTime(0.7 - (i * 0.1), clickTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(clickTime);
      osc.stop(clickTime + 0.05);
    }
  }

  // 2. Sword Clash: metallic ping with fast decay
  private playSwordClash(t: number) {
    if (!this.ctx || !this.sfxGain) return;

    // Metallic ring
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1420, t);
    osc1.frequency.exponentialRampToValueAtTime(800, t + 0.4);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(2850, t);
    osc2.frequency.exponentialRampToValueAtTime(1200, t + 0.25);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.5);
    osc2.stop(t + 0.5);
  }

  // 3. Magic Blast: low boom + ascending shimmer
  private playMagicBlast(t: number) {
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(280, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.6);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.6);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.7);
  }

  // 4. Healing Chime: arpeggiated bright bells
  private playHealingChime(t: number) {
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const noteTime = t + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.4, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.85);
    });
  }

  // 5. Monster Roar: FM modulated low roar
  private playMonsterRoar(t: number) {
    if (!this.ctx || !this.sfxGain) return;

    const carrier = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const masterSfxGain = this.ctx.createGain();

    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(80, t);
    carrier.frequency.linearRampToValueAtTime(130, t + 0.2);
    carrier.frequency.exponentialRampToValueAtTime(45, t + 0.9);

    mod.type = 'square';
    mod.frequency.setValueAtTime(35, t);

    modGain.gain.setValueAtTime(80, t);

    mod.connect(carrier.frequency);

    masterSfxGain.gain.setValueAtTime(0.01, t);
    masterSfxGain.gain.linearRampToValueAtTime(0.8, t + 0.1);
    masterSfxGain.gain.exponentialRampToValueAtTime(0.001, t + 0.95);

    carrier.connect(masterSfxGain);
    masterSfxGain.connect(this.sfxGain);

    carrier.start(t);
    mod.start(t);
    carrier.stop(t + 1.0);
    mod.stop(t + 1.0);
  }

  // 6. Thunder: sub rumble
  private playThunderClap(t: number) {
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, t);
    filter.frequency.exponentialRampToValueAtTime(50, t + 1.2);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 1.5);
  }

  // 7. Mug Clink: glass ping
  private playMugClink(t: number) {
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2100, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.25);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  // 8. War Horn
  private playWarHorn(t: number) {
    if (!this.ctx || !this.sfxGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(220, t); // A3
    osc2.frequency.setValueAtTime(223, t); // slightly detuned

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.7, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 1.25);
    osc2.stop(t + 1.25);
  }

  // 9. Shield Block: metallic blunt thud
  private playShieldBlock(t: number) {
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.2);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // 10. Eerie Whisper
  private playEerieWhisper(t: number) {
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.linearRampToValueAtTime(360, t + 0.5);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.95);
  }

  // --- AMBIENT SOUNDSCAPES ---

  public startAmbient(type: 'tavern' | 'rain' | 'dungeon' | 'forest', customUrl?: string) {
    this.initContext();
    this.stopAmbient(true); // Smooth fade out existing

    this.isAmbientPlaying = true;
    this.currentAmbientType = type;

    if (customUrl) {
      this.playCustomAmbientStream(customUrl);
      return;
    }

    if (!this.ctx || !this.ambientGain) return;

    const t = this.ctx.currentTime;

    if (type === 'dungeon') {
      // Deep low sub drone with detuned oscillators
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(55, t); // A1
      osc2.frequency.setValueAtTime(56.5, t); // Detuned

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, t);

      droneGain.gain.setValueAtTime(0.001, t);
      droneGain.gain.linearRampToValueAtTime(0.4, t + 1.5); // 1.5s fade in

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(this.ambientGain);

      osc1.start(t);
      osc2.start(t);

      this.currentAmbientSource = droneGain;
    } else if (type === 'tavern') {
      // Warm fireplace drone & cozy chord
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();
      const tavernGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc3.type = 'triangle';

      osc1.frequency.setValueAtTime(130.81, t); // C3
      osc2.frequency.setValueAtTime(164.81, t); // E3
      osc3.frequency.setValueAtTime(196.00, t); // G3

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, t);

      tavernGain.gain.setValueAtTime(0.001, t);
      tavernGain.gain.linearRampToValueAtTime(0.25, t + 1.5);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(tavernGain);
      tavernGain.connect(this.ambientGain);

      osc1.start(t);
      osc2.start(t);
      osc3.start(t);

      this.currentAmbientSource = tavernGain;
    } else if (type === 'rain' || type === 'forest') {
      // Noise buffer generator for rain or wind
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(type === 'rain' ? 800 : 450, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, t);
      noiseGain.gain.linearRampToValueAtTime(0.3, t + 1.5);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ambientGain);

      whiteNoise.start(t);
      this.currentAmbientSource = noiseGain;
    }
  }

  private playCustomAmbientStream(url: string) {
    if (this.customAudioElement) {
      this.customAudioElement.pause();
      this.customAudioElement = null;
    }

    try {
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = this.ambientVolume;
      audio.play().catch(() => {});
      this.customAudioElement = audio;
    } catch (e) {
      console.error('Audio stream playback failed:', e);
    }
  }

  public stopAmbient(fadeOut: boolean = true) {
    if (this.customAudioElement) {
      this.customAudioElement.pause();
      this.customAudioElement = null;
    }

    if (this.currentAmbientSource && this.ctx) {
      if (fadeOut && 'gain' in this.currentAmbientSource) {
        const gainNode = this.currentAmbientSource as GainNode;
        gainNode.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.3);
        setTimeout(() => {
          try {
            gainNode.disconnect();
          } catch {}
        }, 500);
      } else {
        try {
          this.currentAmbientSource.disconnect();
        } catch {}
      }
      this.currentAmbientSource = null;
    }

    this.isAmbientPlaying = false;
    this.currentAmbientType = null;
  }

  public getIsPlaying(): boolean {
    return this.isAmbientPlaying;
  }

  public getCurrentAmbient(): string | null {
    return this.currentAmbientType;
  }
}

export const audioEngine = new AudioEngine();

export function playSynthesizedSound(type: 'dice' | 'sword' | 'magic' | 'heal' | 'turn' | 'victory') {
  audioEngine.playSFX(type);
}

export function playSFX(type: 'dice' | 'sword' | 'magic' | 'heal' | 'turn' | 'victory') {
  audioEngine.playSFX(type);
}

