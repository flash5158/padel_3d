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
  }

  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Crisp Tennis Racket String Impact Pop (Polyester / Gut String Bed)
  playHit(power = 1.0, isSmash = false, isSweetSpot = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // High tension string ping
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    const startFreq = isSmash ? 580 : (isSweetSpot ? 490 : 380);
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.09);

    g.gain.setValueAtTime(0.9 * Math.min(1.3, power), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.09);

    // String snap transient / friction whoosh
    const bSize = Math.floor(this.ctx.sampleRate * 0.04);
    const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < bSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bSize * 0.25));
    const noise = this.ctx.createBufferSource();
    noise.buffer = b;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = isSmash ? 4200 : (isSweetSpot ? 3400 : 2600);
    filter.Q.value = 3.5;

    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.65 * power, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    noise.connect(filter); filter.connect(ng); ng.connect(this.ctx.destination);
    noise.start(t);
  }

  // Hard Court Tennis Ball Bounce (Thud)
  playBounce(v = 1.0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(165, t);
    osc.frequency.exponentialRampToValueAtTime(36, t + 0.075);

    g.gain.setValueAtTime(Math.min(0.50 * v, 0.60), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.075);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.075);
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

  // 3. Official Grand Slam Hard Court (DecoTurf Australian / US Open Blue with Crisp Lines)
  createTurfTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // Outer Court: Deep Tournament Green / Marine
    ctx.fillStyle = '#0e4a36';
    ctx.fillRect(0, 0, 1024, 2048);

    // Coordinate Mapping (Tennis Court: Length 23.77m, Width 10.97m)
    const scaleX = 1024 / 16.0; // 16m total canvas width representation
    const scaleY = 2048 / 30.0; // 30m total canvas length representation
    const toCanvasX = (x) => 512 + x * scaleX;
    const toCanvasY = (z) => 1024 + z * scaleY;

    // Inner Court Rectangle (DecoTurf Electric Blue)
    const doublesW = 5.485; // half width (10.97m total)
    const courtHalfL = 11.885; // half length (23.77m total)

    const xL = toCanvasX(-doublesW);
    const xR = toCanvasX(doublesW);
    const yT = toCanvasY(-courtHalfL);
    const yB = toCanvasY(courtHalfL);

    ctx.fillStyle = '#1a56db'; // Grand Slam Electric Blue
    ctx.fillRect(xL, yT, xR - xL, yB - yT);

    // Fine court surface grain
    for (let i = 0; i < 90000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)';
      ctx.fillRect(Math.random() * 1024, Math.random() * 2048, 2, 2);
    }

    // Grand Slam Tournament Center Crest (Subtle watermark)
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(512, 1024, 160, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.font = '900 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GRAND SLAM TOUR', 512, 1038);

    // Regulation White Chalk Lines
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

  // 4. Pro Tennis Athlete Athletic Jersey Texture
  createJerseyTexture(baseColorHex, accentColorHex, numberStr, isAI) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base Jersey Color
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, 512, 512);

    // Technical Aero Fabric Mesh
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < 512; y += 8) {
      for (let x = 0; x < 512; x += 8) {
        const ox = (y % 16 === 0) ? 4 : 0;
        ctx.fillRect(x + ox, y, 2, 2);
      }
    }

    // Dynamic Flank Racing Stripes
    ctx.fillStyle = accentColorHex;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(65, 0); ctx.lineTo(100, 512); ctx.lineTo(0, 512);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(512, 0); ctx.lineTo(512 - 65, 0); ctx.lineTo(512 - 100, 512); ctx.lineTo(512, 512);
    ctx.fill();

    // Tournament Crest
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GRAND SLAM', 256, 110);

    ctx.fillStyle = accentColorHex;
    ctx.fillRect(196, 122, 120, 5);

    // Player Number
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 120px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(numberStr, 256, 320);

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
  createBeachSandTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // Warm Tropical Sand Base
    ctx.fillStyle = '#d9a766';
    ctx.fillRect(0, 0, 1024, 2048);

    // Fine Sand Granule Noise
    for (let i = 0; i < 110000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,245,210,0.18)' : 'rgba(140,85,30,0.14)';
      ctx.fillRect(Math.random() * 1024, Math.random() * 2048, 2, 2);
    }

    // Dune Wind Ripples
    ctx.strokeStyle = 'rgba(215, 155, 85, 0.25)';
    ctx.lineWidth = 12;
    for (let y = 40; y < 2048; y += 48) {
      ctx.beginPath();
      for (let x = 0; x <= 1024; x += 32) {
        const dy = Math.sin((x / 1024) * Math.PI * 4 + y * 0.1) * 6;
        if (x === 0) ctx.moveTo(x, y + dy); else ctx.lineTo(x, y + dy);
      }
      ctx.stroke();
    }

    // Coordinate Mapping
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

    // Weathered Wooden Boundary Border Planks
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(xL - 14, yT - 14, (xR - xL) + 28, 14);
    ctx.fillRect(xL - 14, yB, (xR - xL) + 28, 14);
    ctx.fillRect(xL - 14, yT, 14, yB - yT);
    ctx.fillRect(xR, yT, 14, yB - yT);

    // Center Tropical Resort Compass Star Watermark
    ctx.strokeStyle = 'rgba(255, 235, 180, 0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(512, 1024, 150, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 235, 180, 0.45)';
    ctx.font = '900 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PLAYA PARAÍSO • RESORT', 512, 1038);

    // Braided Marine White Rope Lines
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
    ctx.fillStyle = '#161922';
    ctx.fillRect(0, 0, 1024, 2048);

    // Slate Flagstone Tiles
    const tileSize = 64;
    for (let y = 0; y < 2048; y += tileSize) {
      for (let x = 0; x < 1024; x += tileSize) {
        const shade = Math.floor(24 + (Math.sin(x * 0.05) + Math.cos(y * 0.05)) * 6);
        ctx.fillStyle = `rgb(${shade}, ${shade + 3}, ${shade + 8})`;
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
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

    // Inner Court: Polished Black Imperial Slate
    ctx.fillStyle = '#1e2430';
    ctx.fillRect(xL, yT, xR - xL, yB - yT);

    // Woven Green Tatami Rush Mat Borders along tramlines
    const singlesW = 4.115;
    const sL = toCanvasX(-singlesW);
    const sR = toCanvasX(singlesW);

    ctx.fillStyle = '#2d4a22';
    ctx.fillRect(xL, yT, sL - xL, yB - yT);
    ctx.fillRect(sR, yT, xR - sR, yB - yT);

    // Center Golden Sakura Flower Crest
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(512, 1024, 150, 0, Math.PI * 2);
    ctx.stroke();

    // 5 Sakura Petals
    ctx.fillStyle = 'rgba(255, 182, 193, 0.45)';
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
  }
};

