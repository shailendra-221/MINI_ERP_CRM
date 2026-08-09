/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B1220",
          900: "#111A2C",
          800: "#182338",
          700: "#233250",
          600: "#334467",
          500: "#4B5D82",
        },
        brand: {
          50: "#EFF6FF",
          100: "#DCEBFF",
          200: "#B7D6FF",
          300: "#84B8FF",
          400: "#4E93F5",
          500: "#2C6FE0",
          600: "#1F55B8",
          700: "#1A4491",
          800: "#183A76",
          900: "#173261",
        },
        accent: {
          500: "#E08A2C",
          600: "#C4711A",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(11, 18, 32, 0.06), 0 1px 3px 0 rgba(11, 18, 32, 0.08)",
      },
    },
  },
  plugins: [],
};
