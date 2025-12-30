const fs = require('fs');
const path = require('path');

// Paths to storage
const BLOG_DIR = path.join(process.cwd(), 'public', 'content', 'blog');
const POSTS_DIR = path.join(BLOG_DIR, 'posts');
const POSTS_INDEX = path.join(BLOG_DIR, 'posts.index.json');
const CATEGORIES_INDEX = path.join(BLOG_DIR, 'categories.index.json');

// Ensure directories exist
if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true });

function readJsonFile(filePath, defaultValue = []) {
    if (!fs.existsSync(filePath)) return defaultValue;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        return defaultValue;
    }
}

function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = async (req, res) => {
    const accessToken = req.headers['access-token'];
    const expectedToken = process.env.AUTOMARTICLES_TOKEN || 'ponto1_secure_token_2024';

    // 1. Authentication
    if (accessToken !== expectedToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const body = req.body;
    const event = body.event;

    // 2. CHECK_INTEGRATION
    if (event === 'CHECK_INTEGRATION') {
        return res.status(200).json({ token: expectedToken });
    }

    // Load Indexes
    let postsIndex = readJsonFile(POSTS_INDEX);
    let categoriesIndex = readJsonFile(CATEGORIES_INDEX);

    switch (event) {
        case 'POST_CREATED':
        case 'POST_UPDATED':
            const post = body.post;
            if (!post || !post.id) break;

            // Save individual post file
            writeJsonFile(path.join(POSTS_DIR, `${post.slug}.json`), post);

            // Update Index (only if status is publish)
            postsIndex = postsIndex.filter(p => p.id !== post.id);
            if (post.status === 'publish') {
                postsIndex.unshift({
                    id: post.id,
                    slug: post.slug,
                    title: post.title,
                    description: post.description,
                    publication_date: post.publication_date,
                    featured_image: post.featured_image,
                    category: post.category
                });
                // Sort by date desc
                postsIndex.sort((a, b) => b.publication_date - a.publication_date);
            }
            writeJsonFile(POSTS_INDEX, postsIndex);
            break;

        case 'POST_DELETED':
            const deleteId = body.post?.id;
            const postToDelete = postsIndex.find(p => p.id === deleteId);
            if (postToDelete) {
                const filePath = path.join(POSTS_DIR, `${postToDelete.slug}.json`);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                postsIndex = postsIndex.filter(p => p.id !== deleteId);
                writeJsonFile(POSTS_INDEX, postsIndex);
            }
            break;

        case 'CATEGORY_CREATED':
        case 'CATEGORY_UPDATED':
            const category = body.category;
            if (!category || !category.id) break;
            categoriesIndex = categoriesIndex.filter(c => c.id !== category.id);
            categoriesIndex.push(category);
            writeJsonFile(CATEGORIES_INDEX, categoriesIndex);

            // If updated, reflect name changes in posts index
            if (event === 'CATEGORY_UPDATED') {
                postsIndex.forEach(p => {
                    if (p.category && p.category.id === category.id) {
                        p.category.name = category.name;
                    }
                });
                writeJsonFile(POSTS_INDEX, postsIndex);
            }
            break;

        case 'CATEGORY_DELETED':
            const catId = body.category?.id;
            const replaceTo = body.replace_to;

            categoriesIndex = categoriesIndex.filter(c => c.id !== catId);
            writeJsonFile(CATEGORIES_INDEX, categoriesIndex);

            // Update posts that belonged to this category
            postsIndex.forEach(p => {
                if (p.category && p.category.id === catId) {
                    if (replaceTo) {
                        p.category = replaceTo;
                    } else {
                        p.category = { id: 'uncategorized', name: 'Sem categoria' };
                    }
                }
            });
            writeJsonFile(POSTS_INDEX, postsIndex);
            break;
    }

    return res.status(200).json({ success: true, event });
};
