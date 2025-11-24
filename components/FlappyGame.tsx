import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  GAME_WIDTH, 
  GAME_HEIGHT, 
  GRAVITY, 
  JUMP_STRENGTH, 
  PIPE_SPEED, 
  PIPE_SPACING, 
  PIPE_GAP, 
  BIRD_SIZE, 
  PIPE_WIDTH,
  COLOR_SENAC_BLUE,
  COLOR_SENAC_ORANGE,
  COLOR_SKY_TOP,
  COLOR_SKY_BOTTOM,
  GameState
} from '../constants';
import { Bird, Pipe, Particle } from '../types';

interface FlappyGameProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  score: number;
  setScore: (score: number | ((prev: number) => number)) => void;
  highScore: number;
  setHighScore: (score: number) => void;
}

const FlappyGame: React.FC<FlappyGameProps> = ({ 
  gameState, 
  setGameState, 
  score, 
  setScore,
  highScore,
  setHighScore
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game State Refs (using refs for mutable state in the game loop)
  const birdRef = useRef<Bird>({ y: GAME_HEIGHT / 2, velocity: 0, rotation: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameCountRef = useRef<number>(0);
  const scoreRef = useRef<number>(0); // Keep a ref for internal loop usage to avoid dependency staleness

  // Initialize Game
  const resetGame = useCallback(() => {
    birdRef.current = { y: GAME_HEIGHT / 2, velocity: 0, rotation: 0 };
    pipesRef.current = [
      { x: GAME_WIDTH + 100, topHeight: getRandomPipeHeight(), passed: false }
    ];
    particlesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    frameCountRef.current = 0;
  }, [setScore]);

  const getRandomPipeHeight = () => {
    const minHeight = 50;
    const maxHeight = GAME_HEIGHT - PIPE_GAP - minHeight - 50; // -50 for ground buffer
    return Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
  };

  const createParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1.0,
        color
      });
    }
  };

  // Helper to handle game over properly
  const endGame = useCallback(() => {
    setGameState(GameState.GAME_OVER);
    // Vibrate on mobile
    if (navigator.vibrate) navigator.vibrate(200);
    
    // Update High Score
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('senacFlappyHighScore', scoreRef.current.toString());
    }
  }, [setGameState, highScore, setHighScore]);

  const jump = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      birdRef.current.velocity = JUMP_STRENGTH;
      createParticles(GAME_WIDTH / 2 - 10, birdRef.current.y + 10, '#FFFFFF');
    } else if (gameState === GameState.START) {
      setGameState(GameState.PLAYING);
      resetGame();
      birdRef.current.velocity = JUMP_STRENGTH;
    } else if (gameState === GameState.GAME_OVER) {
      // Cooldown to prevent accidental restarts
       // Handled by UI button mostly, but spacebar can trigger this check in parent
    }
  }, [gameState, setGameState, resetGame]);

  // Main Game Loop
  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- UPDATE ---
    if (gameState === GameState.PLAYING) {
      // Bird Physics
      birdRef.current.velocity += GRAVITY;
      birdRef.current.y += birdRef.current.velocity;
      
      // Bird Rotation
      birdRef.current.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (birdRef.current.velocity * 0.1)));

      // Pipes Logic
      const pipes = pipesRef.current;
      
      // Add new pipe
      if (pipes.length > 0 && GAME_WIDTH - pipes[pipes.length - 1].x >= PIPE_SPACING) {
        pipes.push({ x: GAME_WIDTH, topHeight: getRandomPipeHeight(), passed: false });
      }

      // Move pipes and check collisions
      for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= PIPE_SPEED;

        // Remove off-screen pipes
        if (pipe.x + PIPE_WIDTH < 0) {
          pipes.splice(i, 1);
          continue;
        }

        // Collision Box Logic
        const birdX = GAME_WIDTH / 3; // Fixed X position for visual centering
        const birdY = birdRef.current.y;
        const birdRadius = BIRD_SIZE / 2 - 4; // Hitbox slightly smaller than visual

        // Check Pipe Collision
        if (
          birdX + birdRadius > pipe.x && 
          birdX - birdRadius < pipe.x + PIPE_WIDTH && 
          (birdY - birdRadius < pipe.topHeight || birdY + birdRadius > pipe.topHeight + PIPE_GAP)
        ) {
          endGame();
        }

        // Score counting
        if (!pipe.passed && pipe.x + PIPE_WIDTH < birdX) {
          pipe.passed = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
          // Reward particles
          createParticles(birdX, birdY, COLOR_SENAC_ORANGE);
        }
      }

      // Ground/Ceiling Collision
      if (birdRef.current.y + BIRD_SIZE/2 >= GAME_HEIGHT || birdRef.current.y - BIRD_SIZE/2 <= 0) {
        endGame();
      }
    } else if (gameState === GameState.START) {
        // Idle animation
        birdRef.current.y = GAME_HEIGHT / 2 + Math.sin(Date.now() / 300) * 10;
    }

    // Particles Update
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
      if (p.life <= 0) particlesRef.current.splice(i, 1);
    }

    // --- DRAW ---
    
    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, COLOR_SKY_TOP);
    gradient.addColorStop(1, COLOR_SKY_BOTTOM);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Grid lines (Graph paper / Education theme)
    ctx.strokeStyle = 'rgba(0, 69, 135, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let x=0; x<GAME_WIDTH; x+=20) { ctx.moveTo(x,0); ctx.lineTo(x,GAME_HEIGHT); }
    for(let y=0; y<GAME_HEIGHT; y+=20) { ctx.moveTo(0,y); ctx.lineTo(GAME_WIDTH,y); }
    ctx.stroke();

    // Pipes (Pillars of Knowledge)
    pipesRef.current.forEach(pipe => {
      // Top Pipe
      const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
      pipeGradient.addColorStop(0, COLOR_SENAC_BLUE);
      pipeGradient.addColorStop(0.8, '#005BB3');
      pipeGradient.addColorStop(1, COLOR_SENAC_BLUE);
      
      ctx.fillStyle = pipeGradient;
      
      // Draw Top Pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      // Cap for top pipe
      ctx.fillStyle = COLOR_SENAC_ORANGE;
      ctx.fillRect(pipe.x - 2, pipe.topHeight - 10, PIPE_WIDTH + 4, 10);

      // Draw Bottom Pipe
      ctx.fillStyle = pipeGradient;
      const bottomPipeY = pipe.topHeight + PIPE_GAP;
      ctx.fillRect(pipe.x, bottomPipeY, PIPE_WIDTH, GAME_HEIGHT - bottomPipeY);
      // Cap for bottom pipe
      ctx.fillStyle = COLOR_SENAC_ORANGE;
      ctx.fillRect(pipe.x - 2, bottomPipeY, PIPE_WIDTH + 4, 10);
      
      // Senac detail
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(pipe.x + 10, 0, 5, pipe.topHeight);
      ctx.fillRect(pipe.x + 10, bottomPipeY, 5, GAME_HEIGHT - bottomPipeY);
    });

    // Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    // Bird (The Flying Book/Student)
    ctx.save();
    ctx.translate(GAME_WIDTH / 3, birdRef.current.y);
    ctx.rotate(birdRef.current.rotation);
    
    // Draw Book Body
    ctx.fillStyle = COLOR_SENAC_BLUE;
    const bookWidth = BIRD_SIZE;
    const bookHeight = BIRD_SIZE * 0.7;
    
    // Book Cover
    ctx.beginPath();
    ctx.roundRect(-bookWidth/2, -bookHeight/2, bookWidth, bookHeight, 4);
    ctx.fill();
    
    // Pages (White)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(-bookWidth/2 + 4, -bookHeight/2 + 4, bookWidth - 8, bookHeight - 8, 2);
    ctx.fill();

    // Senac Logo Detail (Orange Triangle/Corner)
    ctx.fillStyle = COLOR_SENAC_ORANGE;
    ctx.beginPath();
    ctx.moveTo(bookWidth/2 - 4, bookHeight/2 - 4);
    ctx.lineTo(0, bookHeight/2 - 4);
    ctx.lineTo(bookWidth/2 - 4, 0);
    ctx.fill();

    // Eyes (to make it a character)
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(6, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    // Glasses
    ctx.strokeStyle = COLOR_SENAC_BLUE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(6, -2, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, -2);
    ctx.lineTo(-4, -2); // bridge
    ctx.stroke();

    ctx.restore();

    // Ground Stripe
    ctx.fillStyle = '#333';
    ctx.fillRect(0, GAME_HEIGHT - 10, GAME_WIDTH, 10);

    requestRef.current = requestAnimationFrame(loop);
  }, [gameState, setGameState, endGame, setScore]);

  // Fix loop dependency issue by using a ref for the loop function or ensuring deps are stable
  // For simplicity in this structure, we just rely on standard effect pattern with stable callbacks
  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    
    const handleTouchStart = (e: TouchEvent) => {
        // Prevent default only inside the canvas area to avoid blocking UI buttons? 
        // We'll rely on the React onClick handler on the wrapper div.
    };

    window.addEventListener('keydown', handleKeyDown);
    // We attach click/touch to the container div
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [jump]);

  return (
    <div 
      className="relative shadow-2xl rounded-lg overflow-hidden cursor-pointer select-none"
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT, maxWidth: '100%', maxHeight: '80vh' }}
      onMouseDown={(e) => { e.preventDefault(); jump(); }}
      onTouchStart={(e) => { e.preventDefault(); jump(); }}
    >
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="w-full h-full block bg-white"
      />
    </div>
  );
};

export default FlappyGame;