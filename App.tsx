import React, { useState, useMemo } from 'react';
import { PlayerSetup } from './components/PlayerSetup';
import { ScoreEntryModal } from './components/ScoreEntryModal';
import { AssistantDrawer } from './components/AssistantDrawer';
import { Button } from './components/Button';
import { Player, Round, GameState, RoundScore } from './types';
import { Plus, History, Bot, ArrowLeft, Trophy, MoreHorizontal, RotateCcw } from 'lucide-react';

// Main App Component
const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    rounds: [],
    status: 'setup',
  });
  
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // -- Actions --

  const startGame = (players: Player[]) => {
    setGameState({
      players,
      rounds: [],
      status: 'playing',
    });
  };

  const handleRoundSubmit = (scores: RoundScore[]) => {
    const newRound: Round = {
      id: crypto.randomUUID(),
      number: gameState.rounds.length + 1,
      timestamp: Date.now(),
      scores,
    };

    // Update player totals
    const updatedPlayers = gameState.players.map(player => {
      const roundScore = scores.find(s => s.playerId === player.id);
      return {
        ...player,
        totalScore: player.totalScore + (roundScore?.scoreChange || 0),
      };
    });

    setGameState(prev => ({
      ...prev,
      players: updatedPlayers,
      rounds: [...prev.rounds, newRound],
    }));
  };

  const resetGame = () => {
    if (confirm("Are you sure you want to reset the entire game?")) {
      setGameState({
        players: [],
        rounds: [],
        status: 'setup',
      });
    }
  };

  // -- Computed --
  
  const sortedPlayers = useMemo(() => {
    return [...gameState.players].sort((a, b) => b.totalScore - a.totalScore);
  }, [gameState.players]);

  const leaderId = sortedPlayers[0]?.id;

  // -- Render Helpers --

  const renderLeaderboard = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-24 sm:mb-8">
      {sortedPlayers.map((player, index) => {
        const isLeader = player.id === leaderId && player.totalScore > 0;
        return (
          <div 
            key={player.id}
            className={`
              relative bg-white rounded-3xl p-6 shadow-sm border border-gray-100 transition-all
              ${isLeader ? 'ring-2 ring-yellow-400 shadow-yellow-100' : ''}
            `}
          >
            {isLeader && (
              <div className="absolute -top-3 -right-3 bg-yellow-400 text-white p-2 rounded-full shadow-lg">
                <Trophy size={20} fill="currentColor" />
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                 <div 
                  className="w-2 h-10 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 leading-none">{player.name}</h3>
                  <span className="text-xs text-gray-400 font-medium">Rank #{index + 1}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-3xl font-black ${player.totalScore >= 0 ? 'text-gray-900' : 'text-red-500'}`}>
                  {player.totalScore}
                </span>
                <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider mt-1">Points</span>
              </div>
            </div>

            {/* Mini History (Last 3 rounds) */}
            <div className="flex gap-1 justify-end">
              {gameState.rounds.slice(-5).map(round => {
                const s = round.scores.find(x => x.playerId === player.id);
                if (!s) return null;
                const isWin = s.isWinner;
                const val = s.scoreChange;
                return (
                  <div 
                    key={round.id}
                    className={`
                      w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border
                      ${isWin ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                        val < 0 ? 'bg-red-50 border-red-100 text-red-500' : 'bg-gray-50 border-gray-100 text-gray-400'}
                    `}
                    title={`Round ${round.number}: ${val}`}
                  >
                    {val > 0 ? '+' : ''}{val}
                  </div>
                )
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4 pb-24">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Match History</h2>
      {gameState.rounds.slice().reverse().map((round) => (
        <div key={round.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-50">
            <span className="font-bold text-gray-500">Round {round.number}</span>
            <span className="text-xs text-gray-400">
              {new Date(round.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="space-y-2">
            {round.scores.map((score) => {
              const p = gameState.players.find(x => x.id === score.playerId);
              return (
                <div key={score.playerId} className="flex justify-between items-center text-sm">
                  <span className={`font-medium ${score.isWinner ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                    {p?.name} {score.isWinner && '👑'}
                  </span>
                  <span className={score.scoreChange >= 0 ? 'text-green-600' : 'text-red-500'}>
                    {score.scoreChange > 0 ? '+' : ''}{score.scoreChange}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {gameState.rounds.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <History size={48} className="mx-auto mb-4 opacity-20" />
          <p>No rounds played yet.</p>
        </div>
      )}
    </div>
  );

  // -- Main Render --

  if (gameState.status === 'setup') {
    return <PlayerSetup onStartGame={startGame} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Simple Logo Icon */}
            <div className="grid grid-cols-2 gap-0.5 w-8 h-8">
              <div className="bg-red-500 rounded-tl-md"></div>
              <div className="bg-black rounded-tr-md"></div>
              <div className="bg-blue-500 rounded-bl-md"></div>
              <div className="bg-yellow-500 rounded-br-md"></div>
            </div>
            <h1 className="font-bold text-xl tracking-tight text-gray-800 hidden sm:block">RummyScore</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={resetGame} title="Reset Game">
              <RotateCcw size={20} />
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setIsAssistantOpen(true)}
              className="!px-3"
            >
              <Bot size={20} className="text-blue-600" />
              <span className="hidden sm:inline">Referee</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        
        {/* Toggle View (Mobile mostly) */}
        <div className="flex gap-2 mb-6 sm:hidden">
          <button 
            onClick={() => setShowHistory(false)}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${!showHistory ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Scoreboard
          </button>
          <button 
             onClick={() => setShowHistory(true)}
             className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${showHistory ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            History
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Board Area */}
          <div className={`lg:col-span-2 ${showHistory ? 'hidden lg:block' : 'block'}`}>
            {renderLeaderboard()}
          </div>

          {/* Sidebar / History Area */}
          <div className={`lg:col-span-1 ${!showHistory ? 'hidden lg:block' : 'block'}`}>
            {renderHistory()}
          </div>
        </div>
      </main>

      {/* Floating Action Button (Mobile/Desktop) */}
      <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-40">
        <button
          onClick={() => setIsEntryModalOpen(true)}
          className="group flex items-center gap-3 pl-5 pr-6 py-4 bg-gray-900 text-white rounded-full shadow-2xl hover:bg-gray-800 hover:scale-105 transition-all duration-300"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-bold text-lg">Add Round</span>
        </button>
      </div>

      {/* Modals & Drawers */}
      <ScoreEntryModal
        players={gameState.players}
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSubmit={handleRoundSubmit}
      />

      <AssistantDrawer 
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
};

export default App;
