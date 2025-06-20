/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                secondary: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
                accent: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                    950: '#052e16',
                },
                purple: {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff',
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7',
                    600: '#9333ea',
                    700: '#7c3aed',
                    800: '#6b21a8',
                    900: '#581c87',
                    950: '#3b0764',
                },
            },
            fontFamily: {
                sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'mesh-pattern':
                    'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s ease-out',
                'fade-in-down': 'fadeInDown 0.8s ease-out',
                'fade-in': 'fadeIn 0.6s ease-out',
                'slide-in-left': 'slideInLeft 0.8s ease-out',
                'slide-in-right': 'slideInRight 0.8s ease-out',
                'bounce-slow': 'bounce 3s infinite',
                'pulse-slow': 'pulse 3s infinite',
                float: 'float 6s ease-in-out infinite',
                glow: 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                fadeInUp: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(40px)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)',
                    },
                },
                fadeInDown: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(-40px)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)',
                    },
                },
                fadeIn: {
                    '0%': {
                        opacity: '0',
                    },
                    '100%': {
                        opacity: '1',
                    },
                },
                slideInLeft: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateX(-50px)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateX(0)',
                    },
                },
                slideInRight: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateX(50px)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateX(0)',
                    },
                },
                float: {
                    '0%, 100%': {
                        transform: 'translateY(0px)',
                    },
                    '50%': {
                        transform: 'translateY(-20px)',
                    },
                },
                glow: {
                    '0%': {
                        boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)',
                    },
                    '100%': {
                        boxShadow:
                            '0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.4)',
                    },
                },
            },
            boxShadow: {
                glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'glass-lg': '0 25px 45px rgba(31, 38, 135, 0.25)',
                neon: '0 0 5px theme(colors.primary.400), 0 0 20px theme(colors.primary.400), 0 0 35px theme(colors.primary.400)',
                'neon-sm': '0 0 10px theme(colors.primary.400)',
            },
        },
    },
    plugins: [],
};
