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

// ── Email Deobfuscation for SEO/Spam protection ──
(function () {
  const deobfuscate = () => {
    const emails = document.querySelectorAll('.obfuscated-email');
    emails.forEach(el => {
      const user = el.getAttribute('data-user');
      const domain = el.getAttribute('data-domain');
      if (user && domain) {
        const email = `${user}@${domain}`;
        el.setAttribute('href', `mailto:${email}`);
        const textEl = el.querySelector('.email-text');
        if (textEl) {
          textEl.textContent = email;
        } else {
          // If there are no children, we update textContent
          // If there's an SVG icon, we don't want to replace it
          if (!el.querySelector('svg')) {
            el.textContent = email;
          }
        }
      }
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', deobfuscate);
  } else {
    deobfuscate();
  }
})();

// ── Dynamic/Lazy Loading of Google Analytics and Facebook Pixel on user interaction ──
(function() {
    let analyticsLoaded = false;
    
    function loadAnalytics() {
        if (analyticsLoaded) return;
        analyticsLoaded = true;

        // 1. Google Analytics Dynamic Injection (if not already loaded)
        if (!window.gtag && !document.querySelector('script[src*="googletagmanager.com/gtag"]')) {
            const GA_ID = 'G-Q68TTHJ6W7';
            window.dataLayer = window.dataLayer || [];
            window.gtag = function() { window.dataLayer.push(arguments); };
            window.gtag('js', new Date());
            
            const gaScript = document.createElement('script');
            gaScript.async = true;
            gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
            document.head.appendChild(gaScript);
            
            window.gtag('config', GA_ID);
            console.log('[Lazy Analytics] Google Analytics dynamically loaded on user interaction (blog).');
        }

        // 2. Facebook Pixel Dynamic Injection (if not already loaded)
        if (!window.fbq && !document.querySelector('script[src*="connect.facebook.net"]')) {
            !function (f, b, e, v, n, t, s) {
                if (f.fbq) return; n = f.fbq = function () {
                    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
                };
                if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
                n.queue = []; t = b.createElement(e); t.async = !0;
                t.src = v; s = b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t, s);
            }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
            
            window.fbq('init', 'YOUR_PIXEL_ID');
            window.fbq('track', 'PageView');
            console.log('[Lazy Analytics] Facebook Pixel dynamically loaded on user interaction (blog).');
        }
        
        removeListeners();
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    function removeListeners() {
        events.forEach(evt => window.removeEventListener(evt, loadAnalytics, { passive: true }));
    }
    
    // Bind interaction events
    events.forEach(evt => window.addEventListener(evt, loadAnalytics, { once: true, passive: true }));
})();

