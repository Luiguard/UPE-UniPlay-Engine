/* ═══════════════════════════════════════════
   UNIPLAY ENGINE — JAVASCRIPT
   Hero canvas · Cube animation · Interactions
   + NetSync Shield interactive section
═══════════════════════════════════════════ */

'use strict';

// ──────────────────────────────────────────
// 1. HERO CANVAS — Network node particle field
// ──────────────────────────────────────────
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, nodes, animFrame;

  const COLORS = ['#7c3aed', '#2563eb', '#06b6d4', '#10b981'];
  const NODE_COUNT = window.innerWidth < 600 ? 40 : 80;
  const MAX_DIST = 150;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeNode() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.02,
    };
  }

  function initNodes() {
    nodes = Array.from({ length: NODE_COUNT }, makeNode);
  }

  function draw(ts) {
    ctx.clearRect(0, 0, W, H);

    nodes.forEach(n => {
      n.pulse += n.pulseSpeed;
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    // Draw edges
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.35;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      const pulse = Math.sin(n.pulse) * 0.5 + 0.5;
      // Glow
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
      grad.addColorStop(0, n.color + '66');
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + pulse * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.fill();
    });

    animFrame = requestAnimationFrame(draw);
  }

  function start() {
    resize();
    initNodes();
    animFrame = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    initNodes();
  });

  start();
})();


// ──────────────────────────────────────────
// 2. CUBE CANVAS — Rotating wireframe cube with nodes
// ──────────────────────────────────────────
(function initCubeCanvas() {
  const canvas = document.getElementById('cubeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let angle = 0;
  let W, H;

  const VERTICES = [
    [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
    [-1,-1, 1],[1,-1, 1],[1,1, 1],[-1,1, 1],
  ];

  const EDGES = [
    [0,1],[1,2],[2,3],[3,0], // back
    [4,5],[5,6],[6,7],[7,4], // front
    [0,4],[1,5],[2,6],[3,7], // sides
  ];

  const INNER_VERTICES = [
    [-0.5,-0.5,-0.5],[0.5,-0.5,-0.5],[0.5,0.5,-0.5],[-0.5,0.5,-0.5],
    [-0.5,-0.5, 0.5],[0.5,-0.5, 0.5],[0.5,0.5, 0.5],[-0.5,0.5, 0.5],
  ];

  function project(v, fov, scale) {
    const z = v[2] * 0.7 + 3;
    const x = (v[0] / z) * fov + W / 2;
    const y = (v[1] / z) * fov + H / 2;
    return { x: x * scale, y: y * scale, z: v[2] };
  }

  function rotateY(v, a) {
    return [
      v[0] * Math.cos(a) + v[2] * Math.sin(a),
      v[1],
      -v[0] * Math.sin(a) + v[2] * Math.cos(a),
    ];
  }

  function rotateX(v, a) {
    return [
      v[0],
      v[1] * Math.cos(a) - v[2] * Math.sin(a),
      v[1] * Math.sin(a) + v[2] * Math.cos(a),
    ];
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = canvas.width  = rect.width;
    H = canvas.height = rect.height;
  }

  function draw(ts) {
    W = canvas.width;
    H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const fov = Math.min(W, H) * 0.45;
    const t = ts * 0.0006;
    angle = t;

    function transform(v) {
      let r = rotateY(v, angle);
      r = rotateX(r, angle * 0.4);
      return r;
    }

    // Outer cube
    const pts = VERTICES.map(v => project(transform(v), fov, 1));
    EDGES.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(pts[a].x, pts[a].y);
      ctx.lineTo(pts[b].x, pts[b].y);
      ctx.strokeStyle = 'rgba(124,58,237,0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Vertices glow
    pts.forEach(p => {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
      g.addColorStop(0, '#a78bfa');
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#c4b5fd';
      ctx.fill();
    });

    // Inner cube
    const ipts = INNER_VERTICES.map(v => project(transform(v), fov, 1));
    EDGES.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(ipts[a].x, ipts[a].y);
      ctx.lineTo(ipts[b].x, ipts[b].y);
      ctx.strokeStyle = 'rgba(6,182,212,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Connection lines outer → inner
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(ipts[i].x, ipts[i].y);
      ctx.strokeStyle = 'rgba(16,185,129,0.2)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Floating labels
    const labels = ['Zone A', 'Zone B', 'CDE', 'NPC', 'Physics', 'Combat', 'Economy', 'World'];
    pts.forEach((p, i) => {
      ctx.font = '600 10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(148,163,184,0.7)';
      ctx.fillText(labels[i], p.x + 8, p.y - 6);
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
})();


// ──────────────────────────────────────────
// 3. NAV SCROLL EFFECT
// ──────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (window.scrollY > 30) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}, { passive: true });

// Mobile menu
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
});


// ──────────────────────────────────────────
// 4. COUNTER ANIMATION (hero stats)
// ──────────────────────────────────────────
function animateCount(el, target, duration = 1800) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

let countersStarted = false;
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !countersStarted) {
      countersStarted = true;
      document.querySelectorAll('.stat-num').forEach(el => {
        animateCount(el, parseInt(el.dataset.target));
      });
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);


// ──────────────────────────────────────────
// 5. SCROLL REVEAL
// ──────────────────────────────────────────
function addRevealAttrs() {
  const selectors = [
    '.arch-layer', '.module-card', '.scaling-tier',
    '.principle', '.section-header', '.api-tabs', '.genre-selector',
    '.tier-bar-row', '.cta-content', '.footer-inner',
    '.ns-mech-card', '.ns-result-card', '.ns-lp-header'
  ];
  selectors.forEach((sel, si) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (!el.hasAttribute('data-reveal')) {
        el.setAttribute('data-reveal', '');
        const d = Math.min(i, 4);
        if (d) el.setAttribute('data-reveal-delay', d);
      }
    });
  });
}

