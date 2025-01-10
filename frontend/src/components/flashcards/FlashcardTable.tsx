import React, { useCallback, useMemo } from 'react';
import {
  Table,
  Badge,
  Text,
  ActionIcon,
  Progress,
  Group,
} from '@mantine/core';
import { IconEdit, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { Flashcard, DifficultyLevel } from '../../types';
import { SortField, SortConfig } from '../../hooks/useFlashcardFilters';

// Memoize constant objects
const DIFFICULTY_COLORS = {
  [DifficultyLevel.EASY]: 'green',
  [DifficultyLevel.MEDIUM]: 'yellow',
  [DifficultyLevel.HARD]: 'red',
} as const;

interface FlashcardTableProps {
  flashcards: Flashcard[];
  onEdit: (flashcard: Flashcard) => void;
  sort: SortConfig;
  onSortChange: (field: SortField) => void;
}

export function FlashcardTable({ 
  flashcards, 
  onEdit, 
  sort, 
  onSortChange 
}: FlashcardTableProps) {
  // Memoize handlers
  const handleEdit = useCallback((card: Flashcard) => {
    onEdit(card);
  }, [onEdit]);

  const handleSortChange = useCallback((field: SortField) => {
    onSortChange(field);
  }, [onSortChange]);

  // Memoize sort icon renderer
  const renderSortIcon = useCallback((field: SortField) => {
    if (sort.field !== field) {
      return null;
    }
    const Icon = sort.order === 'asc' ? IconArrowUp : IconArrowDown;
    return <Icon size={14} />;
  }, [sort.field, sort.order]);

  // Memoize column headers with sort functionality
  const columnHeaders = useMemo(() => ({
    difficulty: (
      <Group gap={4} onClick={() => handleSortChange('difficulty')} style={{ cursor: 'pointer' }}>
        Difficulty {renderSortIcon('difficulty')}
      </Group>
    ),
    successRate: (
      <Group gap={4} onClick={() => handleSortChange('success_rate')} style={{ cursor: 'pointer' }}>
        Success Rate {renderSortIcon('success_rate')}
      </Group>
    )
  }), [handleSortChange, renderSortIcon]);

  // Memoize row rendering function
  const renderRow = useCallback((card: Flashcard) => {
    const successRatePercentage = (card.success_rate * 100).toFixed(1);
    const successRateColor = card.success_rate > 0.7 ? 'green' : card.success_rate > 0.4 ? 'yellow' : 'red';

    return (
      <Table.Tr key={card.id}>
        <Table.Td>
          <Badge color={DIFFICULTY_COLORS[card.difficulty]}>
            {card.difficulty}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text lineClamp={2}>{card.question}</Text>
        </Table.Td>
        <Table.Td>
          <Text lineClamp={2}>{card.answer}</Text>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <Text size="sm">{successRatePercentage}%</Text>
            <Progress
              value={card.success_rate * 100}
              color={successRateColor}
              size="sm"
              w={60}
            />
          </Group>
        </Table.Td>
        <Table.Td>
          <ActionIcon
            variant="light"
            onClick={() => handleEdit(card)}
          >
            <IconEdit size={16} />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    );
  }, [handleEdit]);

  // Memoize rows
  const tableRows = useMemo(() => 
    flashcards.map(card => renderRow(card)),
    [flashcards, renderRow]
  );

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{columnHeaders.difficulty}</Table.Th>
          <Table.Th>Question</Table.Th>
          <Table.Th>Answer</Table.Th>
          <Table.Th>{columnHeaders.successRate}</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {tableRows}
      </Table.Tbody>
    </Table>
  );
}
