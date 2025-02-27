import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'

// Constants
const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 30
const SPEEDS = {
  1: 800,
  2: 650,
  3: 500,
  4: 370,
  5: 250,
  6: 160
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

// Create random tetrimino
const randomTetrimino = () => {
  const keys = Object.keys(TETRIMINOS)
  const key = keys[Math.floor(Math.random() * keys.length)]
  const tetriminoType = TETRIMINOS[key as keyof typeof TETRIMINOS]
  
  // Adjust starting position based on shape width to center it
  const width = tetriminoType.shape[0].length
  
  return {
    pos: { 
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(width / 2), 
      y: 0 
    },
    tetrimino: tetriminoType,
    name: key,
    collided: false
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
  const [player, setPlayer] = useState(randomTetrimino())
  const [nextPlayer, setNextPlayer] = useState(randomTetrimino())
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null)
  
  const boardRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const dropTimeRef = useRef<number>(SPEEDS[level as keyof typeof SPEEDS])
  
  // Check for collisions - improved version
  const checkCollision = useCallback((player: any, board: CellContent[][], { x: moveX, y: moveY } = { x: 0, y: 0 }) => {
    // Loop through all tetrimino blocks
    for (let y = 0; y < player.tetrimino.shape.length; y++) {
      for (let x = 0; x < player.tetrimino.shape[y].length; x++) {
        // Only check occupied cells
        if (player.tetrimino.shape[y][x] !== 0) {
          const newY = y + player.pos.y + moveY;
          const newX = x + player.pos.x + moveX;
          
          // Check if position is outside the game board boundaries
          if (
            newY < 0 || 
            newY >= BOARD_HEIGHT || 
            newX < 0 || 
            newX >= BOARD_WIDTH
          ) {
            return true;
          }
          
          // Check if position collides with a non-empty cell on the board
          if (board[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

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
  const updatePlayerPos = ({ x, y, collided = false }: { x: number, y: number, collided?: boolean }) => {
    if (gameOver || isPaused) return

    setPlayer(prev => ({
      ...prev,
      pos: { x: (prev.pos.x + x), y: (prev.pos.y + y) },
      collided
    }))
  }

  // Rotate active player
  const playerRotate = (board: CellContent[][], dir: number) => {
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
  }

  // Reset game
  const resetGame = () => {
    setBoard(createEmptyBoard())
    setPlayer(randomTetrimino())
    setNextPlayer(randomTetrimino())
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    dropTimeRef.current = SPEEDS[1]
  }

  // Handle completed rows
  const sweepRows = (newBoard: CellContent[][]) => {
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
          dropTimeRef.current = SPEEDS[Math.min(6, newLevel) as keyof typeof SPEEDS]
        }
        return newLines
      })
    }

    return sweepedBoard
  }

  // Check if tetrimino should drop
  const drop = useCallback(() => {
    if (gameOver || isPaused) return

    // Increase level when player has cleared 10 rows
    if (lines >= level * 10) {
      setLevel(prev => prev + 1)
      // Also increase speed
      dropTimeRef.current = SPEEDS[Math.min(6, level + 1) as keyof typeof SPEEDS]
    }

    if (checkCollision(player, board, { x: 0, y: 1 })) {
      // Game over - only if collision happens at the very top of the board
      if (player.pos.y <= 0) {
        // Check if any filled cells of the tetrimino are truly at the top
        let topCollision = false;
        player.tetrimino.shape.forEach((row, y) => {
          row.forEach((cell, x) => {
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
  }, [player, board, lines, level, gameOver, isPaused, checkCollision])

  // Drop the tetrimino faster
  const dropPlayer = () => {
    if (gameOver || isPaused) return
    drop()
  }

  // Quick drop
  const hardDrop = () => {
    if (gameOver || isPaused) return

    let newY = player.pos.y
    while (!checkCollision(player, board, { x: 0, y: newY - player.pos.y + 1 })) {
      newY += 1
    }
    updatePlayerPos({ x: 0, y: newY - player.pos.y, collided: true })
  }

  // Move player horizontally
  const movePlayer = (dir: number) => {
    if (gameOver || isPaused) return

    if (!checkCollision(player, board, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0 })
    }
  }

  // Handle keypress
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    const keyCode = e.keyCode || e.which;
    
    // Prevent default behavior for arrow keys and space to avoid page scrolling
    if ([32, 37, 38, 39, 40].includes(keyCode)) {
      e.preventDefault();
    }
    
    if (gameOver) {
      if (keyCode === 13) resetGame()  // Enter key
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
      case 32:  // Space
        playerRotate(board, 1)
        break
      case 16:  // Shift key
        hardDrop()
        break
      default:
        break
    }
  }, [gameOver, isPaused, movePlayer, dropPlayer, playerRotate, board, hardDrop, resetGame])

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

  const handleTap = (e: React.TouchEvent) => {
    const boardRect = boardRef.current?.getBoundingClientRect()
    if (!boardRect) return

    const tapX = e.touches[0].clientX - boardRect.left
    const tapY = e.touches[0].clientY - boardRect.top
    
    // Check if tap is in the upper half (rotate) or lower half (drop)
    if (tapY < boardRect.height / 2) {
      playerRotate(board, 1)
    } else {
      hardDrop()
    }
  }

  // Animation game loop
  const gameLoop = useCallback((time = 0) => {
    const deltaTime = time - lastTimeRef.current
    lastTimeRef.current = time

    if (deltaTime > dropTimeRef.current && !isPaused && !gameOver) {
      drop()
    }

    requestRef.current = requestAnimationFrame(gameLoop)
  }, [drop, isPaused, gameOver])

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
  }, [player.collided])

  // Handle keyboard events
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

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
    width: '24px',
    height: '24px'
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
    gridTemplateColumns: `repeat(${nextPlayer.tetrimino.shape[0].length}, 24px)`,
    gap: '2px',
    padding: '8px',
    backgroundColor: '#171717',
    justifyContent: 'center'
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-4 select-none">
      {/* Main game area */}
      <div 
        ref={boardRef}
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Game board */}
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
              onClick={resetGame}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Play Again
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
      </div>

      {/* Game info and controls */}
      <div className="flex flex-col gap-6 w-[200px]">
        {/* Score info */}
        <div className="bg-neutral-800 dark:bg-neutral-700 p-4 rounded shadow-md">
          <h3 className="text-lg font-bold text-white mb-2">Score</h3>
          <p className="text-2xl text-white">{score}</p>
          
          <h3 className="text-lg font-bold text-white mt-4 mb-2">Lines</h3>
          <p className="text-xl text-white">{lines}</p>
          
          <h3 className="text-lg font-bold text-white mt-4 mb-2">Level</h3>
          <p className="text-xl text-white">{level}</p>
        </div>

        {/* Next piece */}
        <div className="bg-neutral-800 dark:bg-neutral-700 p-4 rounded shadow-md">
          <h3 className="text-lg font-bold text-white mb-2">Next</h3>
          <div style={nextPieceContainerStyle}>
            {renderNextPiece()}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-neutral-800 dark:bg-neutral-700 p-4 rounded shadow-md">
          <h3 className="text-lg font-bold text-white mb-2">Controls</h3>
          <div className="text-white text-sm">
            <p className="mb-1">↑ / W: Rotate</p>
            <p className="mb-1">← / A: Move Left</p>
            <p className="mb-1">→ / D: Move Right</p>
            <p className="mb-1">↓ / S: Soft Drop</p>
            <p className="mb-1">Shift: Hard Drop</p>
            <p className="mb-1">P: Pause</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsPaused(prev => !prev)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={gameOver}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button 
            onClick={resetGame}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TetrisGame 