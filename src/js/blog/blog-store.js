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

    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    },

    renderPostCard(post) {
        return `
        <article class="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-red-600/30 transition-all duration-500 flex flex-col h-full shadow-sm hover:shadow-xl">
            <a href="/blog/post.html?slug=${post.slug}" class="block aspect-video overflow-hidden">
                <img src="${post.featured_image.url}" alt="${post.featured_image.alt_text}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
            </a>
            <div class="p-6 flex flex-col flex-grow">
                <div class="flex items-center gap-3 mb-4">
                    <span class="text-[10px] uppercase tracking-[0.2em] text-red-600 font-bold bg-red-600/5 px-2 py-1 rounded">
                        ${post.category.name}
                    </span>
                    <span class="text-[10px] uppercase tracking-[0.1em] text-slate-400">
                        ${this.formatDate(post.publication_date)}
                    </span>
                </div>
                <h3 class="text-xl font-bold text-slate-900 mb-3 group-hover:text-red-600 transition-colors leading-tight">
                    ${post.title}
                </h3>
                <p class="text-slate-500 text-sm line-clamp-2 mb-6 flex-grow leading-relaxed">
                    ${post.description}
                </p>
                <a href="/blog/post.html?slug=${post.slug}" class="text-xs uppercase tracking-[0.2em] text-slate-900 font-bold flex items-center gap-2 group/link">
                    Ler artigo 
                    <span class="w-8 h-[1px] bg-red-600 group-hover/link:w-12 transition-all duration-300"></span>
                </a>
            </div>
        </article>
        `;
    },

    renderCTACard() {
        return `
        <div class="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-red-600/30 rounded-2xl p-8 flex flex-col justify-center items-center text-center h-full relative overflow-hidden group">
            <span class="text-[10px] uppercase tracking-[0.3em] text-red-500 font-bold mb-4 block">Parceiro Estratégico</span>
            <h3 class="text-2xl font-bold text-white mb-4 leading-tight">Engenharia de Software sob demanda.</h3>
            <p class="text-zinc-400 text-sm mb-8 leading-relaxed">Desenvolvemos soluções customizadas que escalam sua produtividade.</p>
            <div class="flex flex-col w-full gap-3">
                <a href="/#contato" class="w-full py-4 bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">Falar com engenharia</a>
                <a href="/#cases" class="w-full py-4 border border-white/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">Ver Portfólio</a>
            </div>
        </div>
        `;
    }
};
