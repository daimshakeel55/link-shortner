"use client";

import { motion, type Transition, type Variants } from "framer-motion";

/** Smooth ease-out curve — feels natural for entrances */
export const smoothEase = [0.22, 1, 0.36, 1] as const;

export const smoothTransition: Transition = {
  duration: 0.65,
  ease: smoothEase,
};

export const smoothSpring: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 22,
  mass: 0.9,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      ...smoothTransition,
    },
  }),
};

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      custom={delay}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.08, delayChildren: 0.05 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: smoothTransition,
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
