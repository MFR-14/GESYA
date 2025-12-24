// =====================
// KONFIG LEVEL 2
// =====================
const DURATION_SEC = 3 * 60 + 38; // 03:38 (sesuai gambar)
const FEEDBACK_DELAY_MS = 800;

// Soal contoh (silakan kamu ganti/lanjutkan)
const QUESTIONS = [
  {
    text: "Ketika aku sakit, aku merasa ...",
    options: ["a) Bahagia", "b) Sedih", "c) Takut", "d) Malu"],
    correctIndex: 1 // b) Sedih
  },
  {
    text: "Ketika aku sendirian di rumah, aku merasa ...",
    options: ["a) Bahagia", "b) Sedih", "c) Takut", "d) Malu"],
    correctIndex: 2 // c) Takut
  },
  // tambah soal lagi bebas:
  // { text:"...", options:["a)...","b)...","c)...","d)..."], correctIndex: 0 }
];

let idx = 0;
let score = 0;
let timeLeft = DURATION_SEC;
let timerId = null;
let locked = false;

function pad(n){ return String(n).padStart(2, "0"); }
function renderTimer(){
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  document.getElementById("timer").textContent = `${pad(m)}:${pad(s)}`;
}

function setFeedback(text, type){
  const el = document.getElementById("feedback");
  el.classList.remove("good", "bad");
  if (type) el.classList.add(type);
  el.textContent = text || "";
}

function setQuestion(){
  locked = false;
  setFeedback("", "");

  const q = QUESTIONS[idx];
  document.getElementById("qTitle").textContent = `Question ${idx + 1}`;
  document.getElementById("qText").textContent = q.text;

  const wrap = document.getElementById("options");
  wrap.innerHTML = "";

  q.options.forEach((label, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option";
    btn.textContent = label;

    btn.addEventListener("click", () => chooseAnswer(i, btn));
    wrap.appendChild(btn);
  });

  document.getElementById("btnNext").classList.add("hidden");
}

function clearSelected(){
  document.querySelectorAll(".option").forEach(b => b.classList.remove("selected"));
}

function chooseAnswer(pickIndex, btnEl){
  if (locked) return;
  locked = true;

  clearSelected();
  btnEl.classList.add("selected");

  const q = QUESTIONS[idx];
  const benar = pickIndex === q.correctIndex;

  if (benar){
    score++;
    setFeedback("✅ Benar!", "good");
  } else {
    setFeedback("❌ Salah!", "bad");
  }

  // tampil tombol lanjut
  const nextBtn = document.getElementById("btnNext");
  nextBtn.classList.remove("hidden");

  // auto lanjut optional (kalau mau)
  // setTimeout(() => nextStep(), FEEDBACK_DELAY_MS);
}

function nextStep(){
  idx++;
  if (idx >= QUESTIONS.length){
    finishLevel();
  } else {
    setQuestion();
  }
}

function finishLevel(){
  clearInterval(timerId);
  // simpan hasil (mirip level1 style)
  localStorage.setItem("ek_level2_skor", String(score));
  localStorage.setItem("ek_level2_selesai", "1");

  // arahkan ke halaman selamat (kalau kamu punya)
  // kalau belum punya, ya tampil alert dulu biar aman
  alert(`Level 2 selesai!\nSkor: ${score} / ${QUESTIONS.length}`);
  // window.location.href = "./congrats2.html?skor=" + score;
}

function startTimer(){
  renderTimer();
  timerId = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0){
      timeLeft = 0;
      renderTimer();
      setFeedback("⏳ Waktu habis!", "bad");
      locked = true;
      setTimeout(() => finishLevel(), 700);
      return;
    }
    renderTimer();
  }, 1000);
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnNext").addEventListener("click", nextStep);
  setQuestion();
  startTimer();
});
