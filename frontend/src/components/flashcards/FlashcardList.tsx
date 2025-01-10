import React, { useState, useEffect } from 'react';
import { Stack, Text, Box, TextInput, SegmentedControl, Button, Select, Flex } from '@mantine/core';
import { LoadingOverlay } from '../shared/LoadingOverlay';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { useFlashcardStore } from '../../stores/flashcardStore';
import { usePackStore } from '../../stores/packStore';
import { Flashcard, DifficultyLevel } from '../../types';
import { FlashcardForm } from './FlashcardForm';
import { FlashcardGrid } from './FlashcardGrid';
import { FlashcardTable } from './FlashcardTable';
import { useFlashcardFilters, ViewMode } from '../../hooks/useFlashcardFilters';

export function FlashcardList() {
  const { flashcards, loading, error, fetchFlashcards } = useFlashcardStore();
  const { packs, fetchPacks } = usePackStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | undefined>();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<string>('');

  const {
    searchQuery,
    setSearchQuery,
    difficultyFilter,
    setDifficultyFilter,
    sort,
    handleSortChange,
    filteredAndSortedFlashcards,
  } = useFlashcardFilters(flashcards);

  useEffect(() => {
    Promise.all([fetchFlashcards(), fetchPacks()]);
  }, [fetchFlashcards, fetchPacks]);

  useEffect(() => {
    // Set initial pack selection when packs are loaded
    if (packs.length > 0 && !selectedPackId) {
      setSelectedPackId(packs[0].id);
    }
  }, [packs, selectedPackId]);

  // Memoize handlers to prevent recreation on every render
  const handleEdit = React.useCallback((flashcard: Flashcard) => {
    setSelectedFlashcard(flashcard);
    setIsEditModalOpen(true);
  }, []);

  const handleCreate = React.useCallback(() => {
    setSelectedFlashcard(undefined);
    setIsEditModalOpen(true);
  }, []);

  // Memoize view mode change handler
  const handleViewModeChange = React.useCallback((value: string) => {
    setViewMode(value as ViewMode);
  }, []);

  // Memoize pack selection handler
  const handlePackSelect = React.useCallback((value: string | null) => {
    if (value) setSelectedPackId(value);
  }, []);

  // Memoize modal close handler
  const handleModalClose = React.useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedFlashcard(undefined);
  }, []);

  // Memoize difficulty filter handler
  const handleDifficultyChange = React.useCallback((value: string | null) => {
    if (value) setDifficultyFilter(value as DifficultyLevel | 'all');
  }, [setDifficultyFilter]);

  return (
    <ErrorBoundary>
      <Stack gap="lg">
        {error && (
          <Text c="red" ta="center" size="lg">
            Error loading flashcards: {error}
          </Text>
        )}

        <Flex gap="md" align="center">
          <Select
            label="Flashcard Pack"
            placeholder="Select a pack"
            value={selectedPackId}
            onChange={handlePackSelect}
            data={packs.map(pack => ({
              value: pack.id,
              label: pack.name
            }))}
            style={{ minWidth: 200 }}
          />
          <TextInput
            placeholder="Search flashcards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Keep inline since it's a simple event handler
            style={{ flex: 1 }}
          />
          <Select
            value={difficultyFilter}
            onChange={handleDifficultyChange}
            data={[
              { value: 'all', label: 'All Difficulties' },
              { value: DifficultyLevel.EASY, label: 'Easy' },
              { value: DifficultyLevel.MEDIUM, label: 'Medium' },
              { value: DifficultyLevel.HARD, label: 'Hard' }
            ]}
          />
          <SegmentedControl
            value={viewMode}
            onChange={handleViewModeChange}
            data={[
              { label: 'Grid', value: 'grid' },
              { label: 'List', value: 'list' }
            ]}
          />
          <Button onClick={handleCreate}>Create Flashcard</Button>
        </Flex>

        <Box pos="relative" mih={400}>
          <LoadingOverlay visible={loading} />
          {viewMode === 'grid' ? (
            <FlashcardGrid
              flashcards={filteredAndSortedFlashcards}
              onEdit={handleEdit}
            />
          ) : (
            <FlashcardTable
              flashcards={filteredAndSortedFlashcards}
              onEdit={handleEdit}
              sort={sort}
              onSortChange={handleSortChange}
            />
          )}
        </Box>

        <FlashcardForm
          flashcard={selectedFlashcard}
          packId={selectedPackId}
          opened={isEditModalOpen}
          onClose={handleModalClose}
        />
      </Stack>
    </ErrorBoundary>
  );
}
