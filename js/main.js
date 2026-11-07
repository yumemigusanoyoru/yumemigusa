/* =========================================================
   夢見草の夜、君と 公式サイト 共通スクリプト
   ・スマホのメニュー開閉
   ・舞う桜の花びらと金の光の粒
   ・スクロールでふわっと表示
   ・キャラクター切り替え
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  setupCurrentNav();
  setupFadeIn();
  setupCharacterTabs();
  setupPetals();
});

/* ---------- スマホのメニュー ---------- */
function setupMenu() {
  const button = document.querySelector(".menu-toggle");
  if (!button) return;
  button.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    button.setAttribute("aria-expanded", isOpen);
  });
  document.querySelectorAll(".global-nav a").forEach((link) => {
    link.addEventListener("click", () => document.body.classList.remove("menu-open"));
  });
}

/* ---------- 今いるページのメニューに印をつける ---------- */
function setupCurrentNav() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".global-nav a").forEach((link) => {
    if (link.getAttribute("href") === page) link.classList.add("is-current");
  });
}

/* ---------- スクロールでふわっと表示 ---------- */
function setupFadeIn() {
  const targets = document.querySelectorAll(".fade-in");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach((el) => observer.observe(el));
}

/* ---------- キャラクター切り替え ---------- */
function setupCharacterTabs() {
  const tabs = document.querySelectorAll(".chara-tab");
  if (!tabs.length) return;

  function show(id) {
    tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.target === id));
    document.querySelectorAll(".chara-detail").forEach((d) => {
      d.classList.toggle("is-active", d.id === id);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      show(tab.dataset.target);
      history.replaceState(null, "", "#" + tab.dataset.target);
    });
  });

  // URLの末尾に #iori などがあれば、そのキャラを最初に表示
  const hash = location.hash.replace("#", "");
  if (hash && document.getElementById(hash)) show(hash);
}

/* ---------- 舞う桜の花びらと金の光の粒 ---------- */
function setupPetals() {
  const canvas = document.getElementById("petals");
  if (!canvas) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  let width, height, items;

  // 数を変えたいときはここを調整（スマホは少なめ）
  const PETAL_COUNT = window.innerWidth < 600 ? 14 : 28;
  const SPARK_COUNT = window.innerWidth < 600 ? 20 : 40;

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function makePetal(startAnywhere) {
    return {
      type: "petal",
      x: Math.random() * width,
      y: startAnywhere ? Math.random() * height : -20,
      size: 6 + Math.random() * 7,
      speedY: 0.4 + Math.random() * 0.8,
      speedX: -0.3 + Math.random() * 0.8,
      angle: Math.random() * Math.PI * 2,
      spin: -0.02 + Math.random() * 0.04,
      sway: Math.random() * Math.PI * 2,
      alpha: 0.5 + Math.random() * 0.4,
    };
  }

  function makeSpark() {
    return {
      type: "spark",
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.6 + Math.random() * 1.6,
      speedY: -0.05 - Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.scale(1, Math.abs(Math.cos(p.angle * 1.5)) * 0.6 + 0.4); // ひらひら感
    ctx.globalAlpha = p.alpha;
    const g = ctx.createLinearGradient(0, -p.size, 0, p.size);
    g.addColorStop(0, "#fde3ec");
    g.addColorStop(1, "#e891ad");
    ctx.fillStyle = g;
    ctx.beginPath();
    // 先が少し割れた桜の花びらの形
    ctx.moveTo(0, p.size);
    ctx.bezierCurveTo(p.size * 0.9, p.size * 0.4, p.size * 0.7, -p.size * 0.8, p.size * 0.18, -p.size);
    ctx.lineTo(0, -p.size * 0.72);
    ctx.lineTo(-p.size * 0.18, -p.size);
    ctx.bezierCurveTo(-p.size * 0.7, -p.size * 0.8, -p.size * 0.9, p.size * 0.4, 0, p.size);
    ctx.fill();
    ctx.restore();
  }

  function drawSpark(s, time) {
    const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.0015 + s.phase));
    ctx.save();
    ctx.globalAlpha = twinkle * 0.8;
    ctx.fillStyle = "#f3d993";
    ctx.shadowColor = "#e8c77a";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function tick(time) {
    ctx.clearRect(0, 0, width, height);
    items.forEach((item, i) => {
      if (item.type === "petal") {
        item.sway += 0.015;
        item.x += item.speedX + Math.sin(item.sway) * 0.5;
        item.y += item.speedY;
        item.angle += item.spin;
        if (item.y > height + 20 || item.x < -30 || item.x > width + 30) items[i] = makePetal(false);
        drawPetal(item);
      } else {
        item.y += item.speedY;
        if (item.y < -10) { item.y = height + 10; item.x = Math.random() * width; }
        drawSpark(item, time);
      }
    });
    requestAnimationFrame(tick);
  }

  resize();
  items = [];
  for (let i = 0; i < SPARK_COUNT; i++) items.push(makeSpark());
  for (let i = 0; i < PETAL_COUNT; i++) items.push(makePetal(true));
  window.addEventListener("resize", resize);
  requestAnimationFrame(tick);
}
