import { motion } from "framer-motion";
import React from "react";

export function AnimatedGroup({ children, className, variants, ...props }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  );
}
