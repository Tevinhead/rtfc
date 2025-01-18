import type { Student, MatchHistoryItem } from '../types';
import { achievementsConfig } from './achievementsConfig';

export function getStudentAchievements(
  student: Student,
  history: MatchHistoryItem[]
): string[] {
  return achievementsConfig
    .filter((ach) => ach.condition(student, history))
    .map((ach) => ach.id);
}