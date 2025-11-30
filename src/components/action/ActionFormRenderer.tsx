/**
 * ActionFormRenderer Component
 *
 * Automatically renders a form based on action schema.
 * Groups fields by type (inputs, outputs, inOuts) and handles read-only state.
 */

import { ActionFormField, ReadOnlyField } from './ActionFormField';
import { ActionSchema, ActionFormData, VBDataType } from '@/types/action-schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ActionFormRendererProps {
  /** Action schema defining fields */
  schema: ActionSchema;
  /** Current form data */
  formData: ActionFormData;
  /** Callback when a field value changes */
  onFieldChange: (fieldName: string, value: unknown) => void;
  /** Whether the entire form is read-only */
  readOnly?: boolean;
  /** Custom class name */
  className?: string;
  /** Show section headers */
  showSections?: boolean;
}

/**
 * Convert Pascal case to human-readable label
 */
function toLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Renders a complete form based on action schema
 *
 * @example
 * ```tsx
 * <ActionFormRenderer
 *   schema={actionSchema}
 *   formData={formData}
 *   onFieldChange={updateField}
 *   showSections={true}
 * />
 * ```
 */
export function ActionFormRenderer({
  schema,
  formData,
  onFieldChange,
  readOnly = false,
  className = '',
  showSections = true,
}: ActionFormRendererProps) {
  const hasInputs = schema.inputs.length > 0;
  const hasOutputs = schema.outputs.length > 0;
  const hasInOuts = schema.inOuts.length > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Inputs Section - Always read-only */}
      {hasInputs && (
        <FormSection
          title="Information"
          description="Data provided by the automation"
          show={showSections}
        >
          <div className="space-y-4">
            {schema.inputs.map((field) => (
              <ReadOnlyField
                key={field.name}
                label={toLabel(field.name)}
                value={formData[field.name]}
              />
            ))}
          </div>
        </FormSection>
      )}

      {/* InOuts Section - Editable pre-filled data */}
      {hasInOuts && (
        <FormSection
          title="Review & Edit"
          description="Pre-filled data that you can modify"
          show={showSections}
        >
          <div className="space-y-4">
            {schema.inOuts.map((field) => (
              <ActionFormField
                key={field.name}
                name={field.name}
                label={toLabel(field.name)}
                type={field.type as VBDataType}
                required={field.required}
                readOnly={readOnly}
                value={formData[field.name]}
                onChange={(value) => onFieldChange(field.name, value)}
                description={field.description}
                isList={field.isList}
              />
            ))}
          </div>
        </FormSection>
      )}

      {/* Outputs Section - User must fill in */}
      {hasOutputs && (
        <FormSection
          title="Your Input"
          description="Information required from you"
          show={showSections}
        >
          <div className="space-y-4">
            {schema.outputs.map((field) => (
              <ActionFormField
                key={field.name}
                name={field.name}
                label={toLabel(field.name)}
                type={field.type as VBDataType}
                required={field.required}
                readOnly={readOnly}
                value={formData[field.name]}
                onChange={(value) => onFieldChange(field.name, value)}
                description={field.description}
                isList={field.isList}
              />
            ))}
          </div>
        </FormSection>
      )}
    </div>
  );
}

/**
 * Form section with optional header
 */
function FormSection({
  title,
  description,
  show,
  children,
}: {
  title: string;
  description?: string;
  show: boolean;
  children: React.ReactNode;
}) {
  if (!show) {
    return <>{children}</>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/**
 * Compact form renderer without sections
 */
export function CompactActionForm({
  schema,
  formData,
  onFieldChange,
  readOnly = false,
}: Omit<ActionFormRendererProps, 'showSections' | 'className'>) {
  const allFields = [
    ...schema.inputs.map((f) => ({ ...f, fieldType: 'input' as const })),
    ...schema.inOuts.map((f) => ({ ...f, fieldType: 'inOut' as const })),
    ...schema.outputs.map((f) => ({ ...f, fieldType: 'output' as const })),
  ];

  return (
    <div className="space-y-4">
      {allFields.map((field) => {
        if (field.fieldType === 'input') {
          return (
            <ReadOnlyField
              key={field.name}
              label={toLabel(field.name)}
              value={formData[field.name]}
            />
          );
        }

        return (
          <ActionFormField
            key={field.name}
            name={field.name}
            label={toLabel(field.name)}
            type={field.type as VBDataType}
            required={field.required}
            readOnly={readOnly}
            value={formData[field.name]}
            onChange={(value) => onFieldChange(field.name, value)}
            description={field.description}
            isList={field.isList}
          />
        );
      })}
    </div>
  );
}
