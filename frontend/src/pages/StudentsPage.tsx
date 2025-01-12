import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StudentList } from '../components/students/StudentList';
import { StudentForm } from '../components/students/StudentForm';
import { Title, Alert, Button, Modal, Group, Text, Stack } from '@mantine/core';
import { useStudentStore } from '../stores';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { Student } from '../types';

export function StudentsPage() {
  const { students, loading, error, fetchStudents, addStudent, updateStudent, deleteStudent, resetStudentStats } = useStudentStore();
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSubmit = useCallback(async (values: { name: string; avatar_url?: string }) => {
    if (selectedStudent) {
      await updateStudent(selectedStudent.id, { 
        name: values.name,
        avatar_url: values.avatar_url
      });
    } else {
      await addStudent({ 
        name: values.name,
        avatar_url: values.avatar_url
      });
    }
    setFormModalOpen(false);
    setSelectedStudent(null);
  }, [selectedStudent, updateStudent, addStudent]);

  const handleEdit = useCallback((student: Student) => {
    setSelectedStudent(student);
    setFormModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setFormModalOpen(false);
    setSelectedStudent(null);
  }, []);

  const handleDeleteClick = useCallback((student: Student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (studentToDelete) {
      await deleteStudent(studentToDelete.id);
      setDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  }, [deleteStudent, studentToDelete]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setStudentToDelete(null);
  }, []);

  const handleReset = useCallback(async (student: Student) => {
    await resetStudentStats(student.id);
  }, [resetStudentStats]);

  const handleAddClick = useCallback(() => {
    setSelectedStudent(null);
    setFormModalOpen(true);
  }, []);

  const modalTitle = useMemo(() => 
    selectedStudent ? 'Edit Student' : 'Add New Student',
    [selectedStudent]
  );

  const errorAlert = useMemo(() => {
    if (!error) return null;
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        {error}
      </Alert>
    );
  }, [error]);

  if (error) {
    return errorAlert;
  }

  return (
    <>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Students</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleAddClick}
        >
          Add Student
        </Button>
      </Group>

      <StudentList 
        students={students} 
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onReset={handleReset}
        loading={loading}
        error={error}
      />

      <Modal
        opened={formModalOpen}
        onClose={handleModalClose}
        title={modalTitle}
      >
        <StudentForm
          student={selectedStudent}
          onSubmit={handleSubmit}
          onCancel={handleModalClose}
        />
      </Modal>

      <Modal
        opened={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Delete Student"
      >
        <Stack>
          <Text>Are you sure you want to delete {studentToDelete?.name}? This action cannot be undone.</Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={handleDeleteCancel}>Cancel</Button>
            <Button color="red" onClick={handleDeleteConfirm}>Delete</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
