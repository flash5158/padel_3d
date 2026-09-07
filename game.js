/**
 * PADEL PRO 3D - CONSOLE ULTRA EDITION
 * PBR Procedural Shaders, True Hitbox CCD Engine, Volumetric Lighting,
 * Articulated 3D Humanoid Athletes, Particle FX & Ball Seam Spin
 */

// --- Web Audio Synthesizer ---
class PadelAudioPro {
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
  playHit(power = 1.0, isSmash = false, isSweetSpot = false) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    const startFreq = isSmash ? 320 : (isSweetSpot ? 260 : 210);
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

    g.gain.setValueAtTime(0.8 * Math.min(1.3, power), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.12);

    // Carbon fiber perforation snap & friction noise
    const bSize = this.ctx.sampleRate * 0.045;
    const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < bSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bSize * 0.22));
    const noise = this.ctx.createBufferSource();
    noise.buffer = b;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = isSmash ? 3800 : (isSweetSpot ? 3000 : 2400);
    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.55 * power, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    noise.connect(filter); filter.connect(ng); ng.connect(this.ctx.destination);
    noise.start(t);
  }
  playBounce(v = 1.0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.08);
    g.gain.setValueAtTime(Math.min(0.45 * v, 0.55), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.08);
  }
  playGlass(v = 1.0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(115, t + 0.24);
    g.gain.setValueAtTime(Math.min(0.55 * (v / 10), 0.65), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.24);
  }
  playCrowd() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const dur = 1.8;
    const bSize = this.ctx.sampleRate * dur;
    const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < bSize; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / bSize) * Math.PI);
    const noise = this.ctx.createBufferSource();
    noise.buffer = b;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(900, t);
    f.frequency.linearRampToValueAtTime(1800, t + 0.7);
    f.frequency.linearRampToValueAtTime(700, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.01, t);
    g.gain.linearRampToValueAtTime(0.32, t + 0.4);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(f); f.connect(g); g.connect(this.ctx.destination);
    noise.start(t);
  }
  playWhistle() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2600, t);
    osc.frequency.setValueAtTime(2800, t + 0.08);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + 0.25);
  }
  playAirSwing() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const dur = 0.20;
    const bSize = Math.floor(this.ctx.sampleRate * dur);
    const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < bSize; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / bSize) * Math.PI);
    const noise = this.ctx.createBufferSource();
    noise.buffer = b;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(450, t);
    f.frequency.exponentialRampToValueAtTime(950, t + 0.08);
    f.frequency.exponentialRampToValueAtTime(280, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(f); f.connect(g); g.connect(this.ctx.destination);
    noise.start(t);
  }
}

// --- Procedural PBR Texture Generators ---
const TextureFactory = {
  // 1. Padel Ball Texture (Optic Yellow Felt + Curved Seams + Bump)
  createBallTextures() {
    const size = 512;
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = colorCanvas.height = size;
    const cCtx = colorCanvas.getContext('2d');

    // Optic Yellow Base
    cCtx.fillStyle = '#ccff00';
    cCtx.fillRect(0, 0, size, size);

    // Felt fuzz noise
    for (let i = 0; i < 40000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      cCtx.fillStyle = Math.random() > 0.5 ? '#b8ea00' : '#d8ff22';
      cCtx.fillRect(x, y, 2, 2);
    }

    // Regulation White Curved Seams
    cCtx.strokeStyle = '#ffffff';
    cCtx.lineWidth = 14;
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

    // Ball Bump Map (Felt depth and recessed rubber seam)
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = bumpCanvas.height = size;
    const bCtx = bumpCanvas.getContext('2d');
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, size, size);

    for (let i = 0; i < 30000; i++) {
      bCtx.fillStyle = Math.random() > 0.5 ? '#999999' : '#666666';
      bCtx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
    }

    // Indented seam groove
    bCtx.strokeStyle = '#222222';
    bCtx.lineWidth = 14;
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

  // 2. Carbon Fiber Padel Racket Face with Drilled Perforations
  createRacketFaceTexture(accentHex) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Carbon Twill Weave Pattern
    ctx.fillStyle = '#111822';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 8) {
      for (let x = 0; x < size; x += 8) {
        if ((x / 8 + y / 8) % 2 === 0) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x, y, 8, 8);
        }
      }
    }

    // Aerodynamic Pro Accent Decal
    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    // Drilled Hole Pattern (Perforaciones circulares)
    ctx.fillStyle = '#050810';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;

    const rings = [0.12, 0.22, 0.30];
    rings.forEach((rRatio, rIdx) => {
      const count = 8 + rIdx * 6;
      const r = size * rRatio;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const hx = size / 2 + Math.cos(angle) * r;
        const hy = size / 2 + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(hx, hy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  },

  // 3. Pro Turf (Official Premier Padel Blue with synthetic grain)
  createTurfTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // Deep Electric Blue
    ctx.fillStyle = '#0a54bf';
    ctx.fillRect(0, 0, 1024, 2048);

    // Micro-texture grain
    for (let i = 0; i < 70000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.14)';
      ctx.fillRect(Math.random() * 1024, Math.random() * 2048, 2, 3);
    }

    // Center Sponsor Circle
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(512, 1024, 190, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = 'bold 54px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PREMIER PADEL', 512, 1042);

    // Regulation White Lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 16;
    ctx.strokeRect(32, 32, 1024 - 64, 2048 - 64);

    const netY = 1024;
    const sDist = 6.95 * (2048 / 20); // ~711px
    const sPlayer = netY + sDist;
    const sAI = netY - sDist;

    ctx.beginPath();
    ctx.moveTo(32, sPlayer); ctx.lineTo(1024 - 32, sPlayer);
    ctx.moveTo(32, sAI); ctx.lineTo(1024 - 32, sAI);
    ctx.moveTo(512, sAI); ctx.lineTo(512, sPlayer);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  },

  // 4. Pro Athlete Athletic Jersey Texture (Sport Mesh, Ergonomic Panels & Number)
  createJerseyTexture(baseColorHex, accentColorHex, numberStr, isAI) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base Jersey Color
    ctx.fillStyle = baseColorHex;
    ctx.fillRect(0, 0, 512, 512);

    // Honeycomb Micro-Perforations for Technical Fabric
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < 512; y += 10) {
      for (let x = 0; x < 512; x += 10) {
        const ox = (y % 20 === 0) ? 5 : 0;
        ctx.fillRect(x + ox, y, 3, 3);
      }
    }

    // Dynamic Flank Racing Stripes (Ergonomic side panels)
    ctx.fillStyle = accentColorHex;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(70, 0); ctx.lineTo(110, 512); ctx.lineTo(0, 512);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(512, 0); ctx.lineTo(512 - 70, 0); ctx.lineTo(512 - 110, 512); ctx.lineTo(512, 512);
    ctx.fill();

    // Tournament Sponsor & Crest on Front Chest
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WORLD TOUR', 256, 110);

    ctx.fillStyle = accentColorHex;
    ctx.fillRect(196, 125, 120, 6);

    // Big Stencil Player Number on Back
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 130px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(numberStr, 256, 380);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  },

  // 5. Spiral Overgrip Handle Texture
  createGripTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 128, 256);

    // Overlapping spiral wrap lines
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    for (let y = -64; y < 320; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y + 64);
      ctx.stroke();
    }

    // Grip texture micro-dots
    ctx.fillStyle = '#cbd5e1';
    for (let i = 0; i < 400; i++) {
      ctx.fillRect(Math.random() * 128, Math.random() * 256, 2, 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 4);
    return tex;
  }
};

