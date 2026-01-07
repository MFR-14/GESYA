/* ============================
   GESYA - Intro FX (WOW)
   ============================ */

function spawnIntroFX(){
  const fx = document.getElementById("introFx");
  if (!fx) return;

  // bersihin biar gak numpuk
  fx.innerHTML = "";

  const STAR_COUNT = 14;

  for (let i = 0; i < STAR_COUNT; i++){
    const star = document.createElement("div");
    star.className = "fx-star";

    // sudut sebaran melingkar
    const angle = (Math.PI * 2) * (i / STAR_COUNT) + Math.random() * 0.4;
    const radius = 110 + Math.random() * 80;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.7;

    star.style.setProperty("--x", `${x.toFixed(1)}px`);
    star.style.setProperty("--y", `${y.toFixed(1)}px`);
    star.style.setProperty("--s", (0.9 + Math.random()).toFixed(2));

    // warna aman & ceria (anak SD friendly)
    const colors = ["#ffb703", "#ffd27d", "#8ecae6", "#ffe7b6"];
    star.style.setProperty("--c", colors[Math.floor(Math.random() * colors.length)]);

    // delay acak biar “meletup”
    star.style.animationDelay = `${(Math.random() * 0.18).toFixed(2)}s`;

    fx.appendChild(star);
  }
}

/* ============================
   HOOK KE INTRO
   ============================ */

function showIntro(){
  const gateOverlay = document.getElementById("gateOverlay");
  const pinStep = document.getElementById("pinStep");
  const introStep = document.getElementById("introStep");

  if (!gateOverlay || !introStep) return;

  if (pinStep) pinStep.style.display = "none";
  introStep.style.display = "block";
  gateOverlay.style.display = "flex";

  // 🔥 panggil animasi wah
  spawnIntroFX();
}

/* ============================
   OPTIONAL: kalau mau replay FX
   ============================ */
// contoh: panggil showIntro() dari logic PIN / load

