// // "use client";
// import Image from "next/image";
// import Link from "next/link";
// import React, { useState } from "react";
// import NavLink from "./NavLink.jsx";
// import { motion } from "framer-motion";

// //page
// const links = [
//   { url: "/", title: "Home" },
//   { url: "/about", title: "About" },
//   { url: "/portfolio", title: "Portfolio" },
//   { url: "/contact", title: "Contact" },
// ];
// //social Links
// const SocialLinks = [
//   { url: "https://github.com/mukesh2511", src: "/github.png" },
//   { url: "https://github.com/mukesh2511", src: "/dribbble.png" },
//   { url: "https://github.com/mukesh2511", src: "/instagram.png" },
//   { url: "https://github.com/mukesh2511", src: "/linkedin.png" },
//   { url: "https://github.com/mukesh2511", src: "/pinterest.png" },
//   { url: "https://github.com/mukesh2511", src: "/facebook.png" },
// ];

// const Navbar = () => {
//   const [openBar, setOpenBar] = useState(false);

//   const topVariants = {
//     closed: {
//       rotate: 0,
//     },
//     opened: {
//       rotate: 45,
//       backgroundColor: "rgb(255,255,255)",
//     },
//   };
//   const centerVariants = {
//     closed: {
//       opacity: 1,
//     },
//     opened: {
//       opacity: 0,
//     },
//   };

//   const bottomVariants = {
//     closed: {
//       rotate: 0,
//     },
//     opened: {
//       rotate: -45,
//       backgroundColor: "rgb(255,255,255)",
//     },
//   };
//   const listVariants = {
//     closed: {
//       x: "100vw",
//     },
//     opened: {
//       x: 0,
//       transition: {
//         when: "beforeChildren",
//         staggerChildren: 0.2,
//       },
//     },
//   };
//   const listItemVariants = {
//     closed: {
//       x: -10,
//       opacity: 0,
//     },
//     opened: {
//       x: 0,
//       opacity: 1,
//     },
//   };
//   return (
//     <div className="flex items-center h-full justify-between px-4 sm:px-8 md:px-12 lg:px-20 xl:px-48 text-lg">
//       {/* Links */}
//       <div className="left hidden md:flex gap-4 w-1/3">
//         {links.map((link) => (
//           <NavLink link={link} key={link.url} />
//         ))}
//       </div>

//       {/* logo */}
//       <div className="logo md:hidden lg:flex xl:justify-center xl:w-1/3 ">
//         <Link
//           href="/"
//           className="text-sm bg-black rounded-md p-1 font-semibold flex justify-center items-center"
//         >
//           <span className="text-white mr-1 ">Mukesh</span>
//           <span className="bg-white w-12 h-8 rounded-sm text-black flex justify-center items-center">
//             .dev
//           </span>
//         </Link>
//       </div>
//       {/* Social */}
//       <div className="right hidden md:flex gap-4 w-1/3">
//         {SocialLinks.map((link) => (
//           <Link href={link.url} key={link.src}>
//             <Image alt={"#"} src={link.src} width={24} height={24} />
//           </Link>
//         ))}
//       </div>

//       {/* Hamburger Menu */}
//       <div
//         className="hamburger md:hidden"
//         onClick={() => setOpenBar((prev) => !prev)}
//       >
//         <button className="w-10 h-8 flex flex-col justify-between z-50 relative">
//           <motion.div
//             variants={topVariants}
//             animate={openBar ? "opened" : "closed"}
//             className={`w-10 h-1 bg-black rounded origin-left`}
//           ></motion.div>
//           <motion.div
//             variants={centerVariants}
//             animate={openBar ? "opened" : "closed"}
//             className={`w-10 h-1 bg-black rounded `}
//           ></motion.div>
//           <motion.div
//             variants={bottomVariants}
//             animate={openBar ? "opened" : "closed"}
//             className={`w-10 h-1 bg-black rounded origin-left`}
//           ></motion.div>
//         </button>
//         {openBar && (
//           <motion.div
//             variants={listVariants}
//             initial="closed"
//             animate="opened"
//             className="absolute top-0 left-0 w-screen h-screen bg-black text-white flex flex-col justify-center items-center gap-8 text-4xl z-40"
//           >
//             {links.map((link) => (
//               <motion.div variants={listItemVariants} key={link.title}>
//                 <Link href={link.url}>{link.title}</Link>
//               </motion.div>
//             ))}
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Navbar;

