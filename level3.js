// =====================
// GAS WebApp URL (/exec)
// =====================
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwlKHW60fkzcickncJz6xHOSSxYaNVOUMPR2X-tnz12ia6UtOfp7Tbh6aYxLk2oSBVo/exec";

// ====== KONFIG GAME ======
const LEVEL = 3;
const TOTAL = 8;
const DURATION_SEC = 180;        // 3 menit
const FEEDBACK_DELAY_MS = 2200;
const IMG_BASE = "./img/level3";

// 8 pasang sesuai folder kamu
const ROUNDS = [
  { key: "bahagia",  head: `${IMG_BASE}/bahagia-L3.jpg`,  face: `${IMG_BASE}/muka-bahagia.jpg` },
  { key: "bingung",  head: `${IMG_BASE}/bingung-L3.jpg`,  face: `${IMG_BASE}/muka-bingung.jpg` },
  { key: "cinta",    head: `${IMG_BASE}/cinta-L3.jpg`,    face: `${IMG_BASE}/muka-cinta.jpg` },
  { key: "malu",     head: `${IMG_BASE}/malu-L3.jpg`,     face: `${IMG_BASE}/muka-malu.jpg` },
  { key: "marah",    head: `${IMG_BASE}/marah-L3.jpg`,    face: `${IMG_BASE}/muka-marah.jpg` },
  { key: "sedih",    head: `${IMG_BASE}/sedih-L3.jpg`,    face: `${IMG_BASE}/muka-sedih.jpg` },
  { key: "takut",    head: `${IMG_BASE}/takut-L3.jpg`,    face: `${IMG_BASE}/muka-takut.jpg` },
  { key: "terkejut", head: `${IMG_BASE}/terkejut-L3.jpg`, face: `${IMG_BASE}/muka-terkejut.jpg` },
];

// ====== STATE ======
let pool = [];
let idx = 0;
let score = 0;
let timeLeft = DURATION_SEC;
let timerId = null;
let gameEnded = false;
let soalStart = 0;

let picked = null;     // face item untuk mode tap HP
let lockInput = false;

