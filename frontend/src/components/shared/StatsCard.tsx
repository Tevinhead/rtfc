import React, { ReactNode } from 'react';
import { Paper, Text, Group, ThemeIcon } from '@mantine/core';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
}

export function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
          {description && (
            <Text size="xs" c="dimmed" mt={4}>
              {description}
            </Text>
          )}
        </div>
        <ThemeIcon
          size={48}
          radius="md"
          variant="light"
        >
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
}
