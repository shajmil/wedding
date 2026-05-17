/* =============================================
   script.js — Wedding Day Interactions
   ============================================= */

// ———— DOM References ————
const navbar = document.getElementById('navbar');
const backTop = document.getElementById('backToTop');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const countNums = document.querySelectorAll('.count-num');
const parallaxSections = document.querySelectorAll('.hero, .location-banner');

// ———— Countdown Timer ————
(function initCountdown() {
  const weddingDate = new Date('June 20, 2026 15:00:00').getTime();
  const els = {
    d: document.getElementById('days'),
    h: document.getElementById('hours'),
    m: document.getElementById('minutes'),
    s: document.getElementById('seconds')
  };

  function update() {
    const diff = weddingDate - Date.now();
    if (diff <= 0) {
      els.d.textContent = els.h.textContent = els.m.textContent = els.s.textContent = '0';
      return;
    }
    els.d.textContent = Math.floor(diff / 86400000);
    els.h.textContent = Math.floor((diff / 3600000) % 24);
    els.m.textContent = Math.floor((diff / 60000) % 60);
    els.s.textContent = Math.floor((diff / 1000) % 60);
  }

  update();
  setInterval(update, 1000);
})();

// ———— Mobile Menu ————
const menuOverlay = document.createElement('div');
menuOverlay.className = 'menu-overlay';
document.body.appendChild(menuOverlay);

function openMenu() {
  navLinks.classList.add('active');
  hamburger.classList.add('open');
  menuOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  navLinks.classList.remove('active');
  hamburger.classList.remove('open');
  menuOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', (e) => {
  e.stopPropagation();
  navLinks.classList.contains('active') ? closeMenu() : openMenu();
});

menuOverlay.addEventListener('click', closeMenu);

document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('active') &&
    !navLinks.contains(e.target) &&
    !hamburger.contains(e.target)) {
    closeMenu();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('active')) closeMenu();
});

// ———— Touch Swipe to Close Menu ————
let touchStartX = 0;
navLinks.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

navLinks.addEventListener('touchend', (e) => {
  if (e.changedTouches[0].screenX - touchStartX > 60 && navLinks.classList.contains('active')) {
    closeMenu();
  }
}, { passive: true });

// ———— Smooth Scroll (all anchor links + nav links) ————
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && href !== '#') {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        closeMenu();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });
});

// ———— Scroll-Reveal (Intersection Observer) ————
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = entry.target.style.animationDelay || '0s';
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
  .forEach(el => revealObserver.observe(el));

// ———— Unified Scroll Handler (rAF-throttled) ————
let lastScroll = 0;
let scrollTicking = false;

function onScroll() {
  const y = window.scrollY;
  const winH = window.innerHeight;

  // Navbar shrink
  navbar.classList.toggle('scrolled', y > 80);

  // Back-to-top visibility
  backTop.classList.toggle('show', y > 600);

  // Count number bump
  const dir = y > lastScroll ? 1 : -1;
  lastScroll = y;
  countNums.forEach(num => {
    num.style.transform = `translateY(${dir * -2}px)`;
    setTimeout(() => { num.style.transform = 'translateY(0)'; }, 200);
  });

  // Parallax background shift
  parallaxSections.forEach(section => {
    if (section.classList.contains('location-banner-1')) return;

    const rect = section.getBoundingClientRect();
    const sectionH = section.offsetHeight;
    if (rect.bottom < -100 || rect.top > winH + 100) return;

    const progress = Math.max(0, Math.min(1,
      (winH - rect.top) / (winH + sectionH)
    ));
    section.style.backgroundPositionY = Math.round(progress * 100) + '%';
  });

  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(onScroll);
    scrollTicking = true;
  }
}, { passive: true });

window.addEventListener('resize', onScroll);
window.addEventListener('orientationchange', onScroll);

// Initial call
onScroll();

// ———— Gallery Carousel ————
(function initGalleryCarousel() {
  const AUTOPLAY_MS = 3000;
  const carousel = document.getElementById('galleryCarousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = carousel.querySelectorAll('.carousel-slide');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const dotsContainer = carousel.querySelector('.carousel-dots');
  const viewport = carousel.querySelector('.carousel-viewport');
  let current = 0;
  let autoplayTimer = null;
  let touchStartX = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('.carousel-dot');

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
    resetAutoplay();
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  viewport.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 50) diff > 0 ? prev() : next();
  }, { passive: true });

  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    autoplayTimer = setInterval(next, AUTOPLAY_MS);
  }

  carousel.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
  carousel.addEventListener('mouseleave', resetAutoplay);

  resetAutoplay();
})();

// ———— Developer Info Widget ————
(function initDevWidget() {
  const widget = document.getElementById('devWidget');
  const toggle = document.getElementById('devWidgetToggle');
  const panel = document.getElementById('devWidgetPanel');
  const closeBtn = widget?.querySelector('.dev-widget-close');
  if (!widget || !toggle || !panel) return;

  function setOpen(open) {
    widget.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close developer info' : 'Open developer info');
    panel.setAttribute('aria-hidden', String(!open));
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!widget.classList.contains('open'));
  });

  closeBtn?.addEventListener('click', () => setOpen(false));

  document.addEventListener('click', (e) => {
    if (widget.classList.contains('open') && !widget.contains(e.target)) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && widget.classList.contains('open')) setOpen(false);
  });
})();

// ———— Global Floating Hearts ————
(function globalHearts() {
  const container = document.createElement('div');
  container.className = 'global-hearts-container';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);

  const anims = ['globalHeartRise', 'globalHeartDrift'];
  let lastBurstY = 0;

  function spawn() {
    const heart = document.createElement('span');
    heart.className = 'global-heart';
    const left = Math.random() * 100;
    const size = 10 + Math.random() * 16;
    const dur = 5 + Math.random() * 6;
    const anim = anims[Math.floor(Math.random() * anims.length)];

    heart.style.cssText = `left:${left}%;bottom:-20px;width:${size}px;height:${size}px;animation:${anim} ${dur}s ease-out forwards;`;
    container.appendChild(heart);
    setTimeout(() => heart.remove(), dur * 1000 + 200);
  }

  function scheduleNext() {
    setTimeout(() => {
      spawn();
      if (Math.random() < 0.2) setTimeout(spawn, 200);
      scheduleNext();
    }, 2000 + Math.random() * 2000);
  }

  setTimeout(scheduleNext, 1500);

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y - lastBurstY > 900) {
      lastBurstY = y;
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) setTimeout(spawn, i * 300);
    }
  }, { passive: true });
})();
