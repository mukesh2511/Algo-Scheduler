"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { redirect } from "next/navigation";

// const Homepage = () => {

//   return (
//     <motion.div
//       className="h-full"
//       initial={{ y: "-200vh" }}
//       animate={{ y: "0%" }}
//       transition={{ duration: 1 }}
//     >
//       <div className="h-full overflow-scroll flex flex-col lg:flex-row  px-4 sm:px-8 md:px-12 lg:px-20 xl:px-48 ">
//         <div className="h-1/2 lg:h-full lg:w-1/2 relative">
//           <Image src={"/hero.png"} alt="" fill className="object-contain" />
//         </div>
//         <div className="h-1/2 lg:h-full lg:w-1/2 flex flex-col  gap-8 items-center md:justify-center">
//           {/* //title */}
//           <h1 className="text-3xl md:text-4xl lg:5xl font-bold">
//             Crafting Digital Experiences: Designing Tommorow.
//           </h1>
//           {/* //desc */}
//           <p className="md:text-md">
//             Embarking on a Journey of Continuous Growth: Leveraging the Power of
//             MERN Stack to Innovate and Evolve in Web Development. Passionate
//             about learning, adapting, and pushing boundaries to create impactful
//             digital solutions.
//           </p>
//           {/* //buttons */}
//           <div className="w-full flex gap-4">
//             <Link href={"/portfolio"}>
//               <button className="p-4 rounded-lg ring-1 ring-black bg-black text-white ">
//                 View My Work
//               </button>
//             </Link>
//             <Link href={"/contact"}>
//               <button className="p-4 rounded-lg ring-1 ring-black bg-white text-black ">
//                 Contact Me
//               </button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };
// import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/schedulers");
}

// export default Homepage;
