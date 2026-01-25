/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./*.js"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#5A2EB0",
        "background-light": "#f6f6f8",
        "background-dark": "#161022",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
