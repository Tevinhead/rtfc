import { achievementApi } from '../services/achievementApi';
import type { StudentAchievementResponse } from '../types';

/**
 * Fetch the unlocked achievements for a given student ID.
 */
export async function getStudentAchievements(studentId: string): Promise<StudentAchievementResponse[]> {
  try {
    return await achievementApi.getStudentAchievements(studentId);
  } catch (error) {
    console.error('Error fetching student achievements:', error);
    return [];
  }
}
