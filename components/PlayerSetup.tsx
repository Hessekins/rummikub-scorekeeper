import React, { useState } from 'react';
import { Player } from '../types';
import { Button } from './Button';
import { PLAYER_COLORS } from '../constants';
import { Plus, Trash2, Users } from 'lucide-react';

interface PlayerSetupProps {
  onStartGame: (players: Player[]) => void;
}

export const PlayerSetup: React.FC<PlayerSetupProps> = ({ onStartGame }) => {
  const [names, setNames] = useState<string[]>(['', '']); // Start with 2 empty slots

  const addPlayer = () => {
    if (names.length < 6) {
      setNames([...names, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (names.length > 2) {
      const newNames = [...names];
      newNames.splice(index, 1);
      setNames(newNames);
    }
  };

  const updateName = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleStart = () => {
    const validPlayers = names
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (validPlayers.length < 2) return;

    const players: Player[] = validPlayers.map((name, index) => ({
      id: crypto.randomUUID(),
      name,
      totalScore: 0,
      color: PLAYER_COLORS[index % PLAYER_COLORS.length],
    }));

    onStartGame(players);
  };

  const isValid = names.filter(n => n.trim().length > 0).length >= 2;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4 text-orange-600">
            <Users size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Who's Playing?</h1>
          <p className="text-gray-500 mt-2">Enter 2-6 player names to begin.</p>
        </div>

        <div className="space-y-3 mb-8">
          {names.map((name, index) => (
            <div key={index} className="flex gap-2 animate-fadeIn">
              <input
                type="text"
                placeholder={`Player ${index + 1} Name`}
                value={name}
                onChange={(e) => updateName(index, e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-800 placeholder-gray-400"
                autoFocus={index === 0}
              />
              {names.length > 2 && (
                <button
                  onClick={() => removePlayer(index)}
                  className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  aria-label="Remove player"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
          
          {names.length < 6 && (
            <button
              onClick={addPlayer}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={20} /> Add Player
            </button>
          )}
        </div>

        <Button 
          fullWidth 
          onClick={handleStart} 
          disabled={!isValid}
          className={!isValid ? "opacity-50 cursor-not-allowed" : ""}
        >
          Start Game
        </Button>
      </div>
    </div>
  );
};
