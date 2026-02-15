/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ui: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          accent: "var(--accent)",
          text: "var(--text)"
        }
      }
    }
  },
  plugins: []
};
