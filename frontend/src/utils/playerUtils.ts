import { Student } from '../types';

interface MatchPlayers {
  player1: Student;
  player2: Student;
}

export const findMatchPlayers = (
  students: Student[],
  player1Id: string,
  player2Id: string
): MatchPlayers | Error => {
  const player1 = students.find(s => s.id === player1Id);
  const player2 = students.find(s => s.id === player2Id);

  if (!player1 || !player2) {
    return new Error('Players not found');
  }

  return { player1, player2 };
};

export const createParticipantData = (
  player: Student,
  eloBefore: number
) => ({
  student_id: player.id,
  student: player,
  elo_before: eloBefore,
});