// =====================
// WAJIB: isi URL WebApp GAS kamu (yang /exec)
// contoh:
// const GAS_URL = "https://script.google.com/macros/s/AKfycbxxxxxxx/exec";
// =====================
const GAS_URL = "https://script.google.com/macros/s/AKfycbwlKHW60fkzcickncJz6xHOSSxYaNVOUMPR2X-tnz12ia6UtOfp7Tbh6aYxLk2oSBVo/exec";

// ====== KONFIG GAME ======
const TOTAL = 8;
const DURATION_SEC = 120; // 2 menit

// Ganti gambar soal sesuai file kamu
const ROUNDS = [
  { emosi: "BAHAGIA",  img: "./img/12.jpg" },
  { emosi: "SEDIH",    img: "./img/12.jpg" },
  { emosi: "TAKUT",    img: "./img/12.jpg" },
  { emosi: "TERKEJUT", img: "./img/12.jpg" },
  { emosi: "BINGUNG",  img: "./img/12.jpg" },
  { emosi: "MALU",     img: "./img/12.jpg" },
  { emosi: "MARAH",    img: "./img/12.jpg" },
  { emosi: "CINTA",    img: "./img/12.jpg" },
];

// ====== STATE ======
let idx = 0;
let score = 0;
let timeLeft = DURATION_SEC;
let timerId = null;
let gameEnded = false;

let soalStart = 0; // waktu mulai per soal (buat waktu_respon)

// ====== ELEM ======
const introEl  = document.getElementById("intro");
const gameEl   = document.getElementById("game");
const namaInput= document.getElementById("namaAnak");
const sesiInput= document.getElementById("sesiAnak");
const btnMulai = document.getElementById("btnMulai");

const timerEl = document.getElementById("timer"
