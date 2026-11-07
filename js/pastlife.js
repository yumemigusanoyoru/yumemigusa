/* =========================================================
   キャラクターページ：今世／前世の切り替え
   下の PAST_LIVES に書いたキャラだけ、「今世｜前世」ボタンが付きます。
   前世の立ち絵は images/chara/ に置いてください。
   ========================================================= */

(function () {
  /* ---------- 前世の情報 ---------- */
  const PAST_LIVES = {
    yuzuki: {
      name: "花祈姫",
      ruby: "はなのりひめ",
      role: "常夜の灯",
      image: "images/chara/hananorihime.png",
      stillId: "hananorihime",   // スチル：images/chara/hananorihime-still1.jpg …
      intro: "古き時代、祈りと記憶を司る一族に生まれた姫。<br>“記憶紡ぎ”と“夢渡り”という特別な力を持っていた。",
      quote: "",
    },
    genma: {
      name: "蒼真",
      ruby: "そうま",
      role: "暁の蒼",
      image: "images/chara/souma.png",
      stillId: "souma",   // スチル：images/chara/souma-still1.jpg …
      intro: "花祈姫に仕えた“蒼の護衛”。<br>朔夜とは異なる役割を担い、主に宮中の外側で姫を守っていた。",
      quote: "「ご安心ください。貴女は必ずや、私が守ります」",
    },
    iori: {
      name: "朔夜",
      ruby: "さくや",
      role: "月なき夜",
      image: "images/chara/sakuya.png",
      stillId: "sakuya",   // スチル：images/chara/sakuya-still1.jpg …
      intro: "花祈姫の護衛の中でも、もっとも近くで彼女を守り続けた男。<br>時に自身を犠牲にするほど、花祈姫のことを常に第一に想っていた。",
      quote: "「ひとつだけ覚えていてください。どこにいても、私は必ず貴女を見つけます」",
    },
  };

  /* ---------- 見た目 ---------- */
  const style = document.createElement("style");
  style.textContent = `
    .life-toggle {
      display: inline-flex;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 3px;
      margin-bottom: 18px;
      background: rgba(7, 11, 31, 0.4);
    }
    .life-toggle button {
      background: none;
      border: none;
      border-radius: 999px;
      padding: 5px 20px;
      font-family: var(--font-title);
      font-size: 0.9rem;
      letter-spacing: 0.2em;
      color: var(--text-sub);
      cursor: pointer;
      transition: background .3s, color .3s, box-shadow .3s;
    }
    .life-toggle button:hover { color: var(--text); }
    .life-toggle button.is-on {
      background: rgba(232, 199, 122, 0.16);
      color: var(--gold);
      box-shadow: 0 0 12px var(--gold-soft);
    }
    .chara-past-note {
      font-size: 0.85rem;
      color: var(--text-sub);
      letter-spacing: 0.1em;
      margin: 4px 0 20px;
    }
    .chara-detail .is-hidden { display: none !important; }
    .life-fade { animation: lifeFade .6s ease; }
    @keyframes lifeFade {
      from { opacity: 0; filter: blur(4px); }
      to   { opacity: 1; filter: none; }
    }
  `;
  document.head.appendChild(style);

  /* ---------- 「今世｜前世」ボタンを作る ---------- */
  function makeToggle(section) {
    const box = document.createElement("div");
    box.className = "life-toggle";
    box.innerHTML = '<button type="button" data-life="now">今世</button><button type="button" data-life="past">前世</button>';
    box.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (btn) setLife(section, btn.dataset.life);
    });
    return box;
  }

  function setLife(section, life) {
    const isPast = life === "past";
    const parts = section._life;
    parts.nowStand.classList.toggle("is-hidden", isPast);
    parts.nowText.classList.toggle("is-hidden", isPast);
    parts.pastStand.classList.toggle("is-hidden", !isPast);
    parts.pastText.classList.toggle("is-hidden", !isPast);

    const shown = isPast ? [parts.pastStand, parts.pastText] : [parts.nowStand, parts.nowText];
    shown.forEach((el) => {
      el.classList.remove("life-fade");
      void el.offsetWidth;          // アニメーションをやり直すため
      el.classList.add("life-fade");
    });

    section.querySelectorAll(".life-toggle button").forEach((b) => {
      b.classList.toggle("is-on", b.dataset.life === life);
    });
  }

  /* ---------- 各キャラに前世を追加 ---------- */
  Object.entries(PAST_LIVES).forEach(([id, past]) => {
    const section = document.getElementById(id);
    if (!section) return;
    const nowStand = section.querySelector(".chara-stand");
    const nowText = section.querySelector(".chara-text");
    if (!nowStand || !nowText) return;

    const nowName = (section.querySelector(".chara-name")?.lastChild?.textContent || "").trim();

    // 前世の立ち絵
    const pastStand = document.createElement("div");
    pastStand.className = "chara-stand is-hidden";
    pastStand.innerHTML = `<img src="${past.image}" alt="${past.name}">`;

    // 前世のプロフィール（年齢・身長などは今世の欄をそのまま使う）
    const pastText = document.createElement("div");
    pastText.className = "chara-text is-hidden";
    pastText.dataset.stillId = past.stillId;
    const profile = section.querySelector(".chara-profile");
    pastText.innerHTML = `
      <p class="chara-role">${past.role}</p>
      <h2 class="chara-name"><span class="ruby">${past.ruby}</span>${past.name}</h2>
      <p class="chara-past-note">${nowName}の前世</p>
      ${profile ? profile.outerHTML : ""}
      <p>${past.intro}</p>
      ${past.quote ? `<p class="chara-quote">${past.quote}</p>` : ""}
    `;

    nowStand.after(pastStand);
    nowText.after(pastText);

    nowText.prepend(makeToggle(section));
    pastText.prepend(makeToggle(section));

    section._life = { nowStand, nowText, pastStand, pastText };
    setLife(section, "now");
    [nowStand, nowText].forEach((el) => el.classList.remove("life-fade"));
  });
})();
