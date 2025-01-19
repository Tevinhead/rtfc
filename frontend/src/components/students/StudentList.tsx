import React, { useState, useCallback, useMemo } from 'react';
import { Grid, TextInput, Group, Modal, Stack, Alert, useMantineTheme } from '@mantine/core';
import { StudentCard } from './StudentCard';
import { StudentStats } from './StudentStats';
import { Student } from '../../types';
import { LoadingOverlay } from '../shared/LoadingOverlay';

interface StudentListProps {
  students?: Student[];
  onSelectForBattle?: (student: Student) => void;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onReset?: (student: Student) => void;
  loading?: boolean;
  error?: string | null;
  selectedStudents?: Student[];
}

export function StudentList({ 
  students = [], 
  onSelectForBattle, 
  onEdit,
  onDelete,
  loading = false,
  error = null,
  selectedStudents = [],
  onReset
}: StudentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const theme = useMantineTheme();

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.currentTarget.value);
  }, []);

  const handleViewStats = useCallback((student: Student) => {
    setSelectedStudent(student);
  }, []);

  const handleCloseStats = useCallback(() => {
    setSelectedStudent(null);
  }, []);

  const handleBattleSelect = useCallback((student: Student) => {
    if (onSelectForBattle) {
      onSelectForBattle(student);
    }
  }, [onSelectForBattle]);

  const handleEdit = useCallback((student: Student) => {
    if (onEdit) {
      onEdit(student);
    }
  }, [onEdit]);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return students.filter(student =>
      student.name.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  return (
    <Stack gap="xl">
      {loading && <LoadingOverlay visible={true} />}

      {error && (
        <Alert color="red" title="Error">
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Group justify="space-between">
            <TextInput
              placeholder="Search students..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{ flex: 1 }}
              styles={{
                input: {
                  backgroundColor: theme.colors.custom[7],
                  color: theme.colors.custom[0],
                  border: `1px solid ${theme.colors.custom[5]}30`,
                  '&::placeholder': {
                    color: theme.colors.custom[0],
                    opacity: 0.5,
                  },
                  '&:focus': {
                    borderColor: theme.colors.custom[5],
                  },
                },
              }}
            />
          </Group>

          <Grid gutter="xl">
            {filteredStudents.map((student) => (
              <Grid.Col 
                key={student.id} 
                span={{ base: 12, sm: 6, lg: 4 }}
                style={{
                  marginBottom: theme.spacing.xl,
                }}
              >
                <StudentCard
                  student={student}
                  onViewStats={() => handleViewStats(student)}
                  onSelectForBattle={onSelectForBattle ? () => handleBattleSelect(student) : undefined}
                  onEdit={onEdit ? () => handleEdit(student) : undefined}
                  onDelete={onDelete ? () => onDelete(student) : undefined}
                  onReset={onReset ? () => onReset(student) : undefined}
                  isSelected={selectedStudents.some(s => s.id === student.id)}
                />
              </Grid.Col>
            ))}
          </Grid>

          <Modal
            opened={!!selectedStudent}
            onClose={handleCloseStats}
            title={selectedStudent?.name + "'s Statistics"}
            size="xl"
            styles={{
              header: {
                backgroundColor: theme.colors.custom[9],
                color: theme.colors.custom[0],
              },
              content: {
                backgroundColor: theme.colors.custom[9],
              },
            }}
          >
            {selectedStudent && (
              <StudentStats
                student={selectedStudent}
              />
            )}
          </Modal>
        </>
      )}
    </Stack>
  );
}
