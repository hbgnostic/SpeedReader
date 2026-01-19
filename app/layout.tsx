import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpeedReader - RSVP Speed Reading',
  description:
    'A personal speed reading app using Rapid Serial Visual Presentation (RSVP) with Optimal Recognition Point highlighting. Supports PDF, DOCX, EPUB, and images.',
  keywords: ['speed reading', 'RSVP', 'ORP', 'reading', 'dyslexia friendly'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload Inter font for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
