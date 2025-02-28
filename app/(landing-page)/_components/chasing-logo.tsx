"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useSpring } from "motion/react";
import Image from "next/image";

interface ChasingLogoProps {
  imageUrl?: string;
  size?: number;
  chaseSpeed?: number;
  fleeSpeed?: number;
  fleeDistance?: number;
  shakeDuration?: number;
}

export const ChasingLogo = ({
  imageUrl = "https://2zzhd7n3m2.ufs.sh/f/Ev0wIwMYTjZfBtT1RWXf6NxYnpZJsSbPaoLhElXW7Irv4FgH",
  size = 80,
  chaseSpeed = 0.15,
  fleeSpeed = 0.5,
  fleeDistance = 200,
  shakeDuration = 300,
}: ChasingLogoProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFleeing, setIsFleeing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const shakeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  
  // Spring physics configuration
  const springConfig = {
    damping: 20,
    stiffness: 100,
    mass: 1,
  };
  
  // Create smooth spring animations for x and y
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);
  
  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Cleanup shake timer on unmount
  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) {
        clearTimeout(shakeTimerRef.current);
      }
    };
  }, []);
  
  // Update logo position based on mouse position
  useEffect(() => {
    if (!logoRef.current) return;
    
    const logoRect = logoRef.current.getBoundingClientRect();
    const logoX = logoRect.left + logoRect.width / 2;
    const logoY = logoRect.top + logoRect.height / 2;
    
    // Calculate distance between logo and cursor
    const dx = mousePosition.x - logoX;
    const dy = mousePosition.y - logoY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Determine state transitions
    if (distance < fleeDistance && !isShaking && !isFleeing) {
      // Start shaking when cursor gets close
      setIsShaking(true);
      
      // Set timer to transition from shaking to fleeing
      shakeTimerRef.current = setTimeout(() => {
        setIsShaking(false);
        setIsFleeing(true);
      }, shakeDuration);
    } else if (distance >= fleeDistance * 1.5 && (isFleeing || isShaking)) {
      // When cursor moves far enough away, stop both shaking and fleeing
      setIsFleeing(false);
      setIsShaking(false);
      
      // Clear shake timer if it's running
      if (shakeTimerRef.current) {
        clearTimeout(shakeTimerRef.current);
        shakeTimerRef.current = null;
      }
    }
    
    // Calculate target position
    let targetX: number, targetY: number;
    
    if (isFleeing) {
      // Flee from cursor (move in opposite direction)
      const fleeX = logoX - dx * fleeSpeed;
      const fleeY = logoY - dy * fleeSpeed;
      
      // Keep within viewport boundaries
      targetX = Math.max(size / 2, Math.min(window.innerWidth - size / 2, fleeX));
      targetY = Math.max(size / 2, Math.min(window.innerHeight - size / 2, fleeY));
    } else {
      // When shaking, stay in place with small jitter
      if (isShaking) {
        targetX = logoX + (Math.random() * 6 - 3);
        targetY = logoY + (Math.random() * 6 - 3);
      } else {
        // Normal chase behavior
        targetX = logoX + dx * chaseSpeed;
        targetY = logoY + dy * chaseSpeed;
      }
    }
    
    // Update spring animations
    x.set(targetX - size / 2);
    y.set(targetY - size / 2);
  }, [mousePosition, isFleeing, isShaking, chaseSpeed, fleeSpeed, fleeDistance, shakeDuration, size, x, y]);
  
  return (
    <motion.div
      ref={logoRef}
      className="fixed pointer-events-none z-50"
      style={{
        x,
        y,
        width: size,
        height: size,
      }}
    >
      <motion.div
        className="w-full h-full rounded-full overflow-hidden"
        animate={{
          scale: isFleeing ? 1.2 : isShaking ? [1, 1.1, 0.95, 1.05, 1] : 1,
          rotate: isFleeing ? [0, 15, -15, 0] : isShaking ? [0, -5, 5, -3, 3, 0] : 0,
        }}
        transition={{
          scale: { duration: isFleeing ? 0.3 : isShaking ? 0.5 : 0.3 },
          rotate: { 
            duration: isFleeing ? 0.5 : isShaking ? 0.4 : 0.3, 
            repeat: (isFleeing || isShaking) ? Infinity : 0,
            repeatType: "loop"
          }
        }}
      >
        <Image
          src={imageUrl}
          alt="Chasing Logo"
          width={size}
          height={size}
          className="w-full h-full object-cover rounded-full"
          priority
        />
      </motion.div>
    </motion.div>
  );
};
