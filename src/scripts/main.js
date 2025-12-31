import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import '../styles/main.css';
import { BlogStore } from '../js/blog/blog-store.js';

console.log(">> X-APPS SYSTEM: V8.0 (MODULAR) INITIALIZING...");

gsap.registerPlugin(ScrollTrigger);
window.gsap = gsap;
window.ScrollTrigger = ScrollTrigger;

document.addEventListener('DOMContentLoaded', () => {
    initDigitalWave();
    initScrollAnimations();
    initScrollSpy();
    initComboElite();
    initHomeBlog();
});

/**
 * COMBO ELITE ANIMATIONS
 * Structural and architectural entrance for all major elements
 */
function initComboElite() {
    // 1. Text Mask Reveal
    const maskTexts = document.querySelectorAll('.reveal-text');
    maskTexts.forEach(mask => {
        const target = mask.querySelector('span, div');
        if (target) {
            gsap.to(target, {
                y: '0%',
                duration: 0.8,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: mask,
                    start: 'top 98%',
                    toggleActions: 'play none none none'
                }
            });
        }
    });

    // 2. Blur-to-Focus Card Stagger (Generalized)
    const revealGrids = document.querySelectorAll('.grid, .flex-wrap, .inline-flex'); // Added inline-flex for process toggle
    revealGrids.forEach(grid => {
        const cards = grid.querySelectorAll('.reveal-card, button'); // Also target buttons inside inline-flex if they don't have reveal-card class
        if (cards.length) {
            gsap.to(cards, {
                opacity: 1,
                filter: 'blur(0px)',
                scale: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: grid,
                    start: 'top 95%', // Trigger slightly earlier
                }
            });
        }
    });

    // Special fallback for solo reveal cards (like in hero if container doesn't match above)
    // This ensures HERO buttons are always visible even if ScrollTrigger fails
    const heroButtons = document.querySelectorAll('.max-w-4xl .reveal-card');
    if (heroButtons.length) {
        gsap.to(heroButtons, {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            duration: 0.8,
            delay: 0.5, // Wait for text
            ease: "expo.out"
        });
    }

    // Force Process Toggle Visibility
    const processToggle = document.querySelectorAll('#process .reveal-card');
    if (processToggle.length) {
        gsap.to(processToggle, {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            duration: 0.8,
            scrollTrigger: {
                trigger: '#process',
                start: 'top 80%'
            }
        });
    }

    // 3. Border Drawing
    const borders = document.querySelectorAll('.reveal-border');
    borders.forEach(border => {
        gsap.to(border, {
            scaleX: 1,
            duration: 1.5,
            ease: "expo.inOut",
            scrollTrigger: {
                trigger: border,
                start: 'top 95%',
            }
        });
    });

    // 4. Hero Metrics Counter (Data-Stream Style)
    const metrics = document.querySelectorAll('.metric-counter');
    metrics.forEach(metric => {
        const targetValue = parseInt(metric.getAttribute('data-value'));
        const prefix = metric.getAttribute('data-prefix') || '';
        const obj = { value: 0 };

        gsap.to(obj, {
            value: targetValue,
            duration: 2,
            ease: "power4.out",
            scrollTrigger: {
                trigger: metric,
                start: 'top 90%',
            },
            onUpdate: () => {
                metric.textContent = prefix + Math.floor(obj.value);
            }
        });
    });
}

