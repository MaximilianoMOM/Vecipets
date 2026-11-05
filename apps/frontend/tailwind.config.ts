import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Paleta principal orientada a tonos claros y limpios
                primary: {
                    DEFAULT: '#2563EB', // Azul moderno y confiable
                    hover: '#1D4ED8',
                },
                brand: {
                    light: '#F8FAFC',  // Fondo gris muy claro / blanco humo
                    card: '#FFFFFF',   // Fondo de tarjetas blanco puro
                    border: '#E2E8F0', // Bordes sutiles y limpios
                    text: '#0F172A',   // Texto principal oscuro para alta legibilidad
                    muted: '#64748B',  // Texto secundario gris
                },
                // Tonos de acento para alertas y llamadas a la acción
                accent: {
                    amber: '#F59E0B',  // Ámbar para alertas turbo / destacado
                    orange: '#F97316', // Naranja cálido
                    red: '#EF4444',    // Rojo para emergencias de mascotas perdidas
                },
            },
        },
    },
    plugins: [],
};

export default config;