// ====== UTIL ======
function pad(n) { return String(n).padStart(2, "0"); }

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shake(el) {
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

function flashOk(el) {
  el.classList.remove("ok");
  void el.offsetWidth;
  el.classList.add("ok");
}

// ambil 2 key pengecoh yang beda dari jawaban benar
function sampleTwoOtherKeys(correctKey) {
  const others = ROUNDS.filter(r => r.key !== correctKey);
  return shuffle(others).slice(0, 2).map(r => r.key);
}

function getRoundByKey(key) {
  return ROUNDS.find(r => r.key === key);
}

// ====== REKAP KE GAS (anti CORS) ======
function sendRekapToGAS({ level, nama, umur, sekolah, soal, emosi, waktu }) {
  if (!GAS_URL) return;

  const u = new URL(GAS_URL);
  u.searchParams.set("level", String(level));
  u.searchParams.set("nama", nama);
  u.searchParams.set("umur", String(umur));
  u.searchParams.set("sekolah", sekolah);
  u.searchParams.set("soal", String(soal));
  u.searchParams.set("emosi", emosi);
  u.searchParams.set("waktu", String(waktu));

  const beacon = new Image();
  beacon.src = u.toString();
}

// ====== MAIN ======
window.addEventListener("DOMContentLoaded", () => {
  const introEl    = document.getElementById("intro");
  const gameEl     = document.getElementById("game");

  const namaInput    = document.getElementById("namaAnak");
  const umurInput    = document.getElementById("umurAnak");
  const sekolahInput = document.getElementById("namaSekolah");
  const btnMulai     = document.getElementById("btnMulai");

  const timerEl    = document.getElementById("timer");
  const scoreEl    = document.getElementById("score");
  const hintEl     = document.getElementById("hint");
  const feedbackEl = document.getElementById("answerFeedback");
  const roundEl    = document.getElementById("roundTitle");
  const btnSelesai = document.getElementById("btnSelesai");

  const faceBank   = document.getElementById("faceBank");
  const headBoard  = document.getElementById("headBoard");

  if (!introEl || !gameEl || !namaInput || !umurInput || !sekolahInput || !btnMulai ||
      !timerEl || !scoreEl || !hintEl || !feedbackEl || !roundEl || !faceBank || !headBoard) {
    alert("Ada elemen HTML yang tidak ketemu. Cek id: intro, game, namaAnak, umurAnak, namaSekolah, btnMulai, timer, score, hint, answerFeedback, roundTitle, faceBank, headBoard.");
    return;
  }

  // isi otomatis dari localStorage
  const namaLS    = (localStorage.getItem("ek_nama") || "").trim();
  const umurLS    = (localStorage.getItem("ek_umur") || "").trim();
  const sekolahLS = (localStorage.getItem("ek_sekolah") || "").trim();

  if (namaLS) namaInput.value = namaLS;
  if (umurLS) umurInput.value = umurLS;
  if (sekolahLS) sekolahInput.value = sekolahLS;

  function renderTimer() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    timerEl.textContent = `${pad(m)}:${pad(s)}`;
  }

  function renderScore() {
    scoreEl.textContent = `Skor: ${score} / ${TOTAL}`;
  }

  function resetFeedback() {
    feedbackEl.className = "answer-feedback";
    feedbackEl.textContent = "";
    feedbackEl.style.display = "block";
    feedbackEl.style.opacity = "1";
    feedbackEl.style.visibility = "visible";
    feedbackEl.style.transform = "none";
  }

  function setHint(type, text) {
    hintEl.classList.remove("good","bad");
    if (type) hintEl.classList.add(type);
    hintEl.textContent = text;
  }

  function setRoundTitle() {
    roundEl.textContent = `Soal ${idx + 1} / ${TOTAL}`;
  }

  function attachFaceToHead(faceEl, headEl) {
    const holder = headEl.querySelector(".face-holder");
    const img = faceEl.querySelector("img");
    if (!holder || !img) return;

    holder.innerHTML = "";
    holder.appendChild(img.cloneNode(true));

    headEl.dataset.done = "1";
  }

  function setQuestion() {
    const q = pool[idx];
    const correctKey = q.key;

    lockInput = false;
    picked = null;

    resetFeedback();
    setRoundTitle();
    setHint(null, "Pilih salah satu muka, lalu tempel ke kepala yang cocok");

    // 3 pilihan muka: 1 benar + 2 pengecoh
    const decoyKeys = sampleTwoOtherKeys(correctKey);
    const faceKeys = shuffle([correctKey, ...decoyKeys]);

    faceBank.innerHTML = faceKeys.map((k) => {
      const r = getRoundByKey(k);
      return `
        <div class="face-item" draggable="true" data-face="${k}">
          <img src="${r.face}?v=${Date.now()}" alt="Muka ${k}">
        </div>
      `;
    }).join("");

    headBoard.innerHTML = `
      <div class="head-slot drop-head" data-need="${correctKey}">
        <img class="head-base" src="${q.head}?v=${Date.now()}" alt="Kepala ${correctKey}">
        <div class="face-holder"></div>
      </div>
    `;

    const faces = Array.from(faceBank.querySelectorAll(".face-item"));
    const headEl = headBoard.querySelector(".drop-head");

    setupInteractions(faces, headEl);

    soalStart = Date.now();
  }

  function finishGame(message) {
    if (gameEnded) return;
    gameEnded = true;

    clearInterval(timerId);

    const nama    = localStorage.getItem("ek_nama") || "";
    const umur    = localStorage.getItem("ek_umur") || "";
    const sekolah = localStorage.getItem("ek_sekolah") || "";

    localStorage.setItem("ek_level3_skor", String(score));
    localStorage.setItem("ek_level3_selesai", "1");
    localStorage.setItem("ek_level3_alasan", message || "Selesai");

    localStorage.setItem("ek_last_level", String(LEVEL));
    localStorage.setItem("ek_last_level_time", new Date().toISOString());

    const qs = new URLSearchParams({
      level: String(LEVEL),
      nama,
      umur,
      sekolah,
      skor: String(score),
      alasan: message || "Selesai"
    });

    window.location.href = "./congrats3.html?" + qs.toString();
  }

  function startTimer() {
    renderTimer();
    timerId = setInterval(() => {
      if (gameEnded) return;
      timeLeft--;

      if (timeLeft <= 0) {
        timeLeft = 0;
        renderTimer();

        setHint("bad", "⏳ Waktu habis!");
        lockInput = true;

        setTimeout(() => finishGame("Waktu habis!"), 900);
        return;
      }
      renderTimer();
    }, 1000);
  }

  function handleAnswer(faceEl, headEl) {
    if (gameEnded || lockInput) return;
    lockInput = true;

    const q = pool[idx];
    const correctKey = q.key;

    const pickedKey = faceEl?.dataset?.face || "";
    const needKey   = headEl?.dataset?.need || "";

    const waktuRespon = ((Date.now() - soalStart) / 1000).toFixed(2);

    const nama    = localStorage.getItem("ek_nama") || "";
    const umur    = localStorage.getItem("ek_umur") || "";
    const sekolah = localStorage.getItem("ek_sekolah") || "";

    const isBenar = (pickedKey === correctKey) && (needKey === correctKey);
    const status = isBenar ? "BENAR" : "SALAH";

    sendRekapToGAS({
      level: LEVEL,
      nama,
      umur,
      sekolah,
      soal: idx + 1,
      emosi: `${pickedKey}→${needKey} (${status})`,
      waktu: waktuRespon
    });

    if (isBenar) {
      score++;
      renderScore();

      attachFaceToHead(faceEl, headEl);
      flashOk(headEl);

      // disable semua muka biar gak spam
      faceBank.querySelectorAll(".face-item").forEach(f => {
        f.setAttribute("draggable", "false");
        f.classList.add("used");
      });

      setHint("good", "✅ Benar!");
      resetFeedback();
      feedbackEl.classList.add("good");
      feedbackEl.textContent = "YEEEAAAY! NEMPEL PAS BANGET!!! 🎉🎉";
    } else {
      shake(headEl);

      setHint("bad", "❌ Salah");
      resetFeedback();
      feedbackEl.classList.add("bad");
      feedbackEl.textContent = "YAAAHH… BELUM COCOK 😭";
    }

    idx++;

    if (idx >= TOTAL) {
      setTimeout(() => finishGame("Selesai!"), FEEDBACK_DELAY_MS);
    } else {
      setTimeout(() => setQuestion(), FEEDBACK_DELAY_MS);
    }
  }

  function setupInteractions(faceEls, headEl) {
    // drag desktop untuk semua muka
    faceEls.forEach(faceEl => {
      faceEl.addEventListener("dragstart", (e) => {
        if (gameEnded || lockInput) return;
        e.dataTransfer.setData("text/plain", faceEl.dataset.face || "");
      });

      // HP tap muka
      faceEl.addEventListener("click", () => {
        if (gameEnded || lockInput) return;
        picked = faceEl;
        setHint(null, "Sekarang tap kepala yang cocok 👇");
        faceEls.forEach(f => f.classList.remove("selected"));
        faceEl.classList.add("selected");
      });

      faceEl.addEventListener("touchstart", (e) => {
        if (gameEnded || lockInput) return;
        e.preventDefault();
        picked = faceEl;
        setHint(null, "Sekarang tap kepala yang cocok 👇");
        faceEls.forEach(f => f.classList.remove("selected"));
        faceEl.classList.add("selected");
      }, { passive: false });
    });

    // drop target kepala (desktop)
    headEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      headEl.classList.add("over");
    });

    headEl.addEventListener("dragleave", () => {
      headEl.classList.remove("over");
    });

    headEl.addEventListener("drop", (e) => {
      e.preventDefault();
      headEl.classList.remove("over");
      if (gameEnded || lockInput) return;

      const key = (e.dataTransfer.getData("text/plain") || "").trim();
      const faceEl = faceEls.find(f => (f.dataset.face || "") === key) || faceEls[0];

      handleAnswer(faceEl, headEl);
    });

    // tap kepala (HP)
    headEl.addEventListener("click", () => {
      if (gameEnded || lockInput) return;
      if (!picked) {
        setHint("bad", "Tap salah satu mukanya dulu ya 🙂");
        shake(headEl);
        return;
      }
      handleAnswer(picked, headEl);
    });

    headEl.addEventListener("touchstart", (e) => {
      if (gameEnded || lockInput) return;
      e.preventDefault();
      if (!picked) {
        setHint("bad", "Tap salah satu mukanya dulu ya 🙂");
        shake(headEl);
        return;
      }
      handleAnswer(picked, headEl);
    }, { passive: false });
  }

  function startGame() {
    const nama = (namaInput.value || "").trim();
    const umurRaw = (umurInput.value || "").trim();
    const sekolah = (sekolahInput.value || "").trim();
    const umur = Number(umurRaw);

    if (!nama) {
      alert("Nama anak wajib diisi ya 🙂");
      return;
    }
    if (!umurRaw || Number.isNaN(umur) || umur < 1 || umur > 18) {
      alert("Umur wajib diisi dan harus angka 1–18 ya 🙂");
      return;
    }
    if (!sekolah) {
      alert("Nama sekolah wajib diisi ya 🙂");
      return;
    }

    localStorage.setItem("ek_nama", nama);
    localStorage.setItem("ek_umur", String(umur));
    localStorage.setItem("ek_sekolah", sekolah);

    introEl.classList.add("hidden");
    gameEl.classList.remove("hidden");

    pool = shuffle(ROUNDS).slice(0, TOTAL);
    idx = 0;
    score = 0;
    timeLeft = DURATION_SEC;
    gameEnded = false;
    lockInput = false;

    renderScore();
    setQuestion();
    startTimer();
  }

  btnMulai.addEventListener("click", startGame);

  if (btnSelesai) {
    btnSelesai.addEventListener("click", () => finishGame("Diselesaikan manual"));
  }

  renderTimer();
  renderScore();
  resetFeedback();
});
