'use client';

import { useCallback, useState } from 'react';
import { getAcceptedExtensions, getFileTypeName, detectFileType } from '@/lib/extractors';

interface FileUploaderProps {
  /** Called when a file is selected */
  onFileSelect: (file: File) => void;
  /** Whether extraction is in progress */
  isLoading?: boolean;
  /** Current progress message */
  progressMessage?: string;
}

export function FileUploader({ onFileSelect, isLoading, progressMessage }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [onFileSelect]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
        ${isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
        ${isLoading ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
      `}
    >
      <input
        type="file"
        accept={getAcceptedExtensions()}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />

      {isLoading ? (
        <div className="space-y-3">
          <div className="w-12 h-12 mx-auto border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">{progressMessage || 'Processing...'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drop a file here or click to browse
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Supports PDF, DOCX, EPUB, TXT, and images (for OCR)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