"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import NavLink from "./NavLink.jsx";
import { motion } from "framer-motion";

//page
const links = [{ url: "/", title: "Algo Scheduler" }];
//social Links
const SocialLinks = [
  { url: "https://github.com/mukesh2511", src: "/github.png" },
  { url: "https://github.com/mukesh2511", src: "/instagram.png" },
  {
    url: "https://www.linkedin.com/in/mukesh-mourya-808a56257/",
    src: "/linkedin.png",
  },
];

const Navbar = () => {
  const [openBar, setOpenBar] = useState(false);

  const topVariants = {
    closed: {
      rotate: 0,
    },
    opened: {
      rotate: 45,
      backgroundColor: "rgb(255,255,255)",
    },
  };
  const centerVariants = {
    closed: {
      opacity: 1,
    },
    opened: {
      opacity: 0,
    },
  };

  const bottomVariants = {
    closed: {
      rotate: 0,
    },
    opened: {
      rotate: -45,
      backgroundColor: "rgb(255,255,255)",
    },
  };
  const listVariants = {
    closed: {
      x: "100vw",
    },
    opened: {
      x: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };
  const listItemVariants = {
    closed: {
      x: -10,
      opacity: 0,
    },
    opened: {
      x: 0,
      opacity: 1,
    },
  };
  return (
    <div className="flex items-center h-full justify-between px-4 sm:px-8 md:px-12 lg:px-20 xl:px-48 text-lg ">
      {/* Links */}
      <div className="left hidden md:flex gap-4 w-1/3 ">
        {links.map((link) => (
          <NavLink link={link} key={link.url} />
        ))}
      </div>

      {/* logo */}
      <div className="logo md:hidden lg:flex xl:justify-center xl:w-1/3 ">
        <Link
          href="/"
          className="text-sm bg-black rounded-md p-1 font-semibold flex justify-center items-center"
        >
          <span className="text-white mr-1 ">Mukesh</span>
          <span className="bg-white w-12 h-8 rounded-sm text-black flex justify-center items-center">
            .dev
          </span>
        </Link>
      </div>
      {/* Social */}
      <div className="right hidden md:flex gap-4 w-1/3">
        {SocialLinks.map((link) => (
          <Link href={link.url} key={link.src}>
            <Image alt={"#"} src={link.src} width={24} height={24} />
          </Link>
        ))}
      </div>

      {/* Hamburger Menu */}
      <div
        className="hamburger md:hidden"
        onClick={() => setOpenBar((prev) => !prev)}
      >
        <button className="w-10 h-8 flex flex-col justify-between z-50 relative">
          <motion.div
            variants={topVariants}
            animate={openBar ? "opened" : "closed"}
            className={`w-10 h-1 bg-black rounded origin-left`}
          ></motion.div>
          <motion.div
            variants={centerVariants}
            animate={openBar ? "opened" : "closed"}
            className={`w-10 h-1 bg-black rounded `}
          ></motion.div>
          <motion.div
            variants={bottomVariants}
            animate={openBar ? "opened" : "closed"}
            className={`w-10 h-1 bg-black rounded origin-left`}
          ></motion.div>
        </button>
        {openBar && (
          <motion.div
            variants={listVariants}
            initial="closed"
            animate="opened"
            className="absolute top-0 left-0 w-screen h-screen bg-black text-white flex flex-col justify-center items-center gap-8 text-4xl z-40"
          >
            {links.map((link) => (
              <motion.div variants={listItemVariants} key={link.title}>
                <Link href={link.url}>{link.title}</Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
