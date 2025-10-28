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
    // Arbitrary background colors
    "bg-[#111827]",
    "hover:bg-[#1f2937]",
    "bg-[#eef2ff]",
    "bg-[#ecfeff]",
    "bg-white/70",

    // Arbitrary text colors
    "text-[#111827]",
    "text-[#4b5563]",
    "text-[#3730a3]",
    "text-[#0369a1]",
    "text-[#6b7280]",
    "text-white",

    // Arbitrary border color
    "border-[#e5e7eb]",

    // Common utilities used (just in case purge removes due to conditional logic)
    "rounded-lg",
    "rounded-2xl",
    "shadow-sm",
    "hover:shadow-xl",
    "transition-all",
    "transition-colors",
    "duration-300",
    "flex",
    "flex-col",
    "flex-wrap",
    "items-center",
    "justify-between",
    "gap-1",
    "gap-1.5",
    "gap-2",
    "gap-2.5",
    "gap-3",
    "overflow-hidden",
    "p-4",
    "md:p-5",
    "text-xs",
    "text-sm",
    "text-lg",
    "md:text-sm",
    "md:text-xl",
    //navbar
    "flex",
    "items-center",
    "justify-between",
    "gap-4",
    "gap-8",
    "w-1/3",
    "h-full",
    "h-8",
    "h-1",
    "w-10",
    "z-50",
    "relative",
    "absolute",
    "top-0",
    "left-0",
    "w-screen",
    "h-screen",

    // Padding and margins
    "p-1",
    "px-4",
    "sm:px-8",
    "md:px-12",
    "lg:px-20",
    "xl:px-48",
    "mr-1",

    // Typography
    "text-lg",
    "text-sm",
    "text-4xl",
    "font-semibold",
    "text-white",
    "text-black",

    // Backgrounds
    "bg-black",
    "bg-white",

    // Borders and rounding
    "rounded",
    "rounded-md",
    "rounded-sm",

    // Visibility and responsive
    "hidden",
    "flex",
    "md:flex",
    "lg:flex",
    "xl:justify-center",
    "md:hidden",

    // Positioning
    "origin-left",

    // Animation/transition
    "transition-all",
    "duration-300",

    // Custom responsive breakpoints
    "sm:px-8",
    "md:px-12",
    "lg:px-20",
    "xl:px-48",

    // Framer Motion + Menu related
    "hamburger",
    "left",
    "right",
    "logo",
    "bg-black",
    "text-white",
    "flex-col",
    "justify-center",
    "items-center",
    "z-40",
    "z-50",
    "relative",

    // Utility for object-fit (if used in images)
    "object-contain",
    "object-cover",

    // Conditional classes used dynamically in NavLink (for active links)
    "font-semibold",
    "text-[#283953]",
    "gap-2",
    "p-1",
    "rounded",

    ///card
    "px-2",
    "py-0.5 ",
    "text-[11px] ",
    "font-medium",
    "inline-flex",
    "items-center",
    "gap-1",
    "rounded-full",
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
