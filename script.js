// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// Custom Editorial Cursor Logic
const cursorRing = document.getElementById('reactor-cursor');
const cursorDot = document.getElementById('reactor-cursor-dot');
const interactiveElements = document.querySelectorAll('a, button, .base-card, .btn-cta, .stark-image-wrapper');

// Cursor dot follows instantly
document.addEventListener('mousemove', (e) => {
    // Inner dot instant position
    gsap.set(cursorDot, { x: e.clientX, y: e.clientY });

    // Outer ring follows with an 80ms lag smooth lerp
    gsap.to(cursorRing, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.08, // 80ms lag
        ease: 'none'
    });
});

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
});

// Scroll Progress Bar
gsap.to('#scroll-progress', {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3
    }
});

// Minimalist Scroll Reveals (Stagger children fading up)
// Apply to any parent container that has .section-reveal components inside
const revealContainers = document.querySelectorAll('section');
revealContainers.forEach(section => {
    const defaultReveals = section.querySelectorAll('.section-reveal');

    if (defaultReveals.length > 0) {
        gsap.from(defaultReveals, {
            opacity: 0,
            y: 30,
            duration: 0.9,
            ease: 'power2.out',
            stagger: 0.12,
            scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    }
});

// Canvas Preloader and Logic
const canvas = document.getElementById('armor-canvas');
const context = canvas.getContext('2d');
const globalLoader = document.getElementById('global-loader');
const globalLoadFill = document.getElementById('global-load-fill');
const loadPercentText = document.getElementById('load-percent');

const frameCount = 100;
const currentFrame = index => `assets/frames/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.png`;

const images = [];
const armorSequence = { frame: 0 };
let framesLoaded = 0;

canvas.width = window.innerWidth;
canvas.height = canvas.parentElement.clientHeight;

// Hero Entrance Animation (Fires after initial load)
function playHeroEntrance() {
    gsap.from('.cinematic-title', { opacity: 0, y: 20, duration: 1.1, ease: 'power3.out', delay: 0.3 });
    gsap.from('.cinematic-subtitle, .hero-subtext', { opacity: 0, y: 20, duration: 1.1, ease: 'power3.out', delay: 0.6, stagger: 0.1 });
    gsap.from('.hero-buttons', { opacity: 0, y: 20, duration: 1.1, ease: 'power3.out', delay: 0.8 });
    gsap.from('.stat-pill', { opacity: 0, y: 20, duration: 1.1, ease: 'power3.out', stagger: 0.1, delay: 1 });
}

// Preload sequence
for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);

    img.onload = () => {
        framesLoaded++;
        updateLoadingProgress();
    };

    img.onerror = () => {
        // Handle missing frames silently for continuous loading progress
        framesLoaded++;
        updateLoadingProgress();
    };

    images.push(img);
}

function updateLoadingProgress() {
    const percent = Math.round((framesLoaded / frameCount) * 100);
    globalLoadFill.style.width = percent + '%';
    loadPercentText.innerText = percent + '%';

    if (framesLoaded === frameCount) {
        // Once complete, fade out the loader overlay
        setTimeout(() => {
            document.body.classList.remove('no-scroll');
            globalLoader.classList.add('fade-out');
            
            // Re-enable interactions after fade
            setTimeout(() => {
                globalLoader.style.display = 'none';
                playHeroEntrance();
                render();
                setupScrollAnimation();
                ScrollTrigger.refresh();
            }, 800);
        }, 500);
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = canvas.parentElement.clientHeight; // Use container height (viewport - navbar)
    render();
}
window.addEventListener('resize', resizeCanvas);

function render() {
    const frameIndex = Math.min(frameCount - 1, Math.max(0, Math.round(armorSequence.frame)));
    const img = images[frameIndex];
    if (img && img.complete && img.naturalWidth > 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Aspect Ratio Math (Contain exactly to fit without cropping)
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.min(hRatio, vRatio);

        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;

        context.drawImage(img, 0, 0, img.width, img.height,
            centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    }
}

function setupScrollAnimation() {
    // Fade out hero text on scroll into canvas
    gsap.to('#hero-heading', {
        opacity: 0,
        y: -100,
        ease: 'power1.inOut',
        scrollTrigger: {
            trigger: '#armor-assembly',
            start: 'top top',
            end: '+=800',
            scrub: true
        }
    });

    // Pin Canvas Assembly
    gsap.to(armorSequence, {
        frame: frameCount - 1,
        ease: 'none',
        scrollTrigger: {
            trigger: '#armor-assembly',
            start: 'top top',
            end: '+=4000',
            scrub: 1.5,
            pin: true,
            anticipatePin: 1
        },
        onUpdate: render
    });
}
