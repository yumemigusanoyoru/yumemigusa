/* =========================================================
   スペシャルページ：イラストギャラリー
   class="gallery-item" のリンクを押すと、画像を大きく表示します。
   ========================================================= */

(function () {
  /* ---------- 見た目 ---------- */
  const style = document.createElement("style");
  style.textContent = `
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 28px;
    }
    .gallery-item {
      display: block;
      cursor: zoom-in;
      color: var(--text);
    }
    .gallery-item .frame {
      aspect-ratio: 1200 / 1697;
      overflow: hidden;
      border: 1px solid var(--line);
      transition: border-color .3s, box-shadow .3s;
    }
    .gallery-item img {
      width: 100%; height: 100%;
      object-fit: cover;
      transition: transform .6s;
    }
    .gallery-item:hover { color: var(--sakura); }
    .gallery-item:hover .frame {
      border-color: var(--gold);
      box-shadow: 0 0 22px var(--gold-soft);
    }
    .gallery-item:hover img { transform: scale(1.04); }
    .gallery-item p {
      text-align: center;
      margin-top: 10px;
      font-family: var(--font-title);
      letter-spacing: 0.15em;
      transition: color .3s;
    }

    /* 拡大表示 */
    .gallery-viewer {
      position: fixed;
      inset: 0;
      z-index: 500;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 24px;
      background: rgba(7, 11, 31, 0.94);
      opacity: 0;
      visibility: hidden;
      transition: opacity .35s, visibility .35s;
      cursor: zoom-out;
    }
    .gallery-viewer.is-open { opacity: 1; visibility: visible; }
    .gallery-viewer img {
      max-width: 100%;
      max-height: calc(100% - 40px);
      border: 1px solid var(--line);
      box-shadow: 0 0 40px rgba(232, 199, 122, 0.25);
      transform: scale(0.96);
      transition: transform .35s;
    }
    .gallery-viewer.is-open img { transform: none; }
    .gallery-viewer p {
      font-family: var(--font-title);
      letter-spacing: 0.15em;
      color: var(--text);
    }
    .gallery-viewer-close {
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
  viewer.className = "gallery-viewer";
  viewer.innerHTML = '<img alt=""><p></p><button class="gallery-viewer-close" aria-label="閉じる">×</button>';
  document.body.appendChild(viewer);
  const viewerImg = viewer.querySelector("img");
  const viewerCaption = viewer.querySelector("p");

  function close() { viewer.classList.remove("is-open"); }
  viewer.addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const img = item.querySelector("img");
      viewerImg.src = item.getAttribute("href");
      viewerImg.alt = img ? img.alt : "";
      viewerCaption.textContent = item.querySelector("p")?.textContent || "";
      viewer.classList.add("is-open");
    });
  });
})();
