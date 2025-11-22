export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
 theme: {
  extend: {
    animation: {
      float: "float 6s infinite ease-in-out",
    },
    keyframes: {
      float: {
        "0%, 100%": { transform: "translateY(0px)" },
        "50%": { transform: "translateY(-15px)" },
      },
    },
  },
},

  plugins: [],
};
