const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'toolspontoum';
const GITHUB_REPO = process.env.GITHUB_REPO || 'pontoumdigital.v3';
const BRANCH = 'main';

// Helper to interact with GitHub API
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
    await ghCall(path, 'PUT', body);
}

module.exports = async (req, res) => {
    // 1. Authentication with Automarticles
    const accessToken = req.headers['access-token'];
    const expectedToken = process.env.AUTOMARTICLES_TOKEN || 'ponto1_secure_token_2024';

    if (accessToken !== expectedToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { body } = req;
    const { event } = body;

    // 2. CHECK_INTEGRATION
    if (event === 'CHECK_INTEGRATION') {
        return res.status(200).json({ token: expectedToken });
    }

    if (!GITHUB_TOKEN) {
        return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
    }

    try {
        // Load Indexes from GitHub
        const { content: postsIndex, sha: postsSha } = await getFile('public/content/blog/posts.index.json');
        const { content: categoriesIndex, sha: categoriesSha } = await getFile('public/content/blog/categories.index.json');

        const currentPosts = postsIndex || [];
        const currentCategories = categoriesIndex || [];

        switch (event) {
            case 'POST_CREATED':
            case 'POST_UPDATED':
                const post = body.post;
                if (!post || !post.slug) break;

                // 1. Save individual post file
                const { sha: postFileSha } = await getFile(`public/content/blog/posts/${post.slug}.json`);
                await commitFile(`public/content/blog/posts/${post.slug}.json`, post, `Automarticles: ${event} - ${post.title}`, postFileSha);

                // 2. Update Index
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
                await commitFile('public/content/blog/posts.index.json', updatedPosts, `Automarticles: Update Index for ${post.title}`, postsSha);
                break;

            case 'POST_DELETED':
                const delPost = currentPosts.find(p => p.id === body.post?.id);
                if (delPost) {
                    const { sha: delSha } = await getFile(`public/content/blog/posts/${delPost.slug}.json`);
                    if (delSha) {
                        await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/public/content/blog/posts/${delPost.slug}.json`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `token ${GITHUB_TOKEN}`,
                                'Accept': 'application/vnd.github.v3+json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ message: `Automarticles: DELETE ${delPost.title}`, sha: delSha, branch: BRANCH })
                        });
                    }
                    const newPosts = currentPosts.filter(p => p.id !== delPost.id);
                    await commitFile('public/content/blog/posts.index.json', newPosts, `Automarticles: Remove from Index ${delPost.title}`, postsSha);
                }
                break;

            // ... Lógica similar para categorias poderia ser expandida aqui se necessário ...
        }

        return res.status(200).json({ success: true, event });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Error during GitHub Sync', details: err.message });
    }
};

