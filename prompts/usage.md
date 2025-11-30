# Usage

## CRITICAL: ACTION SCHEMA RULES

**When the user provides an image along with their request:**
- **ONLY use the fields the user explicitly mentions in their text prompt**

**Example:**
- User says: "Input should be nsn and quantity. Output should be comment."
- User provides an image showing 10 different fields
- **CORRECT**: Create action schema with ONLY `nsn`, `quantity` as inputs and `comment` as output. 
- **WRONG**: Extract all 10 fields from the image and add them to the action chema

**The user's text description is the ONLY source of truth for action schema fields.**

---

## CRITICAL: DO NOT MODIFY THESE FILES

The following files are pre-configured and MUST NOT be modified, regenerated, or rewritten:

| File | Reason |
|------|--------|
| `src/hooks/useActionContext.ts` | Action Center integration hook. Already configured. |
| `src/lib/uipath.ts` | UiPath SDK client configuration. Already configured. |
| `src/components/action/*` | Pre-built Action components. Use as-is. |
| `src/types/action-schema.ts` | Type definitions. Use as-is. |

**ONLY modify:** `src/pages/ActionPage.tsx` and `action-schema.json`

## Overview

UiPath Action App Template - Frontend React application for building Human-in-the-Loop (HITL) interfaces that integrate with UiPath Action Center.

- Frontend: React + TypeScript + ShadCN UI + Tailwind
- Integration: UiPath SDK TaskEventsService for Action Center communication
- Architecture: Pure frontend - runs inside Action Center iframe

## CRITICAL: Wait for Action Center Data Before API Calls

**API calls (bucket files, entity records, external services) MUST only execute after Action Center has provided real data.**

The `useActionContext` hook provides `hasActionCenterData` to indicate when real data is available:

```typescript
const { formData, hasActionCenterData } = useActionContext({ initialData: INITIAL_DATA });

// WRONG - calls API with mock data, fails, then calls again with real data
useEffect(() => {
  fetchDocuments(formData.bucketId);  // Runs immediately with mock bucketId!
}, [formData.bucketId]);

// CORRECT - only call API after Action Center sends real data
useEffect(() => {
  if (!hasActionCenterData) return;  // Guard: skip if using mock data
  fetchDocuments(formData.bucketId);
}, [hasActionCenterData, formData.bucketId]);
```

**Why this matters:**
- Initial render uses `initialData` (mock values like `bucketId: 123456`)
- API calls with mock IDs fail (404, auth errors, etc.)
- When Action Center sends real data, API calls succeed
- Without the guard, users see error states from the failed mock calls

**Apply this pattern to:**
- Bucket file fetching (`useBucketFile`)
- Entity record queries (`useEntityRecords`)
- Any external API calls that depend on task data

## Key Pattern: No Loading State

**IMPORTANT:** Action Apps render immediately with initial data. There is NO loading state for the form itself.
- Form displays right away with `initialData` values
- When Action Center sends real data, the form updates automatically
- This works in all environments: local dev, nucleus preview, and Action Center
- **However**, API-dependent content (documents, entity data) should show loading states while fetching

## What is an Action App?

An Action App is a web application that:
1. **Receives data** from an automated process (inputs, inOuts)
2. **Displays a UI** for human review/interaction
3. **Collects user input** (outputs, modified inOuts)
4. **Captures a decision** (outcomes like Approve/Reject)
5. **Returns data** to the automation workflow

## Action Schema (action-schema.json)

Every Action App MUST have an `action-schema.json` file in the project root that defines the data contract:

```json
{
  "inputs": {
    "type": "object",
    "properties": {
      "applicantName": { "type": "string", "required": true },
      "loanAmount": { "type": "number", "required": true }
    }
  },
  "outputs": {
    "type": "object",
    "properties": {
      "riskFactor": { "type": "integer", "required": true },
      "reviewerComments": { "type": "string" }
    }
  },
  "inOuts": {
    "type": "object",
    "properties": {}
  },
  "outcomes": {
    "type": "object",
    "properties": {
      "Approve": { "type": "string" },
      "Reject": { "type": "string" }
    }
  }
}
```

### Schema Rules

| Category | Description | Editable |
|----------|-------------|----------|
| `inputs` | Read-only data from automation | No (disabled) |
| `outputs` | Data user must provide | Yes |
| `inOuts` | Pre-filled, user can edit | Yes |
| `outcomes` | Decision buttons (Approve, Reject, etc.) | N/A |

### Property Types

