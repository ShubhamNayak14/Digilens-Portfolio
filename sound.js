// sound.js

// Create toggle button
const soundBtn = document.createElement("div");
soundBtn.id = "sound-btn";
soundBtn.title = "Toggle Sound";
soundBtn.innerHTML = `<span class="material-symbols-outlined">volume_up</span>`;
document.body.appendChild(soundBtn);

// Sounds
const clickSound = new Audio("/tick.wav");

clickSound.volume = 0.5;
let soundEnabled = true;

// Toggle mute/unmute
soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  const icon = soundBtn.querySelector(".material-symbols-outlined");
  icon.textContent = soundEnabled ? "volume_up" : "volume_off";
  if (soundEnabled) clickSound.play().catch(() => {});
});


// Play click sound on clickable elements
document.addEventListener("click", (e) => {
  if (soundEnabled && e.target.id !== "sound-btn") {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  }
});
