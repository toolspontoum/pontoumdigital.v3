import { defineConfig } from 'vite';
import htmlInject from 'vite-plugin-html-inject';
import { resolve } from 'path';

export default defineConfig({
    plugins: [htmlInject()],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                privacy: resolve(__dirname, 'privacy.html'),
                cookies: resolve(__dirname, 'cookies.html'),
                blog: resolve(__dirname, 'blog/index.html'),
                blogPost: resolve(__dirname, 'blog/post.html'),
                blogSearch: resolve(__dirname, 'blog/search.html'),
            },
        },
    },
    server: {
        port: 5173,
        open: true
    }
});
