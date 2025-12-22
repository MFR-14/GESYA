const API_URL = "https://script.google.com/macros/s/AKfycby34KnNZR3osnHn7Oub-ax-beAFgGUHKFn_SqIkMDN98PlP7S1bfMFeiQ7zmVJ6QCPz/exec";

let startTime = Date.now();
const namaAnak = "A01";
const sesi = "S1";
let soal = 1;

window.pilihEmosi = function (emosi) {
  console.log("Klik emosi:", emosi);

  const waktu = ((Date.now() - startTime) / 1000).toFixed(2);

  // Kirim sebagai form-urlencoded biar gak kena preflight OPTIONS
  const payload = new URLSearchParams({
    nama: namaAnak,
    sesi: sesi,
    soal: String(soal),
    emosi: String(emosi),
    waktu: String(waktu),
  });

  fetch(API_URL, {
    method: "POST",
    body: payload,
  })
    .then(async (res) => {
      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      // Kalau GAS balikin bukan JSON, biar gak error parsing
      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error("Response bukan JSON: " + text);
      }
    })
    .then((data) => {
      console.log("Response API:", data);

      if (data.status === "ok") {
        soal++;
        startTime = Date.now();
        alert(`Emosi "${emosi}" berhasil dicatat!`);
      } else {
        alert("Gagal menyimpan data: " + (data.message || "unknown error"));
      }
    })
    .catch((err) => {
      console.error("FETCH ERROR:", err);
      alert("Gagal menyimpan data: " + err.message);
    });
};
