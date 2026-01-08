import { motion } from "framer-motion";
import React from "react";

export function TextEffect({ children, className, as: Component = "p", preset, speedSegment, delay = 0 }) {
  const variants = {
    hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  };
  
  return (
    <Component className={className}>
      <motion.span
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay }}
        variants={variants}
      >
        {children}
      </motion.span>
    </Component>
  );
}
