export interface Player {
  id: string;
  name: string;
  totalScore: number;
  color: string; // Assigned visual color
}

export interface RoundScore {
  playerId: string;
  tileCount: number; // Raw tiles remaining
  scoreChange: number; // Calculated +/- score
  isWinner: boolean;
}

export interface Round {
  id: string;
  number: number;
  timestamp: number;
  scores: RoundScore[];
}

export interface GameState {
  players: Player[];
  rounds: Round[];
  status: 'setup' | 'playing' | 'finished';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
