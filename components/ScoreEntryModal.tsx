import React, { useState, useEffect } from 'react';
import { Player, RoundScore } from '../types';
import { Button } from './Button';
import { X, Trophy, AlertCircle } from 'lucide-react';

interface ScoreEntryModalProps {
  players: Player[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scores: RoundScore[]) => void;
}

export const ScoreEntryModal: React.FC<ScoreEntryModalProps> = ({
  players,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [tileCounts, setTileCounts] = useState<Record<string, string>>({});

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setWinnerId(null);
      setTileCounts({});
    }
  }, [isOpen]);

  const handleTileInput = (playerId: string, value: string) => {
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setTileCounts(prev => ({ ...prev, [playerId]: value }));
    }
  };

  const handleSubmit = () => {
    if (!winnerId) return;

    const scores: RoundScore[] = [];
    let winnersPositivePoints = 0;

    // First pass: Calculate penalties for losers
    players.forEach(player => {
      if (player.id !== winnerId) {
        const count = parseInt(tileCounts[player.id] || '0', 10);
        const penalty = -Math.abs(count); // Ensure negative
        scores.push({
          playerId: player.id,
          tileCount: count,
          scoreChange: penalty,
          isWinner: false
        });
        winnersPositivePoints += Math.abs(penalty);
      }
    });

    // Second pass: Add winner
    scores.push({
      playerId: winnerId,
      tileCount: 0,
      scoreChange: winnersPositivePoints,
      isWinner: true
    });

    onSubmit(scores);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">End Round</h2>
            <p className="text-sm text-gray-500">Who won this round?</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Winner Selection */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {players.map(player => (
              <button
                key={player.id}
                onClick={() => setWinnerId(player.id)}
                className={`
                  relative p-4 rounded-xl border-2 text-left transition-all
                  ${winnerId === player.id 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 ring-offset-1' 
                    : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}
                `}
              >
                {winnerId === player.id && (
                  <div className="absolute top-2 right-2 text-yellow-500">
                    <Trophy size={16} fill="currentColor" />
                  </div>
                )}
                <span className="font-bold text-gray-900 block truncate">{player.name}</span>
                <span className="text-xs text-gray-500 font-medium">
                  {winnerId === player.id ? 'Winner' : 'Select as Winner'}
                </span>
              </button>
            ))}
          </div>

          {/* Loser Scores */}
          {winnerId && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle size={16} className="text-gray-400" />
                Enter remaining tile totals
              </h3>
              {players
                .filter(p => p.id !== winnerId)
                .map(player => (
                  <div key={player.id} className="flex items-center gap-4">
                    <div 
                      className="w-3 h-12 rounded-full" 
                      style={{ backgroundColor: player.color }} 
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{player.name}</p>
                    </div>
                    <div className="w-32">
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="0"
                        value={tileCounts[player.id] || ''}
                        onChange={(e) => handleTileInput(player.id, e.target.value)}
                        className="w-full px-4 py-2 text-right text-lg font-mono rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <Button 
            fullWidth 
            onClick={handleSubmit}
            disabled={!winnerId}
            className={!winnerId ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Calculate & Save Round
          </Button>
        </div>
      </div>
    </div>
  );
};
