/* ============================================================
   F1 FORGE — navigation.js
   Cursor + Nav + Theme
   ============================================================ */

// --- CUSTOM CURSOR ---
const dot  = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');

document.addEventListener('mousemove', (e) => {
  dot.style.left  = e.clientX + 'px';
  dot.style.top   = e.clientY + 'px';
  setTimeout(() => {
    ring.style.left = e.clientX + 'px';
    ring.style.top  = e.clientY + 'px';
  }, 80);
});

const hoverTargets = document.querySelectorAll(
  'a, button, .result-card, .step, .turbo-card, .race-banner, .maker-card'
);

hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
});

// --- ACTIVE NAV LINK ---
const navLinks = document.querySelectorAll('.nav-links a');
const current  = window.location.pathname.split('/').pop();

navLinks.forEach(link => {
  if (link.getAttribute('href') === current) {
    link.classList.add('active');
  }
});

// --- THEME TOGGLE ---
const toggle    = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'light') {
  document.body.classList.add('light-mode');
  if (toggle) toggle.textContent = 'LIGHT';
}

if (toggle) {
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    toggle.textContent = isLight ? 'LIGHT' : 'DARK';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

// --- SCROLL FADE IN ---
const faders = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

faders.forEach(el => observer.observe(el));