// --- Particle FX Engine ---
class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.sakuraParticles = [];
    this.ballTrail = [];
    this.geo = new THREE.SphereGeometry(0.045, 6, 6);
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

  spawnBallTrail(pos, colorHex = 0x00f0ff) {
    const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.85 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), mat);
    mesh.position.copy(pos);
    this.scene.add(mesh);
    this.ballTrail.push({ mesh, life: 0.22, maxLife: 0.22 });
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
      hitGroundInCourt: false
    };

    // Humanoid Athletes
    this.player = {
      pos: new THREE.Vector3(1.8, 0, 12.2),
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

    // Performance Scratch Vectors (Zero Garbage Collection)
    this._v1 = new THREE.Vector3();
    this._v2 = new THREE.Vector3();
    this._camTarget = new THREE.Vector3();
    this._rHead = new THREE.Vector3();
    this._minimapTick = 0;
    this._pendingSound = null;
    this._pendingAnn = null;
    this.currentMap = 'stadium';
    this.oceanMesh = null;
    this.tikiTorches = [];

    this.initThree();
    this.particles = new ParticleSystem(this.scene);
    this.buildCourt(this.currentMap);
    this.buildEnvironment(this.currentMap);

    this.player.model = this.createProAthlete(0x00f0ff, 0xffffff, '#00f0ff', '7', false);
    this.ai.model = this.createProAthlete(0xff2a55, 0x111827, '#ff2a55', '1', true);
    this.scene.add(this.player.model);
    this.scene.add(this.ai.model);

    this.buildBall();
    this.initInputs();
    this.initUI();
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

    // Groups for Court and Environment
    this.courtGroup = new THREE.Group();
    this.environmentGroup = new THREE.Group();
    this.scene.add(this.courtGroup);
    this.scene.add(this.environmentGroup);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // --- Dynamic Map / Arena Environment Switcher ---
  setMap(mapId, broadcast = true) {
    if (!['stadium', 'beach', 'zen'].includes(mapId)) return;
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
      zen: { name: 'TEMPLO ZEN', icon: '⛩️' }
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

    this.showAnnouncement(`PISTA: ${info.name}`, 'Nuevo escenario cargado');

    if (broadcast && this.gameMode === 'online_host' && this.conn && this.conn.open) {
      this.conn.send({ type: 'map_change', map: mapId });
    }
  }

  cycleMap() {
    const maps = ['stadium', 'beach', 'zen'];
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
    let outerColor;
    let postMat;

    if (mapId === 'beach') {
      courtTex = TextureFactory.createBeachSandTexture();
      outerColor = 0xc89858;
      postMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6, metalness: 0.1 });
    } else if (mapId === 'zen') {
      courtTex = TextureFactory.createZenStoneTexture();
      outerColor = 0x0f131a;
      postMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.35, metalness: 0.3 });
    } else {
      courtTex = TextureFactory.createTurfTexture();
      outerColor = 0x050c18;
      postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.92, roughness: 0.2 });
    }

    // 1. In-Court Ground Plane
    const courtGeo = new THREE.PlaneGeometry(16.0, 30.0);
    const courtMat = new THREE.MeshStandardMaterial({
      map: courtTex,
      roughness: mapId === 'beach' ? 0.92 : (mapId === 'zen' ? 0.62 : 0.76),
      metalness: mapId === 'zen' ? 0.12 : 0.05
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
    this.tikiTorches = [];
    this.oceanMesh = null;

    if (mapId === 'beach') {
      this.buildBeachEnvironment();
    } else if (mapId === 'zen') {
      this.buildZenEnvironment();
    } else {
      this.buildStadiumEnvironment();
    }
  }

  // 1. Grand Slam Arena Environment (Arthur Ashe / Roland Garros / Wimbledon Pro Night)
  buildStadiumEnvironment() {
    this.scene.background = new THREE.Color(0x081326);
    this.scene.fog = new THREE.FogExp2(0x081326, 0.010);
    this.ambient.color.setHex(0xdbeafe);
    this.ambient.intensity = 0.65;
    this.sun.color.setHex(0xfff8ee);
    this.sun.intensity = 1.35;
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
    jctx.fillStyle = '#00f0ff'; jctx.font = 'bold 34px sans-serif';
    jctx.fillText('GRAND SLAM PRO TOUR', 30, 60);
    jctx.fillStyle = '#f59e0b'; jctx.font = 'bold 50px sans-serif';
    jctx.fillText('LIVE MATCH • 4K', 30, 130);
    jctx.fillStyle = '#94a3b8'; jctx.font = '26px sans-serif';
    jctx.fillText('CENTRE COURT • ROLEX TIME', 30, 195);
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

    // LED Ribbon Banners
    const ledCanvas = document.createElement('canvas');
    ledCanvas.width = 1024; ledCanvas.height = 128;
    const lctx = ledCanvas.getContext('2d');
    lctx.fillStyle = '#06101e';
    lctx.fillRect(0, 0, 1024, 128);
    lctx.fillStyle = '#00f0ff';
    lctx.font = '900 38px sans-serif';
    lctx.fillText('GRAND SLAM TOUR • ROLEX • EMIRATES • WILSON • HEAD', 15, 78);
    const ledTex = new THREE.CanvasTexture(ledCanvas);
    ledTex.wrapS = THREE.RepeatWrapping;
    ledTex.repeat.set(3, 1);
    const ledMat = new THREE.MeshBasicMaterial({ map: ledTex });
    const ledGeo = new THREE.PlaneGeometry(34, 1.0);

    const ledLeft = new THREE.Mesh(ledGeo, ledMat);
    ledLeft.position.set(-9.2, 0.50, 0);
    ledLeft.rotation.y = Math.PI / 2;
    const ledRight = new THREE.Mesh(ledGeo, ledMat);
    ledRight.position.set(9.2, 0.50, 0);
    ledRight.rotation.y = -Math.PI / 2;
    this.environmentGroup.add(ledLeft, ledRight);

    // 4 Corner Floodlight Towers with Volumetric Cones
    const lightTowers = [
      { x: -13.0, z: -18.0 }, { x: 13.0, z: -18.0 },
      { x: -13.0, z: 18.0 }, { x: 13.0, z: 18.0 }
    ];
    lightTowers.forEach(t => {
      const spot = new THREE.SpotLight(0xffffff, 0.95, 55, Math.PI / 3.2, 0.45);
      spot.position.set(t.x, 15, t.z);
      spot.target.position.set(0, 0, (t.z > 0 ? 4 : -4));
      this.environmentGroup.add(spot, spot.target);

      const truss = new THREE.Mesh(new THREE.BoxGeometry(0.35, 15, 0.35), uMat);
      truss.position.set(t.x, 7.5, t.z);
      const bank = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 0.9), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      bank.position.set(t.x, 15.2, t.z);

      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(4.2, 17, 16, 1, true),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.04, side: THREE.DoubleSide, depthWrite: false })
      );
      cone.position.set(t.x * 0.7, 7.5, t.z * 0.7);
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(-t.x, -15, -t.z).normalize());

      this.environmentGroup.add(truss, bank, cone);
    });

    // Spaceframe Roof Trusses
    for (let z = -15; z <= 15; z += 7.5) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(32, 0.38, 0.38), uMat);
      beam.position.set(0, 16, z);
      this.environmentGroup.add(beam);
    }
  }

  // 2. Playa Paraíso (Tropical Beach Resort Sunset Setting)
  buildBeachEnvironment() {
    this.scene.background = new THREE.Color(0x381822);
    this.scene.fog = new THREE.FogExp2(0x381822, 0.008);
    this.ambient.color.setHex(0xffe0b0);
    this.ambient.intensity = 0.75;
    this.sun.color.setHex(0xff9944);
    this.sun.intensity = 1.45;
    this.sun.position.set(24, 18, -32);

    // 360° Tropical Beach Sunset Sky Dome
    const beachSkyTex = TextureFactory.createBeachSkyTexture();
    const beachSkyGeo = new THREE.SphereGeometry(85, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2);
    beachSkyGeo.scale(-1, 1, 1);
    const beachSkyMat = new THREE.MeshBasicMaterial({ map: beachSkyTex, side: THREE.BackSide });
    const beachSky = new THREE.Mesh(beachSkyGeo, beachSkyMat);
    beachSky.position.set(0, -2, 0);
    this.environmentGroup.add(beachSky);

    // Surrounding Golden Sand Dunes Terrain
    const sandGeo = new THREE.PlaneGeometry(120, 120);
    const sandTex = TextureFactory.createBeachSandTexture();
    const sandMat = new THREE.MeshStandardMaterial({
      map: sandTex,
      roughness: 0.85,
      metalness: 0.05
    });
    const sandDune = new THREE.Mesh(sandGeo, sandMat);
    sandDune.rotation.x = -Math.PI / 2;
    sandDune.position.y = -0.04;
    sandDune.receiveShadow = true;
    this.environmentGroup.add(sandDune);

    // Expansive Turquoise Ocean Plane with Animated Waves
    const oceanGeo = new THREE.PlaneGeometry(160, 110, 54, 54);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x008b8b,
      roughness: 0.18,
      metalness: 0.65,
      transparent: true,
      opacity: 0.88
    });
    this.oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    this.oceanMesh.position.set(0, -0.42, -45);
    this.oceanMesh.rotation.x = -Math.PI / 2;
    this.environmentGroup.add(this.oceanMesh);

    // Distant Volcanic Tropical Island Hills
    const islandMat = new THREE.MeshStandardMaterial({ color: 0x1c2b20, roughness: 0.9 });
    [-45, 0, 45].forEach(xOff => {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(24, 18, 12), islandMat);
      hill.position.set(xOff, 5, -85);
      hill.scale.set(1.5, 0.6, 1.0);
      this.environmentGroup.add(hill);
    });

    // Procedural Curved Palm Trees around Court Perimeter
    const palmPositions = [
      { x: -14, z: -14 }, { x: 14, z: -14 },
      { x: -16, z: 0 },   { x: 16, z: 0 },
      { x: -14, z: 14 },  { x: 14, z: 14 },
      { x: -11, z: 22 },  { x: 11, z: 22 }
    ];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.45, side: THREE.DoubleSide });
    const cocoMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.8 });

    palmPositions.forEach((pos, idx) => {
      const palmGroup = new THREE.Group();
      palmGroup.position.set(pos.x, 0, pos.z);

      // Curved Trunk
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 3, 0),
        new THREE.Vector3((idx % 2 === 0 ? 1 : -1) * 1.5, 6, 0.8),
        new THREE.Vector3((idx % 2 === 0 ? 2 : -2) * 1.8, 8.5, 1.2)
      );
      const trunkGeo = new THREE.TubeGeometry(curve, 16, 0.28, 8, false);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.castShadow = true;
      palmGroup.add(trunk);

      // Palm Crown with Radiating Fronds
      const crownPos = curve.getPoint(1);
      const crown = new THREE.Group();
      crown.position.copy(crownPos);

      // Coconuts cluster
      for (let c = 0; c < 4; c++) {
        const coconut = new THREE.Mesh(new THREE.SphereGeometry(0.20, 8, 8), cocoMat);
        coconut.position.set(Math.cos(c * 1.5) * 0.3, -0.2, Math.sin(c * 1.5) * 0.3);
        crown.add(coconut);
      }

      // 8 Fronds
      for (let f = 0; f < 8; f++) {
        const frondAngle = (f * Math.PI * 2) / 8;
        const frond = new THREE.Mesh(new THREE.ConeGeometry(0.7, 3.8, 6), leafMat);
        frond.position.set(Math.cos(frondAngle) * 1.8, -0.6, Math.sin(frondAngle) * 1.8);
        frond.rotation.x = Math.sin(frondAngle) * 0.85 + 0.3;
        frond.rotation.z = -Math.cos(frondAngle) * 0.85;
        crown.add(frond);
      }

      palmGroup.add(crown);
      this.environmentGroup.add(palmGroup);
    });

    // 4 Bamboo Tiki Torches with Warm Flickering Point Lights
    const torchPositions = [
      { x: -8.5, z: -14.5 }, { x: 8.5, z: -14.5 },
      { x: -8.5, z: 14.5 },  { x: 8.5, z: 14.5 }
    ];
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0x855328, roughness: 0.7 });
    const fireMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

    torchPositions.forEach((tPos, tIdx) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 2.2, 8), bambooMat);
      pole.position.set(tPos.x, 1.1, tPos.z);

      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.25, 8), bambooMat);
      cup.position.set(tPos.x, 2.15, tPos.z);

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 8), fireMat);
      flame.position.set(tPos.x, 2.38, tPos.z);

      const light = new THREE.PointLight(0xff6600, 1.8, 14);
      light.position.set(tPos.x, 2.45, tPos.z);

      this.tikiTorches.push({ light, flame, baseIntensity: 1.8, seed: tIdx * 2.5 });
      this.environmentGroup.add(pole, cup, flame, light);
    });

    // Beach Striped Umbrellas and Wooden Teak Benches
    const umbMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
    const teakMat = new THREE.MeshStandardMaterial({ color: 0x543310, roughness: 0.65 });

    [-1, 1].forEach(side => {
      const umbPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.8, 8), bambooMat);
      umbPole.position.set(side * 8.2, 1.4, 0);
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.55, 16), umbMat);
      canopy.position.set(side * 8.2, 2.7, 0);

      const bench = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 0.7), teakMat);
      bench.position.set(side * 8.2, 0.25, -2.2);

      this.environmentGroup.add(umbPole, canopy, bench);
    });
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
  createProAthlete(jerseyColor, shortsColor, accentHex, jerseyNumber, isAI = false) {
    const root = new THREE.Group();

    // 1. Athletic Muscular Torso & Technical Polo with Collar & Buttons
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.98;

    const jColorStr = isAI ? '#ff2a55' : '#00f0ff';
    const jAccentStr = isAI ? '#ffdd00' : '#ffffff';
    const jerseyTex = TextureFactory.createJerseyTexture(jColorStr, jAccentStr, jerseyNumber, isAI);

    const jerseyMat = new THREE.MeshStandardMaterial({
      map: jerseyTex,
      roughness: 0.38,
      metalness: 0.12
    });

    // Sculpted Athletic Chest (V-Taper)
    const chestGeo = new THREE.CylinderGeometry(0.25, 0.20, 0.38, 24);
    const chest = new THREE.Mesh(chestGeo, jerseyMat);
    chest.position.y = 0.12;
    chest.castShadow = true;
    torsoGroup.add(chest);

    // Polo Collar & Front Button Placket
    const collarMat = new THREE.MeshStandardMaterial({ color: isAI ? 0xffdd00 : 0xffffff, roughness: 0.45 });
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

    // Technical Athletic Shorts with Ventilation Mesh Texture
    const shortsTex = TextureFactory.createAthleteShortsTexture(shortsColor, accentHex);
    const waistGeo = new THREE.CylinderGeometry(0.20, 0.175, 0.28, 24);
    const waistMat = new THREE.MeshStandardMaterial({
      map: shortsTex,
      roughness: 0.58,
      metalness: 0.08
    });
    const waist = new THREE.Mesh(waistGeo, waistMat);
    waist.position.y = -0.16;
    waist.castShadow = true;
    torsoGroup.add(waist);

    // Warm Athletic Subsurface Skin with Micro-Pore & Tone Texture
    const skinTex = TextureFactory.createAthleteSkinTexture(isAI);
    const skinMat = new THREE.MeshStandardMaterial({
      map: skinTex,
      roughness: 0.46,
      metalness: 0.04
    });
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.090, 0.14, 16), skinMat);
    neck.position.y = 0.36;
    torsoGroup.add(neck);

    root.add(torsoGroup);

    // 2. Sculpted Athletic Head with High-Res Face Texture, Ears & Styled Hair
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.48;

    const faceTex = TextureFactory.createAthleteFaceTexture(isAI);
    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      roughness: 0.42,
      metalness: 0.04
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.142, 32, 32), faceMat);
    head.castShadow = true;

    // Sculpted Nose
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.06, 8), skinMat);
    nose.position.set(0, -0.015, 0.144);
    nose.rotation.x = Math.PI / 2;

    // Anatomical Ears
    const earGeo = new THREE.TorusGeometry(0.028, 0.009, 8, 16, Math.PI);
    const lEar = new THREE.Mesh(earGeo, skinMat);
    lEar.position.set(-0.142, 0.01, 0.01); lEar.rotation.y = -Math.PI / 2;
    const rEar = new THREE.Mesh(earGeo, skinMat);
    rEar.position.set(0.142, 0.01, 0.01); rEar.rotation.y = Math.PI / 2;

    // Stylized Athletic Hair under Visor
    const hairMat = new THREE.MeshStandardMaterial({ color: isAI ? 0x1a120b : 0x241710, roughness: 0.7 });
    const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.145, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.7), hairMat);
    hairBack.position.set(0, 0.02, -0.015);

    // Pro Visor / Backward Cap with Sweatband
    const capMat = new THREE.MeshStandardMaterial({
      color: isAI ? 0x0f172a : 0xffffff,
      roughness: 0.40,
      metalness: 0.15
    });
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.147, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
    cap.position.y = 0.028;

    const sweatBandMat = new THREE.MeshStandardMaterial({ color: isAI ? 0xff2a55 : 0x0284c7, roughness: 0.8 });
    const sweatband = new THREE.Mesh(new THREE.TorusGeometry(0.143, 0.016, 8, 24), sweatBandMat);
    sweatband.rotation.x = Math.PI / 2;
    sweatband.position.y = 0.022;

    const brim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.165, 0.165, 0.018, 20, 1, false, -Math.PI / 3, (2 * Math.PI) / 3),
      capMat
    );
    brim.position.set(0, 0.048, 0.10);
    brim.rotation.x = 0.18;

    // Polarized Sport Sunglasses with Mirror Clearcoat
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

    headGroup.add(head, nose, lEar, rEar, hairBack, cap, sweatband, brim, glasses);
    root.add(headGroup);

    // 3. Articulated Muscular Legs & Pro Tennis Sneakers
    const legGeo = new THREE.CylinderGeometry(0.092, 0.070, 0.40, 16);
    const calfGeo = new THREE.CylinderGeometry(0.070, 0.054, 0.38, 16);

    const createLeg = (isRight) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(isRight ? 0.12 : -0.12, 0.78, 0);

      const thigh = new THREE.Mesh(legGeo, skinMat);
      thigh.position.y = -0.20;
      thigh.castShadow = true;
      legGroup.add(thigh);

      const kneeGroup = new THREE.Group();
      kneeGroup.position.y = -0.40;

      const calf = new THREE.Mesh(calfGeo, skinMat);
      calf.position.y = -0.19;
      calf.castShadow = true;
      kneeGroup.add(calf);

      // Crew Athletic Tennis Socks with Dual Retro Stripes
      const sockMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
      const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.056, 0.14, 16), sockMat);
      sock.position.y = -0.31;

      const stripeMat = new THREE.MeshStandardMaterial({ color: isAI ? 0xdc2626 : 0x0284c7 });
      const sRing = new THREE.Mesh(new THREE.TorusGeometry(0.059, 0.005, 6, 16), stripeMat);
      sRing.rotation.x = Math.PI / 2;
      sRing.position.y = -0.26;
      kneeGroup.add(sock, sRing);

      // Modern Pro Tennis Sneaker (Asics/Nike style with EVA midsole and laces)
      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(0, -0.38, 0.05);

      const shoeUpperMat = new THREE.MeshStandardMaterial({
        color: isRight ? 0xffffff : (isAI ? 0x111827 : 0x0f172a),
        roughness: 0.4,
        metalness: 0.1
      });
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.26), shoeUpperMat);
      upper.castShadow = true;

      // Molded EVA Midsole
      const soleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.03, 0.27), soleMat);
      sole.position.y = -0.045;

      // Colored Laces
      const laceMat = new THREE.MeshStandardMaterial({ color: isAI ? 0xff2a55 : 0x00f0ff });
      const lace = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.12), laceMat);
      lace.position.set(0, 0.04, 0.02);

      shoeGroup.add(upper, sole, lace);
      kneeGroup.add(shoeGroup);

      legGroup.add(kneeGroup);
      return { legGroup, kneeGroup };
    };

    const leftLegData = createLeg(false);
    const rightLegData = createLeg(true);
    root.add(leftLegData.legGroup, rightLegData.legGroup);

    // 4. Sculpted Arms, Deltoid Caps, Compression Sleeve & Sweatbands
    const armGeo = new THREE.CylinderGeometry(0.068, 0.054, 0.32, 16);
    const forearmGeo = new THREE.CylinderGeometry(0.054, 0.044, 0.30, 16);

    // Left Arm (With Smart Fitness Band)
    const lArmGroup = new THREE.Group();
    lArmGroup.position.set(-0.28, 1.25, 0);

    const lDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), skinMat);
    lDeltoid.position.y = 0.01;
    const lUpper = new THREE.Mesh(armGeo, skinMat);
    lUpper.position.y = -0.16;
    lArmGroup.add(lDeltoid, lUpper);

    const lFore = new THREE.Mesh(forearmGeo, skinMat);
    lFore.position.y = -0.45;
    lArmGroup.add(lFore);

    // Smart Fitness Watch on Left Wrist
    const watchBand = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.035, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 }));
    watchBand.position.y = -0.56;
    const watchScreen = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.01, 0.038),
      new THREE.MeshBasicMaterial({ color: 0x00ffaa }));
    watchScreen.position.set(0, -0.56, 0.05);
    lArmGroup.add(watchBand, watchScreen);
    root.add(lArmGroup);

    // Left Hand
    const lHandGroup = new THREE.Group();
    lHandGroup.position.y = -0.61;
    const lPalm = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.052, 0.024), skinMat);
    lHandGroup.add(lPalm);
    lArmGroup.add(lHandGroup);

    // Right Arm (Dominant Playing Arm with Compression Sleeve & Wrist Sweatband)
    const rArmGroup = new THREE.Group();
    rArmGroup.position.set(0.28, 1.25, 0);

    const rDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), skinMat);
    rDeltoid.position.y = 0.01;

    // Compression Sleeve
    const sleeveMat = new THREE.MeshStandardMaterial({
      color: isAI ? 0xdc2626 : 0x0284c7,
      roughness: 0.45
    });
    const rUpper = new THREE.Mesh(armGeo, sleeveMat);
    rUpper.position.y = -0.16;
    rArmGroup.add(rDeltoid, rUpper);

    const rFore = new THREE.Mesh(forearmGeo, skinMat);
    rFore.position.y = -0.45;
    rArmGroup.add(rFore);

    // Dominant Wrist Sweatband
    const rSweatband = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.06, 16),
      new THREE.MeshStandardMaterial({ color: isAI ? 0xffdd00 : 0xffffff, roughness: 0.8 }));
    rSweatband.position.y = -0.56;
    rArmGroup.add(rSweatband);

    // Articulated Hand Firmly Gripping Racket Handle
    const rHandGroup = new THREE.Group();
    rHandGroup.position.y = -0.61;

    const rPalm = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.054, 0.026), skinMat);
    rHandGroup.add(rPalm);

    // 4 Curled Wrapped Fingers
    for (let f = 0; f < 4; f++) {
      const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.046, 8), skinMat);
      finger.rotation.z = Math.PI / 2;
      finger.position.set(0, -0.018 + f * 0.012, 0.020);
      rHandGroup.add(finger);
    }
    // Opposing Angled Thumb Locking Grip
    const rThumb = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.010, 0.038, 8), skinMat);
    rThumb.position.set(-0.022, 0.008, 0.014);
    rThumb.rotation.set(-0.4, 0, 0.35);
    rHandGroup.add(rThumb);

    rArmGroup.add(rHandGroup);

    // 5. Authentic Carbon-Fiber Aerodynamic Strung Tennis Racket
    const racketGroup = new THREE.Group();
    racketGroup.position.set(0, -0.61, 0.16);

    // Perforated Overgrip Handle with Babolat/Wilson Finishing Collar Tape
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

    rArmGroup.add(racketGroup);
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
    window.addEventListener('keydown', (e) => {
      // Don't intercept game shortcuts or record keys if typing in input field
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      this.keys[e.key.toLowerCase()] = true;
      this.audio.init();

      if (!this.isPlaying && (e.code === 'Space' || e.code === 'Enter')) {
        document.getElementById('start-screen').classList.add('fade-out');
        this.isPlaying = true;
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

      if (e.key.toLowerCase() === 'm') {
        this.cycleMap();
      }

      if (e.code === 'Space') {
        this.handleActionPress();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      if (e.code === 'Space') {
        this.handleActionRelease();
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (e.target.closest('.overlay-modal') || e.target.closest('.cam-btn')) return;
      this.handleActionPress();
    });

    window.addEventListener('mouseup', () => {
      this.handleActionRelease();
    });
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

  initUI() {
    document.getElementById('btn-play').addEventListener('click', () => {
      this.audio.init();
      document.getElementById('start-screen').classList.add('fade-out');
      this.isPlaying = true;
    });

    document.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setCameraMode(e.currentTarget.dataset.cam);
      });
    });

    // Map Selector Cards in Start Screen
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
  }

  // --- Multiplayer Engine (P2P WebRTC & Local 2-Player) ---
  initMultiplayer() {
    const tabAI = document.getElementById('tab-mode-ai');
    const tabOnline = document.getElementById('tab-mode-online');
    const tabLocal = document.getElementById('tab-mode-local');
    const panelAI = document.getElementById('mode-panel-ai');
    const panelOnline = document.getElementById('mode-panel-online');
    const panelLocal = document.getElementById('mode-panel-local');

    const setModeTab = (mode) => {
      if (tabAI) [tabAI, tabOnline, tabLocal].forEach(t => t.classList.remove('active'));
      if (panelAI) [panelAI, panelOnline, panelLocal].forEach(p => p.classList.add('hidden'));

      if (mode === 'ai') {
        this.gameMode = 'ai';
        if (tabAI) tabAI.classList.add('active');
        if (panelAI) panelAI.classList.remove('hidden');
      } else if (mode === 'online') {
        this.gameMode = 'online_host';
        if (tabOnline) tabOnline.classList.add('active');
        if (panelOnline) panelOnline.classList.remove('hidden');
        this.setupOnlineHost();
      } else if (mode === 'local') {
        this.gameMode = 'local';
        if (tabLocal) tabLocal.classList.add('active');
        if (panelLocal) panelLocal.classList.remove('hidden');
      }
    };

    if (tabAI) tabAI.addEventListener('click', () => setModeTab('ai'));
    if (tabOnline) tabOnline.addEventListener('click', () => setModeTab('online'));
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
      if (tabAI) [tabAI, tabOnline, tabLocal].forEach(t => t.classList.remove('active'));
      if (panelAI) [panelAI, panelOnline, panelLocal].forEach(p => p.classList.add('hidden'));
      if (tabOnline) tabOnline.classList.add('active');
      if (panelOnline) panelOnline.classList.remove('hidden');
      if (joinInput) joinInput.value = roomParam.toUpperCase();
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
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      }
    };
  }

  setupOnlineHost() {
    if (this.peer || typeof Peer === 'undefined') return;
    this.roomCode = `TENNIS-${Math.floor(1000 + Math.random() * 9000)}`;
    const display = document.getElementById('room-code-display');
    if (display) display.innerText = this.roomCode;

    try {
      this.peer = new Peer(this.roomCode, this.getPeerConfig());

      this.peer.on('open', () => {
        const status = document.getElementById('host-status');
        if (status) status.innerText = '🟢 Sala abierta. Esperando que tu rival se una...';
      });

      this.peer.on('connection', (conn) => {
        this.conn = conn;
        this.gameMode = 'online_host';
        const status = document.getElementById('host-status');
        if (status) status.innerText = '¡Rival conectado! Entrando a la pista central...';

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
      });
    } catch (e) {
      console.warn('PeerJS init failed:', e);
    }
  }

  connectToPeer(code) {
    if (typeof Peer === 'undefined') return;
    const joinStatus = document.getElementById('join-status');
    if (joinStatus) joinStatus.innerText = 'Conectando con la pista central...';

    try {
      if (this.peer) this.peer.destroy();
      this.peer = new Peer(this.getPeerConfig());

      this.peer.on('open', () => {
        this.conn = this.peer.connect(code, { reliable: true });

        this.conn.on('open', () => {
          this.gameMode = 'online_guest';
          if (joinStatus) joinStatus.innerText = '¡Conexión establecida!';
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

        this.conn.on('error', () => {
          if (joinStatus) joinStatus.innerText = 'Error al conectar con la sala de tenis.';
        });
      });
    } catch (e) {
      if (joinStatus) joinStatus.innerText = 'Error al inicializar Peer.';
    }
  }

  setupDataConnection() {
    if (!this.conn) return;

    this.conn.on('data', (data) => {
      if (data.type === 'sync' && this.gameMode === 'online_guest') {
        // Guest receives authoritative state from host
        this.ball.pos.set(data.b.x, data.b.y, data.b.z);
        this.ball.vel.set(data.b.vx, data.b.vy, data.b.vz);
        this.player.pos.set(data.p1.x, 0, data.p1.z);
        if (data.p1.sw && !this.player.isSwinging) {
          this.startSwingAnimation(this.player, data.p1.st || 'forehand');
        }
        this.player.runCycle = data.p1.rc;

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
        // Host receives Guest controls
        this.ai.pos.set(data.x, 0, data.z);
        this.ai.runCycle = data.rc;
        if (data.sw && !this.ai.isSwinging) {
          this.startSwingAnimation(this.ai, data.st || 'forehand');
        }
        if (data.shot) {
          this.ai.limbs.racket.getWorldPosition(this._rHead);
          const distToRacket = this._rHead.distanceTo(this.ball.pos);
          const distToBody = this.ai.pos.distanceTo(this.ball.pos);

          if ((distToRacket <= 1.85 || distToBody <= 2.4) && this.ball.pos.z < 0.2 && this.ball.lastHitter !== 'ai') {
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
        this.ai.limbs.racket.getWorldPosition(this._rHead);
        const distToP2Racket = this._rHead.distanceTo(this.ball.pos);
        const distToP2Body = this.ai.pos.distanceTo(this.ball.pos);

        if ((distToP2Racket <= 1.45 || distToP2Body <= 1.95) && this.ball.pos.z < -0.25 && this.ball.lastHitter !== 'ai' && this.ball.pos.y >= 0.10) {
          const swingType = (this.ball.pos.x < this.ai.pos.x) ? 'forehand' : 'backhand';
          this.startSwingAnimation(this.ai, swingType);
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
    if (this.netTimer >= 0.033 && this.conn && this.conn.open) {
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
    if (this.netTimer >= 0.033 && this.conn && this.conn.open) {
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
        promptEl.innerHTML = `<span>${serveLabel}: Presiona <strong>[ESPACIO]</strong> o <strong>[CLIC]</strong></span>`;
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
          promptEl.innerHTML = `<span>Tu Saque (${serveLabel}): Presiona <strong>[ESPACIO / CLIC]</strong></span>`;
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
    if (this.keys['a'] || this.keys['arrowleft']) {
      targetX = -this.servingSide * 3.15; // Aim wide towards sideline
    } else if (this.keys['d'] || this.keys['arrowright']) {
      targetX = -this.servingSide * 1.05; // Aim down the 'T' center line
    }

    // Landing depth safely centered in service box (Z = -3.9m to -4.2m)
    const targetZ = -4.1;
    const flightTime = 0.64; // Professional 185 km/h serve speed

    // Overhead contact point (apex of serve toss)
    this.ball.pos.y = 2.45;
    this.ball.pos.x = this.player.pos.x + 0.22;
    this.ball.pos.z = 11.4;

    const vx = (targetX - this.ball.pos.x) / flightTime;
    const vz = (targetZ - this.ball.pos.z) / flightTime;

    // Guaranteed Net Clearance (Net is 0.914m; we enforce y_net >= 1.35m)
    const timeToNet = (0 - this.ball.pos.z) / vz;
    const vy = (1.35 - this.ball.pos.y + 0.5 * 9.8 * timeToNet * timeToNet) / timeToNet;

    this.ball.vel.set(vx, vy, vz);
    this.ball.spin.set(16.0, 0, 0); // Heavy forward topspin kick pulling ball down

    this.audio.playHit(1.0, true, true);
    if (this.gameMode === 'online_host') this._pendingSound = 'hit';
    this.startSwingAnimation(this.player, 'serve');
    this.particles.burst(this.ball.pos, 28, 0x00f0ff, 4.5);

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

    const targetZ = 4.1;
    const flightTime = 0.68;

    this.ball.pos.y = 2.45;
    this.ball.pos.x = this.ai.pos.x - 0.22;
    this.ball.pos.z = -11.4;

    const vx = (targetX - this.ball.pos.x) / flightTime;
    const vz = (targetZ - this.ball.pos.z) / flightTime;

    const timeToNet = (0 - this.ball.pos.z) / vz;
    const vy = (1.35 - this.ball.pos.y + 0.5 * 9.8 * timeToNet * timeToNet) / timeToNet;

    this.ball.vel.set(vx, vy, vz);
    this.ball.spin.set(-16.0, 0, 0);

    this.audio.playHit(1.0, true, true);
    if (this.gameMode === 'online_host') this._pendingSound = 'hit';
    this.startSwingAnimation(this.ai, 'serve');
    this.particles.burst(this.ball.pos, 28, 0xff2a55, 4.5);
  }

  // --- Hitbox & Shot Execution ---
  triggerPlayerShot() {
    this.isChargingPower = false;
    const power = Math.max(0.45, this.power);
    this.power = 0.55;
    document.getElementById('power-bar').style.width = '0%';

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
      if (this.keys['a'] || this.keys['arrowleft']) targetX = -3.1;
      else if (this.keys['d'] || this.keys['arrowright']) targetX = 3.1;
      else if (timingOffset < -0.3) targetX *= -1.2;
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
      this.annTimeout = setTimeout(() => el.classList.add('hidden'), 2000);
    }
    if (this.gameMode === 'online_host') {
      this._pendingAnn = { title, sub };
    }
  }

  // --- Official Tennis Physics Loop (No Walls, Strictly Singles Court Out Rules) ---
  updatePhysics(dt) {
    if (!this.pointActive) return;

    this.ball.prevPos.copy(this.ball.pos);

    // Gravity & Air Drag
    const GRAVITY = -9.8;
    this.ball.vel.y += GRAVITY * dt;
    this.ball.vel.x *= (1 - 0.02 * dt);
    this.ball.vel.z *= (1 - 0.02 * dt);

    this.ball.pos.addScaledVector(this.ball.vel, dt);

    // Ball 3D Spin
    this.ball.mesh.rotation.x += this.ball.spin.x * dt;
    this.ball.mesh.rotation.y += this.ball.spin.y * dt;
    this.ball.mesh.rotation.z += this.ball.spin.z * dt;

    const speedKmH = Math.round(this.ball.vel.length() * 3.6);
    document.getElementById('ball-speed').innerHTML = `${speedKmH} <small>km/h</small>`;

    // Fast Shot Motion Trail
    if (this.ball.vel.lengthSq() > 280) {
      const trailColor = (this.ball.lastHitter === 'player') ? 0x00f0ff : 0xff2a55;
      this.particles.spawnBallTrail(this.ball.pos, trailColor);
    }

    // 1. Continuous Collision Detection (CCD) Net Check
    const crossedNet = (this.ball.prevPos.z * this.ball.pos.z <= 0);
    if ((crossedNet || Math.abs(this.ball.pos.z) < 0.20) && this.ball.pos.y < this.NET_H) {
      this.ball.pos.z = (this.ball.prevPos.z > 0) ? 0.16 : -0.16;
      this.ball.vel.z = -this.ball.vel.z * 0.22;
      this.ball.vel.y *= 0.4;
      this.audio.playBounce(0.4);
      if (this.gameMode === 'online_host') this._pendingSound = 'bounce';

      // Check if it's during serve
      if (this.rally === 0) {
        this.handleServiceFault('Pelota en la red');
      } else {
        const winner = (this.ball.lastHitter === 'player') ? 'ai' : 'player';
        this.awardPoint(winner, 'Pelota atrapada en la red');
      }
      return;
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

        if (!validServiceBox) {
          this.handleServiceFault('Fuera del cuadro de saque');
          return;
        }
      }

      // Rule B: RALLY IN-PLAY BOUNDARIES (Singles Court: |X| <= 4.115m, |Z| <= 11.885m)
      const inSinglesX = Math.abs(this.ball.pos.x) <= this.HALF_W;
      const inSinglesZ = Math.abs(this.ball.pos.z) <= this.HALF_L;

      if (!inSinglesX || !inSinglesZ) {
        const winner = (this.ball.lastHitter === 'player') ? 'ai' : 'player';
        this.awardPoint(winner, '¡Pelota Fuera (OUT)!');
        return;
      }

      // Own court bounce fault:
      if (this.ball.lastHitter && this.ball.lastHitter === currentSide && this.ball.bounceCount === 0) {
        const winner = (this.ball.lastHitter === 'player') ? 'ai' : 'player';
        this.awardPoint(winner, 'Bote en campo propio (Falta)');
        return;
      }

      this.ball.hitGroundInCourt = true;
      this.ball.bounceCount++;

      // Double bounce rule
      if (this.ball.bounceCount >= 2) {
        const winner = (currentSide === 'player') ? 'ai' : 'player';
        this.awardPoint(winner, 'Doble bote en pista');
        return;
      }
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

        if ((distToAIRacket <= 1.45 || distToAIBody <= 1.95) && this.ball.pos.z < -0.35 && this.ball.lastHitter !== 'ai' && this.ball.pos.y >= 0.12) {
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

    const isSprinting = this.keys['shift'];
    const curSpeed = this.player.speed * (isSprinting ? 1.4 : 1.0);

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
    const isMoving = Math.abs(Math.sin(char.runCycle)) > 0.05;

    // 1. Lower Body (Running Stride vs Athletic Ready Bounce)
    if (isMoving) {
      const runAngle = Math.sin(char.runCycle) * 0.72;
      limbs.lLeg.rotation.x = runAngle;
      limbs.rLeg.rotation.x = -runAngle;
      if (limbs.lCalf) limbs.lCalf.rotation.x = Math.max(0, -runAngle * 0.95);
      if (limbs.rCalf) limbs.rCalf.rotation.x = Math.max(0, runAngle * 0.95);
      limbs.lArm.rotation.x = -runAngle * 0.8;
    } else {
      // Pro Athletic Split-Step Ready Stance
      const readyBounce = Math.sin(time * 6.5) * 0.03;
      limbs.lLeg.rotation.set(0.12, 0, -0.08);
      limbs.rLeg.rotation.set(0.12, 0, 0.08);
      if (limbs.lCalf) limbs.lCalf.rotation.x = 0.18 + readyBounce;
      if (limbs.rCalf) limbs.rCalf.rotation.x = 0.18 + readyBounce;
    }

    // 2. Upper Body & Kinetic Chain Stroke Execution
    if (char.isSwinging) {
      char.swingProgress += dt * 11.0;
      const t = Math.min(char.swingProgress / Math.PI, 1.0);

      if (char.swingType === 'serve') {
        // Authentic Overhead Tennis Serve: Trophy Pose -> Apex Jump Snap -> Deceleration Follow-Through
        if (t <= 0.40) {
          const p = t / 0.40;
          // Left arm points high tossing ball
          limbs.lArm.rotation.set(-2.6 * p, 0, 0.25 * p);
          // Right arm drops racket into trophy scratch pose behind neck
          limbs.rArm.rotation.set(1.4 * p, -0.6 * p, -1.2 * p);
          if (limbs.rFore) limbs.rFore.rotation.set(1.6 * p, 0, 0);
          limbs.torso.rotation.set(-0.25 * p, 0.35 * p, 0);
        } else if (t <= 0.75) {
          const p = (t - 0.40) / 0.35;
          // High explosive apex overhead extension
          limbs.lArm.rotation.set(-2.6 * (1 - p), 0, 0);
          limbs.rArm.rotation.set(1.4 - 3.8 * p, -0.6 + 0.9 * p, -1.2 + 1.4 * p);
          if (limbs.rFore) limbs.rFore.rotation.set(1.6 * (1 - p), 0, 0);
          limbs.torso.rotation.set(-0.25 + 0.55 * p, 0.35 - 0.45 * p, 0);
        } else {
          const p = (t - 0.75) / 0.25;
          // Follow-through down across opposite hip
          limbs.rArm.rotation.set(-2.4 + 3.2 * p, 0.3 - 0.5 * p, 0.2 - 1.6 * p);
          limbs.torso.rotation.set(0.30 * (1 - p), -0.10 * (1 - p), 0);
        }
      } else if (char.swingType === 'backhand') {
        // Two-Handed Backhand Drive
        if (t <= 0.35) {
          const p = t / 0.35;
          limbs.torso.rotation.y = 0.85 * p;
          limbs.rArm.rotation.set(0.4 * p, -0.8 * p, 1.4 * p);
          limbs.lArm.rotation.set(0.3 * p, -0.6 * p, 1.1 * p);
        } else if (t <= 0.70) {
          const p = (t - 0.35) / 0.35;
          limbs.torso.rotation.y = 0.85 - 1.55 * p;
          limbs.rArm.rotation.set(0.4 - 0.9 * p, -0.8 + 1.6 * p, 1.4 - 2.8 * p);
          limbs.lArm.rotation.set(0.3 - 0.8 * p, -0.6 + 1.4 * p, 1.1 - 2.4 * p);
        } else {
          const p = (t - 0.70) / 0.30;
          limbs.torso.rotation.y = -0.70 * (1 - p);
          limbs.rArm.rotation.set(-0.5 * (1 - p), 0.8 * (1 - p), -1.4 * (1 - p));
          limbs.lArm.rotation.set(-0.5 * (1 - p), 0.8 * (1 - p), -1.3 * (1 - p));
        }
      } else {
        // Modern Aerodynamic Topspin Forehand (Windshield-Wiper Finish)
        if (t <= 0.35) {
          const p = t / 0.35;
          // Unit turn: Torso coils 55°, racket drops into lag position behind right hip
          limbs.torso.rotation.y = -0.90 * p;
          limbs.rArm.rotation.set(0.35 * p, 0.75 * p, -1.55 * p);
          if (limbs.rFore) limbs.rFore.rotation.set(0.45 * p, 0, 0);
          limbs.lArm.rotation.set(-0.6 * p, 0.2 * p, 0.75 * p);
        } else if (t <= 0.70) {
          const p = (t - 0.35) / 0.35;
          // Forward kinetic uncoil through contact zone
          limbs.torso.rotation.y = -0.90 + 1.45 * p;
          limbs.rArm.rotation.set(0.35 - 0.8 * p, 0.75 - 1.6 * p, -1.55 + 3.1 * p);
          if (limbs.rFore) limbs.rFore.rotation.set(0.45 + 0.8 * p, 0, 0);
          limbs.lArm.rotation.set(-0.6 + 0.8 * p, 0.2 - 0.3 * p, 0.75 - 1.2 * p);
        } else {
          const p = (t - 0.70) / 0.30;
          // Deceleration wrap over left shoulder
          limbs.torso.rotation.y = 0.55 * (1 - p);
          limbs.rArm.rotation.set(-0.45 * (1 - p), -0.85 * (1 - p), 1.55 * (1 - p));
          if (limbs.rFore) limbs.rFore.rotation.set(1.25 * (1 - p), 0, 0);
          limbs.lArm.rotation.set(0.2 * (1 - p), -0.1 * (1 - p), -0.45 * (1 - p));
        }
      }

      if (char.swingProgress >= Math.PI) {
        char.isSwinging = false;
        limbs.rArm.rotation.set(0, 0, 0);
        limbs.lArm.rotation.set(0, 0, 0);
        limbs.torso.rotation.set(0, 0, 0);
        if (limbs.rFore) limbs.rFore.rotation.set(0, 0, 0);
        if (limbs.lFore) limbs.lFore.rotation.set(0, 0, 0);
      }
    } else {
      // Neutral Athletic Posture: Hands holding racket in front at chest height
      if (!isMoving) {
        limbs.torso.rotation.set(0.12, 0, 0);
        limbs.rArm.rotation.set(-0.55, 0.30, -0.42);
        limbs.lArm.rotation.set(-0.50, -0.32, 0.40);
        if (limbs.rFore) limbs.rFore.rotation.set(0.55, 0, 0);
        if (limbs.lFore) limbs.lFore.rotation.set(0.55, 0, 0);
      } else {
        limbs.torso.rotation.set(0.05, 0, 0);
        limbs.rArm.rotation.set(Math.sin(char.runCycle) * 0.45, 0, isAI ? 0.2 : -0.2);
        if (limbs.rFore) limbs.rFore.rotation.set(0.25, 0, 0);
        if (limbs.lFore) limbs.lFore.rotation.set(0.25, 0, 0);
      }
    }

    char.model.rotation.y = isAI ? 0 : Math.PI;
  }

  // --- Smooth Camera System ---
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
  }

  // --- 2D Realtime Tennis Minimap ---
  drawMinimap() {
    const c = document.getElementById('minimap');
    if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width, h = c.height;

    // Deep Marine Background
    ctx.fillStyle = '#061325';
    ctx.fillRect(0, 0, w, h);

    // Court DecoTurf Blue Area
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(8, 8, w - 16, h - 16);

    // Boundary Lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    // Net line
    ctx.beginPath();
    ctx.moveTo(4, h / 2); ctx.lineTo(w - 4, h / 2);
    ctx.stroke();

    // Service lines (6.4m / 11.88m proportion)
    const sRatio = 6.40 / 11.885;
    const sY1 = (h / 2) - ((h / 2) - 8) * sRatio;
    const sY2 = (h / 2) + ((h / 2) - 8) * sRatio;

    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.moveTo(8, sY1); ctx.lineTo(w - 8, sY1);
    ctx.moveTo(8, sY2); ctx.lineTo(w - 8, sY2);
    ctx.moveTo(w / 2, sY1); ctx.lineTo(w / 2, sY2);
    ctx.stroke();

    const toX = (x) => 8 + ((x + this.DOUBLES_HALF_W) / this.COURT_W) * (w - 16);
    const toY = (z) => 8 + ((z + this.HALF_L) / this.COURT_L) * (h - 16);

    // Player 1 (Cyan)
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(toX(this.player.pos.x), toY(this.player.pos.z), 4, 0, Math.PI * 2);
    ctx.fill();

    // Player 2 / AI (Red)
    ctx.fillStyle = '#ff2a55';
    ctx.beginPath();
    ctx.arc(toX(this.ai.pos.x), toY(this.ai.pos.z), 4, 0, Math.PI * 2);
    ctx.fill();

    // Ball (Optic Yellow)
    ctx.fillStyle = '#ccff00';
    ctx.beginPath();
    ctx.arc(toX(this.ball.pos.x), toY(this.ball.pos.z), 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Main Animation Loop ---
  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);

    this.particles.update(dt);

    // Dynamic Environment Animations
    if (this.currentMap === 'beach') {
      const time = this.clock.getElapsedTime();
      if (this.oceanMesh && this.oceanMesh.geometry && this.oceanMesh.geometry.attributes.position) {
        const pos = this.oceanMesh.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i);
          const v = pos.getY(i);
          const wave = Math.sin(u * 0.12 + time * 2.2) * Math.cos(v * 0.15 + time * 1.8) * 0.45;
          pos.setZ(i, wave);
        }
        pos.needsUpdate = true;
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
      this.syncOnlineHost(dt);
      this.updatePhysics(dt);
    } else if (this.gameMode === 'online_guest') {
      this.updatePlayer2Guest(dt);
      // Smooth ball velocity extrapolation between host sync packets for locked 60fps
      if (this.ball && this.ball.vel && this.ball.mesh) {
        this.ball.pos.addScaledVector(this.ball.vel, dt);
        this.ball.mesh.position.copy(this.ball.pos);
        if (this.ball.shadow) {
          this.ball.shadow.position.x = this.ball.pos.x;
          this.ball.shadow.position.z = this.ball.pos.z;
        }
      }
      // Render and animate host's athlete model on guest's screen
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

    this.renderer.render(this.scene, this.camera);
  }
}

// Global Alias for backwards compatibility
const PadelGameEngine = TennisGameEngine;

window.addEventListener('DOMContentLoaded', () => {
  window.tennisGame = new TennisGameEngine();
  window.padelGame = window.tennisGame;
});
