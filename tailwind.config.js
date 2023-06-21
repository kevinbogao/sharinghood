/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  important: true, // https://mui.com/material-ui/guides/interoperability/#setup
  theme: {
    extend: {},
    screens: {
      xl: "1070px",
    },
  },
  corePlugins: {
    preflight: false, // https://mui.com/material-ui/guides/interoperability/#setup
  },
  plugins: [],
};
