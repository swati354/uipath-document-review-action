import { useState, useEffect } from 'react';
import { uipath } from '../lib/uipath';
import type { RawEntityGetResponse } from 'uipath-sdk';

export interface UseUiPathEntitiesReturn {
  entities: RawEntityGetResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all Data Fabric entities
 */
export function useUiPathEntities(): UseUiPathEntitiesReturn {
  const [entities, setEntities] = useState<RawEntityGetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await uipath.entities.getAll();
      setEntities(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  return { entities, loading, error, refetch: fetchEntities };
}
