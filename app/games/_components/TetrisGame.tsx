import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'

// Constants
const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const SPEEDS = {
  easy: 600,   // 6 seconds
  medium: 450, // 4.5 seconds
  hard: 300    // 3 seconds
}

// Helper function to convert level number to difficulty string
const getDifficultyByLevel = (level: number): keyof typeof SPEEDS => {
  if (level <= 1) return 'easy';
  if (level <= 3) return 'medium';
  return 'hard';
}

// Tetrimino shapes
const TETRIMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 'bg-cyan-500'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-blue-600'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-orange-500'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: 'bg-yellow-400'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: 'bg-green-500'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-purple-500'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-red-500'
  }
}

// Counter for unique tetrimino IDs
const tetriminoIdRef = { current: 0 };

// Define a Player type to avoid using 'any'
type PlayerType = {
  pos: { x: number, y: number };
  tetrimino: {
    shape: number[][];
    color: string;
  };
  name: string;
  collided: boolean;
  id: number;
}

// Create random tetrimino
const randomTetrimino = () => {
  const keys = Object.keys(TETRIMINOS)
  const key = keys[Math.floor(Math.random() * keys.length)]
  const tetriminoType = TETRIMINOS[key as keyof typeof TETRIMINOS]
  
  // Adjust starting position based on shape width to center it
  const width = tetriminoType.shape[0].length
  
  tetriminoIdRef.current++;
  
  return {
    pos: { 
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(width / 2), 
      y: 0 
    },
    tetrimino: tetriminoType,
    name: key,
    collided: false,
    id: tetriminoIdRef.current
  }
}

// Create empty board
const createEmptyBoard = () => 
  Array.from(Array(BOARD_HEIGHT), () => 
    Array(BOARD_WIDTH).fill(0)
  )

// Type for board cell content
type CellContent = string | number;

