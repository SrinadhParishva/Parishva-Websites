/* --------------------------------------------------
 * PARISHVA BRANDING STUDIO - INTERACTIVE APPLICATION
 * -------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // Register Service Worker for caching and offline support
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('[Service Worker] Registered scope:', reg.scope))
                .catch(err => console.error('[Service Worker] Registration failed:', err));
        });
    }

    initCustomCursor();
    initSpaceBackground();
    initInteractiveSphere();
    initScrollReveal();
    initHeaderScroll();
    initMobileNavigation();
    initAuditModal();
    initSmoothScrolling();
    initServicesDashboard();
    initCasesSlider();
    initPDFTracking();
    initEmailDeobfuscation();
});

/* 1. Custom Lagged Cursor Ring */
function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    if (!cursor || !ring) return;

    // Check if the device has a fine pointer (mouse/trackpad)
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (!hasFinePointer) {
        cursor.style.display = 'none';
        ring.style.display = 'none';
        return;
    } else {
        cursor.style.display = 'block';
        ring.style.display = 'block';
    }

    let mx = 0, my = 0, rx = 0, ry = 0;
    let isMoving = false;
    let animationFrameId = null;

    const updateCursor = (e) => {
        mx = e.clientX;
        my = e.clientY;
        cursor.style.left = mx + 'px';
        cursor.style.top = my + 'px';
        
        if (!isMoving) {
            isMoving = true;
            animateRing();
        }
    };

    document.addEventListener('mousemove', updateCursor);

    const animateRing = () => {
        const dx = mx - rx;
        const dy = my - ry;
        
        // Easing factor of 0.15 for smooth lag ring
        rx += dx * 0.15;
        ry += dy * 0.15;
        
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        
        // Stop the loop if the ring has caught up to the cursor
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
            rx = mx;
            ry = my;
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            isMoving = false;
            animationFrameId = null;
        } else {
            animationFrameId = requestAnimationFrame(animateRing);
        }
    };

    // Hover scale triggers
    const hoverElements = document.querySelectorAll('a, button, select, input, .nav-cta, .btn-primary, .btn-ghost');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width = '6px';
            cursor.style.height = '6px';
            cursor.style.background = '#e2c47a';
            ring.style.width = '52px';
            ring.style.height = '52px';
            ring.style.opacity = '1';
            ring.style.borderColor = '#e2c47a';
            ring.style.boxShadow = '0 0 15px rgba(226, 196, 122, 0.4)';
        });

        el.addEventListener('mouseleave', () => {
            cursor.style.width = '10px';
            cursor.style.height = '10px';
            cursor.style.background = '#d4a24d';
            ring.style.width = '36px';
            ring.style.height = '36px';
            ring.style.opacity = '0.6';
            ring.style.borderColor = '#d4a24d';
            ring.style.boxShadow = 'none';
        });
    });
}

/* 2. Space/Cosmic Twinkling Background */
function initSpaceBackground() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Detect mobile/tablet screens or touch/coarse pointers to save CPU cycles on mobile
    const isMobile = window.innerWidth < 768 || !window.matchMedia('(pointer: fine)').matches;
    if (isMobile) {
        canvas.style.display = 'none';
        return;
    }

    let W, H;
    let particles = [];
    const particleCount = 100;

    const resize = () => {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Particle constructor class
    class Particle {
        constructor() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.radius = 0.5 + Math.random() * 1.5;
            this.speedX = (Math.random() - 0.5) * 0.05;
            this.speedY = (Math.random() - 0.5) * 0.05;
            this.opacity = Math.random();
            this.twinkleSpeed = 0.004 + Math.random() * 0.008;
            this.color = '#d4a24d';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Screen boundary wrap around
            if (this.x < 0) this.x = W;
            if (this.x > W) this.x = 0;
            if (this.y < 0) this.y = H;
            if (this.y > H) this.y = 0;

            // Opacity shift
            this.opacity += this.twinkleSpeed;
            if (this.opacity > 1 || this.opacity < 0.1) {
                this.twinkleSpeed = -this.twinkleSpeed;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = Math.max(0.1, Math.min(1, this.opacity));
            ctx.fill();
        }
    }

    // Populate particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    const animate = () => {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0b1215';
        ctx.fillRect(0, 0, W, H);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        ctx.globalAlpha = 1.0;
        requestAnimationFrame(animate);
    };
    animate();
}

