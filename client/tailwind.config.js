/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#C4B5FD",
          DEFAULT: "#6D28D9",
          600: "#6D28D9",
          700: "#4C1D95",
          800: "#3b0f6b",
          900: "#2c0a52",
        },
        surgical: {
          dark: "#0A2540",
          blue: "#3B82F6",
          teal: "#14B8A6",
          amber: "#F59E0B",
          red: "#EF4444",
          slate: "#64748B",
          bg: "#F1F5F9",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Lora", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "0.75rem",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 20px rgba(0,0,0,0.12)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
        200: "200ms",
      },
    },
  },
  plugins: [],
};
