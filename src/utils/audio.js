// Web Audio API Synthesizer & Generative Soundscapes Engine v2.0
// High-Fidelity offline soundscapes: Fire, River, Rain, Ocean, Forest, Wind, Desert Night,
// Generative Ambient Piano, Mystic Hang Drum, Acoustic Guitar, Kalimba/Chimes, 528Hz, 432Hz Alpha, Brown Noise

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.ambientNodes = {};
    this.sequencerTimers = {};
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play tap / checkmark
  playTap() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(850, t + 0.05);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    } catch (_) {}
  }

  playCheckmark() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, t + 0.12); // G5
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.24);
    } catch (_) {}
  }

  playMessageChime() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, t);
      gain1.gain.setValueAtTime(0.18, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.26);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, t + 0.08);
      gain2.gain.setValueAtTime(0.22, t + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.08);
      osc2.stop(t + 0.42);
    } catch (_) {}
  }

  playLevelUp() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = t + i * 0.1;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);
        gain.gain.setValueAtTime(0.2, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.5);
      });
    } catch (_) {}
  }

  playMeditationBowl() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // 528 Hz Healing Bowl with overtones
      const partials = [
        { freq: 528, gain: 0.3, decay: 5.0 },
        { freq: 528 * 2.008, gain: 0.14, decay: 4.0 },
        { freq: 528 * 0.5, gain: 0.18, decay: 4.5 },
        { freq: 528 * 3.015, gain: 0.06, decay: 3.0 }
      ];

      partials.forEach(p => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(p.freq, t);
        g.gain.setValueAtTime(p.gain, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + p.decay);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + p.decay + 0.1);
      });
    } catch (_) {}
  }

  // Celestial Divine Golden Chime & Solfeggio Harp
  playDivineChime() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // Sacred Solfeggio & Harmonic Scale: 432Hz, 528Hz, 639Hz, 852Hz, 1056Hz
      const notes = [432, 528, 639, 852, 1056];
      notes.forEach((freq, idx) => {
        const noteTime = t + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);
        gain.gain.setValueAtTime(0.12 / (idx + 1), noteTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 2.5);
      });
    } catch (_) {}
  }

  // Deep Theta Brainwave (6Hz binaural beat on 432Hz Carrier) for Subconscious Reprogramming
  playThetaPulse() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      
      // Carrier 432Hz + Left 432Hz, Right 438Hz (6Hz Theta difference)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const g1 = this.ctx.createGain();
      const g2 = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(432, t);
      g1.gain.setValueAtTime(0.1, t);
      g1.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(438, t); // 6 Hz Theta differential
      g2.gain.setValueAtTime(0.1, t);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);

      osc1.connect(g1);
      osc2.connect(g2);
      g1.connect(this.ctx.destination);
      g2.connect(this.ctx.destination);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 3.6);
      osc2.stop(t + 3.6);
    } catch (_) {}
  }

  // Subconscious Repetition Bell (639Hz Heart & Connection Frequency)
  playSubliminalTone() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(639, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.0);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 2.1);
    } catch (_) {}
  }

  // Continuous Subconscious Atmosphere Drone System
  activeAtmosphereNodes = null;
  atmosphereGainNode = null;

  startAtmosphereDrone(type = 'theta', volume = 0.25) {
    this.stopAtmosphereDrone();
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, t);
      masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), t + 1.2);
      masterGain.connect(this.ctx.destination);
      this.atmosphereGainNode = masterGain;

      const nodes = [];

      if (type === 'theta') {
        // 432Hz Carrier with 6Hz binaural theta difference + soft warm filter
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const g1 = this.ctx.createGain();
        const g2 = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(432, t);
        g1.gain.setValueAtTime(0.4, t);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(438, t); // 6Hz Theta beat
        g2.gain.setValueAtTime(0.4, t);

        // Low pass filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, t);

        osc1.connect(g1);
        osc2.connect(g2);
        g1.connect(filter);
        g2.connect(filter);
        filter.connect(masterGain);

        osc1.start(t);
        osc2.start(t);
        nodes.push(osc1, osc2);
      } else if (type === 'solfeggio528') {
        // 528Hz Solfeggio Miracle Frequency with soft subharmonic
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const g1 = this.ctx.createGain();
        const g2 = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(528, t);
        g1.gain.setValueAtTime(0.35, t);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(264, t);
        g2.gain.setValueAtTime(0.25, t);

        osc1.connect(g1);
        osc2.connect(g2);
        g1.connect(masterGain);
        g2.connect(masterGain);

        osc1.start(t);
        osc2.start(t);
        nodes.push(osc1, osc2);
      } else if (type === 'rain') {
        // Pink noise generator for gentle soothing rainfall
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
          b6 = white * 0.115926;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, t);

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start(t);
        nodes.push(whiteNoise);
      } else if (type === 'tibetan') {
        // Resonant Tibetan Bowl multi-harmonic drone
        const freqs = [216, 432, 648, 864];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(0.2 / (idx + 1), t);
          osc.connect(g);
          g.connect(masterGain);
          osc.start(t);
          nodes.push(osc);
        });
      }

      this.activeAtmosphereNodes = nodes;
    } catch (_) {}
  }

  setAtmosphereVolume(volume) {
    if (this.atmosphereGainNode && this.ctx) {
      try {
        const t = this.ctx.currentTime;
        this.atmosphereGainNode.gain.cancelScheduledValues(t);
        this.atmosphereGainNode.gain.setValueAtTime(Math.max(0.0001, volume), t);
      } catch (_) {}
    }
  }

  stopAtmosphereDrone() {
    if (this.activeAtmosphereNodes && this.ctx) {
      try {
        const t = this.ctx.currentTime;
        if (this.atmosphereGainNode) {
          this.atmosphereGainNode.gain.setValueAtTime(this.atmosphereGainNode.gain.value, t);
          this.atmosphereGainNode.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        }
        setTimeout(() => {
          if (this.activeAtmosphereNodes) {
            this.activeAtmosphereNodes.forEach(node => {
              try { node.stop(); node.disconnect(); } catch (_) {}
            });
            this.activeAtmosphereNodes = null;
          }
        }, 550);
      } catch (_) {
        this.activeAtmosphereNodes = null;
      }
    }
  }

  // Athletic whistle sound
  playWhistle() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, t);
      osc.frequency.linearRampToValueAtTime(2900, t + 0.08);
      osc.frequency.linearRampToValueAtTime(2600, t + 0.22);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.26);
    } catch (_) {}
  }

  // Countdown pip (3, 2, 1, GO!)
  playCountdownPip(isFinal = false) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isFinal ? 880 : 440, t);
      gain.gain.setValueAtTime(isFinal ? 0.22 : 0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (isFinal ? 0.35 : 0.12));
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + (isFinal ? 0.36 : 0.14));
    } catch (_) {}
  }

  // Alarm buzzer & reminder chime
  playAlarm() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [0, 0.14, 0.28].forEach((offset) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, t + offset);
        osc.frequency.exponentialRampToValueAtTime(660, t + offset + 0.09);
        gain.gain.setValueAtTime(0.2, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.11);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + 0.12);
      });
    } catch (_) {}
  }

  // Trash / Delete / Checker Hit sound
  playTrash() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.14);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    } catch (_) {}
  }

  // Water Drop / Hydration sound
  playWaterDrop() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(1650, t + 0.09);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.13);
    } catch (_) {}
  }

  // Dice roll sound
  playDiceRoll() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [0, 0.05, 0.11, 0.17, 0.24].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const freq = 300 + Math.random() * 400;
        osc.frequency.setValueAtTime(freq, t + offset);
        gain.gain.setValueAtTime(0.12 - idx * 0.015, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + 0.05);
      });
    } catch (_) {}
  }

  // Card flip / paper sound
  playCardFlip() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.06);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (_) {}
  }

  // Subtle click
  playClick() {
    this.playTap();
  }

  // Error buzz
  playError() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [0, 0.12].forEach((offset) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, t + offset);
        gain.gain.setValueAtTime(0.18, t + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + offset);
        osc.stop(t + offset + 0.1);
      });
    } catch (_) {}
  }

  // Aliases for ambient sound management
  startAmbientSound(trackName, volume = 0.5) {
    const aliasMap = {
      alpha: 'binaural',
      theta: 'binaural',
      delta: 'binaural',
      gamma: 'binaural',
      hz528: 'binaural',
      hz432: 'binaural',
      nature: 'forest',
      water: 'river',
      fire: 'fire',
      rain: 'rain',
      ocean: 'ocean',
      wind: 'wind',
      crickets: 'crickets',
      brown: 'brown',
      piano: 'piano',
      hangdrum: 'hangdrum',
      guitar: 'guitar',
      kalimba: 'kalimba'
    };
    const resolved = aliasMap[trackName] || trackName || 'binaural';
    this.setAmbientTrack(resolved, volume);
  }

  stopAmbientSound(trackName) {
    if (!trackName) {
      this.stopAllAmbient();
      return;
    }
    const aliasMap = {
      alpha: 'binaural',
      theta: 'binaural',
      delta: 'binaural',
      gamma: 'binaural',
      hz528: 'binaural',
      hz432: 'binaural',
      nature: 'forest',
      water: 'river',
      fire: 'fire',
      rain: 'rain',
      ocean: 'ocean',
      wind: 'wind',
      crickets: 'crickets',
      brown: 'brown',
      piano: 'piano',
      hangdrum: 'hangdrum',
      guitar: 'guitar',
      kalimba: 'kalimba'
    };
    const resolved = aliasMap[trackName] || trackName;
    this.stopAmbientTrack(resolved);
  }

  // --- AMBIENT SOUND GENERATORS ---

  createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  createPinkNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
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
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  setAmbientTrack(trackName, volume = 0.5) {
    this.init();
    if (!this.ctx) return;

    if (volume <= 0 || this.isMuted) {
      this.stopAmbientTrack(trackName);
      return;
    }

    if (this.ambientNodes[trackName]) {
      const { masterGain } = this.ambientNodes[trackName];
      masterGain.gain.setTargetAtTime(volume * 0.45, this.ctx.currentTime, 0.2);
      return;
    }

    try {
      const t = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, t);
      masterGain.gain.setTargetAtTime(volume * 0.45, t, 0.3);
      masterGain.connect(this.ctx.destination);

      const sourceNodes = [];
      const timers = [];

      // 1. FIRE (صدای آتش هیزمی و شومینه با پاپ‌های تصادفی)
      if (trackName === 'fire') {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createPinkNoiseBuffer();
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(750, t);
        filter.Q.setValueAtTime(1.8, t);

        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(0.35, t);

        noise.connect(filter);
        filter.connect(subGain);
        subGain.connect(masterGain);
        noise.start(t);
        sourceNodes.push(noise);

        // Crackling sparks generator
        const popTimer = setInterval(() => {
          if (!this.ctx || !this.ambientNodes['fire']) return;
          const popTime = this.ctx.currentTime;
          const popOsc = this.ctx.createOscillator();
          const popGain = this.ctx.createGain();
          popOsc.type = 'triangle';
          popOsc.frequency.setValueAtTime(Math.random() * 800 + 400, popTime);
          popGain.gain.setValueAtTime(Math.random() * 0.3 + 0.1, popTime);
          popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.04);
          popOsc.connect(popGain);
          popGain.connect(masterGain);
          popOsc.start(popTime);
          popOsc.stop(popTime + 0.05);
        }, 180);
        timers.push(popTimer);
      }

      // 2. RIVER (صدای رودخانه و چشمه جاری با حباب‌های آب)
      else if (trackName === 'river') {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createPinkNoiseBuffer();
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, t);

        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.4, t);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(450, t);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start(t);

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start(t);
        sourceNodes.push(noise, lfo);

        // Water droplet bubble texture
        const bubbleTimer = setInterval(() => {
          if (!this.ctx || !this.ambientNodes['river']) return;
          const bTime = this.ctx.currentTime;
          const bOsc = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          bOsc.type = 'sine';
          const freq = Math.random() * 500 + 700;
          bOsc.frequency.setValueAtTime(freq, bTime);
          bOsc.frequency.exponentialRampToValueAtTime(freq * 1.6, bTime + 0.08);
          bGain.gain.setValueAtTime(0.08, bTime);
          bGain.gain.exponentialRampToValueAtTime(0.001, bTime + 0.09);
          bOsc.connect(bGain);
          bGain.connect(masterGain);
          bOsc.start(bTime);
          bOsc.stop(bTime + 0.1);
        }, 400);
        timers.push(bubbleTimer);
      }

      // 3. PIANO (پیانو آرام و لوفای ژنراتیو در گام رمینور پنتاکلاسیک)
      else if (trackName === 'piano') {
        const pianoScale = [293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 698.46, 880.00]; // D4 to A5
        let noteIdx = 0;

        const playPianoNote = () => {
          if (!this.ctx || !this.ambientNodes['piano']) return;
          const pTime = this.ctx.currentTime;
          const freq = pianoScale[Math.floor(Math.random() * pianoScale.length)];

          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const pGain = this.ctx.createGain();
          const pFilter = this.ctx.createBiquadFilter();

          osc1.type = 'sine';
          osc2.type = 'triangle';
          osc1.frequency.setValueAtTime(freq, pTime);
          osc2.frequency.setValueAtTime(freq * 1.002, pTime); // slight chorus

          pFilter.type = 'lowpass';
          pFilter.frequency.setValueAtTime(1400, pTime);

          pGain.gain.setValueAtTime(0.001, pTime);
          pGain.gain.linearRampToValueAtTime(0.35, pTime + 0.03); // Felt piano attack
          pGain.gain.exponentialRampToValueAtTime(0.0001, pTime + 3.2); // Warm resonance

          osc1.connect(pFilter);
          osc2.connect(pFilter);
          pFilter.connect(pGain);
          pGain.connect(masterGain);

          osc1.start(pTime);
          osc2.start(pTime);
          osc1.stop(pTime + 3.3);
          osc2.stop(pTime + 3.3);
        };

        playPianoNote();
        const pianoTimer = setInterval(playPianoNote, 2200);
        timers.push(pianoTimer);
      }

      // 4. HANG DRUM (هنگ‌درام عرفانی Handpan D Kurd Scale)
      else if (trackName === 'hangdrum') {
        const hangNotes = [146.83, 220.00, 233.08, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00]; // D3 Ding, A3, Bb3, C4, D4, E4, F4, G4, A4
        let step = 0;

        const playHangNote = () => {
          if (!this.ctx || !this.ambientNodes['hangdrum']) return;
          const hTime = this.ctx.currentTime;
          const freq = hangNotes[step % hangNotes.length];
          step = (step + Math.floor(Math.random() * 3 + 1)) % hangNotes.length;

          // Fundamental + Metallic overtones (2.76x and 5.4x)
          const oscFundamental = this.ctx.createOscillator();
          const oscOvertone = this.ctx.createOscillator();
          const hGain = this.ctx.createGain();

          oscFundamental.type = 'sine';
          oscOvertone.type = 'sine';

          oscFundamental.frequency.setValueAtTime(freq, hTime);
          oscOvertone.frequency.setValueAtTime(freq * 2.76, hTime);

          hGain.gain.setValueAtTime(0.001, hTime);
          hGain.gain.linearRampToValueAtTime(0.4, hTime + 0.015);
          hGain.gain.exponentialRampToValueAtTime(0.0001, hTime + 2.8);

          oscFundamental.connect(hGain);
          oscOvertone.connect(hGain);
          hGain.connect(masterGain);

          oscFundamental.start(hTime);
          oscOvertone.start(hTime);
          oscFundamental.stop(hTime + 2.9);
          oscOvertone.stop(hTime + 2.9);
        };

        playHangNote();
        const hangTimer = setInterval(playHangNote, 1700);
        timers.push(hangTimer);
      }

      // 5. GUITAR (گیتار آکوستیک آرپژ ملایم)
      else if (trackName === 'guitar') {
        const guitarChords = [
          [220.00, 261.63, 329.63, 440.00], // Am
          [174.61, 261.63, 329.63, 440.00], // Fmaj7
          [261.63, 329.63, 392.00, 523.25], // C
          [196.00, 246.94, 293.66, 392.00]  // G
        ];
        let chordIndex = 0;

        const playGuitarArpeggio = () => {
          if (!this.ctx || !this.ambientNodes['guitar']) return;
          const chord = guitarChords[chordIndex % guitarChords.length];
          chordIndex++;

          chord.forEach((freq, stringIdx) => {
            const strTime = this.ctx.currentTime + stringIdx * 0.35;
            const osc = this.ctx.createOscillator();
            const gGain = this.ctx.createGain();
            const gFilter = this.ctx.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, strTime);

            gFilter.type = 'lowpass';
            gFilter.frequency.setValueAtTime(2200, strTime);
            gFilter.frequency.exponentialRampToValueAtTime(600, strTime + 1.2);

            gGain.gain.setValueAtTime(0.001, strTime);
            gGain.gain.linearRampToValueAtTime(0.28, strTime + 0.015);
            gGain.gain.exponentialRampToValueAtTime(0.0001, strTime + 2.0);

            osc.connect(gFilter);
            gFilter.connect(gGain);
            gGain.connect(masterGain);

            osc.start(strTime);
            osc.stop(strTime + 2.1);
          });
        };

        playGuitarArpeggio();
        const guitarTimer = setInterval(playGuitarArpeggio, 3200);
        timers.push(guitarTimer);
      }

      // 6. KALIMBA & WIND CHIMES (کالیمبا و زنگوله نسیم)
      else if (trackName === 'kalimba') {
        const kalimbaNotes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.5, 1567.98]; // C5 to G6
        const playKalimba = () => {
          if (!this.ctx || !this.ambientNodes['kalimba']) return;
          const kTime = this.ctx.currentTime;
          const freq = kalimbaNotes[Math.floor(Math.random() * kalimbaNotes.length)];
          const osc = this.ctx.createOscillator();
          const kGain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, kTime);
          kGain.gain.setValueAtTime(0.3, kTime);
          kGain.gain.exponentialRampToValueAtTime(0.0001, kTime + 2.4);

          osc.connect(kGain);
          kGain.connect(masterGain);
          osc.start(kTime);
          osc.stop(kTime + 2.5);
        };

        playKalimba();
        const kalimbaTimer = setInterval(playKalimba, 1100);
        timers.push(kalimbaTimer);
      }

      // 7. DESERT NIGHT & CRICKETS (شب کویر و جیرجیرک‌ها)
      else if (trackName === 'crickets') {
        const osc = this.ctx.createOscillator();
        const mod = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const crkGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(4600, t);

        mod.type = 'square';
        mod.frequency.setValueAtTime(36, t); // Chirp modulation speed
        modGain.gain.setValueAtTime(0.5, t);

        mod.connect(modGain);
        modGain.connect(osc.frequency);
        mod.start(t);

        crkGain.gain.setValueAtTime(0.18, t);
        osc.connect(crkGain);
        crkGain.connect(masterGain);
        osc.start(t);
        sourceNodes.push(osc, mod);
      }

      // 8. RAIN (باران ملایم)
      else if (trackName === 'rain') {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();
        noise.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, t);
        noise.connect(filter);
        filter.connect(masterGain);
        noise.start(t);
        sourceNodes.push(noise);
      }

      // 9. OCEAN (امواج اقیانوس آرام)
      else if (trackName === 'ocean') {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();
        noise.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, t);
        filter.Q.setValueAtTime(2, t);

        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.12, t);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(300, t);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start(t);

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start(t);
        sourceNodes.push(noise, lfo);
      }

      // 10. FOREST (آوای جنگل و پرندگان)
      else if (trackName === 'forest') {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2600, t);

        const lfo = this.ctx.createOscillator();
        lfo.type = 'triangle';
        lfo.frequency.setValueAtTime(3.5, t);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(700, t);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(t);

        osc.connect(masterGain);
        osc.start(t);
        sourceNodes.push(osc, lfo);
      }

      // 11. WIND (نسیم و باد ملایم کوهستان)
      else if (trackName === 'wind') {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();
        noise.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, t);
        filter.Q.setValueAtTime(3.5, t);

        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.18, t);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(160, t);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start(t);

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start(t);
        sourceNodes.push(noise, lfo);
      }

      // 12. BINAURAL 432Hz (امواج آلفا و تمرکز عمیق)
      else if (trackName === 'binaural') {
        const oscL = this.ctx.createOscillator();
        const oscR = this.ctx.createOscillator();
        oscL.type = 'sine';
        oscR.type = 'sine';
        oscL.frequency.setValueAtTime(432, t);
        oscR.frequency.setValueAtTime(442, t); // 10Hz Alpha beat
        oscL.connect(masterGain);
        oscR.connect(masterGain);
        oscL.start(t);
        oscR.start(t);
        sourceNodes.push(oscL, oscR);
      }

      // 13. BROWN NOISE (نویز قهوه‌ای تمرکز فوق‌العاده)
      else if (trackName === 'brown') {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, t);

        noise.connect(filter);
        filter.connect(masterGain);
        noise.start(t);
        sourceNodes.push(noise);
      }

      this.ambientNodes[trackName] = { masterGain, sourceNodes, timers };
    } catch (e) {
      console.warn('Failed to start ambient track:', e);
    }
  }

  stopAmbientTrack(trackName) {
    if (this.ambientNodes[trackName]) {
      const { masterGain, sourceNodes, timers } = this.ambientNodes[trackName];
      if (this.ctx) {
        masterGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.15);
      }

      if (timers && timers.length > 0) {
        timers.forEach(t => clearInterval(t));
      }

      setTimeout(() => {
        sourceNodes.forEach((node) => {
          try {
            node.stop();
            node.disconnect();
          } catch (_) {}
        });
        masterGain.disconnect();
        delete this.ambientNodes[trackName];
      }, 200);
    }
  }

  stopAllAmbient() {
    Object.keys(this.ambientNodes).forEach((track) => this.stopAmbientTrack(track));
  }
}

export const soundEngine = new SoundEngine();
export default soundEngine;
