/**
 * HireMe PDF Route Handler
 * Serves PDF files from the /hireme directory
 * Prevents 404 errors for resume PDFs
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename?: string[] } }
) {
  try {
    const segments = params.filename ?? [];

    if (segments.length === 0) {
      // Redirect to /hireme page if no filename
      return NextResponse.redirect(new URL('/hireme', request.url), 301);
    }

    // Security: Ensure no traversal characters in any segment
    const hasInvalidSegment = segments.some(
      (segment) => segment.includes('..') || segment.includes('/')
    );

    if (hasInvalidSegment) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    const filename = segments.join('/');

    // Security: Only allow PDF files
    if (!filename.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Construct file path (PDF is in /hireme directory at root)
    const filePath = join(process.cwd(), 'hireme', filename);

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read and serve PDF file
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}

