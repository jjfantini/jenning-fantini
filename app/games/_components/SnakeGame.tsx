"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';

// Types
type Position = {
  x: number;
  y: number;
};

// For smoother animation, use floating point positions internally
type RenderPosition = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

// Constants
const GRID_SIZE = 20; // Game logic grid size
const RENDER_SCALE = 3; // Internal render scale factor (higher = smoother)
const CELL_SIZE_DESKTOP = 20; // px
const CELL_SIZE_MOBILE = 16; // px
const SPEEDS = {
  EASY: 150,
  MEDIUM: 120,
  HARD: 80,
};

const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const KEYCODES = {
  UP: ['ArrowUp', 'KeyW'],
  DOWN: ['ArrowDown', 'KeyS'],
  LEFT: ['ArrowLeft', 'KeyA'],
  RIGHT: ['ArrowRight', 'KeyD'],
  PAUSE: ['Space', 'KeyP'],
  RESTART: ['KeyR', 'Enter'],
};

// Colors for light and dark themes
const COLORS = {
  light: {
    background: '#f5f5f5',
    grid: '#e5e5e5',
    snakeHead: '#10b981',
    snakeBody: '#34d399',
    food: '#f43f5e',
    border: '#d4d4d4',
  },
  dark: {
    background: '#171717',
    grid: '#262626',
    snakeHead: '#34d399',
    snakeBody: '#10b981',
    food: '#fb7185',
    border: '#404040',
  },
};

