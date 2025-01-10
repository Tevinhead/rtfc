import React, { useState, useCallback } from 'react';
import {
  Modal,
  Text,
  Stack,
  Group,
  Button,
  Box,
  Progress,
  Divider,
  RangeSlider,
  Kbd,
  FileInput,
  Alert,
  Select,
  TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconChartBar, IconUpload, IconDownload, IconAlertCircle, IconTrash } from '@tabler/icons-react';
import { StatsCard } from '../../shared/StatsCard';
import { Flashcard, FlashcardPack, BulkImportResult } from '../../../types';
import { AdvancedFilters, INITIAL_FILTERS } from '../../../hooks/useFlashcardFilters';
import { flashcardApi } from '../../../services/api';

interface StatsModalProps {
  opened: boolean;
  onClose: () => void;
  flashcard: Flashcard | null;
}

export function StatsModal({ opened, onClose, flashcard }: StatsModalProps) {
  return (
    <Modal
      opened={opened && !!flashcard}
      onClose={onClose}
      title={<Text fw={700}>Flashcard Statistics</Text>}
      size="lg"
    >
      {flashcard && (
        <Stack gap="md">
          <Group grow>
            <StatsCard
              title="Success Rate"
              value={`${(flashcard.success_rate * 100).toFixed(1)}%`}
              icon={<IconChartBar size={20} />}
            />
            <StatsCard
              title="Times Used"
              value={flashcard.times_used.toString()}
              icon={<IconChartBar size={20} />}
            />
          </Group>
          
          <Divider />
          
          <Box>
            <Text fw={500} mb="xs">Performance Trend</Text>
            <Box>
              <Progress
                value={(flashcard.times_correct / flashcard.times_used) * 100}
                color="green"
                size="xl"
              />
              <Group mt="xs" justify="space-between">
                <Text size="sm" c="green">Correct: {flashcard.times_correct}</Text>
                <Text size="sm" c="red">
                  Incorrect: {flashcard.times_used - flashcard.times_correct}
                </Text>
              </Group>
            </Box>
          </Box>

          <Group>
            <Text size="sm">Created: {new Date(flashcard.created_at).toLocaleDateString()}</Text>
            <Text size="sm">Last Updated: {new Date(flashcard.updated_at).toLocaleDateString()}</Text>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}

interface AdvancedFiltersModalProps {
  opened: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
}

export function AdvancedFiltersModal({
  opened,
  onClose,
  filters,
  onFiltersChange,
}: AdvancedFiltersModalProps) {
  // Memoize handlers
  const handleDateRangeChange = useCallback((value: [Date | null, Date | null]) => {
    onFiltersChange({ ...filters, dateRange: value });
  }, [filters, onFiltersChange]);

  const handleSuccessRateChange = useCallback((value: [number, number]) => {
    onFiltersChange({ ...filters, successRateRange: value });
  }, [filters, onFiltersChange]);

  const handleUsageRangeChange = useCallback((value: [number, number]) => {
    onFiltersChange({ ...filters, usageRange: value });
  }, [filters, onFiltersChange]);

  const handleReset = useCallback(() => {
    onFiltersChange(INITIAL_FILTERS);
  }, [onFiltersChange]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>Advanced Filters</Text>}
      size="lg"
    >
      <Stack gap="md">
        <Box>
          <Text fw={500} mb="xs">Date Range</Text>
          <DatePickerInput
            type="range"
            value={filters.dateRange}
            onChange={handleDateRangeChange}
            clearable
          />
        </Box>

        <Box>
          <Text fw={500} mb="xs">Success Rate Range (%)</Text>
          <RangeSlider
            value={filters.successRateRange}
            onChange={handleSuccessRateChange}
            min={0}
            max={100}
            step={5}
            marks={[
              { value: 0, label: '0%' },
              { value: 50, label: '50%' },
              { value: 100, label: '100%' }
            ]}
          />
        </Box>

        <Box>
          <Text fw={500} mb="xs">Usage Count Range</Text>
          <RangeSlider
            value={filters.usageRange}
            onChange={handleUsageRangeChange}
            min={0}
            max={100}
            step={5}
            marks={[
              { value: 0, label: '0' },
              { value: 50, label: '50' },
              { value: 100, label: '100+' }
            ]}
          />
        </Box>

        <Group justify="flex-end">
          <Button variant="light" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button onClick={onClose}>
            Apply Filters
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

interface KeyboardShortcutsModalProps {
  opened: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ opened, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>Keyboard Shortcuts</Text>}
    >
      <Stack gap="md">
        <Group>
          <Kbd>g</Kbd>
          <Text>Switch to grid view</Text>
        </Group>
        <Group>
          <Kbd>l</Kbd>
          <Text>Switch to list view</Text>
        </Group>
        <Group>
          <Kbd>/</Kbd>
          <Text>Focus search</Text>
        </Group>
        <Group>
          <Kbd>f</Kbd>
          <Text>Open advanced filters</Text>
        </Group>
        <Group>
          <Kbd>?</Kbd>
          <Text>Show this help</Text>
        </Group>
        <Group>
          <Kbd>esc</Kbd>
          <Text>Close any open modal</Text>
        </Group>
      </Stack>
    </Modal>
  );
}

interface BulkOperationsModalProps {
  opened: boolean;
  onClose: () => void;
  packs: FlashcardPack[];
  onImportComplete?: () => void;
}

interface DeleteConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType: 'flashcard' | 'pack';
  itemName?: string;
  loading?: boolean;
}

export function DeleteConfirmationModal({
  opened,
  onClose,
  onConfirm,
  itemType,
  itemName,
  loading = false,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>Delete {itemType}</Text>}
      size="sm"
    >
      <Stack gap="md">
        <Text>
          Are you sure you want to delete this {itemType}
          {itemName ? ` "${itemName}"` : ''}? This action cannot be undone.
          {itemType === 'pack' && ' All flashcards in this pack will also be deleted.'}
        </Text>

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            color="red" 
            leftSection={<IconTrash size={20} />}
            onClick={onConfirm}
            loading={loading}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

interface PackFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialName?: string;
  loading?: boolean;
  mode: 'create' | 'edit';
}

export function PackFormModal({
  opened,
  onClose,
  onSubmit,
  initialName = '',
  loading = false,
  mode,
}: PackFormModalProps) {
  const [name, setName] = useState(initialName);

  // Memoize handlers
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  }, [name, onSubmit]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>{mode === 'create' ? 'Create New Pack' : 'Edit Pack'}</Text>}
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Pack Name"
            value={name}
            onChange={handleNameChange}
            placeholder="Enter pack name"
            required
            data-autofocus
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {mode === 'create' ? 'Create Pack' : 'Save Changes'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export function BulkOperationsModal({
  opened,
  onClose,
  packs,
  onImportComplete,
}: BulkOperationsModalProps) {
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<(BulkImportResult & { success: boolean }) | null>(null);

  // Memoize handlers
  const handleDownloadTemplate = useCallback(async () => {
    try {
      const response = await flashcardApi.getImportTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'flashcard_template.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download template:', error);
    }
  }, []);

  const handleExport = useCallback(async () => {
    if (!selectedPack) return;

    try {
      const response = await flashcardApi.exportPack(selectedPack);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `flashcards_pack_${selectedPack}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export flashcards:', error);
    }
  }, [selectedPack]);

  const handleImport = useCallback(async () => {
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const response = await flashcardApi.bulkImport(file);
      const importResult: BulkImportResult & { success: boolean } = {
        ...response.data.data,
        success: response.data.data.successful > 0
      };
      setImportResult(importResult);
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Failed to import flashcards:', error);
      setImportResult({
        success: false,
        total: 0,
        successful: 0,
        failed: 0,
        errors: ['Failed to import flashcards. Please try again.'],
      });
    } finally {
      setImporting(false);
    }
  }, [file, onImportComplete]);

  const handlePackSelect = useCallback((value: string | null) => {
    setSelectedPack(value);
  }, []);

  const handleFileChange = useCallback((file: File | null) => {
    setFile(file);
  }, []);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>Bulk Operations</Text>}
      size="lg"
    >
      <Stack gap="md">
        <Box>
          <Text fw={500} mb="xs">Import Flashcards</Text>
          <Stack gap="sm">
            <Button
              leftSection={<IconDownload size={20} />}
              variant="light"
              onClick={handleDownloadTemplate}
            >
              Download Import Template
            </Button>
            <FileInput
              label="Upload CSV File"
              placeholder="Choose file"
              accept=".csv"
              value={file}
              onChange={handleFileChange}
              leftSection={<IconUpload size={20} />}
            />
            <Button
              onClick={handleImport}
              loading={importing}
              disabled={!file}
            >
              Import Flashcards
            </Button>
          </Stack>
        </Box>

        {importResult && (
          <Alert
            color={importResult.success ? 'green' : 'red'}
            title={importResult.success ? 'Import Successful' : 'Import Failed'}
            icon={<IconAlertCircle />}
          >
            <Text>Total processed: {importResult.total}</Text>
            <Text>Successfully imported: {importResult.successful}</Text>
            <Text>Failed: {importResult.failed}</Text>
            {importResult.errors.length > 0 && (
              <Box mt="xs">
                <Text fw={500}>Errors:</Text>
                <Stack gap="xs">
                  {importResult.errors.map((error, index) => (
                    <Text key={index} size="sm" c="red">
                      {error}
                    </Text>
                  ))}
                </Stack>
              </Box>
            )}
          </Alert>
        )}

        <Divider />

        <Box>
          <Text fw={500} mb="xs">Export Flashcards</Text>
          <Stack gap="sm">
            <Select
              label="Select Pack to Export"
              placeholder="Choose a pack"
              data={packs.map(pack => ({
                value: pack.id,
                label: pack.name,
              }))}
              value={selectedPack}
              onChange={handlePackSelect}
            />
            <Button
              leftSection={<IconDownload size={20} />}
              onClick={handleExport}
              disabled={!selectedPack}
            >
              Export Pack
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Modal>
  );
}