addRevealAttrs();

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));


// ──────────────────────────────────────────
// 6. BAR ANIMATIONS (scaling section)
// ──────────────────────────────────────────
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.bar-fill').forEach(bar => {
        const pct = getComputedStyle(bar).getPropertyValue('--pct').trim();
        bar.style.width = pct;
      });
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.scaling-tier').forEach(tier => {
  barObserver.observe(tier);
  // reset bars initially
  tier.querySelectorAll('.bar-fill').forEach(b => b.style.width = '0');
});


// ──────────────────────────────────────────
// 7. API TABS
// ──────────────────────────────────────────
document.querySelectorAll('.api-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.api-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.api-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.querySelector(`.api-panel[data-panel="${tab.dataset.tab}"]`);
    if (panel) panel.classList.add('active');
  });
});


// ──────────────────────────────────────────
// 8. COPY BUTTONS
// ──────────────────────────────────────────
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.closest('.code-block').querySelector('pre code');
    const text = panel ? panel.innerText : '';
    navigator.clipboard.writeText(text).then(() => {
      btn.textContent = '✓ Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    }).catch(() => {
      btn.textContent = 'Error';
      setTimeout(() => btn.textContent = 'Copy', 1500);
    });
  });
});


// ──────────────────────────────────────────
// 9. GENRE SELECTOR
// ──────────────────────────────────────────
const GENRES = {
  sandbox: {
    name: '🎮 Minecraft-style Sandbox',
    modules: ['World Simulation', 'Voxel Engine', 'Crafting', 'Persistence', 'AI/NPC'],
    clientCalc: ['Chunk Simulation', 'Light Calculation', 'Fluid Propagation', 'Tree Growth', 'Plant Biology'],
    serverDoes: ['Consensus Arbitration', 'Anti-Cheat Validation', 'World Persistence', 'Player Auth'],
  },
  shooter: {
    name: '🔫 Shooter (CoD / Battlefield / Apex)',
    modules: ['Physics', 'Combat', 'AI / Bots', 'Vehicles'],
    clientCalc: ['Projectile Trajectories', 'Line-of-Sight Checks', 'Recoil Physics', 'Vehicle Dynamics', 'Hit Registration'],
    serverDoes: ['Hit Plausibility Check', 'Movement Validation', 'Match State', 'Anti-Cheat'],
  },
  cube: {
    name: '🧊 The Cube – Save Us (Social Survival)',
    modules: ['Social', 'Survival', 'Crafting', 'World Simulation', 'AI/NPC'],
    clientCalc: ['Hunger / Temperature', 'Crafting Recipes', 'Resource Spawning', 'NPC Behavior Trees', 'Weather Simulation'],
    serverDoes: ['Consensus', 'World Persistence', 'Anti-Cheat', 'Economy Sync', 'Player State'],
  },
  mmo: {
    name: '⚔️ MMO / RPG (Open World)',
    modules: ['AI/NPC', 'Combat', 'Economy', 'Persistence', 'World Simulation'],
    clientCalc: ['NPC Behavior', 'Quest Logic', 'Loot Tables', 'Ability Cooldowns', 'Environment Events'],
    serverDoes: ['Economy Consensus', 'PvP Arbitration', 'Persistent World State', 'Auction House'],
  },
};

