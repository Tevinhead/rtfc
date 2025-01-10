import React, { useCallback, useMemo, useState } from 'react';
import { TextInput, Stack, Button, Group, Box, Text, Avatar } from '@mantine/core';
import { useForm } from '@mantine/form';
import { motion } from 'framer-motion';
import { Student } from '../../types';

interface StudentFormProps {
  student?: Student | null;
  onSubmit: (values: { name: string; avatar_url?: string }) => void;
  onCancel: () => void;
}

export function StudentForm({ student, onSubmit, onCancel }: StudentFormProps) {
  const [isPreviewHovered, setIsPreviewHovered] = useState(false);

  // Memoize validation function
  const validateName = useCallback((value: string) => {
    return !value ? 'Name is required' : null;
  }, []);

  // Memoize form configuration
  const formConfig = useMemo(() => ({
    initialValues: {
      name: student?.name || '',
      avatar_url: student?.avatar_url || '',
    },
    validate: {
      name: validateName,
    },
  }), [student?.name, student?.avatar_url, validateName]);

  const form = useForm(formConfig);

  // Memoize form submission handler
  const handleSubmit = useCallback((values: { name: string; avatar_url?: string }) => {
    onSubmit(values);
  }, [onSubmit]);

  const currentAvatarUrl = form.values.avatar_url;
  const currentName = form.values.name;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="xl">
        {/* Avatar Preview */}
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <Text 
            size="sm" 
            fw={500}
            style={{
              background: 'linear-gradient(45deg, #4dabf7, #228be6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Avatar Preview
          </Text>
          <Box
            style={{
              position: 'relative',
              padding: '4px',
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #4dabf7, #228be6)',
              boxShadow: '0 0 10px rgba(77, 171, 247, 0.3)',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setIsPreviewHovered(true)}
            onMouseLeave={() => setIsPreviewHovered(false)}
          >
            <motion.div
              animate={isPreviewHovered ? {
                scale: 1.05,
                rotate: [-3, 3, -3]
              } : {
                scale: 1,
                rotate: 0
              }}
              transition={{
                duration: 0.3
              }}
            >
              <Avatar
                src={currentAvatarUrl || undefined}
                alt={currentName}
                radius="xl"
                size={120}
                style={{
                  border: '2px solid #fff',
                  boxShadow: '0 0 10px rgba(77, 171, 247, 0.2)'
                }}
              >
                {(!currentAvatarUrl && currentName) ? currentName.charAt(0) : ''}
              </Avatar>
            </motion.div>
          </Box>
        </Box>

        <TextInput
          label="Name"
          placeholder="Enter student name"
          required
          styles={{
            label: {
              background: 'linear-gradient(45deg, #4dabf7, #228be6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 500
            }
          }}
          {...form.getInputProps('name')}
        />
        <TextInput
          label="Avatar URL"
          placeholder="https://example.com/photo.jpg"
          styles={{
            label: {
              background: 'linear-gradient(45deg, #4dabf7, #228be6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 500
            }
          }}
          {...form.getInputProps('avatar_url')}
        />
        <Group justify="flex-end" mt="md">
          <Button 
            variant="light" 
            onClick={onCancel}
            style={{
              transition: 'all 0.2s ease'
            }}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="gradient"
            gradient={{ from: '#4dabf7', to: '#228be6' }}
            style={{
              transition: 'all 0.2s ease'
            }}
          >
            {student ? 'Update' : 'Add'} Student
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
