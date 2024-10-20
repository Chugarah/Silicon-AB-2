import type { Config } from "tailwindcss";

const config: Config = {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue,scss}"],
 theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        manrope: ["Manrope", "sans-serif"],
      },
      fontWeight: {
        ExtraLight: "200",
        Light: "300",
        Regular: "400",
        Medium: "500",
        SemiBold: "600",
        Bold: "700",
        ExtraBold: "800",
        ExtremeBold: "900",
      },
      fontSize: {
        // Text sizes
        "t-xs": "0.75rem", // 12px
        "t-s": "0.875rem", // 14px
        "t-m": "1rem", // 16px
        "t-l": "1.125rem", // 18px
        "t-xl": "1.25rem", // 20px
        "t-lt": "1.5rem", // 24px

        // Display headings
        "d-1": "5rem", // 80px
        "d-2": "4.5rem", // 72px
        "d-3": "4rem", // 64px
        "d-4": "3.5rem", // 56px
        "d-5": "3rem", // 48px
        "d-6": "2.625rem", // 42px
        "d-7": "2.76875rem", // 44.3px
        "d-8": "2.13125rem", // 34.1px

        // Headings
        "h-1": "2.5rem", // 40px
        "h-2": "2rem", // 32px
        "h-3": "1.75rem", // 28px
        "h-4": "1.5rem", // 24px
        "h-5": "1.25rem", // 20px
        "h-6": "1rem", // 16px
      },
      colors: {
        grey: {
          300: "#e2e5f1",
          600: "#9397ad",
          700: "#565973",
          900: "#0b0f19",
        },
      },
    },
  },
	plugins: [],
};

export default config;
