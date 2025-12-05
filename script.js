// const lenis = new Lenis()

// lenis.on('scroll', (e) => {
//     console.log(e)
// })

// function raf(time) {
//     lenis.raf(time)
//     requestAnimationFrame(raf)
// }
// Remove: const lenis = new Lenis()
// Use this optimized version instead:
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Retains a nice easing
    direction: 'vertical',
    gestureDirection: 'vertical', // ✨ CRITICAL for mobile touch control
    smooth: true,
    mouseMultiplier: 0.6,
    touchMultiplier: 2.0, // ✨ Increase this to make scrolling feel faster on mobile
    infinite: false,
});

lenis.on('scroll', (e) => {
    console.log(e)
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
// ... rest of your code ...
var tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".part-1",
        start: "50% 50%",
        end: "250% 50%",
        scrub: true,
        // markers:true,
        pin: true,
    }
})

tl.to(".rotate-div", {
    rotate: -15,
    scale: 0.8,
}, 'a')
tl.to("#row-div-2", {
    marginTop: "5%"
}, 'a')
tl.to("#row-div-3", {
    marginTop: "-2%"
}, 'a')
tl.to("#row-div-4", {
    marginTop: "-8%"
}, 'a')
tl.to("#row-div-5", {
    marginTop: "-10%"
}, 'a')
tl.to(".overlay-div h1", {
    opacity: "1",
    delay: 0.2,
}, 'a')
tl.to(".overlay-div", {
    backgroundColor: "#000000b4",
}, 'a')
tl.to(".scrolling", {
    width: "100%",
}, 'a')

var tl2 = gsap.timeline({
    scrollTrigger: {
        trigger: ".part-2",
        start: "0% 70%",
        end: "50% 50%",
        scrub: true,
        // markers:true,
    }
})

tl2.to(".rounded-div-wrapper", {
    height: 0,
    marginTop: 0
})


let tl3 = gsap.timeline({
    scrollTrigger: {
        trigger: ".content-2",
        start: "20% 50%",
        end: "100% 50%",
        // markers: true,
        scrub: 1,
    },
});
tl3.to(".content-2 .text-area-hover h1", {
    width: "100%",
})
tl3.to(".content-2 .text-area-hover h2", {
    delay: -0.4,
    width: "100%",
})

gsap.registerPlugin(ScrollTrigger, Flip);

lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

const lightColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--light")
    .trim();
const darkColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--dark")
    .trim();

function interpolateColor(color1, color2, factor) {
    return gsap.utils.interpolate(color1, color2, factor);
}

gsap.to(".marquee-images", {
    scrollTrigger: {
        trigger: ".marquee",
        start: "top bottom",
        end: "top top",
        scrub: true,
        onUpdate: (self) => {
            const progress = self.progress;
            const xPosition = -75 + progress * 25;
            gsap.set(".marquee-images", {
                x: `${xPosition}%`,
            });
        },
    },
});

let pinnedMarqueeImgClone = null;
let isImgCloneActive = false;

function createPinnedMarqueeClone() {
    if (isImgCloneActive) return;

    const originalMarqueeImg = document.querySelector(".marquee-img.pin img");
    const rect = originalMarqueeImg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    pinnedMarqueeImgClone = originalMarqueeImg.cloneNode(true);

    gsap.set(pinnedMarqueeImgClone, {
        position: "fixed",
        left: centerX - originalMarqueeImg.offsetWidth / 2 + "px",
        top: centerY - originalMarqueeImg.offsetHeight / 2 + "px",
        width: originalMarqueeImg.offsetWidth + "px",
        height: originalMarqueeImg.offsetHeight + "px",
        transform: "rotate(-5deg)",
        transformOrigin: "center center",
        pointerEvents: "none",
        willChange: "transform",
        zIndex: 100,
    });

    document.body.appendChild(pinnedMarqueeImgClone);
    gsap.set(originalMarqueeImg, { opacity: 0 });
    isImgCloneActive = true;
}

function removePinnedMarqueeClone() {
    if (!isImgCloneActive) return;
    if (pinnedMarqueeImgClone) {
        pinnedMarqueeImgClone.remove();
        pinnedMarqueeImgClone = null;
    }
    const originalMarqueeImg = document.querySelector(".marquee-img.pin img");
    gsap.set(originalMarqueeImg, { opacity: 1 });
    isImgCloneActive = false;
}

ScrollTrigger.create({
    trigger: ".horizontal-scroll",
    start: "top top",
    end: () => `+=${window.innerHeight * 5}`,
    pin: true,
});

