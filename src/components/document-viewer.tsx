/**
 * DocumentViewer Component
 * 
 * Dynamically renders different document types (images, PDFs, text files)
 * based on their content type with proper containment and error handling.
 */
import React, { useState, useEffect } from 'react';
import { PDFViewer } from '@/components/action';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Image, FileX } from 'lucide-react';
interface DocumentViewerProps {
  url: string | null;
  path: string;
  contentType: 'image' | 'pdf' | 'text' | 'unknown';
  loading?: boolean;
  error?: string | null;
}
export function DocumentViewer({ 
  url, 
  path, 
  contentType, 
  loading = false, 
  error = null 
}: DocumentViewerProps) {
  const [textContent, setTextContent] = useState<string>('');
  const [textLoading, setTextLoading] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
  // Fetch text content for text files
  useEffect(() => {
    if (contentType === 'text' && url && !loading && !error) {
      setTextLoading(true);
      setTextError(null);
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch text content: ${response.statusText}`);
          }
          return response.text();
        })
        .then(text => {
          setTextContent(text);
          setTextError(null);
        })
        .catch(err => {
          console.error('Error fetching text content:', err);
          setTextError(err instanceof Error ? err.message : 'Failed to load text content');
        })
        .finally(() => {
          setTextLoading(false);
        });
    }
  }, [contentType, url, loading, error]);
  const getIcon = () => {
    switch (contentType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileX className="h-4 w-4" />;
    }
  };
  const getFileName = () => {
    return path.split('/').pop() || path;
  };
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {getIcon()}
          {getFileName()}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0 p-4">
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <FileX className="h-4 w-4" />
            <AlertDescription>
              Failed to load document: {error}
            </AlertDescription>
          </Alert>
        )}
        {!loading && !error && url && (
          <div className="max-h-[400px] overflow-auto">
            {contentType === 'image' && (
              <img 
                src={url} 
                alt={getFileName()} 
                className="max-w-full h-auto rounded border"
                onError={(e) => {
                  console.error('Image failed to load:', path);
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {contentType === 'pdf' && (
              <div className="border rounded">
                <PDFViewer 
                  file={url} 
                  maxHeight={400}
                  showControls={true}
                />
              </div>
            )}
            {contentType === 'text' && (
              <div>
                {textLoading && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                )}
                {textError && (
                  <Alert variant="destructive">
                    <FileX className="h-4 w-4" />
                    <AlertDescription>
                      {textError}
                    </AlertDescription>
                  </Alert>
                )}
                {!textLoading && !textError && textContent && (
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-3 rounded border font-mono overflow-auto max-h-80">
                    {textContent}
                  </pre>
                )}
              </div>
            )}
            {contentType === 'unknown' && (
              <div className="text-center p-8 text-muted-foreground">
                <FileX className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Preview not available for this file type</p>
                <a 
                  href={url} 
                  download 
                  className="text-primary hover:underline text-sm mt-2 inline-block"
                >
                  Download file
                </a>
              </div>
            )}
          </div>
        )}
        {!loading && !error && !url && (
          <div className="text-center p-8 text-muted-foreground">
            <FileX className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No document available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}