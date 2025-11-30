/**
 * EntityRecordsTable Component
 * 
 * Displays UiPath Data Fabric entity records in a professional, 
 * dynamically generated table with pagination support.
 */
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCellValue, formatColumnName } from '@/lib/formatters';
import { Database, AlertCircle, ChevronDown } from 'lucide-react';
import type { EntityRecord } from 'uipath-sdk';
interface EntityRecordsTableProps {
  records: EntityRecord[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  totalCount?: number;
  entityName: string;
  onLoadMore: () => void;
}
export function EntityRecordsTable({
  records,
  loading,
  error,
  hasNextPage,
  totalCount,
  entityName,
  onLoadMore
}: EntityRecordsTableProps) {
  // Get column names from the first record, excluding 'id'
  const columns = records.length > 0 
    ? Object.keys(records[0]).filter(key => key !== 'id')
    : [];
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Entity Records: {entityName}
          {totalCount !== undefined && (
            <span className="text-sm font-normal text-muted-foreground">
              ({totalCount} total)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0 p-0">
        {loading && records.length === 0 && (
          <div className="p-6">
            <LoadingSkeleton />
          </div>
        )}
        {error && (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load entity records: {error}
              </AlertDescription>
            </Alert>
          </div>
        )}
        {!loading && !error && records.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No records found for entity "{entityName}"</p>
          </div>
        )}
        {records.length > 0 && (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {columns.map(column => (
                    <TableHead 
                      key={column}
                      className="px-3 py-2 text-xs font-medium text-muted-foreground border-b"
                    >
                      {formatColumnName(column)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record, index) => (
                  <TableRow 
                    key={record.id || index}
                    className="hover:bg-muted/50 border-b border-border"
                  >
                    {columns.map(column => (
                      <TableCell 
                        key={column}
                        className="px-3 py-2 text-sm border-b"
                      >
                        {formatCellValue(record[column])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {hasNextPage && (
              <div className="p-4 border-t bg-muted/20">
                <Button
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                      Loading more...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Load More Records
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}