/* 3. Interactive 3D Golden Particle Sphere Canvas */
function initInteractiveSphere() {
    const canvas = document.getElementById('sphere-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let canvasWidth, canvasHeight;
    const resizeSphereCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        canvasWidth = rect.width * window.devicePixelRatio;
        canvasHeight = rect.height * window.devicePixelRatio;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    };
    window.addEventListener('resize', resizeSphereCanvas);
    resizeSphereCanvas();

    const particles = [];
    const particleCount = 100;
    const radius = 130;
    const projectionDistance = 250;

    let angleX = 0.003;
    let angleY = 0.005;
    let targetAngleX = 0.003;
    let targetAngleY = 0.005;

    // Distribute nodes using golden spiral
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < particleCount; i++) {
        const theta = 2 * Math.PI * i / goldenRatio;
        const phi = Math.acos(1 - 2 * (i + 0.5) / particleCount);

        particles.push({
            x: radius * Math.cos(theta) * Math.sin(phi),
            y: radius * Math.sin(theta) * Math.sin(phi),
            z: radius * Math.cos(phi)
        });
    }

    // Capture hover coordinate shifts by caching canvas rect on mouseenter
    let canvasRect = null;
    const handleMouseMove = (e) => {
        if (!canvasRect) {
            canvasRect = canvas.getBoundingClientRect();
        }
        const clientX = e.clientX - canvasRect.left - (canvasRect.width / 2);
        const clientY = e.clientY - canvasRect.top - (canvasRect.height / 2);

        targetAngleY = clientX * 0.00003;
        targetAngleX = clientY * 0.00003;
    };

    canvas.addEventListener('mouseenter', () => {
        canvasRect = canvas.getBoundingClientRect();
    });
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', () => {
        targetAngleX = 0.003;
        targetAngleY = 0.005;
        canvasRect = null;
    });

    const rotatePoint = (p, ax, ay) => {
        // Rotate Y
        const cosY = Math.cos(ay);
        const sinY = Math.sin(ay);
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.x * sinY + p.z * cosY;

        // Rotate X
        const cosX = Math.cos(ax);
        const sinX = Math.sin(ax);
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        p.x = x1;
        p.y = y2;
        p.z = z2;
    };

    let animationFrameId = null;
    const animate = () => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        angleX += (targetAngleX - angleX) * 0.05;
        angleY += (targetAngleY - angleY) * 0.05;

        const cx = canvasWidth / 2;
        const cy = canvasHeight / 2;
        const projected = [];

        particles.forEach(p => {
            rotatePoint(p, angleX, angleY);

            const scale = projectionDistance / (projectionDistance + p.z);
            const x2d = p.x * scale + cx;
            const y2d = p.y * scale + cy;

            projected.push({ x: x2d, y: y2d, scale: scale, z: p.z });
        });

        // Draw connections
        ctx.strokeStyle = '#d4a24d';
        for (let i = 0; i < particleCount; i++) {
            const pi = particles[i];
            const p2di = projected[i];

            let lines = 0;
            for (let j = i + 1; j < particleCount; j++) {
                if (lines >= 3) break;

                const pj = particles[j];
                const p2dj = projected[j];

                const dx = pi.x - pj.x;
                const dy = pi.y - pj.y;
                const dz = pi.z - pj.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < 65) {
                    const alpha = Math.min(1, Math.max(0, (1 - dist / 65) * 0.16 * p2di.scale * p2dj.scale));
                    ctx.beginPath();
                    ctx.moveTo(p2di.x, p2di.y);
                    ctx.lineTo(p2dj.x, p2dj.y);
                    ctx.globalAlpha = alpha;
                    ctx.lineWidth = 0.5 * Math.min(p2di.scale, p2dj.scale);
                    ctx.stroke();
                    lines++;
                }
            }
        }

        // Draw particles
        projected.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, Math.max(0.5, 2.5 * pt.scale), 0, Math.PI * 2);
            ctx.fillStyle = '#d4a24d';
            ctx.globalAlpha = Math.max(0.1, Math.min(1, pt.scale - 0.4));
            ctx.fill();

            // Glow outline for points closer to viewport front
            if (pt.z < -30) {
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, Math.max(1, 6 * pt.scale), 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(212, 162, 77, 0.18)';
                ctx.globalAlpha = Math.max(0.05, Math.min(0.5, (pt.scale - 0.4) * 0.4));
                ctx.fill();
            }
        });

        ctx.globalAlpha = 1.0;
        animationFrameId = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && canvas.clientWidth > 0 && canvas.clientHeight > 0) {
                if (!animationFrameId) {
                    animate();
                }
            } else {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            }
        });
    }, { threshold: 0 });
    observer.observe(canvas);
}

/* 4. IntersectionObserver Scroll Reveal Animations */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once revealed
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => {
        observer.observe(el);
    });
}

/* 5. Header Scroll Class Toggle */
function initHeaderScroll() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const handleScroll = () => {
        if (window.scrollY > 40) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
}

