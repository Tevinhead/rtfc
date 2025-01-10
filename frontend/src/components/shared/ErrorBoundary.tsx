import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Title, Text, Button, Stack, Paper } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container size="sm" py="xl">
          <Paper p="xl" radius="md" withBorder>
            <Stack align="center" gap="md">
              <IconAlertTriangle size={48} stroke={1.5} color="red" />
              <Title order={2} ta="center" c="red.7">Something went wrong</Title>
              <Text c="dimmed" size="sm" ta="center" maw={400} mx="auto">
                {this.state.error?.message || 'An unexpected error occurred'}
              </Text>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <Paper withBorder p="xs" bg="gray.0" style={{ maxHeight: '200px', overflow: 'auto', width: '100%' }}>
                  <pre style={{ margin: 0, fontSize: '12px' }}>
                    <code>
                      {this.state.errorInfo.componentStack}
                    </code>
                  </pre>
                </Paper>
              )}
              <Button onClick={this.handleReset} variant="light" color="red" leftSection={<IconAlertTriangle size={16} />}>
                Try Again
              </Button>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}
