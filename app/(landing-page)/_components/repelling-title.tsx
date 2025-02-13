'use client';

import { motion, useMotionValue, useSpring, MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface RepellingLetterProps {
  char: string;
  index: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  containerRef: React.RefObject<HTMLDivElement>;
  intensity: number;
  springConfig: {
    stiffness: number;
    damping: number;
  };
}

function RepellingLetter({ char, index, mouseX, mouseY, containerRef, intensity, springConfig }: RepellingLetterProps) {
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    return mouseX.on("change", (latestX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const charRect = containerRef.current.children[index].getBoundingClientRect();
      const charX = charRect.left - rect.left + charRect.width / 2;
      const charY = charRect.top - rect.top + charRect.height / 2;
      const mousePos = { x: latestX, y: mouseY.get() };
      const distance = Math.sqrt(
        Math.pow(mousePos.x - charX, 2) + Math.pow(mousePos.y - charY, 2)
      );
      const maxDistance = intensity;
      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        const angle = Math.atan2(charY - mousePos.y, charX - mousePos.x);
        x.set(Math.cos(angle) * force * 20);
        y.set(Math.sin(angle) * force * 20);
      } else {
        x.set(0);
        y.set(0);
      }
    });
  }, [x, y, mouseX, mouseY, containerRef, index, intensity]);

  return (
    <motion.span
      key={index}
      style={{ x, y }}
      className="inline-block"
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

interface RepellingTextProps {
  text: string;
  className?: string;
  intensity?: number;
  springConfig?: {
    stiffness: number;
    damping: number;
  };
  initialAnimation?: {
    y?: number;
    opacity?: number;
  };
}

export function RepellingText({
  text,
  className = "",
  intensity = 100,
  springConfig = { stiffness: 150, damping: 15 },
  initialAnimation = { y: -50, opacity: 0 }
}: RepellingTextProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative",
        "before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-gradient-to-r before:from-[hsl(var(--color-1))] before:via-[hsl(var(--color-2))] before:to-[hsl(var(--color-3))] before:opacity-20 before:blur-xl before:transition-opacity before:duration-500 hover:before:opacity-30",
        className
      )}
      initial={{ opacity: initialAnimation.opacity, y: initialAnimation.y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {text.split("").map((char, i) => (
        <RepellingLetter
          key={i}
          char={char}
          index={i}
          mouseX={mouseX}
          mouseY={mouseY}
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
          intensity={intensity}
          springConfig={springConfig}
        />
      ))}
    </motion.div>
  );
} 