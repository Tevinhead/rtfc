import type { ArenaMatch } from '../types/arena';
import { MatchStatus } from '../types';

interface MatchParticipant {
  student_id: string;
  elo_before: number;
  elo_after: number | null;
}

interface RawMatch {
  id: string;
  arena_id?: string;
  status: MatchStatus;
  num_rounds: number;
  rounds_completed: number;
  participants: MatchParticipant[];
  winner_ids: string[];
  created_at: string;
  updated_at: string;
}

export const transformMatchData = (match: RawMatch): ArenaMatch => {
  if (!match.participants || match.participants.length !== 2) {
    throw new Error('Invalid match data: Expected exactly 2 participants');
  }

  const transformedMatch: ArenaMatch = {
    id: match.id,
    ...(match.arena_id && { arena_id: match.arena_id }),
    status: match.status,
    num_rounds: match.num_rounds,
    rounds_completed: match.rounds_completed,
    player1_id: match.participants[0].student_id,
    player2_id: match.participants[1].student_id,
    player1_elo_before: match.participants[0].elo_before,
    player2_elo_before: match.participants[1].elo_before,
    player1_elo_after: match.participants[0].elo_after ?? undefined,
    player2_elo_after: match.participants[1].elo_after ?? undefined,
    winner_ids: match.winner_ids || [],
    created_at: match.created_at,
    updated_at: match.updated_at
  };

  return transformedMatch;
};