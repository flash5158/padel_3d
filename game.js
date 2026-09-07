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
  }
};

// --- Particle FX Engine ---
class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    const geo = new THREE.SphereGeometry(0.045, 6, 6);
    this.geo = geo;
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

  update(dt) {
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

    this.initThree();
    this.particles = new ParticleSystem(this.scene);
    this.buildArena();
    this.buildCourt();

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

  // --- Three.js & Lighting Setup ---
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

    // Warm Grand Slam Stadium Lighting
    const ambient = new THREE.AmbientLight(0xdbeafe, 0.65);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff8ee, 1.35);
    sun.position.set(16, 28, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 5;
    sun.shadow.camera.far = 70;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 24;
    sun.shadow.camera.bottom = -24;
    sun.shadow.bias = -0.0006;
    this.scene.add(sun);

    // 4 Corner Stadium Floodlight Towers
    const lightTowers = [
      { x: -13.0, z: -18.0 }, { x: 13.0, z: -18.0 },
      { x: -13.0, z: 18.0 }, { x: 13.0, z: 18.0 }
    ];

    lightTowers.forEach(t => {
      const spot = new THREE.SpotLight(0xffffff, 0.95, 55, Math.PI / 3.2, 0.45);
      spot.position.set(t.x, 15, t.z);
      spot.target.position.set(0, 0, (t.z > 0 ? 4 : -4));
      this.scene.add(spot);
      this.scene.add(spot.target);

      // Steel Spaceframe Truss Pillar
      const trussGeo = new THREE.BoxGeometry(0.35, 15, 0.35);
      const trussMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
      const truss = new THREE.Mesh(trussGeo, trussMat);
      truss.position.set(t.x, 7.5, t.z);
      this.scene.add(truss);

      // Emissive Bank of Floodlamps
      const bank = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.8, 0.9),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      bank.position.set(t.x, 15.2, t.z);
      this.scene.add(bank);

      // Volumetric Light Cone Illusion
      const coneGeo = new THREE.ConeGeometry(4.2, 17, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.04,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(t.x * 0.7, 7.5, t.z * 0.7);
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(-t.x, -15, -t.z).normalize());
      this.scene.add(cone);
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // --- Grand Slam Arena: Grandstands, Umpire Chair, LED Ribbons ---
  buildArena() {
    const standMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    const seatBlue = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 });
    const seatRed = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const seatGold = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });

    // Lateral Grandstands with 8 Tiered Rows
    [-1, 1].forEach(side => {
      const xBase = side * 13.5;
      for (let row = 0; row < 8; row++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.70, 36), standMat);
        step.position.set(xBase + side * (row * 1.45), row * 0.70 + 0.35, 0);
        step.receiveShadow = true;
        this.scene.add(step);

        for (let s = -16; s <= 16; s += 0.9) {
          const sChoice = Math.abs(s + row) % 3;
          const sMat = (sChoice === 0) ? seatBlue : (sChoice === 1 ? seatRed : seatGold);
          const seat = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.48, 0.60), sMat);
          seat.position.set(xBase + side * (row * 1.45), row * 0.70 + 0.76, s);
          this.scene.add(seat);

          // 3D Cheering Spectators
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

            this.scene.add(body);
            this.scene.add(head);
          }
        }
      }
    });

    // Elevated Tennis Umpire Chair (Silla de juez de árbitro)
    const umpireGroup = new THREE.Group();
    umpireGroup.position.set(6.8, 0, 0);

    const uMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });

    // Ladder Legs
    const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8), uMat);
    l1.position.set(-0.35, 1.25, 0.35); l1.rotation.z = -0.12;
    const l2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8), uMat);
    l2.position.set(-0.35, 1.25, -0.35); l2.rotation.z = -0.12;
    const l3 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8), uMat);
    l3.position.set(0.35, 1.25, 0.35); l3.rotation.z = 0.12;
    const l4 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8), uMat);
    l4.position.set(0.35, 1.25, -0.35); l4.rotation.z = 0.12;
    umpireGroup.add(l1, l2, l3, l4);

    // Platform & High Chair
    const uPlat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.9), uMat);
    uPlat.position.y = 2.4;
    const uSeat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.6, 0.6), seatMat);
    uSeat.position.set(0, 2.75, 0);
    umpireGroup.add(uPlat, uSeat);

    // Umpire Canopy Umbrella
    const uCanopy = new THREE.Mesh(new THREE.ConeGeometry(0.85, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.3 }));
    uCanopy.position.set(0, 3.4, 0);
    umpireGroup.add(uCanopy);
    this.scene.add(umpireGroup);

    // Player Rest Benches (Opposite side at X = -6.8m)
    const benchGroup = new THREE.Group();
    benchGroup.position.set(-6.8, 0, 0);
    const bench1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.6), seatMat);
    bench1.position.set(0, 0.3, 2.0);
    const bench2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.6), seatMat);
    bench2.position.set(0, 0.3, -2.0);
    benchGroup.add(bench1, bench2);
    this.scene.add(benchGroup);

    // LED Grand Slam Digital Ribbon Banners
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
    this.scene.add(ledLeft);

    const ledRight = new THREE.Mesh(ledGeo, ledMat);
    ledRight.position.set(9.2, 0.50, 0);
    ledRight.rotation.y = -Math.PI / 2;
    this.scene.add(ledRight);

    // Overhead Spaceframe Roof Trusses
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 });
    for (let z = -15; z <= 15; z += 7.5) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(32, 0.38, 0.38), trussMat);
      beam.position.set(0, 16, z);
      this.scene.add(beam);
    }
  }

  // --- Official Open Tennis Court (No Glass Walls) ---
  buildCourt() {
    // 1. DecoTurf Court Ground Plane
    const courtTex = TextureFactory.createTurfTexture();
    const courtGeo = new THREE.PlaneGeometry(16.0, 30.0);
    const courtMat = new THREE.MeshStandardMaterial({
      map: courtTex,
      roughness: 0.76,
      metalness: 0.05
    });
    const court = new THREE.Mesh(courtGeo, courtMat);
    court.rotation.x = -Math.PI / 2;
    court.receiveShadow = true;
    this.scene.add(court);

    // Surrounding Stadium Floor
    const outerGeo = new THREE.PlaneGeometry(38, 52);
    const outerMat = new THREE.MeshStandardMaterial({ color: 0x050c18, roughness: 0.95 });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    outer.rotation.x = -Math.PI / 2;
    outer.position.y = -0.015;
    outer.receiveShadow = true;
    this.scene.add(outer);

    // 2. Official Tennis Net with Center Strap (0.914m center, 1.07m posts)
    const netWidth = 12.4; // Spanning full width past tramlines
    const netGeo = new THREE.PlaneGeometry(netWidth, this.NET_H, 48, 12);
    const netMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 0.9,
      wireframe: true
    });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(0, this.NET_H / 2, 0);
    this.scene.add(net);

    // Top White Vinyl Band (5cm regulation tape)
    const tapeGeo = new THREE.BoxGeometry(netWidth, 0.065, 0.045);
    const tapeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const tape = new THREE.Mesh(tapeGeo, tapeMat);
    tape.position.set(0, this.NET_H, 0);
    this.scene.add(tape);

    // Center White Strap (Fita central)
    const strapGeo = new THREE.BoxGeometry(0.06, this.NET_H, 0.05);
    const strap = new THREE.Mesh(strapGeo, tapeMat);
    strap.position.set(0, this.NET_H / 2, 0);
    this.scene.add(strap);

    // Net Steel Posts (1.07m height at X = +/-5.8m)
    const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.92, roughness: 0.2 });
    const nPostGeo = new THREE.CylinderGeometry(0.065, 0.065, this.NET_POST_H, 16);

    const np1 = new THREE.Mesh(nPostGeo, postMat);
    np1.position.set(-netWidth / 2, this.NET_POST_H / 2, 0);
    const np2 = new THREE.Mesh(nPostGeo, postMat);
    np2.position.set(netWidth / 2, this.NET_POST_H / 2, 0);
    this.scene.add(np1, np2);
  }

  // --- Pro Tennis Athlete 3D Model with Strung Tennis Racket ---
  createProAthlete(jerseyColor, shortsColor, accentHex, jerseyNumber, isAI = false) {
    const root = new THREE.Group();

    // 1. Athletic Torso & Technical Tennis Polo
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.98;

    const jColorStr = isAI ? '#ff2a55' : '#00f0ff';
    const jAccentStr = isAI ? '#ffdd00' : '#ffffff';
    const jerseyTex = TextureFactory.createJerseyTexture(jColorStr, jAccentStr, jerseyNumber, isAI);

    const jerseyMat = new THREE.MeshStandardMaterial({
      map: jerseyTex,
      roughness: 0.42,
      metalness: 0.15
    });

    const chestGeo = new THREE.CylinderGeometry(0.24, 0.20, 0.36, 24);
    const chest = new THREE.Mesh(chestGeo, jerseyMat);
    chest.position.y = 0.12;
    chest.castShadow = true;
    torsoGroup.add(chest);

    const waistGeo = new THREE.CylinderGeometry(0.20, 0.175, 0.28, 24);
    const waistMat = new THREE.MeshStandardMaterial({
      color: shortsColor,
      roughness: 0.7,
      metalness: 0.1
    });
    const waist = new THREE.Mesh(waistGeo, waistMat);
    waist.position.y = -0.16;
    waist.castShadow = true;
    torsoGroup.add(waist);

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xefc4a4,
      roughness: 0.55,
      metalness: 0.05
    });
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.090, 0.14, 16), skinMat);
    neck.position.y = 0.36;
    torsoGroup.add(neck);

    const collarMat = new THREE.MeshStandardMaterial({ color: isAI ? 0xffdd00 : 0xffffff, roughness: 0.5 });
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.016, 8, 24), collarMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.31;
    torsoGroup.add(collar);

    root.add(torsoGroup);

    // 2. Sculpted Athletic Head with Tennis Cap & Sports Visor
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.48;

    const headGeo = new THREE.SphereGeometry(0.138, 24, 24);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    headGroup.add(head);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.06, 8), skinMat);
    nose.position.set(0, -0.01, 0.14);
    nose.rotation.x = Math.PI / 2;
    headGroup.add(nose);

    // Tennis Cap / Pro Visor
    const capMat = new THREE.MeshStandardMaterial({
      color: isAI ? 0x0f172a : 0xffffff,
      roughness: 0.45,
      metalness: 0.2
    });
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.144, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2),
      capMat
    );
    cap.position.y = 0.025;
    headGroup.add(cap);

    const brimGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.018, 20, 1, false, -Math.PI / 3, (2 * Math.PI) / 3);
    const brim = new THREE.Mesh(brimGeo, capMat);
    brim.position.set(0, 0.045, 0.10);
    brim.rotation.x = 0.18;
    headGroup.add(brim);

    // Polarized Wrap-Around Sunglasses
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: isAI ? 0xff0055 : 0x00f0ff,
      metalness: 0.95,
      roughness: 0.05,
      transmission: 0.2,
      reflectivity: 1.0,
      clearcoat: 1.0
    });
    const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.038, 0.12), lensMat);
    glasses.position.set(0, 0.01, 0.10);
    headGroup.add(glasses);

    root.add(headGroup);

    // 3. Articulated Legs (Hips, Knees, Calves)
    const legGeo = new THREE.CylinderGeometry(0.088, 0.068, 0.40, 16);
    const calfGeo = new THREE.CylinderGeometry(0.068, 0.052, 0.38, 16);

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

      // Tennis Court Sneakers
      const shoeMat = new THREE.MeshStandardMaterial({
        color: isRight ? 0xffffff : 0x0f172a,
        roughness: 0.35,
        metalness: 0.2
      });
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.26), shoeMat);
      shoe.position.set(0, -0.38, 0.05);
      shoe.castShadow = true;
      kneeGroup.add(shoe);

      legGroup.add(kneeGroup);
      return { legGroup, kneeGroup };
    };

    const leftLegData = createLeg(false);
    const rightLegData = createLeg(true);
    root.add(leftLegData.legGroup);
    root.add(rightLegData.legGroup);

    // 4. Articulated Arms (Deltoids, Biceps, Elbows, Forearms)
    const armGeo = new THREE.CylinderGeometry(0.065, 0.052, 0.32, 16);
    const forearmGeo = new THREE.CylinderGeometry(0.052, 0.042, 0.30, 16);

    // Left Arm
    const lArmGroup = new THREE.Group();
    lArmGroup.position.set(-0.28, 1.25, 0);
    const lUpper = new THREE.Mesh(armGeo, skinMat);
    lUpper.position.y = -0.16;
    lArmGroup.add(lUpper);

    const lFore = new THREE.Mesh(forearmGeo, skinMat);
    lFore.position.y = -0.45;
    lArmGroup.add(lFore);
    root.add(lArmGroup);

    // Right Arm (Dominant Playing Arm holding Racket)
    const rArmGroup = new THREE.Group();
    rArmGroup.position.set(0.28, 1.25, 0);
    const rUpper = new THREE.Mesh(armGeo, skinMat);
    rUpper.position.y = -0.16;
    rArmGroup.add(rUpper);

    const rFore = new THREE.Mesh(forearmGeo, skinMat);
    rFore.position.y = -0.45;
    rArmGroup.add(rFore);

    const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), skinMat);
    rHand.position.y = -0.60;
    rArmGroup.add(rHand);

    // 5. Authentic Strung Tennis Racket (Extended Two-Handed Grip & Open String Bed)
    const racketGroup = new THREE.Group();
    racketGroup.position.set(0, -0.60, 0.18);

    // Extended Dual-Hand Tennis Grip Handle
    const gripTex = TextureFactory.createGripTexture();
    const handleMat = new THREE.MeshStandardMaterial({
      map: gripTex,
      roughness: 0.5,
      metalness: 0.1
    });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.32, 16), handleMat);
    handle.position.y = 0.16;
    racketGroup.add(handle);

    // Flared Butt Cap with Tournament Logo
    const buttCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.024, 0.03, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    buttCap.position.y = 0.01;
    racketGroup.add(buttCap);

    // V-Throat Bridge
    const throatMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const pylonGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.16, 10);
    const pL = new THREE.Mesh(pylonGeo, throatMat);
    pL.position.set(-0.044, 0.36, 0); pL.rotation.z = -0.34;
    const pR = new THREE.Mesh(pylonGeo, throatMat);
    pR.position.set(0.044, 0.36, 0); pR.rotation.z = 0.34;
    racketGroup.add(pL, pR);

    // Elliptical Aerodynamic Graphite Tennis Hoop Frame
    const hoopMat = new THREE.MeshStandardMaterial({
      color: isAI ? 0xdc2626 : 0x0284c7,
      metalness: 0.88,
      roughness: 0.22
    });
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.022, 10, 36), hoopMat);
    hoop.scale.set(0.95, 1.35, 1.0);
    hoop.position.y = 0.56;
    racketGroup.add(hoop);

    // High-Tension Cross-Strung String Bed (Double-Sided Transparent Plane)
    const stringTex = TextureFactory.createRacketFaceTexture(accentHex);
    const stringMat = new THREE.MeshStandardMaterial({
      map: stringTex,
      transparent: true,
      opacity: 0.88,
      roughness: 0.15,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const stringPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.62), stringMat);
    stringPlane.position.y = 0.56;
    racketGroup.add(stringPlane);

    rArmGroup.add(racketGroup);
    root.add(rArmGroup);

    // Athlete Dynamic Contact Shadow
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.60, 24),
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
        side: this.servingSide
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

  // Execute Overhead Tennis Serve
  executeServe() {
    this.pointActive = true;
    const promptEl = document.getElementById('serve-prompt');
    if (promptEl) promptEl.classList.add('hidden');
    this.ball.lastHitter = 'player';
    this.ball.bounceCount = 0;
    this.ball.hitGroundInCourt = false;

    // Must land in opponent's diagonal service box (Z: -6.40m to 0, X: opposite side)
    const targetX = -this.servingSide * (0.8 + Math.random() * 2.6);
    const targetZ = -1.2 - Math.random() * 4.4; // Inside service box

    const flightTime = 0.95;
    const vx = (targetX - this.ball.pos.x) / flightTime;
    const vz = (targetZ - this.ball.pos.z) / flightTime;
    const vy = (0.5 * 9.8 * flightTime * flightTime - this.ball.pos.y) / flightTime + 1.2;

    this.ball.vel.set(vx, vy, vz);
    this.ball.spin.set(12.0, 0, 0); // Flat / Topspin serve
    this.audio.playHit(1.0, true, true);
    if (this.gameMode === 'online_host') this._pendingSound = 'hit';
    this.startSwingAnimation(this.player, 'forehand');
    this.particles.burst(this.ball.pos, 22, 0x00f0ff, 3.8);

    const sLabel = (this.serveFaultCount === 0) ? '1ER SAQUE' : '2DO SAQUE';
    this.showAnnouncement(`¡${sLabel}!`, 'Pelota en juego');
    this.showTimingFeedback('SWEET SPOT • SERVICIO', 'perfect');
  }

  executeAIServe() {
    this.pointActive = true;
    const promptEl = document.getElementById('serve-prompt');
    if (promptEl) promptEl.classList.add('hidden');
    this.ball.lastHitter = 'ai';
    this.ball.bounceCount = 0;
    this.ball.hitGroundInCourt = false;

    // Diagonal service box on player side (Z: 0 to 6.40m)
    const targetX = this.servingSide * (0.8 + Math.random() * 2.6);
    const targetZ = 1.2 + Math.random() * 4.4;

    const flightTime = 0.95;
    const vx = (targetX - this.ball.pos.x) / flightTime;
    const vz = (targetZ - this.ball.pos.z) / flightTime;
    const vy = (0.5 * 9.8 * flightTime * flightTime - this.ball.pos.y) / flightTime + 1.2;

    this.ball.vel.set(vx, vy, vz);
    this.ball.spin.set(-12.0, 0, 0);
    this.audio.playHit(1.0, true, true);
    if (this.gameMode === 'online_host') this._pendingSound = 'hit';
    this.startSwingAnimation(this.ai, 'forehand');
    this.particles.burst(this.ball.pos, 22, 0xff2a55, 3.8);
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

      this.particles.burst(this.ball.pos, 8, 0x88ccff, 2.0);

      const currentSide = (this.ball.pos.z > 0) ? 'player' : 'ai';

      // Rule A: SERVICE BOUNCE CHECK
      if (this.rally === 0 && !this.ball.hitGroundInCourt) {
        // Must land inside the diagonal service box
        // Player serve: lands on AI side (Z: -6.40m to 0), X on opposite side
        let validServiceBox = false;
        if (this.server === 'player') {
          const inZ = (this.ball.pos.z >= -this.SERVICE_Z && this.ball.pos.z <= 0);
          const inX = (this.servingSide === 1) ?
                      (this.ball.pos.x >= -this.HALF_W && this.ball.pos.x <= 0) :
                      (this.ball.pos.x >= 0 && this.ball.pos.x <= this.HALF_W);
          validServiceBox = inZ && inX;
        } else {
          const inZ = (this.ball.pos.z >= 0 && this.ball.pos.z <= this.SERVICE_Z);
          const inX = (this.servingSide === 1) ?
                      (this.ball.pos.x >= 0 && this.ball.pos.x <= this.HALF_W) :
                      (this.ball.pos.x >= -this.HALF_W && this.ball.pos.x <= 0);
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

  // --- Pro Character Animations ---
  animateCharacter(char, dt, isAI) {
    const limbs = char.limbs;
    if (!limbs) return;

    // Running leg/arm stride
    const runAngle = Math.sin(char.runCycle) * 0.68;
    limbs.lLeg.rotation.x = runAngle;
    limbs.rLeg.rotation.x = -runAngle;
    limbs.lArm.rotation.x = -runAngle * 0.7;

    if (limbs.lCalf) limbs.lCalf.rotation.x = Math.max(0, -runAngle * 0.85);
    if (limbs.rCalf) limbs.rCalf.rotation.x = Math.max(0, runAngle * 0.85);

    // Explosive Tennis Swing
    if (char.isSwinging) {
      char.swingProgress += dt * 15;
      const phase = Math.sin(char.swingProgress);

      if (char.swingType === 'forehand') {
        limbs.rArm.rotation.z = -phase * 1.9;
        limbs.rArm.rotation.y = phase * 1.2;
        limbs.torso.rotation.y = -phase * 0.50;
      } else {
        limbs.rArm.rotation.z = phase * 1.6;
        limbs.rArm.rotation.y = -phase * 1.25;
        limbs.torso.rotation.y = phase * 0.50;
      }

      if (char.swingProgress >= Math.PI) {
        char.isSwinging = false;
        limbs.rArm.rotation.set(0, 0, 0);
        limbs.torso.rotation.set(0, 0, 0);
      }
    } else {
      limbs.rArm.rotation.x = runAngle * 0.4;
      limbs.rArm.rotation.z = isAI ? 0.2 : -0.2;
      limbs.rArm.rotation.y = 0;
      limbs.torso.rotation.y = 0;
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
