/**
 * ============================================================================
 * MUHAIMAN - 3D CYBERPUNK PORTFOLIO CORE ENGINE (main.js)
 * Production-Ready Three.js Scenes, Interactive Controllers & Cyber Systems
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. STATE & GLOBAL CONFIGURATION
  // --------------------------------------------------------------------------
  const State = {
    audioEnabled: false,
    highQuality: true,
    isMobile: window.innerWidth < 768,
    activeCategory: 'all',
    activeProjectFilter: 'all',
  };

  // Audio Synthesizer Context (Web Audio API - Zero External Audio Files Needed)
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playCyberTone(freq = 440, type = 'sine', duration = 0.08, gainVal = 0.05) {
    if (!State.audioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // --------------------------------------------------------------------------
  // 2. THREE.JS BACKGROUND SCENE: PARTICLE CONSTELLATION & FLOATING GEOMETRY
  // --------------------------------------------------------------------------
  const bgCanvas = document.getElementById('bg-canvas');
  let bgRenderer, bgScene, bgCamera;
  let bgParticleSystem, bgGeometries = [];
  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;

  function initBackgroundScene() {
    if (!bgCanvas || typeof THREE === 'undefined') return;

    bgScene = new THREE.Scene();
    bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    bgCamera.position.z = 400;

    bgRenderer = new THREE.WebGLRenderer({
      canvas: bgCanvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance'
    });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, State.highQuality ? 1.5 : 1));

    // Particle Constellation
    const particleCount = State.isMobile ? 400 : 1000;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorCyan = new THREE.Color(0x00f3ff);
    const colorPurple = new THREE.Color(0xd946ef);
    const colorBlue = new THREE.Color(0x3b82f6);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 800;

      // Color variation
      const rand = Math.random();
      const chosenColor = rand < 0.5 ? colorCyan : (rand < 0.8 ? colorPurple : colorBlue);
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: State.isMobile ? 2.5 : 3.0,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    bgParticleSystem = new THREE.Points(particleGeo, particleMat);
    bgScene.add(bgParticleSystem);

    // Drifting 3D Wireframe Polyhedra
    const shapes = [
      new THREE.IcosahedronGeometry(25, 0),
      new THREE.OctahedronGeometry(20, 0),
      new THREE.TetrahedronGeometry(22, 0),
      new THREE.DodecahedronGeometry(18, 0)
    ];

    const shapeMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });

    const shapeCount = State.isMobile ? 4 : 8;
    for (let i = 0; i < shapeCount; i++) {
      const geo = shapes[i % shapes.length];
      const mesh = new THREE.Mesh(geo, shapeMat.clone());
      mesh.position.set(
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 400
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.008,
        rotSpeedY: (Math.random() - 0.5) * 0.008,
        floatSpeed: 0.001 + Math.random() * 0.002,
        baseY: mesh.position.y
      };
      bgGeometries.push(mesh);
      bgScene.add(mesh);
    }

    // Parallax mouse listeners
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.15;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.15;
    });

    window.addEventListener('resize', onBackgroundResize);
  }

  function onBackgroundResize() {
    if (!bgRenderer || !bgCamera) return;
    State.isMobile = window.innerWidth < 768;
    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animateBackgroundScene(time) {
    if (!bgRenderer || !bgScene || !bgCamera) return;

    // Smooth camera parallax interpolation
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;
    bgCamera.position.x = targetX;
    bgCamera.position.y = -targetY;
    bgCamera.lookAt(bgScene.position);

    // Slowly rotate particle field
    if (bgParticleSystem) {
      bgParticleSystem.rotation.y = time * 0.0001;
      bgParticleSystem.rotation.x = time * 0.00005;
    }

    // Animate drifting geometric shapes
    bgGeometries.forEach((mesh) => {
      mesh.rotation.x += mesh.userData.rotSpeedX;
      mesh.rotation.y += mesh.userData.rotSpeedY;
      mesh.position.y = mesh.userData.baseY + Math.sin(time * mesh.userData.floatSpeed) * 20;
    });

    bgRenderer.render(bgScene, bgCamera);
  }

  // --------------------------------------------------------------------------
  // 3. THREE.JS HERO INTERACTIVE 3D CORE CANVAS & ORBIT CONTROLS
  // --------------------------------------------------------------------------
  const heroCanvas = document.getElementById('hero-core-canvas');
  let heroRenderer, heroScene, heroCamera;
  let heroCoreGroup, outerMesh, innerSphere, ring1, ring2, corePoints;
  let heroPointLight1, heroPointLight2;

  // Custom Smooth Drag / Orbit Controller State
  const orbitState = {
    isDragging: false,
    prevX: 0,
    prevY: 0,
    velX: 0,
    velY: 0,
    rotX: 0.2,
    rotY: 0.4,
    autoSpinSpeed: 0.008
  };

  function initHeroCoreScene() {
    if (!heroCanvas || typeof THREE === 'undefined') return;

    const rect = heroCanvas.getBoundingClientRect();
    const width = rect.width || 380;
    const height = rect.height || 380;

    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    heroCamera.position.z = 7.5;

    heroRenderer = new THREE.WebGLRenderer({
      canvas: heroCanvas,
      alpha: true,
      antialias: State.highQuality,
      powerPreference: 'high-performance'
    });
    heroRenderer.setSize(width, height);
    heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, State.highQuality ? 2 : 1));

    // Master Group for smooth rotational control
    heroCoreGroup = new THREE.Group();
    heroScene.add(heroCoreGroup);

    // 1. Outer Geodesic Sci-Fi Icosahedron Wireframe
    const outerGeo = new THREE.IcosahedronGeometry(2.2, 1);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x005577,
      emissiveIntensity: 0.4
    });
    outerMesh = new THREE.Mesh(outerGeo, outerMat);
    heroCoreGroup.add(outerMesh);

    // 2. Inner Glowing Energy Core
    const innerGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xd946ef,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0x770088,
      emissiveIntensity: 0.6
    });
    innerSphere = new THREE.Mesh(innerGeo, innerMat);
    heroCoreGroup.add(innerSphere);

    // 3. Dual Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(2.7, 0.035, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    heroCoreGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.9, 0.03, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xd946ef,
      wireframe: true,
      transparent: true,
      opacity: 0.75
    });
    ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    heroCoreGroup.add(ring2);

    // 4. Swarming Core Telemetry Particles
    const corePCount = 200;
    const corePGeo = new THREE.BufferGeometry();
    const corePPos = new Float32Array(corePCount * 3);
    for (let i = 0; i < corePCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.4 + Math.random() * 0.8;
      corePPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      corePPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      corePPos[i * 3 + 2] = r * Math.cos(phi);
    }
    corePGeo.setAttribute('position', new THREE.BufferAttribute(corePPos, 3));
    const corePMat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0x00ff9d,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9
    });
    corePoints = new THREE.Points(corePGeo, corePMat);
    heroCoreGroup.add(corePoints);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    heroScene.add(ambientLight);

    heroPointLight1 = new THREE.PointLight(0x00f3ff, 2.5, 20);
    heroPointLight1.position.set(4, 4, 4);
    heroScene.add(heroPointLight1);

    heroPointLight2 = new THREE.PointLight(0xd946ef, 2.5, 20);
    heroPointLight2.position.set(-4, -4, 4);
    heroScene.add(heroPointLight2);

    // Interactive Drag / Orbit Event Listeners
    setupHeroCanvasControls();

    window.addEventListener('resize', onHeroCanvasResize);
  }

  function setupHeroCanvasControls() {
    if (!heroCanvas) return;

    const onPointerDown = (e) => {
      orbitState.isDragging = true;
      orbitState.prevX = e.clientX || (e.touches && e.touches[0].clientX);
      orbitState.prevY = e.clientY || (e.touches && e.touches[0].clientY);
      orbitState.velX = 0;
      orbitState.velY = 0;
      playCyberTone(600, 'triangle', 0.05, 0.04);
    };

    const onPointerMove = (e) => {
      if (!orbitState.isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const deltaX = clientX - orbitState.prevX;
      const deltaY = clientY - orbitState.prevY;

      orbitState.velX = deltaX * 0.005;
      orbitState.velY = deltaY * 0.005;

      orbitState.rotY += orbitState.velX;
      orbitState.rotX += orbitState.velY;

      orbitState.prevX = clientX;
      orbitState.prevY = clientY;
    };

    const onPointerUp = () => {
      orbitState.isDragging = false;
    };

    heroCanvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    heroCanvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Hover flair
    heroCanvas.addEventListener('mouseenter', () => {
      orbitState.autoSpinSpeed = 0.015;
      if (outerMesh) outerMesh.material.emissiveIntensity = 0.8;
    });

    heroCanvas.addEventListener('mouseleave', () => {
      orbitState.autoSpinSpeed = 0.008;
      if (outerMesh) outerMesh.material.emissiveIntensity = 0.4;
    });
  }

  function onHeroCanvasResize() {
    if (!heroCanvas || !heroRenderer || !heroCamera) return;
    const stage = document.getElementById('hero-3d-stage');
    if (!stage) return;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    heroCamera.aspect = width / height;
    heroCamera.updateProjectionMatrix();
    heroRenderer.setSize(width, height);
  }

  function animateHeroCoreScene(time) {
    if (!heroRenderer || !heroScene || !heroCamera || !heroCoreGroup) return;

    // Apply auto rotation when not dragging
    if (!orbitState.isDragging) {
      orbitState.rotY += orbitState.autoSpinSpeed;
      orbitState.velX *= 0.95;
      orbitState.velY *= 0.95;
      orbitState.rotY += orbitState.velX;
      orbitState.rotX += orbitState.velY;
    }

    heroCoreGroup.rotation.y = orbitState.rotY;
    heroCoreGroup.rotation.x = orbitState.rotX;

    // Independent orbital ring rotations
    if (ring1) {
      ring1.rotation.z += 0.01;
      ring1.rotation.x += 0.005;
    }
    if (ring2) {
      ring2.rotation.z -= 0.012;
      ring2.rotation.y += 0.008;
    }

    // Inner core pulsation
    if (innerSphere) {
      const pulse = 1.0 + Math.sin(time * 0.004) * 0.06;
      innerSphere.scale.set(pulse, pulse, pulse);
    }

    // Swarming particles
    if (corePoints) {
      corePoints.rotation.y -= 0.005;
    }

    heroRenderer.render(heroScene, heroCamera);
  }

  // Master Unified Animation Loop
  function masterLoop(time) {
    requestAnimationFrame(masterLoop);
    animateBackgroundScene(time);
    animateHeroCoreScene(time);
  }

  // --------------------------------------------------------------------------
  // 4. DYNAMIC TYPING EFFECT
  // --------------------------------------------------------------------------
  const titles = [
    'Software Engineer',
    'AI Engineer',
    'Web Developer',
    'Graphic Designer',
    'Cybersecurity Specialist'
  ];

  let titleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingEl = document.getElementById('typing-text');

  function typeEffect() {
    if (!typingEl) return;

    const currentTitle = titles[titleIndex];
    if (isDeleting) {
      typingEl.textContent = currentTitle.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingEl.textContent = currentTitle.substring(0, charIndex + 1);
      charIndex++;
    }

    let typeSpeed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === currentTitle.length) {
      typeSpeed = 1800; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      titleIndex = (titleIndex + 1) % titles.length;
      typeSpeed = 400; // Pause before next word
    }

    setTimeout(typeEffect, typeSpeed);
  }

  // --------------------------------------------------------------------------
  // 5. 3D TILT EFFECT ON HOVER CARDS
  // --------------------------------------------------------------------------
  function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. INTERACTIVE SKILLS MATRIX FILTER
  // --------------------------------------------------------------------------
  function initSkillsFilter() {
    const filterBtns = document.querySelectorAll('.skill-filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => {
          b.classList.remove('active', 'border-cyan-400', 'bg-cyan-950/60', 'text-cyan-300', 'shadow-[0_0_15px_rgba(0,243,255,0.3)]');
          b.classList.add('border-slate-800', 'bg-slate-900/60', 'text-slate-400');
        });

        btn.classList.add('active', 'border-cyan-400', 'bg-cyan-950/60', 'text-cyan-300', 'shadow-[0_0_15px_rgba(0,243,255,0.3)]');
        btn.classList.remove('border-slate-800', 'bg-slate-900/60', 'text-slate-400');

        const category = btn.getAttribute('data-category');
        playCyberTone(500, 'sine', 0.04, 0.03);

        skillCards.forEach((card) => {
          const cardCats = card.getAttribute('data-category').split(' ');
          if (category === 'all' || cardCats.includes(category)) {
            card.style.display = 'block';
            card.style.opacity = '0';
            setTimeout(() => { card.style.opacity = '1'; }, 20);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // --------------------------------------------------------------------------
  // 7. INTERACTIVE TERMINAL SIMULATOR
  // --------------------------------------------------------------------------
  const terminalCommands = {
    help: `AVAILABLE COMMANDS:
- help       : List all terminal commands
- skills     : Print technical skills & proficiency matrix
- services   : List all 5 core engineering services
- bio        : Display architect dossier & background
- socials    : View verified GitHub & LinkedIn profile endpoints
- clear      : Clear terminal screen buffer`,

    skills: `TECHNICAL PROTOCOLS:
[+] AI/ML       : Python, PyTorch, LangChain, RAG Swarms, OpenAI
[+] WEB         : React, Next.js, TypeScript, Three.js, Node.js, GraphQL
[+] CYBERSEC    : Linux Hardening, OWASP, Pen-Testing, Zero-Trust
[+] VISUAL/3D   : Blender 3D, WebGL Shaders, Figma, Adobe Photoshop`,

    services: `CORE ENGINEERING SERVICES:
1. Autonomous AI Agents & Custom LLM Orchestration
2. Next-Gen Modern Websites
3. Interactive 3D Portfolio Websites
4. Robust Scalable RESTful & GraphQL APIs
5. Website Upgrades, Modernization & Performance Tuning`,

    bio: `DOSSIER: MUHAIMAN
OPERATOR ROLE: Principal Software Engineer & AI Architect
CORE MISSION : Bridging intelligent autonomous agent swarms, spatial 3D WebGL interfaces, and hardened zero-trust infrastructure to deliver next-generation digital products.`,

    socials: `DIRECT PROFILE ENDPOINTS:
- LinkedIn : https://www.linkedin.com/in/atta-ul-muhaiman
- GitHub   : https://github.com/muhaimanawan
- WhatsApp : +92 302 1173377 (https://wa.me/923021173377)
- Uplink   : attaulmuhaiman@gmail.com`,

    clear: 'CLEAR'
  };

  function initTerminalSimulator() {
    const form = document.getElementById('terminal-form');
    const input = document.getElementById('terminal-input');
    const body = document.getElementById('terminal-body');
    const quickBtns = document.querySelectorAll('.terminal-quick-btn');

    if (!form || !input || !body) return;

    function executeCommand(cmdRaw) {
      const cmd = cmdRaw.trim().toLowerCase();
      playCyberTone(750, 'square', 0.03, 0.02);

      if (cmd === 'clear') {
        body.innerHTML = `
          <div class="text-slate-500">// Terminal screen cleared.</div>
          <div class="text-cyan-400">&gt; System ready. Type 'help' for commands.</div>
        `;
        return;
      }

      // Append prompt
      const promptLine = document.createElement('div');
      promptLine.className = 'text-cyan-400 font-bold';
      promptLine.textContent = `visitor@muhaiman:~$ ${cmdRaw}`;
      body.appendChild(promptLine);

      // Append response
      const responseLine = document.createElement('pre');
      responseLine.className = 'text-slate-300 whitespace-pre-wrap font-mono mt-1 text-xs';

      if (terminalCommands[cmd]) {
        responseLine.textContent = terminalCommands[cmd];
        responseLine.classList.add('text-emerald-400');
      } else if (cmd === '') {
        // empty input
      } else {
        responseLine.textContent = `bash: command not found: ${cmdRaw}. Type 'help' for available commands.`;
        responseLine.classList.add('text-red-400');
      }

      body.appendChild(responseLine);
      body.scrollTop = body.scrollHeight;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value;
      if (!val) return;
      executeCommand(val);
      input.value = '';
    });

    quickBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        input.value = cmd;
        executeCommand(cmd);
        input.value = '';
      });
    });
  }

  // --------------------------------------------------------------------------
  // 8. PROJECT SHOWCASE FILTER & BLUEPRINT MODAL
  // --------------------------------------------------------------------------
  const projectBlueprints = [
    {
      title: 'AegisAgent Multi-LLM Swarm',
      category: 'Autonomous AI Agents',
      specs: 'Python 3.11 / LangChain / ChromaDB / FastAPI / Docker',
      metrics: '350ms RAG Latency // 99.4% Factual Precision // 10k Context Memory',
      description: 'An enterprise-grade autonomous multi-agent pipeline designed to orchestrate cooperative LLM agents. Features long-term vector memory retrieval, real-time tool calling, and automated fact-checking loops for mission-critical industrial workflows.',
      linkDemo: 'https://github.com/muhaimanawan',
      linkSource: 'https://github.com/muhaimanawan'
    },
    {
      title: 'NeonVerse 3D Cyber Engine',
      category: '3D WebGL & Three.js',
      specs: 'Three.js / WebGL / GLSL Shaders / TypeScript / Cannon.js',
      metrics: '60 FPS Ultra / GPU LOD Scaling / 1.2MB Total Asset Bundle',
      description: 'An interactive 3D spatial web showcase featuring custom GLSL lighting shaders, real-time particle dynamics, and responsive physics-driven interactions with low-polygon mobile fallbacks.',
      linkDemo: 'https://github.com/muhaimanawan',
      linkSource: 'https://github.com/muhaimanawan'
    },
    {
      title: 'NexusAPI High-Throughput Gateway',
      category: 'Full-Stack Distributed APIs',
      specs: 'Node.js / GraphQL / Redis / PostgreSQL / Docker Swarm',
      metrics: '100,000+ Req/Sec // Sub-10ms Cache Hits // Zero-Downtime Rolling Deploys',
      description: 'A distributed GraphQL and REST gateway managing high-concurrency microservice communication. Features sliding-window rate limiting, JWT authentication, and automatic schema stitching.',
      linkDemo: 'https://github.com/muhaimanawan',
      linkSource: 'https://github.com/muhaimanawan'
    },
    {
      title: 'CyberSentinel Vulnerability Engine',
      category: 'Cybersecurity & Defense',
      specs: 'Python / Scapy / Linux / OWASP Top 10 / Wireshark',
      metrics: 'Zero False Positives in Core Checks // Automated Audit Reports',
      description: 'A real-time network anomaly detector and automated vulnerability auditing platform integrating Scapy packet analysis and heuristic threat mitigation for cloud servers.',
      linkDemo: 'https://github.com/muhaimanawan',
      linkSource: 'https://github.com/muhaimanawan'
    },
    {
      title: 'SynapseStudio Creative Workspace',
      category: 'Generative AI & Visual Design',
      specs: 'React 18 / Stable Diffusion / Tailwind CSS / WebSockets',
      metrics: 'Sub-2s Generation Loop // Vector Export / Custom Latent Canvas',
      description: 'A hybrid generative design canvas marrying Stable Diffusion image models with HTML5 canvas vector tooling for rapid UI/UX branding creation.',
      linkDemo: 'https://github.com/muhaimanawan',
      linkSource: 'https://github.com/muhaimanawan'
    },
    {
      title: 'TitanCloud Web Architecture Overhaul',
      category: 'Modernization & Performance',
      specs: 'Next.js 14 / Turbopack / Redis / Modern CSS Systems',
      metrics: '100/100 Lighthouse // 78% Bundle Reduction // Sub-Second FCP',
      description: 'A complete modernization of a monolithic enterprise legacy platform into modular micro-frontends, reducing total bundle size by 78% and elevating Core Web Vitals to top decile.',
      linkDemo: 'https://github.com/muhaimanawan',
      linkSource: 'https://github.com/muhaimanawan'
    }
  ];

  function initProjectsSystem() {
    const filterBtns = document.querySelectorAll('.project-filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => {
          b.classList.remove('active', 'border-cyan-400', 'bg-cyan-950/60', 'text-cyan-300', 'shadow-[0_0_15px_rgba(0,243,255,0.3)]');
          b.classList.add('border-slate-800', 'bg-slate-900/60', 'text-slate-400');
        });

        btn.classList.add('active', 'border-cyan-400', 'bg-cyan-950/60', 'text-cyan-300', 'shadow-[0_0_15px_rgba(0,243,255,0.3)]');
        btn.classList.remove('border-slate-800', 'bg-slate-900/60', 'text-slate-400');

        const filter = btn.getAttribute('data-filter');
        playCyberTone(520, 'sine', 0.04, 0.03);

        projectCards.forEach((card) => {
          const cat = card.getAttribute('data-category');
          if (filter === 'all' || cat === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Modal Inspection Logic
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');

    function openModal(idx) {
      const proj = projectBlueprints[idx];
      if (!proj || !modalContent) return;

      modalContent.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <span class="font-mono text-xs text-cyan-400 tracking-wider uppercase">// BLUEPRINT SPECIFICATION</span>
            <span class="font-mono text-xs text-emerald-400">STATUS: VERIFIED</span>
          </div>

          <div>
            <h3 class="font-orbitron text-2xl font-bold text-white">${proj.title}</h3>
            <p class="font-mono text-xs text-purple-400 mt-1">${proj.category}</p>
          </div>

          <div class="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
            <div class="text-cyan-300"><strong class="text-slate-400">STACK:</strong> ${proj.specs}</div>
            <div class="text-emerald-300"><strong class="text-slate-400">TELEMETRY:</strong> ${proj.metrics}</div>
          </div>

          <p class="font-space text-slate-300 text-sm leading-relaxed">
            ${proj.description}
          </p>

          <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
            <a href="${proj.linkSource}" target="_blank" rel="noopener noreferrer" class="cyber-btn cyber-btn-secondary text-xs">
              <i class="fa-brands fa-github"></i> Inspect Codebase
            </a>
            <a href="${proj.linkDemo}" target="_blank" rel="noopener noreferrer" class="cyber-btn cyber-btn-primary text-xs">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Launch Prototype
            </a>
          </div>
        </div>
      `;

      modal.classList.add('active');
      playCyberTone(650, 'sine', 0.08, 0.04);
    }

    function closeModal() {
      modal.classList.remove('active');
      playCyberTone(350, 'sine', 0.06, 0.03);
    }

    openModalBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-project'), 10);
        openModal(idx);
      });
    });

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 9. CONTACT FORM VALIDATION & ENCRYPTED TRANSMISSION
  // --------------------------------------------------------------------------
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const msgInput = document.getElementById('contact-message');

    const nameErr = document.getElementById('name-error');
    const emailErr = document.getElementById('email-error');
    const msgErr = document.getElementById('message-error');

    const submitBtn = document.getElementById('submit-btn');
    const submitBtnText = document.getElementById('submit-btn-text');
    const feedback = document.getElementById('form-feedback');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form) return;

    function validate() {
      let isValid = true;

      // Name check
      if (!nameInput.value || nameInput.value.trim().length < 2) {
        nameErr.classList.remove('hidden');
        isValid = false;
      } else {
        nameErr.classList.add('hidden');
      }

      // Email check
      if (!emailRegex.test(emailInput.value.trim())) {
        emailErr.classList.remove('hidden');
        isValid = false;
      } else {
        emailErr.classList.add('hidden');
      }

      // Message check
      if (!msgInput.value || msgInput.value.trim().length < 15) {
        msgErr.classList.remove('hidden');
        isValid = false;
      } else {
        msgErr.classList.add('hidden');
      }

      return isValid;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validate()) {
        playCyberTone(250, 'sawtooth', 0.12, 0.05);
        return;
      }

      // Simulated encrypted uplink transmission
      submitBtn.disabled = true;
      submitBtnText.textContent = 'ENCRYPTING PAYLOAD (AES-256)...';
      playCyberTone(880, 'sine', 0.2, 0.05);

      setTimeout(() => {
        submitBtnText.textContent = 'TRANSMITTING VIA SECURE RELAY...';
        playCyberTone(1100, 'sine', 0.15, 0.05);
      }, 700);

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtnText.textContent = 'TRANSMIT ENCRYPTED PAYLOAD';

        feedback.className = 'p-4 rounded-lg font-mono text-xs text-center border border-emerald-500/60 bg-emerald-950/50 text-emerald-300';
        feedback.innerHTML = `
          <i class="fa-solid fa-circle-check text-emerald-400 mr-1.5"></i>
          <strong>PAYLOAD DELIVERED:</strong> Encrypted uplink established with Muhaiman. Response inbound within 24 hours.
        `;
        feedback.classList.remove('hidden');

        playCyberTone(1320, 'sine', 0.3, 0.06);
        form.reset();

        setTimeout(() => {
          feedback.classList.add('hidden');
        }, 8000);
      }, 1600);
    });

    // Real-time input error clearing
    [nameInput, emailInput, msgInput].forEach((el) => {
      el.addEventListener('input', validate);
    });

    // Copy Email to Clipboard
    const copyBtn = document.getElementById('copy-email-btn');
    const emailAddress = document.getElementById('email-address');
    if (copyBtn && emailAddress) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(emailAddress.textContent.trim()).then(() => {
          copyBtn.innerHTML = '<i class="fa-solid fa-check mr-1 text-emerald-400"></i> Copied!';
          playCyberTone(900, 'triangle', 0.06, 0.04);
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-regular fa-copy mr-1"></i> Copy';
          }, 2500);
        });
      });
    }
  }

  // --------------------------------------------------------------------------
  // 10. CONTROLS: AUDIO, QUALITY & MOBILE MENU
  // --------------------------------------------------------------------------
  function initControls() {
    // Audio Toggle
    const audioBtn = document.getElementById('audio-toggle');
    const mobileAudioBtn = document.getElementById('mobile-audio-toggle');
    const audioIcon = document.getElementById('audio-icon');
    const audioStatus = document.getElementById('audio-status');

    function toggleAudio() {
      State.audioEnabled = !State.audioEnabled;
      if (State.audioEnabled) {
        getAudioContext();
        playCyberTone(800, 'sine', 0.1, 0.05);
        if (audioIcon) audioIcon.className = 'fa-solid fa-volume-high text-sm text-cyan-400';
        if (audioStatus) audioStatus.textContent = 'SFX: ON';
      } else {
        if (audioIcon) audioIcon.className = 'fa-solid fa-volume-xmark text-sm';
        if (audioStatus) audioStatus.textContent = 'SFX: OFF';
      }
    }

    if (audioBtn) audioBtn.addEventListener('click', toggleAudio);
    if (mobileAudioBtn) mobileAudioBtn.addEventListener('click', toggleAudio);

    // 3D Quality Toggle
    const perfBtn = document.getElementById('perf-toggle');
    const perfLabel = document.getElementById('perf-label');

    if (perfBtn && perfLabel) {
      perfBtn.addEventListener('click', () => {
        State.highQuality = !State.highQuality;
        playCyberTone(500, 'sine', 0.05, 0.03);

        if (State.highQuality) {
          perfLabel.textContent = '3D: HIGH';
          if (heroRenderer) heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          if (bgRenderer) bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        } else {
          perfLabel.textContent = '3D: ECO';
          if (heroRenderer) heroRenderer.setPixelRatio(1);
          if (bgRenderer) bgRenderer.setPixelRatio(1);
        }
      });
    }

    // Mobile Hamburger Menu
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        playCyberTone(450, 'sine', 0.04, 0.03);
      });

      mobileLinks.forEach((link) => {
        link.addEventListener('click', () => {
          mobileMenu.classList.add('hidden');
        });
      });
    }

    // Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        playCyberTone(700, 'triangle', 0.08, 0.04);
      });
    }

    // System Telemetry Clock
    const clockEl = document.getElementById('system-clock');
    function updateClock() {
      if (!clockEl) return;
      const now = new Date();
      clockEl.textContent = `UTC ${now.toISOString().substring(11, 19)}`;
    }
    setInterval(updateClock, 1000);
    updateClock();
  }

  // --------------------------------------------------------------------------
  // 11. INITIALIZATION ON DOM READY
  // --------------------------------------------------------------------------
  window.addEventListener('DOMContentLoaded', () => {
    initBackgroundScene();
    initHeroCoreScene();
    masterLoop(0);

    typeEffect();
    initTiltCards();
    initSkillsFilter();
    initTerminalSimulator();
    initProjectsSystem();
    initContactForm();
    initControls();
  });

})();
