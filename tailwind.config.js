/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,js}",
        "./new-index.html",
        "./index.html",
        "./blog/**/*.html"
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    navy: '#0f172a',
                    red: '#DC2626',
                    green: '#059669',
                    blue: '#1e40af',
                }
            },
            backgroundImage: {
                'gradient-red': 'linear-gradient(90deg, #DC2626 0%, #B91C1C 100%)',
            },
            fontFamily: {
                sans: ['Inter Tight', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            maxWidth: {
                'grid': '1280px',
            }
        },
    },
    plugins: [],
}
