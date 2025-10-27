"use client";

import React from "react";
import { motion } from "framer-motion";

const page = () => {
  const variants = {
    variants1: {
      x: 400,
      y: 300,
      opacity: 0.5,
      transition: {
        duration: 3,
      },
    },
    variants2: {
      x: 100,
      y: -300,
      rotation: 90,
    },
  };
  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        className="w-96 h-96 bg-red-500 rounded "
        initial={{ x: -100 }}
        variants={variants}
        animate="variants2"
      ></motion.div>
    </div>
  );
};

export default page;
