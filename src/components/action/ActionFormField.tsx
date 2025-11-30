/**
 * ActionFormField Component
 *
 * Renders a form field based on action schema property type.
 * Handles different VB data types and provides appropriate input controls.
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { VBDataType, getInputType } from '@/types/action-schema';

interface ActionFormFieldProps {
  /** Field name (used for form data key) */
  name: string;
  /** Display label */
  label: string;
  /** VB data type */
  type: VBDataType | string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Current field value */
  value: unknown;
  /** Callback when value changes */
  onChange: (value: unknown) => void;
  /** Field description/help text */
  description?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether field is a list */
  isList?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Renders an appropriate input control based on VB data type
 *
 * @example
 * ```tsx
 * <ActionFormField
 *   name="reviewerComments"
 *   label="Comments"
 *   type={VBDataType.String}
 *   required={true}
 *   value={formData.reviewerComments}
 *   onChange={(value) => updateField('reviewerComments', value)}
 * />
 * ```
 */
export function ActionFormField({
  name,
  label,
  type,
  required = false,
  readOnly = false,
  value,
  onChange,
  description,
  placeholder,
  isList = false,
  className = '',
}: ActionFormFieldProps) {
  const inputType = getInputType(type);

  // Handle checkbox/boolean type
  if (type === VBDataType.Boolean) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Checkbox
          id={name}
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(checked)}
          disabled={readOnly}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor={name}
            className={`text-sm font-medium ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}
          >
            {label}
          </Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    );
  }

  // Handle textarea for long strings
  const isLongText = type === VBDataType.String && (
    name.toLowerCase().includes('comment') ||
    name.toLowerCase().includes('description') ||
    name.toLowerCase().includes('note') ||
    name.toLowerCase().includes('reason') ||
    name.toLowerCase().includes('message')
  );

  if (isLongText) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label
          htmlFor={name}
          className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
        >
          {label}
        </Label>
        <Textarea
          id={name}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          disabled={readOnly}
          rows={4}
        />
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    );
  }

  // Handle number types
  if (inputType === 'number') {
    const isInteger = [
      VBDataType.Int16,
      VBDataType.Int32,
      VBDataType.Int64,
      VBDataType.UInt16,
      VBDataType.UInt32,
      VBDataType.UInt64,
    ].includes(type as VBDataType);

    return (
      <div className={`space-y-2 ${className}`}>
        <Label
          htmlFor={name}
          className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
        >
          {label}
        </Label>
        <Input
          id={name}
          type="number"
          value={value ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '') {
              onChange(undefined);
            } else {
              onChange(isInteger ? parseInt(val, 10) : parseFloat(val));
            }
          }}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          disabled={readOnly}
          step={isInteger ? 1 : 'any'}
        />
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    );
  }

  // Handle date type
  if (type === VBDataType.DateOnly) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label
          htmlFor={name}
          className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
        >
          {label}
        </Label>
        <Input
          id={name}
          type="date"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
        />
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    );
  }

  // Default text input
  return (
    <div className={`space-y-2 ${className}`}>
      <Label
        htmlFor={name}
        className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
      >
        {label}
      </Label>
      <Input
        id={name}
        type={inputType}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        disabled={readOnly}
      />
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

/**
 * Read-only display field for input values
 */
export function ReadOnlyField({
  label,
  value,
  className = '',
}: {
  label: string;
  value: unknown;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-muted-foreground">{label}</Label>
      <div className="px-3 py-2 bg-muted rounded-md text-sm">
        {value === null || value === undefined ? (
          <span className="text-muted-foreground italic">Not provided</span>
        ) : (
          String(value)
        )}
      </div>
    </div>
  );
}
