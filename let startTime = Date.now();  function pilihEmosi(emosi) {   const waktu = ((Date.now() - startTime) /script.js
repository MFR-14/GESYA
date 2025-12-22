let startTime = Date.now();

function pilihEmosi(emosi) {
  const waktu = ((Date.now() - startTime) / 1000).toFixed(2);

  alert(
    `Emosi: ${emosi}\nWaktu respon: ${waktu} detik`
  );

  startTime = Date.now();
}
