const API_URL = "https://script.google.com/macros/s/AKfycbxWbYaorkUtJ7LFvgJve_PGtY6UbFNLpot-HqLLLDVkfnd5RYmgPQWd2PQywlq52N-M/exec";

let startTime = Date.now();
const namaAnak = "A01";
const sesi = "S1";
let soal = 1;

window.pilihEmosi = function (emosi) {
  const waktu = ((Date.now() - startTime) / 1000).toFixed(2);

  const qs = new URLSearchParams({
    nama: namaAnak,
    sesi: sesi,
    soal: String(soal),
    emosi: String(emosi),
    waktu: String(waktu),
    t: String(Date.now()) // anti cache
  }).toString();

  const img = new Image();
  img.onload = () => {
    soal++;
    startTime = Date.now();
    alert(`Emosi "${emosi}" berhasil dicatat!`);
  };
  img.onerror = (e) => {
    console.error("Beacon error:", e);
    alert("Gagal menyimpan data");
  };

  img.src = `${API_URL}?${qs}`;
};
