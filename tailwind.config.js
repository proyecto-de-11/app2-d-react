/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#FF6347', // Tomato
        secondary: '#4682B4', // SteelBlue
        accent: '#32CD32', // LimeGreen
        background: '#F5F5F5', // WhiteSmoke
        text: '#333333', // DarkGray
      },
    },
  },
  plugins: [],
}