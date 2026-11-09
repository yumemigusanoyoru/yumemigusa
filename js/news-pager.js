/* =========================================================
   ニュースページ：ページ分け
   ニュース記事（class="news-article"）を、指定した件数ごとに
   ページに分けて表示します。
   トップページなどから「news.html#記事のid」で来たときは、
   その記事があるページを自動で開きます。
   ========================================================= */

(function () {
  const PER_PAGE = 3;   // 1ページに表示する件数

  const articles = Array.from(document.querySelectorAll(".news-article"));
  if (articles.length <= PER_PAGE) return;   // 3件以下なら何もしない

  const totalPages = Math.ceil(articles.length / PER_PAGE);
  let current = 1;

  /* ---------- 見た目 ---------- */
  const style = document.createElement("style");
  style.textContent = `
    .news-article.is-paged-out { display: none; }
    .news-pager {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 16px;
    }
    .news-pager button {
      min-width: 44px;
      height: 44px;
      padding: 0 14px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: rgba(24, 33, 74, 0.5);
      color: var(--text);
      font-family: var(--font-title);
      font-size: 0.95rem;
      letter-spacing: 0.1em;
      cursor: pointer;
      transition: border-color .3s, color .3s, box-shadow .3s, opacity .3s;
    }
    .news-pager button:hover:not(:disabled) {
      border-color: var(--sakura);
      color: var(--sakura);
      box-shadow: 0 0 12px rgba(242, 184, 203, 0.4);
    }
    .news-pager button.is-current {
      border-color: var(--gold);
      color: var(--gold);
      background: rgba(232, 199, 122, 0.12);
      box-shadow: 0 0 12px var(--gold-soft);
      cursor: default;
    }
    .news-pager button:disabled:not(.is-current) {
      opacity: 0.3;
      cursor: default;
    }
    .news-article.page-fade { animation: newsPageIn .5s ease; }
    @keyframes newsPageIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: none; }
    }
  `;
  document.head.appendChild(style);

  /* ---------- ページ切り替えのボタン ---------- */
  const pager = document.createElement("nav");
  pager.className = "news-pager";
  pager.setAttribute("aria-label", "ニュースのページ");
  articles[articles.length - 1].after(pager);

  function makeButton(label, page, aria) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    if (aria) b.setAttribute("aria-label", aria);
    b.addEventListener("click", () => {
      showPage(page, true);
    });
    return b;
  }

  function renderPager() {
    pager.innerHTML = "";
    const prev = makeButton("‹", current - 1, "前のページ");
    prev.disabled = current === 1;
    pager.appendChild(prev);

    for (let p = 1; p <= totalPages; p++) {
      const b = makeButton(String(p), p, `${p}ページ目`);
      if (p === current) {
        b.classList.add("is-current");
        b.disabled = true;
        b.setAttribute("aria-current", "page");
      }
      pager.appendChild(b);
    }

    const next = makeButton("›", current + 1, "次のページ");
    next.disabled = current === totalPages;
    pager.appendChild(next);
  }

  /* ---------- 指定したページを表示 ---------- */
  function showPage(page, scrollUp) {
    current = Math.min(Math.max(page, 1), totalPages);
    const start = (current - 1) * PER_PAGE;
    const end = start + PER_PAGE;

    articles.forEach((a, i) => {
      const visible = i >= start && i < end;
      a.classList.toggle("is-paged-out", !visible);
      if (visible) {
        a.classList.add("is-visible");     // ふわっと表示の設定と重ならないように
        a.classList.remove("page-fade");
        void a.offsetWidth;
        a.classList.add("page-fade");
      }
    });
    renderPager();

    if (scrollUp) {
      const title = document.querySelector(".page-title") || articles[start];
      title.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* ---------- 「news.html#記事のid」で来たとき ---------- */
  function openFromHash() {
    const id = decodeURIComponent(location.hash.replace("#", ""));
    if (!id) return false;
    // 記事そのもの、または記事の中の小見出し（同じ日のお知らせをまとめたもの）を探す
    const target = document.getElementById(id);
    const article = target && target.closest(".news-article");
    const index = articles.indexOf(article);
    if (index === -1) return false;
    showPage(Math.floor(index / PER_PAGE) + 1, false);
    requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start" });
    });
    return true;
  }

  if (!openFromHash()) showPage(1, false);
  window.addEventListener("hashchange", openFromHash);
})();