/**
 * SCROLL SPY LOGIC
 * Highlights the current section in the navigation menu.
 */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link-underline');

    if (!sections.length || !navLinks.length) return;

    const options = {
        root: null,
        rootMargin: '-30% 0px -40% 0px', // More balanced for section detection
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    const href = link.getAttribute('href');

                    // Direct hash match OR special case for homepage blog section
                    if (href.includes(`#${id}`) || (id === 'latest-blog' && href.includes('/blog/'))) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, options);

    sections.forEach(section => observer.observe(section));

    // Special case for Blog page
    if (window.location.pathname.includes('/blog/')) {
        navLinks.forEach(link => {
            if (link.getAttribute('href').includes('/blog/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

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

    // GENERATE CIRCLE TEXTURE
    function getCircleTexture() {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
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

    // MATERIAL
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

// Global Process Switcher Logic
window.switchProcess = function (role) {
    const trackClient = document.getElementById('track-client');
    const trackPartner = document.getElementById('track-partner');
    const toggleBg = document.getElementById('toggle-bg');
    const btnClient = document.getElementById('btn-client');
    const btnPartner = document.getElementById('btn-partner');

    if (!trackClient || !trackPartner) return; // Safety check

    if (role === 'client') {
        // UI Visuals
        toggleBg.style.left = '4px'; // 1 (padding)

        // Force Instant Color Change via Style (Bulletproof)
        btnClient.className = "relative z-10 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest w-48 text-white";

        // Reset Partner to Gray
        btnPartner.className = "relative z-10 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest w-48 text-slate-500 hover:text-slate-900";

        // Tracks Animation
        trackClient.classList.remove('opacity-0', 'translate-y-8', 'scale-95', 'pointer-events-none');
        trackClient.classList.add('opacity-100', 'translate-y-0', 'scale-100');

        trackPartner.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
        trackPartner.classList.add('opacity-0', 'translate-y-8', 'scale-95', 'pointer-events-none');

    } else {
        // UI Visuals
        // Width of button is w-48 (12rem = 192px). Padding is 4px.
        // Approx calc for right side.
        toggleBg.style.left = 'calc(100% - 196px)';

        // Force Instant Color Change via Style (Bulletproof)
        // Reset Client to Gray
        btnClient.className = "relative z-10 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest w-48 text-slate-500 hover:text-slate-900";

        // Set Partner to White
        btnPartner.className = "relative z-10 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest w-48 text-white";

        // Tracks Animation
        trackPartner.classList.remove('opacity-0', 'translate-y-8', 'scale-95', 'pointer-events-none');
        trackPartner.classList.add('opacity-100', 'translate-y-0', 'scale-100');

        trackClient.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
        trackClient.classList.add('opacity-0', 'translate-y-8', 'scale-95', 'pointer-events-none');
    }
};

// Mobile Menu Toggle
function mobileMenuToggle() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    // ... (rest of menu logic if any)
}

function initDynamicDates() {
    const quarterText = document.getElementById('quarter-text');
    const dateText = document.getElementById('date-text');

    if (!quarterText || !dateText) return;

    const now = new Date();
    const month = now.getMonth(); // 0-11
    const day = now.getDate();
    const year = now.getFullYear();

    // Determine current quarter (1-4)
    let currentQ = Math.floor(month / 3) + 1;
    let targetQ = currentQ;
    let targetYear = year;

    // Check if it is the last week of the quarter
    // Quarters end in: March (2), June (5), Sept (8), Dec (11)
    const quarterEndMonths = [2, 5, 8, 11];

    // Logic: If current month is a quarter ending month AND we are in the last 7 days
    if (quarterEndMonths.includes(month)) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        if (day > daysInMonth - 7) {
            // Roll over to next quarter
            targetQ++;
            if (targetQ > 4) {
                targetQ = 1;
                targetYear++;
            }
        }
    }

    // Update Badge Text
    quarterText.textContent = `Agenda do ${targetQ}º trimestre/${targetYear} aberta`;

    // Update Current Date Text
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateString = now.toLocaleDateString('pt-BR', options);
    // Capitalize first letter of date
    dateText.textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
}

// Initialize everything on load
window.addEventListener('load', () => {
    initScrollAnimations();
    initDynamicDates();
    // Re-run animation loop if needed for canvas (managed inside script.js usually)
});

// Contact Form Logic
window.updateProgress = function () {
    const name = document.getElementById('input-name');
    const email = document.getElementById('input-email');
    const phone = document.getElementById('input-phone');
    const type = document.querySelector('input[name="user-type"]:checked');
    const bar = document.getElementById('form-progress');

    if (!name || !email || !phone) return;

    let progress = 0;
    if (name.value.length > 0) progress += 25;
    if (email.value.length > 0) progress += 25;
    if (phone.value.length > 0) progress += 25;
    if (type) progress += 25;

    if (bar) {
        bar.style.width = progress + '%';
    }
};

window.handleFormSubmit = function (e) {
    e.preventDefault();

    // --- CONFIGURATION ---
    const PRIMARY_EMAIL = 'icaro.prudencio@pontoumdigital.com.br';
    const CC_EMAILS = 'roberto@pontoumdigital.com.br,icarprudencio@gmail.com'; // Fixed typo gmai.com -> gmail.com
    // ---------------------

    // 1. Capture Data
    const name = document.getElementById('input-name')?.value || 'N/A';
    const company = document.getElementById('input-company')?.value || 'N/A';
    const email = document.getElementById('input-email')?.value || 'N/A';
    const phone = document.getElementById('input-phone')?.value || 'N/A';

    // Get selected radio
    const userTypeEl = document.querySelector('input[name="user-type"]:checked');
    const userType = userTypeEl ? userTypeEl.value : 'N/A';
    const userTypeLabel = userType === 'cliente' ? 'Cliente Final' : 'Agência/Parceiro';

    // 2. Prepare Email Payload (FormSubmit)
    const formData = new FormData();
    formData.append('nome', name);
    formData.append('empresa', company);
    formData.append('perfil', userTypeLabel);
    formData.append('email', email);
    formData.append('telefone', phone);

    // FormSubmit Settings
    formData.append('_subject', `🚀 Novo Lead P1D: ${name}`);
    formData.append('_cc', CC_EMAILS);
    formData.append('_template', 'table');
    formData.append('_captcha', 'false'); // Disable captcha for smoother UX

    console.log(">> SENDING EMAIL TO:", PRIMARY_EMAIL);

    // 3. Send via AJAX (Fire & Forget for speed)
    fetch(`https://formsubmit.co/ajax/${PRIMARY_EMAIL}`, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => console.log('Email sent successfully:', data))
        .catch(error => console.error('Email failed:', error));

    // 4. Construct WhatsApp Message (Redundancy)
    const text = `🚀 *Nova Solicitação via Site*
    
👤 *Nome:* ${name}
🏢 *Empresa:* ${company}
🏷️ *Perfil:* ${userTypeLabel}
📧 *Email:* ${email}
📱 *Tel:* ${phone}

Gostaria de solicitar uma proposta.`;

    // 5. Update Success Overlay Button
    const waLink = `https://wa.me/5513991014502?text=${encodeURIComponent(text)}`;
    const successBtn = document.querySelector('#success-overlay a');
    if (successBtn) successBtn.href = waLink;

    // 6. UI Transition (Immediate)
    const form = document.getElementById('project-form');
    const overlay = document.getElementById('success-overlay');

    if (form && overlay) {
        form.style.opacity = '0';
        form.style.pointerEvents = 'none';

        overlay.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
        overlay.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');

        const bar = document.getElementById('form-progress');
        if (bar) bar.style.width = '100%';
    }
};

function initScrollAnimations() {
    // Header Shadow on Scroll
    if (document.querySelector('#main-header')) {
        ScrollTrigger.create({
            start: 'top -50',
            end: 99999,
            toggleClass: { className: 'shadow-md', targets: '#main-header' }
        });
    }

    // Progress Bar Logic
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = `${scrollPercent}%`;
        });
    }
}

async function initHomeBlog() {
    const container = document.getElementById('home-blog-list');
    if (!container) return;

    try {
        const posts = await BlogStore.fetchIndex();

        if (!posts || posts.length === 0) {
            container.innerHTML = '<div class="col-span-full py-10 text-center text-slate-400">Em breve, novos conteúdos técnicos.</div>';
            return;
        }

        const latest = posts.slice(0, 3);
        container.innerHTML = latest.map((post, index) => {
            return `
            <a href="/blog/post.html?slug=${post.slug}" class="blog-card-new group reveal-card opacity-0">
                <div class="img-container">
                    <img src="${post.featured_image.url}" alt="${post.title}">
                </div>
                <div class="flex items-center">
                    <span class="category">${post.category.name}</span>
                    <span class="date">${BlogStore.formatDate(post.publication_date)}</span>
                </div>
                <h3>${post.title}</h3>
                <p class="excerpt">${post.description || 'Explorando as tendências que vão moldar o desenvolvimento de software nos próximos anos...'}</p>
                <div class="explore">
                    Explorar <span class="explore-line"></span>
                </div>
            </a>
            `;
        }).join('');

        // Entrance Animation
        const cards = container.querySelectorAll('.reveal-card');
        if (cards.length && window.gsap) {
            window.gsap.to(cards, {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                scale: 1,
                duration: 1,
                stagger: 0.15,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: container,
                    start: 'top 85%',
                }
            });
        }
    } catch (error) {
        console.error("Erro ao carregar blog na home:", error);
        container.innerHTML = '<div class="col-span-full py-10 text-center text-slate-400">Erro ao carregar conteúdos.</div>';
    }
}
