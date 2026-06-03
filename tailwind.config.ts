import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: "#2563EB",
        bluebright: "#3B82F6",
        bluedark: "#1D4ED8",
        ink: "#0B1220",
        slatey: "#475569",
        mist: "#64748B",
        line: "#E5E9F0",
        cloud: "#F6F8FB",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(2,12,27,.10)",
        card: "0 4px 24px -8px rgba(2,12,27,.10)",
      },
    },
  },
  plugins: [],
};
export default config;
