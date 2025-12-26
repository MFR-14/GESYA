(() => {
  "use strict";

  const KEY_UNLOCK = "gesya_unlocked";
  const MAX_LEVEL = 6;

  function goHome(){
    window.location.href = "index.html";
  }

  function isAllLevelDone(){
    for (let i = 1; i <= MAX_LEVEL; i++){
      const done = localStorage.getItem(`ek_level${i}_selesai`);
      if (done !== "1") return false;
    }
    return true;
  }

  function getInt(key){
    const v = parseInt(localStorage.getItem(key) || "0", 10);
    return Number.isFinite(v) ? v : 0;
  }

  function toStars(score){
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

  // ===== Proteksi =====
  if (localStorage.getItem(KEY_UNLOCK) !== "1") { goHome(); return; }
  if (!isAllLevelDone()) { goHome(); return; }

  // ===== Identitas =====
  const nama = (localStorage.getItem("ek_nama") || "").trim();
  const umur = (localStorage.getItem("ek_umur") || "").trim();
  const sekolah = (localStorage.getItem("ek_sekolah") || "").trim();

  const elNama = document.getElementById("cNama");
  const elUmur = document.getElementById("cUmur");
  const elSekolah = document.getElementById("cSekolah");

  if (elNama) elNama.textContent = nama ? nama.toUpperCase() : "TEMAN";
  if (elUmur) elUmur.textContent = umur ? `${umur} tahun` : "-";
  if (elSekolah) elSekolah.textContent = sekolah ? sekolah.toUpperCase() : "-";

  // ===== Bintang per level =====
  const scores = [
    getInt("ek_level1_skor"),
    getInt("ek_level2_skor"),
    getInt("ek_level3_skor"),
    getInt("ek_level4_skor"),
    getInt("ek_level5_skor"),
    getInt("ek_level6_skor"),
  ];

  for (let i = 1; i <= 6; i++){
    const el = document.getElementById(`star${i}`);
    if (el) el.innerHTML = toStars(scores[i-1]);
  }

  // ===== Tanggal =====
  const elDate = document.getElementById("cDate");
  const now = new Date();
  const tgl = now.toLocaleDateString("id-ID", { day:"2-digit", month:"long", year:"numeric" });
  if (elDate) elDate.textContent = `📅 Tanggal: ${tgl}`;

  // ===== Confetti =====
  const confetti = document.getElementById("confetti");
  if (confetti){
    confetti.innerHTML = "";
    const colors = ["#ffb703","#3b82f6","#10b981","#ef4444","#a855f7","#f59e0b"];
    for (let i=0; i<40; i++){
      const p = document.createElement("i");
      p.style.left = (Math.random()*100) + "vw";
      p.style.animationDuration = (4 + Math.random()*4.5) + "s";
      p.style.animationDelay = (Math.random()*2.2) + "s";
      p.style.width  = (7 + Math.random()*7) + "px";
      p.style.height = (10 + Math.random()*12) + "px";
      p.style.background = colors[Math.floor(Math.random()*colors.length)];
      p.style.opacity = (0.65 + Math.random()*0.35).toFixed(2);
      confetti.appendChild(p);
    }
  }

  // ===== Tombol simpan pdf / cetak =====
  window.openSavePDF = function(){
    // Browser gak boleh auto-download PDF native tanpa library.
    // Ini aman: user pilih "Save as PDF / Microsoft Print to PDF".
    window.print();
  };

  // fallback kalau onclick gak kebaca
  const btn = document.getElementById("btnSavePDF");
  if (btn){
    btn.addEventListener("click", () => window.openSavePDF());
  }
})();
