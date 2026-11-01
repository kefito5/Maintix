/* ============ CONFIGURACIÓN ============ */
const NUMERO  = "50684475235"; // código de país + número, sin + ni espacios
const MENSAJE = "Hola Maintix, quisiera información sobre sus servicios.";
const PALABRAS = ["computadora.", "impresora."];

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ============ WHATSAPP ============ */
const waUrl = `https://wa.me/${NUMERO}?text=${encodeURIComponent(MENSAJE)}`;
$$("a.wa-link").forEach(a => { a.href = waUrl; a.target = "_blank"; a.rel = "noopener"; });
$("#year").textContent = new Date().getFullYear();

/* ============ ENTRADA: intro + revelado ============ */
function revealHero() {
  document.body.classList.add("ready");
  $$(".hero .reveal").forEach((el, i) => {
    el.style.setProperty("--d", `${i * 0.15}s`);
    requestAnimationFrame(() => el.classList.add("in"));
  });
  typeLoop();
}

if (reduce) {
  document.body.classList.add("ready");
  $$(".reveal").forEach(el => el.classList.add("in"));
  $("#typed").textContent = PALABRAS[0];
} else {
  window.addEventListener("load", () => {
    setTimeout(() => {
      $("#intro").classList.add("out");
      setTimeout(revealHero, 450);
      setTimeout(() => $("#intro").remove(), 1100);
    }, 1900);
  });
}

/* ============ EFECTO DE ESCRITURA ============ */
function typeLoop() {
  const el = $("#typed");
  let w = 0, c = 0, borrando = false;
  (function paso() {
    const palabra = PALABRAS[w];
    c += borrando ? -1 : 1;
    el.textContent = palabra.slice(0, c);
    let espera = borrando ? 45 : 95;
    if (!borrando && c === palabra.length) { borrando = true; espera = 1800; }
    else if (borrando && c === 0) { borrando = false; w = (w + 1) % PALABRAS.length; espera = 400; }
    setTimeout(paso, espera);
  })();
}

/* ============ REVELADO AL HACER SCROLL ============ */
if (!reduce) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  $$(".reveal:not(.hero .reveal)").forEach(el => {
    // Retraso escalonado entre hermanos
    const i = [...el.parentElement.children].indexOf(el);
    el.style.setProperty("--d", `${Math.min(i, 4) * 0.12}s`);
    io.observe(el);
  });
}

/* ============ BARRA DE PROGRESO + ENCABEZADO ============ */
const barra = $("#progress"), header = $("#top");
function alScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  barra.style.width = (max > 0 ? scrollY / max * 100 : 0) + "%";
  header.classList.toggle("scrolled", scrollY > 10);
}
addEventListener("scroll", alScroll, { passive: true });
alScroll();

/* ============ INCLINACIÓN 3D (logo y tarjetas) ============ */
function tilt(el, fuerza) {
  el.addEventListener("pointermove", e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${x * fuerza}deg) rotateX(${-y * fuerza}deg) translateZ(0)`;
  });
  el.addEventListener("pointerleave", () => { el.style.transform = ""; });
}
if (!reduce) {
  $$(".svc").forEach(c => tilt(c, 10));
  // el logo sigue al mouse en toda la sección principal
  const logo = $("#heroLogo img"), hero = $(".hero");
  hero.addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    logo.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 22}deg)`;
  });
  hero.addEventListener("pointerleave", () => { logo.style.transform = ""; });
}

/* ============ FONDO: hexágonos flotantes ============ */
if (!reduce) {
  const cv = $("#bg"), ctx = cv.getContext("2d");
  let W, H, hexes = [], mx = -999, my = -999;
  const colores = ["20,168,188", "27,110,138", "143,188,196"];

  function medir() {
    const d = devicePixelRatio || 1;
    W = cv.width = innerWidth * d; H = cv.height = innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    W /= d; H /= d;
    const n = Math.round(Math.min(34, innerWidth / 38));
    hexes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 14 + Math.random() * 46, v: 0.15 + Math.random() * 0.45,
      a: Math.random() * Math.PI, g: (Math.random() - 0.5) * 0.004,
      c: colores[Math.floor(Math.random() * colores.length)],
      o: 0.07 + Math.random() * 0.13
    }));
  }
  function hexagono(x, y, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const t = rot + i * Math.PI / 3;
      ctx[i ? "lineTo" : "moveTo"](x + r * Math.cos(t), y + r * Math.sin(t));
    }
    ctx.closePath();
  }
  function dibujar() {
    ctx.clearRect(0, 0, W, H);
    for (const h of hexes) {
      h.y -= h.v; h.a += h.g;
      if (h.y < -h.r * 2) { h.y = H + h.r * 2; h.x = Math.random() * W; }
      // el mouse empuja suavemente los hexágonos
      const dx = h.x - mx, dy = h.y - my, d = Math.hypot(dx, dy);
      if (d < 140) { h.x += dx / d * 1.6; h.y += dy / d * 1.6; }
      const brilla = d < 140 ? 0.35 : h.o;
      hexagono(h.x, h.y, h.r, h.a);
      ctx.strokeStyle = `rgba(${h.c},${brilla})`;
      ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = `rgba(${h.c},${brilla * 0.25})`; ctx.fill();
    }
    requestAnimationFrame(dibujar);
  }
  addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; });
  addEventListener("resize", medir);
  medir(); dibujar();
}