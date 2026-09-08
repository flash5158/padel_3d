/**
 * GRAND SLAM TENNIS 3D - PRO TOUR EDITION
 * High-Performance Three.js Tennis Engine
 * Open Grand Slam Hard Court, Strung Tennis Rackets, Official Tennis Rules,
 * 1st & 2nd Serve System, Continuous Collision Detection (CCD), Zero-Allocation Loops,
 * P2P WebRTC Multiplayer & Realistic Audio Synthesizer.
 */

// --- Web Audio Synthesizer (Tennis Acoustic Model) ---
class TennisAudioPro {
  constructor() {
    this.ctx = null;
    this.musicEnabled = true;
    try {
      const savedMusic = localStorage.getItem('padel_music_enabled');
      if (savedMusic !== null) this.musicEnabled = (savedMusic === 'true');
    } catch (e) {}
    this.musicGain = null;
    this.musicPlaying = false;
    this.musicTimer = null;
    this.stepIndex = 0;
    this.nextStepTime = 0;
    this.bpm = 124;
    this.stepDuration = 60 / 124 / 4; // 16th note = 0.12096s
  }

  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.updateMusicUI();

    if (!this._unlocked) {
      this._unlocked = true;
      const unlock = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
    }
  }

  ensureAudio() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Professional Acoustic Racket Strike (Sub-Bass Body Thump + Carbon Frame Resonance + String Snap)
  playHit(power = 1.0, isSmash = false, isSweetSpot = false) {
    this.ensureAudio();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // 1. SUB-BASS BODY PUNCH (40 Hz - 140 Hz) - Gives tangible acoustic weight
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    const subStart = isSmash ? 145 : (isSweetSpot ? 125 : 105);
    const subEnd = isSmash ? 32 : 40;
    const subDur = isSmash ? 0.16 : 0.10;
    subOsc.frequency.setValueAtTime(subStart, t);
    subOsc.frequency.exponentialRampToValueAtTime(subEnd, t + subDur);
    subGain.gain.setValueAtTime(1.2 * Math.min(1.5, power), t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + subDur);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + subDur);

    // 2. GRAPHITE / CARBON FRAME RESONANCE (850 Hz - 1100 Hz, Q 4.2)
    const frameOsc = this.ctx.createOscillator();
    const frameFilter = this.ctx.createBiquadFilter();
    const frameGain = this.ctx.createGain();
    frameOsc.type = 'triangle';
    frameOsc.frequency.setValueAtTime(isSmash ? 980 : (isSweetSpot ? 920 : 840), t);
    frameOsc.frequency.exponentialRampToValueAtTime(160, t + 0.08);
    frameFilter.type = 'bandpass';
    frameFilter.frequency.value = isSmash ? 1050 : 920;
    frameFilter.Q.value = 4.2;
    frameGain.gain.setValueAtTime(0.85 * Math.min(1.4, power), t);
    frameGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    frameOsc.connect(frameFilter);
    frameFilter.connect(frameGain);
    frameGain.connect(this.ctx.destination);
    frameOsc.start(t);
    frameOsc.stop(t + 0.08);

    // 3. HIGH-TENSION POLYESTER / GUT STRING SNAP (Noise Burst)
    const bSize = Math.floor(this.ctx.sampleRate * 0.045);
    const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < bSize; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bSize * 0.22));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = b;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = isSmash ? 4400 : (isSweetSpot ? 3600 : 2800);
    noiseFilter.Q.value = 3.2;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.75 * power, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);

    // 4. CANNON SUB-HARMONIC BOOM (Smash special punch)
    if (isSmash) {
      const boomOsc = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boomOsc.type = 'sine';
      boomOsc.frequency.setValueAtTime(60, t);
      boomOsc.frequency.exponentialRampToValueAtTime(24, t + 0.22);
      boomGain.gain.setValueAtTime(1.0, t);
      boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      boomOsc.connect(boomGain);
      boomGain.connect(this.ctx.destination);
      boomOsc.start(t);
      boomOsc.stop(t + 0.22);
    }

    // 5. MOBILE PHYSICAL HAPTICS (Real in-hand strike vibration)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (isSmash) navigator.vibrate([28, 30, 50]);
        else if (isSweetSpot) navigator.vibrate([22, 28]);
        else navigator.vibrate(18);
      } catch (e) {}
    }
  }

  // Hard Court Tennis Ball Bounce (Rubber Core Compression + Felt Friction)
  playBounce(v = 1.0) {
    this.ensureAudio();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(185, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.085);

    g.gain.setValueAtTime(Math.min(0.72 * v, 0.85), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.085);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.085);
  }

  // Electronic Line-Calling "OUT!" Tone / Umpire Whistle
  playWhistle() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.setValueAtTime(2700, t + 0.07);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.22);
  }

  // Line Calling "OUT" Buzzer
  playOut() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(240, t + 0.16);
    g.gain.setValueAtTime(0.28, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.16);
  }

  // Racket Swift Air Swing
  playAirSwing() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const dur = 0.18;
    const bSize = Math.floor(this.ctx.sampleRate * dur);
    const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < bSize; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / bSize) * Math.PI);
    const noise = this.ctx.createBufferSource();
    noise.buffer = b;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(500, t);
    f.frequency.exponentialRampToValueAtTime(1100, t + 0.07);
    f.frequency.exponentialRampToValueAtTime(300, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(f); f.connect(g); g.connect(this.ctx.destination);
    noise.start(t);
  }

  // Grand Slam Stadium Crowd Cheering
  playCrowd() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const dur = 2.0;
    const bSize = Math.floor(this.ctx.sampleRate * dur);
    const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < bSize; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / bSize) * Math.PI);
    const noise = this.ctx.createBufferSource();
    noise.buffer = b;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(950, t);
    f.frequency.linearRampToValueAtTime(1900, t + 0.7);
    f.frequency.linearRampToValueAtTime(750, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.01, t);
    g.gain.linearRampToValueAtTime(0.34, t + 0.45);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(f); f.connect(g); g.connect(this.ctx.destination);
    noise.start(t);
  }

  // Tropical Beach Ocean Surf Wave (Ambiance)
  playBeachWave() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const dur = 3.5;
    const bSize = Math.floor(this.ctx.sampleRate * dur);
    const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < bSize; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / bSize) * Math.PI);
    const noise = this.ctx.createBufferSource();
    noise.buffer = b;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(320, t);
    f.frequency.linearRampToValueAtTime(650, t + 1.2);
    f.frequency.linearRampToValueAtTime(240, t + dur);
    f.Q.value = 1.2;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.01, t);
    g.gain.linearRampToValueAtTime(0.20, t + 1.2);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(f); f.connect(g); g.connect(this.ctx.destination);
    noise.start(t);
  }

  // Kyoto Zen Temple Wind Chime / Singing Bowl Bell
  playZenBell() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const freqs = [880, 1320, 1760];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      const vol = 0.12 / (idx + 1);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0005, t + 2.8 + idx * 0.4);
      osc.connect(g); g.connect(this.ctx.destination);
      osc.start(t); osc.stop(t + 3.2);
    });
  }

  // --- High-Energy Sports Synthwave / Arcade Music Engine (124 BPM) ---
  startMusic() {
    this.init();
    if (!this.ctx) return;
    if (this.musicPlaying) return;
    if (!this.musicEnabled) return;

    this.musicPlaying = true;
    this.stepIndex = 0;
    this.nextStepTime = this.ctx.currentTime + 0.05;

    if (!this.musicGain) {
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);
    } else {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 0.25);
    }

    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = setInterval(() => this.musicScheduler(), 25);
    this.updateMusicUI();
  }

  stopMusic() {
    if (!this.musicPlaying) return;
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.20);
    }
    this.updateMusicUI();
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    try {
      localStorage.setItem('padel_music_enabled', this.musicEnabled ? 'true' : 'false');
    } catch (e) {}
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    this.updateMusicUI();
    return this.musicEnabled;
  }

  updateMusicUI() {
    const hudMusicIcon = document.getElementById('hud-music-icon');
    const hudMusicText = document.getElementById('hud-music-text');
    const hudMusicBtn  = document.getElementById('btn-toggle-music');
    if (hudMusicBtn) {
      if (this.musicEnabled) {
        hudMusicBtn.classList.remove('muted');
        if (hudMusicIcon) hudMusicIcon.innerText = '🎵';
        if (hudMusicText) hudMusicText.innerText = 'MÚSICA ON';
      } else {
        hudMusicBtn.classList.add('muted');
        if (hudMusicIcon) hudMusicIcon.innerText = '🔇';
        if (hudMusicText) hudMusicText.innerText = 'MÚSICA OFF';
      }
    }
  }

  musicScheduler() {
    if (!this.ctx || !this.musicPlaying || !this.musicEnabled) return;
    // Lookahead loop
    while (this.nextStepTime < this.ctx.currentTime + 0.12) {
      this.playStep(this.stepIndex, this.nextStepTime);
      this.stepIndex = (this.stepIndex + 1) % 64;
      this.nextStepTime += this.stepDuration;
    }
  }

  playStep(step, time) {
    if (!this.ctx || !this.musicGain) return;
    const bar = Math.floor(step / 16);
    const barStep = step % 16;

    // 1. KICK DRUM: Punchy, pumping four-on-the-floor
    if (barStep % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(145, time);
      osc.frequency.exponentialRampToValueAtTime(38, time + 0.08);
      g.gain.setValueAtTime(0.72, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.085);
      osc.connect(g); g.connect(this.musicGain);
      osc.start(time); osc.stop(time + 0.085);
    }

    // 2. SNARE / CLAP: Beats 2 and 4 (barStep 4 and 12)
    if (barStep === 4 || barStep === 12) {
      const bSize = Math.floor(this.ctx.sampleRate * 0.075);
      const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < bSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bSize * 0.26));
      const noise = this.ctx.createBufferSource();
      noise.buffer = b;
      const nf = this.ctx.createBiquadFilter();
      nf.type = 'highpass';
      nf.frequency.setValueAtTime(1050, time);
      const ng = this.ctx.createGain();
      ng.gain.setValueAtTime(0.38, time);
      ng.gain.exponentialRampToValueAtTime(0.001, time + 0.075);
      noise.connect(nf); nf.connect(ng); ng.connect(this.musicGain);
      noise.start(time);

      const snOsc = this.ctx.createOscillator();
      const snG = this.ctx.createGain();
      snOsc.type = 'triangle';
      snOsc.frequency.setValueAtTime(220, time);
      snOsc.frequency.exponentialRampToValueAtTime(95, time + 0.05);
      snG.gain.setValueAtTime(0.32, time);
      snG.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      snOsc.connect(snG); snG.connect(this.musicGain);
      snOsc.start(time); snOsc.stop(time + 0.05);
    }

    // 3. HI-HATS: Offbeat Open Hats & 16th Closed Hats
    const isOpen = (barStep % 4 === 2);
    const isClosed = (barStep % 2 === 0);
    if (isOpen || isClosed) {
      const dur = isOpen ? 0.075 : 0.032;
      const bSize = Math.floor(this.ctx.sampleRate * dur);
      const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < bSize; i++) d[i] = (Math.random() * 2 - 1);
      const noise = this.ctx.createBufferSource();
      noise.buffer = b;
      const f = this.ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(8000, time);
      f.Q.value = 4.2;
      const g = this.ctx.createGain();
      const hatVol = isOpen ? 0.20 : 0.085;
      g.gain.setValueAtTime(hatVol, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + dur);
      noise.connect(f); f.connect(g); g.connect(this.musicGain);
      noise.start(time);
    }

    // 4. BASSLINE: Driving 16th-note synthwave bass groove
    const bassPatterns = [
      // Bar 0: Em (E2)
      [82.4, 82.4, 0, 82.4, 98.0, 0, 82.4, 0, 73.4, 0, 82.4, 0, 123.5, 0, 98.0, 0],
      // Bar 1: C (C2)
      [65.4, 65.4, 0, 65.4, 82.4, 0, 65.4, 0, 98.0, 0, 65.4, 0, 130.8, 0, 98.0, 0],
      // Bar 2: G (G1 / G2)
      [49.0, 49.0, 0, 49.0, 73.4, 0, 49.0, 0, 98.0, 0, 49.0, 0, 73.4, 0, 92.5, 0],
      // Bar 3: D (D2)
      [73.4, 73.4, 0, 73.4, 92.5, 0, 73.4, 0, 110.0, 0, 73.4, 0, 146.8, 0, 110.0, 0]
    ];
    const bassFreq = bassPatterns[bar][barStep];
    if (bassFreq > 0) {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassFreq, time);

      filter.type = 'lowpass';
      filter.Q.value = 5.2;
      filter.frequency.setValueAtTime(bassFreq * 4.2, time);
      filter.frequency.exponentialRampToValueAtTime(bassFreq * 1.6, time + 0.10);

      g.gain.setValueAtTime(0.36, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

      osc.connect(filter); filter.connect(g); g.connect(this.musicGain);
      osc.start(time); osc.stop(time + 0.11);
    }

    // 5. CATCHY LEAD ARPEGGIO / HOOK: Highly addictive uplifting synth melody
    const leadPatterns = [
      // Bar 0: Em
      [493.9, 659.3, 784.0, 987.8, 880.0, 784.0, 740.0, 659.3, 784.0, 493.9, 659.3, 784.0, 987.8, 1174.7, 987.8, 784.0],
      // Bar 1: C
      [523.3, 659.3, 784.0, 1046.5, 987.8, 784.0, 659.3, 784.0, 523.3, 659.3, 784.0, 1046.5, 1318.5, 1174.7, 1046.5, 987.8],
      // Bar 2: G
      [587.3, 784.0, 987.8, 1174.7, 1046.5, 987.8, 880.0, 784.0, 987.8, 587.3, 784.0, 987.8, 1174.7, 1318.5, 1174.7, 987.8],
      // Bar 3: D
      [440.0, 587.3, 740.0, 880.0, 784.0, 740.0, 659.3, 740.0, 440.0, 587.3, 740.0, 880.0, 1480.0, 1318.5, 1174.7, 1480.0]
    ];
    const leadFreq = leadPatterns[bar][barStep];
    if (leadFreq > 0) {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(leadFreq, time);
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(leadFreq * 1.002, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, time);
      filter.Q.value = 3.5;

      g.gain.setValueAtTime(0.16, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.10);

      osc1.connect(filter); osc2.connect(filter);
      filter.connect(g); g.connect(this.musicGain);

      osc1.start(time); osc2.start(time);
      osc1.stop(time + 0.10); osc2.stop(time + 0.10);
    }

    // 6. SYNTH PAD: Warm background chord sustained on the 1st step of each bar
    if (barStep === 0) {
      const chords = [
        [164.8, 196.0, 246.9, 293.7], // Em7
        [130.8, 164.8, 196.0, 246.9], // Cmaj7
        [98.0, 146.8, 196.0, 220.0],  // Gadd9
        [146.8, 185.0, 220.0, 329.6]  // Dadd9
      ];
      const chord = chords[bar];
      chord.forEach(f => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, time);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850, time);

        const dur = this.stepDuration * 16;
        g.gain.setValueAtTime(0.001, time);
        g.gain.linearRampToValueAtTime(0.038, time + 0.35);
        g.gain.exponentialRampToValueAtTime(0.001, time + dur - 0.05);

        osc.connect(filter); filter.connect(g); g.connect(this.musicGain);
        osc.start(time); osc.stop(time + dur);
      });
    }
  }
}

// Alias for backward compatibility
const PadelAudioPro = TennisAudioPro;

