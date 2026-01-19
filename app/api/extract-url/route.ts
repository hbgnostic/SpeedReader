import { NextRequest, NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format. Please include https://' },
        { status: 400 }
      );
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SpeedReader/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Parse with JSDOM
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;

    // Extract article with Readability
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      return NextResponse.json(
        { error: 'Could not extract article content from this page. It may be behind a paywall or use JavaScript rendering.' },
        { status: 400 }
      );
    }

    // Clean up the text
    const text = article.textContent
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

    if (wordCount < 50) {
      return NextResponse.json(
        { error: 'Extracted content is too short. The page may require JavaScript or be behind a paywall.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      title: article.title || parsedUrl.hostname,
      text,
      wordCount,
      siteName: article.siteName || parsedUrl.hostname,
      excerpt: article.excerpt || '',
    });
  } catch (error) {
    console.error('URL extraction error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract content' },
      { status: 500 }
    );
  }
}
