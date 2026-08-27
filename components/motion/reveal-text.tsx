"use client";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function RevealText({
  text,
  className = "",
  delay = 0,
  as = "h1",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2";
}) {
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const isReduced = mounted && Boolean(reduced);

  const shared = {
    className,
    initial: isReduced ? false : { opacity: 0, y: 12, filter: "blur(3px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: {
      duration: 0.52,
      delay,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  };

  return as === "h2" ? (
    <motion.h2 {...shared}>{text}</motion.h2>
  ) : (
    <motion.h1 {...shared}>{text}</motion.h1>
  );
}
