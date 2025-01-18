export enum DifficultyLevel {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard"
}

export enum MatchStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export enum ArenaSessionStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed"
}

export interface Student {
  id: string;
  name: string;
  elo_rating: number;
  wins: number;
  losses: number;
  total_matches: number;
  created_at: string;
  updated_at: string;
  win_rate: number;
  avatar_url?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  pack_id: string;
  difficulty: DifficultyLevel;
  times_used: number;
  times_correct: number;
  created_at: string;
  updated_at: string;
  success_rate: number;
}

export interface FlashcardPack {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MatchParticipant {
  student_id: string;
  elo_before?: number;
  elo_after?: number;
  student?: Student;
}

export interface RoundParticipant {
  student_id: string;
  elo_before?: number;
  elo_change?: number;
  answer?: string;
  student?: Student;
}

export interface Match {
  id: string;
  status: MatchStatus;
  num_rounds: number;
  rounds_completed: number;
  winner_ids?: string[];
  created_at: string;
  updated_at: string;
  participants: MatchParticipant[];
  winners?: Student[];
  rounds?: Round[];
}

export interface Round {
  id: string;
  match_id: string;
  flashcard_id: string;
  winner_ids?: string[];
  created_at: string;
  match?: Match;
  flashcard?: Flashcard;
  winners?: Student[];
  participants: RoundParticipant[];
}

// Arena Types
export interface ArenaSession {
  id: string;
  status: ArenaSessionStatus;
  num_rounds: number;
  rounds_completed: number;
  created_at: string;
  updated_at: string;
  participants?: Array<ArenaStudentStats>;
}

export interface ArenaMatch {
  id: string;
  arena_id?: string;
  status: MatchStatus;
  num_rounds: number;
  rounds_completed: number;
  player1_id: string;
  player2_id: string;
  winner_ids?: string[];
  player1_elo_before: number;
  player2_elo_before: number;
  player1_elo_after?: number;
  player2_elo_after?: number;
  created_at: string;
  updated_at: string;
}

export interface ArenaStudentStats {
  student_id: string;
  name?: string;
  elo_rating?: number;
  wins?: number;
  losses?: number;
  fights_played?: number;
  elo_change?: number;
  elo_before?: number;
  elo_after?: number;
  student?: Student;
}

// API Request/Response Types
export interface CreateArenaRequest {
  student_ids: string[];
  num_rounds: number;
}

export interface SetMatchWinnerRequest {
  winner_ids: string[];
}

export interface CreateStudentRequest {
  name: string;
  avatar_url?: string; // EXACT field to match the new backend
}

export interface CreateFlashcardRequest {
  question: string;
  answer: string;
  pack_id: string;
  difficulty?: DifficultyLevel;
}

export interface CreateFlashcardPackRequest {
  name: string;
  description?: string;
}

export interface CreateMultiplayerMatchRequest {
  player_ids: string[];
  num_rounds: number;
}

export interface AutoMatchRequest {
  num_players: number;
  num_rounds: number;
  student_id: string;
}

export interface CreateRoundRequest {
  match_id: string;
  flashcard_id: string;
}

export interface RoundWinnerRequest {
  round_id: string;
  winner_ids: string[];
}

// Bulk Operations Types
export interface BulkImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

// Flashcard Statistics Types
export interface FlashcardStats {
  total_uses: number;
  success_rate: number;
  average_winners: number;
  used_in_arenas: number;
}

export interface FlashcardUsageStats {
  id: string;
  question: string;
  usage_count: number;
  success_rate: number;
  used_in_arenas: number;
}

export interface FlashcardArenaStats {
  id: string;
  question: string;
  times_used: number;
  success_rate: number;
}

export interface MatchHistoryItem {
  match_id: string;
  date: string;
  opponent_name: string;
  old_elo: number;
  new_elo: number;
  elo_change: number;
  result: 'win' | 'loss' | 'unknown';
}

// Test Helper Types
export type ArenaParticipantTestData = Pick<ArenaStudentStats, 'student_id' | 'student' | 'elo_before' | 'elo_after' | 'wins' | 'losses'>;

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
