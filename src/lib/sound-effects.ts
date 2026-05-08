/**
 * @fileOverview Web Audio API sound synthesizer for game effects.
 * Provides procedural sounds for popping, clicking, and game over states.
 * Refactored to be safe for Server-Side Rendering (SSR).
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private initContext() {
    if (typeof window === 'undefined') return;
    
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  playPop(size: number = 1) {
    if (!this.enabled || typeof window === 'undefined') return;
    this.initContext();
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = 400 + (size * 20);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  playClick() {
    if (!this.enabled || typeof window === 'undefined') return;
    this.initContext();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  playGameOver() {
    if (!this.enabled || typeof window === 'undefined') return;
    this.initContext();
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const frequencies = [300, 250, 200, 150];
    
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.5);
    });
  }
}

export const soundManager = new SoundManager();