| Type | Description |
|------|-------------|
| `string` | Text input |
| `number` | Decimal number |
| `integer` | Whole number |
| `boolean` | Checkbox/switch |
| `date` | Date picker |

### Schema Naming Rules
1. Use **camelCase** for property names: `applicantName`, `loanAmount`
2. **ALWAYS** have at least one outcome for task completion
3. Never use reserved keywords: `result`, `Result`

## useActionContext Hook

Main hook for Action Center integration. **No loading state needed.**

```typescript
import { useActionContext } from '@/hooks/useActionContext';

export function ActionPage() {
  const {
    taskData,              // Task metadata from Action Center (null until received)
    formData,              // Form state (inputs + outputs + inOuts)
    isReadOnly,            // Whether task is read-only (completed)
    hasActionCenterData,   // Whether Action Center has sent data yet
    updateField,           // Update a single field
    completeTask,          // Complete with outcome
  } = useActionContext({
    // Initial data shown immediately (before Action Center sends data)
    initialData: {
      applicantName: 'Test User',
      loanAmount: 25000,
    }
  });

  // NO loading check needed - form renders immediately

  return (
    <div>
      {/* Preview banner (shown before Action Center sends data) */}
      {!hasActionCenterData && (
        <div className="bg-yellow-100 p-2">Preview Mode</div>
      )}

      {/* Display inputs (read-only) */}
      <p>Applicant: {formData.applicantName}</p>
      <p>Loan Amount: ${formData.loanAmount}</p>

      {/* Collect outputs */}
      <input
        type="number"
        value={formData.riskFactor || ''}
        onChange={(e) => updateField('riskFactor', parseInt(e.target.value))}
        disabled={isReadOnly}
      />

      {/* Outcome buttons */}
      <button onClick={() => completeTask('Approve')}>Approve</button>
      <button onClick={() => completeTask('Reject')}>Reject</button>
    </div>
  );
}
```

## Using UiPath SDK Hooks (Entity Data, Buckets, etc.)

**CRITICAL:** When using SDK hooks like `useEntityRecords`, `useUiPathEntities`, or `useBucketFile`, you MUST wait for Action Center to initialize the SDK before making any API calls.

The SDK is initialized with proper credentials only AFTER Action Center sends data. If you call SDK methods before this, they will fail with 404 errors.

### Correct Pattern

```typescript
import { useActionContext } from '@/hooks/useActionContext';
import { useEntityRecords } from '@/hooks/useEntityRecords';

export function ActionPage() {
  const {
    formData,
    hasActionCenterData,  // TRUE only after SDK is initialized
    // ...
  } = useActionContext({ initialData: { entityName: 'SampleEntity' } });

  const { records, fetchByName, loading, error } = useEntityRecords();

  // CORRECT: Pass enabled: hasActionCenterData to skip fetch until SDK is ready
  useEffect(() => {
    if (formData.entityName) {
      fetchByName(formData.entityName as string, {
        enabled: hasActionCenterData  // Only fetch when SDK is initialized
      });
    }
  }, [hasActionCenterData, formData.entityName, fetchByName]);

  // ...
}
```

### Wrong Pattern (causes duplicate calls and errors)

```typescript
// WRONG: Fetching without checking hasActionCenterData
useEffect(() => {
  if (formData.entityName) {
    fetchByName(formData.entityName as string);  // First call fails, second succeeds
  }
}, [formData.entityName, fetchByName]);
```

### Why This Matters

1. Component mounts with `initialData` (e.g., `entityName: 'SampleEntity'`)
2. If you fetch immediately, SDK uses empty/default credentials → **404 error**
3. Action Center sends credentials → `initializeSdk()` runs → SDK is ready
4. `hasActionCenterData` becomes `true`
5. Now SDK calls will succeed

**Rule:** Always include `hasActionCenterData` in your useEffect dependency and condition when making SDK API calls.

### Entity Record Structure

Entity records from `useEntityRecords` have a **flat structure** - all fields are at the root level:

```typescript
// Record structure from the API:
{
  id: "record-123",           // Always present
  name: "John Doe",           // Custom field
  email: "john@example.com",  // Custom field
  status: "Active",           // Custom field
  // ... all other fields at root level
}
```

**IMPORTANT:** Do NOT look for data in `record.properties` or `record.data` - those don't exist. Access fields directly: `record.name`, `record.email`, etc.

```typescript
// CORRECT: Access fields directly
records.map(record => (
  <tr key={record.id}>
    <td>{record.name}</td>
    <td>{record.email}</td>
  </tr>
))

// WRONG: Looking for nested properties
record.properties?.name  // undefined - does NOT exist!
record.data?.name        // undefined - does NOT exist!
```

