import { ProgressCallback } from './types';

/**
 * Extract text from an EPUB file using epub.js.
 *
 * @param file - EPUB file to extract text from
 * @param onProgress - Optional progress callback
 * @returns Extracted text content
 */
export async function extractFromEPUB(
  file: File,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.({
    stage: 'loading',
    progress: 0,
    message: 'Loading EPUB library...',
  });

  // Dynamic import
  const ePub = (await import('epubjs')).default;

  onProgress?.({
    stage: 'loading',
    progress: 0.1,
    message: 'Reading EPUB file...',
  });

  const arrayBuffer = await file.arrayBuffer();

  onProgress?.({
    stage: 'processing',
    progress: 0.2,
    message: 'Parsing EPUB structure...',
  });

  const book = ePub(arrayBuffer);
  await book.ready;

  // Access spine items (chapters/sections in reading order)
  const spine = book.spine as any;
  const textParts: string[] = [];
  const totalSections = spine.items?.length || 0;

  if (totalSections === 0) {
    throw new Error('Could not find readable content in EPUB');
  }

  let processedSections = 0;

  for (const section of spine.items || []) {
    processedSections++;
    onProgress?.({
      stage: 'processing',
      progress: 0.2 + (processedSections / totalSections) * 0.7,
      message: `Extracting section ${processedSections} of ${totalSections}...`,
    });

    try {
      // Load the section content
      const contents = await section.load(book.load.bind(book));

      // Get the document from the loaded content
      const doc = contents?.document || contents;

      if (doc?.body) {
        // Extract text content, cleaning up whitespace
        const text = doc.body.textContent || '';
        const cleanedText = text
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanedText.length > 0) {
          textParts.push(cleanedText);
        }
      }

      // Unload to free memory
      section.unload();
    } catch (err) {
      console.warn(`Failed to extract section ${processedSections}:`, err);
    }
  }

  onProgress?.({
    stage: 'complete',
    progress: 1,
    message: 'EPUB extraction complete',
  });

  // Join sections with paragraph breaks
  return textParts.join('\n\n').trim();
}
