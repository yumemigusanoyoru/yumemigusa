/* =========================================================
   キャラクターページ：スチル表示
   images/chara/ に「キャラ名-still1.jpg」「キャラ名-still2.jpg」…
   を置くと、そのキャラのプロフィールの下に自動で表示されます。
   （例：genma-still1.jpg、iori-still2.jpg）
   前世は、hananorihime / souma / sakuya の名前で置きます
   （例：sakuya-still1.jpg）
   画像がないキャラには何も表示されません。
   ========================================================= */

(function () {
  const MAX_STILLS = 4;   // 1キャラにつき最大何枚まで探すか

  /* ---------- 見た目 ---------- */
  const style = document.createElement("style");
  style.textContent = `
    .chara-stills { margin-top: 28px; }
    .chara-stills-label {
      font-family: var(--font-title);
      font-size: 0.8rem;
      letter-spacing: 0.3em;
      color: var(--gold);
      margin-bottom: 10px;
    }
    .chara-stills-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .chara-still {
      display: block;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      border: 1px solid var(--line);
      cursor: zoom-in;
      transition: border-color .3s, box-shadow .3s;
    }
    .chara-still img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform .5s;
    }
    .chara-still:hover {
      border-color: var(--gold);
      box-shadow: 0 0 16px var(--gold-soft);
    }
    .chara-still:hover img { transform: scale(1.06); }

    /* 拡大表示 */
    .still-viewer {
      position: fixed;
      inset: 0;
      z-index: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: rgba(7, 11, 31, 0.92);
      opacity: 0;
      visibility: hidden;
      transition: opacity .35s, visibility .35s;
      cursor: zoom-out;
    }
    .still-viewer.is-open { opacity: 1; visibility: visible; }
    .still-viewer img {
      max-width: 100%;
      max-height: 100%;
      border: 1px solid var(--line);
      box-shadow: 0 0 40px rgba(232, 199, 122, 0.25);
      transform: scale(0.96);
      transition: transform .35s;
    }
    .still-viewer.is-open img { transform: none; }
    .still-viewer-close {
      position: absolute;
      top: 16px; right: 20px;
      width: 44px; height: 44px;
      border: 1px solid var(--line);
      border-radius: 50%;
      background: none;
      color: var(--text);
      font-size: 1.4rem;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  /* ---------- 拡大表示の枠 ---------- */
  const viewer = document.createElement("div");
  viewer.className = "still-viewer";
  viewer.innerHTML = '<img alt=""><button class="still-viewer-close" aria-label="閉じる">×</button>';
  document.body.appendChild(viewer);
  const viewerImg = viewer.querySelector("img");

  function openViewer(src, alt) {
    viewerImg.src = src;
    viewerImg.alt = alt;
    viewer.classList.add("is-open");
  }
  function closeViewer() {
    viewer.classList.remove("is-open");
  }
  viewer.addEventListener("click", closeViewer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeViewer();
  });

  /* ---------- 画像があるか確かめる ---------- */
  function exists(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  /* ---------- 各キャラにスチルを追加 ----------
     今世はキャラのID（genma など）、前世は data-still-id（sakuya など）で探します */
  function addStills() {
  document.querySelectorAll(".chara-detail .chara-text").forEach(async (textArea) => {
    const section = textArea.closest(".chara-detail");
    const id = textArea.dataset.stillId || section.id;
    const name = (textArea.querySelector(".chara-name")?.lastChild?.textContent || "").trim();
    if (!id) return;

    const found = [];
    for (let i = 1; i <= MAX_STILLS; i++) {
      const src = `images/chara/${id}-still${i}.jpg`;
      if (await exists(src)) found.push(src);
      else break;   // 番号が抜けたら、そこで探すのをやめる
    }
    if (!found.length) return;

    const box = document.createElement("div");
    box.className = "chara-stills";
    box.innerHTML = '<p class="chara-stills-label">STILL</p><div class="chara-stills-grid"></div>';
    const grid = box.querySelector(".chara-stills-grid");

    found.forEach((src, i) => {
      const a = document.createElement("a");
      a.className = "chara-still";
      a.href = src;
      const alt = `${name} スチル${i + 1}`;
      a.innerHTML = `<img src="${src}" alt="${alt}" loading="lazy">`;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        openViewer(src, alt);
      });
      grid.appendChild(a);
    });

    textArea.appendChild(box);
  });
  }

  // 前世の欄ができあがってから探すため、ページの読み込みが終わってから実行
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addStills);
  } else {
    addStills();
  }
})();
