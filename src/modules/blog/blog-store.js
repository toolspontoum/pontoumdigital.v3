/**
 * BlogStore - Gestor de dados do blog
 */
export const BlogStore = {
    async fetchIndex() {
        try {
            const response = await fetch('/content/blog/posts.index.json?v=' + Date.now());
            return await response.json();
        } catch (e) {
            console.error("Erro ao carregar index do blog", e);
            return [];
        }
    },

    async fetchCategories() {
        try {
            const response = await fetch('/content/blog/categories.index.json');
            return await response.json();
        } catch (e) {
            return [];
        }
    },

    async fetchPost(slug) {
        try {
            const response = await fetch(`/content/blog/posts/${slug}.json`);
            if (!response.ok) throw new Error('Post não encontrado');
            return await response.json();
        } catch (e) {
            console.error("Erro ao carregar post", e);
            return null;
        }
    },

    formatDate(value) {
        if (!value) return "";

        // If it's a number appearing to be seconds (e.g. Automarticles timestamp), convert to ms
        // 10000000000 is year 2286, so safe check for seconds vs ms
        const date = new Date(typeof value === 'number' && value < 10000000000 ? value * 1000 : value);

        if (isNaN(date.getTime())) return "";

        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    },

    renderPostCard(post) {
        return `
        <a href="/blog/post.html?slug=${post.slug}" class="blog-card-new group">
            <div class="img-container">
                <img src="${post.featured_image.url}" alt="${post.featured_image.alt_text}">
            </div>
            <div class="flex items-center">
                <span class="category">${post.category.name}</span>
                <span class="date">${this.formatDate(post.publication_date)}</span>
            </div>
            <h3>${post.title}</h3>
            <p class="excerpt">${post.description}</p>
            <div class="explore">
                Explorar <span class="explore-line"></span>
            </div>
        </a>
        `;
    },

    renderRecentPostsWidget(posts) {
        return posts.map(post => `
            <a href="/blog/post.html?slug=${post.slug}" class="group flex gap-4 items-start mb-6 last:mb-0">
                <div class="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img src="${post.featured_image.url}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                </div>
                <div>
                    <h4 class="text-sm font-bold text-slate-900 leading-tight mb-1 group-hover:text-red-600 transition-colors line-clamp-2">${post.title}</h4>
                    <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">${this.formatDate(post.publication_date)}</span>
                </div>
            </a>
        `).join('');
    },

    renderCTACard() {
        return `
        <div class="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-center group h-full flex flex-col justify-center border border-slate-800 hover:border-red-600/50 transition-colors duration-500 shadow-2xl hover:shadow-red-900/20">
            <!-- Background Abstract -->
            <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black opacity-100"></div>
            <div class="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            
            <div class="relative z-10">
                <div class="w-16 h-16 mx-auto mb-6 p-3 bg-slate-800/50 rounded-full border border-slate-700 group-hover:scale-110 transition-transform duration-500 group-hover:border-red-500/50">
                    <img src="/favicon.png" alt="Ponto Um Logo" class="w-full h-full object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity">
                </div>
                <h3 class="text-xl font-bold text-white mb-4 leading-tight">Engenharia de Elite para Projetos Ambiciosos.</h3>
                <p class="text-slate-400 text-sm mb-8 leading-relaxed">
                    Tem uma visão de Software, App ou IA? Não arrisque na execução. Agende uma consultoria estratégica.
                </p>
                <a href="https://pontoumdigital.com.br/#contact" class="btn-premium cta-shine bg-gradient-to-r from-white to-slate-200 text-slate-900 px-6 py-4 rounded-xl font-bold hover:to-white transition-all shadow-xl text-xs inline-flex items-center justify-center gap-2 mx-auto uppercase tracking-widest w-full group-hover:shadow-white/20">
                    <span class="arrow-slide">Agendar Diagnóstico</span>
                    <svg class="arrow-icon w-4 h-4 text-red-600" viewBox="0 0 16 16"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M1 8h13m0 0L10.5 4.5M14 8l-3.5 3.5"></path></svg>
                </a>
            </div>
        </div>
        `;
    }
};
