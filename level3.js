// =====================
// GAS WebApp URL (/exec)
// =====================
const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwlKHW60fkzcickncJz6xHOSSxYaNVOUMPR2X-tnz12ia6UtOfp7Tbh6aYxLk2oSBVo/exec";

// ====== KONFIG GAME ======
const TOTAL = 8;
const DURATION_SEC = 180;        // 3 menit
const FEEDBACK_DELAY_MS = 2200;  // lama tampil notif benar/salah

// "ROUNDS" versi level 3:
// tiap item = 1 pasang kepala + muka yang harus cocok
// key WAJIB konsisten dengan data-face & data-need
const ROUNDS = [
  { key: "bahagia", head: "./img/bahagia-L3.jpg", face: "./img/muka-bahagia.jpg" },
  // { key: "sedih", head: "./img/sedih-L3.jpg", face: "./img/muka-sedih.jpg" },
  // { key: "takut", head: "./img/takut-L3.jpg", face: "./img/muka-takut.jpg" },
  // dst sampai 8
];

// ====== STATE ======
let pool = [];
let idx = 0;
let score = 0;
let timeLeft = DURATION_SEC;
let timerId = null;
let gameEnded = false;
let soalStart = 0;

let picked = null;     // elemen face-item yg dipilih (untuk HP tap)
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

