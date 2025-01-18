import type { Student, MatchHistoryItem } from '../types';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  color: string;
  /** Returns true if the student meets this achievement */
  condition: (student: Student, history: MatchHistoryItem[]) => boolean;
}

/**
 * ELO-based Achievements:
 *  - 1000+ ELO => "Aspirant"
 *  - 1100+ ELO => "Challenger"
 *  - 1200+ ELO => "Gladiator"
 *  - 1300+ ELO => "Godlike"
 *
 * Win Streak Achievements:
 *  - 3 wins => "Triple Kill"
 *  - 4 wins => "Ultra Kill"
 *  - 5 wins => "Unstoppable"
 *
 * Loss Streak Achievements:
 *  - 3 losses => "Rough Patch"
 *  - 4 losses => "Down Bad"
 *  - 5 losses => "Dark Times"
 */

export const achievementsConfig: AchievementDefinition[] = [
  // ELO Achievements
  {
    id: 'elo-1000',
    title: 'Aspirant',
    description: 'Reached 1000+ ELO rating',
    color: 'green',
    condition: (student, _history) => student.elo_rating >= 1000,
  },
  {
    id: 'elo-1100',
    title: 'Challenger',
    description: 'Reached 1100+ ELO rating',
    color: 'teal',
    condition: (student, _history) => student.elo_rating >= 1100,
  },
  {
    id: 'elo-1200',
    title: 'Gladiator',
    description: 'Reached 1200+ ELO rating',
    color: 'blue',
    condition: (student, _history) => student.elo_rating >= 1200,
  },
  {
    id: 'elo-1300',
    title: 'Godlike',
    description: 'Reached 1300+ ELO rating',
    color: 'violet',
    condition: (student, _history) => student.elo_rating >= 1300,
  },

  // Win Streak Achievements
  {
    id: 'streak-3-win',
    title: 'Triple Kill',
    description: 'Won 3 matches in a row at some point',
    color: 'orange',
    condition: (student, history) => hasConsecutiveResults(history, 'win', 3),
  },
  {
    id: 'streak-4-win',
    title: 'Ultra Kill',
    description: 'Won 4 consecutive matches at some point',
    color: 'red',
    condition: (student, history) => hasConsecutiveResults(history, 'win', 4),
  },
  {
    id: 'streak-5-win',
    title: 'Unstoppable',
    description: 'Won 5 consecutive matches at some point',
    color: 'grape',
    condition: (student, history) => hasConsecutiveResults(history, 'win', 5),
  },

  // Loss Streak Achievements
  {
    id: 'streak-3-loss',
    title: 'Rough Patch',
    description: 'Had a 3-match losing streak at some point',
    color: 'gray',
    condition: (student, history) => hasConsecutiveResults(history, 'loss', 3),
  },
  {
    id: 'streak-4-loss',
    title: 'Down Bad',
    description: 'Had a 4-match losing streak at some point',
    color: 'dark',
    condition: (student, history) => hasConsecutiveResults(history, 'loss', 4),
  },
  {
    id: 'streak-5-loss',
    title: 'Dark Times',
    description: 'Had a 5-match losing streak at some point',
    color: 'black',
    condition: (student, history) => hasConsecutiveResults(history, 'loss', 5),
  },
];

/**
 * Utility function to detect consecutive results in the match history.
 * 'win' or 'loss', e.g. needed = 3 means 3 consecutive results 
 */
function hasConsecutiveResults(history: MatchHistoryItem[], result: 'win' | 'loss', needed: number) {
  let streak = 0;
  for (const match of history) {
    if (match.result === result) {
      streak++;
      if (streak >= needed) return true;
    } else {
      streak = 0;
    }
  }
  return false;
}