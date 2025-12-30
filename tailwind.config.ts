// // tailwind.config.ts
// import type { Config } from "tailwindcss";

// const config: Config = {
//   darkMode: 'class', // Enable class-based dark mode
//   content: [
//     "./app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };

// export default config;

// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: {
        // Scale down all spacing by 0.75
        '0': '0',
        'px': '1px',
        '0.5': '0.09375rem',  // 1.5px
        '1': '0.1875rem',     // 3px
        '1.5': '0.28125rem',  // 4.5px
        '2': '0.375rem',      // 6px
        '2.5': '0.46875rem',  // 7.5px
        '3': '0.5625rem',     // 9px
        '3.5': '0.65625rem',  // 10.5px
        '4': '0.75rem',       // 12px
        '5': '0.9375rem',     // 15px
        '6': '1.125rem',      // 18px
        '7': '1.3125rem',     // 21px
        '8': '1.5rem',        // 24px
        '9': '1.6875rem',     // 27px
        '10': '1.875rem',     // 30px
        '11': '2.0625rem',    // 33px
        '12': '2.25rem',      // 36px
        '14': '2.625rem',     // 42px
        '16': '3rem',         // 48px
        '20': '3.75rem',      // 60px
        '24': '4.5rem',       // 72px
        '28': '5.25rem',      // 84px
        '32': '6rem',         // 96px
        '36': '6.75rem',      // 108px
        '40': '7.5rem',       // 120px
        '44': '8.25rem',      // 132px
        '48': '9rem',         // 144px
        '52': '9.75rem',      // 156px
        '56': '10.5rem',      // 168px
        '60': '11.25rem',     // 180px
        '64': '12rem',        // 192px
        '72': '13.5rem',      // 216px
        '80': '15rem',        // 240px
        '96': '18rem',        // 288px
      },
      fontSize: {
        // Scale down font sizes by 0.75
        'xs': ['0.5625rem', { lineHeight: '0.75rem' }],      // 9px
        'sm': ['0.65625rem', { lineHeight: '0.9375rem' }],   // 10.5px
        'base': ['0.75rem', { lineHeight: '1.125rem' }],     // 12px
        'lg': ['0.84375rem', { lineHeight: '1.3125rem' }],   // 13.5px
        'xl': ['0.9375rem', { lineHeight: '1.3125rem' }],    // 15px
        '2xl': ['1.125rem', { lineHeight: '1.5rem' }],       // 18px
        '3xl': ['1.40625rem', { lineHeight: '1.875rem' }],   // 22.5px
        '4xl': ['1.6875rem', { lineHeight: '2.25rem' }],     // 27px
        '5xl': ['2.25rem', { lineHeight: '1' }],             // 36px
        '6xl': ['2.8125rem', { lineHeight: '1' }],           // 45px
        '7xl': ['3.5625rem', { lineHeight: '1' }],           // 57px
        '8xl': ['4.5rem', { lineHeight: '1' }],              // 72px
        '9xl': ['6rem', { lineHeight: '1' }],                // 96px
      },
    },
  },
  plugins: [],
};

export default config;