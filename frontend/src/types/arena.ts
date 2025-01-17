import type { Student, Flashcard, Match } from './index';
import { ArenaSessionStatus, MatchStatus } from './index';

export interface ArenaSession {
  id: string;
  status: ArenaSessionStatus;
  num_rounds: number;
  rounds_completed: number;
  participants: Array<{
    student_id: string;
    name: string;
    elo_rating: number;
    wins: number;
    losses: number;
    fights_played: number;
    elo_change: number;
  }>;
}

export interface ArenaMatch {
  id: string;
  status: MatchStatus;
  num_rounds: number;
  rounds_completed: number;
  player1_id: string;
  player2_id: string;
  winner_ids: string[];
  player1_elo_before: number;
  player2_elo_before: number;
  player1_elo_after: number | null;
  player2_elo_after: number | null;
}

export enum ArenaStep {
  SETUP = 'setup',      // choose pack, players, rounds
  VERSUS = 'versus',    // show "VS" screen
  BATTLE = 'battle',    // show random flashcard
  ROUND_RESULT = 'round_result',
  FINAL_RESULT = 'final_result'
}

export interface ParticipantScore {
  student: Student;
  eloBefore: number;
  eloCurrent: number;
  wins: number;
  losses: number;
  fightsPlayed: number;
  totalEloChange: number;
}

export interface ValidationError {
  pack?: string;
  players?: string;
  rounds?: string;
}

export interface ArenaSetupData {
  selectedPackId: string;
  numRounds: number;
  selectedPlayerIds: string[];
}
