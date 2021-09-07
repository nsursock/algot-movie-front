module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      keyframes: {
        roll: {
          "0%, 50%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "25%": { transform: "translateX(20rem) rotate(385deg)" },
          "75%": { transform: "translateX(-20rem) rotate(-385deg)" },
        },
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        roll: "roll 10s linear infinite",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
