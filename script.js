
const API_URL = "https://script.google.com/macros/s/AKfycbxWbYaorkUtJ7LFvgJve_PGtY6UbFNLpot-HqLLLDVkfnd5RYmgPQWd2PQywlq52N-M/exec";


let startTime = Date.now();
const namaAnak = "A01";
const sesi = "S1";
let soal = 1;

// Fungsi global supaya bisa dipanggil dari HTML onclick
window.pilihEmosi = function(emosi) {
  console.log("Klik emosi:", emosi);

  const waktu = ((Date.now() - startTime) / 1000).toFixed(2);

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama: namaAnak, sesi: sesi, soal, emosi, waktu })
  })
  .then(res => res.json())
  .then(res => {
    console.log("Response API:", res);
    if (res.status === "ok") {
      soal++;
      startTime = Date.now();
      alert(`Emosi "${emosi}" berhasil dicatat!`);
    } else {
      alert("Gagal menyimpan data: " + res.message);
    }
  })
  .catch(err => {
    console.error("FETCH ERROR:", err);
    alert("Gagal menyimpan data");
  });
};

