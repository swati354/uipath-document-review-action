/**
 * Utility functions for formatting data for display in tables and UI components
 */
/**
 * Format any value for display in a table cell.
 * Handles objects, arrays, dates, nulls, etc.
 */
export function formatCellValue(value: unknown): string {
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
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return String(value);
    }
  }
  // Everything else - convert to string
  return String(value);
}
/**
 * Convert camelCase to Title Case for table headers
 */
export function formatColumnName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}
/**
 * Detect content type from path and MIME type
 * MIME type takes priority over path extension
 */
export function getContentType(path: string, mimeType?: string): 'image' | 'pdf' | 'text' | 'unknown' {
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