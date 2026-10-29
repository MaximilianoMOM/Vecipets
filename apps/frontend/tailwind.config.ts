/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                vecipets: {
                    dark: '#020617',
                    card: '#0f172a',
                    border: '#1e293b',
                    accent: '#5E7BC4',
                },
                turbo: {
                    amber: '#f59e0b',
                    orange: '#f97316',
                    emerald: '#10b981',
                },
            },
            backgroundImage: {
                'turbo-gradient': 'linear-gradient(to right, #f59e0b, #f97316)',
            },
            keyframes: {
                'glow-pulse': {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)' },
                    '50%': { opacity: '0.8', boxShadow: '0 0 20px rgba(245, 158, 11, 0.6)' },
                },
                'bounce-soft': {
                    '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' },
                    '50%': { transform: 'none', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' },
                },
            },
            animation: {
                'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-soft': 'bounce-soft 1s ease-in-out infinite',
            },
        },
    },
    plugins: [],
};