function renderGenre(key) {
  const g = GENRES[key];
  if (!g) return;
  const el = document.getElementById('genreDetail');

  el.style.opacity = '0';
  el.style.transform = 'translateY(12px)';

  setTimeout(() => {
    el.innerHTML = `
      <div>
        <div class="genre-col-title">Active Modules</div>
        <ul class="genre-module-list">
          ${g.modules.map(m => `<li><span class="genre-module-chip">ON</span>${m}</li>`).join('')}
        </ul>
      </div>
      <div>
        <div class="genre-col-title">Clients Compute</div>
        <ul class="genre-module-list">
          ${g.clientCalc.map(c => `<li>👤 ${c}</li>`).join('')}
        </ul>
      </div>
      <div>
        <div class="genre-col-title">Server Handles</div>
        <ul class="genre-module-list">
          ${g.serverDoes.map(s => `<li>🖥️ ${s}</li>`).join('')}
        </ul>
      </div>
    `;
    el.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 200);
}

document.querySelectorAll('.genre-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGenre(btn.dataset.genre);
  });
});

// Init with sandbox
renderGenre('sandbox');


// ──────────────────────────────────────────
// 10. ARCHITECTURE LAYER EXPAND
// ──────────────────────────────────────────
document.querySelectorAll('.arch-layer').forEach(layer => {
  layer.addEventListener('click', () => {
    layer.classList.toggle('active');
  });
});


// ──────────────────────────────────────────
// 11. SMOOTH ACTIVE NAV INDICATOR
// ──────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links li a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === '#' + e.target.id) {
          a.style.color = '#c4b5fd';
        }
      });
    }
  });
}, { rootMargin: '-40% 0px -40% 0px' });

sections.forEach(s => sectionObserver.observe(s));


// ──────────────────────────────────────────
// 12. STATE ANCHOR — ASA TAB SWITCHING
// ──────────────────────────────────────────
document.querySelectorAll('.asa-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.asa-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.asa-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.querySelector(`.asa-panel[data-asa-panel="${tab.dataset.asa}"]`);
    if (panel) panel.classList.add('active');
  });
});


