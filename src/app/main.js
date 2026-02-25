import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import '../styles/main.css';
import { BlogStore } from '../modules/blog/blog-store.js';
import '../modules/lgpd.js';

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
    initCookieConsent();
    initDynamicPortfolio(); // NEW: Dynamic Portfolio System
});



/**
 * COMBO ELITE ANIMATIONS
 * Structural and architectural entrance for all major elements
 * PERFORMANCE: Respects prefers-reduced-motion
 */
function initComboElite() {
    // PERFORMANCE: Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If user prefers reduced motion, apply final states immediately without animation
    if (prefersReducedMotion) {
        document.querySelectorAll('.reveal-card, .reveal-text span, .reveal-text div').forEach(el => {
            el.style.opacity = '1';
            el.style.filter = 'blur(0px)';
            el.style.transform = 'translateY(0) scale(1)';
        });
        return; // Skip all animations
    }

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
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (!sections.length) return;

    const options = {
        root: null,
        rootMargin: '-30% 0px -40% 0px', // More balanced for section detection
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');

                // Update Desktop Nav Links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    const href = link.getAttribute('href');

                    // Direct hash match OR special case for homepage blog section
                    if (href.includes(`#${id}`) || (id === 'latest-blog' && href.includes('/blog/'))) {
                        link.classList.add('active');
                    }
                });

                // Update Mobile Nav Links
                mobileNavLinks.forEach(link => {
                    link.classList.remove('active');
                    const href = link.getAttribute('href');

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
        mobileNavLinks.forEach(link => {
            if (link.getAttribute('href').includes('/blog/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

/* -------------------------------------------------------------------------- */
/* 1. DIGITAL WAVE (Round Dots Texture) - PERFORMANCE OPTIMIZED               */
/* -------------------------------------------------------------------------- */
function initDigitalWave() {
    const container = document.getElementById('canvas-lattice');
    if (!container) return;

    // PERFORMANCE: Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        // Show static gradient instead of animated wave
        container.style.background = 'radial-gradient(ellipse at center, rgba(220, 38, 38, 0.1) 0%, transparent 70%)';
        return;
    }

    // PERFORMANCE: Detect mobile/low-power devices
    const isMobile = window.innerWidth < 768;
    const isLowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

    // SCENE
    const scene = new THREE.Scene();

    // CAMERA
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 15, 45);
    camera.lookAt(0, 0, 0);

    // RENDERER - OPTIMIZED
    const renderer = new THREE.WebGLRenderer({
        antialias: !isMobile, // Disable antialiasing on mobile
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // PERFORMANCE: Limit pixel ratio (max 1.5 on mobile, 2 on desktop)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // GENERATE CIRCLE TEXTURE (cached)
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

    // GRID - PERFORMANCE: Reduced particles on mobile/low-power devices
    const SEPARATION = 1.6;
    const AMOUNTX = isMobile || isLowPower ? 70 : 140;  // 50% reduction on mobile
    const AMOUNTY = isMobile || isLowPower ? 25 : 50;   // 50% reduction on mobile

    const numParticles = AMOUNTX * AMOUNTY;
    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            positions[i] = (ix * SEPARATION) - ((AMOUNTX * SEPARATION) / 2);
            positions[i + 1] = 0;
            positions[i + 2] = (iy * SEPARATION) - ((AMOUNTY * SEPARATION) / 2);
            scales[i] = 1;
            i += 3;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // MATERIAL
    const material = new THREE.PointsMaterial({
        color: 0xDC2626,
        size: isMobile ? 0.35 : 0.25, // Slightly larger on mobile to compensate for fewer particles
        map: getCircleTexture(),
        alphaTest: 0.5,
        transparent: true,
        opacity: 0.6,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // MOUSE (throttled)
    let count = 0;
    let mouseX = 0;
    let mouseY = 0;
    let lastMouseUpdate = 0;

    document.addEventListener('mousemove', (event) => {
        // PERFORMANCE: Throttle mouse updates to 60fps
        const now = performance.now();
        if (now - lastMouseUpdate < 16) return;
        lastMouseUpdate = now;

        mouseX = (event.clientX - window.innerWidth / 2) * 0.1;
        mouseY = (event.clientY - window.innerHeight / 2) * 0.1;
    }, { passive: true });

    // ANIMATION STATE
    let isAnimating = false;
    let animationFrameId = null;

    // ANIMATE
    const animate = () => {
        if (!isAnimating) return;

        animationFrameId = requestAnimationFrame(animate);

        const positions = particles.geometry.attributes.position.array;

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                const xVal = (ix + count) * 0.3;
                const zVal = (iy + count) * 0.5;
                let waveHeight = (Math.sin(xVal) * 1.5) + (Math.sin(zVal) * 1.2);

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

    // PERFORMANCE: Use IntersectionObserver to pause animation when not visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!isAnimating) {
                    isAnimating = true;
                    animate();
                    console.log('>> DIGITAL WAVE: Animation resumed (in viewport)');
                }
            } else {
                isAnimating = false;
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                console.log('>> DIGITAL WAVE: Animation paused (out of viewport)');
            }
        });
    }, { threshold: 0.1 });

    observer.observe(container);

    // Start animation if initially visible
    isAnimating = true;
    animate();

    // RESIZE HANDLER (debounced)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, 150);
    }, { passive: true });
}

// Global Process Switcher Logic
window.switchProcess = function (role) {
    const trackClient = document.getElementById('track-client');
    const trackPartner = document.getElementById('track-partner');
    const toggleBg = document.getElementById('toggle-bg');
    const btnClient = document.getElementById('btn-client');
    const btnPartner = document.getElementById('btn-partner');

    // Orbs for background color transition
    const orbClient = document.getElementById('orb-client');
    const orbPartner = document.getElementById('orb-partner');

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

        // Orb Background Transition (Red for Client)
        if (orbClient) {
            orbClient.classList.remove('opacity-0');
            orbClient.classList.add('opacity-100');
        }
        if (orbPartner) {
            orbPartner.classList.remove('opacity-100');
            orbPartner.classList.add('opacity-0');
        }

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

        // Orb Background Transition (Blue for Agency)
        if (orbClient) {
            orbClient.classList.remove('opacity-100');
            orbClient.classList.add('opacity-0');
        }
        if (orbPartner) {
            orbPartner.classList.remove('opacity-0');
            orbPartner.classList.add('opacity-100');
        }
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

// Contact Form Logic: mostra/oculta campo "Fale mais sobre o projeto" quando um tipo de serviço é escolhido
window.toggleProjectDetails = function () {
    const select = document.getElementById('input-service-type');
    const wrap = document.getElementById('project-details-wrap');
    if (!select || !wrap) return;
    const hasValue = select.value && select.value.trim() !== '';
    wrap.classList.toggle('hidden', !hasValue);
};

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
    const serviceType = document.getElementById('input-service-type')?.value?.trim() || '';
    const projectDetails = document.getElementById('input-project-details')?.value?.trim() || '';

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
    if (serviceType) formData.append('tipo_servico', serviceType);
    if (projectDetails) formData.append('detalhes_projeto', projectDetails);

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
    let text = `🚀 *Nova Solicitação via Site*
    
👤 *Nome:* ${name}
🏢 *Empresa:* ${company}
🏷️ *Perfil:* ${userTypeLabel}
📧 *Email:* ${email}
📱 *Tel:* ${phone}`;
    if (serviceType) text += `\n🛠️ *Tipo de serviço:* ${serviceType}`;
    if (projectDetails) text += `\n📝 *Detalhes:* ${projectDetails}`;
    text += `\n\nGostaria de solicitar uma proposta.`;

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

    // Progress Bar Logic - PERFORMANCE: Throttled with requestAnimationFrame
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollTop = window.scrollY;
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const scrollPercent = (scrollTop / docHeight) * 100;
                    progressBar.style.width = `${scrollPercent}%`;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
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

/* -------------------------------------------------------------------------- */
/* DYNAMIC PORTFOLIO SYSTEM                                                    */
/* -------------------------------------------------------------------------- */

let portfolioData = null;
let currentFilter = 'all';
const ITEMS_PER_PAGE = 4;
let currentPage = 1;

/**
 * Initialize Dynamic Portfolio
 * Loads projects from JSON and renders them dynamically
 */
async function initDynamicPortfolio() {
    const grid = document.getElementById('portfolio-grid');
    const filtersContainer = document.getElementById('portfolio-filters');

    if (!grid) return; // Not on homepage

    try {
        // Load projects data
        const response = await fetch('/data/projects.json');
        portfolioData = await response.json();

        // Render filters
        renderFilters(filtersContainer, portfolioData.categories);

        // Render projects
        renderPortfolioGrid(grid, portfolioData.projects);

        console.log(`>> PORTFOLIO: Loaded ${portfolioData.projects.length} projects`);
    } catch (error) {
        console.error("Erro ao carregar portfolio:", error);
        grid.innerHTML = '<div class="col-span-full py-10 text-center text-slate-400">Erro ao carregar projetos.</div>';
    }
}

/**
 * Render Filter Buttons
 */
function renderFilters(container, categories) {
    container.innerHTML = categories.map((cat, index) => `
        <button onclick="filterPortfolio('${cat.id}')"
            class="filter-btn ${index === 0 ? 'active bg-slate-900 text-white border-slate-900' : 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-white hover:border-slate-200'} px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-full transition-all border">
            ${cat.label}
        </button>
    `).join('');
}

/**
 * Filter Portfolio by Category
 */
window.filterPortfolio = function (category) {
    currentFilter = category;
    currentPage = 1;

    const grid = document.getElementById('portfolio-grid');
    const filteredProjects = category === 'all'
        ? portfolioData.projects
        : portfolioData.projects.filter(p => p.category === category);

    // Render ALL filtered projects immediately without pagination limitation
    renderPortfolioGrid(grid, filteredProjects);

    // Update filter button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-slate-900', 'text-white', 'border-slate-900', 'active');
        btn.classList.add('text-slate-500', 'border-transparent');
    });
    // Check if event exists (it might be called programmatically)
    if (event && event.target) {
        event.target.classList.remove('text-slate-500', 'border-transparent');
        event.target.classList.add('bg-slate-900', 'text-white', 'border-slate-900', 'active');
    }
}

