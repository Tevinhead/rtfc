import React, { useState, useCallback, useMemo } from 'react';
import { Title, Alert, Stack, Tabs } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useFlashcardStore } from '../stores/flashcardStore';
import { usePackStore } from '../stores/packStore';
import { FlashcardPacks } from '../components/flashcards/FlashcardPacks';
import { FlashcardList } from '../components/flashcards/FlashcardList';

export const FlashcardsPage = React.memo(function FlashcardsPage() {
  const { error: flashcardError } = useFlashcardStore();
  const { error: packError } = usePackStore();
  const error = flashcardError || packError;
  const [activeTab, setActiveTab] = useState<string | null>('packs');

  const handleTabChange = useCallback((value: string | null) => {
    setActiveTab(value);
  }, []);

  const errorAlert = useMemo(() => {
    if (!error) return null;
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        {error}
      </Alert>
    );
  }, [error]);

  const tabPanels = useMemo(() => ({
    packs: <FlashcardPacks />,
    cards: <FlashcardList />
  }), []);

  if (error) {
    return errorAlert;
  }

  return (
    <>
      <Title order={2} mb="lg">Flashcards</Title>
      <Stack gap="md">
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Tab value="packs">Packs</Tabs.Tab>
            <Tabs.Tab value="cards">All Cards</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="packs">
            {tabPanels.packs}
          </Tabs.Panel>

          <Tabs.Panel value="cards">
            {tabPanels.cards}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </>
  );
});