// ──────────────────────────────────────────
// 13. STATE ANCHOR — ANIMATED SIGNAL FLOW
// Cycles through each node in the flow diagram, highlighting it in sequence.
// ──────────────────────────────────────────
(function initAnchorFlow() {
  const row = document.getElementById('anchorFlowRow');
  if (!row) return;

  const nodes = Array.from(row.querySelectorAll('.anchor-flow-node'));
  const arrows = Array.from(row.querySelectorAll('.anchor-flow-arrow'));
  let step = 0;
  let running = false;
  let intervalId = null;

  function activateStep(s) {
    nodes.forEach((n, i) => n.classList.toggle('active-step', i === s));
    arrows.forEach((a, i) => {
      a.style.opacity = (i === s - 1 || i === s) ? '1' : '0.35';
    });
  }

  function advance() {
    activateStep(step);
    step = (step + 1) % nodes.length;
  }

  // Start when the flow row is visible
  const flowObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !running) {
        running = true;
        activateStep(0);
        intervalId = setInterval(advance, 900);
      } else if (!e.isIntersecting && running) {
        running = false;
        clearInterval(intervalId);
        nodes.forEach(n => n.classList.remove('active-step'));
        arrows.forEach(a => a.style.opacity = '');
      }
    });
  }, { threshold: 0.4 });

  flowObserver.observe(row);
})();


// ──────────────────────────────────────────
// 14. ANCHOR COMPARE — STAGGERED ITEM REVEAL
// ──────────────────────────────────────────
document.querySelectorAll('.anchor-compare-list li').forEach((li, i) => {
  li.style.opacity = '0';
  li.style.transform = 'translateX(-12px)';
  li.style.transition = `opacity 0.4s ${i * 0.07}s ease, transform 0.4s ${i * 0.07}s ease`;
});

const compareObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('li').forEach(li => {
        li.style.opacity = '1';
        li.style.transform = 'translateX(0)';
      });
      compareObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.anchor-compare-list').forEach(list => compareObserver.observe(list));


// ══════════════════════════════════════════════════════
// 15. NETSYNC SHIELD — 20 ANTI-ROLLBACK MECHANISMS
// ══════════════════════════════════════════════════════

