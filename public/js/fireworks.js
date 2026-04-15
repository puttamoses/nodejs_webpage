/* fireworks.js — Canvas win-celebration animation */
(function () {
  'use strict';

  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let particles = [];
  let animId    = null;
  let running   = false;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const COLORS = ['#e63946','#f4a261','#e9c46a','#2a9d8f','#a8dadc','#ffffff'];

  function createBurst(x, y) {
    const count = 80 + Math.random() * 40 | 0;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        alpha: 1,
        color: COLORS[Math.random() * COLORS.length | 0],
        r: 2 + Math.random() * 3,
        decay: .012 + Math.random() * .012,
      });
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += .12;          // gravity
      p.vx *= .98;
      p.alpha -= p.decay;
      if (p.alpha <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (running) animId = requestAnimationFrame(tick);
  }

  let burstInterval;

  window.startFireworks = function () {
    running = true;
    particles = [];
    resize();
    const shoot = () => {
      if (!running) return;
      createBurst(
        canvas.width  * (.2 + Math.random() * .6),
        canvas.height * (.1 + Math.random() * .4)
      );
    };
    shoot(); shoot(); shoot();
    burstInterval = setInterval(shoot, 600);
    animId = requestAnimationFrame(tick);
    setTimeout(window.stopFireworks, 5000);
  };

  window.stopFireworks = function () {
    running = false;
    clearInterval(burstInterval);
    if (animId) cancelAnimationFrame(animId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = [];
  };
})();
