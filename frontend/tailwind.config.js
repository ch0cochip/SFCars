/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./node_modules/flowbite-react/**/*.js",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/tailwind-datepicker-react/dist/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        satoshi: ["Satoshi", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        "primary-orange": "#FF5722",
        "custom-orange": "#f89c3c",
        "disabled-orange": "#f87a1c",
        "custom-blue": "#6ED4D4",
        background: "#F2F1F0",
      },
      maxWidth: {
        "8xl": "105rem",
      },
      spacing: {
        95: "382px",
      },
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      textColor: ["placeholder"], // <-- add this line
    },
  },
  plugins: [require("flowbite/plugin")],
};
