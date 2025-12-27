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
  // OPENING ANIMATION (TERANG + MERIAH + GERAK TERUS)
  // ===============================
  function injectOpeningCSS() {
    if (document.getElementById("ek-opening-css")) return;

    const style = document.createElement("style");
    style.id = "ek-opening-css";
    style.textContent = `
      .ekOpening{
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: grid;
        place-items: center;
        overflow: hidden;

        /* pastel cerah */
        background:
          radial-gradient(1000px 600px at 15% 20%, rgba(255, 220, 120, .90), transparent 55%),
          radial-gradient(900px 600px at 85% 20%, rgba(168, 255, 214, .85), transparent 55%),
          radial-gradient(1100px 700px at 50% 85%, rgba(181, 203, 255, .85), transparent 60%),
          linear-gradient(180deg, #fff7fd, #f2fbff 45%, #fffdf2);

        animation: ekFadeOut .55s ease forwards;
        animation-delay: 2.6s;
      }
      @keyframes ekFadeOut { to { opacity: 0; visibility: hidden; } }

      .ekOpeningCard{
        text-align: center;
        padding: 22px 18px;
        border-radius: 24px;
        background: rgba(255,255,255,.78);
        border: 2px solid rgba(255,255,255,.92);
        box-shadow: 0 18px 60px rgba(0,0,0,.12);
        backdrop-filter: blur(8px);
        transform: translateY(14px) scale(.98);
        animation: ekCardIn .85s cubic-bezier(.2,.9,.2,1) forwards;
      }
      @keyframes ekCardIn{
        0%{opacity:0; transform: translateY(20px) scale(.95);}
        70%{opacity:1; transform: translateY(-6px) scale(1.02);}
        100%{opacity:1; transform: translateY(0) scale(1);}
      }

      .ekOpeningTitle{
        margin: 0 0 8px;
        font-weight: 900;
        letter-spacing: .4px;
        font-size: clamp(26px, 5vw, 46px);
        color: #111827;
        animation: ekBounce 1.2s cubic-bezier(.2,.9,.2,1) both;
      }
      @keyframes ekBounce{
        0%{transform: scale(.7) translateY(8px); opacity:0;}
        60%{transform: scale(1.08) translateY(-6px); opacity:1;}
        100%{transform: scale(1) translateY(0);}
      }

      .ekOpeningSub{
        margin: 0;
        font-size: clamp(13px, 2.8vw, 16px);
        color: rgba(17,24,39,.78);
        font-weight: 800;
      }

      /* CONFETTI HUJAN (loop) */
      .ekRain{
        position:absolute;
        top:-10vh;
        left:0;
        width:100%;
        height:120vh;
        pointer-events:none;
      }
      .ekRain i{
        position:absolute;
        top:-12vh;
        width: 10px;
        height: 16px;
        border-radius: 3px;
        opacity: .95;
        animation-name: ekFall, ekSpin;
        animation-timing-function: linear, linear;
        animation-iteration-count: infinite, infinite;
      }
      @keyframes ekFall{
        0%{ transform: translateY(-10vh); }
        100%{ transform: translateY(130vh); }
      }
      @keyframes ekSpin{
        0%{ rotate: 0deg; }
        100%{ rotate: 720deg; }
      }

      /* BUBBLE / BALON NAIK (loop) */
      .ekBubbles{
        position:absolute;
        inset:0;
        pointer-events:none;
      }
      .ekBubble{
        position:absolute;
        bottom:-20vh;
        width: 26px;
        height: 26px;
        border-radius: 999px;
        opacity: .75;
        animation: ekFloat 7s ease-in infinite;
        box-shadow: inset 0 0 0 2px rgba(255,255,255,.75);
      }
      @keyframes ekFloat{
        0%{ transform: translateY(0) translateX(0) scale(.9); opacity:0; }
        15%{ opacity:.85; }
        100%{ transform: translateY(-145vh) translateX(var(--dx)) scale(1.25); opacity:0; }
      }

      /* safety: jangan ikut print */
      @media print{
        .ekOpening{ display:none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function removeOpeningOverlay() {
    const el = document.getElementById("ekOpening");
    if (el) el.remove();
  }

  function createOpeningOverlay(namaText) {
    if (document.getElementById("ekOpening")) return;

    injectOpeningCSS();

    const overlay = document.createElement("div");
    overlay.className = "ekOpening";
    overlay.id = "ekOpening";

    // layer confetti hujan
    const rain = document.createElement("div");
    rain.className = "ekRain";
    overlay.appendChild(rain);

    // layer bubbles
    const bubbles = document.createElement("div");
    bubbles.className = "ekBubbles";
    overlay.appendChild(bubbles);

    // card tengah
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
// BALON EMOJI
const balloons = ["🎈","🎉","🎊"];
for(let i=0;i<6;i++){
  const b = document.createElement("div");
  b.className = "ekBalloon";
  b.textContent = balloons[Math.floor(Math.random()*balloons.length)];
  b.style.left = (Math.random()*90)+"vw";
  b.style.animationDelay = (Math.random()*1.2)+"s";
  overlay.appendChild(b);
}

// BINTANG MUTER DI SEKITAR CARD
for(let i=0;i<8;i++){
  const s = document.createElement("div");
  s.className = "ekStar";
  s.textContent = "⭐";
  s.style.left = (45 + Math.cos(i)*18)+"vw";
  s.style.top  = (45 + Math.sin(i)*18)+"vh";
  overlay.appendChild(s);
}

    const colors = [
      "#ff5d8f", "#ffd166", "#06d6a0", "#4dabf7",
      "#b197fc", "#ffa94d", "#63e6be", "#74c0fc"
    ];

    // confetti hujan
    const totalConfetti = 85;
    for (let i = 0; i < totalConfetti; i++) {
      const c = document.createElement("i");
      c.style.left = (Math.random() * 100) + "vw";
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.width = (7 + Math.random() * 8) + "px";
      c.style.height = (10 + Math.random() * 16) + "px";
      c.style.opacity = (0.6 + Math.random() * 0.4).toFixed(2);

      const dur = (2.8 + Math.random() * 2.8).toFixed(2);
      const delay = (Math.random() * 0.9).toFixed(2);

      c.style.animationDuration = `${dur}s, ${(1.8 + Math.random() * 1.8).toFixed(2)}s`;
      c.style.animationDelay = `${delay}s, ${delay}s`;

      rain.appendChild(c);
    }

    // bubbles/balon
    const totalBubbles = 16;
    for (let i = 0; i < totalBubbles; i++) {
      const b = document.createElement("div");
      b.className = "ekBubble";
      b.style.left = (Math.random() * 100) + "vw";
      b.style.width = (18 + Math.random() * 26) + "px";
      b.style.height = b.style.width;

      // warna bubble pastel
      const col = colors[Math.floor(Math.random() * colors.length)];
      b.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,.9), ${col})`;

      b.style.setProperty("--dx", ((Math.random() * 120) - 60) + "px");
      b.style.animationDuration = (5.8 + Math.random() * 4.2).toFixed(2) + "s";
      b.style.animationDelay = (Math.random() * 0.8).toFixed(2) + "s";
      bubbles.appendChild(b);
    }

    // auto hilang
    setTimeout(removeOpeningOverlay, 3250);

    // safety kalau user klik print pas overlay masih tampil
    window.addEventListener("beforeprint", removeOpeningOverlay, { once: true });
  }

  // ===== Identitas =====
  const nama = (localStorage.getItem("ek_nama") || "").trim();
  const umur = (localStorage.getItem("ek_umur") || "").trim();
  const sekolah = (localStorage.getItem("ek_sekolah") || "").trim();

  // tampilkan opening party setelah DOM siap
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
    // overlay animasi jangan ikut kebawa
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

  // ===== CONFETTI HALAMAN (yang lama tetap ada) =====
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