To display all fields dynamically:
```typescript
// Get all field names except 'id'
const fieldNames = Object.keys(records[0] || {}).filter(key => key !== 'id');

// Render table headers
{fieldNames.map(field => <th key={field}>{field}</th>)}

// Render table rows
{records.map(record => (
  <tr key={record.id}>
    {fieldNames.map(field => (
      <td key={field}>{String(record[field] ?? '')}</td>
    ))}
  </tr>
))}
```

## Pre-built Components

### OutcomeButtons

Renders outcome buttons with auto-icons:

```typescript
import { OutcomeButtons } from '@/components/action/OutcomeButtons';

<OutcomeButtons
  outcomes={['Approve', 'Reject', 'Escalate']}
  onOutcome={(outcome) => completeTask(outcome)}
  disabled={!isFormValid}
/>
```

### ActionFormField

Renders form fields based on type:

```typescript
import { ActionFormField } from '@/components/action/ActionFormField';

<ActionFormField
  name="reviewerComments"
  label="Comments"
  type="string"
  required={true}
  readOnly={false}
  value={formData.reviewerComments}
  onChange={(value) => updateField('reviewerComments', value)}
/>
```

### ReadOnlyField

Displays input values (read-only):

```typescript
import { ReadOnlyField } from '@/components/action/ActionFormField';

<ReadOnlyField
  label="Applicant Name"
  value={formData.applicantName}
/>
```

### PDFViewer

Renders PDFs in Action Center's sandboxed iframe (where native PDF viewers are blocked):

```typescript
import { PDFViewer } from '@/components/action';

<PDFViewer
  file={pdfUrl}
  maxHeight={500}
  showControls={true}
/>
```

