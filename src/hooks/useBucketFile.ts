import { useState, useCallback } from 'react';
import { uipath } from '../lib/uipath';

export interface BucketFileInfo {
  uri: string;
  httpMethod: string;
  requiresAuth: boolean;
  headers: Record<string, string>;
}

export interface UseBucketFileOptions {
  bucketId: number;
  folderId: number;
  path: string;
  expiryInMinutes?: number;
}

export interface UseBucketFileReturn {
  fileInfo: BucketFileInfo | null;
  fileContent: Blob | null;
  loading: boolean;
  error: string | null;
  getReadUri: (options: UseBucketFileOptions) => Promise<BucketFileInfo | null>;
  fetchFileContent: (options: UseBucketFileOptions) => Promise<Blob | null>;
  reset: () => void;
}

/**
 * Hook to read files/images from UiPath Orchestrator Storage Buckets
 *
 * Uses the SDK's getReadUri method to get a download URL, and optionally
 * fetches the file content directly.
 *
 * @example
 * ```tsx
 * const { getReadUri, fetchFileContent, fileInfo, fileContent, loading, error } = useBucketFile();
 *
 * // Get just the download URL
 * const info = await getReadUri({ bucketId: 123, folderId: 456, path: '/images/photo.jpg' });
 * console.log(info.uri); // Direct download URL
 *
 * // Or fetch the file content directly
 * const blob = await fetchFileContent({ bucketId: 123, folderId: 456, path: '/images/photo.jpg' });
 * const imageUrl = URL.createObjectURL(blob);
 * ```
 */
export function useBucketFile(): UseBucketFileReturn {
  const [fileInfo, setFileInfo] = useState<BucketFileInfo | null>(null);
  const [fileContent, setFileContent] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReadUri = useCallback(async (options: UseBucketFileOptions): Promise<BucketFileInfo | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await uipath.buckets.getReadUri({
        bucketId: options.bucketId,
        folderId: options.folderId,
        path: options.path,
        expiryInMinutes: options.expiryInMinutes,
      });

      const info: BucketFileInfo = {
        uri: response.uri,
        httpMethod: response.httpMethod,
        requiresAuth: response.requiresAuth,
        headers: response.headers,
      };

      setFileInfo(info);
      return info;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get file read URI';
      setError(errorMessage);
      setFileInfo(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFileContent = useCallback(async (options: UseBucketFileOptions): Promise<Blob | null> => {
    setLoading(true);
    setError(null);

    try {
      // First get the read URI
      const uriResponse = await uipath.buckets.getReadUri({
        bucketId: options.bucketId,
        folderId: options.folderId,
        path: options.path,
        expiryInMinutes: options.expiryInMinutes,
      });

      const info: BucketFileInfo = {
        uri: uriResponse.uri,
        httpMethod: uriResponse.httpMethod,
        requiresAuth: uriResponse.requiresAuth,
        headers: uriResponse.headers,
      };
      setFileInfo(info);

      // Fetch the actual file content
      const fetchResponse = await fetch(uriResponse.uri, {
        method: uriResponse.httpMethod,
        headers: uriResponse.headers,
      });

      if (!fetchResponse.ok) {
        throw new Error(`Failed to fetch file: ${fetchResponse.statusText}`);
      }

      const blob = await fetchResponse.blob();
      setFileContent(blob);
      return blob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch file content';
      setError(errorMessage);
      setFileContent(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFileInfo(null);
    setFileContent(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    fileInfo,
    fileContent,
    loading,
    error,
    getReadUri,
    fetchFileContent,
    reset,
  };
}