(function initNetSync() {

  // ── DATA: 7 Layers, 20 Mechanisms ──
  const NS_LAYERS = [
    {
      id: 1,
      name: 'Zeitkontrolle',
      fullName: 'Time Control',
      subtitle: 'Grundlage jeder Stabilität',
      color: '#06b6d4',
      mechanisms: [
        {
          num: 1,
          title: 'Globaler Server‑Tick',
          body: 'Der Server gibt eine einzige Zeitbasis vor. Alle Clients simulieren exakt dieselben Tick-Längen.',
          details: [
            'Einheitliche Ticks (z.B. 16 ms)',
            'Max. +2 Ticks Vorsprung erlaubt',
            'Globaler Tick-Counter als Referenz'
          ],
          effect: 'Verhindert „zu weit vorne simuliert → zurückspringen"'
        },
        {
          num: 2,
          title: 'Soft‑Sync statt Hard‑Sync',
          body: 'Wenn ein Client zu weit voraus ist: nicht sofort stoppen, sondern die Tick-Rate minimal drosseln.',
          details: [
            'Tick-Rate um ~0,5 ms pro Tick reduzieren',
            'Client gleitet sanft zurück',
            'Kein harter Stopp oder Freeze'
          ],
          effect: 'Client gleitet zurück in die richtige Zeit'
        },
        {
          num: 3,
          title: 'Heartbeat‑Drift‑Korrektur',
          body: 'Alle 1–2 Sekunden synchronisiert der Server die Client-Uhren über minimale Zeitstempel-Korrekturen.',
          details: [
            'Server sendet Zeitstempel alle 1–2s',
            'Client korrigiert interne Uhr (0,1–0,5 ms)',
            'Permanente Drift-Prävention'
          ],
          effect: 'Verhindert Zeitdrift → verhindert Rollbacks'
        }
      ]
    },
    {
      id: 2,
      name: 'Bewegung',
      fullName: 'Movement System',
      subtitle: 'Der Hauptverursacher von Glitches',
      color: '#7c3aed',
      mechanisms: [
        {
          num: 4,
          title: 'Client‑Prediction',
          body: 'Der Client simuliert Bewegung, Sprünge, Klettern und Interaktionen sofort lokal — ohne auf den Server zu warten.',
          details: [
            'Sofortige lokale Simulation',
            'Bewegung, Sprünge, Klettern',
            'Keine Eingabeverzögerung'
          ],
          effect: 'Keine Verzögerung → kein „Sticky Movement"'
        },
        {
          num: 5,
          title: 'Server‑Reconciliation (sanft)',
          body: 'Wenn der Server korrigiert: nicht teleportieren, sondern über 100–200 ms interpolieren.',
          details: [
            'Korrektur über 100–200 ms verteilt',
            'Fühlt sich wie „leicht abbremsen" an',
            'Niemals harte Teleportation'
          ],
          effect: 'Fühlt sich wie „leicht abbremsen" an, nicht wie „zurückspringen"'
        },
        {
          num: 6,
          title: 'Input‑Buffering',
          body: 'Der Client speichert die letzten 200–300 ms Input. Bei Server-Korrektur wird der Input erneut abgespielt.',
          details: [
            '200–300 ms Input-Historie',
            'Replay bei Korrektur',
            'Bewegung bleibt flüssig'
          ],
          effect: 'Verhindert harte Korrekturen'
        },
        {
          num: 7,
          title: 'Velocity‑Correction',
          body: 'Wenn möglich: Geschwindigkeit anpassen statt Position direkt zu ändern.',
          details: [
            'Geschwindigkeit statt Position korrigieren',
            'Natürliche Kurvenglättung',
            'Spieler merkt es kaum'
          ],
          effect: 'Spieler merkt die Korrektur praktisch nicht'
        }
      ]
    },
    {
      id: 3,
      name: 'Netzwerk',
      fullName: 'Network Layer',
      subtitle: 'Latenz & Paketverlust abfedern',
      color: '#2563eb',
      mechanisms: [
        {
          num: 8,
          title: 'Lag‑Compensation',
          body: 'Server berücksichtigt Ping, Paketverlust und Jitter bei allen Berechnungen.',
          details: [
            'Ping-basierte Zeitkompensation',
            'Paketverlust-Toleranz',
            'Jitter-Ausgleich'
          ],
          effect: 'Weniger harte Korrekturen trotz Latenz'
        },
        {
          num: 9,
          title: 'Dead‑Reckoning',
          body: 'Wenn Netzwerk-Daten fehlen, schätzt der Client die Bewegung voraus und korrigiert später sanft.',
          details: [
            'Vorausschätzung bei Paketverlust',
            'Sanfte Nachkorrektur',
            'Basiert auf letzter Geschwindigkeit'
          ],
          effect: 'Verhindert Zurückspringen bei Paketverlust'
        },
        {
          num: 10,
          title: 'Jitter‑Buffer',
          body: 'Kleine Verzögerung (5–15 ms), um schwankende Pakete zeitlich zu glätten.',
          details: [
            '5–15 ms Eingangspuffer',
            'Paket-Reordering',
            'Glättet Netzwerk-Schwankungen'
          ],
          effect: 'Verhindert Zick-Zack-Bewegung'
        }
      ]
    },
    {
      id: 4,
      name: 'Zonen',
      fullName: 'Zones & Authority',
      subtitle: 'Der kritische Teil des Systems',
      color: '#f59e0b',
      mechanisms: [
        {
          num: 11,
          title: 'Shadow‑Mode beim Zonenwechsel',
          body: 'Der neue Zonen-Simulator lädt die Zone im Hintergrund, simuliert 1–2 Ticks, vergleicht Hashes — erst dann aktiv.',
          details: [
            'Hintergrund-Laden der neuen Zone',
            '1–2 Test-Ticks im Shadow-Mode',
            'Hash-Vergleich vor Aktivierung'
          ],
          effect: 'Verhindert harte Übergänge → kein Zurückspringen'
        },
        {
          num: 12,
          title: 'Authority‑Handover mit Snapshot',
          body: 'Beim Wechsel sendet der alte Simulator einen Snapshot. Der neue übernimmt exakt diesen Zustand.',
          details: [
            'Exakter State-Snapshot',
            'Nahtlose Übergabe',
            'Keine State-Lücken möglich'
          ],
          effect: 'Keine State-Lücken beim Zonenwechsel'
        },
        {
          num: 13,
          title: 'Multi‑Simulator‑Redundanz',
          body: 'Mindestens 2–3 Clients simulieren dieselbe Zone gleichzeitig. Mehrheit gewinnt.',
          details: [
            '2–3 redundante Simulatoren',
            'Mehrheitsentscheid bei Divergenz',
            'Keine falschen Korrekturen'
          ],
          effect: 'Falsche Daten werden überStimmt — keine falschen Korrekturen'
        }
      ]
    },
    {
      id: 5,
      name: 'State',
      fullName: 'State Control',
      subtitle: 'Divergenz erkennen, bevor sie sichtbar wird',
      color: '#10b981',
      mechanisms: [
        {
          num: 14,
          title: 'State‑Hashing',
          body: 'Jede Zone erzeugt periodisch Hashes über Positionen, Objekte und NPCs. Der Server vergleicht.',
          details: [
            'Hash über Positionen, Objekte, NPCs',
            'Periodische Vergleiche auf dem Server',
            'Frühzeitige Divergenz-Erkennung'
          ],
          effect: 'Erkennt Divergenz, bevor sie sichtbar wird'
        },
        {
          num: 15,
          title: 'Micro‑Resync',
          body: 'Wenn Hashes abweichen: nur die betroffenen Objekte korrigieren, nicht die ganze Zone.',
          details: [
            'Nur betroffene Objekte korrigieren',
            'Interpolation über 100–300 ms',
            'Zone bleibt stabil'
          ],
          effect: 'Keine sichtbaren Sprünge — chirurgische Präzision'
        }
      ]
    },
    {
      id: 6,
      name: 'Server',
      fullName: 'Server Logic',
      subtitle: 'Konsens und Event-Ordering',
      color: '#ec4899',
      mechanisms: [
        {
          num: 16,
          title: 'Konsens‑Engine',
          body: 'Bei 3 simulierenden Clients nimmt der Server den Mehrheitswert. Falsche Clients werden sanft korrigiert.',
          details: [
            'Mehrheitsentscheid (2 von 3)',
            'Falscher Client wird sanft korrigiert',
            'Keine harten Rollbacks'
          ],
          effect: 'Verhindert harte Rollbacks durch Konsens'
        },
        {
          num: 17,
          title: 'Event‑Ordering (Lamport‑Clock)',
          body: 'Server ordnet Events global: Block platzieren, Crafting, Treffer, Interaktionen — alles in der richtigen Reihenfolge.',
          details: [
            'Globale Event-Reihenfolge',
            'Lamport-Clock Timestamp',
            'Keine widersprüchlichen Zustände'
          ],
          effect: 'Keine widersprüchlichen Zustände → kein Zurückspringen'
        }
      ]
    },
    {
      id: 7,
      name: 'Visual',
      fullName: 'Visual Correction',
      subtitle: 'Der Trick, den AAA-Games nutzen',
      color: '#a78bfa',
      mechanisms: [
        {
          num: 18,
          title: 'Interpolation statt Teleport',
          body: 'Alle Korrekturen werden über Zeit interpoliert — niemals instant. Der Spieler merkt es nicht.',
          details: [
            'Jede Korrektur über Zeit verteilt',
            'Niemals instantane Positionsänderung',
            'Smooth Lerp auf Client-Seite'
          ],
          effect: 'Spieler merkt Korrekturen nicht'
        },
        {
          num: 19,
          title: 'Animation‑Blending',
          body: 'Wenn die Position korrigiert wird, passt sich die Animation nahtlos an — kein Ruckeln.',
          details: [
            'Animation passt sich an Korrektur an',
            'Blending zwischen States',
            'Kein visuelles Ruckeln'
          ],
          effect: 'Visuell perfekte Übergänge'
        },
        {
          num: 20,
          title: 'Motion‑Smoothing',
          body: 'Kamera und Bewegung werden geglättet. Selbst harte Korrekturen wirken dadurch weich.',
          details: [
            'Kamera-Smoothing bei Korrekturen',
            'Bewegungs-Interpolation',
            'Subpixel-Genauigkeit'
          ],
          effect: 'Selbst harte Korrekturen wirken weich'
        }
      ]
    }
  ];

  const container = document.getElementById('nsLayersContainer');
  if (!container) return;

  // ── RENDER LAYER PANELS ──
  function renderLayerPanel(layer) {
    const mechCardsHTML = layer.mechanisms.map(m => `
      <div class="ns-mech-card" style="--layer-color:${layer.color}">
        <div class="ns-mc-header">
          <div class="ns-mc-num">${String(m.num).padStart(2, '0')}</div>
          <div class="ns-mc-title">${m.title}</div>
        </div>
        <div class="ns-mc-body">${m.body}</div>
        <ul class="ns-mc-details">
          ${m.details.map(d => `<li>${d}</li>`).join('')}
        </ul>
        <div class="ns-mc-effect">${m.effect}</div>
      </div>
    `).join('');

    return `
      <div class="ns-layer-panel${layer.id === 1 ? ' active' : ''}" data-ns-panel="${layer.id}" style="--layer-color:${layer.color}">
        <div class="ns-lp-header" style="--layer-color:${layer.color}">
          <div class="ns-lp-num">${String(layer.id).padStart(2, '0')}</div>
          <div class="ns-lp-info">
            <div class="ns-lp-title">${layer.fullName}</div>
            <div class="ns-lp-subtitle">${layer.subtitle}</div>
          </div>
          <div class="ns-lp-count">${layer.mechanisms.length} Mechanismen</div>
        </div>
        <div class="ns-mechs-grid">
          ${mechCardsHTML}
        </div>
      </div>
    `;
  }

  // Render all layer panels
  container.innerHTML = NS_LAYERS.map(renderLayerPanel).join('');

  // ── LAYER NAV SWITCHING ──
  document.querySelectorAll('.ns-layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const layerNum = btn.dataset.nsLayer;

      // Update nav buttons
      document.querySelectorAll('.ns-layer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update panels
      document.querySelectorAll('.ns-layer-panel').forEach(p => p.classList.remove('active'));
      const panel = document.querySelector(`.ns-layer-panel[data-ns-panel="${layerNum}"]`);
      if (panel) {
        panel.classList.add('active');
        // Re-observe for reveal animation on new cards
        panel.querySelectorAll('.ns-mech-card').forEach((el, i) => {
          el.classList.remove('revealed');
          el.setAttribute('data-reveal', '');
          if (i) el.setAttribute('data-reveal-delay', Math.min(i, 4));
          revealObserver.observe(el);
        });
      }
    });
  });

  // ── NETSYNC CANVAS — Animated particle sim showing smooth sync ──
  (function initNSSim() {
    const canvas = document.getElementById('netsyncCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    let correctionCount = 0;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = canvas.width = rect.width;
      H = canvas.height = rect.height;
    }

    // Two paths: server (authoritative) and client (predicted)
    const server = { x: 0, y: 0, vx: 1.2, vy: 0.6 };
    const client = { x: 0, y: 0, vx: 1.2, vy: 0.6 };
    const trail = { server: [], client: [] };
    const MAX_TRAIL = 120;

    function resetPaths() {
      server.x = W * 0.1; server.y = H * 0.5;
      client.x = W * 0.1; client.y = H * 0.5;
      server.vx = 1.2; server.vy = 0.6;
      client.vx = 1.2; client.vy = 0.6;
      trail.server = []; trail.client = [];
    }

    let frameCount = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      frameCount++;

      // Server path (smooth sine)
      const t = frameCount * 0.015;
      server.x = W * 0.1 + ((frameCount * 1.0) % (W * 0.8));
      server.y = H * 0.45 + Math.sin(t * 2) * (H * 0.18) + Math.sin(t * 0.7) * (H * 0.08);

      // Client prediction (slightly ahead, with occasional drift)
      const drift = Math.sin(frameCount * 0.03) * 8 + Math.cos(frameCount * 0.07) * 4;
      client.x = server.x + 3 + drift * 0.3;
      client.y = server.y + drift;

      // Every ~90 frames, simulate a "correction event"
      if (frameCount % 90 === 0) {
        correctionCount++;
        document.getElementById('nsCorrected').textContent = correctionCount;
      }

      // Smooth lerp correction
      client.x += (server.x - client.x) * 0.08;
      client.y += (server.y - client.y) * 0.08;

      // Trail
      trail.server.push({ x: server.x, y: server.y });
      trail.client.push({ x: client.x, y: client.y });
      if (trail.server.length > MAX_TRAIL) trail.server.shift();
      if (trail.client.length > MAX_TRAIL) trail.client.shift();

      // Draw server trail
      if (trail.server.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail.server[0].x, trail.server[0].y);
        for (let i = 1; i < trail.server.length; i++) {
          ctx.lineTo(trail.server[i].x, trail.server[i].y);
        }
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw client trail
      if (trail.client.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail.client[0].x, trail.client[0].y);
        for (let i = 1; i < trail.client.length; i++) {
          ctx.lineTo(trail.client[i].x, trail.client[i].y);
        }
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw server node
      const g1 = ctx.createRadialGradient(server.x, server.y, 0, server.x, server.y, 16);
      g1.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
      g1.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(server.x, server.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = g1;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(server.x, server.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();

      // Draw client node
      const g2 = ctx.createRadialGradient(client.x, client.y, 0, client.x, client.y, 14);
      g2.addColorStop(0, 'rgba(124, 58, 237, 0.4)');
      g2.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(client.x, client.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = g2;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(client.x, client.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#7c3aed';
      ctx.fill();

      // Draw lerp correction line
      const dist = Math.sqrt(Math.pow(server.x - client.x, 2) + Math.pow(server.y - client.y, 2));
      if (dist > 2) {
        ctx.beginPath();
        ctx.moveTo(client.x, client.y);
        ctx.lineTo(server.x, server.y);
        ctx.strokeStyle = `rgba(245, 158, 11, ${Math.min(dist / 30, 0.6)})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Labels
      ctx.font = '600 10px Inter, sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText('Server (Truth)', server.x + 10, server.y - 12);
      ctx.fillStyle = '#7c3aed';
      ctx.fillText('Client (Predicted)', client.x + 10, client.y + 18);

      // Reset if off-screen
      if (server.x > W * 0.9) {
        resetPaths();
      }

      // Draw grid dots
      for (let gx = 0; gx < W; gx += 40) {
        for (let gy = 0; gy < H; gy += 40) {
          ctx.beginPath();
          ctx.arc(gx, gy, 0.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          ctx.fill();
        }
      }

      requestAnimationFrame(draw);
    }

    let running = false;
    const simObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !running) {
          running = true;
          resize();
          resetPaths();
          requestAnimationFrame(draw);
        }
      });
    }, { threshold: 0.2 });

    window.addEventListener('resize', resize);
    resize();
    simObserver.observe(canvas);
  })();

  // ── RESULTS BAR ANIMATION ──
  const resultsObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.ns-rc-fill').forEach(bar => {
          const pct = getComputedStyle(bar).getPropertyValue('--rp').trim();
          bar.style.width = pct;
        });
        resultsObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  const resultsGrid = document.querySelector('.ns-results-grid');
  if (resultsGrid) {
    resultsGrid.querySelectorAll('.ns-rc-fill').forEach(b => b.style.width = '0');
    resultsObserver.observe(resultsGrid);
  }

})();
