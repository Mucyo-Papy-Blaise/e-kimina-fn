import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: "#000000",
      white: "#ffffff",
      
      bg: "#ffffff",
      surface: "#f6fff9",
      "surface-2": "#ecfff3",
      text: "#0f172a",
      "text-muted": "#64748b",
      primary: "#00e676",
      "primary-soft": "rgba(0, 230, 118, 0.12)",
      accent: "#ffc123",
      "accent-soft": "rgba(255, 193, 35, 0.15)",
      border: "rgba(0, 0, 0, 0.08)",
      success: "#00e676",
      error: "#ff5a7d",
    },
    borderRadius: {
      none: "0",
      sm: "0.75rem",
      md: "1.25rem",
      lg: "2rem",
      full: "9999px",
    },
    boxShadow: {
      none: "0 0 #0000",
      md: "0 18px 50px rgba(0, 0, 0, 0.08)",
    },
    fontFamily: {
      playfair: ["var(--font-playfair)", "Georgia", "Times New Roman", "serif"],
    },
  },
  plugins: [],
};

export default config;