/**
 * Render Portfolio Grid with Pagination
 */
function renderPortfolioGrid(container, projects) {
    if (!projects.length) {
        container.innerHTML = '<div class="col-span-full py-10 text-center text-slate-400 font-mono text-xs uppercase tracking-widest">Nenhum projeto encontrado nesta categoria.</div>';
        renderPaginationControls([], 0);
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedProjects = projects.slice(startIndex, endIndex);

    container.innerHTML = paginatedProjects.map(project => createProjectCard(project)).join('');

    // Render pagination controls
    renderPaginationControls(projects, totalPages);

    // Apply reveal animations
    setTimeout(() => {
        const cards = container.querySelectorAll('.reveal-card');
        if (cards.length && window.gsap) {
            gsap.fromTo(cards,
                { opacity: 0, y: 40, filter: 'blur(10px)', scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "expo.out"
                }
            );
        }
    }, 50);
}

/**
 * Render Pagination Controls
 */
function renderPaginationControls(projects, totalPages) {
    const container = document.getElementById('pagination-controls');
    if (!container) return;

    // Hide if only one page or no projects
    if (totalPages <= 1) {
        container.classList.add('hidden');
        container.innerHTML = '';
        return;
    }

    container.classList.remove('hidden');

    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, projects.length);

    let html = `
        <!-- Status Indicator -->
        <div class="w-full flex items-center justify-center gap-4 mb-6">
            <div class="h-px bg-slate-200 flex-1"></div>
            <span class="font-mono text-[10px] text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Exibindo ${startItem}-${endItem} de ${projects.length} cases
            </span>
            <div class="h-px bg-slate-200 flex-1"></div>
        </div>

        <!-- Navigation Controls -->
        <div class="w-full flex items-center justify-center gap-3">
            <!-- Previous Button -->
            <button onclick="changePage(${currentPage - 1})"
                ${currentPage === 1 ? 'disabled' : ''}
                class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${currentPage === 1 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900 hover:bg-white'}"
                aria-label="Página anterior">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                <span class="hidden sm:inline text-xs font-medium uppercase tracking-wide">Anterior</span>
            </button>

            <!-- Page Numbers (Desktop) -->
            <div class="hidden sm:flex items-center gap-1">
    `;

    // Generate page numbers
    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage;
        html += `
            <button onclick="changePage(${i})"
                class="w-10 h-10 rounded-lg text-sm font-bold transition-all ${isActive
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}">
                ${i}
            </button>
        `;
    }

    html += `
            </div>

            <!-- Mobile Page Indicator -->
            <span class="sm:hidden font-mono text-xs text-slate-500">
                Página ${currentPage} / ${totalPages}
            </span>

            <!-- Next Button -->
            <button onclick="changePage(${currentPage + 1})"
                ${currentPage === totalPages ? 'disabled' : ''}
                class="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${currentPage === totalPages ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900 hover:bg-white'}"
                aria-label="Próxima página">
                <span class="hidden sm:inline text-xs font-medium uppercase tracking-wide">Próxima</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
            </button>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * Change Page
 */
window.changePage = function (page) {
    const filteredProjects = currentFilter === 'all'
        ? portfolioData.projects
        : portfolioData.projects.filter(p => p.category === currentFilter);

    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

    // Validate page number
    if (page < 1 || page > totalPages) return;

    currentPage = page;

    const grid = document.getElementById('portfolio-grid');
    renderPortfolioGrid(grid, filteredProjects);

    // Scroll to top of cases section
    const casesSection = document.getElementById('cases');
    if (casesSection) {
        const headerOffset = 100;
        const elementPosition = casesSection.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
            top: elementPosition - headerOffset,
            behavior: 'smooth'
        });
    }
};

/**
 * Create Project Card HTML
 * PERFORMANCE: Optimized screenshot loading with reduced timeout and better fallbacks
 */
function createProjectCard(project) {
    // Use local images from /public/images/cases/
    // Format: {project-id}_cover.webp and {project-id}_mockup.webp
    const desktopScreenshot = project.desktopImage || `/images/cases/${project.id}_cover.webp`;
    const mobileScreenshot = project.mobileImage || `/images/cases/${project.id}_mockup.webp`;

    return `
        <div class="reveal-card project-item group relative bg-white rounded-2xl border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            data-category="${project.category}"
            onclick="openCaseModal('${project.url}', '${project.title}')">
            
            <!-- Cover Area (Desktop Screenshot) -->
            <div class="h-56 bg-slate-900 relative overflow-hidden rounded-t-2xl z-0">
                <img src="${desktopScreenshot}" 
                    alt="${project.title}"
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                    class="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                    onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900\\'><span class=\\'font-mono text-[10px] text-white/40 uppercase tracking-widest\\'>Clique para ver</span></div>'">
            </div>

            <!-- iPhone Mockup (Mobile Screenshot) -->
            <div class="absolute top-12 right-4 w-[70px] h-[140px] md:top-16 md:right-8 md:w-[100px] md:h-[200px] bg-slate-900 rounded-[0.75rem] md:rounded-[1rem] border-[1.5px] md:border-[2px] border-slate-900 shadow-2xl overflow-hidden z-30 transition-all duration-500 group-hover:-translate-y-4 group-hover:shadow-brand-red/10">
                <!-- Dynamic Island -->
                <div class="absolute top-1.5 md:top-2 left-1/2 -translate-x-1/2 w-6 md:w-8 h-1 md:h-1.5 bg-slate-900 rounded-full z-40 border border-white/5"></div>
                <!-- Screen Image -->
                <img src="${mobileScreenshot}" 
                    alt="${project.title} Mobile"
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                    class="w-full h-full object-cover object-top"
                    onerror="this.style.display='none'">
                <!-- Screen Glare -->
                <div class="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
            </div>

            <!-- Content Area -->
            <div class="p-8 pt-10 relative z-10 bg-white rounded-b-2xl">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-sans font-bold text-xl text-slate-900 group-hover:text-brand-red transition-colors">
                        ${project.title}
                    </h3>
                    <span class="font-mono text-[10px] font-bold text-slate-300 uppercase tracking-widest">${project.year}</span>
                </div>
                <p class="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2 pr-16">${project.description}</p>
                
                <!-- Action Hint -->
                <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400 group-hover:text-brand-red transition-colors duration-300">
                    <span>Ver projeto</span>
                    <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                </div>
            </div>
        </div>
    `;
}

/**
 * Open Case Preview Modal
 */
window.openCaseModal = function (url, title) {
    const modal = document.getElementById('case-modal');
    const iframe = document.getElementById('modal-iframe');
    const modalTitle = document.getElementById('modal-title');
    const loading = document.getElementById('modal-loading');

    if (!modal || !iframe) return;

    // Set title and show modal
    modalTitle.textContent = title;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Show loading, hide iframe
    loading.classList.remove('hidden');
    iframe.classList.add('opacity-0');

    // Set iframe source
    iframe.src = url;

    // When iframe loads, hide loading and show content
    iframe.onload = () => {
        loading.classList.add('hidden');
        iframe.classList.remove('opacity-0');
    };

    // Handle iframe errors
    iframe.onerror = () => {
        loading.innerHTML = `
    < div class="flex flex-col items-center gap-4 text-center px-8" >
                <svg class="h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="font-mono text-sm text-slate-500">Não foi possível carregar o preview.</span>
            </div >
    `;
    };
}

/**
 * Close Case Preview Modal
 */
window.closeCaseModal = function () {
    const modal = document.getElementById('case-modal');
    const iframe = document.getElementById('modal-iframe');

    if (!modal) return;

    modal.classList.add('hidden');
    document.body.style.overflow = '';

    // Clear iframe to stop any media
    if (iframe) {
        iframe.src = 'about:blank';
    }
}

/**
 * Show Blocked Action Toast
 */
function showBlockedToast() {
    const toast = document.getElementById('blocked-toast');
    if (!toast) return;

    toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
    }, 3000);
}
