import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#002E5D",
        "byu-tan": "#C5A866",
        "byu-royal": "#0062B8",
        "bg-light": "#f5f7f8",
        "bg-dark": "#0a111a",
        "surface-dark": "#0d1622",
      },
      fontFamily: {
        display: ["Newsreader", "Georgia", "Cambria", '"Times New Roman"', "serif"],
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
