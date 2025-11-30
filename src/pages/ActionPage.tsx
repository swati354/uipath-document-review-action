/**
 * UiPath Document Review Action Page
 * 
 * Main entry point for the Action App with three tabs:
 * 1. Document Review - Display documents from Storage Buckets
 * 2. Entity Records - Show Data Fabric entity records in a table
 * 3. Reviewer Section - Capture reviewer input and decisions
 */
import React, { useEffect, useMemo } from 'react';
import { useActionContext } from '@/hooks/useActionContext';
import { useBucketFile } from '@/hooks/useBucketFile';
import { useEntityRecords } from '@/hooks/useEntityRecords';
import { OutcomeButtons } from '@/components/action/OutcomeButtons';
import { ActionFormField } from '@/components/action/ActionFormField';
import { DocumentViewer } from '@/components/document-viewer';
import { EntityRecordsTable } from '@/components/entity-records-table';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Database, 
  UserCheck, 
  AlertCircle, 
  Beaker 
} from 'lucide-react';
import { getContentType } from '@/lib/formatters';
import { VBDataType } from '@/types/action-schema';
/**
 * Initial data for preview mode
 */
const INITIAL_DATA = {
  bucketId: 123456,
  folderId: 789012,
  path1: '/documents/sample1.pdf',
  path2: '/documents/sample2.jpg', 
  path3: '/documents/sample3.txt',
  entityName: 'SampleEntity',
};
/**
 * Document info interface for managing document state
 */
