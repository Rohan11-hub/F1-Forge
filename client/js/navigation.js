/* ============================================================
   F1 FORGE — navigation.js
   Cursor + Theme + Animations + Auth Nav
   ============================================================ */

// ============================================================
// CUSTOM CURSOR
// ============================================================

const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

if (dot && ring) {
  document.addEventListener('mousemove', (e) => {
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';

    requestAnimationFrame(() => {
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
    });
  });

  const hoverTargets = document.querySelectorAll(
    'a, button, .result-card, .step, .turbo-card, .race-banner, .maker-card'
  );

  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('hovering');
    });

    el.addEventListener('mouseleave', () => {
      ring.classList.remove('hovering');
    });
  });
}

// ============================================================
// THEME TOGGLE
// ============================================================

const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
  document.body.classList.add('light-mode');

  if (themeToggle) {
    themeToggle.textContent = 'LIGHT';
  }
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');

    const isLight =
      document.body.classList.contains('light-mode');

    localStorage.setItem(
      'theme',
      isLight ? 'light' : 'dark'
    );

    themeToggle.textContent =
      isLight ? 'LIGHT' : 'DARK';
  });
}

// ============================================================
// AUTH NAV
// ============================================================

const token = localStorage.getItem('f1forge_token');

const loginBtn = document.querySelector('a[href="login.html"]');
const signupBtn = document.querySelector('a[href="signup.html"]');

if (token) {
  if (loginBtn) loginBtn.style.display = 'none';
  if (signupBtn) signupBtn.style.display = 'none';
}

// ============================================================
// SCROLL FADE-IN
// ============================================================

const faders = document.querySelectorAll('.fade-in');

if (faders.length > 0) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  faders.forEach(el => observer.observe(el));
}

// ============================================================
// MOBILE HAMBURGER (FUTURE)
// ============================================================

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}