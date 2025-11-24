import React, { useState, useEffect } from 'react';
import FlappyGame from './components/FlappyGame';
import { GameState, COLOR_SENAC_BLUE, COLOR_SENAC_ORANGE } from './constants';
import { Trophy, RefreshCw, Play } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('senacFlappyHighScore');
    if (stored) {
      setHighScore(parseInt(stored, 10));
    }
  }, []);

  const handleRestart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setGameState(GameState.START);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Header */}
      <header className="mb-4 text-center z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
          <span style={{ color: COLOR_SENAC_ORANGE }}>Flappy</span>
          <span className="ml-2" style={{ color: '#FFF' }}>Senac</span>
        </h1>
        <p className="text-blue-200 text-sm mt-1 opacity-80">Jornada do Conhecimento</p>
      </header>

      {/* Game Container Wrapper */}
      <div className="relative group">
        
        <FlappyGame 
          gameState={gameState} 
          setGameState={setGameState}
          score={score}
          setScore={setScore}
          highScore={highScore}
          setHighScore={setHighScore}
        />

        {/* Score Display (Always Visible when playing) */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="flex flex-col items-center">
             <span className="text-5xl font-black text-white stroke-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" 
                   style={{ WebkitTextStroke: '2px #004587' }}>
              {score}
            </span>
          </div>
        </div>

        {/* Start Screen Overlay */}
        {gameState === GameState.START && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300 pointer-events-none">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center text-center animate-bounce-slow">
              <div className="bg-blue-100 p-4 rounded-full mb-4">
                 <Play size={32} color={COLOR_SENAC_BLUE} fill={COLOR_SENAC_BLUE} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Pronto para Voar?</h2>
              <p className="text-gray-500 mb-4">Toque, clique ou use Espaço para pular.</p>
              <div className="text-xs font-semibold uppercase tracking-wider text-orange-500 bg-orange-100 px-3 py-1 rounded-full">
                Clique para começar
              </div>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-20">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-xs w-full text-center transform transition-all scale-100 border-4 border-orange-400">
              <h2 className="text-3xl font-black text-gray-800 mb-6 uppercase tracking-wider">
                Fim de Jogo!
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 p-3 rounded-xl flex flex-col items-center">
                  <span className="text-xs text-blue-500 font-bold uppercase mb-1">Score</span>
                  <span className="text-2xl font-black text-blue-900">{score}</span>
                </div>
                <div className="bg-orange-50 p-3 rounded-xl flex flex-col items-center">
                  <span className="text-xs text-orange-500 font-bold uppercase mb-1 flex items-center gap-1">
                    <Trophy size={10} /> Melhor
                  </span>
                  <span className="text-2xl font-black text-orange-600">{highScore}</span>
                </div>
              </div>

              <button 
                onClick={handleRestart}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} />
                Tentar Novamente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <footer className="mt-6 text-slate-400 text-xs md:text-sm text-center max-w-md">
        <p>Desenvolva seu potencial. Voe alto com o Senac.</p>
        <p className="mt-2 opacity-50">Use a Barra de Espaço no PC</p>
      </footer>
    </div>
  );
}