import React from 'react';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import { Layout } from './components/shared/Layout';
import { StudentsPage } from './pages/StudentsPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { ArenaPage } from './pages/ArenaPage';

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/arena" element={<ArenaPage />} />
            <Route path="/" element={<Navigate to="/arena" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
