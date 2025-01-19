import React, { ReactNode } from 'react';
import { Paper, Text, Group, ThemeIcon, useMantineTheme } from '@mantine/core';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
}

export function StatsCard({ title, value, icon, description }: StatsCardProps) {
  const theme = useMantineTheme();
  
  return (
    <Paper 
      radius="md" 
      p="md"
      style={{
        backgroundColor: theme.colors.custom[7],
      }}
    >
      <Group justify="space-between">
        <div>
          <Text size="xs" c="custom.0" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text fw={700} size="xl" c="custom.0">
            {value}
          </Text>
          {description && (
            <Text size="xs" c="custom.0" mt={4} opacity={0.7}>
              {description}
            </Text>
          )}
        </div>
        <ThemeIcon
          size={48}
          radius="md"
          variant="filled"
          color="custom.5"
        >
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
}
