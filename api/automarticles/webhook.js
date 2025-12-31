/**
 * Automarticles Webhook for Ponto Um Digital (CJS Version)
 * 
 * This webhook receives blog posts from Automarticles and commits them directly
 * to the GitHub repository using the GitHub API. This triggers a Vercel redeploy
 * and ensures data persistence.
 */

// Use global fetch (Node 18+)
const fetch = global.fetch;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // e.g. "user/repo"
// TEMPORARY: Hardcoded token for debugging
const AUTOMARTICLES_TOKEN = '179055f650fb3e03b140e1522d77e70e'; // process.env.AUTOMARTICLES_TOKEN;

// Paths within the repository
const BASE_PATH = 'public/content/blog';
const POSTS_DIR = `${BASE_PATH}/posts`;
const POSTS_INDEX_PATH = `${BASE_PATH}/posts.index.json`;
const CATEGORIES_INDEX_PATH = `${BASE_PATH}/categories.index.json`;

module.exports = async (req, res) => {
    // 1. Validate Method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Validate Token
    const accessToken = req.headers['access-token'];

    // Automation check logic: Automarticles sends the token they generated.
    // We compare it against the AUTOMARTICLES_TOKEN env var.
    if (!AUTOMARTICLES_TOKEN || accessToken !== AUTOMARTICLES_TOKEN) {
        console.error('Unauthorized access attempt. Expected:', AUTOMARTICLES_TOKEN, 'Got:', accessToken);
        // DEBUG: Return details to client to diagnose mismatch
        return res.status(401).json({
            error: 'Unauthorized',
            got: accessToken,
            expected: AUTOMARTICLES_TOKEN,
            headers: req.headers
        });
    }

    const { event, post, category, replace_to } = req.body;

    // 3. Handle Integration Check
    if (event === 'CHECK_INTEGRATION') {
        return res.status(200).json({ token: AUTOMARTICLES_TOKEN });
    }

    if (!GITHUB_TOKEN || !GITHUB_REPO) {
        console.error('GITHUB_TOKEN or GITHUB_REPO missing in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        console.log(`Processing event: ${event}`);

        switch (event) {
            case 'POST_CREATED':
            case 'POST_UPDATED':
                if (!post || !post.id) return res.status(400).json({ error: 'Missing post data' });
                await handleUpsertPost(post);
                break;

            case 'POST_DELETED':
                if (!post || !post.id) return res.status(400).json({ error: 'Missing post data' });
                await handleDeletePost(post);
                break;

            case 'CATEGORY_CREATED':
            case 'CATEGORY_UPDATED':
                if (!category || !category.id) return res.status(400).json({ error: 'Missing category data' });
                await handleUpsertCategory(category, event === 'CATEGORY_UPDATED');
                break;

            case 'CATEGORY_DELETED':
                if (!category || !category.id) return res.status(400).json({ error: 'Missing category data' });
                await handleDeleteCategory(category.id, replace_to);
                break;

            default:
                console.log(`Event ${event} not handled`);
        }

        return res.status(200).json({ success: true, event });
    } catch (error) {
        console.error('Webhook Error:', error);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * GitHub API Helpers
 */

async function getFile(path) {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
    const res = await fetch(url, {
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Vercel-Serverless-Function'
        }
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub API GET Error: ${res.statusText}`);

    const data = await res.json();
    return {
        content: JSON.parse(Buffer.from(data.content, 'base64').toString('utf8')),
        sha: data.sha
    };
}

async function commitFile(path, content, message, sha = null) {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
    const body = {
        message,
        content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64')
    };
    if (sha) body.sha = sha;

    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Vercel-Serverless-Function'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`GitHub Commit Error: ${err.message}`);
    }
}

async function deleteFile(path, sha, message) {
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Vercel-Serverless-Function'
        },
        body: JSON.stringify({ message, sha })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(`GitHub Delete Error: ${err.message}`);
    }
}

/**
 * Logic Handlers
 */

async function handleUpsertPost(post) {
    // 1. Update Post JSON
    const postPath = `${POSTS_DIR}/${post.slug}.json`;
    const existingPostFile = await getFile(postPath);
    await commitFile(postPath, post, `cms: ${existingPostFile ? 'update' : 'create'} post ${post.slug}`, existingPostFile?.sha);

    // 2. Update Index
    const indexFile = await getFile(POSTS_INDEX_PATH);
    let posts = indexFile ? indexFile.content : [];

    // Remove if exists
    posts = posts.filter(p => p.id !== post.id);

    // Add if published
    if (post.status === 'publish') {
        posts.unshift({
            id: post.id,
            slug: post.slug,
            title: post.title,
            description: post.description,
            publication_date: post.publication_date,
            featured_image: post.featured_image,
            category: post.category
        });
        posts.sort((a, b) => b.publication_date - a.publication_date);
    }

    await commitFile(POSTS_INDEX_PATH, posts, `cms: sync index for ${post.slug}`, indexFile?.sha);
}

async function handleDeletePost(post) {
    // 1. Remove JSON
    const postPath = `${POSTS_DIR}/${post.slug}.json`;
    const postFile = await getFile(postPath);
    if (postFile) {
        await deleteFile(postPath, postFile.sha, `cms: delete post ${post.slug}`);
    }

    // 2. Update Index
    const indexFile = await getFile(POSTS_INDEX_PATH);
    if (indexFile) {
        const posts = indexFile.content.filter(p => p.id !== post.id);
        await commitFile(POSTS_INDEX_PATH, posts, `cms: remove ${post.slug} from index`, indexFile.sha);
    }
}

async function handleUpsertCategory(category, isUpdate) {
    const indexFile = await getFile(CATEGORIES_INDEX_PATH);
    let categories = indexFile ? indexFile.content : [];

    categories = categories.filter(c => c.id !== category.id);
    categories.push(category);

    await commitFile(CATEGORIES_INDEX_PATH, categories, `cms: category ${category.name}`, indexFile?.sha);

    if (isUpdate) {
        // Sync post index category names
        const postIndex = await getFile(POSTS_INDEX_PATH);
        if (postIndex) {
            let changed = false;
            postIndex.content.forEach(p => {
                if (p.category && p.category.id === category.id) {
                    p.category.name = category.name;
                    changed = true;
                }
            });
            if (changed) {
                await commitFile(POSTS_INDEX_PATH, postIndex.content, `cms: sync category rename in index`, postIndex.sha);
            }
        }
    }
}

async function handleDeleteCategory(catId, replaceTo) {
    const indexFile = await getFile(CATEGORIES_INDEX_PATH);
    if (!indexFile) return;

    const categories = indexFile.content.filter(c => c.id !== catId);
    await commitFile(CATEGORIES_INDEX_PATH, categories, `cms: delete category`, indexFile.sha);

    const postIndex = await getFile(POSTS_INDEX_PATH);
    if (postIndex) {
        postIndex.content.forEach(p => {
            if (p.category && p.category.id === catId) {
                p.category = replaceTo || { id: 'uncategorized', name: 'Sem categoria' };
            }
        });
        await commitFile(POSTS_INDEX_PATH, postIndex.content, `cms: reassign posts from deleted category`, postIndex.sha);
    }
}
