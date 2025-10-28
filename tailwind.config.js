/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "w-4",
    "h-4",
    "w-5",
    "h-5",
    "text-indigo-600",
    "flex-shrink-0",
    "md:hidden",
    "lg:flex",
    "xl:justify-center",
    "xl:w-1/3",
    "w-1/3",
    "bg-black",
    "bg-white",
    "rounded-md",
    "rounded-sm",
    "flex",
    "gap-4",
    "justify-center",
    "items-center",
    "p-1",
    "text-sm",
    "font-semibold",
    "text-white",
    "text-black",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
