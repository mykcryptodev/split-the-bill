import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
    },
  },
  // daisyui: {
  //   themes: [
  //     {
  //       light: {
  //         ...require("daisyui/src/theming/themes").light,
  //       },
  //       primary: "rgb(79, 70, 229)",
  //     },
  //   ],
  // },
  plugins: [require('daisyui')],
} as Config;
