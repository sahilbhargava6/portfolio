/* Sahil Bhargava — portfolio interactions */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasIO = 'IntersectionObserver' in window;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* LIVE PROJECTS — the visible project cards are the single source of truth
     for the live-project counters and the terminal's project list. */
  const liveCards = $$('.proj-card[data-status="live"]:not([hidden])');
  $$('[data-live-count]').forEach(el => { el.textContent = liveCards.length; });
  $$('[data-live-count-target]').forEach(el => { el.dataset.target = liveCards.length; });

  /* FOOTER YEAR */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* CUSTOM CURSOR — precise pointers only, never with reduced motion */
  (() => {
    const dot = $('#cur-dot'), ring = $('#cur-ring');
    if (!dot || !ring || !finePointer || reduceMotion || !(window.CSS && CSS.supports('translate', '1px 1px'))) return;
    document.documentElement.classList.add('has-cursor');
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.translate = `${mx}px ${my}px`;
    }, { passive: true });
    (function follow() {
      rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
      ring.style.translate = `${rx}px ${ry}px`;
      requestAnimationFrame(follow);
    })();
    const interactive = 'a, button';
    document.addEventListener('mouseover', e => {
      if (e.target.closest && e.target.closest(interactive)) document.body.classList.add('hovering');
    });
    document.addEventListener('mouseout', e => {
      const to = e.relatedTarget;
      if (e.target.closest && e.target.closest(interactive) && !(to && to.closest && to.closest(interactive))) {
        document.body.classList.remove('hovering');
      }
    });
    document.documentElement.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.documentElement.addEventListener('mouseenter', () => { dot.style.opacity = ''; ring.style.opacity = ''; });
  })();

  /* NAV — sticky background */
  const nav = $('#nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('stuck', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* NAV — mobile menu */
  (() => {
    const toggle = $('#menuToggle'), menu = $('#navMenu');
    if (!toggle || !menu) return;
    const setOpen = open => {
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(!document.body.classList.contains('menu-open')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    window.addEventListener('resize', () => { if (window.innerWidth > 900) setOpen(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setOpen(false); toggle.focus(); }
    });
  })();

  /* NAV — highlight the section currently in view */
  (() => {
    const links = $$('.nav-menu a[href^="#"]');
    const ids = ['hero', ...links.map(a => a.getAttribute('href').slice(1))];
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (!hasIO || !sections.length) return;
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  })();

  /* HERO PARTICLES — paused while the hero is off-screen */
  (() => {
    const cv = $('#particleCanvas'), hero = $('#hero');
    const ctx = cv && cv.getContext('2d');
    if (!ctx || !hero) return;
    const COUNT = window.innerWidth < 700 ? 40 : 80, LINK = 130, PULL = 180;
    let W = 0, H = 0, raf = 0, visible = true, mouseX = -9999, mouseY = -9999;
    const resize = () => { W = cv.width = hero.offsetWidth; H = cv.height = hero.offsetHeight; };
    resize();
    const pts = Array.from({ length: COUNT }, () => {
      const vx = (Math.random() - 0.5) * 0.4, vy = (Math.random() - 0.5) * 0.4;
      return { x: Math.random() * W, y: Math.random() * H, vx, vy, bvx: vx, bvy: vy, r: Math.random() * 1.5 + 0.5 };
    });
    const render = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(183,180,174,0.5)';
      for (const p of pts) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
      ctx.lineWidth = 0.6;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < LINK) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(122,32,32,${(1 - d / LINK) * 0.4})`; ctx.stroke();
          }
        }
      }
    };
    const step = () => {
      for (const p of pts) {
        const dx = mouseX - p.x, dy = mouseY - p.y, d = Math.hypot(dx, dy);
        if (d > 0 && d < PULL) { p.vx += dx / d * 0.015; p.vy += dy / d * 0.015; }
        // ease back toward each particle's own drift so the field never freezes
        p.vx += (p.bvx - p.vx) * 0.02; p.vy += (p.bvy - p.vy) * 0.02;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;
      }
    };
    if (reduceMotion) {
      render();
      window.addEventListener('resize', () => { resize(); render(); });
      return;
    }
    const frame = () => { step(); render(); raf = visible ? requestAnimationFrame(frame) : 0; };
    window.addEventListener('resize', resize);
    hero.addEventListener('mousemove', e => {
      const r = cv.getBoundingClientRect();
      mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener('mouseleave', () => { mouseX = mouseY = -9999; });
    if (hasIO) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(frame);
      }).observe(hero);
    } else {
      raf = requestAnimationFrame(frame);
    }
  })();

  /* HERO TYPING */
  (() => {
    const el = $('#typed-text');
    if (!el || reduceMotion) return;
    const roles = ['Next.js web apps.', 'React Native mobile apps.', 'Laravel & PHP backends.', 'creative UI/UX designs.', 'Android & iOS applications.', 'production-ready code.'];
    let ri = 0, ci = 0, deleting = false;
    el.textContent = '';
    const tick = () => {
      const cur = roles[ri];
      if (!deleting) {
        el.textContent = cur.slice(0, ++ci);
        if (ci === cur.length) { deleting = true; setTimeout(tick, 1600); return; }
      } else {
        el.textContent = cur.slice(0, --ci);
        if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; setTimeout(tick, 400); return; }
      }
      setTimeout(tick, deleting ? 40 : 80);
    };
    setTimeout(tick, 1400);
  })();

  /* HERO PANEL TECH ROTATOR */
  (() => {
    const tag = $('#heroTechRotator');
    if (!tag) return;
    const tech = ['Next.js', 'Laravel', 'React Native', 'iOS & Android', 'UI/UX Design', 'PHP', 'PostgreSQL', 'REST APIs'];
    let i = 0;
    setInterval(() => {
      tag.classList.add('switching');
      setTimeout(() => {
        i = (i + 1) % tech.length;
        tag.textContent = tech[i];
        tag.classList.remove('switching');
      }, 220);
    }, 2200);
  })();

  /* TERMINAL */
  (() => {
    const body = $('#termBody');
    if (!body) return;
    const domains = liveCards.map(c => c.dataset.domain).filter(Boolean);
    const rows = [];
    for (let i = 0; i < domains.length; i += 3) rows.push(domains.slice(i, i + 3));
    const lines = [
      '<span class="c-comment"># Sahil Bhargava — Full Stack &amp; Mobile Engineer</span>',
      '<span class="c-green">$</span> <span class="c-white">npx stack-info</span>',
      '<span class="c-yellow">→</span> Web, Mobile &amp; UI/UX Developer',
      '<span class="c-green">$</span> <span class="c-white">cat skills.json</span>',
      '<span class="c-blue">{</span>',
      '&nbsp;&nbsp;<span class="c-yellow">"frontend"</span>: <span class="c-green">"Next.js, React, Tailwind"</span>,',
      '&nbsp;&nbsp;<span class="c-yellow">"mobile"</span>: <span class="c-green">"React Native, Android, iOS"</span>,',
      '&nbsp;&nbsp;<span class="c-yellow">"backend"</span>: <span class="c-green">"Laravel, PHP, Node.js"</span>,',
      '&nbsp;&nbsp;<span class="c-yellow">"design"</span>: <span class="c-green">"UI/UX Design, Figma"</span>,',
      '&nbsp;&nbsp;<span class="c-yellow">"databases"</span>: <span class="c-green">"MySQL, PostgreSQL, Oracle"</span>',
      '<span class="c-blue">}</span>',
      '<span class="c-green">$</span> <span class="c-white">ls live-projects/</span>',
      ...rows.map(r => r.map(d => `<span class="c-orange">${esc(d)}</span>`).join(' &nbsp;')),
      `<span class="c-comment"># ${domains.length} sites live in production</span>`,
      '<span class="c-green">$</span> <span class="c-white">echo $STATUS</span>',
      '<span class="c-green">✓ Available for new projects</span> <span class="term-caret"></span>'
    ];
    lines.forEach(html => {
      const d = document.createElement('div');
      d.className = 'term-line';
      d.innerHTML = html;
      body.appendChild(d);
    });
    const show = () => body.querySelectorAll('.term-line').forEach((l, i) => setTimeout(() => l.classList.add('show'), reduceMotion ? 0 : i * 110));
    if (reduceMotion || !hasIO) { show(); return; }
    const obs = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { show(); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(body);
  })();

  /* SCROLL REVEAL */
  (() => {
    const els = $$('.reveal, .reveal-left, .reveal-right');
    if (reduceMotion || !hasIO) { els.forEach(el => el.classList.add('in')); return; }
    // Once an element has finished revealing, mark it "settled" so its stagger delay
    // and reveal transition stop interfering with hover effects.
    const settle = el => {
      const onEnd = ev => {
        if (ev.target !== el) return;
        el.classList.add('settled');
        el.removeEventListener('transitionend', onEnd);
      };
      el.addEventListener('transitionend', onEnd);
    };
    const obs = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      settle(e.target);
      e.target.classList.add('in');
      obs.unobserve(e.target);
    }), { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  })();

  /* STAT COUNTERS */
  (() => {
    const els = $$('.stat-n[data-target]');
    const show = (el, n) => { el.textContent = n + '+'; };
    if (reduceMotion || !hasIO) { els.forEach(el => show(el, +el.dataset.target)); return; }
    els.forEach(el => show(el, 0));
    const obs = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target, target = +el.dataset.target, start = performance.now(), dur = 1200;
      const tick = now => {
        const t = Math.min(1, (now - start) / dur);
        show(el, Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    }), { threshold: 0.5 });
    els.forEach(el => obs.observe(el));
  })();

  /* SKILL PROOF — instead of self-rated percentages, show which live sites use each skill.
     A skill's data-match lists tech tags; any live card with a matching tag counts. */
  (() => {
    const tagsOf = card => $$('.proj-tech li', card).map(li => li.textContent.trim().toLowerCase());
    $$('.skill-item[data-match]').forEach(item => {
      const wanted = item.dataset.match.split(',').map(s => s.trim().toLowerCase());
      const hits = liveCards.filter(card => tagsOf(card).some(t => wanted.includes(t)));
      if (!hits.length) return;
      const badge = document.createElement('span');
      badge.className = 'skill-proof';
      badge.textContent = `${hits.length} live site${hits.length > 1 ? 's' : ''}`;
      item.prepend(badge);
      const list = document.createElement('p');
      list.className = 'skill-shipped';
      list.innerHTML = '<b>Shipped in</b>' + hits.map(c => esc($('.proj-name', c).textContent)).join(', ');
      item.appendChild(list);
    });
  })();

  /* CONTACT OPTIONS — open a dialog instead of relying on mailto: alone,
     which silently does nothing when no desktop mail app is configured. */
  (() => {
    const dlg = $('#contactDialog');
    if (!dlg || typeof dlg.showModal !== 'function') return; // old browsers keep the plain mailto link
    const status = $('.cd-status', dlg);
    $$('[data-contact]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      status.textContent = '';
      dlg.showModal();
    }));
    $('[data-close]', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // click on backdrop
    const copyBtn = $('[data-copy]', dlg), label = $('[data-copy-label]', copyBtn);
    copyBtn.addEventListener('click', async () => {
      const text = copyBtn.dataset.copy;
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; } catch {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
        dlg.appendChild(ta); ta.select();
        try { ok = document.execCommand('copy'); } catch { ok = false; }
        ta.remove();
      }
      label.textContent = ok ? 'Copied ✓' : 'Copy email address';
      status.textContent = ok ? 'Email address copied — paste it into any mail app.' : `Couldn't copy automatically — the address is ${text}`;
      setTimeout(() => { label.textContent = 'Copy email address'; }, 2500);
    });
  })();

  /* MAGNETIC BUTTON */
  (() => {
    const btn = $('#magBtn');
    if (!btn || !finePointer || reduceMotion) return;
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.35}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  })();

  /* HERO NAME SCRAMBLE */
  (() => {
    const el = $('.hero-name');
    if (!el || reduceMotion) return;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
    const orig = el.dataset.text;
    let timer = 0;
    el.addEventListener('mouseenter', () => {
      if (timer) return;
      let iter = 0;
      timer = setInterval(() => {
        el.textContent = orig.split('').map((c, i) => (c === ' ' ? ' ' : i < iter ? orig[i] : chars[Math.floor(Math.random() * chars.length)])).join('');
        iter += 0.5;
        if (iter >= orig.length) { clearInterval(timer); timer = 0; el.textContent = orig; }
      }, 40);
    });
  })();
})();