// ====== REKAP KE GAS (anti CORS) ======
function sendRekapToGAS({ nama, sesi, soal, emosi, waktu }) {
  if (!GAS_URL) return;

  const u = new URL(GAS_URL);
  u.searchParams.set("nama", nama);
  u.searchParams.set("sesi", sesi);
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
  const namaInput  = document.getElementById("namaAnak");
  const sesiInput  = document.getElementById("sesiAnak");
  const btnMulai   = document.getElementById("btnMulai");

  const timerEl    = document.getElementById("timer");
  const scoreEl    = document.getElementById("score");
  const hintEl     = document.getElementById("hint");
  const feedbackEl = document.getElementById("answerFeedback");
  const btnSelesai = document.getElementById("btnSelesai");

  const faceBank   = document.getElementById("faceBank");
  const headBoard  = document.getElementById("headBoard");

  if (!introEl || !gameEl || !namaInput || !sesiInput || !btnMulai || !timerEl || !scoreEl || !hintEl || !feedbackEl || !faceBank || !headBoard) {
    alert("Ada elemen HTML yang tidak ketemu. Cek id: intro, game, namaAnak, sesiAnak, btnMulai, timer, score, hint, answerFeedback, faceBank, headBoard.");
    return;
  }

  // isi otomatis dari localStorage
  const namaLS = (localStorage.getItem("ek_nama") || "").trim();
  const sesiLS = (localStorage.getItem("ek_sesi") || "").trim();
  if (namaLS) namaInput.value = namaLS;
  if (sesiLS) sesiInput.value = sesiLS;

  // ambil elemen face & head (di HTML kamu)
  let faces = [];
  let heads = [];

  function refreshElements() {
    faces = Array.from(document.querySelectorAll(".face-item"));
    heads = Array.from(document.querySelectorAll(".drop-head"));
  }

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

  function setPickedFace(faceEl) {
    picked = faceEl;
    hintEl.classList.remove("good", "bad");
    hintEl.textContent = "Sekarang tap kepala yang cocok 👇";
  }

  // set tampilan 1 ronde:
  // - bank muka: tampil 1 muka (atau beberapa, terserah kamu)
  // - head board: tampil 1 kepala target (atau beberapa)
  // versi simple: 1 muka + 1 kepala per ronde
  function setQuestion() {
    const q = pool[idx];

    // reset pilihan & lock
    lockInput = false;
    picked = null;
    resetFeedback();

    hintEl.classList.remove("good", "bad");
    hintEl.textContent = "Tarik muka ke kepala yang cocok";

    // render face bank
    faceBank.innerHTML = `
      <div class="face-item" draggable="true" data-face="${q.key}">
        <img src="${q.face}?v=${Date.now()}" alt="Muka ${q.key}">
      </div>
    `;

    // render head board
    headBoard.innerHTML = `
      <div class="head-slot drop-head" data-need="${q.key}">
        <img class="head-base" src="${q.head}?v=${Date.now()}" alt="Kepala ${q.key}">
        <div class="face-holder"></div>
      </div>
    `;

    refreshElements();
    setupInteractions();

    soalStart = Date.now();
  }

  function attachFaceToHead(faceEl, headEl) {
    const holder = headEl.querySelector(".face-holder");
    const img = faceEl.querySelector("img");
    if (!holder || !img) return;

    holder.innerHTML = "";
    holder.appendChild(img.cloneNode(true));

    headEl.dataset.done = "1";
    faceEl.classList.add("used");
    faceEl.setAttribute("draggable", "false");
  }

  function finishGame(message) {
    if (gameEnded) return;
    gameEnded = true;

    clearInterval(timerId);

    const nama = localStorage.getItem("ek_nama") || "";
    const sesi = localStorage.getItem("ek_sesi") || "";

    // simpan khusus level3 (biar gak numpuk level1)
    localStorage.setItem("ek_level3_skor", String(score));
    localStorage.setItem("ek_level3_selesai", "1");
    localStorage.setItem("ek_level3_alasan", message || "Selesai");

    const qs = new URLSearchParams({
      nama,
      sesi,
      skor: String(score),
      alasan: message || "Selesai"
    });

    // ganti ke congrats3.html kalau kamu punya
    window.location.href = "./congrats1.html?" + qs.toString();
  }

  function startTimer() {
    renderTimer();
    timerId = setInterval(() => {
      if (gameEnded) return;
      timeLeft--;

      if (timeLeft <= 0) {
        timeLeft = 0;
        renderTimer();

        hintEl.classList.remove("good");
        hintEl.classList.add("bad");
        hintEl.textContent = "⏳ Waktu habis!";
        lockInput = true;

        setTimeout(() => finishGame("Waktu habis!"), 900);
        return;
      }
      renderTimer();
    }, 1000);
  }

  // ==== LOGIKA JAWABAN (versi tempel muka) ====
  function handleAnswer(faceEl, headEl) {
    if (gameEnded || lockInput) return;
    lockInput = true;

    const correctKey = pool[idx].key;
    const pickedKey = faceEl?.dataset?.face || "";
    const needKey   = headEl?.dataset?.need || "";

    const waktuRespon = ((Date.now() - soalStart) / 1000).toFixed(2);

    const nama = localStorage.getItem("ek_nama") || "";
    const sesi = localStorage.getItem("ek_sesi") || "";

    const isBenar = (pickedKey === correctKey) && (needKey === correctKey);
    const status = isBenar ? "BENAR" : "SALAH";

    // log ke GAS: aku pakai format "muka->kepala"
    sendRekapToGAS({
      nama,
      sesi,
      soal: idx + 1,
      emosi: `${pickedKey}→${needKey} (${status})`,
      waktu: waktuRespon
    });

    // notif kecil
    hintEl.classList.remove("good", "bad");
    hintEl.classList.add(isBenar ? "good" : "bad");
    hintEl.textContent = isBenar ? "✅ Benar!" : "❌ Salah";

    // notif besar
    resetFeedback();
    feedbackEl.classList.add(isBenar ? "good" : "bad");
    feedbackEl.textContent = isBenar
      ? "YEEEAAAY! NEMPEL PAS BANGET!!! 🎉🎉"
      : "YAAAHH… BELUM COCOK 😭";

    // efek + aksi
    if (isBenar) {
      score++;
      renderScore();
      attachFaceToHead(faceEl, headEl);
      flashOk(headEl);
    } else {
      shake(headEl);
    }

    idx++;

    if (idx >= TOTAL) {
      setTimeout(() => finishGame("Selesai!"), FEEDBACK_DELAY_MS);
    } else {
      setTimeout(() => setQuestion(), FEEDBACK_DELAY_MS);
    }
  }

  // ==== INTERACTIONS (drag & tap) ====
  function setupInteractions() {
    if (!faces.length || !heads.length) return;

    const faceEl = faces[0];  // versi 1 muka per ronde
    const headEl = heads[0];  // versi 1 kepala per ronde

    // drag desktop
    faceEl.addEventListener("dragstart", (e) => {
      if (gameEnded || lockInput) return;
      e.dataTransfer.setData("text/plain", "FACE");
    });

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
      handleAnswer(faceEl, headEl);
    });

    // HP tap muka
    faceEl.addEventListener("click", () => {
      if (gameEnded || lockInput) return;
      setPickedFace(faceEl);
    });

    faceEl.addEventListener("touchstart", (e) => {
      if (gameEnded || lockInput) return;
      e.preventDefault();
      setPickedFace(faceEl);
    }, { passive: false });

    // HP tap kepala
    headEl.addEventListener("click", () => {
      if (gameEnded || lockInput) return;
      if (!picked) {
        hintEl.classList.remove("good");
        hintEl.classList.add("bad");
        hintEl.textContent = "Tap mukanya dulu ya 🙂";
        shake(headEl);
        return;
      }
      handleAnswer(picked, headEl);
    });

    headEl.addEventListener("touchstart", (e) => {
      if (gameEnded || lockInput) return;
      e.preventDefault();
      if (!picked) {
        hintEl.classList.remove("good");
        hintEl.classList.add("bad");
        hintEl.textContent = "Tap mukanya dulu ya 🙂";
        shake(headEl);
        return;
      }
      handleAnswer(picked, headEl);
    }, { passive: false });
  }

  function startGame() {
    const nama = (namaInput.value || "").trim();
    const sesi = (sesiInput.value || "").trim();

    if (!nama || !sesi) {
      alert("Nama dan sesi wajib diisi ya 🙂");
      return;
    }

    localStorage.setItem("ek_nama", nama);
    localStorage.setItem("ek_sesi", sesi);

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
