/**
 * Action Schema Types for UiPath Action Apps
 *
 * These types define the structure of Action Center task data
 * and the schema for inputs, outputs, inOuts, and outcomes.
 */

/**
 * Event names for Action Center communication
 */
export enum EVENT_NAMES {
  INIT = 'init',
  COMPLETE = 'complete',
  DATACHANGED = 'dataChanged',
  LOADAPP = 'loadApp',
  ERROR = 'error',
  TOKENREFRESHED = 'tokenRefreshed',
  LANGUAGECHANGED = 'languageChanged',
  THEMECHANGED = 'themeChanged',
}

/**
 * Task status in Action Center
 */
export enum TaskStatus {
  Unassigned = 'Unassigned',
  Pending = 'Pending',
  Completed = 'Completed',
}

/**
 * Theme options from Action Center
 */
export enum Theme {
  AutoTheme = 'autoTheme',
  Light = 'light',
  Dark = 'dark',
  LightHC = 'light-hc',
  DarkHC = 'dark-hc',
}

/**
 * Data received from Action Center
 */
export interface ActionCenterData {
  taskId: number;
  title: string;
  status: TaskStatus;
  isReadOnly: boolean;
  data: Record<string, unknown>;
  action: string;
  organizationUnitId: number;
  organizationUnitFullyQualifiedName: string;
  baseUrl: string;
  orgName: string;
  tenantName: string;
  token: string;
  language: string;
  theme: Theme;
  newToken?: string;
  newLanguage?: string;
  newTheme?: string;
}

/**
 * VB.NET data types for action schema properties
 */
export enum VBDataType {
  String = 'System.String',
  Int32 = 'System.Int32',
  Boolean = 'System.Boolean',
  Int16 = 'System.Int16',
  Int64 = 'System.Int64',
  UInt16 = 'System.UInt16',
  UInt32 = 'System.UInt32',
  UInt64 = 'System.UInt64',
  Double = 'System.Double',
  Single = 'System.Single',
  Decimal = 'System.Decimal',
  DateOnly = 'System.DateOnly',
  Guid = 'System.Guid',
  Object = 'System.Object',
  DataTable = 'System.Data.DataTable',
  IResource = 'UiPath.Platform.ResourceHandling.IResource',
}

/**
 * Data type namespace
 */
export enum VBDataTypeNamespace {
  System = 'system',
  Custom = 'custom',
}

/**
 * Collection types for list properties
 */
export enum VBCollectionType {
  Array = 'Array',
  List = 'List',
  DataTable = 'DataTable',
}

/**
 * Property schema for action schema fields
 */
export interface ActionPropertySchema {
  name: string;
  type: VBDataType | string;
  isList: boolean;
  typeNamespace: VBDataTypeNamespace;
  customType: string | null;
  required: boolean;
  properties?: ActionPropertySchema[];
  collectionDataType?: VBCollectionType | null;
  description?: string;
}

/**
 * Complete action schema structure
 */
export interface ActionSchema {
  description: string;
  inputs: ActionPropertySchema[];
  outputs: ActionPropertySchema[];
  inOuts: ActionPropertySchema[];
  outcomes: ActionPropertySchema[];
}

/**
 * Simplified action schema for component usage
 */
export interface SimpleActionSchema {
  description: string;
  inputs: Record<string, { type: string; required?: boolean }>;
  outputs: Record<string, { type: string; required?: boolean }>;
  inOuts: Record<string, { type: string; required?: boolean }>;
  outcomes: string[];
}

/**
 * Form data type - dynamic based on schema
 */
export type ActionFormData = Record<string, unknown>;

/**
 * Props for action context
 */
export interface ActionContextState {
  taskData: ActionCenterData | null;
  formData: ActionFormData;
  isLoading: boolean;
  isReadOnly: boolean;
  theme: Theme;
  language: string;
  error: Error | null;
}

/**
 * Helper to determine if a field is an input (read-only)
 */
export function isInputField(schema: ActionSchema, fieldName: string): boolean {
  return schema.inputs.some(input => input.name === fieldName);
}

/**
 * Helper to determine if a field is an output (user must fill)
 */
export function isOutputField(schema: ActionSchema, fieldName: string): boolean {
  return schema.outputs.some(output => output.name === fieldName);
}

/**
 * Helper to determine if a field is an inOut (editable pre-filled)
 */
export function isInOutField(schema: ActionSchema, fieldName: string): boolean {
  return schema.inOuts.some(inOut => inOut.name === fieldName);
}

/**
 * Helper to get outcome names from schema
 */
export function getOutcomeNames(schema: ActionSchema): string[] {
  return schema.outcomes.map(outcome => outcome.name);
}

/**
 * Convert VBDataType to HTML input type
 */
export function getInputType(vbType: VBDataType | string): string {
  switch (vbType) {
    case VBDataType.Int16:
    case VBDataType.Int32:
    case VBDataType.Int64:
    case VBDataType.UInt16:
    case VBDataType.UInt32:
    case VBDataType.UInt64:
      return 'number';
    case VBDataType.Double:
    case VBDataType.Single:
    case VBDataType.Decimal:
      return 'number';
    case VBDataType.Boolean:
      return 'checkbox';
    case VBDataType.DateOnly:
      return 'date';
    default:
      return 'text';
  }
}