/* 6. Mobile Navigation Drawer */
function initMobileNavigation() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const links = document.querySelectorAll('.mobile-link');

    if (!toggleBtn || !drawer) return;

    const toggleMenu = () => {
        toggleBtn.classList.toggle('active');
        drawer.classList.toggle('active');
        document.body.classList.toggle('overflow-hidden');
        document.documentElement.classList.toggle('overflow-hidden');
    };

    toggleBtn.addEventListener('click', toggleMenu);

    links.forEach(link => {
        link.addEventListener('click', () => {
            if (drawer.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
}

/* 7. Audit Modal triggers, submission and particle explosions */
function initAuditModal() {
    const modal = document.getElementById('audit-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const successClose = document.getElementById('success-close-btn');
    const form = document.getElementById('brand-audit-form');
    const successMsg = document.getElementById('form-success');

    if (!modal) return;

    // Select all audit buttons across page
    const triggers = [
        document.getElementById('nav-cta-btn'),
        document.getElementById('mobile-cta-btn'),
        document.getElementById('hero-cta-btn'),
        document.getElementById('cta-btn-primary')
    ];

    const openModal = (e) => {
        if (e) e.preventDefault();

        // If mobile menu is active, close it
        const drawer = document.getElementById('mobile-drawer');
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        if (drawer && drawer.classList.contains('active')) {
            drawer.classList.remove('active');
            toggleBtn.classList.remove('active');
            document.body.classList.remove('overflow-hidden');
            document.documentElement.classList.remove('overflow-hidden');
        }

        // Track the Audit Request click event
        let buttonId = 'unknown';
        if (e && e.currentTarget) {
            buttonId = e.currentTarget.id || e.currentTarget.className || 'unknown';
        }
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'generate_lead', {
                lead_type: 'business_audit',
                cta_id: buttonId,
                form_url: 'https://forms.gle/QcmB1hF5WDoBevS26'
            });
            console.log(`[Google Analytics] Tracked audit booking click on button: ${buttonId}`);
        }

        window.open('https://forms.gle/QcmB1hF5WDoBevS26', '_blank');
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
        document.documentElement.classList.remove('overflow-hidden');

        // Reset states after animations complete
        setTimeout(() => {
            form.style.display = 'flex';
            form.style.opacity = '1';
            successMsg.style.display = 'none';
            successMsg.classList.remove('active');
            form.reset();
        }, 400);
    };

    triggers.forEach(btn => {
        if (btn) btn.addEventListener('click', openModal);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (successClose) successClose.addEventListener('click', closeModal);

    // Close modal by clicking outside modal card (overlay backdrop)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Form Submission
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            form.style.opacity = '0';

            setTimeout(() => {
                form.style.display = 'none';
                successMsg.style.display = 'flex';

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        successMsg.classList.add('active');
                    });
                });

                // Explode gold particles relative to modal success icon
                const iconRect = successMsg.querySelector('.success-icon').getBoundingClientRect();
                createExplosion(iconRect);
            }, 300);
        });
    }
}

// Particle explosion logic
function createExplosion(rect) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const count = 65;

    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 2 + Math.random() * 8;
        particles.push({
            x: originX,
            y: originY,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 1.5,
            radius: 1 + Math.random() * 2,
            color: Math.random() > 0.4 ? '#d4a24d' : '#edebeb',
            alpha: 1.0,
            decay: 0.015 + Math.random() * 0.018,
            gravity: 0.12
        });
    }

    const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        particles.forEach(p => {
            if (p.alpha > 0) {
                active = true;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.alpha -= p.decay;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fill();
            }
        });

        if (active) {
            requestAnimationFrame(render);
        } else {
            canvas.remove();
        }
    };
    render();
}

/* 8. Smooth Anchored Scrolling offset by header */
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const position = target.getBoundingClientRect().top;
                const offsetPosition = position + window.pageYOffset - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* 9. Interactive Holographic Services Dashboard Console */
function initServicesDashboard() {
    // Console tab interaction routines removed as elements were simplified.
}

