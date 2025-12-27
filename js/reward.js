(() => {
  const KEY_UNLOCK = "gesya_unlocked";

  // keamanan: kalau belum unlock PIN, balik
  if (localStorage.getItem(KEY_UNLOCK) !== "1") {
    window.location.href = "index.html";
    return;
  }

  function isAllLevelDone() {
    for (let i = 1; i <= 6; i++) {
      const done = localStorage.getItem(`ek_level${i}_selesai`);
      if (done !== "1") return false;
    }
    return true;
  }

  if (!isAllLevelDone()) {
    window.location.href = "index.html";
    return;
  }

  // ===============================
  // OPENING ANIMATION (MERIAH BANGET)
  // ===============================
  function injectOpeningCSS() {
    if (document.getElementById("ek-opening-css")) return;

    const style = document.createElement("style");
    style.id = "ek-opening-css";
    style.textContent = `
      /* overlay */
      .ekOpening {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: grid;
        place-items: center;
        overflow: hidden;
        background:
          radial-gradient(1200px 600px at 20% 20%, rgba(255,183,3,.35), transparent 55%),
          radial-gradient(1000px 500px at 80% 25%, rgba(59,130,246,.35), transparent 55%),
          radial-gradient(900px 500px at 50% 85%, rgba(168,85,247,.25), transparent 60%),
          linear-gradient(180deg, #070a18, #0b1026 55%, #070a18);
        animation: ekFadeOut .6s ease forwards;
        animation-delay: 2.15s;
      }
      @keyframes ekFadeOut { to { opacity: 0; visibility: hidden; } }

      /* title + sub */
      .ekOpeningCard {
        text-align: center;
        padding: 22px 18px;
        border-radius: 22px;
        background: rgba(255,255,255,.06);
        border: 1px solid rgba(255,255,255,.12);
        backdrop-filter: blur(10px);
        box-shadow: 0 18px 60px rgba(0,0,0,.45);
        transform: translateY(12px) scale(.98);
        animation: ekCardIn .9s cubic-bezier(.2,.9,.2,1) forwards;
      }
      @keyframes ekCardIn {
        0% { opacity: 0; transform: translateY(18px) scale(.95); }
        60% { opacity: 1; transform: translateY(-6px) scale(1.01); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }

      .ekOpeningTitle {
        font-weight: 900;
        letter-spacing: .6px;
        font-size: clamp(24px, 5vw, 44px);
        margin: 0 0 8px;
        line-height: 1.05;
        color: #fff;
        text-shadow: 0 10px 30px rgba(0,0,0,.45);
        animation: ekPop 1.1s cubic-bezier(.2,.9,.2,1) both;
      }
      @keyframes ekPop {
        0% { transform: scale(.75) rotate(-2deg); filter: blur(2px); opacity: 0; }
        55% { transform: scale(1.08) rotate(1deg); filter: blur(0); opacity: 1; }
        100% { transform: scale(1) rotate(0); }
      }

      .ekOpeningSub {
        margin: 0;
        font-size: clamp(13px, 2.8vw, 16px);
        color: rgba(255,255,255,.82);
      }

      /* sparkle dots */
      .ekSparkle {
        position: absolute;
        width: 6px;
        height: 6px;
        border-radius: 999px;
        opacity: .9;
        filter: drop-shadow(0 0 10px rgba(255,255,255,.35));
        animation: ekSpark 1.25s ease-out forwards;
      }
      @keyframes ekSpark {
        0%   { transform: translate(0,0) scale(1); opacity: 0; }
        20%  { opacity: 1; }
        100% { transform: translate(var(--dx), var(--dy)) scale(.2); opacity: 0; }
      }

      /* radial fireworks pieces */
      .ekFire {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 3px;
        opacity: .95;
        transform: translate(-50%, -50%) scale(1);
        animation: ekFire 1.2s ease-out forwards;
      }
      @keyframes ekFire {
        0%   { transform: translate(-50%, -50%) scale(.4); opacity: 0; }
        20%  { opacity: 1; }
        100% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) rotate(260deg) scale(.15); opacity: 0; }
      }

      /* burst confetti */
      .ekBurst {
        position: absolute;
        width: 8px;
        height: 14px;
        border-radius: 2px;
        opacity: .95;
        animation: ekBurst 1.55s cubic-bezier(.12,.9,.2,1) forwards;
        transform: translate(-50%, -50%);
      }
      @keyframes ekBurst {
        0%   { transform: translate(-50%, -50%) translate(0,0) rotate(0deg) scale(1); opacity: 0; }
        15%  { opacity: 1; }
        100% { transform: translate(-50%, -50%) translate(var(--bx), var(--by)) rotate(720deg) scale(.35); opacity: 0; }
      }

      /* safety: jangan ikut print */
      @media print {
        .ekOpening { display: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function removeOpeningOverlay() {
    const el = document.getElementById("ekOpening");
    if (el) el.remove();
  }

  function createOpeningOverlay(namaText) {
    // kalau overlay pernah dibuat, jangan dobel
    if (document.getElementById("ekOpening")) return;

    injectOpeningCSS();

    const overlay = document.createElement("div");
    overlay.className = "ekOpening";
    overlay.id = "ekOpening";

    const card = document.createElement("div");
    card.className = "ekOpeningCard";

    const title = document.createElement("h1");
    title.className = "ekOpeningTitle";
    title.textContent = "🎉 SELAMAT! 🎉";

    const sub = document.createElement("p");
    sub.className = "ekOpeningSub";
    sub.textContent = `Sertifikat kamu siap, ${namaText || "TEMAN"} ✨`;

    card.appendChild(title);
    card.appendChild(sub);
    overlay.appendChild(card);

    document.body.appendChild(overlay);

    // warna biar heboh
    const colors = ["#ffb703", "#3b82f6", "#10b981", "#ef4444", "#a855f7", "#f59e0b", "#22c55e", "#e11d48"];

    // sparkle random
    for (let i = 0; i < 28; i++) {
      const s = document.createElement("i");
      s.className = "ekSparkle";
      s.style.left = (Math.random() * 100) + "vw";
      s.style.top = (Math.random() * 100) + "vh";
      s.style.background = colors[Math.floor(Math.random() * colors.length)];
      s.style.setProperty("--dx", ((Math.random() * 220) - 110) + "px");
      s.style.setProperty("--dy", ((Math.random() * 220) - 110) + "px");
      s.style.animationDelay = (Math.random() * 0.35) + "s";
      overlay.appendChild(s);
    }

    // firework radial (3 titik ledakan)
    const bursts = [
      { x: 18, y: 28 },
      { x: 82, y: 30 },
      { x: 50, y: 22 },
    ];
    bursts.forEach((b, bi) => {
      const cx = b.x + "vw";
      const cy = b.y + "vh";

      // pecahan kembang api
      for (let i = 0; i < 26; i++) {
        const p = document.createElement("i");
        p.className = "ekFire";
        p.style.left = cx;
        p.style.top = cy;
        p.style.background = colors[Math.floor(Math.random() * colors.length)];

        const angle = (Math.PI * 2) * (i / 26);
        const dist = 120 + Math.random() * 110;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;

        p.style.setProperty("--x", dx + "px");
        p.style.setProperty("--y", dy + "px");
        p.style.animationDelay = (0.05 * bi) + (Math.random() * 0.12) + "s";
        p.style.width = (7 + Math.random() * 7) + "px";
        p.style.height = (7 + Math.random() * 7) + "px";
        overlay.appendChild(p);
      }

      // confetti burst dari titik yang sama (lebih “rame”)
      for (let i = 0; i < 34; i++) {
        const c = document.createElement("i");
        c.className = "ekBurst";
        c.style.left = cx;
        c.style.top = cy;
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.width = (6 + Math.random() * 7) + "px";
        c.style.height = (10 + Math.random() * 16) + "px";

        const ang = (Math.PI * 2) * Math.random();
        const d = 180 + Math.random() * 180;
        const bx = Math.cos(ang) * d;
        const by = Math.sin(ang) * d;

        c.style.setProperty("--bx", bx + "px");
        c.style.setProperty("--by", by + "px");
        c.style.animationDelay = (0.03 * bi) + (Math.random() * 0.12) + "s";
        overlay.appendChild(c);
      }
    });

    // auto hilang (match sama CSS fade)
    setTimeout(removeOpeningOverlay, 2850);

    // safety: kalau user tiba-tiba print pas overlay lagi tampil
    window.addEventListener("beforeprint", removeOpeningOverlay, { once: true });
  }

  // ===== Identitas =====
  const nama = (localStorage.getItem("ek_nama") || "").trim();
  const umur = (localStorage.getItem("ek_umur") || "").trim();
  const sekolah = (localStorage.getItem("ek_sekolah") || "").trim();

  // tampilkan opening party setelah DOM siap (biar nggak nge-lag)
  // kalau kamu pengin lebih cepet, pindah ke bawah createOpeningOverlay tanpa requestAnimationFrame
  requestAnimationFrame(() => createOpeningOverlay(nama ? nama.toUpperCase() : "TEMAN"));

  const elNama = document.getElementById("cNama");
  const elUmur = document.getElementById("cUmur");
  const elSekolah = document.getElementById("cSekolah");

  if (elNama) elNama.textContent = nama ? nama.toUpperCase() : "TEMAN";
  if (elUmur) elUmur.textContent = umur ? `${umur} tahun` : "-";
  if (elSekolah) elSekolah.textContent = sekolah ? sekolah.toUpperCase() : "-";

  // ===== Skor tiap level =====
  const s1 = parseInt(localStorage.getItem("ek_level1_skor") || "0", 10);
  const s2 = parseInt(localStorage.getItem("ek_level2_skor") || "0", 10);
  const s3 = parseInt(localStorage.getItem("ek_level3_skor") || "0", 10);
  const s4 = parseInt(localStorage.getItem("ek_level4_skor") || "0", 10);
  const s5 = parseInt(localStorage.getItem("ek_level5_skor") || "0", 10);
  const s6 = parseInt(localStorage.getItem("ek_level6_skor") || "0", 10);

  function toStars(score) {
    let n = 0;
    if (score <= 0) n = 0;
    else if (score <= 2) n = 1;
    else if (score <= 5) n = 2;
    else if (score <= 8) n = 3;
    else if (score <= 11) n = 4;
    else n = 5;

    const on = "★".repeat(n);
    const off = "★".repeat(5 - n);
    return `<span class="on">${on}</span><span class="off">${off}</span>`;
  }

  [
    ["star1", s1],
    ["star2", s2],
    ["star3", s3],
    ["star4", s4],
    ["star5", s5],
    ["star6", s6],
  ].forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = toStars(val);
  });

  // ===== Tanggal =====
  const elDate = document.getElementById("cDate");
  const now = new Date();
  const tgl = now.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  if (elDate) elDate.textContent = `📅 Tanggal: ${tgl}`;

  // ===== PRINT SAFETY (cuma bantu fallback) =====
  function prepareForPrint() {
    // hilangkan opening overlay kalau masih ada
    removeOpeningOverlay();

    const cert = document.getElementById("certBox");
    if (cert) {
      cert.style.opacity = "1";
      cert.style.transform = "none";
    }

    // fallback ekstra: kalau browser ngeyel gradient text pas print
    const lulus = document.querySelector(".lulusWord");
    if (lulus) {
      lulus.style.background = "none";
      lulus.style.color = "#16a34a";
      lulus.style.webkitTextFillColor = "#16a34a";
      lulus.style.textShadow = "none";
    }
  }

  window.addEventListener("beforeprint", prepareForPrint);

  // bikin tombol print lebih stabil di HP
  const btnPrint = document.querySelector('.btn.btn-yellow[onclick*="window.print"]');
  if (btnPrint) {
    btnPrint.onclick = (e) => {
      e.preventDefault();
      prepareForPrint();
      setTimeout(() => window.print(), 150);
    };
  }

  // ===== CONFETTI (MERIAH LAGI, tapi nanti disembunyikan saat print oleh CSS) =====
  const confetti = document.getElementById("confetti");
  if (confetti) {
    const colors = ["#ffb703", "#3b82f6", "#10b981", "#ef4444", "#a855f7", "#f59e0b"];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement("i");
      p.style.left = (Math.random() * 100) + "vw";
      p.style.animationDuration = (4 + Math.random() * 4.5) + "s";
      p.style.animationDelay = (Math.random() * 2.2) + "s";
      p.style.width = (7 + Math.random() * 7) + "px";
      p.style.height = (10 + Math.random() * 12) + "px";
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.opacity = (0.65 + Math.random() * 0.35).toFixed(2);
      confetti.appendChild(p);
    }
  }
})();