const TetrisGame: React.FC = () => {
  const [board, setBoard] = useState<CellContent[][]>(createEmptyBoard())
  const [player, setPlayer] = useState<PlayerType>(randomTetrimino())
  const [nextPlayer, setNextPlayer] = useState<PlayerType>(randomTetrimino())
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiActions, setAiActions] = useState<(() => void)[]>([]);
  
  const boardRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const dropTimeRef = useRef<number>(SPEEDS[getDifficultyByLevel(level)])
  const accumulatedTimeRef = useRef<number>(0)
  const aiActionTimerRef = useRef(0);
  
  // Check for collisions - improved version
  const checkCollision = useCallback((player: PlayerType, board: CellContent[][], { x: moveX, y: moveY } = { x: 0, y: 0 }) => {
    for (let y = 0; y < player.tetrimino.shape.length; y++) {
      for (let x = 0; x < player.tetrimino.shape[y].length; x++) {
        if (player.tetrimino.shape[y][x] !== 0) {
          const newY = y + player.pos.y + moveY;
          const newX = x + player.pos.x + moveX;
          if (
            newX < 0 || 
            newX >= BOARD_WIDTH || 
            newY >= BOARD_HEIGHT || 
            (newY >= 0 && board[newY][newX] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Helper functions for AI
  const placeTetrimino = useCallback((board: CellContent[][], tetrimino: { shape: number[][], color: string }, pos: { x: number, y: number }) => {
    const newBoard = board.map(row => [...row]);
    tetrimino.shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell !== 0) {
          const boardY = pos.y + dy;
          const boardX = pos.x + dx;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = tetrimino.color;
          }
        }
      });
    });
    return newBoard;
  }, []);

  const clearCompletedLines = useCallback((board: CellContent[][]) => {
    const newBoard: CellContent[][] = [];
    let rowsCleared = 0;
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      if (board[y].every(cell => cell !== 0)) {
        rowsCleared += 1;
      } else {
        newBoard.push([...board[y]]);
      }
    }
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    return { newBoard, rowsCleared };
  }, []);

  const calculateMetrics = useCallback((board: CellContent[][]) => {
    const heights = Array(BOARD_WIDTH).fill(BOARD_HEIGHT);
    for (let x = 0; x < BOARD_WIDTH; x++) {
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        if (board[y][x] !== 0) {
          heights[x] = BOARD_HEIGHT - y;
          break;
        }
      }
    }
    const actualHeights = heights.map(h => (h < BOARD_HEIGHT ? h : 0));
    const aggregateHeight = actualHeights.reduce((sum, h) => sum + h, 0);
    let holes = 0;
    for (let x = 0; x < BOARD_WIDTH; x++) {
      let hasFilledAbove = false;
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        if (board[y][x] !== 0) {
          hasFilledAbove = true;
        } else if (hasFilledAbove) {
          holes++;
        }
      }
    }
    let bumpiness = 0;
    for (let x = 0; x < BOARD_WIDTH - 1; x++) {
      bumpiness += Math.abs(actualHeights[x] - actualHeights[x + 1]);
    }
    return { aggregateHeight, holes, bumpiness };
  }, []);

  // Find the best move for AI
  const findBestMove = useCallback(() => {
    let bestScore = -Infinity;
    let bestMove = { rotation: 0, x: player.pos.x };
    const currentBoard = board;
    const tetrimino = player.tetrimino;
    const tetriminoName = player.name;
    const maxRotations = tetriminoName === 'O' ? 1 : (tetriminoName === 'I' || tetriminoName === 'S' || tetriminoName === 'Z' ? 2 : 4);

    for (let rot = 0; rot < maxRotations; rot++) {
      let rotatedShape = [...tetrimino.shape];
      for (let r = 0; r < rot; r++) {
        rotatedShape = rotate(rotatedShape, 1);
      }
      const width = rotatedShape[0].length;
      for (let x = -width + 1; x < BOARD_WIDTH; x++) {
        const tempPlayer = { 
          ...player, 
          tetrimino: { ...tetrimino, shape: rotatedShape }, 
          pos: { x, y: 0 } 
        };
        if (checkCollision(tempPlayer, currentBoard, { x: 0, y: 0 })) continue;

        let dropY = 0;
        while (!checkCollision(tempPlayer, currentBoard, { x: 0, y: dropY + 1 })) {
          dropY++;
        }
        tempPlayer.pos.y = dropY;

        const newBoard = placeTetrimino(currentBoard, tempPlayer.tetrimino, tempPlayer.pos);
        const { newBoard: sweptBoard, rowsCleared } = clearCompletedLines(newBoard);
        const { aggregateHeight, holes, bumpiness } = calculateMetrics(sweptBoard);

        const score = 10 * rowsCleared + (rowsCleared === 4 ? 20 : 0) - 1 * aggregateHeight - 5 * holes - 1 * bumpiness;
        if (score > bestScore) {
          bestScore = score;
          bestMove = { rotation: rot, x };
        }
      }
    }
    return bestMove;
  }, [player, board, checkCollision, placeTetrimino, clearCompletedLines, calculateMetrics]);

  // Rotate piece
  const rotate = (matrix: number[][], dir: number) => {
    // Make the rows become cols (transpose)
    const rotatedTetrimino = matrix.map((_, index) =>
      matrix.map(col => col[index])
    )
    // Reverse each row to get a rotated matrix
    if (dir > 0) return rotatedTetrimino.map(row => row.reverse())
    return rotatedTetrimino.reverse()
  }

  // Update player
  const updatePlayerPos = useCallback(({ x, y, collided = false }: { x: number, y: number, collided?: boolean }) => {
    if (gameOver || isPaused) return

    setPlayer(prev => ({
      ...prev,
      pos: { x: (prev.pos.x + x), y: (prev.pos.y + y) },
      collided
    }))
  }, [gameOver, isPaused]);

  // Rotate active player
  const playerRotate = useCallback((board: CellContent[][], dir: number) => {
    if (gameOver || isPaused) return

    const clonedPlayer = JSON.parse(JSON.stringify(player))
    clonedPlayer.tetrimino.shape = rotate(clonedPlayer.tetrimino.shape, dir)

    // This one is so the player can't rotate into the walls or other tetriminos
    const pos = clonedPlayer.pos.x
    let offset = 1
    while (checkCollision(clonedPlayer, board)) {
      clonedPlayer.pos.x += offset
      offset = -(offset + (offset > 0 ? 1 : -1))
      if (offset > clonedPlayer.tetrimino.shape[0].length) {
        rotate(clonedPlayer.tetrimino.shape, -dir)
        clonedPlayer.pos.x = pos
        return
      }
    }

    setPlayer(clonedPlayer)
  }, [player, checkCollision, gameOver, isPaused]);

  // Reset game
  const resetGame = useCallback((difficulty: keyof typeof SPEEDS) => {
    setBoard(createEmptyBoard())
    setPlayer(randomTetrimino())
    setNextPlayer(randomTetrimino())
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    dropTimeRef.current = SPEEDS[difficulty]
    accumulatedTimeRef.current = 0
    setGameStarted(true)
  }, []);

  // Handle completed rows
  const sweepRows = useCallback((newBoard: CellContent[][]) => {
    let rowsCleared = 0

    const sweepedBoard = newBoard.reduce((acc, row) => {
      // If no cell is 0 (empty), clear the row
      if (row.findIndex(cell => cell === 0) === -1) {
        rowsCleared += 1
        // Add empty row at the beginning
        acc.unshift(new Array(newBoard[0].length).fill(0))
        return acc
      }
      acc.push(row)
      return acc
    }, [] as CellContent[][])

    if (rowsCleared > 0) {
      // Calculate points
      const points = [0, 40, 100, 300, 1200][rowsCleared] * level
      setScore(prev => prev + points)
      setLines(prev => {
        const newLines = prev + rowsCleared
        // Update level
        const newLevel = Math.floor(newLines / 10) + 1
        if (newLevel > level) {
          setLevel(newLevel)
          dropTimeRef.current = SPEEDS[getDifficultyByLevel(newLevel)]
          accumulatedTimeRef.current = 0
        }
        return newLines
      })
    }

    return sweepedBoard
  }, [level]);

  // Check if tetrimino should drop
  const drop = useCallback(() => {
    if (gameOver || isPaused) return

    // Increase level when player has cleared 10 rows
    if (lines >= level * 10) {
      setLevel(prev => prev + 1)
      // Also increase speed
      dropTimeRef.current = SPEEDS[getDifficultyByLevel(level + 1)]
    }

    if (checkCollision(player, board, { x: 0, y: 1 })) {
      // Game over - only if collision happens at the very top of the board
      if (player.pos.y <= 0) {
        // Check if any filled cells of the tetrimino are truly at the top
        let topCollision = false;
        player.tetrimino.shape.forEach((row, y) => {
          row.forEach((cell) => {
            if (cell !== 0 && y + player.pos.y <= 0) {
              topCollision = true;
            }
          });
        });
        
        if (topCollision) {
          setGameOver(true);
          return;
        }
      }
      
      // Piece has collided
      // Update board
      setPlayer(prev => ({
        ...prev,
        collided: true
      }))
    } else {
      // Player moves down
      updatePlayerPos({ x: 0, y: 1, collided: false })
    }
  }, [player, board, lines, level, gameOver, isPaused, checkCollision, updatePlayerPos]);

  // Drop the tetrimino faster
  const dropPlayer = useCallback(() => {
    if (gameOver || isPaused) return
    drop()
  }, [drop, gameOver, isPaused]);

  // Quick drop
  const hardDrop = useCallback(() => {
    if (gameOver || isPaused) return

    let newY = player.pos.y
    while (!checkCollision(player, board, { x: 0, y: newY - player.pos.y + 1 })) {
      newY += 1
    }
    updatePlayerPos({ x: 0, y: newY - player.pos.y, collided: true })
  }, [player, board, checkCollision, updatePlayerPos, gameOver, isPaused]);

  // Move player horizontally
  const movePlayer = useCallback((dir: number) => {
    if (gameOver || isPaused) return

    if (!checkCollision(player, board, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0 })
    }
  }, [player, board, checkCollision, gameOver, isPaused, updatePlayerPos]);

  // Handle keypress
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (isAiMode) return; // Ignore keypresses in AI mode
    
    const keyCode = e.keyCode || e.which;
    
    // Prevent default behavior for arrow keys and space to avoid page scrolling
    if ([32, 37, 38, 39, 40].includes(keyCode)) {
      e.preventDefault();
    }
    
    if (gameOver) {
      if (keyCode === 13) resetGame('easy')  // Enter key
      return
    }

    if (keyCode === 80) {  // P key
      setIsPaused(prev => !prev)
      return
    }

    if (isPaused) return

    switch (keyCode) {
      case 37:  // Left arrow
      case 65:  // A key
        movePlayer(-1)
        break
      case 39:  // Right arrow
      case 68:  // D key
        movePlayer(1)
        break
      case 40:  // Down arrow
      case 83:  // S key
        dropPlayer()
        break
      case 38:  // Up arrow
      case 87:  // W key
        playerRotate(board, 1)
        break
      case 32:  // Space
        hardDrop()
        break
      default:
        break
    }
  }, [gameOver, isPaused, movePlayer, dropPlayer, playerRotate, board, hardDrop, resetGame, isAiMode]);

  // Handle touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    setTouchStart(touchPos)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || gameOver || isPaused) return

    const touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    const diffX = touchPos.x - touchStart.x
    const diffY = touchPos.y - touchStart.y
    const threshold = 30

    // Only register if movement is significant
    if (Math.abs(diffX) > threshold || Math.abs(diffY) > threshold) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        movePlayer(diffX > 0 ? 1 : -1)
      } else if (diffY > threshold) {
        // Swipe down
        dropPlayer()
      } else if (diffY < -threshold) {
        // Swipe up
        playerRotate(board, 1)
      }
      
      setTouchStart(touchPos)
    }
  }

  const handleTouchEnd = () => {
    setTouchStart(null)
  }

  // Animation game loop
  const gameLoop = useCallback((time = 0) => {
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    if (!isPaused && !gameOver) {
      if (isAiMode && aiActions.length > 0) {
        aiActionTimerRef.current += deltaTime;
        const AI_ACTION_INTERVAL = 100; // ms
        if (aiActionTimerRef.current >= AI_ACTION_INTERVAL) {
          const action = aiActions[0];
          action();
          setAiActions(prev => prev.slice(1));
          aiActionTimerRef.current = 0;
        }
      } else {
        accumulatedTimeRef.current += deltaTime;

        if (accumulatedTimeRef.current >= dropTimeRef.current) {
          drop();
          accumulatedTimeRef.current = 0; // reset accumulator after dropping
        }
      }
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [drop, isPaused, gameOver, isAiMode, aiActions]);

  // Update board
  useEffect(() => {
    if (player.collided) {
      // Create a new board with frozen tetriminos
      const newBoard = [...board]
      player.tetrimino.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell !== 0) {
            const boardY = y + player.pos.y
            const boardX = x + player.pos.x
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              newBoard[boardY][boardX] = player.tetrimino.color
            }
          }
        })
      })

      // Sweep the rows and score
      const sweptBoard = sweepRows(newBoard)
      setBoard(sweptBoard)

      // Reset player with next tetrimino
      setPlayer(nextPlayer)
      setNextPlayer(randomTetrimino())
    }
  }, [player.collided, board, nextPlayer, player.pos.x, player.pos.y, player.tetrimino.color, player.tetrimino.shape, sweepRows]);

  // Handle keyboard events
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  // Trigger AI moves when a new tetrimino spawns
  useEffect(() => {
    if (isAiMode && !player.collided && gameStarted && !gameOver && !isPaused) {
      const bestMove = findBestMove();
      if (bestMove) {
        const actions: (() => void)[] = [];
        for (let i = 0; i < bestMove.rotation; i++) {
          actions.push(() => playerRotate(board, 1));
        }
        const dx = bestMove.x - player.pos.x;
        if (dx > 0) {
          for (let i = 0; i < dx; i++) {
            actions.push(() => movePlayer(1));
          }
        } else if (dx < 0) {
          for (let i = 0; i < -dx; i++) {
            actions.push(() => movePlayer(-1));
          }
        }
        actions.push(hardDrop);
        setAiActions(actions);
      }
    }
  }, [player.id, isAiMode, gameStarted, gameOver, isPaused, findBestMove, playerRotate, board, movePlayer, hardDrop]);

  // Start game loop
  useEffect(() => {
    if (!gameOver) {
      requestRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      cancelAnimationFrame(requestRef.current)
    }
  }, [gameLoop, gameOver])

  // Define the cell styles directly
  const cellStyle = {
    width: '30px',
    height: '30px',
    border: '1px solid #404040'
  }

  const smallCellStyle = {
    width: '20px',
    height: '20px'
  }

  // Build the game board
  const renderBoard = () => {
    // Create a fresh board copy 
    const boardCopy = board.map(row => [...row])

    // Add active tetrimino to board copy
    player.tetrimino.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== 0) {
          const boardY = y + player.pos.y
          const boardX = x + player.pos.x
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            boardCopy[boardY][boardX] = player.tetrimino.color
          }
        }
      })
    })

    // Render the cells
    return boardCopy.map((row, y) => 
      row.map((cell, x) => (
        <div
          key={`${y}-${x}`}
          className={typeof cell === 'string' ? cell : 'bg-transparent'}
          style={cellStyle}
        />
      ))
    )
  }

  // Render next piece
  const renderNextPiece = () => {
    return nextPlayer.tetrimino.shape.map((row, y) => 
      row.map((cell, x) => (
        <div
          key={`next-${y}-${x}`}
          className={cell !== 0 ? nextPlayer.tetrimino.color : 'bg-transparent'}
          style={smallCellStyle}
        />
      ))
    )
  }

  // Board container style
  const boardContainerStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${BOARD_WIDTH}, 30px)`,
    width: `${BOARD_WIDTH * 30}px`,
    height: `${BOARD_HEIGHT * 30}px`,
    backgroundColor: '#171717',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  }

  // Next piece container style
  const nextPieceContainerStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${nextPlayer.tetrimino.shape[0].length}, 20px)`,
    gap: '2px',
    padding: '4px',
    backgroundColor: '#171717',
    justifyContent: 'center'
  }

  return (
    <div className="flex justify-center select-none">
      <div className="flex items-start gap-4">
        {/* Left column - Game board with stats on top */}
        <div className="flex flex-col gap-2">
          {/* Stats row directly above the game board */}
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2">
              <div className="bg-neutral-800 dark:bg-neutral-700 px-3 py-1 rounded shadow-sm text-white text-xs">
                Score: {score}
              </div>
              <div className="bg-neutral-800 dark:bg-neutral-700 px-3 py-1 rounded shadow-sm text-white text-xs">
                Level: {level}
              </div>
              <div className="bg-neutral-800 dark:bg-neutral-700 px-3 py-1 rounded shadow-sm text-white text-xs">
                Lines: {lines}
              </div>
            </div>
          </div>
          
          {/* Game board */}
          <div 
            ref={boardRef}
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <motion.div 
              style={boardContainerStyle}
              className="bg-neutral-900 dark:bg-neutral-800 shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {renderBoard()}
            </motion.div>

            {/* Game Over overlay */}
            {gameOver && (
              <motion.div 
                className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h2 className="text-3xl font-bold text-white mb-4">Game Over</h2>
                <p className="text-xl text-white mb-6">Final Score: {score}</p>
                <Button 
                  onClick={() => setGameStarted(false)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  Reset
                </Button>
              </motion.div>
            )}

            {/* Pause overlay */}
            {isPaused && !gameOver && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h2 className="text-3xl font-bold text-white">PAUSED</h2>
              </motion.div>
            )}

            {/* Difficulty selection modal */}
            {!gameStarted && (
              <motion.div 
                className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold text-white mb-4 text-center">Select Difficulty</h2>
                  <div className="flex flex-col gap-3">
                    <Button onClick={() => resetGame('easy')} className="bg-green-500 hover:bg-green-600 text-white">Easy</Button>
                    <Button onClick={() => resetGame('medium')} className="bg-yellow-500 hover:bg-yellow-600 text-white">Medium</Button>
                    <Button onClick={() => resetGame('hard')} className="bg-red-500 hover:bg-red-600 text-white">Hard</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right column - Info area and buttons */}
        <div className="flex flex-col gap-3 w-[150px]">
          {/* Action buttons at the top of the side panel */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => setIsPaused(prev => !prev)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 h-8"
              disabled={gameOver || !gameStarted}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button 
              onClick={() => setGameStarted(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 h-8"
            >
              Reset
            </Button>
            <Button 
              onClick={() => setIsAiMode(prev => !prev)}
              className={`w-full ${isAiMode ? 'bg-green-600' : 'bg-neutral-700'} text-white text-sm px-3 py-1 h-8`}
              disabled={gameOver || !gameStarted}
            >
              {isAiMode ? 'AI On' : 'AI Off'}
            </Button>
          </div>
          
          {/* Next piece */}
          <div className="bg-neutral-800 dark:bg-neutral-700 p-2 rounded shadow-md">
            <h3 className="text-sm font-bold text-white mb-1">Next</h3>
            <div style={nextPieceContainerStyle}>
              {renderNextPiece()}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-neutral-800 dark:bg-neutral-700 p-2 rounded shadow-md">
            <h3 className="text-sm font-bold text-white mb-1">Controls</h3>
            <div className="text-white text-xs">
              <p className="mb-0.5">↑ / W: Rotate</p>
              <p className="mb-0.5">← / A: Move Left</p>
              <p className="mb-0.5">→ / D: Move Right</p>
              <p className="mb-0.5">↓ / S: Soft Drop</p>
              <p className="mb-0.5">Space: Hard Drop</p>
              <p className="mb-0.5">P: Pause</p>
              {isAiMode && <p className="mt-1 text-green-400">AI Mode: ON</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TetrisGame 