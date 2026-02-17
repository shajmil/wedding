/* =============================================
   script.js — Wedding Day Interactions
   ============================================= */

// ———— Countdown Timer ————
(function initCountdown() {
  // Set your wedding date here
  const weddingDate = new Date('June 20, 2026 15:00:00').getTime();

  function update() {
    const now = Date.now();
    const diff = weddingDate - now;

    if (diff <= 0) {
      document.getElementById('days').textContent    = '0';
      document.getElementById('hours').textContent   = '0';
      document.getElementById('minutes').textContent = '0';
      document.getElementById('seconds').textContent = '0';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    document.getElementById('days').textContent    = d;
    document.getElementById('hours').textContent   = h;
    document.getElementById('minutes').textContent = m;
    document.getElementById('seconds').textContent = s;
  }

  update();
  setInterval(update, 1000);
})();

// ———— Navbar Scroll Effect ————
const navbar   = document.getElementById('navbar');
const backTop  = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const y = window.scrollY;

  // Shrink navbar on scroll
  if (y > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Show/hide back-to-top
  if (y > 600) {
    backTop.classList.add('show');
  } else {
    backTop.classList.remove('show');
  }
});

// ———— Mobile Menu Toggle ————
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

// Create an overlay backdrop for mobile menu
const menuOverlay = document.createElement('div');
menuOverlay.className = 'menu-overlay';
document.body.appendChild(menuOverlay);

function openMenu() {
  navLinks.classList.add('active');
  hamburger.classList.add('open');
  menuOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // prevent scroll when menu open
}

function closeMenu() {
  navLinks.classList.remove('active');
  hamburger.classList.remove('open');
  menuOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', (e) => {
  e.stopPropagation();
  if (navLinks.classList.contains('active')) {
    closeMenu();
  } else {
    openMenu();
  }
});

// Close menu when overlay is clicked
menuOverlay.addEventListener('click', closeMenu);

// Close menu when a link is tapped
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close menu when clicking anywhere outside
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('active') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)) {
    closeMenu();
  }
});

// Close menu on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('active')) {
    closeMenu();
  }
});

// ———— Scroll-Reveal (Intersection Observer) ————
const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Honour any inline animation-delay via style attr
        const delay = entry.target.style.animationDelay || '0s';
        entry.target.style.transitionDelay = delay;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // only once
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach(el => revealObserver.observe(el));

// ———— Smooth parallax-ish count number bump ————
const countNums = document.querySelectorAll('.count-num');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const dir = window.scrollY > lastScroll ? 1 : -1;
  lastScroll = window.scrollY;

  countNums.forEach(num => {
    num.style.transform = `translateY(${dir * -2}px)`;
    setTimeout(() => { num.style.transform = 'translateY(0)'; }, 200);
  });
}, { passive: true });

// ———— Touch swipe to close mobile menu ————
let touchStartX = 0;
let touchEndX = 0;

navLinks.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

navLinks.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  // Swipe right to close (menu is on the right side)
  if (touchEndX - touchStartX > 60 && navLinks.classList.contains('active')) {
    closeMenu();
  }
}, { passive: true });

// ———— Global Floating Hearts (occasional, random) ————
(function globalHearts() {
  // Create a fixed container for floating hearts
  const container = document.createElement('div');
  container.className = 'global-hearts-container';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);

  const heartChars = ['\u2661', '\u2661', '\u2665\uFE0E', '\u2661'];
  const animations = ['globalHeartRise', 'globalHeartDrift'];

  function spawnHeart() {
    const heart = document.createElement('span');
    heart.className = 'global-heart';
    heart.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];

    // Random position along the bottom
    const leftPos = Math.random() * 100;
    const size = 0.6 + Math.random() * 1; // 0.6rem to 1.6rem
    const duration = 5 + Math.random() * 6; // 5s to 11s
    const anim = animations[Math.floor(Math.random() * animations.length)];

    heart.style.cssText = `
      left: ${leftPos}%;
      bottom: -20px;
      font-size: ${size}rem;
      animation: ${anim} ${duration}s ease-out forwards;
    `;

    container.appendChild(heart);

    // Remove after animation completes
    setTimeout(() => {
      heart.remove();
    }, duration * 1000 + 200);
  }

  // Spawn a heart every 1.5–3.5 seconds (gentle but noticeable)
  function scheduleNext() {
    const delay = 1500 + Math.random() * 2000; // 1.5s to 3.5s
    setTimeout(() => {
      spawnHeart();
      // Occasionally spawn a pair together (30% chance)
      if (Math.random() < 0.3) {
        setTimeout(spawnHeart, 150);
      }
      scheduleNext();
    }, delay);
  }

  // Start after a short initial delay
  setTimeout(scheduleNext, 1000);

  // Also spawn a small burst (2–4 hearts) when user scrolls past certain points
  let lastBurstScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    // Trigger a mini burst every ~700px of scrolling
    if (y - lastBurstScroll > 700) {
      lastBurstScroll = y;
      const burstCount = 2 + Math.floor(Math.random() * 3); // 2, 3, or 4
      for (let i = 0; i < burstCount; i++) {
        setTimeout(spawnHeart, i * 250);
      }
    }
  }, { passive: true });
})();
