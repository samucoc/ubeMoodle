/**
 * Allowed MIME types for file uploads.
 * Prevents uploading of executable or dangerous file types.
 */

const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',

  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',

  // Text
  'text/plain',
  'text/csv',
  'text/html',
  'text/css',
  'text/markdown',

  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/gzip',
  'application/x-7z-compressed',

  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/mp4',

  // Video
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',

  // Code/data
  'application/json',
  'application/xml',
  'text/xml',
]);

const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif',
  '.vbs', '.vbe', '.js', '.jse', '.ws', '.wsf', '.wsc', '.wsh',
  '.ps1', '.ps1xml', '.ps2', '.ps2xml', '.psc1', '.psc2',
  '.sh', '.bash', '.csh', '.ksh',
  '.reg', '.inf', '.lnk',
  '.dll', '.sys', '.drv',
  '.php', '.asp', '.aspx', '.jsp',
]);

/**
 * Validates that a file's MIME type is allowed and extension is safe.
 */
export function isAllowedFileType(mimeType: string, originalName: string): boolean {
  const ext = originalName.toLowerCase().substring(originalName.lastIndexOf('.'));

  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return false;
  }

  return ALLOWED_MIME_TYPES.has(mimeType.toLowerCase());
}

/**
 * Returns a human-readable error message for rejected file types.
 */
export function getFileTypeError(mimeType: string, originalName: string): string {
  const ext = originalName.toLowerCase().substring(originalName.lastIndexOf('.'));

  if (DANGEROUS_EXTENSIONS.has(ext)) {
    return `File extension "${ext}" is not allowed for security reasons`;
  }

  return `File type "${mimeType}" is not permitted. Allowed types: images, documents, audio, video, archives`;
}
