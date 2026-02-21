/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0F3D3E',        // Deep Teal - Brand primary
                secondary: '#3A6B6B',      // Sage - Secondary brand color
                accent: '#C9765D',         // Clay Rose - Highlights & CTAs
                success: '#3A6B6B',        // Sage - Success states
                background: '#F2F1FB',     // Mist White - App background
                card: '#ffffff',           // White - Card backgrounds

                // Semantic aliases
                'brand-teal': '#0F3D3E',
                'brand-sage': '#3A6B6B',
                'brand-rose': '#C9765D',
                'brand-mist': '#F2F1FB',

                'text-primary': '#0F3D3E', // Deep Teal
                'text-secondary': '#3A6B6B', // Sage
                'text-muted': '#6B7280',   // Neutral Gray
            },
            fontFamily: {
                title: ['Forum', 'serif'],
                quote: ['Caudex', 'serif'],
                sans: ['Plus Jakarta Sans', 'Lato', 'sans-serif'], // Prioritize Plus Jakarta
                body: ['Plus Jakarta Sans', 'Lato', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