See [PDF Rendering](#pdf-rendering) section for details.

## Complete Example

```typescript
import { useActionContext } from '@/hooks/useActionContext';
import { OutcomeButtons } from '@/components/action/OutcomeButtons';
import { ReadOnlyField } from '@/components/action/ActionFormField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ActionPage() {
  const {
    formData,
    isLoading,
    isReadOnly,
    isDevMode,
    updateField,
    completeTask,
  } = useActionContext({
    // Mock data for local testing
    devMockData: {
      applicantName: 'Jane Smith',
      loanAmount: 75000,
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading task data...</p>
      </div>
    );
  }

  // Validate required outputs
  const isValid = formData.riskFactor !== undefined &&
                 formData.riskFactor >= 1 &&
                 formData.riskFactor <= 10;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Dev mode indicator */}
      {isDevMode && (
        <Alert>
          <AlertDescription>
            Running in development mode with mock data
          </AlertDescription>
        </Alert>
      )}

      {/* Application Details - Inputs (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReadOnlyField label="Applicant Name" value={formData.applicantName} />
          <ReadOnlyField label="Loan Amount" value={`$${formData.loanAmount}`} />
        </CardContent>
      </Card>

      {/* Assessment - Outputs (user fills) */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Risk Factor (1-10) *</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={formData.riskFactor || ''}
              onChange={(e) => updateField('riskFactor', parseInt(e.target.value))}
              disabled={isReadOnly}
            />
          </div>
          <div>
            <Label>Comments</Label>
            <Textarea
              value={formData.reviewerComments || ''}
              onChange={(e) => updateField('reviewerComments', e.target.value)}
              disabled={isReadOnly}
            />
          </div>
        </CardContent>
      </Card>

      {/* Decision - Outcomes */}
      {!isReadOnly && (
        <Card>
          <CardHeader>
            <CardTitle>Decision</CardTitle>
          </CardHeader>
          <CardContent>
            <OutcomeButtons
              outcomes={['Approve', 'Reject']}
              onOutcome={completeTask}
              disabled={!isValid}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

## File Structure

```
project-root/
├── action-schema.json          # REQUIRED: Action schema definition
├── src/
│   ├── lib/
│   │   └── uipath.ts           # SDK client (do not modify)
│   ├── hooks/
│   │   └── useActionContext.ts # Action Center hook (do not modify)
│   ├── components/
│   │   └── action/
│   │       ├── OutcomeButtons.tsx
│   │       ├── ActionFormField.tsx
│   │       └── ActionFormRenderer.tsx
│   ├── types/
│   │   └── action-schema.ts    # Type definitions
│   └── pages/
│       └── ActionPage.tsx      # Main action page (customize this)
```

## Development Workflow

### DO:
- Create `action-schema.json` with inputs, outputs, inOuts, outcomes
- Use `useActionContext` with `devMockData` for local testing
- Display inputs as read-only (disabled)
- Collect outputs with form fields
- Always have at least one outcome button
- Validate required outputs before enabling outcomes

### DO NOT:
- Add any fields to `action-schema.json` that the user did not explicitly specify
- Modify `src/types/action-schema.ts` - contains critical exports (getInputType, VBDataType)
- Modify `src/lib/uipath.ts` - SDK is pre-configured
- Modify `src/hooks/useActionContext.ts` - hook is ready to use
- Modify `src/components/action/*` - pre-built components
- Forget to pass `devMockData` for local testing
- Complete task without collecting required outputs

## Tech Stack

- React 18, TypeScript, Vite
- ShadCN UI, Tailwind CSS, Lucide icons
- uipath-sdk for Action Center integration

---

## Code Quality: Self-Review Before Output

**CRITICAL:** Before outputting any React component code, mentally trace through these checks:

### 1. Lifecycle Trace
Walk through: Mount → State Change → Unmount
- What runs on mount?
- What triggers re-renders?
- What could create a loop?

### 2. Hook Dependency Audit
For every `useEffect` and `useCallback`:
- Does this hook modify any value that's also in its dependency array?
- If yes → **INFINITE LOOP** - refactor immediately

### 3. Fetch-Once Verification
For any data fetching:
- Will this fetch run exactly once (or only when inputs change)?
- Is there a guard preventing duplicate fetches?

### 4. Cleanup Check
For URLs, subscriptions, timers, listeners:
- Is there a cleanup function in useEffect?
- Will cleanup run before the next effect and on unmount?

---

## React Hooks: Referential Stability

**The Core Principle:** React hooks compare dependencies by reference, not value. This means:
- `['a'] !== ['a']` (different array instances)
- `{x: 1} !== {x: 1}` (different object instances)
- `() => {} !== () => {}` (different function instances)

When a dependency changes reference, effects re-run and callbacks get new identities - even if the actual data is identical.

### The Infinite Loop Pattern

Infinite loops occur when: **Effect runs → State changes → Dependency reference changes → Effect runs again**

**Before writing any hook code, ask:**
1. Does this effect/callback modify something that's in its own dependency array?
2. Am I passing a new array/object/function reference on every render?
3. Could this create a cycle where running the effect triggers another run?

### Ensuring Stability

| Situation | Solution |
|-----------|----------|
| Arrays/objects passed to hooks | Wrap in `useMemo` |
| Functions passed to hooks | Wrap in `useCallback` |
| Values needed for cleanup but not rendering | Use `useRef` instead of state |
| One-time fetches | Add `hasFetchedRef` guard |
| Async operations | Track mounted state for cleanup |

### Quick Reference

```typescript
// Arrays/objects - memoize them
const paths = useMemo(() => [a, b, c].filter(Boolean), [a, b, c]);

// Functions - use useCallback
const handleClick = useCallback(() => doSomething(id), [id]);

// Cleanup values - use refs, not state
const urlRef = useRef<string | null>(null);

// One-time operations - use guards
const hasFetchedRef = useRef(false);
useEffect(() => {
  if (hasFetchedRef.current) return;
  hasFetchedRef.current = true;
  fetchData();
}, []);

// Async cleanup - track mounted state
useEffect(() => {
  let mounted = true;
  fetchData().then(data => { if (mounted) setData(data); });
  return () => { mounted = false; };
}, []);

// Object URLs - always cleanup
useEffect(() => {
  const url = URL.createObjectURL(blob);
  return () => URL.revokeObjectURL(url);
}, [blob]);
```

---

## Displaying Dynamic Content: File Type Detection and Rendering

When displaying content from buckets or external sources where the file type may vary, **always detect the content type and render appropriately**.

**Important:** Bucket paths often don't include file extensions (e.g., `/bucket/files/abc123` instead of `/document.pdf`). Always use the MIME type from the fetched blob as the primary detection method, with path extension as a fallback.

### Content Type Detection Pattern

```typescript
// Detect content type - MIME type takes priority over path extension
function getContentType(path: string, mimeType?: string): 'image' | 'pdf' | 'text' | 'unknown' {
  // ALWAYS check MIME type first - paths may not have extensions
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('text/')) return 'text';
  }

  // Fall back to extension only if no MIME type
  const extension = path.split('.').pop()?.toLowerCase();
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  const textExts = ['txt', 'md', 'json', 'xml', 'csv', 'log'];

  if (imageExts.includes(extension || '')) return 'image';
  if (extension === 'pdf') return 'pdf';
  if (textExts.includes(extension || '')) return 'text';

  return 'unknown';
}
```

### Fetching Content with Type Detection

When fetching files, detect the content type from the blob's MIME type:

```typescript
async function fetchDocumentWithType(url: string, path: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  // Use blob.type (MIME type) for accurate detection
  const contentType = getContentType(path, blob.type);

  return { url: blobUrl, contentType, path };
}
```

### Rendering Different Content Types

The component should receive the already-detected content type, not detect it itself:

```typescript
// Props include contentType already detected from MIME type
interface DocumentViewerProps {
  url: string;
  path: string;
  contentType: 'image' | 'pdf' | 'text' | 'unknown';
}

function DocumentViewer({ url, path, contentType }: DocumentViewerProps) {
  switch (contentType) {
    case 'image':
      return <img src={url} alt={path} className="max-w-full h-auto" />;

    case 'pdf':
      // Use react-pdf, NOT iframe
      return <PDFViewer file={url} />;

    case 'text':
      return <TextViewer url={url} />;

    default:
      return (
        <div className="text-center p-4">
          <p>Preview not available for this file type</p>
          <a href={url} download>Download file</a>
        </div>
      );
  }
}
```

### Common Mistakes

```typescript
// WRONG - assumes everything is a PDF
{documents.map(doc => <PDFViewer file={doc.url} />)}

// WRONG - assumes everything is an image
{documents.map(doc => <img src={doc.url} />)}

// WRONG - detects type from path only (paths may not have extensions)
function DocumentViewer({ url, path }) {
  const contentType = getContentType(path);  // Missing MIME type!
  // ...
}

// CORRECT - contentType detected during fetch using blob.type (MIME type)
{documents.map(doc => (
  <DocumentViewer
    url={doc.url}
    path={doc.path}
    contentType={doc.contentType}  // Already detected from MIME type
  />
))}
```

---

## PDF Rendering

Action Apps run inside Action Center's **sandboxed iframe**. Chrome's native PDF viewer is blocked, so use the pre-built `PDFViewer` component.

### Why Native Methods Don't Work

```typescript
// BROKEN - All of these fail in Action Center:
<iframe src={pdfUrl} />        // Chrome PDF viewer blocked
<object data={pdfUrl} />       // Same issue
<embed src={pdfUrl} />         // Same issue
```

### Using the Pre-built PDFViewer

```typescript
import { PDFViewer } from '@/components/action';

// Basic usage
<PDFViewer file={pdfUrl} />

// With options
<PDFViewer
  file={pdfUrl}
  className="border rounded"
  maxHeight={500}
  showControls={true}
/>
```

### PDFViewer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `file` | `string \| null` | required | URL or blob URL of the PDF |
| `className` | `string` | - | Additional CSS classes |
| `maxHeight` | `number` | 600 | Maximum height in pixels |
| `showControls` | `boolean` | true | Show page navigation |

### Important

- **DO NOT** create your own PDF viewer - use `PDFViewer` from `@/components/action`
- **DO NOT** use `<iframe>`, `<object>`, or `<embed>` for PDFs
- The component handles loading states, errors, and page navigation automatically

### PDF Worker Configuration (If Creating Custom Viewer)

If you must configure react-pdf manually, use the CDN URL for the worker:

```typescript
import { pdfjs } from 'react-pdf';

// CORRECT - CDN URL works in both development and production
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// WRONG - Vite ?url import fails when deployed (hashed filenames break loading)
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';  // Breaks in production!
```

---

## Layout Constraints for Embedded Content

When embedding documents, PDFs, images, or any external content, **always contain them within bounded containers** to prevent layout overflow.

### Container Constraints Pattern

```typescript
// WRONG - content can overflow and break layout
<div>
  <PDFViewer file={url} />
</div>

// CORRECT - bounded container with overflow handling
<div className="relative w-full max-h-[600px] overflow-auto border rounded">
  <PDFViewer file={url} />
</div>
```

### Key CSS Properties for Containment

| Property | Purpose |
|----------|---------|
| `max-h-[Npx]` | Prevents vertical overflow |
| `max-w-full` | Prevents horizontal overflow |
| `overflow-auto` | Adds scrollbars when content exceeds bounds |
| `relative` | Establishes positioning context |

### Document Grid Layout

When displaying multiple documents side-by-side:

```typescript
// CORRECT - constrained grid with equal-height cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {documents.map(doc => (
    <Card key={doc.id} className="flex flex-col h-[500px]">
      <CardHeader className="flex-shrink-0">
        <CardTitle>{doc.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0">
        <DocumentViewer url={doc.url} path={doc.path} />
      </CardContent>
    </Card>
  ))}
</div>
```

### Common Layout Mistakes

```typescript
// WRONG - no height constraint, PDF expands infinitely
<Card>
  <PDFViewer file={url} />
</Card>

// WRONG - fixed height without overflow handling
<div className="h-[400px]">
  <PDFViewer file={url} />  {/* Content gets clipped */}
