import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StudentList } from '../components/students/StudentList';
import { StudentForm } from '../components/students/StudentForm';
import { Title, Alert, Button, Modal, Group } from '@mantine/core';
import { useStudentStore } from '../stores';
import { IconAlertCircle, IconPlus } from '@tabler/icons-react';
import { Student } from '../types';

export function StudentsPage() {
  const { students, loading, error, fetchStudents, addStudent, updateStudent } = useStudentStore();
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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
    </>
  );
}
