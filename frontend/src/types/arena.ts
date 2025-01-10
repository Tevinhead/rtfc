import type { Student, Flashcard } from './index';

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