// --- Procedural PBR Texture Generators ---
const TextureFactory = {
  // 1. Official Tennis Ball (Optic Yellow Felt + Iconic Curved White Seams)
  createBallTextures() {
    const size = 512;
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = colorCanvas.height = size;
    const cCtx = colorCanvas.getContext('2d');

    // Optic Yellow Base
    cCtx.fillStyle = '#d4fc02';
    cCtx.fillRect(0, 0, size, size);

    // Fuzzy felt fiber noise
    for (let i = 0; i < 45000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      cCtx.fillStyle = Math.random() > 0.5 ? '#bde500' : '#e4ff33';
      cCtx.fillRect(x, y, 2, 2);
    }

    // Classic Curved White Tennis Seams
    cCtx.strokeStyle = '#ffffff';
    cCtx.lineWidth = 15;
    cCtx.lineCap = 'round';
    cCtx.beginPath();
    for (let x = 0; x <= size; x += 4) {
      const y1 = size * 0.25 + Math.sin((x / size) * Math.PI * 2) * (size * 0.18);
      if (x === 0) { cCtx.moveTo(x, y1); } else { cCtx.lineTo(x, y1); }
    }
    cCtx.stroke();

    cCtx.beginPath();
    for (let x = 0; x <= size; x += 4) {
      const y2 = size * 0.75 + Math.sin((x / size) * Math.PI * 2 + Math.PI) * (size * 0.18);
      if (x === 0) { cCtx.moveTo(x, y2); } else { cCtx.lineTo(x, y2); }
    }
    cCtx.stroke();

    const colorTex = new THREE.CanvasTexture(colorCanvas);

    // Ball Bump Map (Grooved Seam and Felt Texture)
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext('2d');
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, size, size);

    for (let i = 0; i < 35000; i++) {
      bCtx.fillStyle = Math.random() > 0.5 ? '#999999' : '#666666';
      bCtx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
    }

    bCtx.strokeStyle = '#222222';
    bCtx.lineWidth = 15;
    bCtx.beginPath();
    for (let x = 0; x <= size; x += 4) {
      const y1 = size * 0.25 + Math.sin((x / size) * Math.PI * 2) * (size * 0.18);
      if (x === 0) { bCtx.moveTo(x, y1); } else { bCtx.lineTo(x, y1); }
    }
    bCtx.stroke();

    bCtx.beginPath();
    for (let x = 0; x <= size; x += 4) {
      const y2 = size * 0.75 + Math.sin((x / size) * Math.PI * 2 + Math.PI) * (size * 0.18);
      if (x === 0) { bCtx.moveTo(x, y2); } else { bCtx.lineTo(x, y2); }
    }
    bCtx.stroke();

    const bumpTex = new THREE.CanvasTexture(bumpCanvas);
    return { colorTex, bumpTex };
  },

  // 2. High-Tension Strung Tennis Racket Grid with Stencil Logo
  createRacketFaceTexture(accentHex) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Transparent Background (Open Strings)
    ctx.clearRect(0, 0, size, size);

    // Cross-Strung String Bed (Mains & Crosses)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.lineWidth = 3;

    // Vertical Strings (Mains)
    for (let x = 60; x <= size - 60; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, 50);
      ctx.lineTo(x, size - 50);
      ctx.stroke();
    }

    // Horizontal Strings (Crosses)
    for (let y = 60; y <= size - 60; y += 22) {
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(size - 50, y);
      ctx.stroke();
    }

    // Pro Tournament String Stencil Logo (Custom [W] / Chevron)
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(size * 0.32, size * 0.38);
    ctx.lineTo(size * 0.41, size * 0.62);
    ctx.lineTo(size * 0.50, size * 0.44);
    ctx.lineTo(size * 0.59, size * 0.62);
    ctx.lineTo(size * 0.68, size * 0.38);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  },

  // 3. Official Grand Slam Hard Court (DecoTurf Australian / US Open Blue with EA SPORTS Stencils)
  createTurfTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // Outer Court: Deep Tournament US Open Forest Green
    ctx.fillStyle = '#0a3d2c';
    ctx.fillRect(0, 0, 1024, 2048);

    // Mown strip contrast bands in perimeter
    for (let y = 0; y < 2048; y += 128) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.fillRect(0, y, 1024, 64);
    }

    // Coordinate Mapping (Tennis Court: Length 23.77m, Width 10.97m)
    const scaleX = 1024 / 16.0;
    const scaleY = 2048 / 30.0;
    const toCanvasX = (x) => 512 + x * scaleX;
    const toCanvasY = (z) => 1024 + z * scaleY;

    // Inner Court Rectangle (DecoTurf Electric Royal Blue)
    const doublesW = 5.485;
    const courtHalfL = 11.885;

    const xL = toCanvasX(-doublesW);
    const xR = toCanvasX(doublesW);
    const yT = toCanvasY(-courtHalfL);
    const yB = toCanvasY(courtHalfL);

    ctx.fillStyle = '#144ec2';
    ctx.fillRect(xL, yT, xR - xL, yB - yT);

    // Micro Acrylic Surface Grit Texture (high density stipple)
    for (let i = 0; i < 150000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
      ctx.fillRect(Math.random() * 1024, Math.random() * 2048, 2, 2);
    }

    // Subtle Expansion Seams in Acrylic Layer
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.lineWidth = 2;
    for (let y = yT + 120; y < yB; y += 180) {
      ctx.beginPath(); ctx.moveTo(xL, y); ctx.lineTo(xR, y); ctx.stroke();
    }

    // Baseline Athletic Rubber Skid Marks (where pro athletes slide & pivot)
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    [-1, 1].forEach(side => {
      const baseZ = side < 0 ? yT + 25 : yB - 25;
      for (let s = -180; s <= 180; s += 60) {
        ctx.beginPath();
        ctx.arc(512 + s, baseZ, 35 + Math.abs(s) * 0.08, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();
      }
    });

    // Official EA SPORTS & Tournament Stencil Markings
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = '900 34px sans-serif';
    ctx.textAlign = 'center';
    // North baseline text
    ctx.save();
    ctx.translate(512, yT - 46);
    ctx.rotate(Math.PI);
    ctx.fillText('• EA SPORTS™ GRAND SLAM PRO TOUR •', 0, 0);
    ctx.restore();
    // South baseline text
    ctx.fillText('• EA SPORTS™ GRAND SLAM PRO TOUR •', 512, yB + 62);

    // Center Court EA SPORTS Crest
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(512, 1024, 155, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
    ctx.font = '900 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EA SPORTS™', 512, 1012);
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('GRAND SLAM OPEN', 512, 1046);

    // Regulation White Chalk Lines with Beveled Edge
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.lineCap = 'square';

    // 1. Doubles Perimeter Baseline & Sidelines
    ctx.strokeRect(xL, yT, xR - xL, yB - yT);

    // 2. Singles Sidelines (8.23m total -> +/-4.115m)
    const singlesW = 4.115;
    const sL = toCanvasX(-singlesW);
    const sR = toCanvasX(singlesW);

    ctx.beginPath();
    ctx.moveTo(sL, yT); ctx.lineTo(sL, yB);
    ctx.moveTo(sR, yT); ctx.lineTo(sR, yB);
    ctx.stroke();

    // 3. Service Lines (6.40m from net)
    const sZ = 6.40;
    const yS1 = toCanvasY(-sZ);
    const yS2 = toCanvasY(sZ);

    ctx.beginPath();
    ctx.moveTo(sL, yS1); ctx.lineTo(sR, yS1);
    ctx.moveTo(sL, yS2); ctx.lineTo(sR, yS2);
    ctx.stroke();

    // 4. Center Service Line (From -6.40m to +6.40m)
    ctx.beginPath();
    ctx.moveTo(512, yS1); ctx.lineTo(512, yS2);
    ctx.stroke();

    // 5. Baseline Center Marks (0.10m ticks on baselines)
    const tickLen = 0.15 * scaleY;
    ctx.beginPath();
    ctx.moveTo(512, yT); ctx.lineTo(512, yT + tickLen);
    ctx.moveTo(512, yB); ctx.lineTo(512, yB - tickLen);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  },

  // Normal Map for Hard Court (Fine Acrylic Stipple & Raised Painted Chalk Line Relief)
  createTurfNormalMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base Normal (0.5, 0.5, 1.0) in RGB
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, 512, 1024);

    // High frequency micro-grit normal perturbations
    for (let i = 0; i < 40000; i++) {
      const nx = 120 + Math.floor(Math.random() * 18);
      const ny = 120 + Math.floor(Math.random() * 18);
      ctx.fillStyle = `rgb(${nx}, ${ny}, 255)`;
      ctx.fillRect(Math.random() * 512, Math.random() * 1024, 2, 2);
    }

    const scaleX = 512 / 16.0;
    const scaleY = 1024 / 30.0;
    const toCanvasX = (x) => 256 + x * scaleX;
    const toCanvasY = (z) => 512 + z * scaleY;

    const doublesW = 5.485;
    const courtHalfL = 11.885;
    const xL = toCanvasX(-doublesW);
    const xR = toCanvasX(doublesW);
    const yT = toCanvasY(-courtHalfL);
    const yB = toCanvasY(courtHalfL);

    // Embossed edge on regulation lines
    ctx.strokeStyle = '#9090ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(xL, yT, xR - xL, yB - yT);

    const singlesW = 4.115;
    const sL = toCanvasX(-singlesW);
    const sR = toCanvasX(singlesW);
    ctx.beginPath();
    ctx.moveTo(sL, yT); ctx.lineTo(sL, yB);
    ctx.moveTo(sR, yT); ctx.lineTo(sR, yB);
    ctx.stroke();

    const sZ = 6.40;
    const yS1 = toCanvasY(-sZ);
    const yS2 = toCanvasY(sZ);
    ctx.beginPath();
    ctx.moveTo(sL, yS1); ctx.lineTo(sR, yS1);
    ctx.moveTo(sL, yS2); ctx.lineTo(sR, yS2);
    ctx.moveTo(256, yS1); ctx.lineTo(256, yS2);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
  },

  // Roughness Map for Hard Court (Contrast between rough acrylic and smooth satin painted chalk lines)
  createTurfRoughnessMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base rough acrylic surface (~0.76 roughness -> 195 gray)
    ctx.fillStyle = 'rgb(195, 195, 195)';
    ctx.fillRect(0, 0, 512, 1024);

    const scaleX = 512 / 16.0;
    const scaleY = 1024 / 30.0;
    const toCanvasX = (x) => 256 + x * scaleX;
    const toCanvasY = (z) => 512 + z * scaleY;

    const doublesW = 5.485;
    const courtHalfL = 11.885;
    const xL = toCanvasX(-doublesW);
    const xR = toCanvasX(doublesW);
    const yT = toCanvasY(-courtHalfL);
    const yB = toCanvasY(courtHalfL);

    // Lines are smooth satin chalk paint (~0.35 roughness -> 90 gray)
    ctx.strokeStyle = 'rgb(90, 90, 90)';
    ctx.lineWidth = 4;
    ctx.strokeRect(xL, yT, xR - xL, yB - yT);

    const singlesW = 4.115;
    const sL = toCanvasX(-singlesW);
    const sR = toCanvasX(singlesW);
    ctx.beginPath();
    ctx.moveTo(sL, yT); ctx.lineTo(sL, yB);
    ctx.moveTo(sR, yT); ctx.lineTo(sR, yB);
    ctx.stroke();

    const sZ = 6.40;
    const yS1 = toCanvasY(-sZ);
    const yS2 = toCanvasY(sZ);
    ctx.beginPath();
    ctx.moveTo(sL, yS1); ctx.lineTo(sR, yS1);
    ctx.moveTo(sL, yS2); ctx.lineTo(sR, yS2);
    ctx.moveTo(256, yS1); ctx.lineTo(256, yS2);
    ctx.stroke();

    // Baseline rubber skid marks (smoother polished sheen)
    ctx.strokeStyle = 'rgb(65, 65, 65)';
    ctx.lineWidth = 6;
    [-1, 1].forEach(side => {
      const baseZ = side < 0 ? yT + 12 : yB - 12;
      for (let s = -90; s <= 90; s += 30) {
        ctx.beginPath();
        ctx.arc(256 + s, baseZ, 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
  },

  // Sand Ripple Micro-Normal Map for Beach Paraíso
  createBeachSandNormalMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(512, 512);
    const data = imgData.data;
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        const grain = (Math.random() - 0.5) * 0.20;
        const nx = Math.floor(128 + Math.cos(x * 0.10) * 32 + grain * 38);
        const ny = Math.floor(128 + Math.sin(y * 0.08) * 24 + grain * 38);
        data[idx] = THREE.MathUtils.clamp(nx, 0, 255);
        data[idx + 1] = THREE.MathUtils.clamp(ny, 0, 255);
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 10);
    return tex;
  },

  // Flagstone Paver Normal Map for Zen Temple Court
  createZenStoneNormalMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(512, 512);
    const data = imgData.data;
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        const seamX = (x % 64 < 3 || x % 64 > 61) ? -42 : 0;
        const seamY = (y % 64 < 3 || y % 64 > 61) ? -42 : 0;
        const noise = (Math.random() - 0.5) * 22;
        data[idx] = THREE.MathUtils.clamp(Math.floor(128 + seamX + noise), 0, 255);
        data[idx + 1] = THREE.MathUtils.clamp(Math.floor(128 + seamY + noise), 0, 255);
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 8);
    return tex;
  },

  // Grass Blade / Striped Turf Normal Map for White House South Lawn
  createWhiteHouseGrassNormalMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(512, 512);
    const data = imgData.data;
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        const stripe = ((Math.floor(y / 32) % 2) === 0 ? 1 : -1) * 18;
        const blade = Math.sin(x * 0.7 + y * 0.35) * 14;
        data[idx] = THREE.MathUtils.clamp(Math.floor(128 + blade), 0, 255);
        data[idx + 1] = THREE.MathUtils.clamp(Math.floor(128 + stripe), 0, 255);
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 12);
    return tex;
  },

  // 4. Pro Tennis Athlete Athletic Jersey Texture with EA SPORTS Crest
  createJerseyTexture(baseColorHex, accentColorHex, numberStr, isAI) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base Jersey Color
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, 512, 512);

    // Technical Aero Fabric Honeycomb / Micro-Mesh
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    for (let y = 0; y < 512; y += 6) {
      for (let x = 0; x < 512; x += 6) {
        const ox = (y % 12 === 0) ? 3 : 0;
        ctx.fillRect(x + ox, y, 2, 2);
      }
    }

    // Dynamic Flank Racing Stripes
    ctx.fillStyle = accentColorHex;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(70, 0); ctx.lineTo(105, 512); ctx.lineTo(0, 512);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(512, 0); ctx.lineTo(512 - 70, 0); ctx.lineTo(512 - 105, 512); ctx.lineTo(512, 512);
    ctx.fill();

    // Tournament & EA SPORTS Chest Crests
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EA SPORTS™', 256, 95);

    ctx.fillStyle = '#ff0055';
    ctx.fillRect(190, 105, 132, 4);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 18px sans-serif';
    ctx.fillText('GRAND SLAM PRO', 256, 130);

    // Player Number with 3D Depth Outline
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.font = '900 130px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(numberStr, 258, 332);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(numberStr, 256, 330);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  },

  // 5. Spiral Wrapped Tennis Grip Tape
  createGripTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 256, 512);

    for (let y = -256; y < 768; y += 42) {
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.fillRect(0, y, 256, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(0, y + 8, 256, 4);
    }
    return new THREE.CanvasTexture(canvas);
  },

  // 6. Tropical Beach Sand Court (Compacted Golden Sand + Rustic Weathered Planks + White Marine Rope Lines)
  // 2b. Seamless Outer Beach Plain Sand (No Court Lines)
  createBeachPlainSandTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Warm Tropical Golden Sand Base
    ctx.fillStyle = '#dc9e58';
    ctx.fillRect(0, 0, 512, 512);

    // Multi-Tone Micro-Grain Noise
    for (let i = 0; i < 65000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 248, 220, 0.20)' : 'rgba(120, 65, 18, 0.16)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    // Gentle Wind Dune Waves
    ctx.lineWidth = 6;
    for (let y = 15; y < 512; y += 32) {
      ctx.strokeStyle = (y % 64 === 0) ? 'rgba(245, 195, 125, 0.28)' : 'rgba(110, 55, 12, 0.10)';
      ctx.beginPath();
      for (let x = 0; x <= 512; x += 16) {
        const dy = Math.sin((x / 512) * Math.PI * 4 + y * 0.09) * 4;
        if (x === 0) ctx.moveTo(x, y + dy); else ctx.lineTo(x, y + dy);
      }
      ctx.stroke();
    }

    // Tiny Crushed Shell & Quartz Flecks
    for (let i = 0; i < 200; i++) {
      const sx = Math.random() * 512, sy = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 190, 170, 0.55)';
      ctx.beginPath();
      ctx.arc(sx, sy, Math.random() * 2 + 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 5);
    return tex;
  },

  createBeachSandTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // Warm Tropical Sand Base (Rich golden sun-warmed tone)
    ctx.fillStyle = '#db9c56';
    ctx.fillRect(0, 0, 1024, 2048);

    // Fine Multi-Tone Sand Granule Noise
    for (let i = 0; i < 130000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,248,220,0.22)' : 'rgba(125,70,20,0.18)';
      ctx.fillRect(Math.random() * 1024, Math.random() * 2048, 2, 2);
    }

    // Organic Dual-Harmonic Wind Ripples
    ctx.lineWidth = 8;
    for (let y = 30; y < 2048; y += 38) {
      ctx.strokeStyle = (y % 76 === 0) ? 'rgba(235, 175, 105, 0.35)' : 'rgba(115, 60, 15, 0.12)';
      ctx.beginPath();
      for (let x = 0; x <= 1024; x += 24) {
        const dy = Math.sin((x / 1024) * Math.PI * 6 + y * 0.08) * 5 + Math.cos((x / 1024) * Math.PI * 2) * 3;
        if (x === 0) ctx.moveTo(x, y + dy); else ctx.lineTo(x, y + dy);
      }
      ctx.stroke();
    }

    // Crushed Seashell & Coral Specks
    for (let i = 0; i < 400; i++) {
      const sx = Math.random() * 1024, sy = Math.random() * 2048;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.75)' : 'rgba(255, 180, 160, 0.65)';
      ctx.beginPath();
      ctx.arc(sx, sy, Math.random() * 2.5 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    const scaleX = 1024 / 16.0;
    const scaleY = 2048 / 30.0;
    const toCanvasX = (x) => 512 + x * scaleX;
    const toCanvasY = (z) => 1024 + z * scaleY;

    const doublesW = 5.485;
    const courtHalfL = 11.885;
    const xL = toCanvasX(-doublesW);
    const xR = toCanvasX(doublesW);
    const yT = toCanvasY(-courtHalfL);
    const yB = toCanvasY(courtHalfL);

    // Weathered Dark Teak Perimeter Border Planks with Brass Bolt Accents
    ctx.fillStyle = '#5c3518';
    ctx.fillRect(xL - 18, yT - 18, (xR - xL) + 36, 18);
    ctx.fillRect(xL - 18, yB, (xR - xL) + 36, 18);
    ctx.fillRect(xL - 18, yT, 18, yB - yT);
    ctx.fillRect(xR, yT, 18, yB - yT);

    // Wood Grain on Planks
    ctx.strokeStyle = 'rgba(30, 15, 5, 0.35)';
    ctx.lineWidth = 2;
    for (let g = 0; g < 36; g++) {
      ctx.strokeRect(xL - 16, yT - 16, (xR - xL) + 32, (yB - yT) + 32);
    }

    // Center Tropical Resort Compass Star Watermark
    ctx.strokeStyle = 'rgba(255, 235, 180, 0.40)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(512, 1024, 155, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 240, 200, 0.50)';
    ctx.font = '900 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PLAYA PARAÍSO • RESORT', 512, 1038);

    // Braided Marine White Rope Lines with Texture
    ctx.strokeStyle = '#fffbf0';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.strokeRect(xL, yT, xR - xL, yB - yT);

    const singlesW = 4.115;
    const sL = toCanvasX(-singlesW);
    const sR = toCanvasX(singlesW);
    ctx.beginPath();
    ctx.moveTo(sL, yT); ctx.lineTo(sL, yB);
    ctx.moveTo(sR, yT); ctx.lineTo(sR, yB);
    ctx.stroke();

    const sZ = 6.40;
    const yS1 = toCanvasY(-sZ);
    const yS2 = toCanvasY(sZ);
    ctx.beginPath();
    ctx.moveTo(sL, yS1); ctx.lineTo(sR, yS1);
    ctx.moveTo(sL, yS2); ctx.lineTo(sR, yS2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(512, yS1); ctx.lineTo(512, yS2);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  },

  // 7. Kyoto Zen Temple Court (Polished Slate Stone + Woven Tatami Borders + Gold Sakura Crest)
  createZenStoneTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // Outer Court: Dark River Cobblestones
    ctx.fillStyle = '#12151c';
    ctx.fillRect(0, 0, 1024, 2048);

    // Slate Flagstone Tiles with Beveled Edges
    const tileSize = 64;
    for (let y = 0; y < 2048; y += tileSize) {
      for (let x = 0; x < 1024; x += tileSize) {
        const shade = Math.floor(22 + (Math.sin(x * 0.05) + Math.cos(y * 0.05)) * 7);
        ctx.fillStyle = `rgb(${shade}, ${shade + 3}, ${shade + 9})`;
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.fillRect(x + 2, y + 2, tileSize - 4, 2);
      }
    }

    const scaleX = 1024 / 16.0;
    const scaleY = 2048 / 30.0;
    const toCanvasX = (x) => 512 + x * scaleX;
    const toCanvasY = (z) => 1024 + z * scaleY;

    const doublesW = 5.485;
    const courtHalfL = 11.885;
    const xL = toCanvasX(-doublesW);
    const xR = toCanvasX(doublesW);
    const yT = toCanvasY(-courtHalfL);
    const yB = toCanvasY(courtHalfL);

    // Inner Court: Polished Black Imperial Kyoto Slate
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(xL, yT, xR - xL, yB - yT);

    // Karesansui Raked Gravel Ripple Waves around Court
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 3;
    for (let r = 80; r < 580; r += 24) {
      ctx.beginPath();
      ctx.arc(512, 1024, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Woven Green Tatami Rush Mat (Igusa) Borders along doubles tramlines
    const singlesW = 4.115;
    const sL = toCanvasX(-singlesW);
    const sR = toCanvasX(singlesW);

    ctx.fillStyle = '#26421d';
    ctx.fillRect(xL, yT, sL - xL, yB - yT);
    ctx.fillRect(sR, yT, xR - sR, yB - yT);

    // Tatami Weave Ribbing
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let y = yT; y < yB; y += 8) {
      ctx.fillRect(xL, y, sL - xL, 2);
      ctx.fillRect(sR, y, xR - sR, 2);
    }

    // Center Golden Sakura Flower Crest
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.55)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(512, 1024, 150, 0, Math.PI * 2);
    ctx.stroke();

    // 5 Delicate Sakura Petals
    ctx.fillStyle = 'rgba(255, 182, 193, 0.50)';
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const px = 512 + Math.cos(angle) * 70;
      const py = 1024 + Math.sin(angle) * 70;
      ctx.beginPath();
      ctx.arc(px, py, 45, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#ffd700';
    ctx.font = '900 38px serif';
    ctx.textAlign = 'center';
    ctx.fillText('KYOTO ZEN TEMPLE • 京都', 512, 1038);

    // Pure White Lacquered Stone Inlay Lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(xL, yT, xR - xL, yB - yT);

    ctx.beginPath();
    ctx.moveTo(sL, yT); ctx.lineTo(sL, yB);
    ctx.moveTo(sR, yT); ctx.lineTo(sR, yB);
    ctx.stroke();

    const sZ = 6.40;
    const yS1 = toCanvasY(-sZ);
    const yS2 = toCanvasY(sZ);
    ctx.beginPath();
    ctx.moveTo(sL, yS1); ctx.lineTo(sR, yS1);
    ctx.moveTo(sL, yS2); ctx.lineTo(sR, yS2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(512, yS1); ctx.lineTo(512, yS2);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  },

  // 8. The White House - Presidential DecoTurf Court (US Open Blue + South Lawn Emerald Green + Presidential Seal)
  createWhiteHouseTurfTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // Outer Court Apron: South Lawn Deep Presidential Emerald Green
    ctx.fillStyle = '#14532d';
    ctx.fillRect(0, 0, 1024, 2048);

    // Subtle grass blade and court texture grain
    for (let i = 0; i < 90000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(34, 197, 94, 0.08)' : 'rgba(5, 46, 22, 0.12)';
      ctx.fillRect(Math.random() * 1024, Math.random() * 2048, 2, 2);
    }

    const scaleX = 1024 / 16.0;
    const scaleY = 2048 / 30.0;
    const toCanvasX = (x) => 512 + x * scaleX;
    const toCanvasY = (z) => 1024 + z * scaleY;

    const doublesW = 5.485;
    const courtHalfL = 11.885;
    const xL = toCanvasX(-doublesW);
    const xR = toCanvasX(doublesW);
    const yT = toCanvasY(-courtHalfL);
    const yB = toCanvasY(courtHalfL);

    // Inner Court: Official US Open / White House Blue
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(xL, yT, xR - xL, yB - yT);

    // Subtle micro-acrylic court grit texture
    for (let i = 0; i < 70000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(96, 165, 250, 0.08)' : 'rgba(30, 58, 138, 0.08)';
      ctx.fillRect(xL + Math.random() * (xR - xL), yT + Math.random() * (yB - yT), 2, 2);
    }

    // Doubles tramline alleys: Presidential Deep Navy Blue
    const singlesW = 4.115;
    const sL = toCanvasX(-singlesW);
    const sR = toCanvasX(singlesW);

    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(xL, yT, sL - xL, yB - yT);
    ctx.fillRect(sR, yT, xR - sR, yB - yT);

    // Center Court Presidential Seal Emblem
    ctx.strokeStyle = '#d4af37'; // Gold
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(512, 1024, 155, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(512, 1024, 135, 0, Math.PI * 2);
    ctx.stroke();

    // 50 Stars ring around the Presidential Seal
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 36; i++) {
      const ang = (i / 36) * Math.PI * 2;
      const sx = 512 + Math.cos(ang) * 145;
      const sy = 1024 + Math.sin(ang) * 145;
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Golden Eagle / Shield Crest Centerpiece
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.moveTo(512 - 32, 1024 - 38);
    ctx.lineTo(512 + 32, 1024 - 38);
    ctx.lineTo(512 + 28, 1024 + 10);
    ctx.lineTo(512, 1024 + 40);
    ctx.lineTo(512 - 28, 1024 + 10);
    ctx.closePath();
    ctx.fill();

    // Outspread Eagle Wings
    ctx.beginPath();
    ctx.moveTo(512, 1024 - 20);
    ctx.quadraticCurveTo(512 - 65, 1024 - 55, 512 - 80, 1024 - 25);
    ctx.quadraticCurveTo(512 - 45, 1024 - 10, 512 - 25, 1024 - 5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(512, 1024 - 20);
    ctx.quadraticCurveTo(512 + 65, 1024 - 55, 512 + 80, 1024 - 25);
    ctx.quadraticCurveTo(512 + 45, 1024 - 10, 512 + 25, 1024 - 5);
    ctx.closePath();
    ctx.fill();

    // Presidential Court Typography
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 36px serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE WHITE HOUSE', 512, 940);
    ctx.font = '600 24px sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText('PRESIDENTIAL COURT • WASHINGTON, D.C.', 512, 1115);

    // Official Tournament Regulation White Lines (5cm width)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.lineCap = 'square';
    ctx.strokeRect(xL, yT, xR - xL, yB - yT);

    ctx.beginPath();
    ctx.moveTo(sL, yT); ctx.lineTo(sL, yB);
    ctx.moveTo(sR, yT); ctx.lineTo(sR, yB);
    ctx.stroke();

    const sZ = 6.40;
    const yS1 = toCanvasY(-sZ);
    const yS2 = toCanvasY(sZ);
    ctx.beginPath();
    ctx.moveTo(sL, yS1); ctx.lineTo(sR, yS1);
    ctx.moveTo(sL, yS2); ctx.lineTo(sR, yS2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(512, yS1); ctx.lineTo(512, yS2);
    ctx.stroke();

    // Center service hashes
    ctx.beginPath();
    ctx.moveTo(512, yT); ctx.lineTo(512, yT + 16);
    ctx.moveTo(512, yB); ctx.lineTo(512, yB - 16);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  },

  // 9. Manicured South Lawn Striped Grass Texture
  createWhiteHouseLawnTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base emerald green
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 512, 512);

    // Diagonal fairway lawnmower stripes
    const stripeW = 48;
    for (let i = -512; i < 1024; i += stripeW * 2) {
      ctx.fillStyle = 'rgba(22, 163, 74, 0.35)';
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + stripeW, 0);
      ctx.lineTo(i + stripeW + 512, 512);
      ctx.lineTo(i + 512, 512);
      ctx.closePath();
      ctx.fill();
    }

    // Grass blade speckles
    for (let i = 0; i < 45000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(187, 247, 208, 0.14)' : 'rgba(20, 83, 45, 0.16)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 3);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 12);
    return tex;
  },

  // 10. The White House Neoclassical South Portico Facade Texture
  createWhiteHouseFacadeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Virginia Freestone Neoclassical Limestone Base (Photorealistic Sandstone Tones)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    bgGrad.addColorStop(0.0, '#f1f5f9');
    bgGrad.addColorStop(0.5, '#e2e8f0');
    bgGrad.addColorStop(1.0, '#cbd5e1');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // Fine Ashlar Masonry Stone Joints with Bevel Shading
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1.5;
    for (let y = 0; y < 1024; y += 64) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(2048, y); ctx.stroke();
    }
    for (let y = 0; y < 1024; y += 64) {
      const offset = (y % 128 === 0) ? 0 : 64;
      for (let x = offset; x < 2048; x += 128) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 64); ctx.stroke();
      }
    }

    // Windows with Detailed Georgian Multi-Panes, Silk Curtains & Chandelier Glow
    const drawGeorgianWindow = (x, y, w, h, isArched = false) => {
      // Classical Stone Surround Frame
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(x - 8, y - 10, w + 16, h + 18);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 8, y - 10, w + 16, h + 18);

      // Triangular Pediment over Upper Level Windows
      if (isArched) {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(x - 14, y - 10);
        ctx.lineTo(x + w / 2, y - 48);
        ctx.lineTo(x + w + 14, y - 10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Interior Depth & Sky Reflection
      const winGrad = ctx.createLinearGradient(x, y, x, y + h);
      winGrad.addColorStop(0.0, '#0f172a');
      winGrad.addColorStop(0.65, '#1e293b');
      winGrad.addColorStop(1.0, '#fef08a'); // Warm interior chandelier light
      ctx.fillStyle = winGrad;
      ctx.fillRect(x, y, w, h);

      // Silk Drape Curtains on Sides
      ctx.fillStyle = 'rgba(254, 243, 199, 0.45)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 16, y + h * 0.5, x + 6, y + h);
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x + w, y);
      ctx.quadraticCurveTo(x + w - 16, y + h * 0.5, x + w - 6, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();

      // Crystal Chandelier Glow in Center
      const chanGlow = ctx.createRadialGradient(x + w / 2, y + h * 0.75, 2, x + w / 2, y + h * 0.75, 24);
      chanGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      chanGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.45)');
      chanGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = chanGlow;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.75, 24, 0, Math.PI * 2);
      ctx.fill();

      // Arched Fanlight at Top
      if (isArched) {
        ctx.beginPath();
        ctx.arc(x + w / 2, y, w / 2, Math.PI, 0);
        ctx.fillStyle = winGrad;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // White Mullions / Panes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h);
      ctx.stroke();
      for (let py = y + 28; py < y + h; py += 28) {
        ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x + w, py); ctx.stroke();
      }
    };

    // Upper level 12 windows with pediments
    for (let i = 0; i < 12; i++) {
      const wx = 80 + i * 160;
      drawGeorgianWindow(wx, 210, 72, 140, true);
    }

    // Lower level 12 tall french windows
    for (let i = 0; i < 12; i++) {
      const wx = 80 + i * 160;
      drawGeorgianWindow(wx, 540, 72, 190, false);
    }

    // Classical Entablature & Frieze with Decorative Triglyphs
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, 2048, 90);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 82, 2048, 12);

    // Classical Dentils
    ctx.fillStyle = '#94a3b8';
    for (let dx = 10; dx < 2048; dx += 28) {
      ctx.fillRect(dx, 58, 16, 20);
    }

    // Balustrade along top parapet
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 2048, 36);
    for (let bx = 12; bx < 2048; bx += 24) {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(bx, 8, 10, 24);
    }

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  },

  createAmericanFlagTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 270;
    const ctx = canvas.getContext('2d');

    // 13 Stripes
    const stripeH = 270 / 13;
    for (let i = 0; i < 13; i++) {
      ctx.fillStyle = (i % 2 === 0) ? '#b22234' : '#ffffff';
      ctx.fillRect(0, i * stripeH, 512, stripeH);
    }

    // Blue Canton
    const cantonW = 512 * 0.40;
    const cantonH = stripeH * 7;
    ctx.fillStyle = '#3c3b6e';
    ctx.fillRect(0, 0, cantonW, cantonH);

    // 50 Stars (9 alternating rows of 6 and 5 stars)
    ctx.fillStyle = '#ffffff';
    const drawStar = (cx, cy, r) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const a2 = a1 + Math.PI / 5;
        const x1 = cx + Math.cos(a1) * r;
        const y1 = cy + Math.sin(a1) * r;
        const x2 = cx + Math.cos(a2) * (r * 0.42);
        const y2 = cy + Math.sin(a2) * (r * 0.42);
        if (i === 0) ctx.moveTo(x1, y1); else ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.closePath();
      ctx.fill();
    };

    for (let row = 0; row < 9; row++) {
      const isEven = (row % 2 === 0);
      const cols = isEven ? 6 : 5;
      const y = 10 + row * ((cantonH - 20) / 8);
      const xStart = isEven ? 14 : 28;
      const xSpacing = (cantonW - 28) / 5;
      for (let col = 0; col < cols; col++) {
        drawStar(xStart + col * xSpacing, y, 4.2);
      }
    }

    return new THREE.CanvasTexture(canvas);
  },

  // 8. Glossy 3K Carbon Fiber Weave Texture (Aerodynamic Racket Hoop & Throat)
  createCarbonFiberTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f1318';
    ctx.fillRect(0, 0, 256, 256);

    const step = 8;
    for (let y = 0; y < 256; y += step) {
      for (let x = 0; x < 256; x += step) {
        const isDiagonal = ((x / step) + (y / step)) % 2 === 0;
        ctx.fillStyle = isDiagonal ? '#1f2530' : '#080a0d';
        ctx.fillRect(x, y, step, step);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x, y, step, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  },

  // 9. Perforated Cushioned Pro Tennis Overgrip Tape
  createPerforatedGripTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 256, 512);

    // Overlapping Spiral Edges
    for (let y = -256; y < 768; y += 48) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, y, 256, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(0, y + 6, 256, 4);

      // Micro Perforation Holes
      ctx.fillStyle = '#94a3b8';
      for (let x = 16; x < 256; x += 24) {
        ctx.beginPath();
        ctx.arc(x, y + 24, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Top Finishing Rubber Collar Tape (Black with Gold Trim)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 470, 256, 42);
    ctx.fillStyle = '#e5c07b';
    ctx.fillRect(0, 470, 256, 3);
    ctx.fillRect(0, 509, 256, 3);

    return new THREE.CanvasTexture(canvas);
  },

  // 10. Delicate Falling Sakura Cherry Blossom Petal Texture
  createSakuraPetalTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);

    const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 28);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#ffb6c1');
    grad.addColorStop(0.8, '#ff69b4');
    grad.addColorStop(1, 'rgba(255, 105, 180, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(32, 6);
    ctx.bezierCurveTo(48, 12, 54, 36, 32, 58);
    ctx.bezierCurveTo(10, 36, 16, 12, 32, 6);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  },

  // 11. Ultra-Realistic Athletic Skin Texture with Micro-Pores & Muscle Highlights
  createAthleteSkinTexture(isAI) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base athletic skin tone (warm sun-kissed peach/tan)
    const baseColor = isAI ? '#d69e7e' : '#f0c7ab';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // Subsurface scattering tone gradient
    const subGrad = ctx.createLinearGradient(0, 0, 512, 512);
    subGrad.addColorStop(0, isAI ? 'rgba(215, 120, 80, 0.18)' : 'rgba(255, 160, 130, 0.22)');
    subGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    subGrad.addColorStop(1, isAI ? 'rgba(140, 70, 45, 0.25)' : 'rgba(180, 100, 75, 0.18)');
    ctx.fillStyle = subGrad;
    ctx.fillRect(0, 0, 512, 512);

    // Micro skin pore stippling
    for (let i = 0; i < 40000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
    }

    // Subtle athletic muscle striations & tone creases
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 3;
    for (let y = 60; y < 480; y += 75) {
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.quadraticCurveTo(256, y + 25, 432, y);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  },

  // 12. Detailed Athletic Face Texture (Realistic Eyes, Eyebrows, Lips & Shading)
  createAthleteFaceTexture(isAI) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base skin
    ctx.fillStyle = isAI ? '#d69e7e' : '#f0c7ab';
    ctx.fillRect(0, 0, 512, 512);

    // Forehead shadow under visor
    const visorShadow = ctx.createLinearGradient(0, 0, 0, 180);
    visorShadow.addColorStop(0, 'rgba(0, 0, 0, 0.40)');
    visorShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = visorShadow;
    ctx.fillRect(0, 0, 512, 180);

    // Athletic Eyes (Intense focus)
    const drawEye = (x, isRight) => {
      ctx.save();
      ctx.translate(x, 220);

      // Eye socket shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 48, 26, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eye White (Sclera)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(0, 0, 36, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris (Vibrant athletic color: Cyan for player, Amber/Crimson for AI)
      const irisGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, 18);
      if (isAI) {
        irisGrad.addColorStop(0, '#ff9900');
        irisGrad.addColorStop(0.7, '#dc2626');
        irisGrad.addColorStop(1, '#7f1d1d');
      } else {
        irisGrad.addColorStop(0, '#7dd3fc');
        irisGrad.addColorStop(0.7, '#0284c7');
        irisGrad.addColorStop(1, '#0369a1');
      }
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, -4, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Eyelids & Eyelashes
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(0, -2, 37, 18, 0, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();

      // Athletic Eyebrow
      ctx.fillStyle = isAI ? '#2d1810' : '#1e1b18';
      ctx.beginPath();
      const flip = isRight ? -1 : 1;
      ctx.moveTo(-44 * flip, -34);
      ctx.quadraticCurveTo(0, -48, 44 * flip, -38);
      ctx.quadraticCurveTo(0, -38, -44 * flip, -34);
      ctx.fill();

      ctx.restore();
    };

    drawEye(170, false);
    drawEye(342, true);

    // Sculpted Nose Bridge & Nostrils
    ctx.strokeStyle = 'rgba(120, 60, 30, 0.22)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(246, 200); ctx.lineTo(246, 290);
    ctx.lineTo(238, 305); ctx.lineTo(256, 312); ctx.lineTo(274, 305);
    ctx.stroke();

    // Nostril shadow
    ctx.fillStyle = 'rgba(70, 30, 15, 0.4)';
    ctx.beginPath();
    ctx.ellipse(244, 308, 6, 4, -0.2, 0, Math.PI * 2);
    ctx.ellipse(268, 308, 6, 4, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Natural Athletic Lips with Cupid's Bow
    ctx.fillStyle = isAI ? '#b45a46' : '#d4796a';
    ctx.beginPath();
    ctx.moveTo(215, 365);
    ctx.quadraticCurveTo(240, 355, 256, 358);
    ctx.quadraticCurveTo(272, 355, 297, 365);
    ctx.quadraticCurveTo(256, 385, 215, 365);
    ctx.fill();

    ctx.strokeStyle = 'rgba(80, 25, 20, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(218, 365); ctx.lineTo(294, 365);
    ctx.stroke();

    // Subtle Chin and Cheekbone Contours
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.10)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(256, 420, 35, 0.2, Math.PI - 0.2);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  },

  // 13. High-Definition Technical Athletic Shorts Texture
  createAthleteShortsTexture(colorHex, accentHex) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base Fabric
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 512, 512);

    // Micro Diamond Ripstop Weave
    ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
    for (let y = 0; y < 512; y += 6) {
      for (let x = 0; x < 512; x += 6) {
        ctx.fillRect(x + ((y % 12 === 0) ? 3 : 0), y, 2, 2);
      }
    }

    // Ventilation Side Mesh Panels
    ctx.fillStyle = accentHex;
    ctx.fillRect(0, 0, 48, 512);
    ctx.fillRect(512 - 48, 0, 48, 512);

    // Hem Double-Stitching Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 485); ctx.lineTo(512, 485);
    ctx.moveTo(0, 492); ctx.lineTo(512, 492);
    ctx.stroke();

    // Brand Logo on Left Hem
    ctx.fillStyle = accentHex;
    ctx.beginPath();
    ctx.moveTo(80, 450); ctx.lineTo(120, 430); ctx.lineTo(110, 470);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  },

  // 14. 360° Grand Slam Arena Sky Dome Texture
  createStadiumSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep Midnight Arena Atmosphere Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#030814');
    grad.addColorStop(0.65, '#0a1932');
    grad.addColorStop(1, '#152b4d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Giant Illuminated Arena Roof Circular Truss
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(512, 100, 380, 0, Math.PI * 2);
    ctx.stroke();

    // Cross Spaceframe Steel Girders
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 3;
    for (let x = 0; x < 1024; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(1024 - x, 320);
      ctx.stroke();
    }

    // 6 Gantry Floodlight Banks with Glow Flares
    const lights = [120, 280, 440, 584, 744, 904];
    lights.forEach(lx => {
      const fGrad = ctx.createRadialGradient(lx, 140, 5, lx, 140, 80);
      fGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      fGrad.addColorStop(0.3, 'rgba(0, 240, 255, 0.45)');
      fGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.arc(lx, 140, 80, 0, Math.PI * 2);
      ctx.fill();
    });

    // Distant Upper Deck Seating Rings Silhouette
    ctx.fillStyle = 'rgba(5, 12, 24, 0.75)';
    ctx.fillRect(0, 420, 1024, 92);
    for (let i = 0; i < 1024; i += 12) {
      ctx.fillStyle = (i % 24 === 0) ? '#0284c7' : '#0369a1';
      ctx.fillRect(i, 435, 8, 25);
    }

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  },

  // 15. 360° Tropical Beach Sunset Sky Dome Texture
  createBeachSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Vibrant Sunset Gradient (Twilight Violet to Radiant Coral Gold)
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#1c0b2b');   // Deep indigo-violet zenith
    grad.addColorStop(0.35, '#4a154b'); // Magenta twilight
    grad.addColorStop(0.65, '#c0392b'); // Crimson sunset
    grad.addColorStop(0.85, '#e67e22'); // Amber orange
    grad.addColorStop(1.0, '#f39c12');  // Golden horizon
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Radiant Sun Disc & Atmospheric Solar Flare
    const sunX = 512, sunY = 380;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 260);
    sunGlow.addColorStop(0, '#ffffff');
    sunGlow.addColorStop(0.12, '#fff275');
    sunGlow.addColorStop(0.40, 'rgba(255, 130, 40, 0.55)');
    sunGlow.addColorStop(0.80, 'rgba(230, 50, 80, 0.20)');
    sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 260, 0, Math.PI * 2);
    ctx.fill();

    // Drifting Golden Sunset Cumulus Clouds
    ctx.fillStyle = 'rgba(255, 170, 100, 0.25)';
    const clouds = [
      { x: 180, y: 260, w: 220, h: 40 },
      { x: 720, y: 280, w: 280, h: 45 },
      { x: 420, y: 320, w: 190, h: 32 },
      { x: 80,  y: 350, w: 160, h: 28 }
    ];
    clouds.forEach(c => {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Distant Volcanic Island Silhouette along Horizon
    ctx.fillStyle = '#1b1226';
    ctx.beginPath();
    ctx.moveTo(0, 512);
    ctx.lineTo(0, 460);
    ctx.quadraticCurveTo(120, 420, 240, 465);
    ctx.quadraticCurveTo(400, 480, 550, 470);
    ctx.quadraticCurveTo(700, 410, 860, 465);
    ctx.lineTo(1024, 460);
    ctx.lineTo(1024, 512);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  },

  // 16. 360° Kyoto Zen Mountain Twilight Sky Dome Texture
  createZenSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Mystical Twilight Purple to Indigo Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#090514');
    grad.addColorStop(0.4, '#190e30');
    grad.addColorStop(0.75, '#2e194a');
    grad.addColorStop(1, '#4a2566');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Glowing Full Moon (Tsukimi)
    const moonX = 320, moonY = 160;
    const moonHalo = ctx.createRadialGradient(moonX, moonY, 20, moonX, moonY, 140);
    moonHalo.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    moonHalo.addColorStop(0.25, 'rgba(255, 245, 215, 0.65)');
    moonHalo.addColorStop(0.65, 'rgba(215, 185, 245, 0.22)');
    moonHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = moonHalo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 140, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fffdf0';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 38, 0, Math.PI * 2);
    ctx.fill();

    // Twinkling Evening Starfield
    for (let i = 0; i < 180; i++) {
      const sx = Math.random() * 1024;
      const sy = Math.random() * 320;
      const size = Math.random() * 1.8 + 0.5;
      ctx.fillStyle = Math.random() > 0.3 ? '#ffffff' : '#ffd580';
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mountain Ridges (Mount Hiei & Arashiyama Silhouette)
    ctx.fillStyle = '#10081c';
    ctx.beginPath();
    ctx.moveTo(0, 512);
    ctx.lineTo(0, 420);
    ctx.quadraticCurveTo(150, 340, 320, 400);
    ctx.quadraticCurveTo(480, 430, 620, 350);
    ctx.quadraticCurveTo(800, 310, 1024, 410);
    ctx.lineTo(1024, 512);
    ctx.fill();

    // Silhouetted Weeping Sakura Branches on Corners
    ctx.strokeStyle = '#08030e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.bezierCurveTo(80, 50, 140, 30, 210, 90);
    ctx.moveTo(1024, 0); ctx.bezierCurveTo(940, 60, 880, 40, 820, 110);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  },

  // 16b. 360° Washington D.C. Presidential Sky Dome Texture (Daylight 4K)
  createWhiteHouseSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rich Capital Daylight Sky Gradient (Azure Zenith to Atmospheric Horizon Haze)
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0.0, '#1d4ed8');   // Rich deep azure
    grad.addColorStop(0.35, '#38bdf8');  // Brilliant cerulean blue
    grad.addColorStop(0.70, '#93c5fd');  // Soft light sky blue
    grad.addColorStop(1.0, '#e0f2fe');   // Warm horizon haze
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 512);

    // Warm Solar Disk & Soft Skylight Halo
    const sunX = 640, sunY = 120;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 200);
    sunGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sunGlow.addColorStop(0.2, 'rgba(254, 240, 138, 0.6)');
    sunGlow.addColorStop(0.6, 'rgba(186, 230, 253, 0.2)');
    sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 200, 0, Math.PI * 2);
    ctx.fill();

    // Delicate Wispy High-Altitude Cirrus Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    const cirrus = [
      { x: 200, y: 140, rx: 140, ry: 18, rot: 0.08 },
      { x: 450, y: 90,  rx: 190, ry: 22, rot: -0.05 },
      { x: 780, y: 160, rx: 160, ry: 16, rot: 0.12 },
      { x: 300, y: 220, rx: 110, ry: 14, rot: -0.04 },
      { x: 880, y: 110, rx: 130, ry: 20, rot: 0.06 }
    ];
    cirrus.forEach(c => {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, c.rx, c.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Soft Distant Tree Line & Low Horizon Silhouette
    ctx.fillStyle = 'rgba(30, 58, 138, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, 512);
    ctx.lineTo(0, 480);
    for (let x = 0; x <= 1024; x += 32) {
      const y = 475 + Math.sin(x * 0.02) * 8 + Math.cos(x * 0.04) * 4;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(1024, 512);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  },

  // 17. Surrounding Concrete Concourse Floor Texture (Stadium)
  createStadiumFloorTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 512);

    // Concrete Tiles Grid
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    const step = 64;
    for (let x = 0; x <= 512; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    for (let y = 0; y <= 512; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }

    // Concrete Stipple Noise
    for (let i = 0; i < 25000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  },

  // 18. High-Detail Feathery Palm Frond Texture with Sunlight Alpha Transparency
  createPalmLeafTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 1024);

    // Slender Central Rachis (Stem)
    const stemGrad = ctx.createLinearGradient(256, 1024, 256, 0);
    stemGrad.addColorStop(0, '#3f6212');
    stemGrad.addColorStop(0.5, '#65a30d');
    stemGrad.addColorStop(1, '#84cc16');

    ctx.strokeStyle = stemGrad;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(256, 1024);
    ctx.lineTo(256, 40);
    ctx.stroke();

    // Cascading Pinnate Leaflets (Feathery Tropical Foliage)
    for (let y = 1000; y >= 60; y -= 15) {
      const prog = (1024 - y) / 1024; // 0 at base, 1 at tip
      const leafLen = Math.sin(prog * Math.PI) * 225 + 24;

      // Left Leaflet
      const lGrad = ctx.createLinearGradient(256, y, 256 - leafLen, y - leafLen * 0.42);
      lGrad.addColorStop(0, '#14532d');
      lGrad.addColorStop(0.5, '#16a34a');
      lGrad.addColorStop(0.85, '#4ade80');
      lGrad.addColorStop(1.0, '#facc15'); // sunlit amber golden tip

      ctx.strokeStyle = lGrad;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.quadraticCurveTo(256 - leafLen * 0.55, y - leafLen * 0.12, 256 - leafLen, y - leafLen * 0.42);
      ctx.stroke();

      // Right Leaflet
      const rGrad = ctx.createLinearGradient(256, y, 256 + leafLen, y - leafLen * 0.42);
      rGrad.addColorStop(0, '#14532d');
      rGrad.addColorStop(0.5, '#16a34a');
      rGrad.addColorStop(0.85, '#4ade80');
      rGrad.addColorStop(1.0, '#facc15');

      ctx.strokeStyle = rGrad;
      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.quadraticCurveTo(256 + leafLen * 0.55, y - leafLen * 0.12, 256 + leafLen, y - leafLen * 0.42);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  },

  // 19. Natural Annular Ringed Coconut Palm Trunk Bark Texture
  createPalmTrunkTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Weathered Coconut Palm Bark Base Tone
    ctx.fillStyle = '#452a16';
    ctx.fillRect(0, 0, 256, 512);

    // Micro Wood Fiber Texture
    for (let i = 0; i < 35000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(146, 92, 45, 0.28)' : 'rgba(25, 12, 5, 0.38)';
      ctx.fillRect(Math.random() * 256, Math.random() * 512, 1.5, 3);
    }

    // Horizontal Annular Coconut Leaf Base Scar Rings
    for (let y = 0; y < 512; y += 32) {
      // Ring Shadow Groove
      ctx.strokeStyle = 'rgba(15, 8, 3, 0.85)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, y + 4);
      ctx.quadraticCurveTo(128, y + 9, 256, y + 4);
      ctx.stroke();

      // Ring Highlight Ridge
      ctx.strokeStyle = 'rgba(195, 145, 95, 0.48)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(128, y + 5, 256, y);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    return tex;
  }
};

