'use client';

import { useState, useCallback } from 'react';
import {
  extractText,
  ExtractionResult,
  ExtractionProgress,
  detectFileType,
  getFileTypeName,
} from '@/lib/extractors';

interface UseFileExtractorReturn {
  /** Current extraction progress */
  progress: ExtractionProgress | null;
  /** Most recent extraction result */
  result: ExtractionResult | null;
  /** Error message if extraction failed */
  error: string | null;
  /** Whether extraction is in progress */
  isExtracting: boolean;
  /** Extract text from a file */
  extract: (file: File) => Promise<ExtractionResult | null>;
  /** Clear current state */
  clear: () => void;
}

export function useFileExtractor(): UseFileExtractorReturn {
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const extract = useCallback(async (file: File): Promise<ExtractionResult | null> => {
    // Reset state
    setError(null);
    setResult(null);
    setIsExtracting(true);

    // Validate file type first
    const fileType = detectFileType(file);
    if (!fileType) {
      const errorMsg = `Unsupported file type: "${file.name}". Please use PDF, DOCX, EPUB, TXT, or image files.`;
      setError(errorMsg);
      setProgress({
        stage: 'error',
        progress: 0,
        message: errorMsg,
      });
      setIsExtracting(false);
      return null;
    }

    setProgress({
      stage: 'loading',
      progress: 0,
      message: `Preparing to extract text from ${getFileTypeName(fileType)}...`,
    });

    try {
      const extractionResult = await extractText(file, setProgress);

      setResult(extractionResult);
      setProgress({
        stage: 'complete',
        progress: 1,
        message: `Successfully extracted ${extractionResult.wordCount.toLocaleString()} words`,
      });

      return extractionResult;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to extract text from file';
      setError(errorMsg);
      setProgress({
        stage: 'error',
        progress: 0,
        message: errorMsg,
      });
      return null;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const clear = useCallback(() => {
    setProgress(null);
    setResult(null);
    setError(null);
    setIsExtracting(false);
  }, []);

  return {
    progress,
    result,
    error,
    isExtracting,
    extract,
    clear,
  };
}
