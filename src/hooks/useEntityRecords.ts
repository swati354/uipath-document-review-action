import { useState, useCallback } from 'react';
import { uipath, isSDKInitialized } from '../lib/uipath';
import type { EntityRecord, PaginatedResponse, PaginationCursor } from 'uipath-sdk';

export interface UseEntityRecordsReturn {
  records: EntityRecord[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  nextCursor?: PaginationCursor;
  totalCount?: number;
  fetchByName: (entityName: string, options?: {
    expansionLevel?: number;
    pageSize?: number;
    cursor?: PaginationCursor;
  }) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook to fetch entity records by name using UiPath Data Fabric API
 *
 * For Action Apps: This hook automatically waits for SDK initialization.
 * Calls made before Action Center sends credentials will be skipped.
 *
 * @example
 * ```tsx
 * const { records, loading, error, fetchByName, loadMore, hasNextPage } = useEntityRecords();
 *
 * // Fetch records by entity name
 * await fetchByName('MyEntity');
 *
 * // With options
 * await fetchByName('MyEntity', { expansionLevel: 1, pageSize: 50 });
 *
 * // Load more records if available
 * if (hasNextPage) {
 *   await loadMore();
 * }
 * ```
 */
export function useEntityRecords(): UseEntityRecordsReturn {
  const [records, setRecords] = useState<EntityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextCursor, setNextCursor] = useState<PaginationCursor | undefined>();
  const [totalCount, setTotalCount] = useState<number | undefined>();
  const [currentEntityName, setCurrentEntityName] = useState<string | null>(null);
  const [currentOptions, setCurrentOptions] = useState<{
    expansionLevel?: number;
    pageSize?: number;
  }>({});

  const fetchByName = useCallback(async (
    entityName: string,
    options?: {
      expansionLevel?: number;
      pageSize?: number;
      cursor?: PaginationCursor;
    }
  ) => {
    // Skip fetch if SDK is not yet initialized with Action Center credentials
    if (!isSDKInitialized()) {
      console.log('[useEntityRecords] Skipping fetch - SDK not yet initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build options object with only defined values
      const requestOptions: {
        expansionLevel?: number;
        pageSize?: number;
        cursor?: PaginationCursor;
      } = {};

      if (options?.expansionLevel !== undefined) {
        requestOptions.expansionLevel = options.expansionLevel;
      }
      if (options?.pageSize !== undefined) {
        requestOptions.pageSize = options.pageSize;
      }
      if (options?.cursor) {
        requestOptions.cursor = options.cursor;
      }

      const response = await uipath.entities.getRecordsByName(
        entityName,
        Object.keys(requestOptions).length > 0 ? requestOptions : undefined
      ) as PaginatedResponse<EntityRecord>;

      // If using cursor, append to existing records, otherwise replace
      if (options?.cursor) {
        setRecords(prev => [...prev, ...response.items]);
      } else {
        setRecords(response.items);
        setCurrentEntityName(entityName);
        setCurrentOptions({
          expansionLevel: options?.expansionLevel,
          pageSize: options?.pageSize,
        });
      }

      setHasNextPage(response.hasNextPage);
      setNextCursor(response.nextCursor);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entity records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || !nextCursor || !currentEntityName || loading) {
      return;
    }

    await fetchByName(currentEntityName, {
      ...currentOptions,
      cursor: nextCursor,
    });
  }, [hasNextPage, nextCursor, currentEntityName, currentOptions, loading, fetchByName]);

  const reset = useCallback(() => {
    setRecords([]);
    setLoading(false);
    setError(null);
    setHasNextPage(false);
    setNextCursor(undefined);
    setTotalCount(undefined);
    setCurrentEntityName(null);
    setCurrentOptions({});
  }, []);

  return {
    records,
    loading,
    error,
    hasNextPage,
    nextCursor,
    totalCount,
    fetchByName,
    loadMore,
    reset,
  };
}
