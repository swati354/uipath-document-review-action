# UiPath Action Schema Types Reference

This document provides a comprehensive reference for all types used in UiPath Action Apps for Human-in-the-Loop (HITL) workflows.

## Table of Contents

- [Core Concepts](#core-concepts)
- [Action Schema](#action-schema)
- [Property Types (VBDataType)](#property-types-vbdatatype)
- [Property Schema](#property-schema)
- [Action Center Data](#action-center-data)
- [Task Events Service](#task-events-service)
- [Schema Generation Guidelines](#schema-generation-guidelines)

---

## Core Concepts

### What is an Action App?

An Action App is a web application that integrates with UiPath Action Center to enable Human-in-the-Loop workflows:

1. **Receives data** from an automated process (inputs, inOuts)
2. **Displays a UI** for human review/interaction
3. **Collects user input** (outputs, modified inOuts)
4. **Captures a decision** (outcomes like Approve/Reject)
5. **Returns data** to the automation workflow

### Data Flow Categories

| Category | Direction | Editable | Description |
|----------|-----------|----------|-------------|
| `inputs` | Automation -> Human | No (read-only) | Data provided by the automation for display |
| `outputs` | Human -> Automation | Yes (required) | Data the user must provide |
| `inOuts` | Bidirectional | Yes (optional) | Pre-filled data that user can modify |
| `outcomes` | Human -> Automation | N/A | User decisions (buttons) |

---

## Action Schema

The schema that defines the structure of an Action App:

```typescript
interface ActionSchema {
  description: string;           // Description of the action
  inputs: ActionPropertySchema[];   // Read-only data from automation
  outputs: ActionPropertySchema[];  // Data user must provide
  inOuts: ActionPropertySchema[];   // Pre-filled editable data
  outcomes: ActionPropertySchema[]; // User decisions (Approve, Reject, etc.)
}
```

### Example Schema

```json
{
  "description": "Loan Application Review",
  "inputs": [
    {
      "name": "ApplicantName",
      "description": "Name of the loan applicant",
      "type": "System.String",
      "typeNamespace": "system",
      "isList": false,
      "required": true,
      "customType": null,
      "properties": [],
      "collectionDataType": null
    },
    {
      "name": "LoanAmount",
      "description": "Requested loan amount",
      "type": "System.Decimal",
      "typeNamespace": "system",
      "isList": false,
      "required": true,
      "customType": null,
      "properties": [],
      "collectionDataType": null
    }
  ],
  "outputs": [
    {
      "name": "RiskAssessment",
      "description": "Risk assessment score (1-10)",
      "type": "System.Int32",
      "typeNamespace": "system",
      "isList": false,
      "required": true,
      "customType": null,
      "properties": [],
      "collectionDataType": null
    },
    {
      "name": "ReviewerComments",
      "description": "Comments from the reviewer",
      "type": "System.String",
      "typeNamespace": "system",
      "isList": false,
      "required": false,
      "customType": null,
      "properties": [],
      "collectionDataType": null
    }
  ],
  "inOuts": [],
  "outcomes": [
    {
      "name": "Approve",
      "description": "Approve the loan application",
      "type": "System.String",
      "typeNamespace": "system",
      "isList": false,
      "required": false,
      "customType": null,
      "properties": [],
      "collectionDataType": null
    },
    {
      "name": "Reject",
      "description": "Reject the loan application",
      "type": "System.String",
      "typeNamespace": "system",
      "isList": false,
      "required": false,
      "customType": null,
      "properties": [],
      "collectionDataType": null
    }
  ]
}
```

---

## Property Types (VBDataType)

UiPath uses Visual Basic-style type names:

```typescript
enum VBDataType {
  string = 'System.String',
  int32 = 'System.Int32',
  boolean = 'System.Boolean',
  int16 = 'System.Int16',
  int64 = 'System.Int64',
  double = 'System.Double',
  decimal = 'System.Decimal',
  dateOnly = 'System.DateOnly',
  guid = 'System.Guid',
  object = 'System.Object',
  dataTable = 'System.Data.DataTable',
  iresource = 'UiPath.Platform.ResourceHandling.IResource'
}
```

### Type Mapping to HTML Input

| VBDataType | HTML Input Type | Component |
|------------|-----------------|-----------|
| `System.String` | `text` | Input / Textarea |
| `System.Int32` | `number` | Input (step=1) |
| `System.Int16` | `number` | Input (step=1) |
| `System.Int64` | `number` | Input (step=1) |
| `System.Double` | `number` | Input (step=0.01) |
| `System.Decimal` | `number` | Input (step=0.01) |
| `System.Boolean` | `checkbox` | Checkbox / Switch |
| `System.DateOnly` | `date` | DatePicker |
| `System.Guid` | `text` | Input (readonly) |
| `System.Object` | N/A | Nested form |
| `System.Data.DataTable` | N/A | Table component |
| `UiPath.Platform.ResourceHandling.IResource` | `file` | File upload (inputs only) |

---

## Property Schema

Structure for each field in the schema:

```typescript
interface ActionPropertySchema {
  name: string;                    // Property name (PascalCase)
  description: string;             // Human-readable description
  type: VBDataType | string;       // Data type
  typeNamespace: string;           // Usually 'system' or 'custom'
  isList: boolean;                 // Is this an array?
  required: boolean;               // Is this field required?
  customType: string | null;       // Custom type name if applicable
  properties: ActionPropertySchema[]; // Nested properties for objects
  collectionDataType: VBDataType | null; // Type of items if isList=true
}
```

### Nested Objects Example

```json
{
  "name": "Address",
  "description": "Applicant address",
  "type": "System.Object",
  "typeNamespace": "custom",
  "isList": false,
  "required": true,
  "customType": "AddressType",
  "properties": [
    {
      "name": "Street",
      "description": "Street address",
      "type": "System.String",
      "typeNamespace": "system",
      "isList": false,
      "required": true,
      "customType": null,
      "properties": [],
      "collectionDataType": null
    },
    {
      "name": "City",
      "description": "City name",
      "type": "System.String",
      "typeNamespace": "system",
      "isList": false,
      "required": true,
      "customType": null,
      "properties": [],
      "collectionDataType": null
    }
  ],
  "collectionDataType": null
}
```

### List/Array Example

```json
{
  "name": "PhoneNumbers",
  "description": "List of phone numbers",
  "type": "System.String",
  "typeNamespace": "system",
  "isList": true,
  "required": false,
  "customType": null,
  "properties": [],
  "collectionDataType": "System.String"
}
```

---

## Action Center Data

Data received from Action Center when the task loads:

```typescript
interface ActionCenterData {
  taskId: number;                  // Unique task identifier
  title: string;                   // Task title
  status: TaskStatus;              // Current task status
  isReadOnly: boolean;             // Whether task is read-only
  data: Record<string, unknown>;   // Contains input/inOut values
  action: string;                  // Action name
  organizationUnitId: number;      // Org unit ID
  baseUrl: string;                 // UiPath base URL
  orgName: string;                 // Organization name
  tenantName: string;              // Tenant name
  token: string;                   // Auth token for API calls
  language: string;                // User's language
  theme: Theme;                    // UI theme
  newToken?: string;               // Refreshed token
  newLanguage?: string;            // Updated language
  newTheme?: string;               // Updated theme
}
```

### Task Status

```typescript
enum TaskStatus {
  Unassigned = 0,
  Pending = 1,
  Completed = 2,
  Faulted = 3
}
```

### Theme

```typescript
enum Theme {
  Light = 'light',
  Dark = 'dark',
  AutoTheme = 'autoTheme',
  LightHighContrast = 'light-hc',
  DarkHighContrast = 'dark-hc'
}
```

---

## Task Events Service

Communication methods with Action Center:

### Initialize

```typescript
sdk.taskEvents.initializeInActionCenter();
```

Called on mount to establish communication with Action Center iframe.

### Get Task Details

```typescript
sdk.taskEvents.getTaskDetailsFromActionCenter((data: ActionCenterData) => {
  // Handle received task data
  // data.data contains inputs, inOuts values
});
```

### Data Changed

```typescript
sdk.taskEvents.dataChanged(updatedFormData);
```

Notify Action Center when form data changes (for auto-save).

### Complete Task

```typescript
sdk.taskEvents.completeTask('Approve', formData);
```

Complete the task with an outcome and final form data.

### Event Names

```typescript
enum EVENT_NAMES {
  initializeInActionCenter = 'initializeInActionCenter',
  getTaskDetailsFromActionCenter = 'getTaskDetailsFromActionCenter',
  dataChanged = 'dataChanged',
  completeTask = 'completeTask',
  refreshToken = 'refreshToken',
  themeChange = 'themeChange',
  languageChange = 'languageChange'
}
```

---

## Schema Generation Guidelines

### Naming Conventions

1. Use **PascalCase** for property names: `ApplicantName`, `LoanAmount`
2. Use descriptive names that match business terminology
3. Avoid abbreviations unless widely understood

### Reserved Keywords

Never use these as property names:
- `result`
- `Result`

### Best Practices

1. **Always have at least one outcome** - Tasks must have a way to complete
2. **Mark required fields** - Set `required: true` for mandatory fields
3. **Provide descriptions** - Help users understand what each field is for
4. **Use appropriate types** - Match VBDataType to the actual data
5. **Group related fields** - Use nested objects for complex structures

### Input vs Output vs InOut Decision Tree

```
Is the data provided by automation?
├── Yes → Is the user allowed to modify it?
│         ├── Yes → inOuts
│         └── No  → inputs
└── No  → outputs (user must provide)
```

### Common Patterns

**Approval Workflow:**
- inputs: Document details, amounts, applicant info
- outputs: Reviewer comments, approval notes
- outcomes: Approve, Reject, Escalate

**Data Entry:**
- inputs: Reference data, instructions
- outputs: All user-entered fields
- outcomes: Submit, Cancel

**Review and Edit:**
- inputs: Original document
- inOuts: Editable fields pre-filled from automation
- outputs: Additional reviewer fields
- outcomes: Confirm, Return for Changes

---

## Helper Functions

### Type Checking

```typescript
function isInputField(fieldName: string, schema: ActionSchema): boolean {
  return schema.inputs.some((p) => p.name === fieldName);
}

function isOutputField(fieldName: string, schema: ActionSchema): boolean {
  return schema.outputs.some((p) => p.name === fieldName);
}

function isInOutField(fieldName: string, schema: ActionSchema): boolean {
  return schema.inOuts.some((p) => p.name === fieldName);
}
```

### Get Outcome Names

```typescript
function getOutcomeNames(schema: ActionSchema): string[] {
  return schema.outcomes.map((o) => o.name);
}
```

### Map VBDataType to Input Type

```typescript
function getInputType(vbType: VBDataType | string): string {
  switch (vbType) {
    case VBDataType.string:
      return 'text';
    case VBDataType.int32:
    case VBDataType.int16:
    case VBDataType.int64:
    case VBDataType.double:
    case VBDataType.decimal:
      return 'number';
    case VBDataType.boolean:
      return 'checkbox';
    case VBDataType.dateOnly:
      return 'date';
    default:
      return 'text';
  }
}
```
