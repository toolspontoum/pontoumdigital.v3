
/* -------------------------------------------------------------------------- */
/* COOKIE CONSENT BANNER (LGPD)                                               */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* COOKIE CONSENT BANNER (LGPD) - TECH ENTERPRISE                             */
/* -------------------------------------------------------------------------- */
function initCookieConsent() {
    // Check if user already decided
    const stored = localStorage.getItem('p1d_consent');
    if (stored) {
        try {
            const consent = JSON.parse(stored);
            if (consent.analytics || consent.marketing) enableTracking(consent);
        } catch (e) {
            // Legacy/Error fallback
        }
        return;
    }

    // Create Banner HTML (Modern Floating Card)
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.className = 'fixed bottom-6 left-6 max-w-[340px] w-[calc(100%-48px)] bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 p-6 z-50 rounded-2xl shadow-2xl transform translate-y-[150%] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] font-sans';

    banner.innerHTML = `
        <!-- VIEW 1: SIMPLE -->
        <div id="cookie-simple" class="flex flex-col gap-4 relative">
            <button id="btn-config" type="button" aria-label="Configurar prefer�ncias de cookies" class="absolute -top-2 -right-2 p-2 text-slate-500 hover:text-white transition-colors" title="Configurar Preferências">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
            
            <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                    <img src="/favicon.webp" width="20" height="20" alt="Privacy" class="w-5 h-5 object-contain brightness-0 invert opacity-90">
                </div>
                <div>
                    <h4 class="text-white font-bold text-sm mb-1">Controle de Dados</h4>
                    <p class="text-[10px] text-slate-400 leading-relaxed font-medium">
                        Respeitamos sua privacidade. Personalize ou aceite (cookies e analytics) para continuar.
                    </p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mt-2">
                <button id="reject-all" class="px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-slate-700">
                    Recusar Tudo
                </button>
                <button id="accept-all" class="px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-white text-slate-900 hover:bg-slate-200 transition-all shadow-lg shadow-white/5">
                    Aceitar Tudo
                </button>
            </div>
        </div>

        <!-- VIEW 2: PREFERENCES (Hidden) -->
        <div id="cookie-prefs" class="hidden flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
            <div class="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-2">
                <h4 class="text-white font-bold text-xs uppercase tracking-widest">Preferências</h4>
                <button id="back-to-simple" class="text-slate-500 hover:text-white text-xs">Voltar</button>
            </div>
            
            <!-- Toggles -->
            <div class="space-y-4">
                <!-- Essential -->
                <div class="flex items-center justify-between">
                    <div class="opacity-50">
                        <span class="text-white font-bold text-xs block">Essenciais</span>
                        <span class="text-[9px] text-slate-400">Funcionamento básico.</span>
                    </div>
                    <div class="w-8 h-4 bg-red-600/50 rounded-full relative cursor-not-allowed">
                        <div class="absolute right-0.5 top-0.5 w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                    </div>
                </div>

                <!-- Analytics -->
                <div class="flex items-center justify-between group cursor-pointer" id="toggle-analytics-wrap">
                    <div>
                        <span class="text-white font-bold text-xs block group-hover:text-red-400 transition-colors">Analytics</span>
                        <span class="text-[9px] text-slate-400">Métricas anônimas.</span>
                    </div>
                    <!-- Toggle Switch -->
                    <button id="toggle-analytics" type="button" role="switch" aria-label="Ativar ou desativar cookies de analytics" aria-checked="false" class="w-8 h-4 bg-slate-700 rounded-full relative transition-colors" data-active="false">
                        <div class="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300"></div>
                    </button>
                </div>

                <!-- Marketing -->
                <div class="flex items-center justify-between group cursor-pointer" id="toggle-marketing-wrap">
                    <div>
                        <span class="text-white font-bold text-xs block group-hover:text-red-400 transition-colors">Marketing</span>
                        <span class="text-[9px] text-slate-400">Ads personalizados.</span>
                    </div>
                    <!-- Toggle Switch -->
                    <button id="toggle-marketing" type="button" role="switch" aria-label="Ativar ou desativar cookies de marketing" aria-checked="false" class="w-8 h-4 bg-slate-700 rounded-full relative transition-colors" data-active="false">
                        <div class="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300"></div>
                    </button>
                </div>
            </div>

            <button id="save-prefs" class="w-full mt-2 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-900/20">
                Salvar Preferências
            </button>
        </div>
    `;

    document.body.appendChild(banner);

    // Animate In
    setTimeout(() => {
        banner.classList.remove('translate-y-[150%]');
    }, 1500);

    // --- LOGIC ---

    // 1. Navigation
    document.getElementById('btn-config').addEventListener('click', () => {
        document.getElementById('cookie-simple').classList.add('hidden');
        document.getElementById('cookie-prefs').classList.remove('hidden');
        document.getElementById('cookie-prefs').classList.add('flex');
    });

    document.getElementById('back-to-simple').addEventListener('click', () => {
        document.getElementById('cookie-prefs').classList.add('hidden');
        document.getElementById('cookie-prefs').classList.remove('flex');
        document.getElementById('cookie-simple').classList.remove('hidden');
    });

    // 2. Toggles
    const toggleBtn = (id) => {
        const btn = document.getElementById(id);
        const isActive = btn.getAttribute('data-active') === 'true';
        if (isActive) {
            btn.setAttribute('data-active', 'false');
            btn.setAttribute('aria-checked', 'false');
            btn.classList.remove('bg-red-600');
            btn.classList.add('bg-slate-700');
            btn.querySelector('div').style.transform = 'translateX(0)';
        } else {
            btn.setAttribute('data-active', 'true');
            btn.setAttribute('aria-checked', 'true');
            btn.classList.add('bg-red-600');
            btn.classList.remove('bg-slate-700');
            btn.querySelector('div').style.transform = 'translateX(100%)'; // Adjusted for w-8 (32px), dot w-3 (12px), needs ~16px move
            btn.querySelector('div').style.transform = 'translateX(16px)';
        }
    };

    document.getElementById('toggle-analytics').addEventListener('click', () => toggleBtn('toggle-analytics'));
    document.getElementById('toggle-marketing').addEventListener('click', () => toggleBtn('toggle-marketing'));
    document.getElementById('toggle-analytics-wrap').addEventListener('click', (e) => { if (e.target.closest('button')) return; toggleBtn('toggle-analytics'); });
    document.getElementById('toggle-marketing-wrap').addEventListener('click', (e) => { if (e.target.closest('button')) return; toggleBtn('toggle-marketing'); });

    // 3. Actions
    const saveConsent = (analytics, marketing) => {
        const consent = { necessary: true, analytics, marketing, timestamp: new Date().toISOString() };
        localStorage.setItem('p1d_consent', JSON.stringify(consent));
        hideBanner();
        if (analytics || marketing) enableTracking(consent);
    };

    document.getElementById('accept-all').addEventListener('click', () => saveConsent(true, true));
    document.getElementById('reject-all').addEventListener('click', () => saveConsent(false, false));

    document.getElementById('save-prefs').addEventListener('click', () => {
        const analytics = document.getElementById('toggle-analytics').getAttribute('data-active') === 'true';
        const marketing = document.getElementById('toggle-marketing').getAttribute('data-active') === 'true';
        saveConsent(analytics, marketing);
    });

    function hideBanner() {
        banner.classList.add('translate-y-[150%]');
        setTimeout(() => banner.remove(), 500);
    }
}

function enableTracking() {
    console.log(">> LGPD CONSENT GRANTED: Enabling Tracking Scripts (GA/Pixel)...");
    // HERE: Inject Google Analytics, Facebook Pixel, Hotjar dynamically
    // Example:
    // const script = document.createElement('script');
    // script.src = 'https://www.googletagmanager.com/gtag/js?id=UA-XXXXX';
    // document.head.appendChild(script);
}

// Attach to window so it can be debugged or called explicitly
window.initCookieConsent = initCookieConsent;