</div>

// CORRECT - fixed max height WITH overflow handling
<div className="max-h-[400px] overflow-auto">
  <PDFViewer file={url} />  {/* Scrolls when needed */}
</div>
```

---

## Formatting Complex Data in Tables

When displaying data from APIs (entity records, etc.), values may be objects, arrays, or other complex types. **Always format values for human readability**.

### The Problem

API responses often contain structured data:

```typescript
// Raw API response
{
  name: "John Doe",
  recordOwner: { id: "abc-123", displayName: "Admin User" },  // Object!
  tags: ["urgent", "review"],  // Array!
  metadata: { createdAt: "2024-01-15", source: "import" }  // Nested object!
}
```

Rendering these directly shows `[object Object]` or raw JSON - not useful for users.

### Value Formatting Pattern

```typescript
/**
 * Format any value for display in a table cell.
 * Handles objects, arrays, dates, nulls, etc.
 */
function formatCellValue(value: unknown): string {
  // Null/undefined
  if (value === null || value === undefined) {
    return '-';
  }

  // Arrays - join with commas or show count
  if (Array.isArray(value)) {
    if (value.length === 0) return '-';
    if (value.length <= 3) return value.map(v => formatCellValue(v)).join(', ');
    return `${value.length} items`;
  }

  // Objects - extract display value
  if (typeof value === 'object') {
    // Common patterns for "display name" fields
    const obj = value as Record<string, unknown>;
    if ('displayName' in obj) return String(obj.displayName);
    if ('name' in obj) return String(obj.name);
    if ('title' in obj) return String(obj.title);
    if ('label' in obj) return String(obj.label);
    if ('value' in obj) return String(obj.value);
    if ('id' in obj && Object.keys(obj).length === 1) return String(obj.id);

    // Date objects
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    // Fallback: show truncated JSON or "Complex data"
    const json = JSON.stringify(obj);
    return json.length > 50 ? 'Complex data' : json;
  }

  // Booleans
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  // Dates as strings (ISO format)
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value).toLocaleDateString();
  }

  // Everything else - convert to string
  return String(value);
}
```

### Usage in Tables

```typescript
// WRONG - shows [object Object] for complex values
<td>{record.recordOwner}</td>

