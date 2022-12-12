/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        redLineAnim: {
          "0%": { "background-position": "100% 0%" },
          "100%": { "background-position": "-100% 0%" },
        },
      },
      animation: {
        redLineAnim: "redLineAnim 10s infinite linear",
      },
    },
  },
  plugins: [],
};
