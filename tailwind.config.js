/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#070f1d",
        surface: "#11213a",
        surface2: "#162946",
        line: "#1d3a5e",
        ink: "#eef4fb",
        mute: "#a5bad4",
        dim: "#6f86a6",
        gold: "#f8cb4d",
        goldDeep: "#e3a81b",
        goldSoft: "#ffe39a",
        lime: "#9ad141",
        limeDeep: "#6fa524",
        blue: "#3b9ae0",
        coral: "#f0775c",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Archivo", "Inter", "sans-serif"],
      },
      borderRadius: { xl2: "18px" },
      boxShadow: { float: "0 24px 60px -20px rgba(0,0,0,.6)" },
    },
  },
  plugins: [],
};
