
/* =========================================
   1. GLOBAL VARIABLES & STATE
========================================= */
let photosData = []; // Stores all loaded photos
let digilensCollections = [];
let digilensPhotos = []; // Stores photos of selected collection

let currentGallery = "photos"; // "photos" or "digilens"
let currentIndex = 0;

// Pagination Globals
let currentPage = 1;
let isFetching = false;
let hasMorePhotos = true;

// Initialize Lenis Variable
let lenis;

/* =========================================
   2. INITIALIZATION (Lenis, Icons, GSAP)
========================================= */
document.addEventListener("DOMContentLoaded", () => {
  // A. Initialize Lucide Icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // B. Register GSAP
  if (typeof gsap !== "undefined") {
    gsap.registerPlugin();
  }

  // C. Initialize Lenis Smooth Scroll
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Ease Out Quart
      smoothWheel: true,
    });

    // Connect Lenis to GSAP Ticker for smooth sync
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);
  }

  // D. Initial Data Loads
  loadPhotos();
  loadDigiLensCollections();
  initSlider();
  initCurvedText();
  initPixelMenu();
  initCustomCursor();
  initTabs();
});

/* =========================================
   3. DATA FETCHING & RENDERING
========================================= */

// --- MAIN FEED PHOTOS ---
async function loadPhotos() {
  if (isFetching || !hasMorePhotos) return;
  isFetching = true;

  try {
    const res = await fetch(`https://server-photo.vercel.app/api/photos?page=${currentPage}&per_page=20`);

    if (!res.ok) {
      console.error("Server error:", res.status);
      isFetching = false;
      return;
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      hasMorePhotos = false;
      isFetching = false;
      return;
    }

    const photosContainer = document.getElementById("photos");

    // Deduplication
    const existingIds = new Set(photosData.map((p) => p.id));
    const newPhotos = data.filter((p) => !existingIds.has(p.id));

    photosData = [...photosData, ...newPhotos];

    // Render
    newPhotos.forEach((photo) => {
      const item = document.createElement("div");
      item.classList.add("masonry-item");

      item.innerHTML = `
        <img src="${photo.urls.small}" alt="" loading="lazy">
        <div class="item-info">
          <div class="info-row">
            <span><span class="material-symbols-rounded icon">visibility</span> ${photo.total_views || 0}</span>
            <span><span class="material-symbols-rounded icon">download</span> ${photo.total_downloads || 0}</span>
          </div>
        </div>
      `;

      item.onclick = () => openModal("photos", photosData.indexOf(photo));
      photosContainer.appendChild(item);
    });

    currentPage++;
    isFetching = false;

  } catch (err) {
    console.error("Fetch Error:", err);
    isFetching = false;
  }
}

