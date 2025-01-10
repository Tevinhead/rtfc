import { useState, useMemo } from 'react';
import { Flashcard } from '../types';

export type SortField = 'difficulty' | 'success_rate' | 'created_at' | 'times_used';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'grid' | 'list';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface AdvancedFilters {
  dateRange: [Date | null, Date | null];
  successRateRange: [number, number];
  usageRange: [number, number];
}

export const INITIAL_FILTERS: AdvancedFilters = {
  dateRange: [null, null],
  successRateRange: [0, 100],
  usageRange: [0, 100],
};

export function useFlashcardFilters(flashcards: Flashcard[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sort, setSort] = useState<SortConfig>({ field: 'created_at', order: 'desc' });
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>(INITIAL_FILTERS);

  const filteredAndSortedFlashcards = useMemo(() => {
    let result = [...flashcards];

    // Apply all filters
    result = result.filter(card => {
      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!card.question.toLowerCase().includes(query) &&
            !card.answer.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Difficulty filter
      if (difficultyFilter !== 'all' && card.difficulty !== difficultyFilter) {
        return false;
      }

      // Advanced filters
      const cardDate = new Date(card.created_at);
      if (advancedFilters.dateRange[0] && cardDate < advancedFilters.dateRange[0]) return false;
      if (advancedFilters.dateRange[1] && cardDate > advancedFilters.dateRange[1]) return false;

      const successRate = card.success_rate * 100;
      if (successRate < advancedFilters.successRateRange[0] || 
          successRate > advancedFilters.successRateRange[1]) return false;

      if (card.times_used < advancedFilters.usageRange[0] || 
          card.times_used > advancedFilters.usageRange[1]) return false;

      return true;
    });

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sort.field) {
        case 'difficulty':
          comparison = a.difficulty.localeCompare(b.difficulty);
          break;
        case 'success_rate':
          comparison = a.success_rate - b.success_rate;
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'times_used':
          comparison = a.times_used - b.times_used;
          break;
      }
      return sort.order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [flashcards, searchQuery, difficultyFilter, sort, advancedFilters]);

  const handleSortChange = (field: SortField) => {
    setSort(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDifficultyFilter('all');
    setAdvancedFilters(INITIAL_FILTERS);
  };

  return {
    searchQuery,
    setSearchQuery,
    difficultyFilter,
    setDifficultyFilter,
    sort,
    handleSortChange,
    advancedFilters,
    setAdvancedFilters,
    resetFilters,
    filteredAndSortedFlashcards,
  };
}
