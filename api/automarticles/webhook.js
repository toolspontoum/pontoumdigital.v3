const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'toolspontoum';
const GITHUB_REPO = process.env.GITHUB_REPO || 'pontoumdigital.v3';
const BRANCH = 'main';

// Segredo que aparece na sua tela do Automarticles em caso de falha na Vercel
const FALLBACK_TOKEN = '9f7d07b2715ce7985c5ced166c066aaa';

async function ghCall(url, method = 'GET', body = null) {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${url}`, {
        method,
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : null
    });
    return res;
}

async function getFile(path) {
    const res = await ghCall(path);
    if (res.status === 404) return { content: null, sha: null };
    const data = await res.json();
    if (!data.content) return { content: null, sha: data.sha };
    return {
        content: JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')),
        sha: data.sha
    };
}

async function commitFile(path, content, message, sha = null) {
    const body = {
        message,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
        branch: BRANCH
    };
    if (sha) body.sha = sha;
    return await ghCall(path, 'PUT', body);
}

module.exports = async (req, res) => {
    // 0. Permite GET apenas para teste manual no navegador
    if (req.method === 'GET') {
        return res.status(200).send('Webhook Online! Por favor, utilize o método POST para integração.');
    }

    // 1. Autenticação
    const accessToken = req.headers['access-token'];
    const expectedToken = process.env.AUTOMARTICLES_TOKEN || FALLBACK_TOKEN;

    if (!accessToken || accessToken !== expectedToken) {
        console.error('Falha de Autenticação: Token recebido:', accessToken);
        return res.status(401).json({ error: 'Unauthorized', message: 'Token de autenticação inválido ou ausente.' });
    }

    // 2. Extração do corpo de forma segura
    const body = req.body || {};
    const event = body.event;

    // 3. Verificação de Integração (Resposta rápida)
    if (event === 'CHECK_INTEGRATION') {
        return res.status(200).json({ token: expectedToken, status: 'ok' });
    }

    // 4. Verificação do GitHub Token para os eventos reais
    if (!GITHUB_TOKEN) {
        console.error('Configuração ausente: GITHUB_TOKEN');
        return res.status(500).json({ error: 'GITHUB_TOKEN_MISSING', message: 'Configuração do GitHub não encontrada na Vercel.' });
    }

    try {
        console.log(`Processando evento: ${event}`);

        // Carrega os índices do GitHub
        const { content: postsIndex, sha: postsSha } = await getFile('public/content/blog/posts.index.json');
        const currentPosts = postsIndex || [];

        switch (event) {
            case 'POST_CREATED':
            case 'POST_UPDATED':
                const post = body.post;
                if (!post || !post.slug) {
                    return res.status(400).json({ error: 'Invalid Post Data' });
                }

                // Salva o arquivo do post
                const { sha: postFileSha } = await getFile(`public/content/blog/posts/${post.slug}.json`);
                await commitFile(`public/content/blog/posts/${post.slug}.json`, post, `Automarticles: ${event} - ${post.title}`, postFileSha);

                // Atualiza o Índice principal
                let updatedPosts = currentPosts.filter(p => p.id !== post.id);
                if (post.status === 'publish') {
                    updatedPosts.unshift({
                        id: post.id,
                        slug: post.slug,
                        title: post.title,
                        description: post.description,
                        publication_date: post.publication_date,
                        featured_image: post.featured_image,
                        category: post.category
                    });
                    updatedPosts.sort((a, b) => b.publication_date - a.publication_date);
                }
                await commitFile('public/content/blog/posts.index.json', updatedPosts, `Automarticles: Index Update - ${post.title}`, postsSha);
                break;

            case 'POST_DELETED':
                const delId = body.post?.id;
                const delPost = currentPosts.find(p => p.id === delId);
                if (delPost) {
                    const { sha: delSha } = await getFile(`public/content/blog/posts/${delPost.slug}.json`);
                    if (delSha) {
                        await ghCall(`public/content/blog/posts/${delPost.slug}.json`, 'DELETE', {
                            message: `Automarticles: DELETE ${delPost.title}`,
                            sha: delSha,
                            branch: BRANCH
                        });
                    }
                    const newPosts = currentPosts.filter(p => p.id !== delId);
                    await commitFile('public/content/blog/posts.index.json', newPosts, `Automarticles: Remove Index ${delPost.title}`, postsSha);
                }
                break;
        }

        return res.status(200).json({ success: true, event });
    } catch (err) {
        console.error('Erro no Webhook:', err);
        return res.status(500).json({ error: 'Integration Error', details: err.message });
    }
};


