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


/* =========================================================
   ここから追加：「ページの上に戻る」ボタン と ニュースの「NEW」マーク
   （main.js のいちばん最後に、まるごと貼り付けてください）
   ========================================================= */
(function () {
  /* ===== 設定（ここだけ書き換えればOK） ===== */
  const NEW_DAYS = 7;        // いちばん新しいお知らせに、公開から何日間「NEW」を付けるか（公開日を1日目と数えます）
  const SHOW_AFTER = 400;    // 何pxスクロールしたら「上に戻る」ボタンを出すか
  /* ========================================= */

  /* ---------- 見た目 ---------- */
  const style = document.createElement("style");
  style.textContent = `
    .to-top {
      position: fixed;
      right: calc(20px + env(safe-area-inset-right));
      bottom: calc(20px + env(safe-area-inset-bottom));
      z-index: 90;
      width: 52px;
      height: 52px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1px;
      padding: 0;
      border: 1px solid var(--sakura, #f2b8cb);
      border-radius: 50%;
      background: rgba(13, 20, 51, 0.82);
      color: var(--sakura, #f2b8cb);
      font-family: var(--font-title, serif);
      font-size: 9px;
      letter-spacing: 0.12em;
      cursor: pointer;
      box-shadow: 0 0 14px rgba(242, 184, 203, 0.35);
      opacity: 0;
      visibility: hidden;
      transform: translateY(12px);
      transition: opacity .35s, transform .35s, visibility .35s, background .3s, box-shadow .3s;
      -webkit-tap-highlight-color: transparent;
      -webkit-backdrop-filter: blur(4px);
      backdrop-filter: blur(4px);
    }
    .to-top.is-shown { opacity: 1; visibility: visible; transform: none; }
    .to-top svg { width: 16px; height: 16px; }
    @media (hover: hover) {
      .to-top:hover {
        background: rgba(242, 184, 203, 0.18);
        box-shadow: 0 0 22px rgba(242, 184, 203, 0.6);
      }
    }
    .to-top:focus-visible { outline: 2px solid var(--gold, #e8c77a); outline-offset: 3px; }
    @media (max-width: 600px) {
      .to-top { width: 46px; height: 46px; right: calc(14px + env(safe-area-inset-right)); bottom: calc(14px + env(safe-area-inset-bottom)); }
    }

    .news-new {
      display: inline-block;
      margin: 0 6px;
      padding: 0 7px;
      border-radius: 3px;
      background: linear-gradient(180deg, #f6dfa0, var(--gold, #e8c77a));
      color: #0d1330;
      font-family: var(--font-body, sans-serif);
      font-size: 0.68rem;
      font-weight: 500;
      line-height: 1.7;
      letter-spacing: 0.1em;
      vertical-align: 0.12em;
      box-shadow: 0 0 10px rgba(232, 199, 122, 0.55);
      animation: newGlow 2.4s ease-in-out infinite;
    }
    .news-list .news-new { margin: 0 8px 0 0; }
    @keyframes newGlow {
      0%, 100% { box-shadow: 0 0 6px rgba(232, 199, 122, 0.35); }
      50%      { box-shadow: 0 0 14px rgba(232, 199, 122, 0.8); }
    }
    @media (prefers-reduced-motion: reduce) { .news-new { animation: none; } }
  `;
  document.head.appendChild(style);

  /* ---------- 「ページの上に戻る」ボタン ---------- */
  function setupToTop() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "to-top";
    btn.setAttribute("aria-label", "ページの上に戻る");
    btn.innerHTML =
      '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 10l5-5 5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>TOP</span>';
    document.body.appendChild(btn);

    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
    });

    let ticking = false;
    function update() {
      btn.classList.toggle("is-shown", window.scrollY > SHOW_AFTER);
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- ニュースの「NEW」マーク（いちばん新しい1件だけ） ---------- */
  function setupNewMarks() {
    // 日本時間の「日付」を数字にする（何日離れているかを数えるため）
    const dayJST = (t) => Math.floor((t + 9 * 3600e3) / 86400e3);
    const today = dayJST(Date.now());

    // ページの中のお知らせの日付を全部読み取って、いちばん新しいものを探す
    let newest = null, newestDay = -Infinity;
    document.querySelectorAll(".news-date").forEach((el) => {
      const m = el.textContent.trim().match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})/);
      if (!m) return;
      const day = dayJST(Date.parse(`${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}T00:00:00+09:00`));
      if (day > newestDay) { newestDay = day; newest = el; }   // 同じ日付なら、上にあるほうを使う
    });
    if (!newest) return;

    // 公開から NEW_DAYS 日を過ぎていたら付けない
    const passed = today - newestDay;   // 公開日は 0
    if (passed < 0 || passed >= NEW_DAYS) return;

    const mark = document.createElement("span");
    mark.className = "news-new";
    mark.textContent = "NEW";
    if (newest.closest(".news-list")) {
      // トップページの一覧：タイトルの前に付ける
      const title = newest.nextElementSibling;
      if (title) title.prepend(mark); else newest.after(mark);
    } else {
      // ニュースページ：日付のすぐ後ろに付ける
      newest.after(mark);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { setupToTop(); setupNewMarks(); });
  } else {
    setupToTop();
    setupNewMarks();
  }
})();
/* ===== 追加ここまで ===== */
