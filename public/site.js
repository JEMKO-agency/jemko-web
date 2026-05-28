// ============================================
// JEMKO — Subtle golden particles backdrop
// ============================================
(function() {
  const container = document.querySelector('.particles');
  if (!container) return;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    W = container.clientWidth;
    H = container.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(DPR, DPR);
    initParticles();
  }

  function initParticles() {
    const count = Math.min(80, Math.floor((W * H) / 18000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.5 + 0.15,
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.015 + 0.005,
        gold: Math.random() < 0.35
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.ph += p.sp;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      const tw = 0.6 + Math.sin(p.ph) * 0.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      if (p.gold) {
        ctx.fillStyle = `rgba(245, 184, 0, ${p.a * tw})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.a * tw * 0.5})`;
      }
      ctx.fill();
    }
    requestAnimationFrame(step);
  }

  resize();
  window.addEventListener('resize', resize);
  step();
})();

// ============================================
// Reveal on scroll
// ============================================
(function() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  // Immediate fallback: anything already in the initial viewport reveals on next tick.
  // Hard safety: after 600ms, force-reveal everything so content is never hidden behind
  // a stuck IntersectionObserver.
  const showAll = () => els.forEach(el => el.classList.add('in'));
  const safety = setTimeout(showAll, 600);

  if (!('IntersectionObserver' in window)) {
    clearTimeout(safety);
    showAll();
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

// ============================================
// Cases carousel (simple) — Home page
// ============================================
(function() {
  const track = document.querySelector('[data-cases-track]');
  const next = document.querySelector('[data-cases-next]');
  if (!track || !next) return;
  next.addEventListener('click', () => {
    const first = track.firstElementChild;
    if (first) track.appendChild(first);
  });
})();
