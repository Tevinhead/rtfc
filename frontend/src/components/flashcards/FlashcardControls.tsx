import React, { useCallback, useMemo } from 'react';
import {
  Group,
  TextInput,
  Select,
  SegmentedControl,
  ActionIcon,
  Text,
  Popover,
} from '@mantine/core';
import {
  IconSearch,
  IconFilter,
  IconKeyboard,
  IconLayoutGrid,
  IconLayoutList,
} from '@tabler/icons-react';
import { DifficultyLevel } from '../../types';
import { ViewMode, AdvancedFilters } from '../../hooks/useFlashcardFilters';

interface FlashcardControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  difficultyFilter: string;
  onDifficultyChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  advancedFilters: AdvancedFilters;
  onShowAdvancedFilters: () => void;
  onShowKeyboardShortcuts: () => void;
}

export const FlashcardControls = React.memo(function FlashcardControls({
  searchQuery,
  onSearchChange,
  difficultyFilter,
  onDifficultyChange,
  viewMode,
  onViewModeChange,
  advancedFilters,
  onShowAdvancedFilters,
  onShowKeyboardShortcuts,
}: FlashcardControlsProps) {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.currentTarget.value);
  }, [onSearchChange]);

  const handleDifficultyChange = useCallback((value: string | null) => {
    onDifficultyChange(value || 'all');
  }, [onDifficultyChange]);

  const handleViewModeChange = useCallback((value: string) => {
    onViewModeChange(value as ViewMode);
  }, [onViewModeChange]);

  const difficultyOptions = useMemo(() => [
    { value: 'all', label: 'All Difficulties' },
    { value: DifficultyLevel.EASY, label: 'Easy' },
    { value: DifficultyLevel.MEDIUM, label: 'Medium' },
    { value: DifficultyLevel.HARD, label: 'Hard' },
  ], []);

  const viewModeOptions = useMemo(() => [
    {
      value: 'grid',
      label: (
        <Group gap={4}>
          <IconLayoutGrid size={16} />
          <Text size="sm">Grid</Text>
        </Group>
      ),
    },
    {
      value: 'list',
      label: (
        <Group gap={4}>
          <IconLayoutList size={16} />
          <Text size="sm">List</Text>
        </Group>
      ),
    },
  ], []);

  const isFiltersActive = useMemo(() => 
    advancedFilters.dateRange[0] || 
    advancedFilters.successRateRange[0] !== 0 || 
    advancedFilters.usageRange[0] !== 0,
    [advancedFilters]
  );

  return (
    <Group justify="space-between" mb="md">
      <Group>
        <TextInput
          name="search"
          placeholder="Search flashcards..."
          value={searchQuery}
          onChange={handleSearchChange}
          leftSection={<IconSearch size={16} />}
          style={{ width: 300 }}
        />
        
        <Popover width={200} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <ActionIcon
              variant="light"
              size="lg"
              onClick={onShowAdvancedFilters}
              aria-label="Advanced filters"
            >
              <IconFilter size={20} />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Text size="sm">
              {isFiltersActive ? 'Filters active' : 'No filters active'}
            </Text>
          </Popover.Dropdown>
        </Popover>
      </Group>
      
      <Group>
        <ActionIcon
          variant="light"
          size="lg"
          onClick={onShowKeyboardShortcuts}
          aria-label="Keyboard shortcuts"
        >
          <IconKeyboard size={20} />
        </ActionIcon>
        
        <Select
          value={difficultyFilter}
          onChange={handleDifficultyChange}
          data={difficultyOptions}
          style={{ width: 150 }}
        />

        <SegmentedControl
          value={viewMode}
          onChange={handleViewModeChange}
          data={viewModeOptions}
        />
      </Group>
    </Group>
  );
});
