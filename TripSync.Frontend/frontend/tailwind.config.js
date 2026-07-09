/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Inter", "sans-serif"],
        display: ["Fraunces", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        burgundy: {
          50: "#fdf2f5",
          100: "#f8dde4",
          500: "#7A102A",
          600: "#7A102A",
          700: "#520B1B",
          900: "#2b050e",
        },
        navy: {
          700: "#5F5F5F",
          800: "#2d2d2d",
          900: "#171717",
          950: "#171717",
        },
        coral: {
          DEFAULT: "#7A102A",
          dark: "#520B1B",
        },
        sand: "#F5F5F5",
        teal: {
          DEFAULT: "#2dd4bf",
          dark: "#14b8a6",
        },
        gold: "#f4c95d",
      },
    },
  },
  plugins: [],
};