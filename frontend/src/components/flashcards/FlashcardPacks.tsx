import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Grid, 
  Card, 
  Text, 
  Button, 
  Group,
  Badge,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { motion } from 'framer-motion';
import { IconPlus, IconEdit, IconTrash, IconCards, IconSquarePlus } from '@tabler/icons-react';
import { useFlashcardStore } from '../../stores/flashcardStore';
import { usePackStore } from '../../stores/packStore';
import { FlashcardPack, Flashcard } from '../../types';
import { FlashcardForm } from './FlashcardForm';
import { DeleteConfirmationModal, PackFormModal } from './modals/FlashcardModals';

export function FlashcardPacks() {
  const { flashcards, fetchFlashcards } = useFlashcardStore();
  const { packs, loading, error, fetchPacks, addPack, updatePack, deletePack } = usePackStore();
  const [packFormOpen, setPackFormOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [flashcardModalOpen, setFlashcardModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<FlashcardPack | null>(null);
  const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | null>(null);

  useEffect(() => {
    fetchPacks();
    fetchFlashcards();
  }, [fetchPacks, fetchFlashcards]);

  // Memoize handlers
  const handlePackSubmit = useCallback(async (name: string) => {
    if (selectedPack) {
      await updatePack(selectedPack.id, { name });
    } else {
      await addPack({ name });
    }
    setPackFormOpen(false);
    setSelectedPack(null);
  }, [selectedPack, updatePack, addPack]);

  const handleDeletePack = useCallback(async () => {
    if (!selectedPack) return;
    await deletePack(selectedPack.id);
    setDeleteModalOpen(false);
    setSelectedPack(null);
  }, [selectedPack, deletePack]);

  const openEditModal = useCallback((pack: FlashcardPack) => {
    setSelectedPack(pack);
    setPackFormOpen(true);
  }, []);

  const openCreateModal = useCallback(() => {
    setSelectedPack(null);
    setPackFormOpen(true);
  }, []);

  const openDeleteModal = useCallback((pack: FlashcardPack) => {
    setSelectedPack(pack);
    setDeleteModalOpen(true);
  }, []);

  const openFlashcardModal = useCallback((pack: FlashcardPack, flashcard?: Flashcard) => {
    setSelectedPack(pack);
    setSelectedFlashcard(flashcard || null);
    setFlashcardModalOpen(true);
  }, []);

  const closePackForm = useCallback(() => {
    setPackFormOpen(false);
    setSelectedPack(null);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setSelectedPack(null);
  }, []);

  const closeFlashcardModal = useCallback(() => {
    setFlashcardModalOpen(false);
    setSelectedPack(null);
    setSelectedFlashcard(null);
  }, []);

  // Memoize helper functions
  const getPackFlashcardCount = useCallback((packId: string) => {
    return flashcards.filter(f => f.pack_id === packId).length;
  }, [flashcards]);

  // Memoize pack data transformations
  const packData = useMemo(() => packs.map((pack: FlashcardPack) => ({
    ...pack,
    flashcardCount: getPackFlashcardCount(pack.id),
    createdDate: new Date(pack.created_at).toLocaleDateString()
  })), [packs, getPackFlashcardCount]);

  return (
    <>
      <Group justify="space-between" mb="xl">
        <Text size="xl" fw={700}>Flashcard Packs</Text>
        <Button
          leftSection={<IconPlus size={20} />}
          onClick={openCreateModal}
          variant="filled"
        >
          Create Pack
        </Button>
      </Group>

      {error && (
        <Text c="red" ta="center" size="lg" mb="xl">
          Error loading flashcard packs: {error}
        </Text>
      )}

      <Grid>
        {packData.map((pack) => (
          <Grid.Col key={pack.id} span={{ base: 12, sm: 6, md: 4 }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              <Card shadow="sm" h="100%">
                <Group justify="space-between" mb="xs">
                  <Text fw={600} size="lg">{pack.name}</Text>
                  <Badge variant="light" color="blue">
                    <Group gap="xs">
                      <IconCards size={14} />
                      <Text size="xs">{pack.flashcardCount} cards</Text>
                    </Group>
                  </Badge>
                </Group>

                <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
                  {pack.description || 'No description provided'}
                </Text>

                <Group mt="auto" justify="space-between">
                  <Text size="xs" c="dimmed">
                    Created: {pack.createdDate}
                  </Text>
                  <Group gap="xs">
                    <Tooltip label="Add Flashcard">
                      <ActionIcon 
                        variant="light" 
                        color="green"
                        onClick={() => openFlashcardModal(pack)}
                      >
                        <IconSquarePlus size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Edit Pack">
                      <ActionIcon 
                        variant="light" 
                        color="blue"
                        onClick={() => openEditModal(pack)}
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete Pack">
                      <ActionIcon 
                        variant="light" 
                        color="red"
                        onClick={() => openDeleteModal(pack)}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Card>
            </motion.div>
          </Grid.Col>
        ))}
      </Grid>

      {/* Modals */}
      <PackFormModal
        opened={packFormOpen}
        onClose={closePackForm}
        onSubmit={handlePackSubmit}
        initialName={selectedPack?.name}
        loading={loading}
        mode={selectedPack ? 'edit' : 'create'}
      />

      <DeleteConfirmationModal
        opened={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeletePack}
        itemType="pack"
        itemName={selectedPack?.name}
        loading={loading}
      />

      {selectedPack && (
        <FlashcardForm
          packId={selectedPack.id}
          flashcard={selectedFlashcard || undefined}
          opened={flashcardModalOpen}
          onClose={closeFlashcardModal}
        />
      )}
    </>
  );
}
