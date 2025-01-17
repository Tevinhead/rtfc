type SetErrorState = (state: { error: string | null; loading: boolean }) => void;

export const handleStoreError = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  return 'An unknown error occurred';
};

export const wrapStoreAction = async <T>(
  operation: string,
  setState: SetErrorState,
  action: () => Promise<T>
): Promise<T> => {
  setState({ loading: true, error: null });
  try {
    const result = await action();
    setState({ loading: false, error: null });
    return result;
  } catch (err) {
    const errorMessage = handleStoreError(err);
    console.error(`Failed to ${operation}:`, err);
    setState({ 
      error: errorMessage,
      loading: false 
    });
    throw new Error(errorMessage);
  }
};