ScrollTrigger.create({
    trigger: ".marquee",
    start: "top top",
    onEnter: createPinnedMarqueeClone,
    onEnterBack: createPinnedMarqueeClone,
    onLeaveBack: removePinnedMarqueeClone,
});

let flipAnimation = null;

ScrollTrigger.create({
    trigger: ".horizontal-scroll",
    start: "top 50%",
    end: () => `+=${window.innerHeight * 5.5}`,
    onEnter: () => {
        if (pinnedMarqueeImgClone && isImgCloneActive && !flipAnimation) {
            const state = Flip.getState(pinnedMarqueeImgClone);

            gsap.set(pinnedMarqueeImgClone, {
                position: "fixed",
                left: "0px",
                top: "0px",
                width: "100%",
                height: "100svh",
                transform: "rotate(0deg)",
                transformOrigin: "center center",
            });

            flipAnimation = Flip.from(state, {
                duration: 1,
                ease: "none",
                paused: true,
            });
        }
    },
    onLeaveBack: () => {
        if (flipAnimation) {
            flipAnimation.kill();
            flipAnimation = null;
        }
        gsap.set(".container", {
            backgroundColor: darkColor,
        });
        gsap.set(".horizontal-scroll-wrapper", {
            x: "0%",
        });
    },
});


ScrollTrigger.create({
    trigger: ".horizontal-scroll",
    start: "top 50%",
    end: () => `+=${window.innerHeight * 5.5}`,
    onUpdate: (self) => {
        const progress = self.progress;

        if (progress <= 0.05) {
            const bgColorProgress = Math.min(progress / 0.05, 1);
            const newBgColor = interpolateColor(
                lightColor,
                darkColor,
                bgColorProgress
            );
            gsap.set(".container", {
                backgroundColor: darkColor,
            });
        } else if (progress > 0.05) {
            gsap.set(".container", {
                backgroundColor: darkColor,
            });
        }
        if (progress <= 0.2) {
            const scaleProgress = progress / 0.2;
            if (flipAnimation) {
                flipAnimation.progress(scaleProgress);
            }
        }
        if (progress > 0.2 && progress <= 0.95) {
            if (flipAnimation) {
                flipAnimation.progress(1);
            }

            const horizontalProgress = (progress - 0.2) / 0.75;

            const wrapperTranslateX = -66.67 * horizontalProgress;
            gsap.set(".horizontal-scroll-wrapper", {
                x: `${wrapperTranslateX}%`,
            });

            const slideMovement = (66.67 / 100) * 3 * horizontalProgress;
            const imageTranslateX = -slideMovement * 100;
            gsap.set(pinnedMarqueeImgClone, {
                x: `${imageTranslateX}%`,
            });
        } else if (progress > 0.95) {
            if (flipAnimation) {
                flipAnimation.progress(1);
            }
            gsap.set(pinnedMarqueeImgClone, {
                x: "-200%",
            });
            gsap.set(".horizontal-scroll-wrapper", {
                x: "-66.67%",
            });
        }

    },
});

let tl5 = gsap.timeline({
    scrollTrigger: {
        trigger: ".part-5",
        start: "20% 50%",
        end: "100% 50%",
        // markers: true,
        scrub: 1,
    },
});
tl5.to(".part-5 .text-area-hover h1", {
    width: "100%",
})
tl5.to(".part-5 .text-area-hover h2", {
    delay: -0.4,
    width: "100%",
})


let tl6 = gsap.timeline({
    scrollTrigger: {
        trigger: ".part-6",
        start: "0% 70%",
        end: "15% 50%",
        // markers: true,
        scrub: 1,
    },
});
tl6.to(".rounded-div-wrapper-6", {
    height: "0%",
    marginTop: 0,
})

let tl7 = gsap.timeline({
    scrollTrigger: {
        trigger: ".part-7",
        start: "50% 50%",
        end: "300% 50%",
        pin: true,
        // markers: true,
        scrub: 1,
    },
});
tl7.to("#demo", {
    bottom: "7%",
})
tl7.to(".our-work-txt-div", {
    height: "60vh",
}, 'height')
tl7.to(".our-work-txt", {
    height: "60vh",
}, 'height')
tl7.to("#our", {
    left: "0%",
}, 'height')
tl7.to("#work", {
    right: "0%",
}, 'height')
tl7.to(".scroll-img", {
    marginTop: "-300%",
})


gsap.registerPlugin();

const cursor = document.getElementById("cursor");
const items = document.querySelectorAll(".menu-item, h1, p, button,#sound-btn,h2,h3");

// Smooth follow
document.addEventListener("mousemove", (e) => {
    gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: "power2.out"
    });
});

