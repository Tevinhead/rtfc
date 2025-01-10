import React, { useCallback, useMemo } from 'react';
import { Modal } from '@mantine/core';
import { FlashcardEditor } from './FlashcardEditor';
import { Flashcard } from '../../types';

interface FlashcardFormProps {
  packId: string;
  flashcard?: Flashcard;
  opened: boolean;
  onClose: () => void;
}

export const FlashcardForm = React.memo(function FlashcardForm({ 
  packId, 
  flashcard, 
  opened, 
  onClose 
}: FlashcardFormProps) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const modalTitle = useMemo(() => 
    flashcard ? 'Edit Flashcard' : 'Create New Flashcard',
    [flashcard]
  );
  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={modalTitle}
      size="xl"
    >
      <FlashcardEditor
        packId={packId}
        flashcard={flashcard}
        onClose={handleClose}
      />
    </Modal>
  );
});