// --- Particle FX Engine ---
class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.sakuraParticles = [];
    this.ballTrail = [];
    this.chalkParticles = [];
    this.impactRings = [];
    this.geo = new THREE.SphereGeometry(0.045, 6, 6);
  }

  spawnImpactRing(pos, colorHex = 0x00f0ff) {
    const ringGeo = new THREE.RingGeometry(0.12, 0.28, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(ringGeo, ringMat);
    mesh.position.copy(pos);
    mesh.rotation.x = -Math.PI / 2;
    this.scene.add(mesh);
    this.impactRings.push({ mesh, life: 0.22, maxLife: 0.22 });
  }

  burst(pos, count = 18, colorHex = 0xffea00, speedScale = 3.5) {
    const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 1.0 });
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.geo, mat);
      mesh.position.copy(pos);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * speedScale,
        Math.random() * speedScale * 0.85 + 0.5,
        (Math.random() - 0.5) * speedScale
      );
      this.scene.add(mesh);
      this.particles.push({ mesh, vel, life: 1.0 });
    }
  }

  spawnBallTrail(pos, colorHex = 0x00f0ff, scaleMult = 1.0) {
    const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.065 * scaleMult, 8, 8), mat);
    mesh.position.copy(pos);
    this.scene.add(mesh);
    this.ballTrail.push({ mesh, life: 0.24, maxLife: 0.24 });
  }

  spawnChalkPuff(pos) {
    const chalkGeo = new THREE.PlaneGeometry(0.18, 0.18);
    const chalkMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    for (let i = 0; i < 16; i++) {
      const mesh = new THREE.Mesh(chalkGeo, chalkMat.clone());
      mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.25,
        0.04 + Math.random() * 0.08,
        pos.z + (Math.random() - 0.5) * 0.25
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.scene.add(mesh);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 1.6,
        0.6 + Math.random() * 1.4,
        (Math.random() - 0.5) * 1.6
      );
      this.chalkParticles.push({ mesh, vel, life: 0.45, maxLife: 0.45, rotSpeed: Math.random() * 4 - 2 });
    }
  }

  initSakura(count = 45) {
    this.clearSakura();
    const petalTex = TextureFactory.createSakuraPetalTexture();
    const mat = new THREE.MeshBasicMaterial({
      map: petalTex,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const geo = new THREE.PlaneGeometry(0.25, 0.35);

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 36,
        2.0 + Math.random() * 12,
        (Math.random() - 0.5) * 44
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.scene.add(mesh);
      this.sakuraParticles.push({
        mesh,
        rotSpeed: new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1),
        fallSpeed: 0.8 + Math.random() * 0.9,
        driftPhase: Math.random() * Math.PI * 2
      });
    }
  }

  clearSakura() {
    this.sakuraParticles.forEach(p => {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
    });
    this.sakuraParticles = [];
  }

  update(dt) {
    // 1. Standard Bursts
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt * 2.6;
      p.vel.y -= 9.8 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.material.opacity = Math.max(0, p.life);

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.particles.splice(i, 1);
      }
    }

    // 2. Ball Motion Ribbon Trail
    for (let i = this.ballTrail.length - 1; i >= 0; i--) {
      const t = this.ballTrail[i];
      t.life -= dt;
      const progress = Math.max(0, t.life / t.maxLife);
      t.mesh.scale.set(progress, progress, progress);
      t.mesh.material.opacity = progress * 0.8;
      if (t.life <= 0) {
        this.scene.remove(t.mesh);
        t.mesh.geometry.dispose();
        this.ballTrail.splice(i, 1);
      }
    }

    // 3. Falling Sakura Petals in Zen Temple
    for (let i = 0; i < this.sakuraParticles.length; i++) {
      const sp = this.sakuraParticles[i];
      sp.mesh.position.y -= sp.fallSpeed * dt;
      sp.mesh.position.x += Math.sin(sp.driftPhase + sp.mesh.position.y * 0.8) * 0.9 * dt;
      sp.mesh.position.z += Math.cos(sp.driftPhase + sp.mesh.position.y * 0.8) * 0.6 * dt;
      sp.mesh.rotation.x += sp.rotSpeed.x * dt;
      sp.mesh.rotation.y += sp.rotSpeed.y * dt;
      sp.mesh.rotation.z += sp.rotSpeed.z * dt;

      if (sp.mesh.position.y < 0.05) {
        sp.mesh.position.y = 10 + Math.random() * 4;
        sp.mesh.position.x = (Math.random() - 0.5) * 36;
        sp.mesh.position.z = (Math.random() - 0.5) * 44;
      }
    }

    // 4. White Chalk Puff Particles on Line Bounces
    for (let i = this.chalkParticles.length - 1; i >= 0; i--) {
      const cp = this.chalkParticles[i];
      cp.life -= dt;
      cp.mesh.position.addScaledVector(cp.vel, dt);
      cp.vel.y -= 2.2 * dt;
      cp.mesh.rotation.z += cp.rotSpeed * dt;
      const progress = Math.max(0, cp.life / cp.maxLife);
      const scale = 1.0 + (1.0 - progress) * 2.8;
      cp.mesh.scale.set(scale, scale, scale);
      cp.mesh.material.opacity = progress * 0.75;
      if (cp.life <= 0) {
        this.scene.remove(cp.mesh);
        cp.mesh.geometry.dispose();
        if (cp.mesh.material) cp.mesh.material.dispose();
        this.chalkParticles.splice(i, 1);
      }
    }

    // 5. Sweet-Spot & Smash Shockwave Rings
    for (let i = this.impactRings.length - 1; i >= 0; i--) {
      const r = this.impactRings[i];
      r.life -= dt;
      const progress = 1.0 - Math.max(0, r.life / r.maxLife);
      const scale = 1.0 + progress * 7.5;
      r.mesh.scale.set(scale, scale, scale);
      r.mesh.material.opacity = (1.0 - progress) * 0.95;
      if (r.life <= 0) {
        this.scene.remove(r.mesh);
        r.mesh.geometry.dispose();
        if (r.mesh.material) r.mesh.material.dispose();
        this.impactRings.splice(i, 1);
      }
    }
  }
}

// --- Main Tennis Game Engine ---
class TennisGameEngine {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.audio = new TennisAudioPro();

    // Official Regulation Tennis Dimensions
    this.COURT_W = 10.97; // Doubles full court width
    this.DOUBLES_HALF_W = 5.485;
    this.SINGLES_W = 8.23; // Singles full court width
    this.HALF_W = 4.115; // In-play singles lateral boundary (+/-4.115m)
    this.COURT_L = 23.77; // Total length
    this.HALF_L = 11.885; // Baseline distance from net (+/-11.885m)
    this.SERVICE_Z = 6.40; // Service line distance from net (+/-6.40m)
    this.NET_H = 0.914; // Center net height (0.914m / 3ft)
    this.NET_POST_H = 1.07; // Post height at doubles tramlines

    this.isPlaying = false;
    this.pointActive = false;
    this.server = 'player'; // 'player' or 'ai'
    this.servingSide = 1; // 1: Deuce court (right), -1: Ad court (left)
    this.serveFaultCount = 0; // 0: 1st serve, 1: 2nd serve

    // Tennis Scores (0, 15, 30, 40, ADV)
    this.scorePlayer = 0;
    this.scoreAI = 0;
    this.gamesPlayer = 0;
    this.gamesAI = 0;
    this.setsPlayer = 0;
    this.setsAI = 0;
    this.rally = 0;

    this.shotType = 'DRIVE';
    this.power = 0.55;
    this.isChargingPower = false;
    this.cameraMode = 'third';

    // Multiplayer State ('ai', 'local', 'online_host', 'online_guest')
    this.gameMode = 'ai';
    this.peer = null;
    this.conn = null;
    this.roomCode = null;
    this.netTimer = 0;
    this.isConnecting = false; // True while WebRTC handshake in progress

    // Ball Physics with True 3D Aerodynamics & Spin
    this.ballRadius = 0.125;
    this.ball = {
      pos: new THREE.Vector3(1.8, 1.0, 12.2),
      prevPos: new THREE.Vector3(1.8, 1.0, 12.2),
      vel: new THREE.Vector3(0, 0, 0),
      spin: new THREE.Vector3(0, 0, 0),
      mesh: null,
      shadow: null,
      targetMarker: null,
      lastHitter: null,
      bounceCount: 0,
      hitGroundInCourt: false,
      netTargetPos: new THREE.Vector3(1.8, 1.0, 12.2),
      netTargetVel: new THREE.Vector3(0, 0, 0),
      isServeLetCandidate: false
    };

    // Humanoid Athletes
    this.player = {
      pos: new THREE.Vector3(1.8, 0, 12.2),
      netTargetPos: new THREE.Vector3(1.8, 0, 12.2),
      speed: 7.8,
      model: null,
      limbs: {},
      racketHitbox: { pos: new THREE.Vector3(), radius: 0.42 },
      runCycle: 0,
      isSwinging: false,
      swingType: 'forehand',
      swingProgress: 0
    };

    this.ai = {
      pos: new THREE.Vector3(-1.8, 0, -12.2),
      netTargetPos: new THREE.Vector3(-1.8, 0, -12.2),
      targetPos: new THREE.Vector3(0, 0, -11.8),
      speed: 8.5,
      model: null,
      limbs: {},
      racketHitbox: { pos: new THREE.Vector3(), radius: 0.42 },
      runCycle: 0,
      isSwinging: false,
      swingType: 'forehand',
      swingProgress: 0
    };

    this.keys = {};
    this.camShake = 0;

    // Performance Scratch Vectors (Zero Garbage Collection)
    this._v1 = new THREE.Vector3();
    this._v2 = new THREE.Vector3();
    this._camTarget = new THREE.Vector3();
    this._rHead = new THREE.Vector3();
    this._minimapTick = 0;
    this._pendingSound = null;
    this._pendingAnn = null;
    this.currentMap = 'stadium';

    // Mobile & Touch Controls State
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    this.controlMode = localStorage.getItem('padel_control_mode') || 'auto';
    this.touchJoystickVec = new THREE.Vector2(0, 0);
    this.touchSprinting = false;
    this._ballTrail = [];

    // Online Tournament State (4+ Players with World Rotation)
    this.tournament = {
      active: false,
      isHost: false,
      code: null,
      round: 1,
      maxRounds: 2,
      players: [],
      matches: [],
      standings: {}
    };
    this.oceanMesh = null;
    this.tikiTorches = [];

    this.initThree();
    this.particles = new ParticleSystem(this.scene);
    this.buildCourt(this.currentMap);
    this.buildEnvironment(this.currentMap);

    const playerGender = window.playerGender || 'male';
    const playerNick   = (window.playerNickname || 'Player').substring(0, 12);
    this.player.nickname = playerNick;
    this.player.gender   = playerGender;
    this.ai.nickname     = 'RIVAL';
    this.ai.gender       = 'male';
    this.player.model = this.createProAthlete(0x00f0ff, 0xffffff, '#00f0ff', '7', false, playerGender);
    this.ai.model     = this.createProAthlete(0xff2a55, 0x111827, '#ff2a55', '1', true,  'male');
    this.scene.add(this.player.model);
    this.scene.add(this.ai.model);

    this.buildBall();
    this.initInputs();
    this.initUI();
    this.initTournamentUI();
    this.initMultiplayer();
    this.prepareServe('player');

