// ====== KONFIG ======
const TOTAL = 8;
const DURATION_SEC = 120; // 2 menit

// Kamu bisa ganti gambar sesuai kebutuhan.
// Format: { emosi: "BAHAGIA", img: "./img/xxx.jpg" }
const ROUNDS = [
  { emosi: "BAHAGIA", img: "./img/12.jpg" },
  { emosi: "SEDIH",   img: "./img/12.jpg" },
  { emosi: "TAKUT",   img: "./img/12.jpg" },
  { emosi: "TERKEJUT",img: "./img/12.jpg" },
  { emosi: "BINGUNG", img: "./img/12.jpg" },
  { emosi: "MALU",    img: "./img/12.jpg" },
  { emosi: "MARAH",   img: "./img/12.jpg" },
  { emosi: "CINTA",   img: "./img/12.jpg" },
];

// ====== STATE ======
let idx = 0;
let score = 0;
let timeLeft = DURATION_SEC;
let timerId = null;
let gameEnded = false;

// ====== ELEM ======
const timerEl = document.getElementById("timer");
const scoreEl = document.getElementById("score");
const imgEl = document.getElementById("questionImg");
const dropzone = document.getElementById("dropzone");
const hintEl = document.getElementById("hint");
const btnSelesai = document.getElementById("btnSelesai");

const giveaway = document.getElementById("giveaway");
const giveEmoji = document.getElementById("giveEmoji");
const giveText = document.getElementById("giveText");
const giveBtn = document.getElementById("giveBtn");

// ====== UTIL ======
function pad(n){ return String(n).padStart(2,"0"); }

function renderTimer(){
  const m = Math.floor(timeLeft/60);
  const s = timeLeft % 60;
  timerEl.textContent = `${pad(m)}:${pad(s)}`;
}

function renderScore(){
  scoreEl.textContent = `Skor: ${score} / ${TOTAL}`;
}

function setQuestion(){
  const q = ROUNDS[idx];
  imgEl.src = q.img;
  imgEl.alt = `Soal ${idx+1}`;
  hintEl.textContent = ""; // biar bersih
}

function shake(el){
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

function flashOk(el){
  el.classList.remove("ok");
  void el.offsetWidth;
  el.classList.add("ok");
}

// ====== DRAG SETUP ======
document.querySelectorAll(".emotion-card").forEach(card=>{
  card.addEventListener("dragstart", (e)=>{
    e.dataTransfer.setData("text/plain", card.dataset.emosi);
  });
});

dropzone.addEventListener("dragover", (e)=> e.preventDefault());

dropzone.addEventListener("drop", (e)=>{
  e.preventDefault();
  if (gameEnded) return;

  const picked = e.dataTransfer.getData("text/plain");
  const target = ROUNDS[idx].emosi;

  if (picked === target){
    score++;
    renderScore();
    flashOk(dropzone);

    idx++;
    if (idx >= TOTAL){
      finishGame("Selesai! Kamu hebat 😎");
    } else {
      setTimeout(()=> setQuestion(), 250);
    }
  } else {
    hintEl.textContent = "Ups, coba lagi ya!";
    shake(dropzone);
  }
});

// ====== TIMER ======
function startTimer(){
  renderTimer();
  timerId = setInterval(()=>{
    if (gameEnded) return;
    timeLeft--;
    if (timeLeft <= 0){
      timeLeft = 0;
      renderTimer();
      // AUTO KLIK SELESAI
      finishGame("Waktunya habis. Tapi kamu tetap keren!");
      return;
    }
    renderTimer();
  }, 1000);
}

// ====== GIVEAWAY (sesuai huruf awal nama) ======
function pickGiftByName(){
  const nama = (localStorage.getItem("ek_nama") || "").trim();
  const huruf = (nama[0] || "").toUpperCase();

  // mapping sederhana (bisa kamu ubah sesukamu)
  let emoji = "🎉";
  let title = `Hebat, ${nama || "Teman"}!`;

  if ("ABCDE".includes(huruf)) emoji = "🦁";
  else if ("FGHIJ".includes(huruf)) emoji = "🐼";
  else if ("KLMNO".includes(huruf)) emoji = "🦊";
  else if ("PQRST".includes(huruf)) emoji = "🐯";
  else if ("UVWXYZ".includes(huruf)) emoji = "⭐";

  return { emoji, title };
}

function showGiveaway(msg){
  const {emoji, title} = pickGiftByName();
  giveEmoji.textContent = emoji;
  giveText.textContent = msg ? `${msg}\n${title}` : title;

  giveaway.classList.remove("hidden");
}

// ====== FINISH ======
function finishGame(message){
  if (gameEnded) return;
  gameEnded = true;

  clearInterval(timerId);

  // Simpan hasil
  localStorage.setItem("ek_level1_skor", String(score));
  localStorage.setItem("ek_level1_selesai", "1");

  showGiveaway(message);

  // tombol lanjut (kamu bisa arahkan ke level2.html atau rekap.html)
  giveBtn.onclick = ()=>{
    // contoh: lanjut ke level2
    window.location.href = "./index.html";
  };
}

btnSelesai.addEventListener("click", ()=>{
  finishGame("Selesai! Mantap!");
});

// ====== INIT ======
function init(){
  renderScore();
  setQuestion();
  startTimer();
}
init();
