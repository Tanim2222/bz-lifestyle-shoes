import { motion } from "motion/react";
import type { ReactNode } from "react";

// Scroll-reveal wrapper shared by every landing section. Uses whileInView
// (not initial+animate on mount) so it can't get stuck at opacity:0 —
// see the project-wide Framer Motion mount-animation fix.
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
