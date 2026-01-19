import { ProgressCallback } from './types';

/**
 * Extract text from a PDF file using pdf.js.
 *
 * @param file - PDF file to extract text from
 * @param onProgress - Optional progress callback
 * @returns Extracted text content
 */
export async function extractFromPDF(
  file: File,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.({
    stage: 'loading',
    progress: 0,
    message: 'Loading PDF library...',
  });

  // Dynamic import to reduce initial bundle size
  const pdfjsLib = await import('pdfjs-dist');

  // Set up the worker
  // Using CDN for the worker to avoid build complications
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  onProgress?.({
    stage: 'loading',
    progress: 0.1,
    message: 'Reading PDF file...',
  });

  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({
    stage: 'processing',
    progress: 0.2,
    message: 'Parsing PDF structure...',
  });

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const textParts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    onProgress?.({
      stage: 'processing',
      progress: 0.2 + (pageNum / numPages) * 0.7,
      message: `Extracting page ${pageNum} of ${numPages}...`,
    });

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Reconstruct text with proper spacing
    let lastY: number | null = null;
    const pageTextParts: string[] = [];

    for (const item of textContent.items) {
      if ('str' in item) {
        // Check if this is a new line based on Y position change
        const currentY = (item as any).transform?.[5];
        if (lastY !== null && currentY !== undefined && Math.abs(currentY - lastY) > 5) {
          pageTextParts.push('\n');
        }
        pageTextParts.push(item.str);
        if (currentY !== undefined) {
          lastY = currentY;
        }
      }
    }

    textParts.push(pageTextParts.join(' '));
  }

  onProgress?.({
    stage: 'complete',
    progress: 1,
    message: 'PDF extraction complete',
  });

  // Join pages with double newline (paragraph break)
  return textParts.join('\n\n').trim();
}
