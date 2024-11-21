const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      width: {
        "75": "75rem"
      },
      screens: {
        "xl": "1200px"
      },
      gridTemplateColumns: {
        "marketplaceItem": "repeat(auto-fill, minmax(10rem, 1fr))",
        "questItem": "repeat(auto-fill, minmax(15rem, 1fr))",
        "inventoryItem": "repeat(auto-fill, minmax(8rem, 1fr))",
        "mainProject": "repeat(auto-fill, minmax(30rem, 1fr))"
      }
    },
  },
  darkMode: "class",
  plugins: [nextui()],
}