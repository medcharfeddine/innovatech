import { useState, useCallback } from 'react';

export const useAsync = <T,>(asyncFunction: (...args: any[]) => Promise<T>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (...params: any[]) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction(...params);
      setData(result);
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Something went wrong';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  return { loading, error, data, execute };
};
