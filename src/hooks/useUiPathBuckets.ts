import { useState, useEffect } from 'react';
import { uipath } from '../lib/uipath';

export interface BucketGetResponse {
  key: string;
  name: string;
  id: number;
  description: string | null;
  folderId: number;
  folderName: string;
}

export interface UseUiPathBucketsReturn {
  buckets: BucketGetResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all Storage Buckets from UiPath Orchestrator
 */
export function useUiPathBuckets(): UseUiPathBucketsReturn {
  const [buckets, setBuckets] = useState<BucketGetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuckets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await uipath.buckets.getAll();
      setBuckets(response as BucketGetResponse[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch buckets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, []);

  return { buckets, loading, error, refetch: fetchBuckets };
}
