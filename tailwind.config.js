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
        "primary": "#5b13ec",
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
