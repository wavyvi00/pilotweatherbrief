/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                app: 'var(--bg-app)',
                surface: 'var(--bg-surface)',
                card: 'var(--bg-card)',
                primary: 'var(--accent-primary)',
                muted: 'var(--text-muted)',
            }
        },
    },
    plugins: [],
}
