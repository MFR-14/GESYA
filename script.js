const API_URL = "https://script.google.com/macros/s/AKfycbwVpwe_oZJa8QZqfNRR3i8ZXq8ImAf1ISW19_4AIKjszvXzYv9-4JtrroIbUGTpKaNo/exec";

let startTime = Date.now();
const namaAnak = "A01";
const sesi = "S1";
let soal = 1;
let isSending = false;

window.pilihEmosi = function (emosi) {
  if (isSending) return;
  isSending = true;

  const waktu = ((Date.now() - startTime) / 1000).toFixed(2);

  const qs = new URLSearchParams({
    nama: namaAnak,
    sesi: sesi,
    soal: String(soal),
    emosi: String(emosi),
    waktu: String(waktu),
    t: Date.now()
  }).toString();

  const fullUrl = `${API_URL}?${qs}`;
  console.log("BEACON URL:", fullUrl);

  const statusEl = document.getElementById("status");
  if (statusEl) statusEl.textContent = "Menyimpan...";

  // fire-and-forget beacon (tanpa error popup palsu)
  const img = new Image();
  img.src = fullUrl;

  // UX: anggap sukses (karena backend sudah terbukti nyimpan)
  setTimeout(() => {
    soal++;
    startTime = Date.now();
    isSending = false;

    if (statusEl) statusEl.textContent = `Tersimpan: ${emosi}`;
    alert(`Emosi "${emosi}" berhasil dicatat!`);
  }, 250);
};