/* 10. Horizontal Loop Case Studies Slider */
function initCasesSlider() {
    const track = document.getElementById('cases-track');
    const outerContainer = document.querySelector('.cases-slider-outer');
    const container = document.querySelector('.cases-slider-container');
    const prevBtn = document.getElementById('cases-prev');
    const nextBtn = document.getElementById('cases-next');
    const dotsContainer = document.getElementById('cases-dots');
    const playPauseBtn = document.getElementById('cases-play-pause');

    if (!track || !container || !prevBtn || !nextBtn || !dotsContainer || !playPauseBtn) return;

    let slides = Array.from(track.children);
    if (slides.length === 0) return;

    const originalLength = slides.length;
    let currentIndex = 1; // Start at 1 (after prepended clone)
    let isTransitioning = false;
    let autoplayInterval = null;
    let isAutoplayActive = true;
    const autoplayDelay = 5000;

    // Create clones
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    firstClone.classList.add('case-slide-clone');
    lastClone.classList.add('case-slide-clone');

    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    const allSlides = Array.from(track.children);

    // Cache layout reading of clientWidth to prevent layout thrashing/reflows
    let slideWidth = container.clientWidth;

    function updatePosition() {
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    }

    // Initialize initial position and defer slightly to ensure layouts are computed
    updatePosition();
    setTimeout(() => {
        slideWidth = container.clientWidth;
        updatePosition();
    }, 100);

    window.addEventListener('resize', () => {
        track.style.transition = 'none';
        slideWidth = container.clientWidth;
        updatePosition();
    });

    function moveToSlide(index, animate = true) {
        if (isTransitioning && animate) return;

        if (animate) {
            isTransitioning = true;
            track.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        } else {
            track.style.transition = 'none';
        }

        currentIndex = index;
        updatePosition();

        if (animate) {
            updateDots();
        }
    }

    function updateDots() {
        let dotIndex = currentIndex - 1;
        if (currentIndex === 0) {
            dotIndex = originalLength - 1;
        } else if (currentIndex === originalLength + 1) {
            dotIndex = 0;
        }

        const dots = Array.from(dotsContainer.children);
        dots.forEach((dot, idx) => {
            if (idx === dotIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    track.addEventListener('transitionend', () => {
        isTransitioning = false;

        // Loop forward
        if (currentIndex === allSlides.length - 1) {
            moveToSlide(1, false);
        }
        // Loop backward
        if (currentIndex === 0) {
            moveToSlide(allSlides.length - 2, false);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (isTransitioning) return;
        resetAutoplayTimer();
        moveToSlide(currentIndex + 1);
    });

    prevBtn.addEventListener('click', () => {
        if (isTransitioning) return;
        resetAutoplayTimer();
        moveToSlide(currentIndex - 1);
    });

    const dots = Array.from(dotsContainer.children);
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            if (isTransitioning) return;
            resetAutoplayTimer();
            moveToSlide(idx + 1);
        });
    });

    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        autoplayInterval = setInterval(() => {
            moveToSlide(currentIndex + 1);
        }, autoplayDelay);
    }

    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    function resetAutoplayTimer() {
        if (isAutoplayActive) {
            stopAutoplay();
            startAutoplay();
        }
    }

    function togglePlayPause() {
        if (isAutoplayActive) {
            isAutoplayActive = false;
            stopAutoplay();
            playPauseBtn.classList.remove('active');
            playPauseBtn.querySelector('.icon-pause').style.display = 'none';
            playPauseBtn.querySelector('.icon-play').style.display = 'block';
            playPauseBtn.setAttribute('aria-label', 'Play autoplay');
        } else {
            isAutoplayActive = true;
            startAutoplay();
            playPauseBtn.classList.add('active');
            playPauseBtn.querySelector('.icon-pause').style.display = 'block';
            playPauseBtn.querySelector('.icon-play').style.display = 'none';
            playPauseBtn.setAttribute('aria-label', 'Pause autoplay');
        }
    }

    playPauseBtn.addEventListener('click', () => {
        togglePlayPause();
    });

    outerContainer.addEventListener('mouseenter', () => {
        if (isAutoplayActive) {
            stopAutoplay();
        }
    });

    outerContainer.addEventListener('mouseleave', () => {
        if (isAutoplayActive) {
            startAutoplay();
        }
    });

    if (playPauseBtn.classList.contains('active')) {
        isAutoplayActive = true;
        startAutoplay();
    } else {
        isAutoplayActive = false;
        playPauseBtn.querySelector('.icon-pause').style.display = 'none';
        playPauseBtn.querySelector('.icon-play').style.display = 'block';
    }
}

/* 11. PDF Document Tracking */
function initPDFTracking() {
    const pdfLinks = document.querySelectorAll('a[href$=".pdf"]');
    pdfLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const fileName = link.getAttribute('href').split('/').pop();
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'file_download', {
                    file_name: fileName,
                    file_extension: 'pdf',
                    link_text: link.innerText.trim()
                });
                console.log(`[Google Analytics] Tracked PDF download: ${fileName}`);
            }
        });
    });
}

/* 12. Email Deobfuscation for SEO/Spam protection */
function initEmailDeobfuscation() {
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
            } else if (!el.querySelector('svg')) {
                el.textContent = email;
            }
        }
    });
}
