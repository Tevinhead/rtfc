import React, { useCallback, useMemo } from 'react';
import { TextInput, Stack, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Student } from '../../types';

interface StudentFormProps {
  student?: Student | null;
  onSubmit: (values: { name: string }) => void;
  onCancel: () => void;
}

export function StudentForm({ student, onSubmit, onCancel }: StudentFormProps) {
  // Memoize validation function
  const validateName = useCallback((value: string) => {
    return !value ? 'Name is required' : null;
  }, []);

  // Memoize form configuration
  const formConfig = useMemo(() => ({
    initialValues: {
      name: student?.name || '',
    },
    validate: {
      name: validateName,
    },
  }), [student?.name, validateName]);

  const form = useForm(formConfig);

  // Memoize form submission handler
  const handleSubmit = useCallback((values: { name: string }) => {
    onSubmit(values);
  }, [onSubmit]);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="Enter student name"
          required
          {...form.getInputProps('name')}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {student ? 'Update' : 'Add'} Student
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
