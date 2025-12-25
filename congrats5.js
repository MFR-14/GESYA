function pickAvatarByName(nama){
  const h = (nama?.trim()?.[0] || "🙂").toUpperCase();
  if ("ABCDE".includes(h)) return "🦁";
  if ("FGHIJ".includes(h)) return "🐼";
  if ("KLMNO".includes(h)) return "🦊";
  if ("PQRST".includes(h)) return "🐯";
  return "⭐";
}

function spawnConfetti(){
  const wrap = document.getElementById("confetti");
  if (!wrap) return;

  const colors = ["#ffb703","#ffd27d","#2b3a55","#8ecae6","#90be6d","#f94144"];
  for (let i=0;i<80;i++){
    const d = document.createElement("div");
    d.className = "piece";
    d.style.left = Math.random()*100 + "vw";
    d.style.background = colors[Math.floor(Math.random()*colors.length)];
    d.style.animationDuration = (2 + Math.random()*2) + "s";
    wrap.appendChild(d);
    setTimeout(()=>d.remove(), 5000);
  }
}

function getValue(paramName, lsKey, fallback){
  const url = new URL(window.location.href);
  const vUrl = (url.searchParams.get(paramName) || "").trim();
  if (vUrl) return vUrl;

  const vLs = (localStorage.getItem(lsKey) || "").trim();
  if (vLs) return vLs;

  return fallback;
}

window.addEventListener("DOMContentLoaded", () => {
  // ambil dari URL dulu (kalau redirect pakai querystring), fallback localStorage
  const nama    = getValue("nama", "ek_nama", "Teman");
  const sesi    = localStorage.getItem("ek_sesi") || "-";
  const skor    = getValue("skor", "ek_level5_skor", "0");
  const alasan  = getValue("alasan", "ek_level5_alasan", "Level 5 selesai!");

  document.getElementById("cgName").textContent = nama.toUpperCase();
  document.getElementById("cgMeta").textContent = `Sesi ${sesi} • Skor ${skor}/10`;
  document.getElementById("cgAvatar").textContent = pickAvatarByName(nama);

  document.getElementById("cgMsg").innerHTML =
    `${alasan}<br>Terima kasih sudah bermain, ${nama}!<br>` +
    `Kamu sudah latihan memilih respon yang bikin hati lebih tenang 🌿`;

  spawnConfetti();
});