export default function SnakeGame() {
  // Theme
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const colors = isDarkMode ? COLORS.dark : COLORS.light;

  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const swipeStartRef = useRef<Position | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  const deviceOrientationRef = useRef<{ beta: number | null; gamma: number | null }>({
    beta: null,
    gamma: null,
  });
  
  // Game State
  const [gameState, setGameState] = useState<GameState>('START');
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [cellSize, setCellSize] = useState<number>(CELL_SIZE_DESKTOP);
  const [useTiltControls, setUseTiltControls] = useState<boolean>(false);
  
  // Animation state for smooth transitions
  const [prevSnake, setPrevSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [animationProgress, setAnimationProgress] = useState<number>(1);
  const lastMoveTimeRef = useRef<number>(0); // Track last movement time
  const motionTrailRef = useRef<RenderPosition[]>([]); // Store recent positions for motion trail
  
  // Initialize game
  useEffect(() => {
    // Get high score from localStorage
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(Number(savedHighScore));
    }
    
    // Set cell size based on screen width
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCellSize(CELL_SIZE_MOBILE);
      } else {
        setCellSize(CELL_SIZE_DESKTOP);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    canvas.width = GRID_SIZE * cellSize;
    canvas.height = GRID_SIZE * cellSize;
    
    // Initial render
    drawGame(1);
    
  }, [cellSize]);
  
  // Generate random food position
  const generateFood = useCallback((): Position => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    
    // Make sure food doesn't appear on snake
    const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    if (isOnSnake) {
      return generateFood();
    }
    
    return newFood;
  }, [snake]);
  
  // Check for collisions
  const checkCollision = useCallback((position: Position, ignoreHead = false): boolean => {
    // Check wall collision
    if (
      position.x < 0 ||
      position.x >= GRID_SIZE ||
      position.y < 0 ||
      position.y >= GRID_SIZE
    ) {
      return true;
    }
    
    // Check snake collision
    const snakeBody = ignoreHead ? snake.slice(1) : snake;
    return snakeBody.some(segment => segment.x === position.x && segment.y === position.y);
  }, [snake]);
  
  // Check for near misses (close calls)
  const checkCloseCalls = useCallback((head: Position): void => {
    const adjacentPositions = [
      { x: head.x + 1, y: head.y },
      { x: head.x - 1, y: head.y },
      { x: head.x, y: head.y + 1 },
      { x: head.x, y: head.y - 1 },
    ];
    
    let dangerCount = 0;
    adjacentPositions.forEach(pos => {
      // Check wall proximity
      if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) {
        dangerCount++;
      }
      // Check snake body proximity (excluding head)
      else if (snake.slice(1).some(segment => segment.x === pos.x && segment.y === pos.y)) {
        dangerCount++;
      }
    });
  }, [snake]);
  
  // Create a smooth curved path for the snake
  const generateSmoothPath = useCallback((points: RenderPosition[]): RenderPosition[] => {
    if (points.length < 3) return points;
    
    const smoothedPath: RenderPosition[] = [];
    
    // Include the first point as is
    smoothedPath.push(points[0]);
    
    // For each segment (except first and last), compute bezier curve
    for (let i = 1; i < points.length - 1; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      const nextPoint = points[i + 1];
      
      // Calculate control points for the curve
      // Using a simple catmull-rom spline approach
      const tensionFactor = 0.3; // Controls how tight the curve is
      
      // Calculate curve points (add multiple points between grid cells)
      const steps = 5; // Number of subdivisions between points
      for (let t = 0; t < 1; t += 1/steps) {
        // Hermite interpolation formula
        const h1 = 2*t*t*t - 3*t*t + 1;
        const h2 = -2*t*t*t + 3*t*t;
        const h3 = t*t*t - 2*t*t + t;
        const h4 = t*t*t - t*t;
        
        // Catmull-Rom tangents
        const tangent1X = tensionFactor * (nextPoint.x - prevPoint.x);
        const tangent1Y = tensionFactor * (nextPoint.y - prevPoint.y);
        const tangent2X = tensionFactor * (nextPoint.x - prevPoint.x);
        const tangent2Y = tensionFactor * (nextPoint.y - prevPoint.y);
        
        // Calculate intermediate point
        const x = h1 * currentPoint.x + h2 * nextPoint.x + h3 * tangent1X + h4 * tangent2X;
        const y = h1 * currentPoint.y + h2 * nextPoint.y + h3 * tangent1Y + h4 * tangent2Y;
        
        smoothedPath.push({ x, y });
      }
    }
    
    // Include the last point
    smoothedPath.push(points[points.length - 1]);
    
    return smoothedPath;
  }, []);
  
  // Easing function for smooth animation
  const easeInOutQuad = (t: number): number => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  };
  
  // Even smoother easing function
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Move snake
  const moveSnake = useCallback((): void => {
    setSnake(prevSnake => {
      // Store previous state for animation
      setPrevSnake([...prevSnake]);
      setAnimationProgress(0);
      lastMoveTimeRef.current = performance.now();
      
      const head = { ...prevSnake[0] };
      const currentDirection = DIRECTIONS[direction];
      
      // Calculate new head position
      const newHead = {
        x: head.x + currentDirection.x,
        y: head.y + currentDirection.y,
      };
      
      // Check for collision
      if (checkCollision(newHead)) {
        setGameState('GAME_OVER');
        
        // Update high score if needed
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('snakeHighScore', score.toString());
        }
        
        return prevSnake;
      }
      
      // Check for close calls
      checkCloseCalls(newHead);
      
      // Check for food collision
      const hasEatenFood = newHead.x === food.x && newHead.y === food.y;
      
      let newSnake;
      if (hasEatenFood) {
        // Snake grows
        newSnake = [newHead, ...prevSnake];
        setFood(generateFood());
        setScore(prevScore => prevScore + 1);
      } else {
        // Snake moves
        newSnake = [newHead, ...prevSnake.slice(0, -1)];
      }
      
      // Update motion trail for smooth rendering
      const headRenderPos = {
        x: newHead.x,
        y: newHead.y
      };
      motionTrailRef.current = [headRenderPos, ...motionTrailRef.current.slice(0, 15)]; // Keep last 16 positions
      
      return newSnake;
    });
    
    // Update direction for next move
    setDirection(nextDirection);
  }, [checkCollision, checkCloseCalls, direction, food, generateFood, nextDirection, score, highScore]);
  
  // Draw game on canvas
  const drawGame = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= canvas.width; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw food with subtle pulse animation
    const foodX = food.x * cellSize + cellSize / 2;
    const foodY = food.y * cellSize + cellSize / 2;
    const pulseScale = 0.1;
    const pulseSpeed = 0.002;
    const pulseAmount = Math.sin(Date.now() * pulseSpeed) * pulseScale + 1;
    const foodRadius = cellSize / 2 * 0.8 * pulseAmount;
    
    // Add glow effect to food
    const gradient = ctx.createRadialGradient(
      foodX, foodY, 0,
      foodX, foodY, foodRadius * 1.5
    );
    gradient.addColorStop(0, colors.food);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    // Draw subtle food glow
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(foodX, foodY, foodRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw food
    ctx.fillStyle = colors.food;
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Apply easing to progress for more natural movement
    const easedProgress = easeInOutCubic(progress);
    
    // Interpolate snake position for smooth movement
    const interpolatedSnake: RenderPosition[] = [];
    
    // If we have previous snake positions, interpolate between them
    if (prevSnake.length > 0 && gameState === 'PLAYING') {
      // Ensure prevSnake and snake have the same length
      const minLength = Math.min(snake.length, prevSnake.length);
      
      for (let i = 0; i < minLength; i++) {
        // Apply easing to the interpolation
        interpolatedSnake.push({
          x: prevSnake[i].x + (snake[i].x - prevSnake[i].x) * easedProgress,
          y: prevSnake[i].y + (snake[i].y - prevSnake[i].y) * easedProgress,
        });
      }
      
      // If snake grew (ate food), add remaining segments
      if (snake.length > prevSnake.length) {
        interpolatedSnake.push(...snake.slice(prevSnake.length).map(pos => ({ 
          x: pos.x, 
          y: pos.y 
        })));
      }
    } else {
      // No previous state or not playing, just use current snake
      interpolatedSnake.push(...snake.map(pos => ({ x: pos.x, y: pos.y })));
    }
    
    // Generate smooth path with Bezier curves
    const smoothPath = generateSmoothPath(interpolatedSnake);
    
    // Draw snake body as a continuous path
    if (smoothPath.length > 1) {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      // Draw the main snake body
      ctx.beginPath();
      ctx.moveTo(
        smoothPath[0].x * cellSize + cellSize / 2, 
        smoothPath[0].y * cellSize + cellSize / 2
      );
      
      for (let i = 1; i < smoothPath.length; i++) {
        const segment = smoothPath[i];
        ctx.lineTo(
          segment.x * cellSize + cellSize / 2,
          segment.y * cellSize + cellSize / 2
        );
      }
      
      // Set body style
      ctx.strokeStyle = colors.snakeBody;
      ctx.lineWidth = cellSize * 0.7; // Slightly thinner than cell width
      ctx.stroke();
      
      // Add motion blur/trail effect
      if (motionTrailRef.current.length > 1 && gameState === 'PLAYING') {
        // Draw main snake body segments as circles for smoother appearance
        for (let i = 1; i < interpolatedSnake.length; i++) {
          const segment = interpolatedSnake[i];
          ctx.fillStyle = colors.snakeBody;
          
          // Calculate distance from head for size variation
          const distFromHead = i / interpolatedSnake.length;
          const sizeVariation = 1 - distFromHead * 0.2; // Slightly taper towards tail
          
          // Segment size
          const segmentRadius = cellSize * 0.4 * sizeVariation;
          
          // Draw segment
          ctx.beginPath();
          ctx.arc(
            segment.x * cellSize + cellSize / 2,
            segment.y * cellSize + cellSize / 2,
            segmentRadius,
            0, Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
    
    // Draw snake head
    if (interpolatedSnake.length > 0) {
      const head = interpolatedSnake[0];
      
      // Draw head
      const headX = head.x * cellSize + cellSize / 2;
      const headY = head.y * cellSize + cellSize / 2;
      const headRadius = cellSize / 2 * 0.9;
      
      // Draw head glow effect
      const headGlow = ctx.createRadialGradient(
        headX, headY, 0,
        headX, headY, headRadius * 1.3
      );
      headGlow.addColorStop(0, colors.snakeHead);
      headGlow.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.beginPath();
      ctx.fillStyle = headGlow;
      ctx.arc(headX, headY, headRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw main head
      ctx.beginPath();
      ctx.fillStyle = colors.snakeHead;
      ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add eyes to the snake head based on direction
      const eyeRadius = cellSize * 0.15;
      const eyeOffset = cellSize * 0.2;
      ctx.fillStyle = '#FFFFFF';
      
      let eyeX1, eyeY1, eyeX2, eyeY2;
      
      // Position eyes based on direction
      if (direction === 'UP') {
        eyeX1 = headX - eyeOffset; eyeY1 = headY - eyeOffset;
        eyeX2 = headX + eyeOffset; eyeY2 = headY - eyeOffset;
      } else if (direction === 'DOWN') {
        eyeX1 = headX - eyeOffset; eyeY1 = headY + eyeOffset;
        eyeX2 = headX + eyeOffset; eyeY2 = headY + eyeOffset;
      } else if (direction === 'LEFT') {
        eyeX1 = headX - eyeOffset; eyeY1 = headY - eyeOffset;
        eyeX2 = headX - eyeOffset; eyeY2 = headY + eyeOffset;
      } else { // RIGHT
        eyeX1 = headX + eyeOffset; eyeY1 = headY - eyeOffset;
        eyeX2 = headX + eyeOffset; eyeY2 = headY + eyeOffset;
      }
      
      // Draw eyes
      ctx.beginPath();
      ctx.arc(eyeX1, eyeY1, eyeRadius, 0, Math.PI * 2);
      ctx.arc(eyeX2, eyeY2, eyeRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw pupils
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(eyeX1, eyeY1, eyeRadius * 0.5, 0, Math.PI * 2);
      ctx.arc(eyeX2, eyeY2, eyeRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw border
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }, [snake, prevSnake, food, cellSize, colors, direction, gameState, generateSmoothPath]);
  
  // Animation frame loop
  const animationFrame = useCallback((timestamp: number) => {
    if (!lastRenderTimeRef.current) {
      lastRenderTimeRef.current = timestamp;
    }
    
    // Calculate delta time and update animation progress
    if (gameState === 'PLAYING' && lastMoveTimeRef.current > 0) {
      const timeSinceLastMove = timestamp - lastMoveTimeRef.current;
      const stepDuration = SPEEDS[difficulty];
      
      // Calculate progress based on time elapsed since last move
      // but only if we're not already at the target position
      if (animationProgress < 1) {
        const newProgress = Math.min(timeSinceLastMove / stepDuration, 1);
        setAnimationProgress(newProgress);
      }
    }
    
    // Draw at the current animation frame
    drawGame(animationProgress);
    
    // Schedule next frame at high refresh rate
    gameLoopRef.current = requestAnimationFrame(animationFrame);
    lastRenderTimeRef.current = timestamp;
  }, [animationProgress, difficulty, drawGame, gameState]);
  
  // Game loop with timing optimizations
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    
    // Start animation loop (this runs continuously for smooth animation)
    if (!gameLoopRef.current) {
      gameLoopRef.current = requestAnimationFrame(animationFrame);
    }
    
    // Set up movement interval
    const moveInterval = setInterval(() => {
      moveSnake();
    }, SPEEDS[difficulty]);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      clearInterval(moveInterval);
    };
  }, [gameState, difficulty, moveSnake, animationFrame]);
  
  // Redraw on theme change
  useEffect(() => {
    drawGame(animationProgress);
  }, [isDarkMode, drawGame, animationProgress]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (KEYCODES.UP.includes(e.code) && direction !== 'DOWN') {
        setNextDirection('UP');
      } else if (KEYCODES.DOWN.includes(e.code) && direction !== 'UP') {
        setNextDirection('DOWN');
      } else if (KEYCODES.LEFT.includes(e.code) && direction !== 'RIGHT') {
        setNextDirection('LEFT');
      } else if (KEYCODES.RIGHT.includes(e.code) && direction !== 'LEFT') {
        setNextDirection('RIGHT');
      } else if (KEYCODES.PAUSE.includes(e.code)) {
        setGameState(prev => (prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev));
      } else if (KEYCODES.RESTART.includes(e.code) && gameState === 'GAME_OVER') {
        restartGame();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction]);
  
  // Touch/swipe controls
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!swipeStartRef.current || gameState !== 'PLAYING') return;
      
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      
      const diffX = currentX - swipeStartRef.current.x;
      const diffY = currentY - swipeStartRef.current.y;
      
      // Require a minimum swipe distance
      if (Math.abs(diffX) < 20 && Math.abs(diffY) < 20) return;
      
      // Determine swipe direction
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0 && direction !== 'LEFT') {
          setNextDirection('RIGHT');
        } else if (diffX < 0 && direction !== 'RIGHT') {
          setNextDirection('LEFT');
        }
      } else {
        // Vertical swipe
        if (diffY > 0 && direction !== 'UP') {
          setNextDirection('DOWN');
        } else if (diffY < 0 && direction !== 'DOWN') {
          setNextDirection('UP');
        }
      }
      
      // Reset swipe start position
      swipeStartRef.current = null;
    };
    
    const gameAreaElement = gameAreaRef.current;
    if (gameAreaElement) {
      gameAreaElement.addEventListener('touchstart', handleTouchStart);
      gameAreaElement.addEventListener('touchmove', handleTouchMove);
    }
    
    return () => {
      if (gameAreaElement) {
        gameAreaElement.removeEventListener('touchstart', handleTouchStart);
        gameAreaElement.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [gameState, direction]);
  
  // Device orientation controls (tilt)
  useEffect(() => {
    if (!useTiltControls || gameState !== 'PLAYING') return;
    
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      
      deviceOrientationRef.current = {
        beta: e.beta,  // Front-back tilt
        gamma: e.gamma, // Left-right tilt
      };
      
      // Threshold for tilt sensitivity
      const threshold = 10;
      
      if (Math.abs(e.gamma) > Math.abs(e.beta)) {
        // Left-right tilt is stronger
        if (e.gamma > threshold && direction !== 'LEFT') {
          setNextDirection('RIGHT');
        } else if (e.gamma < -threshold && direction !== 'RIGHT') {
          setNextDirection('LEFT');
        }
      } else {
        // Front-back tilt is stronger
        if (e.beta > threshold && direction !== 'UP') {
          setNextDirection('DOWN');
        } else if (e.beta < -threshold && direction !== 'DOWN') {
          setNextDirection('UP');
        }
      }
    };
    
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [useTiltControls, gameState, direction]);
  
  // Start game with motion trail initialized
  const startGame = () => {
    const initialPos = { x: 10, y: 10 };
    setSnake([initialPos]);
    setPrevSnake([initialPos]);
    motionTrailRef.current = Array(16).fill({ x: 10, y: 10 });
    setFood(generateFood());
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setScore(0);
    setAnimationProgress(1);
    setGameState('PLAYING');
  };
  
  // Restart game with motion trail initialized
  const restartGame = () => {
    const initialPos = { x: 10, y: 10 };
    setSnake([initialPos]);
    setPrevSnake([initialPos]);
    motionTrailRef.current = Array(16).fill({ x: 10, y: 10 });
    setFood(generateFood());
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setScore(0);
    setAnimationProgress(1);
    setGameState('PLAYING');
  };
  
  // Return to start screen with motion trail initialized
  const goToStartScreen = () => {
    const initialPos = { x: 10, y: 10 };
    setSnake([initialPos]);
    setPrevSnake([initialPos]);
    motionTrailRef.current = Array(16).fill({ x: 10, y: 10 });
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    setScore(0);
    setAnimationProgress(1);
    setGameState('START');
  };
  
  // Set difficulty
  const handleSetDifficulty = (level: Difficulty) => {
    setDifficulty(level);
  };
  
  // Toggle tilt controls
  const toggleTiltControls = () => {
    // Check if device orientation is supported
    if (typeof window.DeviceOrientationEvent !== 'undefined') {
      setUseTiltControls(prev => !prev);
    } else {
      // Alert the user if tilt controls are not supported
      alert("Your device does not support tilt controls");
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center w-full text-neutral-900 dark:text-neutral-300">
      <div className="relative mb-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center">Snake Game</h1>
        
        {/* Score Display */}
        <div className="flex justify-between w-full text-sm md:text-base mb-2">
          <div>Score: {score}</div>
          <div>High Score: {highScore}</div>
        </div>
        
        {/* Game Area */}
        <motion.div 
          ref={gameAreaRef}
          className="relative border-2 border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900"
          style={{
            width: `${GRID_SIZE * cellSize}px`,
            height: `${GRID_SIZE * cellSize}px`,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Canvas for game rendering */}
          <canvas ref={canvasRef} className="absolute inset-0" />
          
          {/* Overlays */}
          <AnimatePresence>
            {gameState === 'START' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-neutral-100/90 dark:bg-neutral-900/90 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Welcome to Snake!</h2>
                <p className="text-sm md:text-base text-center mb-4">Use arrow keys or swipe to move the snake. Eat the food to grow longer!</p>
                
                <div className="flex flex-col gap-2 mb-4">
                  <p className="text-center text-sm font-medium">Select Difficulty:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSetDifficulty('EASY')}
                      className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                        difficulty === 'EASY'
                          ? 'bg-green-500 text-white'
                          : 'bg-neutral-200 dark:bg-neutral-800'
                      }`}
                    >
                      Easy
                    </button>
                    <button
                      onClick={() => handleSetDifficulty('MEDIUM')}
                      className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                        difficulty === 'MEDIUM'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-neutral-200 dark:bg-neutral-800'
                      }`}
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => handleSetDifficulty('HARD')}
                      className={`px-3 py-1 text-sm rounded-full transition-colors duration-200 ${
                        difficulty === 'HARD'
                          ? 'bg-red-500 text-white'
                          : 'bg-neutral-200 dark:bg-neutral-800'
                      }`}
                    >
                      Hard
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={startGame}
                  className="px-6 py-2 bg-emerald-500 dark:bg-emerald-400 text-white dark:text-neutral-900 rounded-lg font-medium hover:bg-emerald-600 dark:hover:bg-emerald-300 transition-colors duration-200"
                >
                  Start Game
                </button>
                
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="tiltControls"
                    checked={useTiltControls}
                    onChange={toggleTiltControls}
                    className="h-4 w-4 text-emerald-500"
                  />
                  <label htmlFor="tiltControls" className="text-sm">Enable Tilt Controls</label>
                </div>
              </motion.div>
            )}
            
            {gameState === 'PAUSED' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100/90 dark:bg-neutral-900/90 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-4">Paused</h2>
                <button
                  onClick={() => setGameState('PLAYING')}
                  className="px-6 py-2 bg-emerald-500 dark:bg-emerald-400 text-white dark:text-neutral-900 rounded-lg font-medium hover:bg-emerald-600 dark:hover:bg-emerald-300 transition-colors duration-200"
                >
                  Resume
                </button>
              </motion.div>
            )}
            
            {gameState === 'GAME_OVER' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100/90 dark:bg-neutral-900/90 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
                <p className="mb-4">Your score: {score}</p>
                {score === highScore && score > 0 && (
                  <p className="text-emerald-500 dark:text-emerald-400 font-bold mb-4">New High Score!</p>
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={restartGame}
                  className="px-6 py-2 bg-emerald-500 dark:bg-emerald-400 text-white dark:text-neutral-900 rounded-lg font-medium hover:bg-emerald-600 dark:hover:bg-emerald-300 transition-colors duration-200"
                >
                  Play Again
                </button>
                  <button
                    onClick={goToStartScreen}
                    className="px-6 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-lg font-medium hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors duration-200"
                  >
                    Go Home
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
      {/* Controls Info */}
      <div className="mt-4 text-sm text-center">
        <p>Controls: Arrow keys / WASD / Swipe {useTiltControls && '/ Tilt'}</p>
        <p>Space to pause, R to restart</p>
      </div>
    </div>
  );
} 