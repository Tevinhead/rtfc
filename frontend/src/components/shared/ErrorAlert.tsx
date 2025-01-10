import React from 'react';
import { Stack, Alert, Text, Button } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

interface ErrorAlertProps { 
  error: string; 
  onRetry?: () => void;
  withRetry?: boolean;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  error, 
  onRetry, 
  withRetry = true 
}) => (
  <Alert 
    icon={<IconAlertCircle size={16} />} 
    title="Error" 
    color="red"
    variant="filled"
  >
    <Stack gap="sm">
      <Text>{error}</Text>
      {withRetry && onRetry && (
        <Button 
          variant="white" 
          color="red" 
          size="xs" 
          leftSection={<IconRefresh size={14} />}
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </Stack>
  </Alert>
);
