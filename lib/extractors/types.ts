export type SupportedFileType = 'pdf' | 'docx' | 'epub' | 'image' | 'text';

export interface ExtractionResult {
  text: string;
  fileType: SupportedFileType;
  fileName: string;
  wordCount: number;
}

export interface ExtractionProgress {
  stage: 'loading' | 'processing' | 'complete' | 'error';
  progress: number; // 0-1
  message: string;
}

export type ProgressCallback = (progress: ExtractionProgress) => void;

/**
 * Detect file type from file extension and MIME type.
 */
export function detectFileType(file: File): SupportedFileType | null {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // PDF
  if (extension === 'pdf' || mimeType === 'application/pdf') {
    return 'pdf';
  }

  // DOCX
  if (
    extension === 'docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'docx';
  }

  // EPUB
  if (extension === 'epub' || mimeType === 'application/epub+zip') {
    return 'epub';
  }

  // Plain text
  if (
    extension === 'txt' ||
    extension === 'md' ||
    mimeType.startsWith('text/')
  ) {
    return 'text';
  }

  // Images
  if (
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(extension || '') ||
    mimeType.startsWith('image/')
  ) {
    return 'image';
  }

  return null;
}

/**
 * Get human-readable file type name.
 */
export function getFileTypeName(type: SupportedFileType): string {
  const names: Record<SupportedFileType, string> = {
    pdf: 'PDF Document',
    docx: 'Word Document',
    epub: 'EPUB Book',
    image: 'Image (OCR)',
    text: 'Plain Text',
  };
  return names[type];
}
