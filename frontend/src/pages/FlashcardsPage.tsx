import React, { useState, useCallback, useMemo } from 'react';
import { Title, Alert, Stack, Tabs, Card, Center, Box } from '@mantine/core';
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
    <Box>
      <Center py="xl">
        <Card w="90%" maw={1200}>
          <Stack gap="lg">
            <Title order={2}>Flashcards</Title>
            <Card>
              <Tabs value={activeTab} onChange={handleTabChange} color="teal">
                <Tabs.List>
                  <Tabs.Tab value="packs">Packs</Tabs.Tab>
                  <Tabs.Tab value="cards">All Cards</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="packs" pt="md">
                  {tabPanels.packs}
                </Tabs.Panel>

                <Tabs.Panel value="cards" pt="md">
                  {tabPanels.cards}
                </Tabs.Panel>
              </Tabs>
            </Card>
          </Stack>
        </Card>
      </Center>
    </Box>
  );
});