    this.clock = new THREE.Clock();
    this.animate();
  }

  // --- Three.js & Dynamic Lighting Setup ---
  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x081326);
    this.scene.fog = new THREE.FogExp2(0x081326, 0.010);

    this.camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 260);
    this.camera.position.set(0, 4.8, 17.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // Dynamic Atmosphere Lights
    this.ambient = new THREE.AmbientLight(0xdbeafe, 0.65);
    this.scene.add(this.ambient);

    this.sun = new THREE.DirectionalLight(0xfff8ee, 1.35);
    this.sun.position.set(16, 28, 12);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    this.sun.shadow.camera.near = 5;
    this.sun.shadow.camera.far = 70;
    this.sun.shadow.camera.left = -22;
    this.sun.shadow.camera.right = 22;
    this.sun.shadow.camera.top = 26;
    this.sun.shadow.camera.bottom = -26;
    this.sun.shadow.bias = -0.0006;
    this.scene.add(this.sun);

    // High-Impact Athletic Rim Light (Cool Cyan-White backlight for athletes)
    this.rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.85);
    this.rimLight.position.set(0, 10, -20);
    this.scene.add(this.rimLight);

    // Groups for Court and Environment
    this.courtGroup = new THREE.Group();
    this.environmentGroup = new THREE.Group();
    this.scene.add(this.courtGroup);
    this.scene.add(this.environmentGroup);

    // EA SPORTS Broadcast Post-Processing Pipeline
    try {
      this.usePostProcessing = true;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.postScene = new THREE.Scene();
      this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.renderTarget = new THREE.WebGLRenderTarget(w, h, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false
      });

      this.postMaterial = new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: this.renderTarget.texture },
          uResolution: { value: new THREE.Vector2(w, h) },
          uTime: { value: 0 },
          uVignetteStrength: { value: 0.30 },
          uContrast: { value: 1.15 },
          uSaturation: { value: 1.18 },
          uExposure: { value: 1.05 },
          uBloomThreshold: { value: 0.84 },
          uBloomIntensity: { value: 1.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform vec2 uResolution;
          uniform float uTime;
          uniform float uVignetteStrength;
          uniform float uContrast;
          uniform float uSaturation;
          uniform float uExposure;
          uniform float uBloomThreshold;
          uniform float uBloomIntensity;
          varying vec2 vUv;

          vec3 rgb2hsv(vec3 c) {
            vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
          }

          vec3 hsv2rgb(vec3 c) {
            vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
          }

          void main() {
            vec2 uv = vUv;
            vec2 centerDist = uv - vec2(0.5);
            float distSq = dot(centerDist, centerDist);

            // Subtle optical chromatic aberration (4K Broadcast lens simulation)
            vec2 caOffset = centerDist * distSq * 0.005;
            float r = texture2D(tDiffuse, uv + caOffset).r;
            float g = texture2D(tDiffuse, uv).g;
            float b = texture2D(tDiffuse, uv - caOffset).b;
            vec3 color = vec3(r, g, b);

            // Broadcast Exposure
            color *= uExposure;

            // Broadcast Bloom Radiance Pass (Highlights > 0.65 emit soft athletic glow)
            vec2 texel = 1.0 / uResolution;
            vec3 bloom = vec3(0.0);
            
            // Tight halo (4 diagonal samples)
            vec3 s1 = texture2D(tDiffuse, uv + vec2(2.5, 2.5) * texel).rgb;
            vec3 s2 = texture2D(tDiffuse, uv + vec2(-2.5, 2.5) * texel).rgb;
            vec3 s3 = texture2D(tDiffuse, uv + vec2(2.5, -2.5) * texel).rgb;
            vec3 s4 = texture2D(tDiffuse, uv + vec2(-2.5, -2.5) * texel).rgb;
            vec3 sAvg = (s1 + s2 + s3 + s4) * 0.25;
            float sLum = dot(sAvg, vec3(0.299, 0.587, 0.114));
            if (sLum > uBloomThreshold) {
              bloom += max(vec3(0.0), sAvg - uBloomThreshold) * 0.70;
            }

            // Wide ambient halo (4 cross samples)
            vec3 w1 = texture2D(tDiffuse, uv + vec2(5.5, 0.0) * texel).rgb;
            vec3 w2 = texture2D(tDiffuse, uv + vec2(-5.5, 0.0) * texel).rgb;
            vec3 w3 = texture2D(tDiffuse, uv + vec2(0.0, 5.5) * texel).rgb;
            vec3 w4 = texture2D(tDiffuse, uv + vec2(0.0, -5.5) * texel).rgb;
            vec3 wAvg = (w1 + w2 + w3 + w4) * 0.25;
            float wLum = dot(wAvg, vec3(0.299, 0.587, 0.114));
            float wThresh = min(0.96, uBloomThreshold + 0.06);
            if (wLum > wThresh) {
              bloom += max(vec3(0.0), wAvg - wThresh) * 0.40;
            }

            color += bloom * (1.30 * uBloomIntensity);

            // S-Curve Contrast (EA Sports Frostbite punchy look)
            color = (color - 0.5) * uContrast + 0.5;

            // Sports Broadcast Saturation Boost
            vec3 hsv = rgb2hsv(max(color, vec3(0.0)));
            hsv.y = clamp(hsv.y * uSaturation, 0.0, 1.0);
            color = hsv2rgb(hsv);

            // Lens Vignette (subtle peripheral falloff)
            float vignette = 1.0 - smoothstep(0.35, 0.75, distSq * 1.5) * uVignetteStrength;
            color *= vignette;

            gl_FragColor = vec4(color, 1.0);
          }
        `,
        depthWrite: false,
        depthTest: false
      });

      this.postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMaterial);
      this.postScene.add(this.postQuad);
    } catch (e) {
      console.warn("Post-processing fallback:", e);
      this.usePostProcessing = false;
    }

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      if (this.renderTarget) {
        this.renderTarget.setSize(window.innerWidth, window.innerHeight);
        if (this.postMaterial && this.postMaterial.uniforms && this.postMaterial.uniforms.uResolution) {
          this.postMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        }
      }
    });
  }

  // --- Dynamic Map / Arena Environment Switcher ---
  setMap(mapId, broadcast = true) {
    if (!['stadium', 'beach', 'zen', 'whitehouse'].includes(mapId)) return;
    this.currentMap = mapId;

    this.buildCourt(mapId);
    this.buildEnvironment(mapId);

    if (mapId === 'zen') {
      this.particles.initSakura(50);
    } else {
      this.particles.clearSakura();
    }

    const mapNames = {
      stadium: { name: 'ARENA PRO', icon: '🏟️' },
      beach: { name: 'PLAYA PARAÍSO', icon: '🏖️' },
      zen: { name: 'TEMPLO ZEN', icon: '⛩️' },
      whitehouse: { name: 'LA CASA BLANCA', icon: '🏛️' }
    };
    const info = mapNames[mapId] || mapNames.stadium;
    const nameEl = document.getElementById('current-map-name');
    const iconEl = document.getElementById('current-map-icon');
    if (nameEl) nameEl.innerText = info.name;
    if (iconEl) iconEl.innerText = info.icon;

    document.querySelectorAll('.map-card').forEach(card => {
      card.classList.toggle('active', card.dataset.map === mapId);
    });

    if (mapId === 'beach') this.audio.playBeachWave();
    else if (mapId === 'zen') this.audio.playZenBell();

    // Dynamic Adaptive Athletic Rim Lighting per Arena (Calibrated for photorealism)
    if (this.rimLight) {
      if (mapId === 'beach') {
        this.rimLight.color.setHex(0xffaa55);
        this.rimLight.intensity = 0.60;
        this.rimLight.position.set(-15, 12, -20);
      } else if (mapId === 'zen') {
        this.rimLight.color.setHex(0xfbcfe8);
        this.rimLight.intensity = 0.45;
        this.rimLight.position.set(10, 14, -18);
      } else if (mapId === 'whitehouse') {
        this.rimLight.color.setHex(0xdbeafe);
        this.rimLight.intensity = 0.25;
        this.rimLight.position.set(0, 20, -22);
      } else {
        this.rimLight.color.setHex(0x38bdf8);
        this.rimLight.intensity = 0.85;
        this.rimLight.position.set(0, 14, -22);
      }
    }

    // Dynamic 4K Post-Processing Color Grading per Arena
    if (this.postMaterial && this.postMaterial.uniforms) {
      const u = this.postMaterial.uniforms;
      if (mapId === 'whitehouse') {
        if (u.uExposure) u.uExposure.value = 0.96;
        if (u.uContrast) u.uContrast.value = 1.06;
        if (u.uSaturation) u.uSaturation.value = 1.10;
        if (u.uBloomThreshold) u.uBloomThreshold.value = 0.90;
        if (u.uBloomIntensity) u.uBloomIntensity.value = 0.55;
        if (u.uVignetteStrength) u.uVignetteStrength.value = 0.22;
      } else if (mapId === 'beach') {
        if (u.uExposure) u.uExposure.value = 1.02;
        if (u.uContrast) u.uContrast.value = 1.12;
        if (u.uSaturation) u.uSaturation.value = 1.26;
        if (u.uBloomThreshold) u.uBloomThreshold.value = 0.78;
        if (u.uBloomIntensity) u.uBloomIntensity.value = 1.15;
        if (u.uVignetteStrength) u.uVignetteStrength.value = 0.32;
      } else if (mapId === 'zen') {
        if (u.uExposure) u.uExposure.value = 1.00;
        if (u.uContrast) u.uContrast.value = 1.10;
        if (u.uSaturation) u.uSaturation.value = 1.12;
        if (u.uBloomThreshold) u.uBloomThreshold.value = 0.84;
        if (u.uBloomIntensity) u.uBloomIntensity.value = 0.85;
        if (u.uVignetteStrength) u.uVignetteStrength.value = 0.28;
      } else {
        // Stadium Pro
        if (u.uExposure) u.uExposure.value = 1.04;
        if (u.uContrast) u.uContrast.value = 1.16;
        if (u.uSaturation) u.uSaturation.value = 1.14;
        if (u.uBloomThreshold) u.uBloomThreshold.value = 0.84;
        if (u.uBloomIntensity) u.uBloomIntensity.value = 1.10;
        if (u.uVignetteStrength) u.uVignetteStrength.value = 0.30;
      }
    }

    this.showAnnouncement(`PISTA: ${info.name}`, 'Nuevo escenario cargado');

    if (broadcast && this.gameMode === 'online_host' && this.conn && this.conn.open) {
      this.conn.send({ type: 'map_change', map: mapId });
    }
  }

  cycleMap() {
    const maps = ['stadium', 'beach', 'zen', 'whitehouse'];
    const nextIdx = (maps.indexOf(this.currentMap) + 1) % maps.length;
    this.setMap(maps[nextIdx], true);
  }

  // --- Official Open Tennis Court (DecoTurf, Beach Sand, or Zen Stone) ---
  buildCourt(mapId = 'stadium') {
    while (this.courtGroup.children.length > 0) {
      const obj = this.courtGroup.children[0];
      this.courtGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }

    let courtTex;
    let courtNormal = null;
    let courtRoughness = null;
    let outerColor;
    let postMat;

    if (mapId === 'beach') {
      courtTex = TextureFactory.createBeachSandTexture();
      courtNormal = TextureFactory.createBeachSandNormalMap();
      outerColor = 0xc89858;
      postMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6, metalness: 0.1 });
    } else if (mapId === 'zen') {
      courtTex = TextureFactory.createZenStoneTexture();
      courtNormal = TextureFactory.createZenStoneNormalMap();
      outerColor = 0x0f131a;
      postMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.35, metalness: 0.3 });
    } else if (mapId === 'whitehouse') {
      courtTex = TextureFactory.createWhiteHouseTurfTexture();
      courtNormal = TextureFactory.createWhiteHouseGrassNormalMap();
      outerColor = 0x14532d;
      postMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.22, metalness: 0.90 }); // 24K Presidential Brass
    } else {
      courtTex = TextureFactory.createTurfTexture();
      courtNormal = TextureFactory.createTurfNormalMap();
      courtRoughness = TextureFactory.createTurfRoughnessMap();
      outerColor = 0x050c18;
      postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.92, roughness: 0.2 });
    }

    // 1. In-Court Ground Plane
    const courtGeo = new THREE.PlaneGeometry(16.0, 30.0);
    const courtMat = new THREE.MeshStandardMaterial({
      map: courtTex,
      normalMap: courtNormal,
      normalScale: courtNormal ? new THREE.Vector2(0.40, 0.40) : null,
      roughnessMap: courtRoughness,
      roughness: mapId === 'beach' ? 0.90 : (mapId === 'zen' ? 0.58 : (mapId === 'whitehouse' ? 0.78 : 0.72)),
      metalness: mapId === 'zen' ? 0.14 : (mapId === 'whitehouse' ? 0.08 : 0.05)
    });
    const court = new THREE.Mesh(courtGeo, courtMat);
    court.rotation.x = -Math.PI / 2;
    court.receiveShadow = true;
    this.courtGroup.add(court);

    // 2. Surrounding Floor
    const outerGeo = new THREE.PlaneGeometry(42, 56);
    const outerMat = new THREE.MeshStandardMaterial({
      color: outerColor,
      roughness: 0.95
    });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    outer.rotation.x = -Math.PI / 2;
    outer.position.y = -0.015;
    outer.receiveShadow = true;
    this.courtGroup.add(outer);

    // 3. Official Tennis Net with Center Strap
    const netWidth = 12.4;
    const netGeo = new THREE.PlaneGeometry(netWidth, this.NET_H, 48, 12);
    const netMat = new THREE.MeshStandardMaterial({
      color: mapId === 'beach' ? 0x1a1a1a : (mapId === 'zen' ? 0x181818 : 0x0a0a0a),
      roughness: 0.9,
      wireframe: true
    });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(0, this.NET_H / 2, 0);
    this.courtGroup.add(net);

    const tapeGeo = new THREE.BoxGeometry(netWidth, 0.065, 0.045);
    const tapeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const tape = new THREE.Mesh(tapeGeo, tapeMat);
    tape.position.set(0, this.NET_H, 0);
    this.courtGroup.add(tape);

    const strapGeo = new THREE.BoxGeometry(0.06, this.NET_H, 0.05);
    const strap = new THREE.Mesh(strapGeo, tapeMat);
    strap.position.set(0, this.NET_H / 2, 0);
    this.courtGroup.add(strap);

    const nPostGeo = new THREE.CylinderGeometry(0.065, 0.065, this.NET_POST_H, 16);
    const np1 = new THREE.Mesh(nPostGeo, postMat);
    np1.position.set(-netWidth / 2, this.NET_POST_H / 2, 0);
    const np2 = new THREE.Mesh(nPostGeo, postMat);
    np2.position.set(netWidth / 2, this.NET_POST_H / 2, 0);
    this.courtGroup.add(np1, np2);
  }

  // --- Environment Factory: Stadium, Tropical Beach & Kyoto Zen Temple ---
  buildEnvironment(mapId = 'stadium') {
    while (this.environmentGroup.children.length > 0) {
      const obj = this.environmentGroup.children[0];
      this.environmentGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }
    this.crowdFlashes = [];
    this.tikiTorches = [];
    this.oceanMesh = null;
    this.shorelineFoam = null;
    this.jumbotronCanvas = null;
    this.jumbotronCtx = null;
    this.jumbotronTex = null;
    this.whiteHouseFlag = null;

    if (mapId === 'beach') {
      this.buildBeachEnvironment();
    } else if (mapId === 'zen') {
      this.buildZenEnvironment();
    } else if (mapId === 'whitehouse') {
      this.buildWhiteHouseEnvironment();
    } else {
      this.buildStadiumEnvironment();
    }
  }

  // 4. The White House - South Lawn Presidential Tennis Court
  buildWhiteHouseEnvironment() {
    this.scene.background = new THREE.Color(0x78b2e8);
    this.scene.fog = new THREE.FogExp2(0x9cc5ed, 0.0022);
    this.ambient.color.setHex(0xe0f2fe);
    this.ambient.intensity = 0.48;
    this.sun.color.setHex(0xfffdf5);
    this.sun.intensity = 1.20;
    this.sun.position.set(24, 38, 20);

    // 360° Washington D.C. Procedural Daytime Sky Dome
    const whSkyTex = TextureFactory.createWhiteHouseSkyTexture();
    const whSkyGeo = new THREE.SphereGeometry(110, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    whSkyGeo.scale(-1, 1, 1);
    const whSkyMat = new THREE.MeshBasicMaterial({
      map: whSkyTex,
      side: THREE.BackSide,
      depthWrite: false
    });
    const whSky = new THREE.Mesh(whSkyGeo, whSkyMat);
    whSky.position.set(0, -1, 0);
    this.environmentGroup.add(whSky);

    // Manicured South Lawn Fairway Grass Plane
    const lawnTex = TextureFactory.createWhiteHouseLawnTexture();
    const lawnGeo = new THREE.PlaneGeometry(160, 170);
    const lawnMat = new THREE.MeshStandardMaterial({
      map: lawnTex,
      roughness: 0.88,
      metalness: 0.02
    });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set(0, -0.04, -10);
    lawn.receiveShadow = true;
    this.environmentGroup.add(lawn);

    // South Lawn Presidential Tiered Water Fountain
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(0, 0, -28);
    const basinMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.60 });
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.5, 0.45, 32), basinMat);
    basin.position.y = 0.22;
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.05, metalness: 0.70 });
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.8, 0.15, 32), waterMat);
    pool.position.y = 0.38;
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.4, 16), basinMat);
    spout.position.y = 0.9;
    const sprayMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.70 });
    const spray = new THREE.Mesh(new THREE.ConeGeometry(0.85, 2.2, 16), sprayMat);
    spray.position.y = 2.1;
    fountainGroup.add(basin, pool, spout, spray);
    this.environmentGroup.add(fountainGroup);

    // Neoclassical Executive Residence Facade at Z = -52
    const facadeTex = TextureFactory.createWhiteHouseFacadeTexture();
    const facadeMat = new THREE.MeshStandardMaterial({
      map: facadeTex,
      roughness: 0.65,
      metalness: 0.08
    });
    // Main residence center block
    const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(58, 14.5, 14), facadeMat);
    mainBuilding.position.set(0, 7.25, -52);
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    this.environmentGroup.add(mainBuilding);

    // East & West Colonnade Terraces
    const terraceMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.70 });
    [-1, 1].forEach(side => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(26, 7.0, 10), facadeMat);
      wing.position.set(side * 40, 3.5, -54);
      const colonnade = new THREE.Mesh(new THREE.BoxGeometry(16, 4.5, 4), terraceMat);
      colonnade.position.set(side * 28, 2.25, -46);
      this.environmentGroup.add(wing, colonnade);
    });

    // Neoclassical South Portico (Semi-Circular Protrusion & Balcony)
    const porticoGroup = new THREE.Group();
    porticoGroup.position.set(0, 0, -45);

    // Raised Stone Porch Podium
    const porchBase = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 8.8, 1.2, 32, 1, false, 0, Math.PI), terraceMat);
    porchBase.position.y = 0.6;
    porchBase.rotation.y = -Math.PI;
    porticoGroup.add(porchBase);

    // Portico Roof / Upper Balcony Floor
    const porchRoof = new THREE.Mesh(new THREE.CylinderGeometry(8.6, 8.6, 0.9, 32, 1, false, 0, Math.PI), terraceMat);
    porchRoof.position.y = 12.8;
    porchRoof.rotation.y = -Math.PI;
    porticoGroup.add(porchRoof);

    // 6 Classical Ionic Columns supporting the Portico
    const colMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.50 });
    const colGeo = new THREE.CylinderGeometry(0.44, 0.40, 11.4, 20);
    const colBaseGeo = new THREE.CylinderGeometry(0.55, 0.60, 0.4, 20);
    const colCapGeo = new THREE.BoxGeometry(0.95, 0.45, 0.95);

    for (let c = 0; c < 6; c++) {
      const ang = (c / 5) * Math.PI;
      const cx = Math.cos(ang) * 7.5;
      const cz = Math.sin(ang) * 7.5;
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(cx, 6.7, -cz);
      col.castShadow = true;

      const base = new THREE.Mesh(colBaseGeo, terraceMat);
      base.position.set(cx, 1.3, -cz);

      const cap = new THREE.Mesh(colCapGeo, terraceMat);
      cap.position.set(cx, 12.2, -cz);

      porticoGroup.add(col, base, cap);
    }

    // Triangular Pediment / Cornice Gable on Portico Roof
    const pediment = new THREE.Mesh(new THREE.ConeGeometry(9.0, 3.2, 4), terraceMat);
    pediment.position.set(0, 14.8, 0);
    pediment.rotation.y = Math.PI / 4;
    porticoGroup.add(pediment);

    this.environmentGroup.add(porticoGroup);

    // Presidential Rooftop Flagpole with Waving 50-Star American Flag
    const flagPoleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.90, roughness: 0.20 });
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 9.0, 16), flagPoleMat);
    flagPole.position.set(0, 19.0, -45);

    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 }));
    finial.position.set(0, 23.6, -45);
    this.environmentGroup.add(flagPole, finial);

    // Waving American Flag
    const flagTex = TextureFactory.createAmericanFlagTexture();
    const flagGeo = new THREE.PlaneGeometry(4.4, 2.3, 24, 8);
    flagGeo.translate(2.2, 0, 0);
    const flagMat = new THREE.MeshStandardMaterial({
      map: flagTex,
      roughness: 0.40,
      metalness: 0.05,
      side: THREE.DoubleSide
    });
    this.whiteHouseFlag = new THREE.Mesh(flagGeo, flagMat);
    this.whiteHouseFlag.position.set(0.08, 22.2, -45);
    this.environmentGroup.add(this.whiteHouseFlag);

    // THE WASHINGTON MONUMENT (Iconic 35m Egyptian Obelisk in Far South Background)
    const obeliskGroup = new THREE.Group();
    obeliskGroup.position.set(0, 0, 85);
    const obeliskMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.75, metalness: 0.05 });
    // Main shaft
    const obeliskShaft = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.4, 30, 4), obeliskMat);
    obeliskShaft.position.y = 15;
    obeliskShaft.rotation.y = Math.PI / 4;
    // Pyramidion apex
    const obeliskApex = new THREE.Mesh(new THREE.ConeGeometry(2.4 * Math.SQRT2, 4.8, 4),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5, metalness: 0.2 }));
    obeliskApex.position.y = 32.4;
    obeliskApex.rotation.y = Math.PI / 4;
    obeliskGroup.add(obeliskShaft, obeliskApex);
    this.environmentGroup.add(obeliskGroup);

    // MARINE ONE PRESIDENTIAL HELIPAD on South Lawn
    const helipadCanvas = document.createElement('canvas');
    helipadCanvas.width = 512; helipadCanvas.height = 512;
    const hctx = helipadCanvas.getContext('2d');
    hctx.fillStyle = '#475569'; hctx.beginPath(); hctx.arc(256, 256, 240, 0, Math.PI * 2); hctx.fill();
    hctx.strokeStyle = '#ffffff'; hctx.lineWidth = 14; hctx.beginPath(); hctx.arc(256, 256, 210, 0, Math.PI * 2); hctx.stroke();
    hctx.fillStyle = '#facc15'; hctx.font = '900 180px sans-serif'; hctx.textAlign = 'center'; hctx.textBaseline = 'middle';
    hctx.fillText('H', 256, 260);
    const helipadTex = new THREE.CanvasTexture(helipadCanvas);
    const helipadMesh = new THREE.Mesh(new THREE.PlaneGeometry(13, 13),
      new THREE.MeshStandardMaterial({ map: helipadTex, roughness: 0.85 }));
    helipadMesh.rotation.x = -Math.PI / 2;
    helipadMesh.position.set(-26, -0.02, -26);
    this.environmentGroup.add(helipadMesh);

    // US MARINE CORPS SENTRY GUARDS (Standing at Attention at Portico Base)
    const marineSuit = new THREE.MeshStandardMaterial({ color: 0x0a1931, roughness: 0.65 });
    const marinePants = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.70 });
    const marineCap = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35 });
    const marineSkin = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.50 });
    [-4.5, 4.5].forEach(sx => {
      const guard = new THREE.Group();
      guard.position.set(sx, 1.2, -45.5);

      const legs = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.95, 0.22), marinePants);
      legs.position.y = 0.48;
      const coat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.80, 0.26), marineSuit);
      coat.position.y = 1.35;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), marineSkin);
      head.position.y = 1.88;
      const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.10, 16), marineCap);
      hat.position.y = 2.01;
      const brim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.08),
        new THREE.MeshBasicMaterial({ color: 0x050505 }));
      brim.position.set(0, 1.96, 0.12);

      guard.add(legs, coat, head, hat, brim);
      this.environmentGroup.add(guard);
    });

    // Black Wrought-Iron Security Fence with Gold Spear Finials
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.40, metalness: 0.85 });
    const spearMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.90 });

    const makeFenceRun = (x1, z1, x2, z2) => {
      const len = Math.hypot(x2 - x1, z2 - z1);
      const ang = Math.atan2(x2 - x1, z2 - z1);
      const midX = (x1 + x2) / 2;
      const midZ = (z1 + z2) / 2;

      [-1, 1].forEach(r => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, len), fenceMat);
        rail.position.set(midX, r > 0 ? 2.1 : 0.25, midZ);
        rail.rotation.y = ang;
        this.environmentGroup.add(rail);
      });

      const count = Math.floor(len / 0.55);
      for (let p = 0; p <= count; p++) {
        const t = p / count;
        const px = x1 + (x2 - x1) * t;
        const pz = z1 + (z2 - z1) * t;
        const picket = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 2.1, 8), fenceMat);
        picket.position.set(px, 1.15, pz);
        const spear = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.22, 6), spearMat);
        spear.position.set(px, 2.30, pz);
        this.environmentGroup.add(picket, spear);
      }
    };

    makeFenceRun(-16, -26, -16, 26);
    makeFenceRun(16, -26, 16, 26);
    makeFenceRun(-16, 26, 16, 26);

    // Jacqueline Kennedy Rose Gardens along Court Boundaries
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.92 });
    const redRoseM = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.50 });
    const whtRoseM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.50 });

    [-11.5, 11.5].forEach(hx => {
      const hedge = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.95, 34), hedgeMat);
      hedge.position.set(hx, 0.48, 0);
      hedge.castShadow = true;
      this.environmentGroup.add(hedge);

      for (let b = -15; b <= 15; b += 1.8) {
        const roseMat = (Math.abs(b) % 2 === 0) ? redRoseM : whtRoseM;
        const rose = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), roseMat);
        rose.position.set(hx + (Math.sin(b) * 0.35), 0.98, b);
        this.environmentGroup.add(rose);
      }
    });

    // Manicured Conical Emerald Cypress Topiaries flanking the court
    const topiaryMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 });
    const potMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.60 });
    [-13.8, 13.8].forEach(tx => {
      [-18, -9, 0, 9, 18].forEach(tz => {
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.40, 0.65, 12), potMat);
        pot.position.set(tx, 0.32, tz);
        pot.castShadow = true;
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.85, 3.4, 12), topiaryMat);
        cone.position.set(tx, 2.35, tz);
        cone.castShadow = true;
        this.environmentGroup.add(pot, cone);
      });
    });

    // Washington D.C. Cast-Iron Ornamental Streetlamps
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.30, metalness: 0.90 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const lampPositions = [
      { x: -14.5, z: -21 }, { x: 14.5, z: -21 },
      { x: -14.5, z: 21 },  { x: 14.5, z: 21 }
    ];
    lampPositions.forEach(lp => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.6, 12), lampMat);
      pole.position.set(lp.x, 2.3, lp.z);
      pole.castShadow = true;
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.22, 0.70, 6), glassMat);
      lantern.position.set(lp.x, 4.75, lp.z);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.35, 6), lampMat);
      cap.position.set(lp.x, 5.25, lp.z);
      // Subtle decorative daylight lantern glow (no blinding pointlight blowout)
      const light = new THREE.PointLight(0xfff1aa, 0.08, 10);
      light.position.set(lp.x, 4.75, lp.z);
      this.environmentGroup.add(pole, lantern, cap, light);
    });

    // Presidential Mahogany & Brass Player Benches
    const mahogMat = new THREE.MeshStandardMaterial({ color: 0x3f1a0e, roughness: 0.45 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.90, roughness: 0.20 });
    [-1, 1].forEach(side => {
      const bench = new THREE.Group();
      bench.position.set(side * 8.6, 0, 0);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.65), mahogMat);
      seat.position.set(0, 0.45, 0);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 0.08), mahogMat);
      back.position.set(0, 0.85, -0.28);
      [-0.8, 0.8].forEach(lx => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.45, 8), brassMat);
        leg.position.set(lx, 0.22, 0);
        bench.add(leg);
      });
      const medal = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16), brassMat);
      medal.rotation.x = Math.PI / 2;
      medal.position.set(0, 0.90, -0.23);
      bench.add(seat, back, medal);
      this.environmentGroup.add(bench);
    });

    // Secret Service Agents standing watch near perimeter
    const suitMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.70 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.50 });
    const darkGlass = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const agentPositions = [
      { x: -14.2, z: -14, rot: 0.4 },
      { x: 14.2, z: 14, rot: -2.8 }
    ];
    agentPositions.forEach(ap => {
      const agent = new THREE.Group();
      agent.position.set(ap.x, 0, ap.z);
      agent.rotation.y = ap.rot;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.20, 1.25, 12), suitMat);
      body.position.y = 1.05;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), headMat);
      head.position.y = 1.82;
      const shades = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.08), darkGlass);
      shades.position.set(0, 1.84, 0.12);
      const earCoil = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff }));
      earCoil.position.set(0.14, 1.76, -0.02);
      agent.add(body, head, shades, earCoil);
      this.environmentGroup.add(agent);
    });
  }

  // 1. Grand Slam Arena Environment (Arthur Ashe / Roland Garros / Wimbledon Pro Night)
  buildStadiumEnvironment() {
    this.scene.background = new THREE.Color(0x060e1d);
    this.scene.fog = new THREE.FogExp2(0x060e1d, 0.008);
    this.ambient.color.setHex(0x94a3b8);
    this.ambient.intensity = 0.48;
    this.sun.color.setHex(0xffffff);
    this.sun.intensity = 1.15;
    this.sun.position.set(16, 28, 12);

    // 360° Grand Slam Arena Sky Dome
    const skyTex = TextureFactory.createStadiumSkyTexture();
    const skyGeo = new THREE.SphereGeometry(75, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    skyGeo.scale(-1, 1, 1);
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.position.set(0, -2, 0);
    this.environmentGroup.add(skyMesh);

    // Surrounding Concrete Concourse Floor
    const floorTex = TextureFactory.createStadiumFloorTexture();
    const floorGeo = new THREE.PlaneGeometry(90, 90);
    const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.8, metalness: 0.1 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.05;
    floorMesh.receiveShadow = true;
    this.environmentGroup.add(floorMesh);

    // Suspended 4-Sided Video Jumbotron Cube
    const jumbotron = new THREE.Group();
    jumbotron.position.set(0, 14.5, 0);
    const jBox = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 4.5, 7.5),
      new THREE.MeshStandardMaterial({ color: 0x070d18, metalness: 0.9, roughness: 0.2 })
    );
    const jCanvas = document.createElement('canvas');
    jCanvas.width = 512; jCanvas.height = 256;
    const jctx = jCanvas.getContext('2d');
    jctx.fillStyle = '#020617'; jctx.fillRect(0, 0, 512, 256);
    jctx.fillStyle = '#ff0055'; jctx.font = '900 24px sans-serif';
    jctx.fillText('EA SPORTS™', 24, 42);
    jctx.fillStyle = '#00f0ff'; jctx.font = 'bold 22px sans-serif';
    jctx.fillText('• GRAND SLAM 4K', 190, 42);
    jctx.fillStyle = '#f59e0b'; jctx.font = 'bold 44px sans-serif';
    jctx.fillText('LIVE MATCH • 4K', 24, 115);
    jctx.fillStyle = '#94a3b8'; jctx.font = '22px sans-serif';
    jctx.fillText('CENTRE COURT • ROLEX TIME', 24, 160);
    const jScreenTex = new THREE.CanvasTexture(jCanvas);
    const jScreenMat = new THREE.MeshBasicMaterial({ map: jScreenTex });
    [-1, 1].forEach(side => {
      const screenZ = new THREE.Mesh(new THREE.PlaneGeometry(7.1, 4.1), jScreenMat);
      screenZ.position.set(0, 0, side * 3.76);
      if (side < 0) screenZ.rotation.y = Math.PI;
      const screenX = new THREE.Mesh(new THREE.PlaneGeometry(7.1, 4.1), jScreenMat);
      screenX.position.set(side * 3.76, 0, 0);
      screenX.rotation.y = side * Math.PI / 2;
      jumbotron.add(screenZ, screenX);
    });
    jumbotron.add(jBox);
    this.environmentGroup.add(jumbotron);
    this.jumbotronCanvas = jCanvas;
    this.jumbotronCtx = jctx;
    this.jumbotronTex = jScreenTex;

    const standMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    const seatBlue = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 });
    const seatRed = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const seatGold = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });

    // Lateral Grandstands with 8 Tiered Rows & 3D Cheering Spectators
    [-1, 1].forEach(side => {
      const xBase = side * 13.5;
      for (let row = 0; row < 8; row++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.70, 36), standMat);
        step.position.set(xBase + side * (row * 1.45), row * 0.70 + 0.35, 0);
        step.receiveShadow = true;
        this.environmentGroup.add(step);

        for (let s = -16; s <= 16; s += 0.9) {
          const sChoice = Math.abs(s + row) % 3;
          const sMat = (sChoice === 0) ? seatBlue : (sChoice === 1 ? seatRed : seatGold);
          const seat = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.48, 0.60), sMat);
          seat.position.set(xBase + side * (row * 1.45), row * 0.70 + 0.76, s);
          this.environmentGroup.add(seat);

          if (Math.sin(s * 2.8 + row * 1.9) > -0.2) {
            const body = new THREE.Mesh(
              new THREE.CylinderGeometry(0.19, 0.23, 0.70, 8),
              new THREE.MeshStandardMaterial({ color: (s * row) % 2 === 0 ? 0x38bdf8 : 0xf43f5e, roughness: 0.9 })
            );
            body.position.set(xBase + side * (row * 1.45), row * 0.70 + 1.22, s);

            const head = new THREE.Mesh(
              new THREE.SphereGeometry(0.14, 8, 8),
              new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.7 })
            );
            head.position.set(xBase + side * (row * 1.45), row * 0.70 + 1.68, s);

            this.environmentGroup.add(body, head);
          }
        }
      }
    });

    // Elevated Umpire High Chair
    const umpireGroup = new THREE.Group();
    umpireGroup.position.set(6.8, 0, 0);
    const uMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });

    [-0.35, 0.35].forEach(lx => {
      [-0.35, 0.35].forEach(lz => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8), uMat);
        leg.position.set(lx, 1.25, lz);
        leg.rotation.z = lx > 0 ? 0.12 : -0.12;
        umpireGroup.add(leg);
      });
    });

    const uPlat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.9), uMat);
    uPlat.position.y = 2.4;
    const uSeat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.6, 0.6), seatMat);
    uSeat.position.set(0, 2.75, 0);
    const uCanopy = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.3 }));
    uCanopy.position.set(0, 3.4, 0);
    umpireGroup.add(uPlat, uSeat, uCanopy);
    this.environmentGroup.add(umpireGroup);

    // Player Benches
    const benchGroup = new THREE.Group();
    benchGroup.position.set(-6.8, 0, 0);
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.6), seatMat);
    b1.position.set(0, 0.3, 2.0);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.6), seatMat);
    b2.position.set(0, 0.3, -2.0);
    benchGroup.add(b1, b2);
    this.environmentGroup.add(benchGroup);

    // LED Ribbon Banners (Animated UVs)
    const ledCanvas = document.createElement('canvas');
    ledCanvas.width = 1024; ledCanvas.height = 128;
    const lctx = ledCanvas.getContext('2d');
    lctx.fillStyle = '#06101e';
    lctx.fillRect(0, 0, 1024, 128);
    lctx.fillStyle = '#ff0055';
    lctx.font = '900 36px sans-serif';
    lctx.fillText('EA SPORTS™', 20, 78);
    lctx.fillStyle = '#00f0ff';
    lctx.font = '900 36px sans-serif';
    lctx.fillText('• GRAND SLAM PRO TOUR •', 260, 78);
    lctx.fillStyle = '#f59e0b';
    lctx.fillText('ROLEX • EMIRATES • WILSON', 740, 78);
    this.ledTex = new THREE.CanvasTexture(ledCanvas);
    this.ledTex.wrapS = THREE.RepeatWrapping;
    this.ledTex.repeat.set(3, 1);
    const ledMat = new THREE.MeshBasicMaterial({ map: this.ledTex });
    const ledGeo = new THREE.PlaneGeometry(34, 1.0);

    const ledLeft = new THREE.Mesh(ledGeo, ledMat);
    ledLeft.position.set(-9.2, 0.50, 0);
    ledLeft.rotation.y = Math.PI / 2;
    const ledRight = new THREE.Mesh(ledGeo, ledMat);
    ledRight.position.set(9.2, 0.50, 0);
    ledRight.rotation.y = -Math.PI / 2;
    this.environmentGroup.add(ledLeft, ledRight);

    // Lens Flare Glare Billboard Texture for Floodlights
    const flareCanvas = document.createElement('canvas');
    flareCanvas.width = flareCanvas.height = 128;
    const fctx = flareCanvas.getContext('2d');
    const grad = fctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(180, 230, 255, 0.7)');
    grad.addColorStop(0.6, 'rgba(0, 180, 255, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    fctx.fillStyle = grad;
    fctx.fillRect(0, 0, 128, 128);
    const flareTex = new THREE.CanvasTexture(flareCanvas);
    const flareMat = new THREE.SpriteMaterial({ map: flareTex, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.85 });

    // 4 Corner Floodlight Towers with Volumetric Cones & Glare Flares
    const lightTowers = [
      { x: -13.0, z: -18.0 }, { x: 13.0, z: -18.0 },
      { x: -13.0, z: 18.0 }, { x: 13.0, z: 18.0 }
    ];
    lightTowers.forEach(t => {
      const spot = new THREE.SpotLight(0xffffff, 0.75, 48, Math.PI / 3.4, 0.45);
      spot.position.set(t.x, 15, t.z);
      spot.target.position.set(0, 0, (t.z > 0 ? 4 : -4));
      this.environmentGroup.add(spot, spot.target);

      const truss = new THREE.Mesh(new THREE.BoxGeometry(0.35, 15, 0.35), uMat);
      truss.position.set(t.x, 7.5, t.z);
      const bank = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 0.9), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      bank.position.set(t.x, 15.2, t.z);

      const flare = new THREE.Sprite(flareMat);
      flare.position.set(t.x * 0.92, 15.3, t.z * 0.92);
      flare.scale.set(6.5, 6.5, 1.0);

      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(4.2, 17, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.04, side: THREE.DoubleSide, depthWrite: false })
      );
      cone.position.set(t.x * 0.7, 7.5, t.z * 0.7);
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(-t.x, -15, -t.z).normalize());

      this.environmentGroup.add(truss, bank, flare, cone);
    });

    this.initCrowdFlashes();

    // Spaceframe Roof Trusses
    for (let z = -15; z <= 15; z += 7.5) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(32, 0.38, 0.38), uMat);
      beam.position.set(0, 16, z);
      this.environmentGroup.add(beam);
    }
  }

  // --- EA SPORTS Dynamic Crowd Camera Flashes & Television Graphics ---
  initCrowdFlashes() {
    this.crowdFlashes = [];
    const flashGeo = new THREE.PlaneGeometry(0.55, 0.55);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(180, 240, 255, 0.85)');
    grad.addColorStop(0.7, 'rgba(0, 180, 255, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const flashTex = new THREE.CanvasTexture(canvas);
    const flashMat = new THREE.MeshBasicMaterial({
      map: flashTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    for (let i = 0; i < 20; i++) {
      const mesh = new THREE.Mesh(flashGeo, flashMat.clone());
      mesh.visible = false;
      this.environmentGroup.add(mesh);
      this.crowdFlashes.push({ mesh, life: 0, maxLife: 0.12 });
    }
  }

  updateCrowdFlashes(dt) {
    if (this.currentMap !== 'stadium' || !this.crowdFlashes) return;

    // Trigger random spectator flashes during active points & fast rallies
    const flashProb = (this.ball && this.ball.vel && this.ball.vel.lengthSq() > 300) ? 0.28 : 0.09;
    if (this.pointActive && Math.random() < flashProb) {
      const flash = this.crowdFlashes.find(f => f.life <= 0);
      if (flash) {
        const side = Math.random() > 0.5 ? 1 : -1;
        const row = Math.floor(Math.random() * 8);
        const s = (Math.random() - 0.5) * 32;
        const xBase = side * 13.5 + side * (row * 1.45);
        const yBase = row * 0.70 + 1.68;
        flash.mesh.position.set(xBase + (Math.random() - 0.5) * 0.4, yBase, s);
        flash.mesh.lookAt(this.camera.position);
        flash.life = flash.maxLife;
        flash.mesh.visible = true;
      }
    }

    for (let i = 0; i < this.crowdFlashes.length; i++) {
      const f = this.crowdFlashes[i];
      if (f.life > 0) {
        f.life -= dt;
        const progress = Math.max(0, f.life / f.maxLife);
        const scale = 1.0 + (1.0 - progress) * 2.8;
        f.mesh.scale.set(scale, scale, scale);
        f.mesh.material.opacity = progress;
        if (f.life <= 0) {
          f.mesh.visible = false;
        }
      }
    }
  }

  updateJumbotronScreen(alertTitle = null, alertSub = null) {
    if (!this.jumbotronCtx || !this.jumbotronTex) return;
    const ctx = this.jumbotronCtx;
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 500, 244);

    ctx.fillStyle = '#ff0055';
    ctx.font = '900 24px sans-serif';
    ctx.fillText('EA SPORTS™', 24, 42);

    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('• GRAND SLAM 4K', 190, 42);

    if (alertTitle) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = '900 46px sans-serif';
      ctx.fillText(alertTitle, 24, 118);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(alertSub || '', 24, 164);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px sans-serif';
      ctx.fillText(`TÚ  ${this.scorePlayer} - ${this.scoreAI}  RIVAL`, 24, 112);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`SETS: ${this.setsPlayer}-${this.setsAI}  |  JUEGOS: ${this.gamesPlayer}-${this.gamesAI}`, 24, 158);
    }

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`RALLY: ${this.rally} GOLPES  •  ROLEX OFFICIAL TIME`, 24, 215);

    this.jumbotronTex.needsUpdate = true;
  }

  triggerBroadcastWipe(callback = null) {
    const wipe = document.getElementById('broadcast-wipe');
    if (!wipe) {
      if (callback) callback();
      return;
    }
    wipe.classList.remove('hidden');
    void wipe.offsetWidth;
    wipe.classList.add('active-wipe');

    setTimeout(() => {
      if (callback) callback();
    }, 450);

    setTimeout(() => {
      wipe.classList.remove('active-wipe');
      setTimeout(() => {
        wipe.classList.add('hidden');
      }, 400);
    }, 1100);
  }

  triggerRadarGun(speedKmH, playerName) {
    const radar = document.getElementById('radar-gun-popup');
    const speedEl = document.getElementById('radar-speed-num');
    const tagEl = document.getElementById('radar-player-tag');
    if (!radar || !speedEl) return;

    speedEl.innerText = speedKmH;
    if (tagEl) tagEl.innerText = playerName || 'SERVICIO';
    radar.classList.remove('hidden');

    if (this._radarTimeout) clearTimeout(this._radarTimeout);
    this._radarTimeout = setTimeout(() => {
      radar.classList.add('hidden');
    }, 2800);
  }

  // 2. Playa Paraíso (Tropical Beach Resort Sunset Setting)
  buildBeachEnvironment() {
    this.scene.background = new THREE.Color(0x1a0c14);
    this.scene.fog = new THREE.FogExp2(0x1a0c14, 0.0055);
    this.ambient.color.setHex(0xfde68a);
    this.ambient.intensity = 0.50;
    this.sun.color.setHex(0xff7733);
    this.sun.intensity = 1.35;
    this.sun.position.set(30, 20, -42);

    // SKY DOME
    const beachSkyTex = TextureFactory.createBeachSkyTexture();
    const beachSkyGeo = new THREE.SphereGeometry(95, 40, 26, 0, Math.PI * 2, 0, Math.PI / 2);
    beachSkyGeo.scale(-1, 1, 1);
    const beachSky = new THREE.Mesh(beachSkyGeo,
      new THREE.MeshBasicMaterial({ map: beachSkyTex, side: THREE.BackSide, depthWrite: false }));
    beachSky.position.set(0, -1, 0);
    this.environmentGroup.add(beachSky);

    // DRY SAND - Surrounding court area
    const sandTex = TextureFactory.createBeachPlainSandTexture();
    const sandMesh = new THREE.Mesh(new THREE.PlaneGeometry(120, 52),
      new THREE.MeshStandardMaterial({ map: sandTex, roughness: 0.92, metalness: 0.02 }));
    sandMesh.rotation.x = -Math.PI / 2;
    sandMesh.position.set(0, -0.04, 4);
    sandMesh.receiveShadow = true;
    this.environmentGroup.add(sandMesh);

    // WET GLISTENING SAND TRANSITION STRIP (Z = -20 to -24)
    // Dark, wet sand reflecting sunset glow right before water edge
    const wetSandMat = new THREE.MeshStandardMaterial({
      color: 0x8a5228,
      roughness: 0.22,
      metalness: 0.28
    });
    const wetSand = new THREE.Mesh(new THREE.PlaneGeometry(140, 5.0), wetSandMat);
    wetSand.rotation.x = -Math.PI / 2;
    wetSand.position.set(0, -0.05, -22.5);
    wetSand.receiveShadow = true;
    this.environmentGroup.add(wetSand);

    // OCEAN - Starts at Z=-22, extends backward 85 units
    const oceanCanvas = document.createElement('canvas');
    oceanCanvas.width = 512; oceanCanvas.height = 512;
    const octx = oceanCanvas.getContext('2d');
    const ocGrad = octx.createLinearGradient(0, 0, 0, 512);
    ocGrad.addColorStop(0.0, '#001a33');
    ocGrad.addColorStop(0.35, '#003b5c');
    ocGrad.addColorStop(0.70, '#005f7a');
    ocGrad.addColorStop(1.0, '#008ba8');
    octx.fillStyle = ocGrad;
    octx.fillRect(0, 0, 512, 512);
    // Sun Shimmer streaks
    for (let i = 0; i < 65; i++) {
      const yy = Math.random() * 512;
      const lg = octx.createLinearGradient(0, yy, 512, yy + 18);
      lg.addColorStop(0,   'rgba(255,200,140,0)');
      lg.addColorStop(0.5, 'rgba(255,220,170,0.85)');
      lg.addColorStop(1,   'rgba(255,200,140,0)');
      octx.globalAlpha = 0.22;
      octx.fillStyle = lg;
      octx.fillRect(0, yy, 512, 2 + Math.random() * 5);
    }
    octx.globalAlpha = 1;
    const oceanTex = new THREE.CanvasTexture(oceanCanvas);
    oceanTex.wrapS = oceanTex.wrapT = THREE.RepeatWrapping;
    oceanTex.repeat.set(4, 4);

    const oceanMat = new THREE.MeshStandardMaterial({
      map: oceanTex,
      color: 0x004466,
      roughness: 0.08,
      metalness: 0.55,
      transparent: false,
      depthWrite: true,
      side: THREE.FrontSide,
    });
    this.oceanMesh = new THREE.Mesh(new THREE.PlaneGeometry(190, 85, 64, 40), oceanMat);
    this.oceanMesh.rotation.x = -Math.PI / 2;
    this.oceanMesh.position.set(0, -0.25, -64.5);
    this.environmentGroup.add(this.oceanMesh);

    // SHORELINE FOAM RIBBON at water boundary Z=-22
    const foamCv = document.createElement('canvas');
    foamCv.width = 512; foamCv.height = 64;
    const fctx = foamCv.getContext('2d');
    const fGrad = fctx.createLinearGradient(0, 0, 0, 64);
    fGrad.addColorStop(0.0, 'rgba(255,255,255,0)');
    fGrad.addColorStop(0.3, 'rgba(255,255,255,0.88)');
    fGrad.addColorStop(0.6, 'rgba(210,245,255,0.60)');
    fGrad.addColorStop(1.0, 'rgba(255,255,255,0)');
    fctx.fillStyle = fGrad;
    fctx.fillRect(0, 0, 512, 64);
    for (let b = 0; b < 70; b++) {
      fctx.globalAlpha = 0.35 + Math.random() * 0.55;
      fctx.beginPath();
      fctx.arc(Math.random() * 512, 12 + Math.random() * 32, 3 + Math.random() * 9, 0, Math.PI * 2);
      fctx.fillStyle = 'white';
      fctx.fill();
    }
    fctx.globalAlpha = 1;
    const foamTex = new THREE.CanvasTexture(foamCv);
    foamTex.wrapS = THREE.RepeatWrapping;
    foamTex.repeat.set(12, 1);
    this.shorelineFoam = new THREE.Mesh(
      new THREE.PlaneGeometry(130, 4.5),
      new THREE.MeshBasicMaterial({ map: foamTex, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide })
    );
    this.shorelineFoam.rotation.x = -Math.PI / 2;
    this.shorelineFoam.position.set(0, 0.03, -22);
    this.shorelineFoam.renderOrder = 2;
    this.environmentGroup.add(this.shorelineFoam);

    // VOLCANIC ISLANDS ON HORIZON
    const islandMat = new THREE.MeshStandardMaterial({ color: 0x121a10, roughness: 0.96 });
    [{x:-54,z:-110,r:30,h:22},{x:4,z:-122,r:36,h:26},{x:62,z:-106,r:26,h:18}].forEach(p => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(p.r, p.h, 10), islandMat);
      cone.position.set(p.x, 4, p.z); cone.scale.set(1.45, 0.48, 1.0);
      this.environmentGroup.add(cone);
    });

    // PALM TREES WITH COCONUTS
    const palmTrunkTex = TextureFactory.createPalmTrunkTexture();
    const palmLeafTex  = TextureFactory.createPalmLeafTexture();
    const trunkMat  = new THREE.MeshStandardMaterial({ map: palmTrunkTex, roughness: 0.88, metalness: 0.04 });
    const leafMat   = new THREE.MeshStandardMaterial({
      map: palmLeafTex, transparent: true, alphaTest: 0.20,
      side: THREE.DoubleSide, roughness: 0.45, metalness: 0.02
    });
    const cocoMat   = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.90 });
    const cocoGreen = new THREE.MeshStandardMaterial({ color: 0x3d6e22, roughness: 0.85 });
    const baseRingM = new THREE.MeshStandardMaterial({ color: 0x6b4520, roughness: 0.92 });
    const huskM     = new THREE.MeshStandardMaterial({ color: 0x4a2a14, roughness: 0.95 });

    const makeFrond = (len, w, arch) => {
      const g = new THREE.PlaneGeometry(w, len, 4, 14);
      const pa = g.attributes.position;
      const hl = len / 2;
      for (let i = 0; i < pa.count; i++) {
        const x = pa.getX(i), y = pa.getY(i), v = (y + hl) / len;
        pa.setXYZ(i, x * (Math.sin(v * Math.PI) * 0.95 + (1-v)*0.12),
          v*len*0.84 - Math.pow(v,2.2)*len*0.46, -Math.pow(v,1.85)*arch);
      }
      g.computeVertexNormals(); return g;
    };
    const upFrond  = makeFrond(5.4, 1.5, 1.75);
    const lowFrond = makeFrond(4.5, 1.3, 2.50);

    const palms = [
      {x:-14,z:-15},{x:14,z:-15},{x:-16,z:-2},{x:16,z:-2},
      {x:-15,z:14}, {x:15,z:14}, {x:-12,z:22},{x:12,z:22},
      {x:-19,z:6},  {x:19,z:6}
    ];
    palms.forEach((pos, idx) => {
      const g = new THREE.Group();
      g.position.set(pos.x, 0, pos.z);
      const lean = idx%2===0 ? 1.5 : -1.5;
      const cv = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0,0,0), new THREE.Vector3(lean*0.3,3,0),
        new THREE.Vector3(lean*1.5,6,0.8), new THREE.Vector3(lean*2.1,8.8,1.4)
      );
      const trunk = new THREE.Mesh(new THREE.TubeGeometry(cv,20,0.28,10,false), trunkMat);
      trunk.castShadow = true;
      g.add(trunk);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.56,0.85,10), baseRingM);
      base.position.y = 0.42; g.add(base);

      const cp = cv.getPoint(1);
      const crown = new THREE.Group();
      crown.position.copy(cp);
      crown.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.20,0.54,8),huskM),{position:new THREE.Vector3(0,-0.24,0)}));

      const cocoN = 5 + idx%3;
      for (let c=0;c<cocoN;c++){
        const a=(c/cocoN)*Math.PI*2, r=0.30+(c%2)*0.08;
        const coco = new THREE.Mesh(new THREE.SphereGeometry(0.19,12,12), c%3===0?cocoMat:cocoGreen);
        coco.scale.set(0.88,1.20,0.88);
        coco.position.set(Math.cos(a)*r,-0.26+(c%2)*0.10,Math.sin(a)*r);
        crown.add(coco);
      }

      for(let f=0;f<12;f++){
        const isUp=f%2===0, fa=(f/12)*Math.PI*2+idx*0.44;
        const fm=new THREE.Mesh(isUp?upFrond:lowFrond,leafMat);
        fm.castShadow=true;
        fm.position.set(Math.cos(fa)*0.22, isUp?0.14:-0.06, Math.sin(fa)*0.22);
        fm.rotation.y=-fa+Math.PI/2; fm.rotation.x=isUp?0.36:0.75;
        crown.add(fm);
      }
      g.add(crown);
      this.environmentGroup.add(g);
    });

    // TIKI TORCHES
    this.tikiTorches=[];
    const tPos=[{x:-8.5,z:-14.5},{x:8.5,z:-14.5},{x:-8.5,z:14.5},{x:8.5,z:14.5}];
    const bambooM=new THREE.MeshStandardMaterial({color:0x7a4a20,roughness:0.72});
    const fireM=new THREE.MeshBasicMaterial({color:0xff8800});
    tPos.forEach((tp,ti)=>{
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.05,2.2,8),bambooM);
      pole.position.set(tp.x,1.1,tp.z);
      const cup=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.08,0.25,8),bambooM);
      cup.position.set(tp.x,2.15,tp.z);
      const flame=new THREE.Mesh(new THREE.ConeGeometry(0.09,0.28,8),fireM);
      flame.position.set(tp.x,2.38,tp.z);
      const light=new THREE.PointLight(0xff6600,0.85,14);
      light.position.set(tp.x,2.5,tp.z);
      this.tikiTorches.push({light,flame,baseIntensity:0.85,seed:ti*2.5});
      this.environmentGroup.add(pole,cup,flame,light);
    });

    // RESORT SUN LOUNGERS & RETRO SURFBOARDS
    const teakM = new THREE.MeshStandardMaterial({ color: 0x543310, roughness: 0.65 });
    const towelM = new THREE.MeshStandardMaterial({ color: 0x00f0ff, roughness: 0.45 });
    [-1, 1].forEach(side => {
      // Teak sun lounger
      const lounger = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.28, 2.1), teakM);
      lounger.position.set(side * 8.5, 0.14, 2.5);
      lounger.rotation.y = side * -0.2;
      const towel = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.05, 1.4), towelM);
      towel.position.set(side * 8.5, 0.30, 2.6);
      towel.rotation.y = side * -0.2;
      this.environmentGroup.add(lounger, towel);
    });

    // Retro Surfboards Propped on Bamboo Stand
    const surfMat1 = new THREE.MeshStandardMaterial({ color: 0xff007f, roughness: 0.25, metalness: 0.1 });
    const surfMat2 = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.25, metalness: 0.1 });
    const boardGeo = new THREE.BoxGeometry(0.48, 2.2, 0.08);
    const b1 = new THREE.Mesh(boardGeo, surfMat1);
    b1.position.set(-8.8, 1.05, -3.5); b1.rotation.set(0.2, 0.3, 0.1);
    const b2 = new THREE.Mesh(boardGeo, surfMat2);
    b2.position.set(-8.3, 1.05, -3.2); b2.rotation.set(0.18, 0.1, 0.08);
    this.environmentGroup.add(b1, b2);
  }

  // 3. Templo Zen Imperial (Kyoto Japanese Ancestral Temple Twilight Setting)
  buildZenEnvironment() {
    this.scene.background = new THREE.Color(0x160f22);
    this.scene.fog = new THREE.FogExp2(0x160f22, 0.010);
    this.ambient.color.setHex(0x5c3d70);
    this.ambient.intensity = 0.68;
    this.sun.color.setHex(0xb197fc);
    this.sun.intensity = 1.25;
    this.sun.position.set(-18, 22, -24);

    // 360° Kyoto Zen Mountain Twilight Sky Dome
    const zenSkyTex = TextureFactory.createZenSkyTexture();
    const zenSkyGeo = new THREE.SphereGeometry(85, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    zenSkyGeo.scale(-1, 1, 1);
    const zenSkyMat = new THREE.MeshBasicMaterial({ map: zenSkyTex, side: THREE.BackSide });
    const zenSky = new THREE.Mesh(zenSkyGeo, zenSkyMat);
    zenSky.position.set(0, -2, 0);
    this.environmentGroup.add(zenSky);

    // Surrounding Raked Zen Stone Gravel Garden Terrain
    const zenGeo = new THREE.PlaneGeometry(100, 100);
    const zenTex = TextureFactory.createZenStoneTexture();
    const zenMat = new THREE.MeshStandardMaterial({
      map: zenTex,
      roughness: 0.90,
      metalness: 0.10
    });
    const zenGravel = new THREE.Mesh(zenGeo, zenMat);
    zenGravel.rotation.x = -Math.PI / 2;
    zenGravel.position.y = -0.04;
    zenGravel.receiveShadow = true;
    this.environmentGroup.add(zenGravel);

    const toriiMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.35, metalness: 0.15 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.85 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x1f1924, roughness: 0.75 });
    const tileMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });

    // 2 Majestic Crimson Torii Gates behind Baselines
    [-18.5, 18.5].forEach(zPos => {
      const torii = new THREE.Group();
      torii.position.set(0, 0, zPos);

      // Two Main Crimson Columns
      [-3.6, 3.6].forEach(x => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 6.2, 16), toriiMat);
        pillar.position.set(x, 3.1, 0);
        pillar.castShadow = true;
        const baseStone = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.5, 16), woodMat);
        baseStone.position.set(x, 0.25, 0);
        torii.add(pillar, baseStone);
      });

      // Upper Curved Kasagi Beam with Gold Accent Ends
      const topBeam = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.42, 0.52), toriiMat);
      topBeam.position.set(0, 5.9, 0);
      const topCap = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.16, 0.62), tileMat);
      topCap.position.set(0, 6.16, 0);

      const goldEndL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.46, 0.56), goldMat);
      goldEndL.position.set(-4.5, 5.9, 0);
      const goldEndR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.46, 0.56), goldMat);
      goldEndR.position.set(4.5, 5.9, 0);

      // Nuki Crossbeam
      const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.28, 0.32), toriiMat);
      crossBeam.position.set(0, 4.8, 0);

      torii.add(topBeam, topCap, goldEndL, goldEndR, crossBeam);
      this.environmentGroup.add(torii);
    });

    // 2 Traditional Multi-Tiered Japanese Pagodas
    [-17, 17].forEach((xSide, pIdx) => {
      const pagoda = new THREE.Group();
      pagoda.position.set(xSide, 0, 0);

      // 4 Tiered Pagoda Roofs
      for (let tier = 0; tier < 4; tier++) {
        const y = tier * 3.2;
        const w = 6.4 - tier * 0.9;
        const body = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 2.2, w * 0.7), woodMat);
        body.position.set(0, y + 1.1, 0);

        // Flared Curved Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.9, 1.2, 4), tileMat);
        roof.position.set(0, y + 2.6, 0);
        roof.rotation.y = Math.PI / 4;

        pagoda.add(body, roof);
      }

      // Ornamental Spire (Sorin)
      const sorin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.14, 3.5, 8), goldMat);
      sorin.position.set(0, 14.5, 0);
      pagoda.add(sorin);

      this.environmentGroup.add(pagoda);
    });

    // 6 Traditional Stone Toro Lanterns with Warm Candlelight
    const toroPositions = [
      { x: -7.8, z: -10 }, { x: 7.8, z: -10 },
      { x: -7.8, z: 0 },   { x: 7.8, z: 0 },
      { x: -7.8, z: 10 },  { x: 7.8, z: 10 }
    ];
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
    const paperGlow = new THREE.MeshBasicMaterial({ color: 0xffe57f });

    toroPositions.forEach(pos => {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.4, 8), stoneMat);
      base.position.set(pos.x, 0.2, pos.z);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 1.1, 8), stoneMat);
      post.position.set(pos.x, 0.9, pos.z);
      const platform = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 0.65), stoneMat);
      platform.position.set(pos.x, 1.5, pos.z);

      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.42), paperGlow);
      lamp.position.set(pos.x, 1.78, pos.z);

      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.38, 6), stoneMat);
      roof.position.set(pos.x, 2.18, pos.z);

      const pLight = new THREE.PointLight(0xffaa22, 1.4, 10);
      pLight.position.set(pos.x, 1.8, pos.z);

      this.environmentGroup.add(base, post, platform, lamp, roof, pLight);
    });

    // Bamboo Perimeter Fences
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x3f2d1c, roughness: 0.8 });
    [-9.6, 9.6].forEach(fx => {
      for (let fz = -14; fz <= 14; fz += 2.2) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.4, 8), fenceMat);
        post.position.set(fx, 0.7, fz);
        this.environmentGroup.add(post);
      }
      const rail1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 30), fenceMat);
      rail1.position.set(fx, 1.1, 0);
      const rail2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 30), fenceMat);
      rail2.position.set(fx, 0.5, 0);
      this.environmentGroup.add(rail1, rail2);
    });
  }

  // --- AAA Athletic Character Model (Sculpted Anatomy & Carbon Fiber Racket) ---
  createProAthlete(jerseyColor, shortsColor, accentHex, jerseyNumber, isAI = false, gender = 'male') {
    const root = new THREE.Group();

    const isFemale = (gender === 'female');
    const jColorStr = isAI ? '#ff2a55' : '#00f0ff';
    const jAccentStr = isAI ? '#ffdd00' : '#ffffff';

    // Warm Athletic Subsurface Skin with Micro-Pores & Tone Texture
    const skinTex = TextureFactory.createAthleteSkinTexture(isAI);
    const skinMat = new THREE.MeshStandardMaterial({
      map: skinTex,
      roughness: 0.44,
      metalness: 0.04
    });

    // Technical Athletic Jersey Material
    const jerseyTex = TextureFactory.createJerseyTexture(jColorStr, jAccentStr, jerseyNumber, isAI);
    const jerseyMat = new THREE.MeshStandardMaterial({
      map: jerseyTex,
      roughness: 0.38,
      metalness: 0.12
    });

    const collarMat = new THREE.MeshStandardMaterial({
      color: isAI ? 0xffdd00 : 0xffffff,
      roughness: 0.45
    });

    // 1. Sculpted Anatomical Torso (V-Taper Chest, Pectorals, Latissimus & Trapezius)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.98;

    // Main Chest V-Taper (wider across shoulders, narrower front-to-back)
    const chestWidth = isFemale ? 0.23 : 0.26;
    const chestGeo = new THREE.CylinderGeometry(chestWidth, 0.18, 0.40, 24);
    const chest = new THREE.Mesh(chestGeo, jerseyMat);
    chest.scale.set(1.18, 1.0, 0.92);
    chest.position.y = 0.12;
    chest.castShadow = true;
    torsoGroup.add(chest);

    // Anatomical Left & Right Pectoral Muscle Plates with Sternum Cleavage
    [-1, 1].forEach(side => {
      const pec = new THREE.Mesh(
        new THREE.BoxGeometry(0.10, isFemale ? 0.09 : 0.12, 0.038),
        jerseyMat
      );
      pec.position.set(side * 0.065, isFemale ? 0.12 : 0.15, 0.135);
      pec.rotation.set(0.08, side * 0.12, side * -0.05);
      torsoGroup.add(pec);
    });

    // Latissimus Dorsi Taper Flares (lateral back & rib taper)
    [-1, 1].forEach(side => {
      const lat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.020, 0.28, 10),
        jerseyMat
      );
      lat.position.set(side * 0.18, 0.10, -0.03);
      lat.rotation.z = side * -0.15;
      torsoGroup.add(lat);
    });

    // Anatomical Clavicle (Collarbone) Ridge
    const clavicle = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.018, 0.024), collarMat);
    clavicle.position.set(0, 0.29, 0.11);
    torsoGroup.add(clavicle);

    // Trapezius Muscle Slopes connecting neck to shoulders
    [-1, 1].forEach(side => {
      const trap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 0.11, 12), collarMat);
      trap.position.set(side * 0.14, 0.27, -0.02);
      trap.rotation.z = side * 0.38;
      torsoGroup.add(trap);
    });

    // Rib-Knit Polo Collar & Front Button Placket
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.092, 0.018, 8, 24), collarMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.31;

    const placket = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.16, 0.015), collarMat);
    placket.position.set(0, 0.22, 0.24);

    // 2 3D Buttons
    const buttonMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const btn1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.005, 8), buttonMat);
    btn1.position.set(0, 0.25, 0.25); btn1.rotation.x = Math.PI / 2;
    const btn2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.005, 8), buttonMat);
    btn2.position.set(0, 0.19, 0.25); btn2.rotation.x = Math.PI / 2;
    torsoGroup.add(collar, placket, btn1, btn2);

    // Performance Bottom: Athletic Shorts (Male) or Pleated Tennis Skirt (Female)
    const shortsTex = TextureFactory.createAthleteShortsTexture(shortsColor, accentHex);
    const waistMat  = new THREE.MeshStandardMaterial({ map: shortsTex, roughness: 0.58, metalness: 0.08 });

    if (isFemale) {
      // Elastic Athletic Waistband
      const wb = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.10, 24), waistMat);
      wb.position.y = -0.05;
      torsoGroup.add(wb);

      // Flared Pleated Skirt Panels with Dynamic Aerodynamic Spread
      for (let p = 0; p < 10; p++) {
        const ang = (p / 10) * Math.PI * 2;
        const pleat = new THREE.Mesh(
          new THREE.CylinderGeometry(0.068, 0.125, 0.30, 8),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 })
        );
        pleat.position.set(Math.cos(ang) * 0.155, -0.26, Math.sin(ang) * 0.155);
        pleat.rotation.z = Math.cos(ang) * 0.14;
        torsoGroup.add(pleat);
      }
      const under = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.18, 24), waistMat);
      under.position.y = -0.26;
      torsoGroup.add(under);
    } else {
      // Athletic Shorts with Crotch Seam & Thigh Leg Openings
      const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.19, 0.24, 24), waistMat);
      waist.position.y = -0.12;
      waist.castShadow = true;
      torsoGroup.add(waist);

      // Left and Right Shorts Leg Cuffs
      [-1, 1].forEach(side => {
        const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.115, 0.14, 16), waistMat);
        cuff.position.set(side * 0.10, -0.25, 0);
        cuff.rotation.z = side * -0.06;
        torsoGroup.add(cuff);
      });
    }

    // Contoured Neck with Sternocleidomastoid Muscle Definition
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.088, 0.15, 16), skinMat);
    neck.position.y = 0.36;
    torsoGroup.add(neck);

    root.add(torsoGroup);

    // 2. Sculpted Athletic Head (Cranium + Mandibular Jaw & Chin, 3D Nose, Ears, Headband)
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.48;

    const faceTex = TextureFactory.createAthleteFaceTexture(isAI);
    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      roughness: 0.42,
      metalness: 0.04
    });

    // Anatomical Cranium Dome
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.138, 32, 28), faceMat);
    head.scale.set(1.0, 1.08, 1.04);
    head.castShadow = true;

    // Sculpted Athletic Chin & Mandibular Jawline (Removes round ball / Roblox look)
    const chin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.08), skinMat);
    chin.position.set(0, -0.10, 0.05);
    chin.rotation.x = 0.25;

    // Jawline lateral tapers
    [-1, 1].forEach(side => {
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.055, 0.09), skinMat);
      jaw.position.set(side * 0.08, -0.065, 0.01);
      jaw.rotation.y = side * -0.28;
      jaw.rotation.z = side * -0.15;
      headGroup.add(jaw);
    });

    // 3D Brow Ridge
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.024, 0.035), skinMat);
    brow.position.set(0, 0.035, 0.132);

    // Sculpted 3D Nose with Bridge and Nostrils
    const noseBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.022, 0.065, 8), skinMat);
    noseBridge.position.set(0, -0.015, 0.144);
    noseBridge.rotation.x = 0.35;

    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), skinMat);
    noseTip.position.set(0, -0.042, 0.152);

    // Anatomical 3D Ears (Helix, Concha & Lobule)
    const earGeo = new THREE.TorusGeometry(0.028, 0.009, 8, 16, Math.PI);
    const lEar = new THREE.Mesh(earGeo, skinMat);
    lEar.position.set(-0.142, 0.01, 0.01); lEar.rotation.y = -Math.PI / 2;
    const rEar = new THREE.Mesh(earGeo, skinMat);
    rEar.position.set(0.142, 0.01, 0.01); rEar.rotation.y = Math.PI / 2;

    // Layered Textured Athletic Haircut
    const hairMat = new THREE.MeshStandardMaterial({
      color: isAI ? 0x1a120b : 0x241710,
      roughness: 0.72
    });
    const hairBack = new THREE.Mesh(
      new THREE.SphereGeometry(0.146, 20, 16, 0, Math.PI * 2, 0, Math.PI / 1.65),
      hairMat
    );
    hairBack.position.set(0, 0.02, -0.015);

    // Front dynamic hair tufts / bangs
    const hairBangs = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.07, 8), hairMat);
    hairBangs.position.set(0, 0.11, 0.10);
    hairBangs.rotation.x = -0.55;

    // Pro Visor / Backward Cap with Sweatband
    const capMat = new THREE.MeshStandardMaterial({
      color: isAI ? 0x0f172a : 0xffffff,
      roughness: 0.40,
      metalness: 0.15
    });
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.148, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
    cap.position.y = 0.028;

    // Elastic Ribbed Headband with Fluttering Rear Tie Ribbons
    const sweatBandMat = new THREE.MeshStandardMaterial({ color: isAI ? 0xff2a55 : 0x0284c7, roughness: 0.8 });
    const sweatband = new THREE.Mesh(new THREE.TorusGeometry(0.144, 0.016, 8, 24), sweatBandMat);
    sweatband.rotation.x = Math.PI / 2;
    sweatband.position.y = 0.022;

    // Rear Knot & Fluttering Ribbons
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), sweatBandMat);
    knot.position.set(0, 0.022, -0.152);
    const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.12, 0.005), sweatBandMat);
    ribbon1.position.set(-0.015, -0.04, -0.16);
    ribbon1.rotation.set(0.2, 0.1, -0.15);
    const ribbon2 = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.14, 0.005), sweatBandMat);
    ribbon2.position.set(0.015, -0.05, -0.16);
    ribbon2.rotation.set(0.25, -0.1, 0.15);

    const brim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.165, 0.165, 0.018, 20, 1, false, -Math.PI / 3, (2 * Math.PI) / 3),
      capMat
    );
    brim.position.set(0, 0.048, 0.10);
    brim.rotation.x = 0.18;

    // Aerodynamic Polarized Sport Sunglasses with Mirror Reflection
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: isAI ? 0xff0055 : 0x00f0ff,
      metalness: 0.95,
      roughness: 0.04,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });
    const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.038, 0.12), lensMat);
    glasses.position.set(0, 0.01, 0.10);

    headGroup.add(
      head, chin, brow, noseBridge, noseTip,
      lEar, rEar, hairBack, hairBangs, cap, sweatband, knot, ribbon1, ribbon2, brim, glasses
    );

    // Female Ponytail Hair Addition
    if (isFemale) {
      const tailM = new THREE.MeshStandardMaterial({ color: isAI ? 0x1a120b : 0x241710, roughness: 0.65 });
      const tail  = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.038, 0.30, 12), tailM);
      tail.position.set(0, -0.12, -0.14); tail.rotation.x = 0.54;
      const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), tailM);
      tailTip.position.set(0, -0.32, -0.24);
      headGroup.add(tail, tailTip);
      [-0.10, 0.10].forEach(sx => {
        const sh = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 10), hairMat);
        sh.position.set(sx, -0.06, -0.04); headGroup.add(sh);
      });
    }
    root.add(headGroup);

    // 3. Anatomically Sculpted Legs & Pro Tennis Sneakers (NO ROBLOX BOX SHOES!)
    const createLeg = (isRight) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(isRight ? 0.12 : -0.12, 0.78, 0);

      // Thigh Core (Femur)
      const thigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.095, 0.072, 0.40, 20),
        skinMat
      );
      thigh.position.y = -0.20;
      thigh.castShadow = true;
      legGroup.add(thigh);

      // Sculpted Quadriceps Muscle Bulge (Rectus Femoris & Vastus Lateralis)
      const quadBulge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.060, 0.042, 0.28, 12),
        skinMat
      );
      quadBulge.position.set(isRight ? 0.015 : -0.015, -0.16, 0.038);
      quadBulge.rotation.z = isRight ? -0.08 : 0.08;
      legGroup.add(quadBulge);

      // Hamstring Arch Contour on Posterior Face
      const hamstring = new THREE.Mesh(
        new THREE.CylinderGeometry(0.052, 0.040, 0.26, 12),
        skinMat
      );
      hamstring.position.set(0, -0.17, -0.035);
      legGroup.add(hamstring);

      // Knee Group (Articulated at patella)
      const kneeGroup = new THREE.Group();
      kneeGroup.position.y = -0.40;

      // Patella Kneecap Bone Contour
      const patella = new THREE.Mesh(
        new THREE.SphereGeometry(0.036, 12, 10),
        skinMat
      );
      patella.scale.set(1.0, 1.25, 0.65);
      patella.position.set(0, 0, 0.062);
      kneeGroup.add(patella);

      // Sculpted Calf (Gastrocnemius Muscle Bellies & Achilles Tendon)
      const calf = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.052, 0.38, 20),
        skinMat
      );
      calf.position.y = -0.19;
      calf.castShadow = true;
      kneeGroup.add(calf);

      // Calf Gastrocnemius Twin Muscle Bulge
      const calfMusc = new THREE.Mesh(
        new THREE.SphereGeometry(0.058, 14, 12),
        skinMat
      );
      calfMusc.scale.set(1.18, 1.75, 1.05);
      calfMusc.position.set(0, -0.12, -0.032);
      kneeGroup.add(calfMusc);

      // Athletic Crew Tennis Socks with Dual Retro Stripes
      const sockMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
      const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.056, 0.14, 16), sockMat);
      sock.position.y = -0.31;

      const stripeMat = new THREE.MeshStandardMaterial({ color: isAI ? 0xdc2626 : 0x0284c7 });
      const sRing = new THREE.Mesh(new THREE.TorusGeometry(0.059, 0.005, 6, 16), stripeMat);
      sRing.rotation.x = Math.PI / 2;
      sRing.position.y = -0.26;
      kneeGroup.add(sock, sRing);

      // STATE-OF-THE-ART PRO TENNIS SNEAKER (Ergonomic Curved Silhouette, Cushioning Window, Laces)
      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(0, -0.38, 0.05);

      const shoeUpperMat = new THREE.MeshStandardMaterial({
        color: isRight ? 0xffffff : (isAI ? 0x111827 : 0x0f172a),
        roughness: 0.38,
        metalness: 0.12
      });

      // Aerodynamic Curved Upper Body with Toe Spring
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.072, 0.26), shoeUpperMat);
      upper.position.set(0, 0.01, 0.01);
      upper.castShadow = true;

      // Curved Toe Spring Box (Tapered front curving up for realistic running stance)
      const toeSpring = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.08, 12), shoeUpperMat);
      toeSpring.rotation.z = Math.PI / 2;
      toeSpring.rotation.x = -0.22; // upward curl
      toeSpring.position.set(0, 0.015, 0.12);
      toeSpring.scale.set(0.95, 1.0, 0.55);

      // Molded Dual-Density EVA Midsole with Sculpted Rocker Sole
      const soleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.65 });
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.134, 0.032, 0.28), soleMat);
      sole.position.set(0, -0.040, 0.015);

      // Visible Cushioning Window / GEL Insert in Heel
      const cushionMat = new THREE.MeshStandardMaterial({
        color: isAI ? 0xff2a55 : 0x00f0ff,
        metalness: 0.6,
        roughness: 0.2
      });
      const cushionWindow = new THREE.Mesh(new THREE.BoxGeometry(0.136, 0.016, 0.07), cushionMat);
      cushionWindow.position.set(0, -0.038, -0.07);

      // Durable Gum Rubber Outsole with Lateral Outrigger Claw for Tennis Stability
      const outsoleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
      const outsole = new THREE.Mesh(new THREE.BoxGeometry(0.138, 0.014, 0.284), outsoleMat);
      outsole.position.set(0, -0.055, 0.015);

      // Lateral Outrigger Stability Wing
      const outrigger = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.016, 0.08), outsoleMat);
      outrigger.position.set(isRight ? 0.072 : -0.072, -0.048, 0.04);

      // 3D Padded Tongue
      const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.035, 0.09), shoeUpperMat);
      tongue.position.set(0, 0.050, 0.04);
      tongue.rotation.x = -0.35;

      // 3D Eyelet Lace Lattice & Tied Lace Knot with Ribbon Tails
      const laceMat = new THREE.MeshStandardMaterial({ color: isAI ? 0xff2a55 : 0x00f0ff });
      const lace = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.018, 0.11), laceMat);
      lace.position.set(0, 0.046, 0.03);

      const laceBow = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.005, 6, 12), laceMat);
      laceBow.rotation.x = Math.PI / 2;
      laceBow.position.set(0, 0.062, -0.01);

      // Side Branding Speed Streak
      const streakMat = new THREE.MeshStandardMaterial({ color: isAI ? 0xffdd00 : 0x0284c7 });
      [-1, 1].forEach(sSide => {
        const streak = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.018, 0.12), streakMat);
        streak.position.set(sSide * 0.065, 0.012, 0.01);
        streak.rotation.y = sSide * 0.08;
        shoeGroup.add(streak);
      });

      shoeGroup.add(upper, toeSpring, sole, cushionWindow, outsole, outrigger, tongue, lace, laceBow);
      kneeGroup.add(shoeGroup);

      legGroup.add(kneeGroup);
      return { legGroup, kneeGroup };
    };

    const leftLegData = createLeg(false);
    const rightLegData = createLeg(true);
    root.add(leftLegData.legGroup, rightLegData.legGroup);

    // 4. Sculpted Muscular Arms (Deltoid Caps, Biceps/Triceps, Flared Forearm & Hands)
    const armGeo = new THREE.CylinderGeometry(0.070, 0.056, 0.32, 18);
    const forearmGeo = new THREE.CylinderGeometry(0.058, 0.044, 0.30, 18);

    // Left Arm (With Smart Fitness Band)
    const lArmGroup = new THREE.Group();
    lArmGroup.position.set(-0.28, 1.25, 0);

    // Sculpted 3-Headed Deltoid Shoulder Cap
    const lDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.078, 18, 16), skinMat);
    lDeltoid.scale.set(1.10, 1.20, 1.05);
    lDeltoid.position.y = 0.01;
    const lUpper = new THREE.Mesh(armGeo, skinMat);
    lUpper.position.y = -0.16;
    lArmGroup.add(lDeltoid, lUpper);

    // Biceps / Triceps Contour
    const lBiceps = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.030, 0.18, 12), skinMat);
    lBiceps.position.set(0, -0.14, 0.024);
    lArmGroup.add(lBiceps);

    // Forearm with Brachioradialis Muscle Curve
    const lFore = new THREE.Mesh(forearmGeo, skinMat);
    lFore.position.y = -0.45;
    const lBrachio = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.020, 0.16, 10), skinMat);
    lBrachio.position.set(-0.020, -0.40, 0.015);
    lArmGroup.add(lFore, lBrachio);

    // Smart Fitness Watch on Left Wrist
    const watchBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.048, 0.035, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    watchBand.position.y = -0.56;
    const watchScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.01, 0.038),
      new THREE.MeshBasicMaterial({ color: 0x00ffaa })
    );
    watchScreen.position.set(0, -0.56, 0.05);
    lArmGroup.add(watchBand, watchScreen);
    root.add(lArmGroup);

    // Left Hand with Articulated Fingers
    const lHandGroup = new THREE.Group();
    lHandGroup.position.y = -0.61;
    const lPalm = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.052, 0.024), skinMat);
    lHandGroup.add(lPalm);
    lArmGroup.add(lHandGroup);

    // Right Arm (Dominant Playing Arm with Compression Sleeve & Sweatband)
    const rArmGroup = new THREE.Group();
    rArmGroup.position.set(0.28, 1.25, 0);

    const rDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.078, 18, 16), skinMat);
    rDeltoid.scale.set(1.10, 1.20, 1.05);
    rDeltoid.position.y = 0.01;

    // Technical Compression Sleeve
    const sleeveMat = new THREE.MeshStandardMaterial({
      color: isAI ? 0xdc2626 : 0x0284c7,
      roughness: 0.45
    });
    const rUpper = new THREE.Mesh(armGeo, sleeveMat);
    rUpper.position.y = -0.16;
    rArmGroup.add(rDeltoid, rUpper);

    const rFore = new THREE.Mesh(forearmGeo, skinMat);
    rFore.position.y = -0.45;
    const rBrachio = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.020, 0.16, 10), skinMat);
    rBrachio.position.set(0.020, -0.40, 0.015);
    rArmGroup.add(rFore, rBrachio);

    // Dominant Wrist Sweatband
    const rSweatband = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.048, 0.06, 16),
      new THREE.MeshStandardMaterial({ color: isAI ? 0xffdd00 : 0xffffff, roughness: 0.8 })
    );
    rSweatband.position.y = -0.56;
    rArmGroup.add(rSweatband);

    // Articulated Hand Wrapping around Racket Handle (5 Anatomical Curved Fingers)
    const rHandGroup = new THREE.Group();
    rHandGroup.position.y = -0.61;

    // Muscular Palm with Thenar Pad
    const rPalm = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.054, 0.026), skinMat);
    const rThenar = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), skinMat);
    rThenar.position.set(-0.020, -0.012, 0.015);
    rHandGroup.add(rPalm, rThenar);

    // 4 Articulated Wrapping Fingers
    for (let f = 0; f < 4; f++) {
      const fy = -0.018 + f * 0.012;
      const pPhal = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.028, 8), skinMat);
      pPhal.position.set(0.022, fy, 0.015);
      pPhal.rotation.z = Math.PI / 2;
      pPhal.rotation.y = 0.45;

      const dPhal = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.024, 8), skinMat);
      dPhal.position.set(0.020, fy, 0.038);
      dPhal.rotation.x = -Math.PI / 2.2;

      rHandGroup.add(pPhal, dPhal);
    }

    // 5. Authentic Carbon-Fiber Aerodynamic Strung Tennis Racket
    const racketGroup = new THREE.Group();
    racketGroup.position.set(0.005, -0.06, 0.025);
    racketGroup.rotation.set(-0.15, 0.05, 0.08);

    // Perforated Overgrip Handle with Finishing Collar Tape
    const gripTex = TextureFactory.createPerforatedGripTexture();
    const handleMat = new THREE.MeshStandardMaterial({
      map: gripTex,
      roughness: 0.48,
      metalness: 0.08
    });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.33, 16), handleMat);
    handle.position.y = 0.165;
    racketGroup.add(handle);

    // Flared Butt Cap with Gold Tournament Emblem
    const buttCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.033, 0.025, 0.032, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.3 })
    );
    buttCap.position.y = 0.01;
    racketGroup.add(buttCap);

    // Aerodynamic V-Throat with Carbon Fiber Texture
    const carbonTex = TextureFactory.createCarbonFiberTexture();
    const carbonMat = new THREE.MeshStandardMaterial({
      map: carbonTex,
      color: 0x242d38,
      metalness: 0.85,
      roughness: 0.22
    });

    const pylonGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.17, 12);
    const pL = new THREE.Mesh(pylonGeo, carbonMat);
    pL.position.set(-0.044, 0.37, 0); pL.rotation.z = -0.34;
    const pR = new THREE.Mesh(pylonGeo, carbonMat);
    pR.position.set(0.044, 0.37, 0); pR.rotation.z = 0.34;
    racketGroup.add(pL, pR);

    // Elliptical Aerodynamic Hoop Frame
    const hoopMat = new THREE.MeshPhysicalMaterial({
      color: isAI ? 0xdc2626 : 0x0284c7,
      metalness: 0.90,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.023, 12, 40), hoopMat);
    hoop.scale.set(0.95, 1.35, 1.0);
    hoop.position.y = 0.57;
    racketGroup.add(hoop);

    // Head Bumper Guard along outer hoop tip
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const bumper = new THREE.Mesh(new THREE.TorusGeometry(0.244, 0.008, 8, 20, Math.PI), bumperMat);
    bumper.scale.set(0.95, 1.35, 1.0);
    bumper.position.y = 0.57;
    racketGroup.add(bumper);

    // High-Tension Cross-Strung String Bed with Stencil Logo
    const stringTex = TextureFactory.createRacketFaceTexture(accentHex);
    const stringMat = new THREE.MeshStandardMaterial({
      map: stringTex,
      transparent: true,
      opacity: 0.90,
      roughness: 0.12,
      metalness: 0.15,
      side: THREE.DoubleSide
    });
    const stringPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.62), stringMat);
    stringPlane.position.y = 0.57;
    racketGroup.add(stringPlane);

    // Silicone Vibration Dampener (Donut button in bottom strings)
    const dampener = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.015, 12),
      new THREE.MeshStandardMaterial({ color: isAI ? 0xffdd00 : 0x00f0ff, roughness: 0.4 })
    );
    dampener.rotation.x = Math.PI / 2;
    dampener.position.set(0, 0.33, 0);
    racketGroup.add(dampener);

    rHandGroup.add(racketGroup);
    rArmGroup.add(rHandGroup);
    root.add(rArmGroup);

    // Athlete Dynamic Contact Shadow
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.62, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.015;
    root.add(shadow);

    const athlete = isAI ? this.ai : this.player;
    athlete.limbs = {
      torso: torsoGroup,
      head: headGroup,
      lLeg: leftLegData.legGroup,
      rLeg: rightLegData.legGroup,
      lCalf: leftLegData.kneeGroup,
      rCalf: rightLegData.kneeGroup,
      lArm: lArmGroup,
      rArm: rArmGroup,
      rFore: rFore,
      lFore: lFore,
      rHand: rHandGroup,
      lHand: lHandGroup,
      racket: racketGroup
    };

    return root;
  }
  // --- Tennis Ball Model with Seam Spin & Projection Ring ---
  buildBall() {
    const { colorTex, bumpTex } = TextureFactory.createBallTextures();
    const ballGeo = new THREE.SphereGeometry(this.ballRadius, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({
      map: colorTex,
      bumpMap: bumpTex,
      bumpScale: 0.025,
      roughness: 0.68,
      metalness: 0.05
    });

    this.ball.mesh = new THREE.Mesh(ballGeo, ballMat);
    this.ball.mesh.castShadow = true;
    this.scene.add(this.ball.mesh);

    // Ball Floor Shadow
    this.ball.shadow = new THREE.Mesh(
      new THREE.CircleGeometry(this.ballRadius * 1.5, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.65 })
    );
    this.ball.shadow.rotation.x = -Math.PI / 2;
    this.ball.shadow.position.y = 0.015;
    this.scene.add(this.ball.shadow);

    // Court Projected Landing Ring
    this.ball.targetMarker = new THREE.Mesh(
      new THREE.RingGeometry(0.18, 0.28, 24),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    this.ball.targetMarker.rotation.x = -Math.PI / 2;
    this.ball.targetMarker.position.y = 0.02;
    this.scene.add(this.ball.targetMarker);
  }

  // --- Inputs ---
  initInputs() {
    this.initTouchControls();
    window.addEventListener('keydown', (e) => {
      // Don't intercept game shortcuts or record keys if typing in input field
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        if (e.code === 'Enter') {
          document.activeElement.blur();
        }
        return;
      }

      this.keys[e.key.toLowerCase()] = true;
      this.audio.init();

      // Only start AI game if we are on the AI tab and NOT connecting/waiting for online
      if (!this.isPlaying && (e.code === 'Space' || e.code === 'Enter')) {
        if (this.isConnecting) return; // Don't start AI while connecting online
        if (this.gameMode !== 'ai') return; // Only auto-start from AI tab
        this.applyProfileAndStart('ai');
        return;
      }

      if (e.key.toLowerCase() === 'l') {
        this.shotType = 'GLOBO';
        document.getElementById('current-shot').innerText = 'GLOBO (LOB)';
      } else if (e.key.toLowerCase() === 'e') {
        this.shotType = 'SMASH';
        document.getElementById('current-shot').innerText = 'SMASH (REMATE)';
      } else if (e.key.toLowerCase() === 'c') {
        this.shotType = 'SLICE';
        document.getElementById('current-shot').innerText = 'SLICE (CORTADO)';
      }

      if (e.key === '1') this.setCameraMode('third');
      if (e.key === '2') this.setCameraMode('broadcast');
      if (e.key === '3') this.setCameraMode('top');

      // M toggles Addictive Music On/Off
      if (e.key.toLowerCase() === 'm') {
        this.audio.toggleMusic();
      }

      // R toggles Tactical Radar Minimap On/Off (never obstructs gameplay)
      if (e.key.toLowerCase() === 'r') {
        this.toggleMinimap();
      }

      // V cycles arenas/maps
      if (e.key.toLowerCase() === 'v') {
        this.cycleMap();
      }

      if (e.code === 'Space') {
        this.handleActionPress();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
      this.keys[e.key.toLowerCase()] = false;
      if (e.code === 'Space') {
        this.handleActionRelease();
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (e.target.closest('.overlay-modal') || e.target.closest('button') || e.target.closest('input')) return;
      this.handleActionPress();
    });

    window.addEventListener('mouseup', (e) => {
      if (e.target.closest('.overlay-modal') || e.target.closest('button') || e.target.closest('input')) return;
      this.handleActionRelease();
    });
  }


  // --- Mobile Virtual Touch Controls & Device Detection ---
  initTouchControls() {
    // 1. Controls Preferences Selector (Auto / Mobile / PC)
    const ctrlBtns = document.querySelectorAll('.control-pref-btn');
    ctrlBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setControlMode(btn.dataset.control);
      });
    });

    // 2. HUD Quick Toggle Button
    const hudCtrlBtn = document.getElementById('btn-toggle-controls');
    if (hudCtrlBtn) {
      hudCtrlBtn.addEventListener('click', () => {
        const modes = ['auto', 'mobile', 'pc'];
        const nextIdx = (modes.indexOf(this.controlMode) + 1) % modes.length;
        this.setControlMode(modes[nextIdx]);
        const labels = { auto: 'AUTOMÁTICO', mobile: 'MÓVIL (TÁCTIL)', pc: 'TECLADO (PC)' };
        this.showAnnouncement('CONTROLES', labels[this.controlMode]);
      });
    }

    // Set initial control mode
    this.setControlMode(this.controlMode);

    // 3. Fluid Floating Thumbstick Setup
    const jZone = document.getElementById('touch-joystick-zone');
    const jBase = document.getElementById('joystick-base');
    const jKnob = document.getElementById('joystick-knob');

    if (jZone && jBase && jKnob) {
      let activeTouchId = null;
      let baseCenter = { x: 0, y: 0 };
      const maxRadius = 46; // px

      const resetBasePosition = () => {
        jBase.style.left = '28px';
        jBase.style.bottom = '28px';
        jBase.style.top = 'auto';
        jBase.classList.remove('active');
      };

      const setBaseToPoint = (clientX, clientY) => {
        const zoneRect = jZone.getBoundingClientRect();
        const relX = clientX - zoneRect.left;
        const relY = clientY - zoneRect.top;
        jBase.style.left = `${relX - 70}px`;
        jBase.style.top = `${relY - 70}px`;
        jBase.style.bottom = 'auto';
        jBase.classList.add('active');
        baseCenter = { x: clientX, y: clientY };
      };

      const handleMove = (clientX, clientY) => {
        const dx = clientX - baseCenter.x;
        const dy = clientY - baseCenter.y;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, maxRadius);
        const angle = Math.atan2(dy, dx);

        const knobX = Math.cos(angle) * clampedDist;
        const knobY = Math.sin(angle) * clampedDist;

        jKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
        // Normalized vector (-1.0 to 1.0)
        this.touchJoystickVec.set(knobX / maxRadius, knobY / maxRadius);
      };

      const handleEnd = () => {
        activeTouchId = null;
        jKnob.style.transform = 'translate(0px, 0px)';
        this.touchJoystickVec.set(0, 0);
        setTimeout(() => {
          if (activeTouchId === null) resetBasePosition();
        }, 500);
      };

      // Touch events for mobile/tablet
      jZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        activeTouchId = touch.identifier;
        setBaseToPoint(touch.clientX, touch.clientY);
        handleMove(touch.clientX, touch.clientY);
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (activeTouchId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === activeTouchId) {
            handleMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
            break;
          }
        }
      }, { passive: false });

      window.addEventListener('touchend', (e) => {
        if (activeTouchId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === activeTouchId) {
            handleEnd();
            break;
          }
        }
      });

      window.addEventListener('touchcancel', handleEnd);

      // Mouse drag fallback for testing on PC
      let isMouseDown = false;
      jZone.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        setBaseToPoint(e.clientX, e.clientY);
        handleMove(e.clientX, e.clientY);
      });
      window.addEventListener('mousemove', (e) => {
        if (isMouseDown) handleMove(e.clientX, e.clientY);
      });
      window.addEventListener('mouseup', () => {
        if (isMouseDown) {
          isMouseDown = false;
          handleEnd();
        }
      });
    }

    // 4. Ergonomic Arcade Action Cluster (Hit/Drive, Globo, Smash, Slice, Sprint)
    const bindTouchAction = (btnId, shotType) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;

      const onPress = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (shotType) {
          this.shotType = shotType;
          const label = document.getElementById('current-shot');
          if (label) label.innerText = shotType;
        }
        if (navigator.vibrate) navigator.vibrate(22);
        this.handleActionPress();
      };

      const onRelease = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleActionRelease();
      };

      btn.addEventListener('touchstart', onPress, { passive: false });
      btn.addEventListener('touchend', onRelease, { passive: false });
      btn.addEventListener('touchcancel', onRelease);
      btn.addEventListener('mousedown', onPress);
      btn.addEventListener('mouseup', onRelease);
    };

    bindTouchAction('touch-hit-btn', 'DRIVE');
    bindTouchAction('touch-btn-globo', 'GLOBO');
    bindTouchAction('touch-btn-smash', 'SMASH');
    bindTouchAction('touch-btn-slice', 'SLICE');

    // Dedicated Sprint Button (Press / Hold)
    const sprintBtn = document.getElementById('touch-btn-sprint');
    if (sprintBtn) {
      const startSprint = (e) => {
        e.preventDefault();
        this.touchSprinting = true;
        sprintBtn.classList.add('active');
        if (navigator.vibrate) navigator.vibrate(15);
      };
      const endSprint = (e) => {
        e.preventDefault();
        this.touchSprinting = false;
        sprintBtn.classList.remove('active');
      };
      sprintBtn.addEventListener('touchstart', startSprint, { passive: false });
      sprintBtn.addEventListener('touchend', endSprint, { passive: false });
      sprintBtn.addEventListener('touchcancel', endSprint);
      sprintBtn.addEventListener('mousedown', startSprint);
      sprintBtn.addEventListener('mouseup', endSprint);
    }
  }

  setControlMode(mode) {
    this.controlMode = mode;
    try { localStorage.setItem('padel_control_mode', mode); } catch (e) {}

    // Update active button state
    document.querySelectorAll('.control-pref-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.control === mode);
    });

    const isMobileEffective = (mode === 'mobile') || (mode === 'auto' && this.isTouchDevice);
    const mobileOverlay = document.getElementById('mobile-controls');
    if (mobileOverlay) {
      mobileOverlay.classList.toggle('hidden', !isMobileEffective);
    }

    // Update HUD controls icon
    const hudIcon = document.getElementById('hud-ctrl-icon');
    const hudText = document.getElementById('hud-ctrl-text');
    if (hudIcon) hudIcon.innerText = isMobileEffective ? '📱' : '⌨️';
    if (hudText) hudText.innerText = isMobileEffective ? 'TÁCTIL' : 'TECLADO';
  }

  handleActionPress() {
    this.audio.init();
    if (this.gameMode === 'online_guest') {
      if (!this.pointActive && this.server === 'ai') {
        if (this.conn && this.conn.open) {
          this.conn.send({ type: 'guest_serve' });
        }
      } else {
        this.triggerGuestShot();
      }
      return;
    }

    if (!this.pointActive && this.server === 'player') {
      this.executeServe();
    } else {
      this.isChargingPower = true;
    }
  }

  handleActionRelease() {
    if (this.gameMode === 'online_guest') return;
    if (this.isChargingPower) {
      this.triggerPlayerShot();
    }
  }

  triggerGuestShot() {
    if (this.conn && this.conn.open) {
      // Tennis Rule 24: Receiver cannot volley the serve before it bounces!
      if (this.rally === 0 && this.server !== 'ai' && !this.ball.hitGroundInCourt) {
        this.startSwingAnimation(this.ai, 'forehand');
        this.showTimingFeedback('¡DEBE BOTAR EN EL CUADRO! (REGLA DE SAQUE)', 'late');
        this.audio.playAirSwing();
        return;
      }

      const swingType = (this.ball.pos.x < this.ai.pos.x) ? 'forehand' : 'backhand';
      this.conn.send({
        type: 'p2_input',
        x: this.ai.pos.x,
        z: this.ai.pos.z,
        rc: this.ai.runCycle,
        sw: true,
        st: swingType,
        shot: { power: 0.88, shotType: this.shotType }
      });
      this.startSwingAnimation(this.ai, swingType);
    }
  }

  applyProfileAndStart(mode = 'ai') {
    this.gameMode = mode;
    this.audio.init();

    // Capture lobby profile (nickname + gender)
    const nickInput = document.getElementById('player-nickname');
    window.playerNickname = (nickInput?.value || window.playerNickname || 'CAMPEÓN').trim() || 'CAMPEÓN';
    window.playerGender   = document.querySelector('.gender-btn.active')?.dataset.gender || window.playerGender || 'male';

    try {
      localStorage.setItem('padel_tennis_nickname', window.playerNickname);
      localStorage.setItem('padel_tennis_gender', window.playerGender);
    } catch (e) {}

    // Rebuild player model with selected gender
    if (this.player.model) {
      this.scene.remove(this.player.model);
      this.player.model    = this.createProAthlete(0x00f0ff, 0xffffff, '#00f0ff', '7', false, window.playerGender);
      this.player.nickname = window.playerNickname;
      this.player.gender   = window.playerGender;
      this.scene.add(this.player.model);
    }

    const hudPlayerName = document.getElementById('hud-player-name');
    if (hudPlayerName) {
      const nick = window.playerNickname.toUpperCase().substring(0, 10);
      hudPlayerName.innerText = nick + (window.playerGender === 'female' ? ' ♀' : ' ♂');
    }

    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.classList.add('fade-out');
    this.isPlaying = true;

    // Start Addictive Synthwave Music!
    this.audio.startMusic();
  }

  initUI() {
    // Restore saved nickname and gender from localStorage
    try {
      const savedNick = localStorage.getItem('padel_tennis_nickname');
      if (savedNick) {
        window.playerNickname = savedNick;
        const nickInput = document.getElementById('player-nickname');
        if (nickInput) nickInput.value = savedNick;
      }
      const savedGender = localStorage.getItem('padel_tennis_gender');
      if (savedGender) {
        window.playerGender = savedGender;
        document.querySelectorAll('.gender-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.gender === savedGender);
        });
      }
    } catch (e) {}

    // Singleplayer start button
    const btnPlay = document.getElementById('btn-play');
    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        this.applyProfileAndStart('ai');
      });
    }

    // Camera perspective buttons
    document.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setCameraMode(e.currentTarget.dataset.cam);
      });
    });

    // Gender toggle buttons (Lobby)
    document.querySelectorAll('.gender-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.playerGender = btn.dataset.gender || 'male';
        try { localStorage.setItem('padel_tennis_gender', window.playerGender); } catch (e) {}
      });
    });

    // Nickname input handling
    const nickInput = document.getElementById('player-nickname');
    if (nickInput) {
      nickInput.addEventListener('input', () => {
        window.playerNickname = nickInput.value.trim() || 'CAMPEÓN';
        try { localStorage.setItem('padel_tennis_nickname', window.playerNickname); } catch (e) {}
      });
    }

    // Map selection cards
    document.querySelectorAll('.map-card').forEach(card => {
      card.addEventListener('click', () => {
        const selectedMap = card.dataset.map;
        if (selectedMap) {
          this.setMap(selectedMap, true);
        }
      });
    });

    // In-game HUD Quick Map Switcher Button
    const btnSwitchMap = document.getElementById('btn-switch-map');
    if (btnSwitchMap) {
      btnSwitchMap.addEventListener('click', () => {
        this.cycleMap();
      });
    }

    // In-game HUD Quick Music Toggle Button
    const btnToggleMusic = document.getElementById('btn-toggle-music');
    if (btnToggleMusic) {
      btnToggleMusic.addEventListener('click', () => {
        this.audio.toggleMusic();
      });
    }

    // Minimap Header & Toggle Button Listeners
    const btnToggleMinimap = document.getElementById('btn-toggle-minimap');
    if (btnToggleMinimap) {
      btnToggleMinimap.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMinimap();
      });
    }
    const minimapHeader = document.getElementById('minimap-header');
    if (minimapHeader) {
      minimapHeader.addEventListener('click', () => {
        this.toggleMinimap();
      });
    }
  }

  // --- Multiplayer Engine (P2P WebRTC & Local 2-Player) ---
  initMultiplayer() {
    const tabAI = document.getElementById('tab-mode-ai');
    const tabOnline = document.getElementById('tab-mode-online');
    const tabTourn = document.getElementById('tab-mode-tournament');
    const tabLocal = document.getElementById('tab-mode-local');
    const panelAI = document.getElementById('mode-panel-ai');
    const panelOnline = document.getElementById('mode-panel-online');
    const panelTourn = document.getElementById('mode-panel-tournament');
    const panelLocal = document.getElementById('mode-panel-local');

    const setModeTab = (mode) => {
      const allTabs = [tabAI, tabOnline, tabTourn, tabLocal];
      const allPanels = [panelAI, panelOnline, panelTourn, panelLocal];
      allTabs.forEach(t => t?.classList.remove('active'));
      allPanels.forEach(p => p?.classList.add('hidden'));

      if (mode === 'ai') {
        this.gameMode = 'ai';
        if (tabAI) tabAI.classList.add('active');
        if (panelAI) panelAI.classList.remove('hidden');
      } else if (mode === 'online') {
        this.gameMode = 'online_host';
        if (tabOnline) tabOnline.classList.add('active');
        if (panelOnline) panelOnline.classList.remove('hidden');
        this.setupOnlineHost();
      } else if (mode === 'tournament') {
        this.gameMode = 'tournament_host';
        if (tabTourn) tabTourn.classList.add('active');
        if (panelTourn) panelTourn.classList.remove('hidden');
        this.setupTournamentHost();
      } else if (mode === 'local') {
        this.gameMode = 'local';
        if (tabLocal) tabLocal.classList.add('active');
        if (panelLocal) panelLocal.classList.remove('hidden');
      }
    };

    if (tabAI) tabAI.addEventListener('click', () => setModeTab('ai'));
    if (tabOnline) tabOnline.addEventListener('click', () => setModeTab('online'));
    if (tabTourn) tabTourn.addEventListener('click', () => setModeTab('tournament'));
    if (tabLocal) tabLocal.addEventListener('click', () => setModeTab('local'));

    // Local 2-Player Start Button
    const btnPlayLocal = document.getElementById('btn-play-local');
    if (btnPlayLocal) {
      btnPlayLocal.addEventListener('click', () => {
        this.gameMode = 'local';
        this.audio.init();
        document.getElementById('start-screen').classList.add('fade-out');
        this.isPlaying = true;
        this.showAnnouncement('¡MODO 2 JUGADORES!', 'P1 (WASD + Espacio) vs P2 (Flechas + Enter)');
      });
    }

    // Copy Code / Share Link Button
    const btnCopy = document.getElementById('btn-copy-code');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        if (this.roomCode) {
          const shareUrl = `${window.location.origin}${window.location.pathname}?room=${this.roomCode}`;
          navigator.clipboard.writeText(shareUrl).then(() => {
            btnCopy.innerText = '¡Enlace Copiado!';
            setTimeout(() => btnCopy.innerText = 'Copiar Enlace', 2000);
          }).catch(() => {
            navigator.clipboard.writeText(this.roomCode);
            btnCopy.innerText = '¡Código Copiado!';
            setTimeout(() => btnCopy.innerText = 'Copiar Código', 2000);
          });
        }
      });
    }

    // Join Room Button & Enter Key Handling
    const btnJoin = document.getElementById('btn-join-room');
    const joinInput = document.getElementById('join-room-input');
    if (btnJoin && joinInput) {
      const executeJoin = () => {
        const code = joinInput.value.trim().toUpperCase();
        if (code) {
          joinInput.blur();
          this.keys = {};
          this.connectToPeer(code);
        }
      };
      btnJoin.addEventListener('click', executeJoin);
      joinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          executeJoin();
        }
      });
    }

    // Auto-join via URL query (?room=TENNIS-XXXX)
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      // Switch to online tab visually
      const allTabs2 = [tabAI, tabOnline, tabTourn, tabLocal];
      const allPanels2 = [panelAI, panelOnline, panelTourn, panelLocal];
      allTabs2.forEach(t => t?.classList.remove('active'));
      allPanels2.forEach(p => p?.classList.add('hidden'));
      if (tabOnline) tabOnline.classList.add('active');
      if (panelOnline) panelOnline.classList.remove('hidden');
      if (joinInput) joinInput.value = roomParam.toUpperCase();
      // Prevent setupOnlineHost from running (don't create a host peer)
      // Connect directly as guest
      this.connectToPeer(roomParam.toUpperCase());
    }
  }

  getPeerConfig() {
    return {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          }
        ]
      }
    };
  }

  setupOnlineHost() {
    if (this.peer || typeof Peer === 'undefined') return;
    this.roomCode = `TENNIS-${Math.floor(1000 + Math.random() * 9000)}`;
    const display = document.getElementById('room-code-display');
    if (display) display.innerText = this.roomCode;

    const status = document.getElementById('host-status');
    if (status) status.innerText = '⏳ Conectando al servidor de señalización...';

    try {
      this.peer = new Peer(this.roomCode, this.getPeerConfig());

      this.peer.on('open', (id) => {
        console.log('Host Peer open with ID:', id);
        this.roomCode = id; // Ensure roomCode matches actual PeerJS ID
        if (display) display.innerText = this.roomCode;
        if (status) status.innerText = '🟢 Sala abierta. Comparte el código con tu rival.';
      });

      this.peer.on('connection', (conn) => {
        this.conn = conn;
        this.gameMode = 'online_host';
        this.isConnecting = false;
        if (status) status.innerText = '🎾 ¡Rival conectado! Entrando a la pista central...';

        this.setupDataConnection();

        setTimeout(() => {
          this.audio.init();
          document.getElementById('start-screen').classList.add('fade-out');
          this.isPlaying = true;
          this.showAnnouncement('¡RIVAL ONLINE CONECTADO!', 'Host (Azul) vs Invitado (Rojo)');
          if (document.activeElement) document.activeElement.blur();
          this.keys = {};
          window.focus();
        }, 1000);
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS Host Error:', err);
        if (status) status.innerText = '❌ Error de conexión: ' + (err.type || err.message || 'Desconocido') + '. Recarga la página.';
        this.isConnecting = false;
      });

      this.peer.on('disconnected', () => {
        console.warn('PeerJS Host disconnected, attempting reconnect...');
        if (status) status.innerText = '🔄 Reconectando al servidor...';
        try { this.peer.reconnect(); } catch (e) {}
      });
    } catch (e) {
      console.warn('PeerJS init failed:', e);
      if (status) status.innerText = '❌ No se pudo inicializar la conexión P2P. Recarga la página.';
    }
  }

  connectToPeer(code) {
    if (typeof Peer === 'undefined') {
      const joinStatus = document.getElementById('join-status');
      if (joinStatus) joinStatus.innerText = '❌ PeerJS no está disponible. Recarga la página.';
      return;
    }
    const joinStatus = document.getElementById('join-status');
    if (joinStatus) joinStatus.innerText = '⏳ Conectando con la sala ' + code + '...';

    // Set connecting flag to prevent accidental AI start
    this.isConnecting = true;
    this.gameMode = 'online_guest'; // Set early to prevent Space/Enter from starting AI

    // Clear any previous connection timeout
    if (this._connectTimeout) clearTimeout(this._connectTimeout);

    try {
      if (this.peer) {
        try { this.peer.destroy(); } catch (e) {}
        this.peer = null;
      }
      this.peer = new Peer(this.getPeerConfig());

      // Connection timeout: 15 seconds
      this._connectTimeout = setTimeout(() => {
        if (this.isConnecting) {
          this.isConnecting = false;
          if (joinStatus) joinStatus.innerText = '⏰ Tiempo agotado. Verifica que el código sea correcto y que el anfitrión tenga la sala abierta.';
        }
      }, 15000);

      this.peer.on('open', () => {
        console.log('Guest peer open, connecting to:', code);
        this.conn = this.peer.connect(code, { reliable: true });

        this.conn.on('open', () => {
          clearTimeout(this._connectTimeout);
          this.isConnecting = false;
          this.gameMode = 'online_guest';
          if (joinStatus) joinStatus.innerText = '🎾 ¡Conexión establecida con éxito!';
          this.setupDataConnection();

          setTimeout(() => {
            this.audio.init();
            document.getElementById('start-screen').classList.add('fade-out');
            this.isPlaying = true;
            this.showAnnouncement('¡CONECTADO A LA PISTA!', 'Invitado (Rojo) vs Host (Azul)');
            if (document.activeElement) document.activeElement.blur();
            this.keys = {};
            window.focus();
          }, 800);
        });

        this.conn.on('error', (err) => {
          clearTimeout(this._connectTimeout);
          this.isConnecting = false;
          console.warn('Conn error:', err);
          if (joinStatus) joinStatus.innerText = '❌ Error: No se encontró la sala "' + code + '". Verifica el código.';
        });

        this.conn.on('close', () => {
          if (!this.isPlaying) {
            clearTimeout(this._connectTimeout);
            this.isConnecting = false;
            if (joinStatus) joinStatus.innerText = '❌ La conexión fue rechazada o la sala ya no existe.';
          }
        });
      });

      this.peer.on('error', (err) => {
        clearTimeout(this._connectTimeout);
        this.isConnecting = false;
        console.warn('Guest Peer error:', err);
        if (err.type === 'peer-unavailable') {
          if (joinStatus) joinStatus.innerText = '❌ Sala "' + code + '" no encontrada. El anfitrión debe crear la sala primero.';
        } else {
          if (joinStatus) joinStatus.innerText = '❌ Error de conexión: ' + (err.type || 'Desconocido') + '. Intenta de nuevo.';
        }
      });

      this.peer.on('disconnected', () => {
        if (this.isConnecting) {
          console.warn('Guest peer disconnected during connection');
          if (joinStatus) joinStatus.innerText = '🔄 Conexión perdida, reintentando...';
          try { this.peer.reconnect(); } catch (e) {}
        }
      });
    } catch (e) {
      this.isConnecting = false;
      console.warn('PeerJS init failed:', e);
      if (joinStatus) joinStatus.innerText = '❌ Error al inicializar conexión P2P. Recarga la página.';
    }
  }

  setupDataConnection() {
    if (!this.conn) return;

    this.conn.on('data', (data) => {
      if (data.type === 'sync' && this.gameMode === 'online_guest') {
        // Guest receives authoritative state from host
        // Smooth target interpolation for Player 1 (Host) to prevent teleports
        this.player.netTargetPos.set(data.p1.x, 0, data.p1.z);
        this.player.runCycle = data.p1.rc;
        if (data.p1.sw && !this.player.isSwinging) {
          this.startSwingAnimation(this.player, data.p1.st || 'forehand');
        }

        // Smooth Ball Interpolation without jitter or teleports
        const bTarget = this._v1.set(data.b.x, data.b.y, data.b.z);
        const dist = this.ball.pos.distanceTo(bTarget);
        if (dist > 3.2 || !this.pointActive) {
          this.ball.pos.copy(bTarget);
          this.ball.vel.set(data.b.vx, data.b.vy, data.b.vz);
        } else {
          this.ball.pos.lerp(bTarget, 0.42);
          this.ball.vel.set(data.b.vx, data.b.vy, data.b.vz);
        }

        if (!this.pointActive && data.p2) {
          this.ai.pos.set(data.p2.x, 0, data.p2.z);
        }

        this.scorePlayer = data.sc.sp;
        this.scoreAI = data.sc.sa;
        this.gamesPlayer = data.sc.gp;
        this.gamesAI = data.sc.ga;
        this.rally = data.rally;
        this.pointActive = data.pa;
        this.updateHUD();

        if (data.ann) {
          this.showAnnouncement(data.ann.title, data.ann.sub);
        }

        if (data.snd) {
          if (data.snd === 'hit') this.audio.playHit(0.9, false, false);
          else if (data.snd === 'bounce') this.audio.playBounce(0.5);
          else if (data.snd === 'whistle') this.audio.playWhistle();
          else if (data.snd === 'out') this.audio.playOut();
          else if (data.snd === 'crowd') this.audio.playCrowd();
        }

        if (data.map && data.map !== this.currentMap) {
          this.setMap(data.map, false);
        }

        const promptEl = document.getElementById('serve-prompt');
        if (this.pointActive) {
          if (promptEl) promptEl.classList.add('hidden');
        } else if (data.srv) {
          this.server = data.srv;
          this.servingSide = data.side || this.servingSide;
          if (this.server === 'ai') {
            if (promptEl) {
              promptEl.classList.remove('hidden');
              promptEl.innerHTML = '<span>Tu Saque: Presiona <strong>[ESPACIO / CLIC]</strong></span>';
            }
            document.getElementById('serve-player').innerText = '';
            document.getElementById('serve-ai').innerText = '🎾';
          } else {
            if (promptEl) {
              promptEl.classList.remove('hidden');
              promptEl.innerHTML = '<span>Esperando Saque del Rival...</span>';
            }
            document.getElementById('serve-player').innerText = '🎾';
            document.getElementById('serve-ai').innerText = '';
          }
        }
      } else if (data.type === 'p2_input' && this.gameMode === 'online_host') {
        // Host receives Guest controls: smooth target interpolation
        this.ai.netTargetPos.set(data.x, 0, data.z);
        this.ai.runCycle = data.rc;
        if (data.sw && !this.ai.isSwinging) {
          this.startSwingAnimation(this.ai, data.st || 'forehand');
        }
        if (data.shot) {
          // Tennis Rule 24: Receiver cannot volley the serve before it bounces!
          if (this.rally === 0 && this.server !== 'ai' && !this.ball.hitGroundInCourt) {
            return;
          }
          this.ai.limbs.racket.getWorldPosition(this._rHead);
          const distToRacket = this._rHead.distanceTo(this.ball.pos);
          const distToBody = this.ai.pos.distanceTo(this.ball.pos);

          if ((distToRacket <= 2.5 || distToBody <= 3.2) && this.ball.pos.z < 1.0 && this.ball.lastHitter !== 'ai') {
            const swingType = (this.ball.pos.x < this.ai.pos.x) ? 'forehand' : 'backhand';
            this.startSwingAnimation(this.ai, swingType);
            this.executeHitWithHitbox('ai', data.shot.power || 0.85, 0, true);
          }
        }
      } else if (data.type === 'guest_serve' && this.gameMode === 'online_host') {
        if (!this.pointActive && this.server === 'ai') {
          this.executeAIServe();
        }
      } else if (data.type === 'map_change' && this.gameMode === 'online_guest') {
        if (data.map) {
          this.setMap(data.map, false);
        }
      }
    });

    this.conn.on('close', () => {
      this.showAnnouncement('CONEXIÓN FINALIZADA', 'Tu rival se ha desconectado de la pista');
    });
  }

  updatePlayer2Local(dt) {
    const dir = this._v1.set(0, 0, 0);
    if (this.keys['arrowup']) dir.z -= 1;
    if (this.keys['arrowdown']) dir.z += 1;
    if (this.keys['arrowleft']) dir.x -= 1;
    if (this.keys['arrowright']) dir.x += 1;

    const curSpeed = this.ai.speed;
    if (dir.lengthSq() > 0) {
      dir.normalize();
      this.ai.pos.addScaledVector(dir, curSpeed * dt);
      this.ai.runCycle += dt * 14;

      this.ai.pos.x = THREE.MathUtils.clamp(this.ai.pos.x, -this.DOUBLES_HALF_W - 1.5, this.DOUBLES_HALF_W + 1.5);
      this.ai.pos.z = THREE.MathUtils.clamp(this.ai.pos.z, -this.HALF_L - 3.5, -0.9);
    } else {
      this.ai.runCycle *= 0.8;
    }

    // Player 2 Hit Trigger (Enter key)
    if (this.keys['enter']) {
      this.keys['enter'] = false;
      if (!this.pointActive && this.server === 'ai') {
        this.executeAIServe();
      } else {
        // Tennis Rule 24: Receiver cannot volley the serve before it bounces!
        if (this.rally === 0 && this.server !== 'ai' && !this.ball.hitGroundInCourt) {
          this.startSwingAnimation(this.ai, 'forehand');
          this.audio.playAirSwing();
          return;
        }

        this.ai.limbs.racket.getWorldPosition(this._rHead);
        const distToP2Racket = this._rHead.distanceTo(this.ball.pos);
        const distToP2Body = this.ai.pos.distanceTo(this.ball.pos);

        if ((distToP2Racket <= 1.45 || distToP2Body <= 1.95) && this.ball.pos.z < -0.25 && this.ball.lastHitter !== 'ai' && this.ball.pos.y >= 0.10) {
          const swingType = (this.ball.pos.x < this.ai.pos.x) ? 'forehand' : 'backhand';
          this.startSwingAnimation(this.ai, swingType);
          this.ai.swingProgress = 0.32 * Math.PI;
          this.executeHitWithHitbox('ai', 0.85, 0, true);
        } else {
          this.startSwingAnimation(this.ai, 'forehand');
          if (distToP2Body < 3.2 && this.ball.lastHitter !== 'ai') {
            this.audio.playAirSwing();
          }
        }
      }
    }

    this.ai.model.position.copy(this.ai.pos);
    this.animateCharacter(this.ai, dt, true);
  }

  // --- Guest Controls (Left/Right FIXED: A adds +X (screen left), D subtracts -X (screen right)) ---
  updatePlayer2Guest(dt) {
    const dir = this._v1.set(0, 0, 0);
    if (this.keys['w'] || this.keys['arrowup']) dir.z += 1; // forward toward net
    if (this.keys['s'] || this.keys['arrowdown']) dir.z -= 1; // backward away from net
    if (this.keys['a'] || this.keys['arrowleft']) dir.x += 1; // SCREEN LEFT (projects to negative screen X)
    if (this.keys['d'] || this.keys['arrowright']) dir.x -= 1; // SCREEN RIGHT (projects to positive screen X)

    const curSpeed = this.ai.speed;
    if (dir.lengthSq() > 0) {
      dir.normalize();
      this.ai.pos.addScaledVector(dir, curSpeed * dt);
      this.ai.runCycle += dt * 14;

      // Allow running into doubles tramlines and wide run-off to return angled tennis balls
      this.ai.pos.x = THREE.MathUtils.clamp(this.ai.pos.x, -this.DOUBLES_HALF_W - 1.5, this.DOUBLES_HALF_W + 1.5);
      this.ai.pos.z = THREE.MathUtils.clamp(this.ai.pos.z, -this.HALF_L - 3.5, -0.9);
    } else {
      this.ai.runCycle *= 0.8;
    }

    if (this.keys[' '] || this.keys['enter']) {
      this.keys[' '] = false;
      this.keys['enter'] = false;
      if (!this.pointActive && this.server === 'ai') {
        if (this.conn && this.conn.open) {
          this.conn.send({ type: 'guest_serve' });
        }
      } else {
        this.triggerGuestShot();
      }
    }

    this.netTimer += dt;
    if (this.netTimer >= 0.033 && this.conn && this.conn.open && (!this.conn.dataChannel || this.conn.dataChannel.bufferedAmount < 16384)) {
      this.netTimer = 0;
      this.conn.send({
        type: 'p2_input',
        x: this.ai.pos.x,
        z: this.ai.pos.z,
        rc: this.ai.runCycle,
        sw: this.ai.isSwinging,
        st: this.ai.swingType
      });
    }

    this.ai.model.position.copy(this.ai.pos);
    this.animateCharacter(this.ai, dt, true);
  }

  syncOnlineHost(dt) {
    this.netTimer += dt;
    if (this.netTimer >= 0.033 && this.conn && this.conn.open && (!this.conn.dataChannel || this.conn.dataChannel.bufferedAmount < 16384)) {
      this.netTimer = 0;
      const packet = {
        type: 'sync',
        b: {
          x: this.ball.pos.x, y: this.ball.pos.y, z: this.ball.pos.z,
          vx: this.ball.vel.x, vy: this.ball.vel.y, vz: this.ball.vel.z
        },
        p1: {
          x: this.player.pos.x, z: this.player.pos.z,
          sw: this.player.isSwinging, st: this.player.swingType,
          rc: this.player.runCycle
        },
        p2: {
          x: this.ai.pos.x, z: this.ai.pos.z
        },
        sc: {
          sp: this.scorePlayer, sa: this.scoreAI,
          gp: this.gamesPlayer, ga: this.gamesAI
        },
        rally: this.rally,
        pa: this.pointActive,
        srv: this.server,
        side: this.servingSide,
        map: this.currentMap
      };

      if (this._pendingAnn) {
        packet.ann = this._pendingAnn;
        this._pendingAnn = null;
      }
      if (this._pendingSound) {
        packet.snd = this._pendingSound;
        this._pendingSound = null;
      }

      this.conn.send(packet);
    }

    this.ai.model.position.copy(this.ai.pos);
    this.animateCharacter(this.ai, dt, true);
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    document.querySelectorAll('.cam-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cam === mode);
    });
  }

  // --- Official Tennis Serve System (Behind Baseline to Diagonal Service Box) ---
  prepareServe(server) {
    this.pointActive = false;
    this.server = server;
    this.ball.vel.set(0, 0, 0);
    this.ball.spin.set(0, 0, 0);
    this.ball.bounceCount = 0;
    this.ball.hitGroundInCourt = false;
    this.ball.lastHitter = null;
    this.rally = 0;
    this.updateHUD();

    const promptEl = document.getElementById('serve-prompt');
    const serveLabel = (this.serveFaultCount === 0) ? '1ER SERVICIO' : '2DO SERVICIO';

    if (server === 'player') {
      // Server behind baseline at Z = 12.2m
      const serveX = this.servingSide * 1.8;
      this.player.pos.set(serveX, 0, 12.2);
      this.ball.pos.set(serveX + 0.35, 1.1, 11.8);
      this.ai.pos.set(-this.servingSide * 2.5, 0, -12.2);

      if (promptEl) {
        promptEl.classList.remove('hidden');
        const isMobile = (this.controlMode === 'mobile') || (this.controlMode === 'auto' && this.isTouchDevice);
        const actionPrompt = isMobile ? 'Toca <strong>[GOLPE]</strong> • Apunta con el Joystick' : 'Presiona <strong>[ESPACIO]</strong> o <strong>[CLIC]</strong>';
        promptEl.innerHTML = `<span>${serveLabel}: ${actionPrompt}</span>`;
      }
      document.getElementById('serve-player').innerText = '🎾';
      document.getElementById('serve-ai').innerText = '';
    } else {
      // Rival / AI / Guest Server behind baseline at Z = -12.2m
      const serveX = -this.servingSide * 1.8;
      this.ai.pos.set(serveX, 0, -12.2);
      this.ball.pos.set(serveX - 0.35, 1.1, -11.8);
      this.player.pos.set(this.servingSide * 2.5, 0, 12.2);
      document.getElementById('serve-player').innerText = '';
      document.getElementById('serve-ai').innerText = '🎾';

      if (this.gameMode === 'local') {
        if (promptEl) {
          promptEl.classList.remove('hidden');
          promptEl.innerHTML = `<span>J2 (${serveLabel}): Presiona <strong>[ENTER]</strong></span>`;
        }
      } else if (this.gameMode === 'online_guest') {
        if (promptEl) {
          promptEl.classList.remove('hidden');
          const isMobile = (this.controlMode === 'mobile') || (this.controlMode === 'auto' && this.isTouchDevice);
          const actionPrompt = isMobile ? 'Toca <strong>[GOLPE]</strong> • Apunta con el Joystick' : 'Presiona <strong>[ESPACIO / CLIC]</strong>';
          promptEl.innerHTML = `<span>Tu Saque (${serveLabel}): ${actionPrompt}</span>`;
        }
      } else if (this.gameMode === 'online_host') {
        if (promptEl) {
          promptEl.classList.remove('hidden');
          promptEl.innerHTML = `<span>Esperando Saque del Rival (${serveLabel})...</span>`;
        }
      } else {
        // Solo vs AI
        if (promptEl) promptEl.classList.add('hidden');
        setTimeout(() => {
          if (!this.pointActive && this.server === 'ai') {
            this.executeAIServe();
          }
        }, 1400);
      }
    }
  }

  // Execute Overhead Tennis Serve with Realistic Biomechanics & Guaranteed Clearance
  executeServe() {
    this.pointActive = true;
    const promptEl = document.getElementById('serve-prompt');
    if (promptEl) promptEl.classList.add('hidden');
    this.ball.lastHitter = 'player';
    this.ball.bounceCount = 0;
    this.ball.hitGroundInCourt = false;

    // Directional Aim within the diagonal legal service box:
    // Box boundaries: Z in [-6.40m, 0], X on opposite diagonal side
    // When this.servingSide === 1: Opponent box is X in [-4.115, 0]. Default center is -2.10m.
    // When this.servingSide === -1: Opponent box is X in [0, 4.115]. Default center is +2.10m.
    let targetX = -this.servingSide * 2.10;
    if (this.keys['a'] || this.keys['arrowleft'] || (this.touchJoystickVec && this.touchJoystickVec.x < -0.25)) {
      targetX = -this.servingSide * 3.15; // Aim wide towards sideline
    } else if (this.keys['d'] || this.keys['arrowright'] || (this.touchJoystickVec && this.touchJoystickVec.x > 0.25)) {
      targetX = -this.servingSide * 1.05; // Aim down the 'T' center line
    }

    // Landing depth safely centered in service box (Z = -3.8m)
    const targetZ = -3.8;
    const flightTime = 0.68; // Professional crisp serve speed

    // Overhead contact point (apex of serve toss)
    this.ball.pos.y = 2.45;
    this.ball.pos.x = this.player.pos.x + 0.22;
    this.ball.pos.z = 11.4;

    const vx = (targetX - this.ball.pos.x) / flightTime;
    const vz = (targetZ - this.ball.pos.z) / flightTime;

    // Guaranteed Net Clearance (Net is 0.914m; we enforce y_net >= 1.30m)
    const timeToNet = (0 - this.ball.pos.z) / vz;
    const vy = (1.30 - this.ball.pos.y + 0.5 * 9.8 * timeToNet * timeToNet) / timeToNet;

    this.ball.vel.set(vx, vy, vz);
    this.ball.spin.set(16.0, 0, 0); // Heavy forward topspin kick pulling ball down

    this.audio.playHit(1.0, true, true);
    if (this.gameMode === 'online_host') this._pendingSound = 'hit';
    this.startSwingAnimation(this.player, 'serve');
    this.particles.burst(this.ball.pos, 28, 0x00f0ff, 4.5);
    this.particles.spawnImpactRing(this.ball.pos, 0x00f0ff);
    this.camShake = 0.28;

    const serveSpeedKmH = Math.round(this.ball.vel.length() * 3.6);
    this.triggerRadarGun(serveSpeedKmH, 'TÚ (PRO)');

    const sLabel = (this.serveFaultCount === 0) ? '1ER SAQUE' : '2DO SAQUE';
    this.showAnnouncement(`¡${sLabel}!`, 'Saque limpio y potente');
    this.showTimingFeedback('SWEET SPOT • SERVICIO', 'perfect');
  }

  executeAIServe() {
    this.pointActive = true;
    const promptEl = document.getElementById('serve-prompt');
    if (promptEl) promptEl.classList.add('hidden');
    this.ball.lastHitter = 'ai';
    this.ball.bounceCount = 0;
    this.ball.hitGroundInCourt = false;

    // Diagonal service box on player side (Z in [0, 6.40m])
    const sideChoice = Math.random();
    let targetX = this.servingSide * 2.10;
    if (sideChoice < 0.35) targetX = this.servingSide * 3.15; // wide
    else if (sideChoice > 0.70) targetX = this.servingSide * 1.05; // down the T

    const targetZ = 3.8;
    const flightTime = 0.68;

    this.ball.pos.y = 2.45;
    this.ball.pos.x = this.ai.pos.x - 0.22;
    this.ball.pos.z = -11.4;

    const vx = (targetX - this.ball.pos.x) / flightTime;
    const vz = (targetZ - this.ball.pos.z) / flightTime;

    const timeToNet = (0 - this.ball.pos.z) / vz;
    const vy = (1.30 - this.ball.pos.y + 0.5 * 9.8 * timeToNet * timeToNet) / timeToNet;

    this.ball.vel.set(vx, vy, vz);
    this.ball.spin.set(-16.0, 0, 0);

    this.audio.playHit(1.0, true, true);
    if (this.gameMode === 'online_host') this._pendingSound = 'hit';
    this.startSwingAnimation(this.ai, 'serve');
    this.particles.burst(this.ball.pos, 28, 0xff2a55, 4.5);
    this.particles.spawnImpactRing(this.ball.pos, 0xff2a55);
    this.camShake = 0.20;

    const aiServeSpeed = Math.round(this.ball.vel.length() * 3.6);
    this.triggerRadarGun(aiServeSpeed, 'RIVAL (PRO)');
  }

  // --- Hitbox & Shot Execution ---
  triggerPlayerShot() {
    this.isChargingPower = false;
    const power = Math.max(0.45, this.power);
    this.power = 0.55;
    document.getElementById('power-bar').style.width = '0%';

    // Tennis Rule 24: Receiver CANNOT volley the serve before it bounces in the service box!
    if (this.rally === 0 && this.server !== 'player' && !this.ball.hitGroundInCourt) {
      this.startSwingAnimation(this.player, 'forehand');
      this.showTimingFeedback('¡DEBE BOTAR EN EL CUADRO! (REGLA DE SAQUE)', 'late');
      this.audio.playAirSwing();
      return;
    }

    this.player.limbs.racket.getWorldPosition(this._rHead);
    this.player.racketHitbox.pos.copy(this._rHead);

    const distToBody = this.player.pos.distanceTo(this.ball.pos);
    const distToHead = this._rHead.distanceTo(this.ball.pos);
    const timeOffset = (this.ball.pos.z - this.player.pos.z);

    const isSmash = (this.shotType === 'SMASH' && this.ball.pos.y > 1.6);
    const canHit = (distToHead <= 1.45 || distToBody <= 1.95) &&
                   this.ball.pos.z > 0.25 &&
                   this.ball.lastHitter !== 'player' &&
                   this.ball.pos.y >= 0.10;

    if (canHit) {
      const isSweetSpot = (distToHead <= 0.85 || isSmash) && Math.abs(timeOffset) < 0.35;
      const swingType = (this.ball.pos.x > this.player.pos.x) ? 'forehand' : 'backhand';
      this.startSwingAnimation(this.player, swingType);
      // Snap swing directly into impact zone so racket string bed visibly connects with ball!
      this.player.swingProgress = 0.32 * Math.PI;

      let timingLabel = 'PERFECT • SWEET SPOT';
      let timingClass = 'perfect';
      if (!isSweetSpot) {
        timingLabel = (timeOffset > 0) ? 'LATE • RETRASADO' : 'EARLY • ADELANTADO';
        timingClass = 'early';
      }

      this.showTimingFeedback(timingLabel, timingClass);
      this.executeHitWithHitbox('player', power, timeOffset, isSweetSpot);
    } else {
      this.startSwingAnimation(this.player, 'forehand');
      if (distToBody < 3.2 && this.ball.lastHitter !== 'player') {
        this.showTimingFeedback('¡AIRE! FUERA DE ALCANCE', 'late');
        this.audio.playAirSwing();
      }
    }
  }

  startSwingAnimation(char, type = 'forehand') {
    char.isSwinging = true;
    char.swingType = type;
    char.swingProgress = 0;
  }

  executeHitWithHitbox(hitter, power, timingOffset, isSweetSpot) {
    this.ball.lastHitter = hitter;
    this.ball.bounceCount = 0;
    this.ball.hitGroundInCourt = false;
    this.rally++;

    const isSmash = (this.shotType === 'SMASH' && this.ball.pos.y > 1.6);
    const isLob = (this.shotType === 'GLOBO');
    const isSlice = (this.shotType === 'SLICE');

    // Directional aim within tennis singles boundaries (+/-4.115m)
    let targetX = (Math.random() - 0.5) * 4.5;
    if (hitter === 'player') {
      if (this.keys['a'] || this.keys['arrowleft'] || (this.touchJoystickVec && this.touchJoystickVec.x < -0.22)) {
        targetX = -3.1;
      } else if (this.keys['d'] || this.keys['arrowright'] || (this.touchJoystickVec && this.touchJoystickVec.x > 0.22)) {
        targetX = 3.1;
      } else if (timingOffset < -0.3) {
        targetX *= -1.2;
      }
    }
    targetX = THREE.MathUtils.clamp(targetX, -this.HALF_W + 0.5, this.HALF_W - 0.5);

    let targetZ = (hitter === 'player') ? (-8.2 - Math.random() * 2.8) : (8.2 + Math.random() * 2.8);
    let flightTime = 1.02;
    let extraArc = 1.2;

    if (isSmash) {
      flightTime = 0.68;
      extraArc = -0.5;
      this.showAnnouncement('¡SMASH DIRECTO!', 'Remate ganador por encima de la red');
      this.particles.burst(this.ball.pos, 35, 0xff0055, 6.0);
      this.particles.spawnImpactRing(this.ball.pos, 0xff0055);
    } else if (isLob) {
      flightTime = 1.65;
      extraArc = 6.4;
      this.showAnnouncement('¡GLOBO AL FONDO!', 'Buscando la línea de fondo');
      this.particles.burst(this.ball.pos, 20, 0x00f0ff, 3.5);
    } else if (isSlice) {
      flightTime = 1.15;
      extraArc = 0.4;
      this.showAnnouncement('¡GOLPE CORTADO (SLICE)!', 'Bajo bote con efecto invertido');
      this.particles.burst(this.ball.pos, 22, 0xa855f7, 3.5);
    } else {
      if (isSweetSpot) {
        flightTime = 0.90;
        this.particles.burst(this.ball.pos, 28, 0x00ffaa, 4.8);
        this.particles.spawnImpactRing(this.ball.pos, 0x00ffaa);
      } else {
        this.particles.burst(this.ball.pos, 15, 0xffea00, 3.0);
      }
    }

    const vx = (targetX - this.ball.pos.x) / flightTime;
    const vz = (targetZ - this.ball.pos.z) / flightTime;
    const vy = (0.5 * 9.8 * flightTime * flightTime - this.ball.pos.y) / flightTime + extraArc;

    this.ball.vel.set(vx, vy, vz);

    // Ball 3D Angular Velocity (Tennis Topspin / Backspin)
    const spinRate = isSmash ? 20.0 : (isLob ? -12.0 : (isSlice ? -18.0 : 14.0));
    this.ball.spin.set(spinRate, (Math.random() - 0.5) * 6.0, 0);

    this.audio.playHit(power, isSmash, isSweetSpot);
    if (this.gameMode === 'online_host') this._pendingSound = 'hit';
    this.camShake = isSmash ? 0.45 : (isSweetSpot ? 0.24 : 0.10 * power);

    // Racket Impact Recoil Visual (kick on ball contact)
    const hitterChar = hitter === 'player' ? this.player : this.ai;
    if (hitterChar) {
      hitterChar.racketImpactRecoil = isSmash ? 0.38 : (isSweetSpot ? 0.22 : 0.14);
    }

    this.shotType = 'DRIVE';
    document.getElementById('current-shot').innerText = 'DRIVE';
    this.updateHUD();
  }

  showTimingFeedback(text, className) {
    const el = document.getElementById('timing-feedback');
    const txt = document.getElementById('timing-text');
    txt.innerText = text;
    el.className = `timing-badge ${className}`;
    clearTimeout(this.timingTimeout);
    this.timingTimeout = setTimeout(() => el.classList.add('hidden'), 1500);
  }

  // --- Official Tennis Point Evaluation & Scoring System ---
  awardPoint(winner, reason = '') {
    if (!this.pointActive) return;
    this.pointActive = false;
    this.serveFaultCount = 0; // Reset serve faults on point end

    this.audio.playWhistle();
    if (this.gameMode === 'online_host') this._pendingSound = 'whistle';

    const isMulti = (this.gameMode === 'local' || this.gameMode === 'online_host' || this.gameMode === 'online_guest');
    const p1Label = isMulti ? 'JUGADOR 1 (AZUL)' : 'TI';
    const p2Label = isMulti ? 'JUGADOR 2 (ROJO)' : 'EL RIVAL';

    if (winner === 'player') {
      this.scorePlayer++;
      this.audio.playCrowd();
      this.showAnnouncement(`¡PUNTO PARA ${p1Label}!`, reason);
    } else {
      this.scoreAI++;
      this.showAnnouncement(`¡PUNTO PARA ${p2Label}!`, reason);
    }

    // Tennis Game Calculation (0, 15, 30, 40, Deuce, Advantage)
    let gameWon = false;
    let gameWinner = null;

    if (this.scorePlayer >= 4 && this.scorePlayer - this.scoreAI >= 2) {
      gameWon = true;
      gameWinner = 'player';
      this.gamesPlayer++;
      this.scorePlayer = 0; this.scoreAI = 0;
      this.showAnnouncement(`¡JUEGO PARA ${p1Label}!`, 'Gana el juego');
    } else if (this.scoreAI >= 4 && this.scoreAI - this.scorePlayer >= 2) {
      gameWon = true;
      gameWinner = 'ai';
      this.gamesAI++;
      this.scorePlayer = 0; this.scoreAI = 0;
      this.showAnnouncement(`¡JUEGO PARA ${p2Label}!`, 'Gana el juego');
    } else if (this.scorePlayer >= 3 && this.scoreAI >= 3) {
      if (this.scorePlayer === this.scoreAI) {
        this.showAnnouncement('¡IGUALES (DEUCE)!', '40 - 40');
      } else if (this.scorePlayer === this.scoreAI + 1) {
        this.showAnnouncement(`¡VENTAJA ${p1Label}!`, 'Punto de juego');
      } else if (this.scoreAI === this.scorePlayer + 1) {
        this.showAnnouncement(`¡VENTAJA ${p2Label}!`, 'Punto de juego');
      }
    }

    // Set check (First to 6 with 2 games lead)
    if (gameWon) {
      if (this.gamesPlayer >= 6 && this.gamesPlayer - this.gamesAI >= 2) {
        this.setsPlayer++;
        this.gamesPlayer = 0; this.gamesAI = 0;
        this.showAnnouncement(`¡SET PARA ${p1Label}!`, 'Consigue la primera manga');
      } else if (this.gamesAI >= 6 && this.gamesAI - this.gamesPlayer >= 2) {
        this.setsAI++;
        this.gamesPlayer = 0; this.gamesAI = 0;
        this.showAnnouncement(`¡SET PARA ${p2Label}!`, 'Consigue la primera manga');
      }
      // Alternate server after every game
      this.server = (this.server === 'player') ? 'ai' : 'player';
      this.servingSide = 1;
    } else {
      // Alternate serving side (Deuce / Ad) after every point within game
      this.servingSide = -this.servingSide;
    }

    this.ball.vel.set(0, 0, 0);
    this.updateHUD();

    setTimeout(() => {
      this.prepareServe(this.server);
    }, 2200);
  }

  // Handle Service Fault (1st Serve fault -> 2nd serve, 2nd Serve fault -> Double Fault)
  handleServiceFault(faultReason) {
    this.pointActive = false;
    this.audio.playOut();
    if (this.gameMode === 'online_host') this._pendingSound = 'out';

    if (this.serveFaultCount === 0) {
      this.serveFaultCount = 1;
      this.showAnnouncement('¡FALTA EN EL SAQUE!', `${faultReason} • Segundo servicio`);
      setTimeout(() => {
        this.prepareServe(this.server);
      }, 1800);
    } else {
      this.serveFaultCount = 0;
      const winner = (this.server === 'player') ? 'ai' : 'player';
      this.awardPoint(winner, '¡DOBLE FALTA!');
    }
  }

  formatScore(p1, p2) {
    if (p1 >= 3 && p2 >= 3) {
      if (p1 === p2) return '40';
      if (p1 === p2 + 1) return 'AD';
      return '40';
    }
    const map = ['0', '15', '30', '40'];
    return map[Math.min(p1, 3)];
  }

  updateHUD() {
    document.getElementById('pts-player').innerText = this.formatScore(this.scorePlayer, this.scoreAI);
    document.getElementById('pts-ai').innerText = this.formatScore(this.scoreAI, this.scorePlayer);
    document.getElementById('games-player').innerText = this.gamesPlayer;
    document.getElementById('games-ai').innerText = this.gamesAI;
    document.getElementById('sets-player').innerText = this.setsPlayer;
    document.getElementById('sets-ai').innerText = this.setsAI;
    document.getElementById('rally-count').innerText = this.rally;
    if (this.currentMap === 'stadium') {
      this.updateJumbotronScreen();
    }
  }

  showAnnouncement(title, sub) {
    const el = document.getElementById('center-announcement');
    if (el) {
      const t = document.getElementById('announcement-title');
      const s = document.getElementById('announcement-sub');
      if (t) t.innerText = title;
      if (s) s.innerText = sub;
      el.classList.remove('hidden');
      clearTimeout(this.annTimeout);
      this.annTimeout = setTimeout(() => el.classList.add('hidden'), 2200);
    }
    if (this.currentMap === 'stadium') {
      this.updateJumbotronScreen(title, sub);
    }
    if (this.gameMode === 'online_host') {
      this._pendingAnn = { title, sub };
    }
  }

  // --- Official Tennis Physics Loop (No Walls, Strictly Singles Court Out Rules) ---
  updatePhysics(dt) {
    if (!this.pointActive) return;

    this.ball.prevPos.copy(this.ball.pos);

    // Gravity
    this.ball.vel.y -= 9.8 * dt;

    // Atmospheric Drag
    this.ball.vel.x *= (1 - 0.02 * dt);
    this.ball.vel.z *= (1 - 0.02 * dt);

    this.ball.pos.addScaledVector(this.ball.vel, dt);

    // Ball 3D Spin
    this.ball.mesh.rotation.x += this.ball.spin.x * dt;
    this.ball.mesh.rotation.y += this.ball.spin.y * dt;
    this.ball.mesh.rotation.z += this.ball.spin.z * dt;

    const speedKmH = Math.round(this.ball.vel.length() * 3.6);
    document.getElementById('ball-speed').innerHTML = `${speedKmH} <small>km/h</small>`;

    // Fast Shot Motion Trail with Dual Speed Thresholds
    if (this.ball.vel.lengthSq() > 180) {
      const isUltra = (this.ball.vel.lengthSq() > 380);
      const trailColor = (this.ball.lastHitter === 'player') ? (isUltra ? 0x00ffff : 0x38bdf8) : (isUltra ? 0xff2a55 : 0xf43f5e);
      this.particles.spawnBallTrail(this.ball.pos, trailColor, isUltra ? 1.4 : 1.0);
    }

    // 1. Continuous Collision Detection (CCD) Net Check
    const crossedNet = (this.ball.prevPos.z * this.ball.pos.z <= 0);
    if ((crossedNet || Math.abs(this.ball.pos.z) < 0.20) && this.ball.pos.y < this.NET_H) {
      if (this.rally === 0) {
        // Check if ball grazed the top cord tape (within 0.08m of net height)
        if (this.ball.pos.y >= this.NET_H - 0.08) {
          this.ball.isServeLetCandidate = true;
          this.ball.vel.z *= 0.62; // Slows down and continues over net
          this.ball.vel.y = Math.max(this.ball.vel.y, 1.1);
          this.audio.playBounce(0.35);
          if (this.gameMode === 'online_host') this._pendingSound = 'bounce';
          return;
        } else {
          this.ball.pos.z = (this.ball.prevPos.z > 0) ? 0.16 : -0.16;
          this.ball.vel.z = -this.ball.vel.z * 0.22;
          this.ball.vel.y *= 0.4;
          this.audio.playBounce(0.4);
          if (this.gameMode === 'online_host') this._pendingSound = 'bounce';
          this.handleServiceFault('Pelota en la red');
          return;
        }
      } else {
        this.ball.pos.z = (this.ball.prevPos.z > 0) ? 0.16 : -0.16;
        this.ball.vel.z = -this.ball.vel.z * 0.22;
        this.ball.vel.y *= 0.4;
        this.audio.playBounce(0.4);
        if (this.gameMode === 'online_host') this._pendingSound = 'bounce';
        const winner = (this.ball.lastHitter === 'player') ? 'ai' : 'player';
        this.awardPoint(winner, 'Pelota atrapada en la red');
        return;
      }
    }

    // 2. Court Ground Bounce (Y <= ballRadius)
    if (this.ball.pos.y <= this.ballRadius) {
      this.ball.pos.y = this.ballRadius;
      this.ball.vel.y = -this.ball.vel.y * 0.74; // Hard court restitution
      this.audio.playBounce(Math.abs(this.ball.vel.y) / 8);
      if (this.gameMode === 'online_host') this._pendingSound = 'bounce';

      // Map-themed impact particle burst
      if (this.currentMap === 'beach') {
        this.particles.burst(this.ball.pos, 14, 0xd9a766, 2.6);
      } else if (this.currentMap === 'zen') {
        this.particles.burst(this.ball.pos, 12, 0xffb6c1, 2.3);
      } else {
        this.particles.burst(this.ball.pos, 9, 0x88ccff, 2.0);

        // EA SPORTS: Line chalk puff explosion on boundary/service line impacts
        const bZ = Math.abs(this.ball.pos.z);
        const bX = Math.abs(this.ball.pos.x);
        const isNearBaseline = Math.abs(bZ - this.HALF_L) < 0.28;
        const isNearServiceLine = Math.abs(bZ - this.SERVICE_Z) < 0.25;
        const isNearSideline = Math.abs(bX - this.HALF_W) < 0.25 || Math.abs(bX - this.DOUBLES_HALF_W) < 0.25;
        const isNearCenterLine = bX < 0.18 && bZ <= this.SERVICE_Z;

        if (isNearBaseline || isNearServiceLine || isNearSideline || isNearCenterLine) {
          this.particles.spawnChalkPuff(this.ball.pos);
        }
      }

      const currentSide = (this.ball.pos.z > 0) ? 'player' : 'ai';

      // Rule A: SERVICE BOUNCE CHECK
      if (this.rally === 0 && !this.ball.hitGroundInCourt) {
        // Must land inside the diagonal service box
        // Player serve: lands on AI side (Z: -6.40m to 0), X on opposite side
        let validServiceBox = false;
        // Official Tennis Rule: A ball touching any part of the boundary line is IN
        const lineTol = 0.22;
        if (this.server === 'player') {
          const inZ = (this.ball.pos.z >= -this.SERVICE_Z - lineTol && this.ball.pos.z <= lineTol);
          const inX = (this.servingSide === 1) ?
                      (this.ball.pos.x >= -this.HALF_W - lineTol && this.ball.pos.x <= lineTol) :
                      (this.ball.pos.x >= -lineTol && this.ball.pos.x <= this.HALF_W + lineTol);
          validServiceBox = inZ && inX;
        } else {
          const inZ = (this.ball.pos.z >= -lineTol && this.ball.pos.z <= this.SERVICE_Z + lineTol);
          const inX = (this.servingSide === 1) ?
                      (this.ball.pos.x >= -lineTol && this.ball.pos.x <= this.HALF_W + lineTol) :
                      (this.ball.pos.x >= -this.HALF_W - lineTol && this.ball.pos.x <= lineTol);
          validServiceBox = inZ && inX;
        }

        // Official Tennis Let Rule: Ball clipped net cord on serve
        if (this.ball.isServeLetCandidate) {
          this.ball.isServeLetCandidate = false;
          if (validServiceBox) {
            this.showAnnouncement('¡SAQUE DE RED (LET)!', 'Pelota tocó la red y entró en el cuadro • Se repite el saque');
            this.audio.playWhistle();
            if (this.gameMode === 'online_host') this._pendingSound = 'whistle';
            this.ball.vel.set(0, 0, 0);
            setTimeout(() => {
              this.prepareServe(this.server);
            }, 1800);
            return;
          } else {
            this.handleServiceFault('Fuera del cuadro tras rozar la red');
            return;
          }
        }

        if (!validServiceBox) {
          this.handleServiceFault('Fuera del cuadro de saque');
          return;
        }

        // Valid serve first bounce inside diagonal service box
        this.ball.hitGroundInCourt = true;
        this.ball.bounceCount = 1;
        return;
      }

      // Rule B: Double Bounce Rule
      // If ball already bounced inside the court once, any subsequent ground bounce is a double bounce point for the hitter
      if (this.ball.hitGroundInCourt) {
        const winner = this.ball.lastHitter || (currentSide === 'player' ? 'ai' : 'player');
        this.awardPoint(winner, 'Doble bote en pista');
        return;
      }

      // Rule C: First bounce in rally (this.rally > 0 && !this.ball.hitGroundInCourt)
      // Own court bounce fault:
      if (this.ball.lastHitter && this.ball.lastHitter === currentSide) {
        const winner = (this.ball.lastHitter === 'player') ? 'ai' : 'player';
        this.awardPoint(winner, 'Bote en campo propio (Falta)');
        return;
      }

      // Rally in-play singles boundaries (touching line is IN)
      const lineTol = 0.22;
      const inSinglesX = Math.abs(this.ball.pos.x) <= this.HALF_W + lineTol;
      const inSinglesZ = Math.abs(this.ball.pos.z) <= this.HALF_L + lineTol;

      if (!inSinglesX || !inSinglesZ) {
        const winner = (this.ball.lastHitter === 'player') ? 'ai' : 'player';
        this.awardPoint(winner, '¡Pelota Fuera (OUT)!');
        return;
      }

      this.ball.hitGroundInCourt = true;
      this.ball.bounceCount = 1;
    }

    // Synchronize Ball & Shadow
    this.ball.mesh.position.copy(this.ball.pos);
    this.ball.shadow.position.set(this.ball.pos.x, 0.015, this.ball.pos.z);
    const sScale = Math.max(0.4, 1.0 - (this.ball.pos.y / 6.0));
    this.ball.shadow.scale.set(sScale, sScale, sScale);

    // Landing Ring Projection
    if (this.ball.vel.y < 0) {
      const tToF = (this.ball.pos.y - this.ballRadius) / Math.max(Math.abs(this.ball.vel.y), 0.1);
      const px = this.ball.pos.x + this.ball.vel.x * tToF;
      const pz = this.ball.pos.z + this.ball.vel.z * tToF;
      this.ball.targetMarker.position.set(px, 0.02, pz);
      this.ball.targetMarker.visible = true;
    } else {
      this.ball.targetMarker.visible = false;
    }
  }

  // --- AI Opponent Tactical Positioning & Intercept ---
  updateAI(dt) {
    if (!this.isPlaying) return;

    if (this.pointActive) {
      if (this.ball.vel.z < 0) {
        // Ball approaching AI side: intercept landing position
        const targetZ = -10.5;
        const timeToZ = Math.max(0.05, (this.ball.pos.z - targetZ) / Math.max(Math.abs(this.ball.vel.z), 1));
        const futureX = THREE.MathUtils.clamp(
          this.ball.pos.x + this.ball.vel.x * timeToZ,
          -this.HALF_W + 0.4,
          this.HALF_W - 0.4
        );
        this.ai.targetPos.set(futureX, 0, targetZ);
      } else {
        // AI recovers to center baseline
        this.ai.targetPos.set(0, 0, -11.5);
      }

      const delta = this._v1.subVectors(this.ai.targetPos, this.ai.pos);
      const dist = delta.length();
      if (dist > 0.1) {
        delta.normalize();
        this.ai.pos.addScaledVector(delta, Math.min(this.ai.speed * dt, dist));
        this.ai.runCycle += dt * 14;
      } else {
        this.ai.runCycle *= 0.8;
      }

      // AI Return Strike
      if (this.ai.limbs && this.ai.limbs.racket) {
        this.ai.limbs.racket.getWorldPosition(this._rHead);
        const distToAIRacket = this._rHead.distanceTo(this.ball.pos);
        const distToAIBody = this.ai.pos.distanceTo(this.ball.pos);

        // Tennis Rule 24: Receiver must allow the serve to bounce in the service box
        const canAIReturn = (this.rally > 0 || this.server === 'ai' || this.ball.hitGroundInCourt);

        if (canAIReturn && (distToAIRacket <= 1.45 || distToAIBody <= 1.95) && this.ball.pos.z < -0.35 && this.ball.lastHitter !== 'ai' && this.ball.pos.y >= 0.12) {
          const swingType = (this.ball.pos.x < this.ai.pos.x) ? 'forehand' : 'backhand';
          this.startSwingAnimation(this.ai, swingType);
          const aiPower = 0.72 + Math.random() * 0.28;
          this.executeHitWithHitbox('ai', aiPower, 0, true);
        }
      }
    }

    this.ai.model.position.copy(this.ai.pos);
    this.animateCharacter(this.ai, dt, true);
  }

  // --- Player Movement & Animation ---
  updatePlayer(dt) {
    if (!this.isPlaying) return;

    const dir = this._v1.set(0, 0, 0);
    if (this.keys['w'] || this.keys['arrowup']) dir.z -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) dir.z += 1;
    if (this.keys['a'] || this.keys['arrowleft']) dir.x -= 1;
    if (this.keys['d'] || this.keys['arrowright']) dir.x += 1;

    // Analog Virtual 360 Thumbstick support for iPhone / iPad / Mobile Touch
    if (this.touchJoystickVec && this.touchJoystickVec.lengthSq() > 0.02) {
      dir.x += this.touchJoystickVec.x;
      dir.z += this.touchJoystickVec.y; // Forward (-Z) / Backward (+Z)
    }

    const isSprinting = this.keys['shift'] || this.touchSprinting || (this.touchJoystickVec && this.touchJoystickVec.lengthSq() > 0.72);
    const curSpeed = this.player.speed * (isSprinting ? 1.45 : 1.0);

    if (dir.lengthSq() > 0) {
      dir.normalize();
      this.player.pos.addScaledVector(dir, curSpeed * dt);
      this.player.runCycle += dt * 14;

      this.player.pos.x = THREE.MathUtils.clamp(this.player.pos.x, -this.DOUBLES_HALF_W - 1.5, this.DOUBLES_HALF_W + 1.5);
      this.player.pos.z = THREE.MathUtils.clamp(this.player.pos.z, 0.9, this.HALF_L + 3.5);
    } else {
      this.player.runCycle *= 0.8;
    }

    if (this.isChargingPower) {
      this.power = Math.min(this.power + dt * 1.6, 1.0);
      document.getElementById('power-bar').style.width = `${this.power * 100}%`;
    }

    this.player.model.position.copy(this.player.pos);
    this.animateCharacter(this.player, dt, false);
  }

  // --- Pro Character Animations (Kinetic Chain Multi-Joint Biomechanics) ---
  animateCharacter(char, dt, isAI) {
    const limbs = char.limbs;
    if (!limbs) return;

    const time = this.clock ? this.clock.getElapsedTime() : 0;
    const isMoving = Math.abs(Math.sin(char.runCycle)) > 0.04;

    // 1. Lower Body & Biomechanical Running Stride vs Pro Dynamic Ready Stance
    const runPhase = char.runCycle || 0;
    if (isMoving) {
      // Natural human sprinting kinematics: hip flexion, trailing calf tuck, arm counter-drive
      const stride   = Math.sin(runPhase) * 0.88;
      const hipSway  = Math.sin(runPhase * 2) * 0.050;
      const calfSnap = Math.max(0, Math.sin(runPhase - 0.55) * 1.25);

      limbs.lLeg.rotation.x = stride;
      limbs.lLeg.rotation.z = -hipSway - 0.04;
      limbs.rLeg.rotation.x = -stride;
      limbs.rLeg.rotation.z = hipSway + 0.04;

      if (limbs.lCalf) limbs.lCalf.rotation.x = Math.max(0.08, -stride * 0.92 + calfSnap * 0.40);
      if (limbs.rCalf) limbs.rCalf.rotation.x = Math.max(0.08, stride * 0.92 - calfSnap * 0.40);

      if (!char.isSwinging) {
        // Natural opposite arm swings with relaxed elbow flexion
        limbs.lArm.rotation.x = -stride * 0.75;
        limbs.lArm.rotation.z = -0.10;
        limbs.rArm.rotation.x = stride * 0.58;
        limbs.rArm.rotation.z = 0.10;
        if (limbs.rFore) limbs.rFore.rotation.set(0.42, 0, 0);
        if (limbs.lFore) limbs.lFore.rotation.set(0.42, 0, 0);
      }

      // Dynamic forward athletic sprint lean + torso torsion counter-rotation
      limbs.torso.rotation.x = 0.14;
      limbs.torso.rotation.y = Math.sin(runPhase) * 0.10;
      limbs.torso.rotation.z = Math.sin(runPhase * 2) * 0.030;
      if (limbs.head) {
        limbs.head.rotation.x = Math.sin(runPhase * 2) * 0.024;
        limbs.head.rotation.y = -limbs.torso.rotation.y * 0.45; // Vestibular eye stabilization
      }
    } else {
      // AUTHENTIC PRO 2-HANDED READY SPLIT-STEP STANCE (Knees bent, balanced weight shift)
      const bounce = Math.sin(time * 6.8) * 0.032;
      const sway   = Math.sin(time * 2.4) * 0.018;
      const breath = Math.sin(time * 3.0) * 0.012;

      // Athletic wide-stance knee flexion
      limbs.lLeg.rotation.set(0.18 + bounce * 0.6, 0, -0.12);
      limbs.rLeg.rotation.set(0.18 + bounce * 0.6, 0,  0.12);
      if (limbs.lCalf) limbs.lCalf.rotation.x = 0.25 + bounce;
      if (limbs.rCalf) limbs.rCalf.rotation.x = 0.25 + bounce;

      limbs.torso.rotation.set(0.09 + breath, 0, sway); // Forward anticipation tilt
      if (limbs.head) {
        limbs.head.rotation.x = bounce * 0.5;
        limbs.head.rotation.z = -sway * 0.5;
      }

      if (!char.isSwinging) {
        // Right dominant arm bent holding handle at chest center
        limbs.rArm.rotation.set(-0.64 + bounce * 0.4, 0.34, -0.24);
        if (limbs.rFore) limbs.rFore.rotation.set(1.18, 0, 0);

        // Left non-dominant arm cradling racket throat bridge
        limbs.lArm.rotation.set(-0.54 + bounce * 0.4, -0.44, 0.30);
        if (limbs.lFore) limbs.lFore.rotation.set(1.02, 0, 0);
      }
    }

    // 2. MULTI-JOINT KINETIC CHAIN STROKE MECHANICS
    if (char.isSwinging) {
      char.swingProgress += dt * 10.8;
      const t = Math.min(char.swingProgress / Math.PI, 1.0);

      if (char.swingType === 'serve') {
        // Authentic Overhead Tennis Serve: Trophy Stance -> Explosive Extension -> Wrist Pronation Snap
        if (t <= 0.36) {
          const p = t / 0.36;
          const ease = Math.sin(p * Math.PI / 2);
          limbs.lArm.rotation.set(-2.7 * ease, 0, 0.28 * ease);
          limbs.rArm.rotation.set(1.5 * ease, -0.6 * ease, -1.25 * ease);
          if (limbs.rFore) limbs.rFore.rotation.set(1.65 * ease, 0, 0);
          limbs.torso.rotation.set(-0.28 * ease, 0.38 * ease, 0);
        } else if (t <= 0.72) {
          const p = (t - 0.36) / 0.36;
          const ease = p * p;
          limbs.lArm.rotation.set(-2.7 * (1 - p), 0, 0);
          // High overhead contact extension directly into ball flight path with pronation
          limbs.rArm.rotation.set(1.5 - 4.0 * p, -0.6 + 0.95 * p, -1.25 + 1.45 * p);
          if (limbs.rFore) limbs.rFore.rotation.set(1.65 * (1 - p), 0, 0);
          limbs.torso.rotation.set(-0.28 + 0.60 * p, 0.38 - 0.50 * p, 0);
        } else {
          const p = (t - 0.72) / 0.28;
          limbs.rArm.rotation.set(-2.5 + 3.3 * p, 0.35 - 0.55 * p, 0.2 - 1.65 * p);
          limbs.torso.rotation.set(0.32 * (1 - p), -0.12 * (1 - p), 0);
        }
      } else if (char.swingType === 'backhand') {
        // Two-Handed Backhand: Unit Turn Coil -> Forward Accelerating Drive -> High Wrap Finish
        if (t <= 0.34) {
          const p = t / 0.34;
          const ease = Math.sin(p * Math.PI / 2);
          limbs.torso.rotation.y = 0.90 * ease;
          limbs.rArm.rotation.set(0.38 * ease, -0.78 * ease, 1.40 * ease);
          limbs.lArm.rotation.set(0.30 * ease, -0.58 * ease, 1.10 * ease);
          if (limbs.rFore) limbs.rFore.rotation.set(0.88 * ease, 0, 0);
        } else if (t <= 0.68) {
          const p = (t - 0.34) / 0.34;
          // Contact sweep accelerating across strike zone
          limbs.torso.rotation.y = 0.90 - 1.65 * p;
          limbs.rArm.rotation.set(0.38 - 1.10 * p, -0.78 + 1.60 * p, 1.40 - 2.85 * p);
          limbs.lArm.rotation.set(0.30 - 1.00 * p, -0.58 + 1.40 * p, 1.10 - 2.45 * p);
          if (limbs.rFore) limbs.rFore.rotation.set(0.88 + 0.50 * p, 0, 0);
        } else {
          const p = (t - 0.68) / 0.32;
          limbs.torso.rotation.set(0.14 * p, -0.75 * (1 - p), 0);
          limbs.rArm.rotation.set(-0.72 * (1 - p) - 0.64 * p, 0.82 * (1 - p) + 0.34 * p, -1.45 * (1 - p) - 0.24 * p);
          limbs.lArm.rotation.set(-0.70 * (1 - p) - 0.54 * p, 0.82 * (1 - p) - 0.44 * p, -1.35 * (1 - p) + 0.30 * p);
          if (limbs.rFore) limbs.rFore.rotation.set(1.38 * (1 - p) + 1.18 * p, 0, 0);
          if (limbs.lFore) limbs.lFore.rotation.set(0.65 * (1 - p) + 1.02 * p, 0, 0);
        }
      } else {
        // Modern Topspin Forehand: Unit Turn Coil -> Slot Lag -> Sweet Spot Impact -> Windshield Wiper Wrap
        if (t <= 0.34) {
          const p = t / 0.34;
          const ease = Math.sin(p * Math.PI / 2);
          limbs.torso.rotation.y = -0.96 * ease;
          limbs.rArm.rotation.set(0.35 * ease, 0.82 * ease, -1.58 * ease);
          if (limbs.rFore) limbs.rFore.rotation.set(0.58 * ease, 0, 0);
          limbs.lArm.rotation.set(-0.68 * ease, 0.24 * ease, 0.82 * ease);
        } else if (t <= 0.68) {
          const p = (t - 0.34) / 0.34;
          // Forward explosive drive with racket head whipping forward through ball impact
          limbs.torso.rotation.y = -0.96 + 1.56 * p;
          limbs.rArm.rotation.set(0.35 - 0.90 * p, 0.82 - 1.72 * p, -1.58 + 3.28 * p);
          if (limbs.rFore) limbs.rFore.rotation.set(0.58 + 0.90 * p, 0, 0);
          limbs.lArm.rotation.set(-0.68 + 0.90 * p, 0.24 - 0.38 * p, 0.82 - 1.30 * p);
        } else {
          const p = (t - 0.68) / 0.32;
          limbs.torso.rotation.set(0.14 * p, 0.60 * (1 - p), 0);
          limbs.rArm.rotation.set(-0.55 * (1 - p) - 0.64 * p, -0.90 * (1 - p) + 0.34 * p, 1.70 * (1 - p) - 0.24 * p);
          if (limbs.rFore) limbs.rFore.rotation.set(1.48 * (1 - p) + 1.18 * p, 0, 0);
          limbs.lArm.rotation.set(0.22 * (1 - p) - 0.54 * p, -0.14 * (1 - p) - 0.44 * p, -0.48 * (1 - p) + 0.30 * p);
          if (limbs.lFore) limbs.lFore.rotation.set(0.65 * (1 - p) + 1.02 * p, 0, 0);
        }
      }

      if (char.swingProgress >= Math.PI) {
        char.isSwinging = false;
        char.swingProgress = 0;
      }
    }
  }
  // --- Online Tournament Engine (4+ Players with World Rotation) ---
  initTournamentUI() {
    const tabTourn = document.getElementById('tab-mode-tournament');
    const panelTourn = document.getElementById('mode-panel-tournament');
    const tabAI = document.getElementById('tab-mode-ai');
    const tabOnline = document.getElementById('tab-mode-online');
    const tabLocal = document.getElementById('tab-mode-local');
    const panelAI = document.getElementById('mode-panel-ai');
    const panelOnline = document.getElementById('mode-panel-online');
    const panelLocal = document.getElementById('mode-panel-local');

// tabTourn listener unified in initMultiplayer()

    // Fill Tournament with AI Pros
    const btnFillAI = document.getElementById('btn-fill-tournament-ai');
    if (btnFillAI) {
      btnFillAI.addEventListener('click', () => {
        this.fillTournamentWithAI();
      });
    }

    // Start Tournament Button
    const btnStartTourn = document.getElementById('btn-start-tournament');
    if (btnStartTourn) {
      btnStartTourn.addEventListener('click', () => {
        this.startTournament();
      });
    }

    // Join Tournament Button
    const btnJoinTourn = document.getElementById('btn-join-tournament');
    const joinTournInput = document.getElementById('join-tournament-input');
    if (btnJoinTourn && joinTournInput) {
      btnJoinTourn.addEventListener('click', () => {
        const code = joinTournInput.value.trim().toUpperCase();
        if (code) {
          this.connectToTournament(code);
        }
      });
    }

    // Copy Tournament Code
    const btnCopyTourn = document.getElementById('btn-copy-tournament-code');
    if (btnCopyTourn) {
      btnCopyTourn.addEventListener('click', () => {
        if (this.tournament.code) {
          navigator.clipboard.writeText(this.tournament.code);
          btnCopyTourn.innerText = '¡Copiado!';
          setTimeout(() => btnCopyTourn.innerText = 'Copiar Enlace', 2000);
        }
      });
    }

    // Resume/Next Match in Tournament Modal
    const btnResumeTourn = document.getElementById('btn-resume-tournament-match');
    if (btnResumeTourn) {
      btnResumeTourn.addEventListener('click', () => {
        const modal = document.getElementById('tournament-modal');
        if (modal) modal.classList.add('hidden');
        this.resumeTournamentRound();
      });
    }
  }

  setupTournamentHost() {
    this.gameMode = 'tournament_host';
    this.tournament.active = true;
    this.tournament.isHost = true;
    this.tournament.round = 1;

    const myName = (document.getElementById('player-nickname')?.value || 'CAMPEÓN').trim();
    const myGender = document.querySelector('.gender-btn.active')?.dataset.gender || 'male';

    if (!this.peer || this.peer.destroyed) {
      const code = 'TORNEO-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      this.tournament.code = code;
      const display = document.getElementById('tournament-code-display');
      if (display) display.innerText = code;

      try {
        this.peer = new Peer(code, {
          config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });
      } catch (e) {
        console.warn('PeerJS init fallback', e);
      }
    } else {
      const display = document.getElementById('tournament-code-display');
      if (display) display.innerText = this.tournament.code || this.peer.id;
    }

    // Initialize players list with host as Slot 1
    this.tournament.players = [
      { id: 'host', name: myName, gender: myGender, isHost: true, isAI: false, wins: 0, games: 0 }
    ];
    this.updateTournamentLobbyUI();
  }

  fillTournamentWithAI() {
    const pros = [
      { name: 'C. ALCARAZ', gender: 'male' },
      { name: 'A. SABALENKA', gender: 'female' },
      { name: 'J. SINNER', gender: 'male' },
      { name: 'I. SWIATEK', gender: 'female' },
      { name: 'N. DJOKOVIC', gender: 'male' },
      { name: 'C. GAUFF', gender: 'female' }
    ];

    let proIdx = 0;
    while (this.tournament.players.length < 4) {
      const pro = pros[proIdx % pros.length];
      this.tournament.players.push({
        id: 'ai_' + (proIdx + 1),
        name: pro.name,
        gender: pro.gender,
        isHost: false,
        isAI: true,
        wins: 0,
        games: 0
      });
      proIdx++;
    }

    this.updateTournamentLobbyUI();
    this.audio.playHit(0.8, false, true);
  }

  updateTournamentLobbyUI() {
    const countEl = document.getElementById('tournament-slot-count');
    if (countEl) countEl.innerText = this.tournament.players.length;

    const listEl = document.getElementById('tournament-players-list');
    if (listEl) {
      listEl.innerHTML = '';
      for (let i = 0; i < 4; i++) {
        const p = this.tournament.players[i];
        const item = document.createElement('div');
        item.className = 'tournament-slot-item';

        if (p) {
          const genderIcon = p.gender === 'female' ? '♀️' : '♂️';
          const badgeClass = p.isHost ? 'badge-host' : (p.isAI ? 'badge-ai' : 'badge-ready');
          const badgeText = p.isHost ? 'ANFITRIÓN' : (p.isAI ? 'IA PRO' : 'LISTO');
          item.innerHTML = `
            <div class="slot-name">
              <span>${genderIcon}</span>
              <span>${p.name}</span>
            </div>
            <span class="slot-badge ${badgeClass}">${badgeText}</span>
          `;
        } else {
          item.innerHTML = `
            <div class="slot-name" style="color: #64748b;">
              <span>👤</span>
              <span>Esperando jugador ${i + 1}...</span>
            </div>
            <span class="slot-badge badge-empty">VACANTE</span>
          `;
        }
        listEl.appendChild(item);
      }
    }

    const startBtn = document.getElementById('btn-start-tournament');
    if (startBtn) {
      startBtn.disabled = (this.tournament.players.length < 4);
    }
  }

  connectToTournament(code) {
    const statusEl = document.getElementById('tournament-join-status');
    if (statusEl) statusEl.innerText = 'Conectando al torneo ' + code + '...';

    const myName = (document.getElementById('player-nickname')?.value || 'CAMPEÓN').trim();
    const myGender = document.querySelector('.gender-btn.active')?.dataset.gender || 'male';

    if (!this.peer) {
      this.peer = new Peer(this.getPeerConfig());
    }

    this.conn = this.peer.connect(code, { reliable: true });
    this.conn.on('open', () => {
      this.gameMode = 'tournament_guest';
      this.tournament.active = true;
      this.tournament.isHost = false;
      this.conn.send({
        type: 'tournament_join',
        name: myName,
        gender: myGender
      });
      if (statusEl) statusEl.innerText = '¡Unido a la sala de torneo con éxito!';
    });

    this.conn.on('data', (data) => {
      if (data.type === 'tournament_sync') {
        this.tournament = data.tournament;
        this.updateTournamentLobbyUI();
      } else if (data.type === 'tournament_start') {
        this.tournament = data.tournament;
        this.startTournamentMatch(data.assignedMatch);
      }
    });
  }

  startTournament() {
    this.tournament.active = true;
    this.tournament.round = 1;

    // Build Round 1 Matches:
    // Match 1: Player 1 vs Player 2 in Arena Pro (stadium)
    // Match 2: Player 3 vs Player 4 in Playa Paraíso (beach)
    const p = this.tournament.players;
    this.tournament.matches = [
      {
        id: 'r1_m1',
        round: 1,
        court: 'stadium',
        courtName: 'Grand Slam Arena',
        p1: p[0],
        p2: p[1],
        scoreP1: 0,
        scoreP2: 0,
        winner: null,
        status: 'in_progress'
      },
      {
        id: 'r1_m2',
        round: 1,
        court: 'beach',
        courtName: 'Playa Paraíso',
        p1: p[2],
        p2: p[3],
        scoreP1: 0,
        scoreP2: 0,
        winner: null,
        status: 'in_progress'
      }
    ];

    document.getElementById('start-screen').classList.add('fade-out');
    this.isPlaying = true;

    // Load Round 1 World (Arena Pro) for host match
    this.setMap('stadium', false);
    this.ai.nickname = p[1].name;
    document.getElementById('hud-ai-name').innerText = p[1].name;

    this.showAnnouncement('¡TORNEO INICIADO! • RONDA 1', `${p[0].name} vs ${p[1].name} en ARENA PRO`);
  }

  checkTournamentProgress() {
    if (!this.tournament.active) return;

    // Simulate/evaluate concurrent match if AI vs AI
    if (this.tournament.round === 1) {
      const m2 = this.tournament.matches[1];
      if (m2 && !m2.winner) {
        // Evaluate M2 winner
        m2.scoreP1 = Math.floor(Math.random() * 2) + 3;
        m2.scoreP2 = Math.floor(Math.random() * 2) + 1;
        m2.winner = (m2.scoreP1 > m2.scoreP2) ? m2.p1 : m2.p2;
        m2.loser = (m2.scoreP1 > m2.scoreP2) ? m2.p2 : m2.p1;
      }

      // Conclude host match
      const m1 = this.tournament.matches[0];
      if (m1 && !m1.winner) {
        m1.scoreP1 = this.gamesPlayer;
        m1.scoreP2 = this.gamesAI;
        m1.winner = (this.gamesPlayer >= this.gamesAI) ? m1.p1 : m1.p2;
        m1.loser = (this.gamesPlayer >= this.gamesAI) ? m1.p2 : m1.p1;
      }

      this.showTournamentBracketModal();
    } else if (this.tournament.round === 2) {
      // Grand Final Finished!
      const mFinal = this.tournament.matches[2];
      if (mFinal) {
        mFinal.scoreP1 = this.gamesPlayer;
        mFinal.scoreP2 = this.gamesAI;
        mFinal.winner = (this.gamesPlayer >= this.gamesAI) ? mFinal.p1 : mFinal.p2;
      }
      this.showTournamentVictory(mFinal ? mFinal.winner : this.player);
    }
  }

  showTournamentBracketModal() {
    const modal = document.getElementById('tournament-modal');
    if (!modal) return;

    const treeEl = document.getElementById('tournament-bracket-tree');
    if (treeEl) {
      treeEl.innerHTML = '';
      this.tournament.matches.forEach((m, idx) => {
        const card = document.createElement('div');
        card.className = 'match-bracket-card';
        card.innerHTML = `
          <div class="match-header">
            <span>SET ${idx + 1}</span>
            <span class="match-arena-tag">${m.courtName}</span>
          </div>
          <div class="match-competitors">
            <div class="match-player-row ${m.winner && m.winner.name === m.p1.name ? 'winner' : ''}">
              <span>${m.p1.name}</span>
              <span>${m.scoreP1}</span>
            </div>
            <div class="match-player-row ${m.winner && m.winner.name === m.p2.name ? 'winner' : ''}">
              <span>${m.p2.name}</span>
              <span>${m.scoreP2}</span>
            </div>
          </div>
        `;
        treeEl.appendChild(card);
      });
    }

    // Standings table
    const tableBody = document.getElementById('tournament-standings-body');
    if (tableBody) {
      tableBody.innerHTML = '';
      this.tournament.players.forEach((p, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>#${idx + 1}</td>
          <td><strong>${p.name}</strong></td>
          <td>${p.wins || 1}</td>
          <td>${p.games || 4}</td>
          <td><span class="slot-badge badge-ready">CLASIFICADO</span></td>
        `;
        tableBody.appendChild(tr);
      });
    }

    modal.classList.remove('hidden');
    this.audio.playFanfare();
  }

  resumeTournamentRound() {
    this.tournament.round = 2;

    // ROTATION TO NEW WORLDS:
    // Final in White House (La Casa Blanca 🏛️)
    // 3rd place in Zen Temple (Templo Zen ⛩️)
    const m1 = this.tournament.matches[0];
    const m2 = this.tournament.matches[1];

    const finalists = [m1.winner, m2.winner];
    const bronzeMatch = [m1.loser, m2.loser];

    this.tournament.matches.push(
      {
        id: 'r2_final',
        round: 2,
        court: 'whitehouse',
        courtName: 'La Casa Blanca (Gran Final)',
        p1: finalists[0],
        p2: finalists[1],
        scoreP1: 0,
        scoreP2: 0,
        winner: null
      },
      {
        id: 'r2_bronze',
        round: 2,
        court: 'zen',
        courtName: 'Templo Zen (3er Puesto)',
        p1: bronzeMatch[0],
        p2: bronzeMatch[1],
        scoreP1: 0,
        scoreP2: 0,
        winner: null
      }
    );

    // Reset scores for championship set
    this.scorePlayer = 0;
    this.scoreAI = 0;
    this.gamesPlayer = 0;
    this.gamesAI = 0;
    this.updateHUD();

    // ROTATE TO THE WHITE HOUSE MAP!
    this.setMap('whitehouse', false);
    this.ai.nickname = finalists[1].name;
    document.getElementById('hud-ai-name').innerText = finalists[1].name;

    this.prepareServe('player');
    this.showAnnouncement('¡GRAN FINAL EN LA CASA BLANCA!', `${finalists[0].name} vs ${finalists[1].name}`);
  }

  showTournamentVictory(winner) {
    this.particles.burst(new THREE.Vector3(0, 3, 0), 100, 0xd4af37, 9.0);
    this.particles.burst(new THREE.Vector3(-4, 3, 0), 60, 0x00f0ff, 8.0);
    this.particles.burst(new THREE.Vector3(4, 3, 0), 60, 0xff0055, 8.0);
    this.audio.playCrowd();
    this.audio.playFanfare();

    this.showAnnouncement('🏆 ¡CAMPEÓN DEL TORNEO GRAND SLAM! 🏆', `${winner.name} CONQUISTA EL TROFEO PRESIDENCIAL`);
  }

  updateCamera(dt) {
    if (this.cameraMode === 'third') {
      if (this.gameMode === 'online_guest') {
        // Perspective from Guest baseline looking toward host
        this._camTarget.set(
          this.ai.pos.x * 0.35,
          4.5 + Math.max(0, (this.ball.pos.y - 1.2) * 0.25),
          this.ai.pos.z - 6.2
        );
        this.camera.position.lerp(this._camTarget, dt * 5.5);
        this.camera.lookAt(this.ball.pos.x * 0.3, 1.1, 0);
      } else {
        // Host / Solo Perspective
        this._camTarget.set(
          this.player.pos.x * 0.35,
          4.5 + Math.max(0, (this.ball.pos.y - 1.2) * 0.25),
          this.player.pos.z + 6.2
        );
        this.camera.position.lerp(this._camTarget, dt * 5.5);
        this.camera.lookAt(this.ball.pos.x * 0.3, 1.1, 0);
      }
    } else if (this.cameraMode === 'broadcast') {
      this._camTarget.set(13.5, 6.5, 0);
      this.camera.position.lerp(this._camTarget, dt * 4.0);
      this.camera.lookAt(this.ball.pos.x * 0.5, 0.9, this.ball.pos.z * 0.5);
    } else if (this.cameraMode === 'top') {
      this._camTarget.set(0, 26.0, 1.0);
      this.camera.position.lerp(this._camTarget, dt * 4.0);
      this.camera.lookAt(0, 0, 0);
    }

    // Dynamic Camera Impact Shake (Smashes, Aces & Sweet Spots)
    if (this.camShake > 0.002) {
      this.camera.position.x += (Math.random() - 0.5) * this.camShake;
      this.camera.position.y += (Math.random() - 0.5) * this.camShake;
      this.camShake *= Math.pow(0.04, dt);
    }
  }

  // --- 2D Realtime Tactical Tennis Minimap (High-DPI, Compact & Non-Obtrusive) ---
  toggleMinimap() {
    const card = document.getElementById('minimap-card');
    const icon = document.getElementById('minimap-toggle-icon');
    if (!card) return;
    const isCollapsed = card.classList.toggle('collapsed');
    if (icon) icon.innerText = isCollapsed ? '+' : '−';
  }

  drawMinimap() {
    const card = document.getElementById('minimap-card');
    if (card && card.classList.contains('collapsed')) return;
    const c = document.getElementById('minimap');
    if (!c) return;
    const ctx = c.getContext('2d');
    
    // High-DPI Retina Canvas Scaling (Compact 80x160 for optimal visibility)
    const dpr = window.devicePixelRatio || 1;
    const logicalW = 80;
    const logicalH = 160;
    if (c.width !== Math.round(logicalW * dpr) || c.height !== Math.round(logicalH * dpr)) {
      c.width = Math.round(logicalW * dpr);
      c.height = Math.round(logicalH * dpr);
    }
    
    ctx.save();
    ctx.scale(dpr, dpr);
    const w = logicalW, h = logicalH;

    // Arena-themed palette
    let bgOuter, courtInner, courtOuter, lineCol, netCol;
    if (this.currentMap === 'beach') {
      bgOuter = '#291305';
      courtOuter = '#92400e';
      courtInner = '#d97706';
      lineCol = 'rgba(254, 243, 199, 0.9)';
      netCol = '#fef3c7';
    } else if (this.currentMap === 'zen') {
      bgOuter = '#0a0f18';
      courtOuter = '#0f172a';
      courtInner = '#1e293b';
      lineCol = 'rgba(241, 245, 249, 0.9)';
      netCol = '#ef4444';
    } else if (this.currentMap === 'whitehouse') {
      bgOuter = '#052e16';
      courtOuter = '#14532d';
      courtInner = '#166534';
      lineCol = 'rgba(254, 240, 138, 0.95)'; // 24K Presidential Gold Lines
      netCol = '#fef08a';
    } else {
      // Stadium Pro
      bgOuter = '#030a16';
      courtOuter = '#0c2244';
      courtInner = '#1d4ed8';
      lineCol = 'rgba(255, 255, 255, 0.92)';
      netCol = '#ffffff';
    }

    // 1. Clear background
    ctx.fillStyle = bgOuter;
    ctx.fillRect(0, 0, w, h);

    // Court bounds with margin
    const mX = 8;
    const mY = 10;
    const cW = w - mX * 2;
    const cH = h - mY * 2;

    // Surrounding runoff area
    ctx.fillStyle = courtOuter;
    ctx.fillRect(mX - 3, mY - 4, cW + 6, cH + 8);

    // Main Doubles Court Bed
    ctx.fillStyle = courtInner;
    ctx.fillRect(mX, mY, cW, cH);

    // Coordinate converters (mapping real world meters to minimap pixels)
    const toX = (x) => mX + ((x + this.DOUBLES_HALF_W) / this.COURT_W) * cW;
    const toY = (z) => mY + ((z + this.HALF_L) / this.COURT_L) * cH;

    // 2. Regulation Tennis Court Lines
    ctx.strokeStyle = lineCol;
    ctx.lineWidth = 1.0;

    // Doubles outer perimeter
    ctx.strokeRect(mX, mY, cW, cH);

    // Singles sidelines (tramlines: x = +/-4.115m)
    const singlesLeft = toX(-this.HALF_W);
    const singlesRight = toX(this.HALF_W);
    ctx.beginPath();
    ctx.moveTo(singlesLeft, mY); ctx.lineTo(singlesLeft, mY + cH);
    ctx.moveTo(singlesRight, mY); ctx.lineTo(singlesRight, mY + cH);
    ctx.stroke();

    // Service lines (+/-6.40m from net)
    const servTop = toY(-this.SERVICE_Z);
    const servBottom = toY(this.SERVICE_Z);
    ctx.beginPath();
    ctx.moveTo(singlesLeft, servTop); ctx.lineTo(singlesRight, servTop);
    ctx.moveTo(singlesLeft, servBottom); ctx.lineTo(singlesRight, servBottom);
    // Center Service Line
    ctx.moveTo(toX(0), servTop); ctx.lineTo(toX(0), servBottom);
    ctx.stroke();

    // Baseline Center Marks (hash ticks at x = 0)
    ctx.beginPath();
    ctx.moveTo(toX(0), mY); ctx.lineTo(toX(0), mY + 4);
    ctx.moveTo(toX(0), mY + cH); ctx.lineTo(toX(0), mY + cH - 4);
    ctx.stroke();

    // Net line at Z = 0
    const netY = toY(0);
    ctx.strokeStyle = netCol;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(mX - 4, netY); ctx.lineTo(mX + cW + 4, netY);
    ctx.stroke();

    // Net posts
    ctx.fillStyle = netCol;
    ctx.fillRect(mX - 5, netY - 2, 3, 4);
    ctx.fillRect(mX + cW + 2, netY - 2, 3, 4);

    // 3. Ball Trajectory Trail
    if (!this._ballTrail) this._ballTrail = [];
    if (this.pointActive) {
      this._ballTrail.push({ x: this.ball.pos.x, z: this.ball.pos.z, y: this.ball.pos.y });
      if (this._ballTrail.length > 7) this._ballTrail.shift();
    } else {
      this._ballTrail.length = 0;
    }

    if (this._ballTrail.length > 1) {
      for (let i = 0; i < this._ballTrail.length - 1; i++) {
        const p1 = this._ballTrail[i];
        const p2 = this._ballTrail[i + 1];
        const alpha = (i + 1) / this._ballTrail.length * 0.45;
        ctx.strokeStyle = `rgba(204, 255, 0, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(toX(p1.x), toY(p1.z));
        ctx.lineTo(toX(p2.x), toY(p2.z));
        ctx.stroke();
      }
    }

    // 4. Ball Shadow & Marker
    const bx = toX(this.ball.pos.x);
    const bz = toY(this.ball.pos.z);
    const bHeight = Math.max(0, this.ball.pos.y);

    // Shadow on court plane (grows fainter as ball climbs higher)
    if (bHeight > 0.15) {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0.15, 0.55 - bHeight * 0.08)})`;
      ctx.beginPath();
      ctx.ellipse(bx, bz, 3.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ball (Optic Tennis Yellow with Glow)
    const ballRadius = Math.min(5.5, 3.2 + bHeight * 0.4);
    ctx.shadowColor = '#ccff00';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ccff00';
    ctx.beginPath();
    ctx.arc(bx, bz - bHeight * 0.6, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 5. Player 2 (AI / Rival) Marker (Crimson with outline)
    const aiX = toX(this.ai.pos.x);
    const aiZ = toY(this.ai.pos.z);
    ctx.shadowColor = '#ff2a55';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ff2a55';
    ctx.beginPath();
    ctx.arc(aiX, aiZ, 5.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 6. Player 1 (You) Marker (Cyan with Directional Cone & Ring)
    const pX = toX(this.player.pos.x);
    const pZ = toY(this.player.pos.z);

    // Subtle Sweet Spot coverage arc in front of player
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(pX, pZ, 12, -Math.PI * 0.9, -Math.PI * 0.1);
    ctx.lineTo(pX, pZ);
    ctx.closePath();
    ctx.fill();

    // Player body dot
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(pX, pZ, 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Facing direction chevron pointing toward net (-Z)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(pX, pZ - 7.5);
    ctx.lineTo(pX - 3, pZ - 4.5);
    ctx.lineTo(pX + 3, pZ - 4.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);

    this.particles.update(dt);
    this.updateCrowdFlashes(dt);

    if (this.currentMap === 'stadium' && this.ledTex) {
      this.ledTex.offset.x -= dt * 0.08;
    }

    // Dynamic Environment Animations
      // White House American Flag Dynamic Wind Wave
      if (this.currentMap === 'whitehouse' && this.whiteHouseFlag && this.whiteHouseFlag.geometry) {
        const time = this.clock.getElapsedTime();
        const pos = this.whiteHouseFlag.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i);
          const v = pos.getY(i);
          const wave = Math.sin(u * 2.8 - time * 6.5) * 0.18 * (u / 4.4) + Math.cos(v * 2.0 + time * 4.2) * 0.05 * (u / 4.4);
          pos.setZ(i, wave);
        }
        pos.needsUpdate = true;
      }

    if (this.currentMap === 'beach') {
      const time = this.clock.getElapsedTime();
      if (this.oceanMesh && this.oceanMesh.geometry && this.oceanMesh.geometry.attributes.position) {
        const pos = this.oceanMesh.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i);
          const v = pos.getY(i);
          // Multi-frequency Gerstner-style wave displacement
          const w1 = Math.sin(u * 0.11 + time * 2.0) * 0.40;
          const w2 = Math.cos(v * 0.14 + time * 1.55) * 0.28;
          const w3 = Math.sin(u * 0.25 - v * 0.18 + time * 3.1) * 0.16;
          const w4 = Math.cos(u * 0.38 + v * 0.30 + time * 4.5) * 0.08;
          pos.setZ(i, w1 + w2 + w3 + w4);
        }
        pos.needsUpdate = true;
        // Animate water normal map offset for ripple movement
        if (this.oceanMesh.material.normalMap) {
          this.oceanMesh.material.normalMap.offset.set(time * 0.016, time * 0.012);
        }
      }
      // Animate shoreline foam alpha lapping
      if (this.shorelineFoam) {
        const foamAlpha = 0.55 + Math.sin(time * 1.4) * 0.22 + Math.sin(time * 2.8 + 0.9) * 0.12;
        this.shorelineFoam.material.opacity = THREE.MathUtils.clamp(foamAlpha, 0.22, 0.85);
        this.shorelineFoam.position.z = -22.0 + Math.sin(time * 1.1) * 0.65;
      }
      if (this.tikiTorches && this.tikiTorches.length > 0) {
        for (let i = 0; i < this.tikiTorches.length; i++) {
          const torch = this.tikiTorches[i];
          const flicker = Math.sin(time * 12 + torch.seed) * 0.35 + Math.cos(time * 7 + torch.seed * 1.7) * 0.2;
          torch.light.intensity = torch.baseIntensity + flicker;
          if (torch.flame) {
            torch.flame.scale.y = 1 + flicker * 0.3;
          }
        }
      }
    }

    if (this.gameMode === 'local') {
      this.updatePlayer(dt);
      this.updatePlayer2Local(dt);
      this.updatePhysics(dt);
    } else if (this.gameMode === 'online_host') {
      this.updatePlayer(dt);
      // Smoothly interpolate Guest (AI mesh) on Host screen without teleports or jitter
      this.ai.pos.lerp(this.ai.netTargetPos, Math.min(1.0, dt * 26));
      this.ai.model.position.copy(this.ai.pos);
      this.animateCharacter(this.ai, dt, true);
      this.syncOnlineHost(dt);
      this.updatePhysics(dt);
    } else if (this.gameMode === 'online_guest') {
      this.updatePlayer2Guest(dt);
      // Smooth ball velocity & gravity prediction between host sync packets for locked 60fps
      if (this.ball && this.ball.vel && this.ball.mesh && this.pointActive) {
        this.ball.vel.y -= 9.8 * dt;
        this.ball.pos.addScaledVector(this.ball.vel, dt);
        this.ball.mesh.position.copy(this.ball.pos);
        if (this.ball.shadow) {
          this.ball.shadow.position.set(this.ball.pos.x, 0.015, this.ball.pos.z);
        }
      }
      // Render and smoothly interpolate host's athlete model on guest's screen without teleports
      this.player.pos.lerp(this.player.netTargetPos, Math.min(1.0, dt * 26));
      this.player.model.position.copy(this.player.pos);
      this.animateCharacter(this.player, dt, false);
    } else {
      // Solo vs AI
      this.updatePlayer(dt);
      this.updateAI(dt);
      this.updatePhysics(dt);
    }

    this.updateCamera(dt);

    // Throttle minimap canvas draws to every 3 frames for zero lag
    this._minimapTick = (this._minimapTick || 0) + 1;
    if (this._minimapTick % 3 === 0) {
      this.drawMinimap();
    }

    if (this.usePostProcessing && this.renderTarget && this.postScene) {
      if (this.postMaterial && this.postMaterial.uniforms && this.postMaterial.uniforms.uTime) {
        this.postMaterial.uniforms.uTime.value = this.clock.getElapsedTime();
      }
      this.renderer.setRenderTarget(this.renderTarget);
      this.renderer.render(this.scene, this.camera);
      this.renderer.setRenderTarget(null);
      this.renderer.render(this.postScene, this.postCamera);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Global Alias for backwards compatibility
const PadelGameEngine = TennisGameEngine;

window.addEventListener('DOMContentLoaded', () => {
  window.tennisGame = new TennisGameEngine();
  window.padelGame = window.tennisGame;
});
