document.addEventListener('DOMContentLoaded', () => {
  /* ======================
     1. Spotlight cursor
  ====================== */
  const spotlight = document.createElement('div');
  spotlight.className = 'spotlight';
  document.body.appendChild(spotlight);

  window.addEventListener('mousemove', (e) => {
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top = e.clientY + 'px';
  });

  /* ======================
     2. Light particle bg (控えめ)
  ====================== */
  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  const MAX = 40; // やや少なめにしてる

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.8 + 0.6;
      this.vx = (Math.random() - 0.5) * 0.2;
      this.vy = (Math.random() - 0.5) * 0.2;
      this.alpha = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.fillStyle = `rgba(255,255,255,${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < MAX; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  initParticles();
  animate();

  /* ======================
     3. Scroll reveal
  ====================== */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const items = entry.target.querySelectorAll('.reveal-item');
      items.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, i * 90);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  // sectionごとに監視
  document.querySelectorAll('.section, .hero').forEach(sec => {
    // 中の見出しやカードにreveal-itemを付与しておく（HTMLに書いてなくてもOKにする）
    sec.querySelectorAll('h2, h3, p, li, .skill-card, .work-item').forEach(el => {
      if (!el.classList.contains('reveal-item')) {
        el.classList.add('reveal-item');
      }
    });
    observer.observe(sec);
  });

  /* ======================
     4. Smooth scroll for nav
  ====================== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;
      e.preventDefault();
      const y = targetEl.getBoundingClientRect().top + window.scrollY - 60; // ヘッダー分上げる
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    });
  });

  /* ======================
     5. Header shadow on scroll
  ====================== */
  const header = document.querySelector('.site-header');
  const toggleHeaderShadow = () => {
    if (!header) return;
    if (window.scrollY > 10) {
      header.style.boxShadow = '0 8px 25px rgba(0,0,0,0.25)';
    } else {
      header.style.boxShadow = 'none';
    }
  };
  toggleHeaderShadow();
  window.addEventListener('scroll', toggleHeaderShadow);
});
