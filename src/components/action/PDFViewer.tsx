/**
 * PDFViewer Component
 *
 * A production-ready PDF viewer for Action Center apps.
 * Uses react-pdf to render PDFs as canvas elements, which works
 * in Action Center's sandboxed iframe (unlike native PDF viewers).
 *
 * @example
 * ```tsx
 * import { PDFViewer } from '@/components/action';
 *
 * <PDFViewer file={pdfUrl} />
 * ```
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// Configure PDF.js worker - use CDN for reliable loading in production
// The ?url import works in dev but fails when deployed to CDN with hashed filenames
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface PDFViewerProps {
  /** URL or blob URL of the PDF file */
  file: string | null;
  /** Additional CSS classes */
  className?: string;
  /** Maximum height of the viewer (default: 600px) */
  maxHeight?: number;
  /** Show page navigation controls (default: true) */
  showControls?: boolean;
}

export function PDFViewer({
  file,
  className,
  maxHeight = 600,
  showControls = true,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container width for responsive PDF sizing
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Subtract padding (16px * 2 = 32px)
        setContainerWidth(containerRef.current.clientWidth - 32);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  }, []);

  const onLoadError = useCallback((err: Error) => {
    setLoading(false);
    setError(err.message);
  }, []);

  const goToPrevPage = useCallback(() => {
    setPageNumber(prev => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  }, [numPages]);

  // No file provided
  if (!file) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border-2 border-dashed', className)}>
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground">No PDF file provided</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 text-center bg-destructive/10 rounded-lg', className)}>
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-sm font-medium text-destructive mb-2">Failed to load PDF</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col border rounded-lg overflow-hidden bg-background', className)}>
      {/* Navigation Controls */}
      {showControls && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[80px] text-center">
              {loading ? 'Loading...' : `${pageNumber} / ${numPages}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* PDF Content */}
      <div
        ref={containerRef}
        className="flex justify-center overflow-auto bg-muted/20 p-4"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <Document
          file={file}
          onLoadSuccess={onLoadSuccess}
          onLoadError={onLoadError}
          loading={
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
            </div>
          }
          error=""
          noData=""
        >
          <Page
            pageNumber={pageNumber}
            width={containerWidth || undefined}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-lg"
            loading=""
            error=""
            noData=""
          />
        </Document>
      </div>
    </div>
  );
}

export default PDFViewer;