// Scale on hover
items.forEach((el) => {
    el.addEventListener("mouseenter", () => {
        gsap.to(cursor, {
            scale: 2.3,
            duration: 0.25,
            ease: "power3.out"
        });
    });
    el.addEventListener("mouseleave", () => {
        gsap.to(cursor, {
            scale: 1,
            duration: 0.25,
            ease: "power3.inOut"
        });
    });
});






// Updated Selectors
const fullScreenMenu = document.querySelector(".full-screen-menu");
const navToggleWrapper = document.getElementById("nav-toggle-wrapper");
const pixelGridOverlay = document.querySelector("#pixel-grid-overlay");

let pixelUnits = [];
const unitSize = 100;

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

const numCols = Math.ceil(screenWidth / unitSize);
const numRows = Math.ceil(screenHeight / unitSize);
const numUnits = numCols * numRows;

pixelGridOverlay.style.width = `${numCols * unitSize}px`;
pixelGridOverlay.style.height = `${numRows * unitSize}px`;

// FIX 1: Initialize zIndex to -1 so it's hidden behind everything at start
gsap.set(fullScreenMenu, { opacity: 0, zIndex: -1 });

function createPixelUnits() {
    for (let i = 0; i < numUnits; i++) {
        const unit = document.createElement("div");
        unit.classList.add("pixel-unit");
        pixelGridOverlay.appendChild(unit);
        pixelUnits.push(unit);
    }
}

function animatePixelUnits() {
    gsap.fromTo(pixelUnits, {
        opacity: 0,
    }, {
        opacity: 1,
        delay: 0, // FIX 2: Start pixel animation immediately on click
        duration: 0.05,
        stagger: {
            each: 0.004,
            from: "random",
        },
    });

    gsap.to(pixelUnits, {
        opacity: 0,
        delay: 1.5,
        duration: 0.05,
        stagger: {
            each: 0.004,
            from: "random",
        },
    });
}

let overlayVisible = false;

navToggleWrapper.addEventListener("click", () => {
    // Clear old pixels and create new ones for the animation
    pixelGridOverlay.innerHTML = "";
    pixelUnits = [];
    createPixelUnits();
    animatePixelUnits();

    // Logic for OPENING the menu
    if (!overlayVisible) {
        // 1. Bring menu to front immediately
        gsap.set(fullScreenMenu, { zIndex: 9990 });

        // 2. Fade in the menu text (Wait 1.2s for pixels to cover screen)
        gsap.to(fullScreenMenu, 0.5, {
            opacity: 1,
            visibility: "visible",
            delay: 1.2,
        });
    }
    // Logic for CLOSING the menu
    else {
        // 1. Fade out menu text immediately
        gsap.to(fullScreenMenu, 0.5, {
            opacity: 0,
            visibility: "hidden",
            delay: 0,
        });

        // 2. Send zIndex to back AFTER fade out is done
        gsap.set(fullScreenMenu, {
            zIndex: -1,
            delay: 0.5
        });
    }

    overlayVisible = !overlayVisible;
});


var imageone = document.querySelector(".imageone")

imageone.addEventListener("mouseenter", function () {
    imageone.style.scale = "2"
    imageone.style.transform = "rotate(-10deg)"
})

imageone.addEventListener("mouseleave", function () {
    imageone.style.scale = "1"
    imageone.style.transform = "rotate(0deg)"
})

var imagetwo = document.querySelector(".imagetwo")


imagetwo.addEventListener("mouseenter", function () {
    imagetwo.style.scale = "2"
    imagetwo.style.transform = "rotate(10deg)"
})

imagetwo.addEventListener("mouseleave", function () {
    imagetwo.style.scale = "1"
    imagetwo.style.transform = "rotate(0deg)"
})
var imagethree = document.querySelector(".imagethree")

imagethree.addEventListener("mouseenter", function () {
    imagethree.style.scale = "2"
    imagethree.style.transform = "rotate(-10deg)"
})

imagethree.addEventListener("mouseleave", function () {
    imagethree.style.scale = "1"
    imagethree.style.transform = "rotate(0deg)"
})

// We wrap the logic in a DOMContentLoaded event to ensure HTML is loaded
document.addEventListener('DOMContentLoaded', () => {

    // Select the elements
    const closeButton = document.getElementById('closeBannerBtn');
    const banner = document.getElementById('promoBanner');

    // Define the close function
    const closeBanner = () => {
        // Add the 'hidden' class which triggers the CSS transition
        banner.classList.add('hidden');

        // Optional: Remove from DOM completely after animation finishes (300ms)
        setTimeout(() => {
            banner.style.display = 'none';
        }, 300);
    };

    // Add the event listener to the button
    if (closeButton) {
        closeButton.addEventListener('click', closeBanner);
    }
});
