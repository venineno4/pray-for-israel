import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dignified Unity Theme
        primary: {
          white: "#FFFFFF",
          deepBlue: "#0B2B5A",
          gold: "#D4AF37",
        },
        background: {
          light: "#F8FAFC",
          dark: "#0B2B5A",
        },
        text: {
          dark: "#1E293B",
          light: "#F8FAFC",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