// --- Particle System (Contact Sparks, Court Dust) ---
class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];

    const pGeo = new THREE.BufferGeometry();
    const pCount = 200;
    const positions = new Float32Array(pCount * 3);
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.14,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    this.points = new THREE.Points(pGeo, pMat);
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    for (let i = 0; i < pCount; i++) {
      this.particles.push({
        pos: new THREE.Vector3(0, -100, 0),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.5,
        color: 0x00f0ff
      });
    }
  }

  burst(pos, count = 25, color = 0x00f0ff, speed = 4.0) {
    let spawned = 0;
    for (let p of this.particles) {
      if (p.life <= 0) {
        p.pos.copy(pos);
        p.vel.set(
          (Math.random() - 0.5) * speed,
          Math.random() * speed * 0.8 + 1.0,
          (Math.random() - 0.5) * speed
        );
        p.life = p.maxLife;
        p.color = color;
        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  update(dt) {
    const posAttr = this.points.geometry.attributes.position;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.life > 0) {
        p.life -= dt;
        p.vel.y -= 9.8 * dt; // gravity
        p.pos.addScaledVector(p.vel, dt);
        posAttr.setXYZ(i, p.pos.x, p.pos.y, p.pos.z);
      } else {
        posAttr.setXYZ(i, 0, -100, 0);
      }
    }
    posAttr.needsUpdate = true;
  }
}

// --- Main Padel Engine Class ---
class PadelGameEngine {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.audio = new PadelAudioPro();

    this.COURT_W = 10.0;
    this.COURT_L = 20.0;
    this.HALF_W = 5.0;
    this.HALF_L = 10.0;
    this.NET_H = 0.88;
    this.WALL_H = 3.6;

    this.isPlaying = false;
    this.pointActive = false;
    this.server = 'player';
    this.servingSide = 1;
    this.scorePlayer = 0;
    this.scoreAI = 0;
    this.gamesPlayer = 0;
    this.gamesAI = 0;
    this.setsPlayer = 0;
    this.setsAI = 0;
    this.rally = 0;

    this.shotType = 'DRIVE';
    this.power = 0.5;
    this.isChargingPower = false;
    this.cameraMode = 'third';

    // Multiplayer State ('ai', 'local', 'online_host', 'online_guest')
    this.gameMode = 'ai';
    this.peer = null;
    this.conn = null;
    this.roomCode = null;
    this.netTimer = 0;
    this.p2Input = {
      pos: new THREE.Vector3(-1.8, 0, -7.5),
      isSwinging: false,
      swingType: 'forehand',
      runCycle: 0,
      shotPending: null
    };

    // Ball Physics with True 3D Spin
    this.ballRadius = 0.12;
    this.ball = {
      pos: new THREE.Vector3(0, 1.0, 7.5),
      prevPos: new THREE.Vector3(0, 1.0, 7.5),
      vel: new THREE.Vector3(0, 0, 0),
      spin: new THREE.Vector3(0, 0, 0), // angular velocity
      mesh: null,
      shadow: null,
      targetMarker: null,
      lastHitter: null,
      bounceCount: 0,
      hitGroundInCourt: false
    };

    // Humanoid Athletes
    this.player = {
      pos: new THREE.Vector3(1.8, 0, 7.5),
      speed: 7.6,
      model: null,
      limbs: {},
      racketHitbox: { pos: new THREE.Vector3(), radius: 0.38 },
      runCycle: 0,
      isSwinging: false,
      swingType: 'forehand',
      swingProgress: 0
    };

    this.ai = {
      pos: new THREE.Vector3(-1.8, 0, -7.5),
      targetPos: new THREE.Vector3(0, 0, -7.5),
      speed: 8.5,
      model: null,
      limbs: {},
      racketHitbox: { pos: new THREE.Vector3(), radius: 0.38 },
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
    this.scene.background = new THREE.Color(0x080f1c);
    this.scene.fog = new THREE.FogExp2(0x080f1c, 0.012);

    this.camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 250);
    this.camera.position.set(0, 4.4, 15.6);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // Warm Stadium Lighting
    const ambient = new THREE.AmbientLight(0xdbeafe, 0.6);
    this.scene.add(ambient);

    // Main Overhead Directional Sun
    const sun = new THREE.DirectionalLight(0xfff7ed, 1.25);
    sun.position.set(14, 24, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 5;
    sun.shadow.camera.far = 60;
    sun.shadow.camera.left = -16;
    sun.shadow.camera.right = 16;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.bias = -0.0006;
    this.scene.add(sun);

    // 4 Corner Volumetric Floodlights
    const lightTowers = [
      { x: -9.5, z: -14.5 }, { x: 9.5, z: -14.5 },
      { x: -9.5, z: 14.5 }, { x: 9.5, z: 14.5 }
    ];

    lightTowers.forEach(t => {
      const spot = new THREE.SpotLight(0xffffff, 0.9, 45, Math.PI / 3.4, 0.4);
      spot.position.set(t.x, 12, t.z);
      spot.target.position.set(0, 0, (t.z > 0 ? 3 : -3));
      this.scene.add(spot);
      this.scene.add(spot.target);

      // Steel Spaceframe Truss Pillar
      const trussGeo = new THREE.BoxGeometry(0.3, 12, 0.3);
      const trussMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
      const truss = new THREE.Mesh(trussGeo, trussMat);
      truss.position.set(t.x, 6, t.z);
      this.scene.add(truss);

      // Emissive Bank of Lamps
      const bankGeo = new THREE.BoxGeometry(1.6, 0.6, 0.8);
      const bankMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const bank = new THREE.Mesh(bankGeo, bankMat);
      bank.position.set(t.x, 12.2, t.z);
      this.scene.add(bank);

      // Volumetric Light Cone Illusion
      const coneGeo = new THREE.ConeGeometry(3.5, 14, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.04,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(t.x * 0.7, 6, t.z * 0.7);
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(-t.x, -12, -t.z).normalize());
      this.scene.add(cone);
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // --- Grandstands, Roof & LED Perimeter ---
  buildArena() {
    const standMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    const seatBlue = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 });
    const seatRed = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const seatGold = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });

    // Lateral Grandstands with 8 Tiered Rows
    [-1, 1].forEach(side => {
      const xBase = side * 11.8;
      for (let row = 0; row < 8; row++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.65, 28), standMat);
        step.position.set(xBase + side * (row * 1.35), row * 0.65 + 0.32, 0);
        step.receiveShadow = true;
        this.scene.add(step);

        // Seats & 3D Cheering Spectators
        for (let s = -12; s <= 12; s += 0.85) {
          const sChoice = Math.abs(s + row) % 3;
          const sMat = (sChoice === 0) ? seatBlue : (sChoice === 1 ? seatRed : seatGold);
          const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.55), sMat);
          seat.position.set(xBase + side * (row * 1.35), row * 0.65 + 0.72, s);
          this.scene.add(seat);