interface DocumentInfo {
  url: string | null;
  contentType: 'image' | 'pdf' | 'text' | 'unknown';
  loading: boolean;
  error: string | null;
}
export function ActionPage() {
  const {
    taskData,
    formData,
    isReadOnly,
    hasActionCenterData,
    updateField,
    completeTask,
  } = useActionContext({
    initialData: INITIAL_DATA,
  });
  const { fetchFileContent } = useBucketFile();
  const { 
    records, 
    loading: entityLoading, 
    error: entityError, 
    hasNextPage,
    totalCount,
    fetchByName,
    loadMore 
  } = useEntityRecords();
  // Document states
  const [doc1, setDoc1] = React.useState<DocumentInfo>({ 
    url: null, contentType: 'unknown', loading: false, error: null 
  });
  const [doc2, setDoc2] = React.useState<DocumentInfo>({ 
    url: null, contentType: 'unknown', loading: false, error: null 
  });
  const [doc3, setDoc3] = React.useState<DocumentInfo>({ 
    url: null, contentType: 'unknown', loading: false, error: null 
  });
  // Document paths from form data
  const documentPaths = useMemo(() => [
    formData.path1,
    formData.path2, 
    formData.path3
  ].filter(Boolean) as string[], [formData.path1, formData.path2, formData.path3]);
  // Fetch documents when Action Center data is available
  useEffect(() => {
    if (!hasActionCenterData || !formData.bucketId || !formData.folderId) {
      return;
    }
    const fetchDocument = async (
      path: string, 
      setDoc: React.Dispatch<React.SetStateAction<DocumentInfo>>
    ) => {
      setDoc(prev => ({ ...prev, loading: true, error: null }));
      try {
        const blob = await fetchFileContent({
          bucketId: formData.bucketId as number,
          folderId: formData.folderId as number,
          path,
          expiryInMinutes: 60
        });
        if (blob) {
          const url = URL.createObjectURL(blob);
          const contentType = getContentType(path, blob.type);
          setDoc({
            url,
            contentType,
            loading: false,
            error: null
          });
        } else {
          setDoc(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Failed to fetch document' 
          }));
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setDoc(prev => ({ 
          ...prev, 
          loading: false, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        }));
      }
    };
    // Fetch each document
    if (formData.path1) {
      fetchDocument(formData.path1 as string, setDoc1);
    }
    if (formData.path2) {
      fetchDocument(formData.path2 as string, setDoc2);
    }
    if (formData.path3) {
      fetchDocument(formData.path3 as string, setDoc3);
    }
  }, [hasActionCenterData, formData.bucketId, formData.folderId, formData.path1, formData.path2, formData.path3, fetchFileContent]);
  // Fetch entity records when Action Center data is available
  useEffect(() => {
    if (!hasActionCenterData || !formData.entityName) {
      return;
    }
    fetchByName(formData.entityName as string, {
      pageSize: 50,
      expansionLevel: 1
    });
  }, [hasActionCenterData, formData.entityName, fetchByName]);
  // Cleanup document URLs on unmount
  useEffect(() => {
    return () => {
      if (doc1.url) URL.revokeObjectURL(doc1.url);
      if (doc2.url) URL.revokeObjectURL(doc2.url);
      if (doc3.url) URL.revokeObjectURL(doc3.url);
    };
  }, [doc1.url, doc2.url, doc3.url]);
  // Validation for form completion
  const isFormValid = formData.remarks && String(formData.remarks).trim().length > 0;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        {/* Preview mode indicator */}
        {!hasActionCenterData && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
            <Beaker className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200">
              Preview Mode
            </AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              Showing initial data. In Action Center, real task data will be displayed.
            </AlertDescription>
          </Alert>
        )}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {taskData?.title || 'Document Review Action'}
              </h1>
              <p className="text-muted-foreground">
                Review documents, analyze entity data, and provide your assessment
              </p>
            </div>
          </div>
          {/* Task info badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Bucket ID: {formData.bucketId}
            </Badge>
            <Badge variant="outline">
              Folder ID: {formData.folderId}
            </Badge>
            <Badge variant="outline">
              Entity: {formData.entityName}
            </Badge>
            {documentPaths.length > 0 && (
              <Badge variant="outline">
                {documentPaths.length} Document{documentPaths.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
        {/* Read-only notice */}
        {isReadOnly && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Read Only</AlertTitle>
            <AlertDescription>
              This task has already been completed and cannot be modified.
            </AlertDescription>
          </Alert>
        )}
        {/* Main content tabs */}
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document Review
            </TabsTrigger>
            <TabsTrigger value="entity" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Entity Records
            </TabsTrigger>
            <TabsTrigger value="reviewer" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Reviewer Section
            </TabsTrigger>
          </TabsList>
          {/* Document Review Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents from Storage Bucket
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documentPaths.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No document paths provided</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {formData.path1 && (
                      <DocumentViewer
                        url={doc1.url}
                        path={formData.path1 as string}
                        contentType={doc1.contentType}
                        loading={doc1.loading}
                        error={doc1.error}
                      />
                    )}
                    {formData.path2 && (
                      <DocumentViewer
                        url={doc2.url}
                        path={formData.path2 as string}
                        contentType={doc2.contentType}
                        loading={doc2.loading}
                        error={doc2.error}
                      />
                    )}
                    {formData.path3 && (
                      <DocumentViewer
                        url={doc3.url}
                        path={formData.path3 as string}
                        contentType={doc3.contentType}
                        loading={doc3.loading}
                        error={doc3.error}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Entity Records Tab */}
          <TabsContent value="entity" className="space-y-6">
            <EntityRecordsTable
              records={records}
              loading={entityLoading}
              error={entityError}
              hasNextPage={hasNextPage}
              totalCount={totalCount}
              entityName={formData.entityName as string || 'Unknown'}
              onLoadMore={loadMore}
            />
          </TabsContent>
          {/* Reviewer Section Tab */}
          <TabsContent value="reviewer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Your Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ActionFormField
                  name="remarks"
                  label="Remarks"
                  type={VBDataType.String}
                  required={true}
                  readOnly={isReadOnly}
                  value={formData.remarks}
                  onChange={(value) => updateField('remarks', value)}
                  description="Provide your detailed assessment and observations"
                  placeholder="Enter your remarks about the documents and entity data..."
                />
                {!isReadOnly && (
                  <div className="pt-4 border-t">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Decision</h3>
                      <p className="text-sm text-muted-foreground">
                        Select an outcome to complete this review task
                      </p>
                    </div>
                    <OutcomeButtons
                      outcomes={['Approve', 'Reject']}
                      onOutcome={completeTask}
                      disabled={!isFormValid}
                    />
                    {!isFormValid && (
                      <p className="text-sm text-muted-foreground mt-3">
                        Please provide remarks before submitting your decision.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © Powered by UiPath
        </div>
      </div>
    </div>
  );
}
export default ActionPage;