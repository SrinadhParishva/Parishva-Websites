/* --------------------------------------------------
 * PARISHVA BRANDING STUDIO — SHARED BLOG SCRIPT
 * -------------------------------------------------- */

// ── Custom cursor ──
(function () {
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isFinePointer) return;
  const dot = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  
  dot.style.display = 'block';
  ring.style.display = 'block';
  let rx = 0, ry = 0, mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  }
  loop();
  document.querySelectorAll('a, button, .check-item').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.style.width = '54px'; ring.style.height = '54px'; ring.style.opacity = '1'; });
    el.addEventListener('mouseleave', () => { ring.style.width = '36px'; ring.style.height = '36px'; ring.style.opacity = '.6'; });
  });
})();

// ── Nav scroll state (Passive event listener for scroll) ──
(function () {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

// ── Scroll reveal ──
(function () {
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));
})();

// ── Ambient particle field ──
(function () {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = document.documentElement.scrollHeight;
  }

  function makeParticles() {
    const count = Math.min(60, Math.floor((w * h) / 60000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.4,
      speed: Math.random() * 0.25 + 0.05,
      drift: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.35 + 0.08
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const scrollY = window.scrollY;
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      const screenY = p.y - scrollY;
      if (screenY < -10 || screenY > window.innerHeight + 10) return;
      ctx.beginPath();
      ctx.arc(p.x, screenY, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 162, 77, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  function init() {
    const isMobile = window.innerWidth < 768 || !window.matchMedia('(pointer: fine)').matches;
    if (isMobile) {
      canvas.style.display = 'none';
      return;
    }
    resize();
    makeParticles();
    if (!window.drawLoopStarted) {
      window.drawLoopStarted = true;
      draw();
    }
  }

  window.addEventListener('resize', init);
  init();
})();