// WRONG - shows raw JSON
<td>{JSON.stringify(record.recordOwner)}</td>

// CORRECT - formatted for readability
<td>{formatCellValue(record.recordOwner)}</td>
```

### Complete Table Example

```typescript
function DataTable({ records }: { records: Record<string, unknown>[] }) {
  if (!records.length) return <p>No records found</p>;

  const columns = Object.keys(records[0]).filter(key => key !== 'id');

  return (
    <table className="w-full">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col} className="text-left p-2 border-b">
              {formatColumnName(col)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((record, idx) => (
          <tr key={record.id as string || idx}>
            {columns.map(col => (
              <td key={col} className="p-2 border-b">
                {formatCellValue(record[col])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Convert camelCase to Title Case
function formatColumnName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
```

### Common Data Formatting Mistakes

```typescript
// WRONG - raw value display
{records.map(r => <td>{r.owner}</td>)}  // Shows "[object Object]"

// WRONG - always stringify
{records.map(r => <td>{JSON.stringify(r.owner)}</td>)}  // Shows ugly JSON

// WRONG - assume structure without checking
{records.map(r => <td>{r.owner.name}</td>)}  // Crashes if owner is null

// CORRECT - safe formatting
{records.map(r => <td>{formatCellValue(r.owner)}</td>)}
```

---

## Deployment

Action apps are deployed to UiPath and run inside Action Center as iframes.
The app communicates with Action Center via postMessage events.

When deployed:
- `useActionContext` detects it's in an iframe and connects to Action Center
- Mock data is ignored; real task data comes from Action Center
- `completeTask()` sends the outcome back to the automation workflow
