import { useState, useEffect } from 'react';

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      const result = await response.json();
      
      if (result.success) {
        setApiKeys(result.data);
      } else {
        setError('Failed to fetch API keys');
      }
    } catch (error) {
      setError('Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const createApiKey = async (formData) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setApiKeys([...apiKeys, result.data]);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to create API key');
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError('Failed to create API key');
      return { success: false, error: 'Failed to create API key' };
    }
  };

  const updateApiKey = async (id, formData) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...formData
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setApiKeys(apiKeys.map(key => 
          key.id === id ? result.data : key
        ));
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to update API key');
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError('Failed to update API key');
      return { success: false, error: 'Failed to update API key' };
    }
  };

  const deleteApiKey = async (id) => {
    try {
      const response = await fetch(`/api/keys?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        setApiKeys(apiKeys.filter(key => key.id !== id));
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to delete API key');
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError('Failed to delete API key');
      return { success: false, error: 'Failed to delete API key' };
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  return {
    apiKeys,
    isLoading,
    error,
    setError,
    createApiKey,
    updateApiKey,
    deleteApiKey,
    refetch: fetchApiKeys
  };
}