// --- COLLECTIONS LIST ---
async function loadDigiLensCollections() {
  try {
    const res = await fetch("https://server-collection-blond.vercel.app/api/digilens/collections");
    const data = await res.json();

    const container = document.getElementById("digilens-collections");
    container.innerHTML = "";
    digilensCollections = data;

    digilensCollections.forEach((collection) => {
      const card = document.createElement("div");
      card.classList.add("collection-card");

      // Grid Images Logic
      let images = [];
      if (collection.preview_photos && collection.preview_photos.length >= 3) {
        images = collection.preview_photos.slice(0, 3).map((p) => p.urls.small);
      } else {
        const cover = collection.cover_photo?.urls.small || "https://via.placeholder.com/150";
        images = [cover, cover, cover];
      }

      card.innerHTML = `
        <div class="card-image-grid">
             <img src="${images[0]}" alt="">
             <img src="${images[1]}" alt="">
             <img src="${images[2]}" alt="">
        </div>
        <div class="collection-info">
          <h3>${collection.title}</h3>
          <p>${collection.total_photos} photos &middot; ${collection.user?.name || "User"}</p>
        </div>
      `;

      card.onclick = () => showCollectionGallery(collection);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error collections:", error);
  }
}

// --- SPECIFIC COLLECTION GALLERY ---
function showCollectionGallery(collection) {
  document.getElementById("digilens-collections").style.display = "none";
  document.getElementById("digilens-gallery-container").style.display = "block";
  document.getElementById("collection-title").textContent = collection.title;

  loadDigiLensPhotos(collection.id);
}

async function loadDigiLensPhotos(collectionId) {
  try {
    const res = await fetch(`https://server-collection-blond.vercel.app/api/digilens/collections/${collectionId}/photos`);
    const data = await res.json();

    const gallery = document.getElementById("digilens-gallery");
    gallery.innerHTML = "";

    digilensPhotos = data;

    digilensPhotos.forEach((photo, index) => {
      const item = document.createElement("div");
      item.classList.add("masonry-item");

      const img = document.createElement("img");
      img.src = photo.urls.small;
      img.loading = "lazy";

      item.appendChild(img);
      item.onclick = () => openModal("digilens", index);

      gallery.appendChild(item);
    });
  } catch (error) {
    console.error("Error collection photos:", error);
  }
}

// Back Button Logic
const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.onclick = () => {
    document.getElementById("digilens-gallery-container").style.display = "none";
    document.getElementById("digilens-collections").style.display = "grid";
  };
}

/* =========================================
   4. INFINITE SCROLL
========================================= */
window.addEventListener("scroll", () => {
  const triggerPoint = 300; // px before bottom
  
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - triggerPoint) {
    // Check if we are in the main "For You" tab
    const digilensGallery = document.getElementById("digilens-gallery-container");
    
    // Only load main photos if the specific collection gallery is NOT visible
    if (!digilensGallery || digilensGallery.style.display === "none") {
      loadPhotos();
    }
  }
});

/* =========================================
   5. MODAL SYSTEM
========================================= */
const modalElement = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalCredit = document.querySelector(".modal-credit");
const closeBtn = document.querySelector(".close-btn");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");

function openModal(gallery, index) {
  currentGallery = gallery;
  currentIndex = index;

  let list = gallery === "photos" ? photosData : digilensPhotos;
  let photo = list[index];
  if (!photo) return;

  modalElement.style.display = "flex";
  modalImage.src = photo.urls?.regular || "";

  // Set Credit
  const username = photo.user?.name || "Unknown";
  const profileUrl = photo.user?.links?.html || "#";
  modalCredit.innerHTML = `
    Photo From Unsplash by 
    <a href="${profileUrl}" target="_blank" rel="noopener noreferrer">
      <b>${username}</b>
    </a>
  `;

  // STOP LENIS SCROLLING
  if (lenis) lenis.stop();
}

function closeModal() {
  modalElement.style.display = "none";
  // RESUME LENIS SCROLLING
  if (lenis) lenis.start();
}

function changePhoto(direction) {
  let list = currentGallery === "photos" ? photosData : digilensPhotos;

  if (direction === "next") {
    currentIndex = (currentIndex + 1) % list.length;
  } else {
    currentIndex = (currentIndex - 1 + list.length) % list.length;
  }
  openModal(currentGallery, currentIndex);
}

// Event Listeners for Modal
if (closeBtn) closeBtn.onclick = closeModal;
if (nextBtn) nextBtn.onclick = () => changePhoto("next");
if (prevBtn) prevBtn.onclick = () => changePhoto("prev");

if (modalElement) {
  modalElement.onclick = (e) => {
    if (e.target === e.currentTarget) closeModal();
  };

  // Touch Swipe Logic
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50;

  modalElement.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  modalElement.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const distance = touchStartX - touchEndX;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) changePhoto("next");
      else changePhoto("prev");
    }
  }, { passive: true });
}

// Keyboard Navigation
document.addEventListener("keydown", (e) => {
  if (modalElement && modalElement.style.display === "flex") {
    if (e.key === "ArrowRight") changePhoto("next");
    if (e.key === "ArrowLeft") changePhoto("prev");
    if (e.key === "Escape") closeModal();
  }
});

/* =========================================
   6. UI ANIMATIONS & EFFECTS
========================================= */

// --- TABS ---
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      button.classList.add("active");
      const targetId = button.getAttribute("data-target");
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add("active");
    });
  });
}

