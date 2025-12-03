const preloaderWords = [
  "Hello",
  "Olà",
  "やあ",
  "হ্যালো",
  "ନମସ୍କାର",
  "नमस्ते",
];

const preloader = document.getElementById("preloader");
const wordEl = document.getElementById("preloader-word");
const pathEl = document.getElementById("preloader-path");

// SVG setup
function getPaths() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const initial = `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h + 300} 0 ${h} L0 0`;
  const target = `M0 0 L${w} 0 L${w} ${h} Q${w / 2} ${h} 0 ${h} L0 0`;
  return { initial, target };
}

// Exit animation
function exitPreloader(targetPath) {
  gsap.to(pathEl, {
    duration: 0.7,
    attr: { d: targetPath },
    ease: "power3.inOut",
    onComplete() {
      preloader.classList.add("hide-preloader");
      setTimeout(() => {
        preloader.style.display = "none";
        document.body.style.overflow = "auto";
      }, 900);
    },
  });
}

// Main sequence
function startPreloader() {
  const { initial, target } = getPaths();
  pathEl.setAttribute("d", initial);

  const tl = gsap.timeline();

  // Initial fade-in for first word
  wordEl.textContent = preloaderWords[0];
  tl.to(wordEl, {
    opacity: 1,
    duration: 0.5,
    ease: "power3.out",
  });

  // Word cycle (fast + smooth)
  preloaderWords.forEach((word, i) => {
    if (i === 0) return; // skip first (already visible)
    tl.to(wordEl, {
      opacity: 0,
      duration: 0.3,
      ease: "power3.in",
    });
    tl.add(() => (wordEl.textContent = word));
    tl.to(wordEl, {
      opacity: 1,
      duration: 0.4,
      ease: "power3.out",
    });
    tl.to({}, { duration: 0.1 }); // small pause
  });

  // Exit preloader
  tl.add(() => exitPreloader(target));
}

window.addEventListener("DOMContentLoaded", () => {
  const svg = document.getElementById("preloader-svg");
  const w = window.innerWidth;
  const h = window.innerHeight;
  svg.setAttribute("viewBox", `0 0 ${w} ${h + 300}`);
  startPreloader();
});
