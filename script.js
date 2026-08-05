(() => {
  'use strict';

  const body = document.body;
  const progressFill = document.getElementById('progressFill');
  const modeCaption = document.getElementById('modeCaption');
  const quickViewButton = document.getElementById('quickViewButton');
  const menuButton = document.getElementById('menuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  const backToTop = document.getElementById('backToTop');
  const modeDial = document.getElementById('modeDial');
  const contactSheet = document.getElementById('contactSheet');
  const buildMap = document.getElementById('buildMap');
  const modeSections = [...document.querySelectorAll('[data-mode-section]')];
  const modeLinks = [...document.querySelectorAll('[data-mode-link]')];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const modeLabels = {
    home: 'JOE NASR / FIVE CREATIVE MODES',
    direct: '01 / DIRECT / BRAND · FILM · CAMPAIGN',
    build: '02 / BUILD / 3D · XR · GAMES · PROTOTYPES',
    sound: '03 / SOUND / COMPOSITION · GUITAR · AUDIO POST',
    teach: '04 / TEACH / UNIVERSITY · GOVERNMENT · CORPORATE',
    venture: '05 / VENTURE / AI · ROBOTICS · PRODUCT SYSTEMS'
  };

  const setMode = (mode) => {
    body.dataset.mode = mode;
    modeCaption.textContent = modeLabels[mode] || modeLabels.home;
    modeLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.modeLink === mode);
    });
  };

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progressFill.style.height = `${Math.min(100, Math.max(0, ratio * 100))}%`;
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setMode(visible.target.dataset.modeSection);
  }, {
    rootMargin: '-24% 0px -54% 0px',
    threshold: [0.05, 0.2, 0.45, 0.7]
  });

  modeSections.forEach((section) => sectionObserver.observe(section));
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  if (modeDial && !prefersReducedMotion.matches) {
    modeDial.addEventListener('pointermove', (event) => {
      const rect = modeDial.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      modeDial.style.transform = `rotateX(${y * -7}deg) rotateY(${x * 7}deg)`;
    });
    modeDial.addEventListener('pointerleave', () => {
      modeDial.style.transform = '';
    });
  }

  document.querySelectorAll('[data-preview-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.previewMode);
      target?.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
    });
  });

  quickViewButton?.addEventListener('click', () => {
    const enabled = body.classList.toggle('quick-view');
    quickViewButton.setAttribute('aria-pressed', String(enabled));
    quickViewButton.textContent = enabled ? 'Immersive view' : 'Quick view';
  });

  const closeMenu = () => {
    if (!mobileMenu || !menuButton) return;
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton?.addEventListener('click', () => {
    if (!mobileMenu) return;
    const willOpen = mobileMenu.hidden;
    mobileMenu.hidden = !willOpen;
    menuButton.setAttribute('aria-expanded', String(willOpen));
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
  });

  if (contactSheet) {
    let pressed = false;
    let startX = 0;
    let startScroll = 0;

    contactSheet.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      pressed = true;
      startX = event.clientX;
      startScroll = contactSheet.scrollLeft;
      contactSheet.setPointerCapture?.(event.pointerId);
    });

    contactSheet.addEventListener('pointermove', (event) => {
      if (!pressed) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 6) event.preventDefault();
      contactSheet.scrollLeft = startScroll - delta;
    });

    const release = () => { pressed = false; };
    contactSheet.addEventListener('pointerup', release);
    contactSheet.addEventListener('pointercancel', release);
  }

  const buildCanvas = document.getElementById('buildCanvas');
  const buildContext = buildCanvas?.getContext('2d');
  let buildFrame = 0;
  let buildPointer = { x: 0.5, y: 0.5 };

  const resizeBuildCanvas = () => {
    if (!buildCanvas || !buildContext) return;
    const rect = buildCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    buildCanvas.width = Math.max(1, Math.floor(rect.width * dpr));
    buildCanvas.height = Math.max(1, Math.floor(rect.height * dpr));
    buildContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawBuildField = () => {
    if (!buildCanvas || !buildContext) return;
    const width = buildCanvas.clientWidth;
    const height = buildCanvas.clientHeight;
    const horizon = height * (0.27 + buildPointer.y * 0.05);
    const centerX = width * (0.5 + (buildPointer.x - 0.5) * 0.08);

    buildContext.clearRect(0, 0, width, height);
    buildContext.strokeStyle = 'rgba(155,246,255,.18)';
    buildContext.lineWidth = 1;

    for (let i = -14; i <= 14; i += 1) {
      const bottomX = centerX + i * width * 0.085;
      buildContext.beginPath();
      buildContext.moveTo(centerX, horizon);
      buildContext.lineTo(bottomX, height);
      buildContext.stroke();
    }

    const offset = prefersReducedMotion.matches ? 0 : (buildFrame % 60) / 60;
    for (let i = 0; i < 22; i += 1) {
      const t = (i + offset) / 22;
      const eased = t * t;
      const y = horizon + eased * (height - horizon);
      buildContext.beginPath();
      buildContext.moveTo(0, y);
      buildContext.lineTo(width, y);
      buildContext.stroke();
    }

    buildContext.fillStyle = 'rgba(155,246,255,.8)';
    buildContext.fillRect(centerX - 2, horizon - 2, 4, 4);

    buildFrame += 0.35;
    requestAnimationFrame(drawBuildField);
  };

  if (buildCanvas && buildContext) {
    resizeBuildCanvas();
    drawBuildField();
    window.addEventListener('resize', resizeBuildCanvas);
    buildCanvas.parentElement?.addEventListener('pointermove', (event) => {
      const rect = buildCanvas.getBoundingClientRect();
      buildPointer = {
        x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
      };
    });
  }

  buildMap?.querySelectorAll('.build-node').forEach((node) => {
    node.addEventListener('pointermove', (event) => {
      if (prefersReducedMotion.matches) return;
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      node.style.setProperty('--ry', `${x * 8}deg`);
      node.style.setProperty('--rx', `${y * -8}deg`);
    });
    node.addEventListener('pointerleave', () => {
      node.style.removeProperty('--ry');
      node.style.removeProperty('--rx');
    });
  });

  const soundScope = document.getElementById('soundScope');
  const soundContext = soundScope?.getContext('2d');
  let soundPointer = { x: 0.5, y: 0.5 };
  let activeTrack = 'composition';
  let soundFrame = 0;

  const trackProfiles = {
    composition: { waves: 3, density: 1.2, amplitude: 0.34 },
    guitar: { waves: 5, density: 2.3, amplitude: 0.27 },
    post: { waves: 2, density: 0.8, amplitude: 0.18 },
    commercial: { waves: 7, density: 3.4, amplitude: 0.22 }
  };

  const resizeSoundScope = () => {
    if (!soundScope || !soundContext) return;
    const rect = soundScope.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    soundScope.width = Math.max(1, Math.floor(rect.width * dpr));
    soundScope.height = Math.max(1, Math.floor(rect.height * dpr));
    soundContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawSoundScope = () => {
    if (!soundScope || !soundContext) return;
    const width = soundScope.clientWidth;
    const height = soundScope.clientHeight;
    const profile = trackProfiles[activeTrack] || trackProfiles.composition;
    const t = prefersReducedMotion.matches ? 0 : soundFrame * 0.012;

    soundContext.fillStyle = '#060806';
    soundContext.fillRect(0, 0, width, height);

    soundContext.strokeStyle = 'rgba(215,255,63,.11)';
    soundContext.lineWidth = 1;
    for (let x = 0; x <= width; x += 42) {
      soundContext.beginPath();
      soundContext.moveTo(x, 0);
      soundContext.lineTo(x, height);
      soundContext.stroke();
    }
    for (let y = 0; y <= height; y += 42) {
      soundContext.beginPath();
      soundContext.moveTo(0, y);
      soundContext.lineTo(width, y);
      soundContext.stroke();
    }

    for (let wave = 0; wave < profile.waves; wave += 1) {
      soundContext.beginPath();
      const hueAlpha = 0.85 - wave * 0.1;
      soundContext.strokeStyle = `rgba(215,255,63,${Math.max(.18, hueAlpha)})`;
      soundContext.lineWidth = wave === 0 ? 2 : 1;
      for (let x = 0; x <= width; x += 3) {
        const normalized = x / width;
        const envelope = Math.sin(normalized * Math.PI);
        const frequency = profile.density * (1 + wave * 0.42);
        const phase = t * (1 + wave * 0.15) + soundPointer.x * 4;
        const modulation = Math.sin((normalized * frequency * Math.PI * 2) + phase);
        const harmonic = Math.sin((normalized * (frequency * 2.7) * Math.PI * 2) - phase * .55) * .34;
        const amplitude = height * profile.amplitude * envelope * (0.72 + soundPointer.y * .55) / (1 + wave * .22);
        const y = height / 2 + (modulation + harmonic) * amplitude;
        if (x === 0) soundContext.moveTo(x, y);
        else soundContext.lineTo(x, y);
      }
      soundContext.stroke();
    }

    soundFrame += 1;
    requestAnimationFrame(drawSoundScope);
  };

  if (soundScope && soundContext) {
    resizeSoundScope();
    drawSoundScope();
    window.addEventListener('resize', resizeSoundScope);
    soundScope.addEventListener('pointermove', (event) => {
      const rect = soundScope.getBoundingClientRect();
      soundPointer = {
        x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
      };
    });
  }

  document.querySelectorAll('.track-row').forEach((row) => {
    row.addEventListener('mouseenter', () => {
      activeTrack = row.dataset.track || 'composition';
      document.querySelectorAll('.track-row').forEach((item) => item.classList.toggle('is-active', item === row));
    });
    row.addEventListener('focus', () => {
      activeTrack = row.dataset.track || 'composition';
      document.querySelectorAll('.track-row').forEach((item) => item.classList.toggle('is-active', item === row));
    });
    row.addEventListener('click', () => {
      const url = row.dataset.url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    });
  });

  const lessonDetails = [...document.querySelectorAll('.lesson-list details')];
  lessonDetails.forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      lessonDetails.forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });
})();