          // 3D Spectator
          if (Math.sin(s * 2.8 + row * 1.9) > -0.1) {
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.65, 8),
              new THREE.MeshStandardMaterial({ color: (s * row) % 2 === 0 ? 0x38bdf8 : 0xf43f5e, roughness: 0.9 }));
            body.position.set(xBase + side * (row * 1.35), row * 0.65 + 1.15, s);

            const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8),
              new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.7 }));
            head.position.set(xBase + side * (row * 1.35), row * 0.65 + 1.58, s);

            this.scene.add(body);
            this.scene.add(head);
          }
        }
      }
    });

    // Glowing LED Perimeter Advertising Boards
    const ledCanvas = document.createElement('canvas');
    ledCanvas.width = 1024; ledCanvas.height = 128;
    const lctx = ledCanvas.getContext('2d');
    lctx.fillStyle = '#06101e';
    lctx.fillRect(0, 0, 1024, 128);
    lctx.fillStyle = '#00f0ff';
    lctx.font = '900 40px sans-serif';
    lctx.fillText('PREMIER PADEL • BULLPADEL • NOX • WILSON • HEAD • CUPRA', 15, 78);
    const ledTex = new THREE.CanvasTexture(ledCanvas);
    ledTex.wrapS = THREE.RepeatWrapping;
    ledTex.repeat.set(3, 1);

    const ledMat = new THREE.MeshBasicMaterial({ map: ledTex });
    const ledGeo = new THREE.PlaneGeometry(26, 0.95);

    const ledLeft = new THREE.Mesh(ledGeo, ledMat);
    ledLeft.position.set(-6.9, 0.48, 0);
    ledLeft.rotation.y = Math.PI / 2;
    this.scene.add(ledLeft);

    const ledRight = new THREE.Mesh(ledGeo, ledMat);
    ledRight.position.set(6.9, 0.48, 0);
    ledRight.rotation.y = -Math.PI / 2;
    this.scene.add(ledRight);

    // Overhead Stadium Space-frame Trusses
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 });
    for (let z = -12; z <= 12; z += 6) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(26, 0.35, 0.35), trussMat);
      beam.position.set(0, 14, z);
      this.scene.add(beam);
    }
  }

  // --- Official Court with Realistic Glass & Wire Mesh ---
  buildCourt() {
    // 1. Synthetic Turf
    const turfTex = TextureFactory.createTurfTexture();
    const courtGeo = new THREE.PlaneGeometry(this.COURT_W, this.COURT_L);
    const courtMat = new THREE.MeshStandardMaterial({
      map: turfTex,
      roughness: 0.72,
      metalness: 0.08
    });
    const court = new THREE.Mesh(courtGeo, courtMat);
    court.rotation.x = -Math.PI / 2;
    court.receiveShadow = true;
    this.scene.add(court);

    // Surrounding Floor
    const outerGeo = new THREE.PlaneGeometry(32, 44);
    const outerMat = new THREE.MeshStandardMaterial({ color: 0x091422, roughness: 0.95 });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    outer.rotation.x = -Math.PI / 2;
    outer.position.y = -0.01;
    outer.receiveShadow = true;
    this.scene.add(outer);

    // 2. High-Tech Beveled Tempered Glass Walls
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x9be8ff,
      transparent: true,
      opacity: 0.38,
      roughness: 0.04,
      metalness: 0.12,
      transmission: 0.88,
      ior: 1.5,
      reflectivity: 0.85,
      side: THREE.DoubleSide
    });

    // Back Glass Walls (Z = +/-10m)
    const backGeo = new THREE.BoxGeometry(this.COURT_W, this.WALL_H, 0.08);
    const bWallP = new THREE.Mesh(backGeo, glassMat);
    bWallP.position.set(0, this.WALL_H / 2, this.HALF_L);
    this.scene.add(bWallP);

    const bWallAI = new THREE.Mesh(backGeo, glassMat);
    bWallAI.position.set(0, this.WALL_H / 2, -this.HALF_L);
    this.scene.add(bWallAI);

    // Corner Glass Walls (4m length)
    const sGlassGeo = new THREE.BoxGeometry(0.08, this.WALL_H, 4.0);
    [
      [this.HALF_W, 8.0], [-this.HALF_W, 8.0],
      [this.HALF_W, -8.0], [-this.HALF_W, -8.0]
    ].forEach(([x, z]) => {
      const g = new THREE.Mesh(sGlassGeo, glassMat);
      g.position.set(x, this.WALL_H / 2, z);
      this.scene.add(g);
    });

    // Center Metallic Wire Mesh (Z: -6 to +6)
    const fenceMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.85,
      roughness: 0.35,
      wireframe: true
    });
    const fenceGeo = new THREE.PlaneGeometry(12.0, this.WALL_H, 48, 16);

    const fR = new THREE.Mesh(fenceGeo, fenceMat);
    fR.rotation.y = -Math.PI / 2;
    fR.position.set(this.HALF_W, this.WALL_H / 2, 0);
    this.scene.add(fR);

    const fL = new THREE.Mesh(fenceGeo, fenceMat);
    fL.rotation.y = Math.PI / 2;
    fL.position.set(-this.HALF_W, this.WALL_H / 2, 0);
    this.scene.add(fL);

    // Structural Posts & Chrome Glass Mounting Clips
    const postMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
    const postGeo = new THREE.CylinderGeometry(0.05, 0.05, this.WALL_H, 12);
    [
      [-this.HALF_W, -this.HALF_L], [this.HALF_W, -this.HALF_L],
      [-this.HALF_W, this.HALF_L], [this.HALF_W, this.HALF_L]
    ].forEach(([x, z]) => {
      const p = new THREE.Mesh(postGeo, postMat);
      p.position.set(x, this.WALL_H / 2, z);
      this.scene.add(p);
    });

    // 3. Realistic 3D Net
    const netGeo = new THREE.PlaneGeometry(this.COURT_W, this.NET_H, 40, 10);
    const netMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9, wireframe: true });
    const net = new THREE.Mesh(netGeo, netMat);
    net.position.set(0, this.NET_H / 2, 0);
    this.scene.add(net);

    const tapeGeo = new THREE.BoxGeometry(this.COURT_W, 0.09, 0.06);
    const tapeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const tape = new THREE.Mesh(tapeGeo, tapeMat);
    tape.position.set(0, this.NET_H, 0);
    this.scene.add(tape);

    const nPostGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.05, 16);
    const np1 = new THREE.Mesh(nPostGeo, postMat);
    np1.position.set(-this.HALF_W - 0.05, 1.05 / 2, 0);
    const np2 = new THREE.Mesh(nPostGeo, postMat);
    np2.position.set(this.HALF_W + 0.05, 1.05 / 2, 0);
    this.scene.add(np1);
    this.scene.add(np2);
  }

  // --- Pro Athlete 3D Model with Sculpted Sportswear, Articulated Joints & PBR Racket ---
  createProAthlete(jerseyColor, shortsColor, accentHex, jerseyNumber, isAI = false) {
    const root = new THREE.Group();

    // 1. Athletic Anatomical Torso & Technical Jersey
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

    // Upper Chest / Pecs (V-taper)
    const chestGeo = new THREE.CylinderGeometry(0.24, 0.20, 0.36, 24);
    const chest = new THREE.Mesh(chestGeo, jerseyMat);
    chest.position.y = 0.12;
    chest.castShadow = true;
    torsoGroup.add(chest);

    // Tapered Athletic Waist
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

    // Anatomical Neck & Ribbed Collar
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

    // 2. Sculpted Athletic Head with Fade/Cap & Polarized Sports Eyewear
    const headGroup = new THREE.Group();
    headGroup.position.y = 1.48;

    const headGeo = new THREE.SphereGeometry(0.138, 24, 24);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Nose & Brow definition
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.06, 8), skinMat);
    nose.position.set(0, -0.01, 0.14);
    nose.rotation.x = Math.PI / 2;
    headGroup.add(nose);

    // Athletic Cap / Pro Visor
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

    // Aerodynamic Curved Visor Brim
    const brimGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.018, 20, 1, false, -Math.PI / 3, (2 * Math.PI) / 3);
    const brim = new THREE.Mesh(brimGeo, capMat);
    brim.position.set(0, 0.045, 0.10);
    brim.rotation.x = 0.18;
    headGroup.add(brim);

    // Polarized Wrap-Around Sports Sunglasses
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

    // 3. Compression Shorts & Athletic Pelvis
    const shortsGeo = new THREE.CylinderGeometry(0.21, 0.22, 0.26, 24);
    const shortsMesh = new THREE.Mesh(shortsGeo, waistMat);
    shortsMesh.position.y = 0.68;
    shortsMesh.castShadow = true;
    root.add(shortsMesh);

    // 4. Detailed Pro Padel Sneakers (Multi-layer Outsole, Cushion & Laces)
    const createSneaker = (isLeft) => {
      const shoeGroup = new THREE.Group();

      // Outsole Rubber Tread
      const treadMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
      const tread = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.024, 0.30), treadMat);
      tread.position.set(0, -0.53, 0.04);
      shoeGroup.add(tread);

      // Midsole Air Cushioning Layer
      const midMat = new THREE.MeshStandardMaterial({
        color: isAI ? 0xff2a55 : 0x00f0ff,
        roughness: 0.35,
        metalness: 0.4
      });
      const midsole = new THREE.Mesh(new THREE.BoxGeometry(0.128, 0.036, 0.29), midMat);
      midsole.position.set(0, -0.505, 0.04);
      shoeGroup.add(midsole);

      // Upper Technical Mesh with Curved Toe Rocker
      const upperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.08, 0.26), upperMat);
      upper.position.set(0, -0.45, 0.03);
      upper.castShadow = true;
      shoeGroup.add(upper);

      // Toe Rocker
      const toeCap = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 12), upperMat);
      toeCap.scale.set(1.0, 0.55, 1.1);
      toeCap.position.set(0, -0.47, 0.16);
      shoeGroup.add(toeCap);

      // Shoe Tongue & Laces
      const laces = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.12),
        new THREE.MeshStandardMaterial({ color: isAI ? 0xff2a55 : 0x0077ff }));
      laces.position.set(0, -0.40, 0.06);
      laces.rotation.x = -0.3;
      shoeGroup.add(laces);

      return shoeGroup;
    };

    // 5. Two-Segment Articulated Legs
    const thighGeo = new THREE.CylinderGeometry(0.076, 0.062, 0.32, 16);
    const calfGeo = new THREE.CylinderGeometry(0.060, 0.046, 0.32, 16);
    const kneeGeo = new THREE.SphereGeometry(0.058, 14, 14);
    const tapeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.7 });

    // Left Leg
    const lLegGroup = new THREE.Group();
    lLegGroup.position.set(-0.13, 0.58, 0);

    const lThigh = new THREE.Mesh(thighGeo, skinMat);
    lThigh.position.y = -0.16;
    lThigh.castShadow = true;
    lLegGroup.add(lThigh);

    const lKnee = new THREE.Mesh(kneeGeo, tapeMat);
    lKnee.position.y = -0.32;
    lLegGroup.add(lKnee);

    const lCalf = new THREE.Mesh(calfGeo, skinMat);
    lCalf.position.y = -0.48;
    lCalf.castShadow = true;
    lLegGroup.add(lCalf);

    const lShoe = createSneaker(true);
    lLegGroup.add(lShoe);
    root.add(lLegGroup);

    // Right Leg
    const rLegGroup = new THREE.Group();
    rLegGroup.position.set(0.13, 0.58, 0);

    const rThigh = new THREE.Mesh(thighGeo, skinMat);
    rThigh.position.y = -0.16;
    rThigh.castShadow = true;
    rLegGroup.add(rThigh);

    const rKnee = new THREE.Mesh(kneeGeo, tapeMat);
    rKnee.position.y = -0.32;
    rLegGroup.add(rKnee);

    const rCalf = new THREE.Mesh(calfGeo, skinMat);
    rCalf.position.y = -0.48;
    rCalf.castShadow = true;
    rLegGroup.add(rCalf);

    const rShoe = createSneaker(false);
    rLegGroup.add(rShoe);
    root.add(rLegGroup);

    // 6. Sculpted Shoulders & Arms
    const deltoidGeo = new THREE.SphereGeometry(0.084, 16, 14);
    const bicepGeo = new THREE.CylinderGeometry(0.052, 0.046, 0.26, 16);
    const elbowGeo = new THREE.SphereGeometry(0.046, 12, 12);
    const forearmGeo = new THREE.CylinderGeometry(0.045, 0.038, 0.25, 16);

    // Left Arm (Counter-balance)
    const lArmGroup = new THREE.Group();
    lArmGroup.position.set(-0.31, 1.22, 0);

    const lDeltoid = new THREE.Mesh(deltoidGeo, jerseyMat);
    lArmGroup.add(lDeltoid);

    const lBicep = new THREE.Mesh(bicepGeo, skinMat);
    lBicep.position.y = -0.16;
    lBicep.castShadow = true;
    lArmGroup.add(lBicep);

    const lElbow = new THREE.Mesh(elbowGeo, skinMat);
    lElbow.position.y = -0.29;
    lArmGroup.add(lElbow);

    const lForearm = new THREE.Mesh(forearmGeo, skinMat);
    lForearm.position.y = -0.42;
    lForearm.castShadow = true;
    lArmGroup.add(lForearm);

    // Left Hand
    const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.06), skinMat);
    lHand.position.y = -0.56;
    lArmGroup.add(lHand);

    root.add(lArmGroup);

    // Right Arm (Hitter / Striking Hand)
    const rArmGroup = new THREE.Group();
    rArmGroup.position.set(0.31, 1.22, 0);

    const rDeltoid = new THREE.Mesh(deltoidGeo, jerseyMat);
    rArmGroup.add(rDeltoid);

    const rBicep = new THREE.Mesh(bicepGeo, skinMat);
    rBicep.position.y = -0.16;
    rBicep.castShadow = true;
    rArmGroup.add(rBicep);

    const rElbow = new THREE.Mesh(elbowGeo, skinMat);
    rElbow.position.y = -0.29;
    rArmGroup.add(rElbow);

    const rForearm = new THREE.Mesh(forearmGeo, skinMat);
    rForearm.position.y = -0.42;
    rForearm.castShadow = true;
    rArmGroup.add(rForearm);

    // Pro Terrycloth Wrist Sweatband
    const sweatbandMat = new THREE.MeshStandardMaterial({
      color: isAI ? 0xff2a55 : 0x00f0ff,
      roughness: 0.85
    });
    const wristband = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.08, 16), sweatbandMat);
    wristband.position.y = -0.48;
    rArmGroup.add(wristband);

    // Sculpted Gripping Hand
    const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.08, 0.065), skinMat);
    rHand.position.y = -0.56;
    rArmGroup.add(rHand);

    // 7. Next-Gen Pro Padel Racket with Twin-Bridge Airflow Throat
    const racketGroup = new THREE.Group();
    racketGroup.position.set(0, -0.62, 0.18);

    // Overgrip Spiral Wrapped Handle
    const gripTex = TextureFactory.createGripTexture();
    const handleMat = new THREE.MeshStandardMaterial({
      map: gripTex,
      roughness: 0.5,
      metalness: 0.1
    });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.026, 0.24, 16), handleMat);
    handle.position.y = 0.12;
    racketGroup.add(handle);

    // Flared Butt Cap
    const capEnd = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.026, 0.03, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 }));
    capEnd.position.y = 0.005;
    racketGroup.add(capEnd);

    // Safety Wrist Lanyard Cord
    const lanyardMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
    const lanyard = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.006, 6, 16), lanyardMat);
    lanyard.position.set(0, 0.02, -0.04);
    lanyard.rotation.x = Math.PI / 3;
    racketGroup.add(lanyard);

    // Aerodynamic Twin-Bridge Throat (Vented Pylons)
    const throatMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.9, roughness: 0.2 });
    const pylonGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.14, 10);
    const pylonL = new THREE.Mesh(pylonGeo, throatMat);
    pylonL.position.set(-0.042, 0.28, 0);
    pylonL.rotation.z = -0.32;
    racketGroup.add(pylonL);

    const pylonR = new THREE.Mesh(pylonGeo, throatMat);
    pylonR.position.set(0.042, 0.28, 0);
    pylonR.rotation.z = 0.32;
    racketGroup.add(pylonR);

    // Perforated Carbon Face (PBR Decal)
    const faceTex = TextureFactory.createRacketFaceTexture(accentHex);
    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      roughness: 0.22,
      metalness: 0.85
    });

    const faceGeo = new THREE.CylinderGeometry(0.22, 0.20, 0.038, 32);
    faceGeo.scale(1.0, 1.0, 1.25);
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.rotation.x = Math.PI / 2;
    face.position.y = 0.44;
    face.castShadow = true;
    racketGroup.add(face);

    // Aerodynamic Chamfered Carbon Bezel
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.95,
      roughness: 0.12
    });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.024, 10, 36), rimMat);
    rim.scale.set(1.0, 1.25, 1.0);
    rim.position.y = 0.44;
    racketGroup.add(rim);

    rArmGroup.add(racketGroup);
    root.add(rArmGroup);

    // Dynamic Contact Shadow
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55 }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.015;
    root.add(shadow);

    const athlete = isAI ? this.ai : this.player;
    athlete.limbs = {
      lLeg: lLegGroup,
      rLeg: rLegGroup,
      lCalf: lCalf,
      rCalf: rCalf,
      lArm: lArmGroup,
      rArm: rArmGroup,
      racket: racketGroup,
      torso: torsoGroup
    };

    return root;
  }

  // --- Ball with 3D Spin Seams & Dynamic Reticle ---
  buildBall() {
    const { colorTex, bumpTex } = TextureFactory.createBallTextures();
    const ballMat = new THREE.MeshStandardMaterial({
      map: colorTex,
      bumpMap: bumpTex,
      bumpScale: 0.05,
      roughness: 0.6,
      metalness: 0.05
    });

    this.ball.mesh = new THREE.Mesh(new THREE.SphereGeometry(this.ballRadius, 32, 32), ballMat);
    this.ball.mesh.castShadow = true;
    this.scene.add(this.ball.mesh);

    // Dynamic Ball Shadow
    this.ball.shadow = new THREE.Mesh(new THREE.CircleGeometry(this.ballRadius * 1.5, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55 }));
    this.ball.shadow.rotation.x = -Math.PI / 2;
    this.ball.shadow.position.y = 0.015;
    this.scene.add(this.ball.shadow);

    // Predicted Landing Target Ring
    this.ball.targetMarker = new THREE.Mesh(
      new THREE.RingGeometry(0.22, 0.32, 32),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    this.ball.targetMarker.rotation.x = -Math.PI / 2;
    this.ball.targetMarker.position.y = 0.02;
    this.scene.add(this.ball.targetMarker);
  }

  // --- Inputs ---
  initInputs() {
    window.addEventListener('keydown', (e) => {
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
        document.getElementById('current-shot').innerText = 'SMASH X3';
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
      this.conn.send({
        type: 'p2_input',
        x: this.ai.pos.x,
        z: this.ai.pos.z,
        rc: this.ai.runCycle,
        sw: true,
        st: (this.ball.pos.x < this.ai.pos.x) ? 'forehand' : 'backhand',
        shot: { power: 0.88, shotType: this.shotType }
      });
      this.startSwingAnimation(this.ai, (this.ball.pos.x < this.ai.pos.x) ? 'forehand' : 'backhand');
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
      this.gameMode = mode;
      if (tabAI) [tabAI, tabOnline, tabLocal].forEach(t => t.classList.remove('active'));
      if (panelAI) [panelAI, panelOnline, panelLocal].forEach(p => p.classList.add('hidden'));

      if (mode === 'ai') {
        if (tabAI) tabAI.classList.add('active');
        if (panelAI) panelAI.classList.remove('hidden');
      } else if (mode === 'online') {
        if (tabOnline) tabOnline.classList.add('active');
        if (panelOnline) panelOnline.classList.remove('hidden');
        this.setupOnlineHost();
      } else if (mode === 'local') {
        if (tabLocal) tabLocal.classList.add('active');
        if (panelLocal) panelLocal.classList.remove('hidden');
      }
    };

    if (tabAI) tabAI.addEventListener('click', () => setModeTab('ai'));
    if (tabOnline) tabOnline.addEventListener('click', () => setModeTab('online'));
    if (tabLocal) tabLocal.addEventListener('click', () => setModeTab('local'));

    // Local 2-Player Play Button
    const btnPlayLocal = document.getElementById('btn-play-local');
    if (btnPlayLocal) {
      btnPlayLocal.addEventListener('click', () => {
        this.gameMode = 'local';
        this.audio.init();
        document.getElementById('start-screen').classList.add('fade-out');
        this.isPlaying = true;
        this.showAnnouncement('¡MODO 2 JUGADORES!', 'P1 (WASD) vs P2 (Flechas + Enter)');
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
            setTimeout(() => btnCopy.innerText = 'Copiar Código', 2000);
          }).catch(() => {
            navigator.clipboard.writeText(this.roomCode);
            btnCopy.innerText = '¡Código Copiado!';
            setTimeout(() => btnCopy.innerText = 'Copiar Código', 2000);
          });
        }
      });
    }

    // Join Room Button
    const btnJoin = document.getElementById('btn-join-room');
    const joinInput = document.getElementById('join-room-input');
    if (btnJoin && joinInput) {
      btnJoin.addEventListener('click', () => {
        const code = joinInput.value.trim().toUpperCase();
        if (code) {
          this.connectToPeer(code);
        }
      });
    }

    // Auto-join from URL parameter (?room=...)
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      setModeTab('online');
      if (joinInput) joinInput.value = roomParam.toUpperCase();
      setTimeout(() => {
        this.connectToPeer(roomParam.toUpperCase());
      }, 600);
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
    this.roomCode = `PADEL-${Math.floor(1000 + Math.random() * 9000)}`;
    const display = document.getElementById('room-code-display');
    if (display) display.innerText = this.roomCode;

    try {
      this.peer = new Peer(this.roomCode, this.getPeerConfig());

      this.peer.on('open', () => {
        const status = document.getElementById('host-status');
        if (status) status.innerText = '🟢 Sala abierta. Esperando que tu amigo se una...';
      });

      this.peer.on('connection', (conn) => {
        this.conn = conn;
        this.gameMode = 'online_host';
        const status = document.getElementById('host-status');
        if (status) status.innerText = '¡Amigo conectado! Entrando a la pista...';

        this.setupDataConnection();

        setTimeout(() => {
          this.audio.init();
          document.getElementById('start-screen').classList.add('fade-out');
          this.isPlaying = true;
          this.showAnnouncement('¡RIVAL ONLINE CONECTADO!', 'Host (Azul) vs Invitado (Rojo)');
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
    if (joinStatus) joinStatus.innerText = 'Conectando con la sala...';

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
            this.showAnnouncement('¡CONECTADO AL HOST!', 'Invitado (Rojo) vs Host (Azul)');
          }, 800);
        });

        this.conn.on('error', () => {
          if (joinStatus) joinStatus.innerText = 'Error al conectar con la sala.';
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
        // Guest receives authoritative state
        this.ball.pos.set(data.b.x, data.b.y, data.b.z);
        this.ball.vel.set(data.b.vx, data.b.vy, data.b.vz);
        this.player.pos.set(data.p1.x, 0, data.p1.z);
        this.player.isSwinging = data.p1.sw;
        this.player.swingType = data.p1.st;
        this.player.runCycle = data.p1.rc;

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
          else if (data.snd === 'glass') this.audio.playGlass(6);
          else if (data.snd === 'bounce') this.audio.playBounce(0.5);
          else if (data.snd === 'whistle') this.audio.playWhistle();
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

          if ((distToRacket <= 1.45 || distToBody <= 1.85) && this.ball.pos.z < -0.25 && this.ball.lastHitter !== 'ai') {
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
      this.showAnnouncement('CONEXIÓN FINALIZADA', 'Tu rival se ha desconectado');
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

      this.ai.pos.x = THREE.MathUtils.clamp(this.ai.pos.x, -this.HALF_W + 0.6, this.HALF_W - 0.6);
      this.ai.pos.z = THREE.MathUtils.clamp(this.ai.pos.z, -this.HALF_L + 0.6, -0.8);
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

        // Exact Hitbox: 1.45m racket reach or 1.85m body reach
        if ((distToP2Racket <= 1.45 || distToP2Body <= 1.85) && this.ball.pos.z < -0.3 && this.ball.lastHitter !== 'ai' && this.ball.pos.y >= 0.10) {
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

  updatePlayer2Guest(dt) {
    const dir = this._v1.set(0, 0, 0);
    if (this.keys['w'] || this.keys['arrowup']) dir.z += 1; // inverted for guest perspective
    if (this.keys['s'] || this.keys['arrowdown']) dir.z -= 1;
    if (this.keys['a'] || this.keys['arrowleft']) dir.x += 1;
    if (this.keys['d'] || this.keys['arrowright']) dir.x += 1;

    const curSpeed = this.ai.speed;
    if (dir.lengthSq() > 0) {
      dir.normalize();
      this.ai.pos.addScaledVector(dir, curSpeed * dt);
      this.ai.runCycle += dt * 14;

      this.ai.pos.x = THREE.MathUtils.clamp(this.ai.pos.x, -this.HALF_W + 0.6, this.HALF_W - 0.6);
      this.ai.pos.z = THREE.MathUtils.clamp(this.ai.pos.z, -this.HALF_L + 0.6, -0.8);
    } else {
      this.ai.runCycle *= 0.8;
    }

    if (this.keys[' '] || this.keys['enter']) {
      this.keys[' '] = false;
      this.keys['enter'] = false;
      if (this.conn && this.conn.open) {
        this.conn.send({
          type: 'p2_input',
          x: this.ai.pos.x,
          z: this.ai.pos.z,
          rc: this.ai.runCycle,
          sw: true,
          st: 'forehand',
          shot: { power: 0.85, shotType: this.shotType }
        });
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

  // --- Serve Flow ---
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

    if (server === 'player') {
      const serveX = this.servingSide * 2.2;
      this.player.pos.set(serveX, 0, 7.8);
      this.ball.pos.set(serveX + 0.32, 0.9, 7.4);
      this.ai.pos.set(-this.servingSide * 2.2, 0, -7.5);
      if (promptEl) {
        promptEl.classList.remove('hidden');
        promptEl.innerHTML = '<span>Presiona <strong>[ESPACIO]</strong> o <strong>[CLIC]</strong> para Servir</span>';
      }
      document.getElementById('serve-player').innerText = '🎾';
      document.getElementById('serve-ai').innerText = '';
    } else {
      const serveX = -this.servingSide * 2.2;
      this.ai.pos.set(serveX, 0, -7.8);
      this.ball.pos.set(serveX - 0.32, 0.9, -7.4);
      this.player.pos.set(this.servingSide * 2.2, 0, 7.5);
      document.getElementById('serve-player').innerText = '';
      document.getElementById('serve-ai').innerText = '🎾';

      if (this.gameMode === 'local') {
        if (promptEl) {
          promptEl.classList.remove('hidden');
          promptEl.innerHTML = '<span>J2: Presiona <strong>[ENTER]</strong> para Servir</span>';
        }
      } else if (this.gameMode === 'online_guest') {
        if (promptEl) {
          promptEl.classList.remove('hidden');
          promptEl.innerHTML = '<span>Tu Saque: Presiona <strong>[ESPACIO / CLIC]</strong></span>';
        }
      } else if (this.gameMode === 'online_host') {
        if (promptEl) {
          promptEl.classList.remove('hidden');
          promptEl.innerHTML = '<span>Esperando Saque del Invitado...</span>';
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

  executeServe() {
    this.pointActive = true;
    const promptEl = document.getElementById('serve-prompt');
    if (promptEl) promptEl.classList.add('hidden');
    this.ball.lastHitter = 'player';
    this.ball.bounceCount = 0;
    this.ball.hitGroundInCourt = false;

    const targetX = -this.servingSide * (1.6 + Math.random() * 1.6);
    const targetZ = -5.8 - Math.random() * 1.5;

    const flightTime = 1.15;
    const vx = (targetX - this.ball.pos.x) / flightTime;
    const vz = (targetZ - this.ball.pos.z) / flightTime;
    const vy = (0.5 * 9.8 * flightTime * flightTime - this.ball.pos.y) / flightTime + 1.1;

    this.ball.vel.set(vx, vy, vz);
    this.ball.spin.set(8.0, 0, 0); // topspin
    this.audio.playHit(0.9, false, true);
    if (this.gameMode === 'online_host') this._pendingSound = 'hit';
    this.startSwingAnimation(this.player, 'forehand');
    this.particles.burst(this.ball.pos, 20, 0x00f0ff, 3.5);
    this.showAnnouncement('¡SERVICIO!', 'Pelota en juego');
    this.showTimingFeedback('SWEET SPOT • SERVICIO', 'perfect');
  }

  executeAIServe() {
    this.pointActive = true;
    const promptEl = document.getElementById('serve-prompt');
    if (promptEl) promptEl.classList.add('hidden');
    this.ball.lastHitter = 'ai';
    this.ball.bounceCount = 0;
    this.ball.hitGroundInCourt = false;

    const targetX = this.servingSide * (1.6 + Math.random() * 1.6);
    const targetZ = 5.8 + Math.random() * 1.5;

    const flightTime = 1.15;
    const vx = (targetX - this.ball.pos.x) / flightTime;
    const vz = (targetZ - this.ball.pos.z) / flightTime;
    const vy = (0.5 * 9.8 * flightTime * flightTime - this.ball.pos.y) / flightTime + 1.1;

    this.ball.vel.set(vx, vy, vz);
    this.ball.spin.set(-8.0, 0, 0);
    this.audio.playHit(0.9, false, true);
    if (this.gameMode === 'online_host') this._pendingSound = 'hit';
    this.startSwingAnimation(this.ai, 'forehand');
    this.particles.burst(this.ball.pos, 20, 0xff2a55, 3.5);
  }

  // --- Continuous Collision Detection (CCD) Racket Hitbox Engine ---
  triggerPlayerShot() {
    this.isChargingPower = false;
    const power = Math.max(0.45, this.power);
    this.power = 0.5;
    document.getElementById('power-bar').style.width = '0%';

    // Racket Head Hitbox World Position
    this.player.limbs.racket.getWorldPosition(this._rHead);
    this.player.racketHitbox.pos.copy(this._rHead);

    // Natural Strike Reach Envelope:
    const distToBody = this.player.pos.distanceTo(this.ball.pos);
    const distToHead = this._rHead.distanceTo(this.ball.pos);
    const timeOffset = (this.ball.pos.z - this.player.pos.z); // negative = in front, positive = behind
    const heightDelta = Math.abs(this.ball.pos.y - 1.05);

    const isSmash = (this.shotType === 'SMASH' && this.ball.pos.y > 1.5);
    const maxReach = isSmash ? 2.1 : (this.keys['shift'] ? 1.95 : 1.80);

    const inStrikeZone = (distToBody <= maxReach || distToHead <= 1.45) &&
                         this.ball.pos.z > -0.35 &&
                         timeOffset < 0.65 &&
                         this.ball.pos.y >= 0.10 &&
                         this.ball.lastHitter !== 'player';

    if (inStrikeZone) {
      const swingType = (this.ball.pos.x > this.player.pos.x) ? 'forehand' : 'backhand';
      this.startSwingAnimation(this.player, swingType);

      // Sweet Spot Analysis
      let isSweetSpot = false;
      let timingLabel = 'BUEN GOLPE';
      let timingClass = 'perfect';

      if ((distToHead <= 0.58 || (distToBody >= 0.7 && distToBody <= 1.35)) && heightDelta <= 0.65 && Math.abs(timeOffset + 0.25) <= 0.45) {
        isSweetSpot = true;
        timingLabel = 'SWEET SPOT • ¡IMPACTO PERFECTO!';
        timingClass = 'perfect';
      } else if (timeOffset < -0.45) {
        timingLabel = 'GOLPE ANTICIPADO (CRUZADO)';
        timingClass = 'early';
      } else if (timeOffset > 0.25) {
        timingLabel = 'GOLPE RETRASADO (FORZADO)';
        timingClass = 'late';
      } else {
        timingLabel = 'IMPACTO DESCENTRADO';
        timingClass = 'early';
      }

      this.showTimingFeedback(timingLabel, timingClass);
      this.executeHitWithHitbox('player', power, timeOffset, isSweetSpot);
    } else {
      // Missed swing / Air swing
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

    // Directional aim calculation based on timing
    let targetX = (Math.random() - 0.5) * 5.0;

    // Early contact pulls cross-court, late contact pushes down the line
    if (hitter === 'player') {
      if (this.keys['a'] || this.keys['arrowleft']) targetX = -3.2;
      else if (this.keys['d'] || this.keys['arrowright']) targetX = 3.2;
      else if (timingOffset < -0.4) targetX *= -1.2;
    }
    targetX = THREE.MathUtils.clamp(targetX, -this.HALF_W + 0.85, this.HALF_W - 0.85);

    let targetZ = (hitter === 'player') ? (-7.2 - Math.random() * 1.8) : (7.2 + Math.random() * 1.8);
    let flightTime = 1.08;
    let extraArc = 1.2;

    if (isSmash) {
      flightTime = 0.72;
      extraArc = -0.6;
      this.showAnnouncement('¡SMASH X3!', 'Remate potente al cristal');
      this.particles.burst(this.ball.pos, 35, 0xff0055, 6.0);
    } else if (isLob) {
      flightTime = 1.60;
      extraArc = 6.2;
      this.showAnnouncement('¡GLOBO ALTO!', 'Buscando el fondo de pista');
      this.particles.burst(this.ball.pos, 20, 0x00f0ff, 3.5);
    } else {
      if (isSweetSpot) {
        flightTime = 0.95;
        this.particles.burst(this.ball.pos, 30, 0x00ffaa, 5.0);
      } else {
        this.particles.burst(this.ball.pos, 15, 0xffea00, 3.0);
      }
    }

    const vx = (targetX - this.ball.pos.x) / flightTime;
    const vz = (targetZ - this.ball.pos.z) / flightTime;
    const vy = (0.5 * 9.8 * flightTime * flightTime - this.ball.pos.y) / flightTime + extraArc;

    this.ball.vel.set(vx, vy, vz);

    // Ball 3D Angular Velocity (Spin)
    const spinRate = isSmash ? 18.0 : (isLob ? -12.0 : 10.0);
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

  // --- Point Evaluation & Padel Rules ---
  awardPoint(winner, reason = '') {
    if (!this.pointActive) return;
    this.pointActive = false;
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

    if (this.scorePlayer >= 4 && this.scorePlayer - this.scoreAI >= 1) {
      this.gamesPlayer++;
      this.scorePlayer = 0; this.scoreAI = 0;
      this.showAnnouncement(`¡JUEGO PARA ${p1Label}!`, 'Consigue el juego');
    } else if (this.scoreAI >= 4 && this.scoreAI - this.scorePlayer >= 1) {
      this.gamesAI++;
      this.scorePlayer = 0; this.scoreAI = 0;
      this.showAnnouncement(`¡JUEGO PARA ${p2Label}!`, 'Consigue el juego');
    }

    // Freeze ball during celebration to prevent race conditions
    this.ball.vel.set(0, 0, 0);

    this.servingSide = -this.servingSide;
    this.updateHUD();

    const nextServer = (winner === 'player') ? 'player' : 'ai';
    setTimeout(() => {
      this.prepareServe(nextServer);
    }, 2200);
  }

  formatScore(pts) {
    if (pts === 0) return '0';
    if (pts === 1) return '15';
    if (pts === 2) return '30';
    if (pts === 3) return '40';
    return 'ADV';
  }

  updateHUD() {
    document.getElementById('pts-player').innerText = this.formatScore(this.scorePlayer);
    document.getElementById('pts-ai').innerText = this.formatScore(this.scoreAI);
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

  // --- Physics Loop with Continuous Collision Detection ---
  updatePhysics(dt) {
    if (!this.pointActive) return;

    this.ball.prevPos.copy(this.ball.pos);

    // Gravity & Air Resistance
    const GRAVITY = -9.8;
    this.ball.vel.y += GRAVITY * dt;
    this.ball.vel.x *= (1 - 0.02 * dt);
    this.ball.vel.z *= (1 - 0.02 * dt);

    this.ball.pos.addScaledVector(this.ball.vel, dt);

    // Ball 3D Rotation based on Spin Vector
    this.ball.mesh.rotation.x += this.ball.spin.x * dt;
    this.ball.mesh.rotation.y += this.ball.spin.y * dt;
    this.ball.mesh.rotation.z += this.ball.spin.z * dt;

    const speedKmH = Math.round(this.ball.vel.length() * 3.6);
    document.getElementById('ball-speed').innerHTML = `${speedKmH} <small>km/h</small>`;

    // 1. Turf Bounce (Y <= ballRadius)
    if (this.ball.pos.y <= this.ballRadius) {
      this.ball.pos.y = this.ballRadius;
      this.ball.vel.y = -this.ball.vel.y * 0.74; // Restitution
      this.audio.playBounce(Math.abs(this.ball.vel.y) / 8);
      if (this.gameMode === 'online_host') this._pendingSound = 'bounce';

      // Dust puff particles on turf impact
      this.particles.burst(this.ball.pos, 8, 0x88ccff, 2.0);

      const inCourtX = Math.abs(this.ball.pos.x) <= this.HALF_W;
      const inCourtZ = Math.abs(this.ball.pos.z) <= this.HALF_L;

      if (!inCourtX || !inCourtZ) {
        const winner = (this.ball.lastHitter === 'player') ? 'ai' : 'player';
        this.awardPoint(winner, '¡Pelota Fuera (OUT)!');
        return;
      }

      this.ball.hitGroundInCourt = true;
      const currentSide = (this.ball.pos.z > 0) ? 'player' : 'ai';

      // Own court bounce fault rule:
      // If the ball hits the ground on the hitter's own side of the net on the first bounce
      if (this.ball.lastHitter && this.ball.lastHitter === currentSide && this.ball.bounceCount === 0) {
        const winner = (this.ball.lastHitter === 'player') ? 'ai' : 'player';
        this.awardPoint(winner, 'Bote en campo propio (Falta)');
        return;
      }

      this.ball.bounceCount++;

      if (this.ball.bounceCount >= 2) {
        const winner = (currentSide === 'player') ? 'ai' : 'player';
        this.awardPoint(winner, 'Doble bote en pista');
        return;
      }
    }

    // 2. Back Glass Wall Collisions (Z = +/-10m)
    if (this.ball.pos.z >= this.HALF_L - this.ballRadius) {
      this.ball.pos.z = this.HALF_L - this.ballRadius;
      this.ball.vel.z = -this.ball.vel.z * 0.82;
      this.audio.playGlass(Math.abs(this.ball.vel.z));
      if (this.gameMode === 'online_host') this._pendingSound = 'glass';
      this.particles.burst(this.ball.pos, 12, 0x9be8ff, 3.0);

      if (!this.ball.hitGroundInCourt && this.ball.lastHitter === 'ai') {
        this.awardPoint('player', 'Cristal directo (OUT)');
        return;
      }
    } else if (this.ball.pos.z <= -this.HALF_L + this.ballRadius) {
      this.ball.pos.z = -this.HALF_L + this.ballRadius;
      this.ball.vel.z = -this.ball.vel.z * 0.82;
      this.audio.playGlass(Math.abs(this.ball.vel.z));
      if (this.gameMode === 'online_host') this._pendingSound = 'glass';
      this.particles.burst(this.ball.pos, 12, 0x9be8ff, 3.0);

      if (!this.ball.hitGroundInCourt && this.ball.lastHitter === 'player') {
        this.awardPoint('ai', 'Cristal directo (OUT)');
        return;
      }
    }

    // 3. Side Walls (X = +/-5m)
    if (Math.abs(this.ball.pos.x) >= this.HALF_W - this.ballRadius) {
      const sign = Math.sign(this.ball.pos.x);
      this.ball.pos.x = sign * (this.HALF_W - this.ballRadius);
      this.ball.vel.x = -this.ball.vel.x * 0.80;
      this.audio.playGlass(Math.abs(this.ball.vel.x));
      if (this.gameMode === 'online_host') this._pendingSound = 'glass';
      this.particles.burst(this.ball.pos, 8, 0x9be8ff, 2.5);

      const currentSide = (this.ball.pos.z > 0) ? 'player' : 'ai';
      if (!this.ball.hitGroundInCourt && this.ball.lastHitter && this.ball.lastHitter !== currentSide) {
        const winner = (this.ball.lastHitter === 'player') ? 'ai' : 'player';
        this.awardPoint(winner, 'Pared lateral directa (OUT)');
        return;
      }
    }

    // 4. Continuous Collision Detection (CCD) Net Check (Z crosses 0 while Y < NET_H)
    const crossedNet = (this.ball.prevPos.z * this.ball.pos.z <= 0);
    if ((crossedNet || Math.abs(this.ball.pos.z) < 0.20) && this.ball.pos.y < this.NET_H) {
      this.ball.pos.z = (this.ball.prevPos.z > 0) ? 0.16 : -0.16;
      this.ball.vel.z = -this.ball.vel.z * 0.25;
      this.ball.vel.y *= 0.4;
      this.audio.playBounce(0.4);
      if (this.gameMode === 'online_host') this._pendingSound = 'bounce';

      const winner = (this.ball.lastHitter === 'player') ? 'ai' : 'player';
      this.awardPoint(winner, 'Pelota atrapada en la red');
      return;
    }

    // Synchronize Ball & Shadow
    this.ball.mesh.position.copy(this.ball.pos);
    this.ball.shadow.position.set(this.ball.pos.x, 0.015, this.ball.pos.z);
    const sScale = Math.max(0.4, 1.0 - (this.ball.pos.y / 5.5));
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
        // Ball approaching AI court: anticipate landing intercept
        const targetZ = -6.8;
        const timeToZ = Math.max(0.05, (this.ball.pos.z - targetZ) / Math.max(Math.abs(this.ball.vel.z), 1));
        const futureX = THREE.MathUtils.clamp(
          this.ball.pos.x + this.ball.vel.x * timeToZ,
          -this.HALF_W + 0.9,
          this.HALF_W - 0.9
        );
        this.ai.targetPos.set(futureX, 0, targetZ);
      } else {
        // Ball on player side: AI recovers to center baseline
        this.ai.targetPos.set(0, 0, -7.5);
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

      // AI Return Strike (Precise Natural Hitbox)
      if (this.ai.limbs && this.ai.limbs.racket) {
        this.ai.limbs.racket.getWorldPosition(this._rHead);
        const distToAIRacket = this._rHead.distanceTo(this.ball.pos);
        const distToAIBody = this.ai.pos.distanceTo(this.ball.pos);

        if ((distToAIRacket <= 1.45 || distToAIBody <= 1.85) && this.ball.pos.z < -0.35 && this.ball.lastHitter !== 'ai' && this.ball.pos.y >= 0.12) {
          const swingType = (this.ball.pos.x < this.ai.pos.x) ? 'forehand' : 'backhand';
          this.startSwingAnimation(this.ai, swingType);
          const aiPower = 0.70 + Math.random() * 0.30;
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

      this.player.pos.x = THREE.MathUtils.clamp(this.player.pos.x, -this.HALF_W + 0.6, this.HALF_W - 0.6);
      this.player.pos.z = THREE.MathUtils.clamp(this.player.pos.z, 0.8, this.HALF_L - 0.6);
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

  // --- Pro Character Animations (Run Cycle & Explosive Swing) ---
  animateCharacter(char, dt, isAI) {
    const limbs = char.limbs;
    if (!limbs) return;

    // Running leg/arm stride
    const runAngle = Math.sin(char.runCycle) * 0.68;
    limbs.lLeg.rotation.x = runAngle;
    limbs.rLeg.rotation.x = -runAngle;
    limbs.lArm.rotation.x = -runAngle * 0.7;

    // Dynamic knee flexion during running
    if (limbs.lCalf) limbs.lCalf.rotation.x = Math.max(0, -runAngle * 0.85);
    if (limbs.rCalf) limbs.rCalf.rotation.x = Math.max(0, runAngle * 0.85);

    // Explosive Torso & Arm Swing
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
        // Perspective from Guest baseline (looking forward toward host)
        this._camTarget.set(
          this.ai.pos.x * 0.35,
          4.0 + Math.max(0, (this.ball.pos.y - 1.2) * 0.25),
          this.ai.pos.z - 5.8
        );
        this.camera.position.lerp(this._camTarget, dt * 5.5);
        this.camera.lookAt(this.ball.pos.x * 0.3, 1.1, 0);
      } else {
        // Host / Solo Perspective
        this._camTarget.set(
          this.player.pos.x * 0.35,
          4.0 + Math.max(0, (this.ball.pos.y - 1.2) * 0.25),
          this.player.pos.z + 5.8
        );
        this.camera.position.lerp(this._camTarget, dt * 5.5);
        this.camera.lookAt(this.ball.pos.x * 0.3, 1.1, 0);
      }
    } else if (this.cameraMode === 'broadcast') {
      this._camTarget.set(12.0, 5.8, 0);
      this.camera.position.lerp(this._camTarget, dt * 4.0);
      this.camera.lookAt(this.ball.pos.x * 0.5, 0.9, this.ball.pos.z * 0.5);
    } else if (this.cameraMode === 'top') {
      this._camTarget.set(0, 23.0, 1.0);
      this.camera.position.lerp(this._camTarget, dt * 4.0);
      this.camera.lookAt(0, 0, 0);
    }
  }

  // --- 2D Realtime Minimap ---
  drawMinimap() {
    const c = document.getElementById('minimap');
    if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width, h = c.height;

    ctx.fillStyle = '#061325';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(4, h / 2); ctx.lineTo(w - 4, h / 2);
    ctx.stroke();

    const toX = (x) => 4 + ((x + this.HALF_W) / this.COURT_W) * (w - 8);
    const toY = (z) => 4 + ((z + this.HALF_L) / this.COURT_L) * (h - 8);

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

window.addEventListener('DOMContentLoaded', () => {
  window.padelGame = new PadelGameEngine();
});
