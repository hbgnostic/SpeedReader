import { extractFromPDF } from './pdf';
import { extractFromDOCX } from './docx';
import { extractFromImage } from './image';
import { extractFromEPUB } from './epub';
import { extractFromText } from './text';
import {
  detectFileType,
  getFileTypeName,
  SupportedFileType,
  ExtractionResult,
  ProgressCallback,
} from './types';

export { detectFileType, getFileTypeName };
export type { SupportedFileType, ExtractionResult, ExtractionProgress, ProgressCallback } from './types';

/**
 * Extract text from a file, automatically detecting the file type.
 *
 * @param file - File to extract text from
 * @param onProgress - Optional progress callback
 * @returns Extraction result with text and metadata
 */
export async function extractText(
  file: File,
  onProgress?: ProgressCallback
): Promise<ExtractionResult> {
  const fileType = detectFileType(file);

  if (!fileType) {
    throw new Error(
      `Unsupported file type: ${file.name}. Supported formats: PDF, DOCX, EPUB, TXT, and images (PNG, JPG, etc.)`
    );
  }

  let text: string;

  switch (fileType) {
    case 'pdf':
      text = await extractFromPDF(file, onProgress);
      break;
    case 'docx':
      text = await extractFromDOCX(file, onProgress);
      break;
    case 'epub':
      text = await extractFromEPUB(file, onProgress);
      break;
    case 'image':
      text = await extractFromImage(file, onProgress);
      break;
    case 'text':
      text = await extractFromText(file, onProgress);
      break;
    default:
      throw new Error(`Extractor not implemented for: ${fileType}`);
  }

  // Basic validation
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  if (wordCount < 5) {
    throw new Error(
      `Could not extract meaningful text from this file. Only found ${wordCount} words.`
    );
  }

  return {
    text,
    fileType,
    fileName: file.name,
    wordCount,
  };
}

/**
 * Get list of accepted file extensions for file input.
 */
export function getAcceptedExtensions(): string {
  return '.pdf,.docx,.epub,.txt,.md,.png,.jpg,.jpeg,.gif,.webp,.bmp';
}

/**
 * Get list of accepted MIME types for file input.
 */
export function getAcceptedMimeTypes(): string {
  return [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/epub+zip',
    'text/plain',
    'text/markdown',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/bmp',
  ].join(',');
}
