/**
 * OutcomeButtons Component
 *
 * Renders action buttons for completing Action Center tasks.
 * Each button represents a possible outcome (e.g., Approve, Reject, Escalate).
 */

import { Button } from '@/components/ui/button';
import { Check, X, AlertCircle, ArrowRight } from 'lucide-react';

interface OutcomeButtonsProps {
  /** Array of outcome names */
  outcomes: string[];
  /** Callback when an outcome is selected */
  onOutcome: (outcome: string) => void;
  /** Whether buttons should be disabled */
  disabled?: boolean;
  /** Whether task is in read-only mode */
  readOnly?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Get icon for common outcome types
 */
function getOutcomeIcon(outcome: string) {
  const lowerOutcome = outcome.toLowerCase();

  if (lowerOutcome.includes('approve') || lowerOutcome.includes('accept') || lowerOutcome.includes('confirm')) {
    return <Check className="h-4 w-4 mr-2" />;
  }
  if (lowerOutcome.includes('reject') || lowerOutcome.includes('deny') || lowerOutcome.includes('decline')) {
    return <X className="h-4 w-4 mr-2" />;
  }
  if (lowerOutcome.includes('escalate') || lowerOutcome.includes('review') || lowerOutcome.includes('pending')) {
    return <AlertCircle className="h-4 w-4 mr-2" />;
  }
  return <ArrowRight className="h-4 w-4 mr-2" />;
}

/**
 * Get button variant for common outcome types
 */
function getOutcomeVariant(outcome: string): 'default' | 'destructive' | 'outline' | 'secondary' {
  const lowerOutcome = outcome.toLowerCase();

  if (lowerOutcome.includes('approve') || lowerOutcome.includes('accept') || lowerOutcome.includes('confirm')) {
    return 'default';
  }
  if (lowerOutcome.includes('reject') || lowerOutcome.includes('deny') || lowerOutcome.includes('decline')) {
    return 'destructive';
  }
  return 'outline';
}

/**
 * Renders outcome buttons for task completion
 *
 * @example
 * ```tsx
 * <OutcomeButtons
 *   outcomes={['Approve', 'Reject', 'Escalate']}
 *   onOutcome={(outcome) => completeTask(outcome)}
 *   disabled={!isFormValid}
 * />
 * ```
 */
export function OutcomeButtons({
  outcomes,
  onOutcome,
  disabled = false,
  readOnly = false,
  className = '',
}: OutcomeButtonsProps) {
  if (readOnly || outcomes.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {outcomes.map((outcome) => (
        <Button
          key={outcome}
          variant={getOutcomeVariant(outcome)}
          onClick={() => onOutcome(outcome)}
          disabled={disabled}
          className="min-w-[120px]"
        >
          {getOutcomeIcon(outcome)}
          {outcome}
        </Button>
      ))}
    </div>
  );
}

/**
 * Simple approve/reject button pair
 */
export function ApproveRejectButtons({
  onApprove,
  onReject,
  disabled = false,
  approveLabel = 'Approve',
  rejectLabel = 'Reject',
}: {
  onApprove: () => void;
  onReject: () => void;
  disabled?: boolean;
  approveLabel?: string;
  rejectLabel?: string;
}) {
  return (
    <div className="flex gap-3">
      <Button
        variant="default"
        onClick={onApprove}
        disabled={disabled}
        className="min-w-[120px] bg-green-600 hover:bg-green-700"
      >
        <Check className="h-4 w-4 mr-2" />
        {approveLabel}
      </Button>
      <Button
        variant="destructive"
        onClick={onReject}
        disabled={disabled}
        className="min-w-[120px]"
      >
        <X className="h-4 w-4 mr-2" />
        {rejectLabel}
      </Button>
    </div>
  );
}