// --- HERO SLIDER ---
function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const indicators = document.querySelectorAll('#slide-indicators .indicator-dot');
  const heroText = document.querySelector('.hero-container'); 

  if (!slides.length) return;

  let currentSlide = 0;
  const slideInterval = 5000;

  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(dot => dot.classList.remove('active'));

    slides[index].classList.add('active');
    if(indicators[index]) indicators[index].classList.add('active');

    // Only show text on Slide 1 (index 0)
    if (heroText) {
      heroText.style.opacity = (index === 0) ? '1' : '0';
    }
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  showSlide(0);
  setInterval(nextSlide, slideInterval);
}

// --- CURVED TEXT ---
function initCurvedText() {
  const textElement = document.getElementById('curved-text');
  if (!textElement) return;

  const text = textElement.innerText;
  textElement.innerHTML = ''; 

  const characters = text.split('');
  const radius = 360 / characters.length;

  characters.forEach((char, i) => {
    const span = document.createElement('span');
    span.innerText = char;
    span.style.transform = `rotate(${i * radius}deg)`;
    textElement.appendChild(span);
  });
}

// --- PIXEL MENU ANIMATION ---
function initPixelMenu() {
  const fullScreenMenu = document.querySelector(".full-screen-menu");
  const navToggleWrapper = document.getElementById("nav-toggle-wrapper");
  const pixelGridOverlay = document.querySelector("#pixel-grid-overlay");

  if (!fullScreenMenu || !navToggleWrapper || !pixelGridOverlay) return;

  let pixelUnits = [];
  const unitSize = 100;
  
  // Initial State
  gsap.set(fullScreenMenu, { opacity: 0, zIndex: -1 });

  function createPixelUnits() {
    pixelGridOverlay.innerHTML = "";
    pixelUnits = [];
    
    const numCols = Math.ceil(window.innerWidth / unitSize);
    const numRows = Math.ceil(window.innerHeight / unitSize);
    const numUnits = numCols * numRows;

    pixelGridOverlay.style.width = `${numCols * unitSize}px`;
    pixelGridOverlay.style.height = `${numRows * unitSize}px`;

    for (let i = 0; i < numUnits; i++) {
      const unit = document.createElement("div");
      unit.classList.add("pixel-unit");
      pixelGridOverlay.appendChild(unit);
      pixelUnits.push(unit);
    }
  }

  function animatePixelUnits() {
    gsap.fromTo(pixelUnits, { opacity: 0 }, {
      opacity: 1,
      duration: 0.05,
      stagger: { each: 0.004, from: "random" },
    });

    gsap.to(pixelUnits, {
      opacity: 0,
      delay: 1.5,
      duration: 0.05,
      stagger: { each: 0.004, from: "random" },
    });
  }

  let overlayVisible = false;

  navToggleWrapper.addEventListener("click", () => {
    createPixelUnits();
    animatePixelUnits();

    if (!overlayVisible) {
      // OPEN MENU
      gsap.set(fullScreenMenu, { zIndex: 9990 });
      gsap.to(fullScreenMenu, 0.5, {
        opacity: 1,
        visibility: "visible",
        delay: 1.2,
      });
    } else {
      // CLOSE MENU
      gsap.to(fullScreenMenu, 0.5, {
        opacity: 0,
        visibility: "hidden",
        delay: 0,
      });
      gsap.set(fullScreenMenu, { zIndex: -1, delay: 0.5 });
    }
    overlayVisible = !overlayVisible;
  });
}

// --- CUSTOM CURSOR ---
function initCustomCursor() {
  const cursor = document.getElementById("cursor");
  if (!cursor) return;

  const items = document.querySelectorAll("a, button, .menu-item, h1, h2, h3, .masonry-item, .collection-card");

  document.addEventListener("mousemove", (e) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.15,
      ease: "power2.out"
    });
  });

  items.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      gsap.to(cursor, { scale: 2.3, duration: 0.25, ease: "power3.out" });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(cursor, { scale: 1, duration: 0.25, ease: "power3.inOut" });
    });
  });
}