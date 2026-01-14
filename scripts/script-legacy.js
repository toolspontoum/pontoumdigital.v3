// X-APPS ENGINEERING V7.3 // ROUND PARTICLES

console.log(">> X-APPS SYSTEM: V7.3 (ROUND DOTS) INITIALIZING...");

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    initDigitalWave();
    initScrollAnimations();
});

/* -------------------------------------------------------------------------- */
/* 1. DIGITAL WAVE (Round Dots Texture)                                       */
/* -------------------------------------------------------------------------- */
function initDigitalWave() {
    const container = document.getElementById('canvas-lattice');
    if (!container) return;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    // Adjusted angle for panoramic view
    camera.position.set(0, 15, 45);
    camera.lookAt(0, 0, 0);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // GENERATE CIRCLE TEXTURE (To fix "Squares" issue)
    function getCircleTexture() {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff'; // White shape (colored by material)
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    // GRID
    const SEPARATION = 1.6;
    const AMOUNTX = 140;
    const AMOUNTY = 50;

    const numParticles = AMOUNTX * AMOUNTY;
    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            positions[i] = (ix * SEPARATION) - ((AMOUNTX * SEPARATION) / 2); // x
            positions[i + 1] = 0; // y
            positions[i + 2] = (iy * SEPARATION) - ((AMOUNTY * SEPARATION) / 2); // z
            scales[i] = 1;
            i += 3;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // MATERIAL (With Texture Map = Round)
    const material = new THREE.PointsMaterial({
        color: 0xDC2626, // Brand Red
        size: 0.25,
        map: getCircleTexture(),
        alphaTest: 0.5,
        transparent: true,
        opacity: 0.6,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // MOUSE
    let count = 0;
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) * 0.1;
        mouseY = (event.clientY - window.innerHeight / 2) * 0.1;
    });

    // ANIMATE
    const animate = () => {
        requestAnimationFrame(animate);

        const positions = particles.geometry.attributes.position.array;

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {

                // Sine Wave
                const xVal = (ix + count) * 0.3;
                const zVal = (iy + count) * 0.5;
                let waveHeight = (Math.sin(xVal) * 1.5) + (Math.sin(zVal) * 1.2);

                // Interactive Dip
                const pX = positions[i];
                const pZ = positions[i + 2];
                const dist = Math.sqrt((pX - mouseX * 2) ** 2 + (pZ - mouseY * 3) ** 2);

                if (dist < 15) {
                    const depth = (15 - dist) * 0.8;
                    waveHeight -= depth;
                }

                positions[i + 1] = waveHeight;
                i += 3;
            }
        }

        particles.geometry.attributes.position.needsUpdate = true;
        count += 0.05;

        renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/* -------------------------------------------------------------------------- */
/* 2. SCROLL ANIMATIONS                                                       */
/* -------------------------------------------------------------------------- */
function initScrollAnimations() {
    if (document.querySelector('#main-header')) {
        ScrollTrigger.create({
            start: 'top -50',
            end: 99999,
            toggleClass: { className: 'shadow-md', targets: '#main-header' }
        });
    }
    if (document.querySelector('#hero-panel')) {
        gsap.to('#hero-panel', {
            y: 80,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }
    const cards = document.querySelectorAll('#expertise .group');
    if (cards.length > 0) {
        gsap.from(cards, {
            y: 40,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: '#expertise',
                start: "top 85%"
            }
        });
    }
}
