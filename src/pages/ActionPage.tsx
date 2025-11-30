/**
 * Example Action Page
 *
 * Demonstrates how to build an Action App using the provided hooks and components.
 * The form renders immediately - no loading state needed.
 */

import React from 'react';
import { useActionContext } from '@/hooks/useActionContext';
import { OutcomeButtons } from '@/components/action/OutcomeButtons';
import { ActionFormField, ReadOnlyField } from '@/components/action/ActionFormField';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileCheck, AlertCircle, Beaker } from 'lucide-react';
import { VBDataType } from '@/types/action-schema';

/**
 * Initial data for the form (shown before Action Center sends data)
 */
const INITIAL_DATA = {
  applicantName: 'John Doe',
  loanAmount: 50000,
  creditScore: 720,
};

/**
 * Example Action App Page
 *
 * Pattern:
 * 1. Render form immediately with initialData
 * 2. When Action Center sends data, form updates automatically
 * 3. No loading state needed
 */
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

  // Check if required outputs are filled
  const isFormValid = formData.riskFactor !== undefined && formData.riskFactor !== '';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Preview mode indicator (when not in Action Center) */}
        {!hasActionCenterData && (
          <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
            <Beaker className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200">Preview Mode</AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              Showing initial data. In Action Center, real task data will be displayed.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <FileCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {taskData?.title || 'Loan Application Review'}
            </h1>
            <p className="text-muted-foreground">
              Review the information and provide your decision
            </p>
          </div>
        </div>

        {/* Read-only notice for completed tasks */}
        {isReadOnly && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Read Only</AlertTitle>
            <AlertDescription>
              This task has already been completed and cannot be modified.
            </AlertDescription>
          </Alert>
        )}

        {/* Inputs Section - Read-only data from automation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Details</CardTitle>
            <CardDescription>
              Information provided by the automation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReadOnlyField
              label="Applicant Name"
              value={formData.applicantName}
            />
            <ReadOnlyField
              label="Loan Amount"
              value={formData.loanAmount ? `$${Number(formData.loanAmount).toLocaleString()}` : undefined}
            />
            <ReadOnlyField
              label="Credit Score"
              value={formData.creditScore}
            />
          </CardContent>
        </Card>

        {/* Outputs Section - User must fill in */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Assessment</CardTitle>
            <CardDescription>
              Please provide the following information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActionFormField
              name="riskFactor"
              label="Risk Factor"
              type={VBDataType.Int32}
              required={true}
              readOnly={isReadOnly}
              value={formData.riskFactor}
              onChange={(value) => updateField('riskFactor', value)}
              description="Enter a risk assessment value (1-10)"
              placeholder="Enter risk factor"
            />

            <ActionFormField
              name="reviewerComments"
              label="Reviewer Comments"
              type={VBDataType.String}
              required={false}
              readOnly={isReadOnly}
              value={formData.reviewerComments}
              onChange={(value) => updateField('reviewerComments', value)}
              description="Add any notes about your decision"
              placeholder="Enter your comments..."
            />
          </CardContent>
        </Card>

        {/* Outcomes Section */}
        {!isReadOnly && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Decision</CardTitle>
              <CardDescription>
                Select an action to complete this task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OutcomeButtons
                outcomes={['Approve', 'Reject']}
                onOutcome={completeTask}
                disabled={!isFormValid}
              />
              {!isFormValid && (
                <p className="text-sm text-muted-foreground mt-3">
                  Please fill in all required fields before submitting.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ActionPage;
