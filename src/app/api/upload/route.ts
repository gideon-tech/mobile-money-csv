import { NextRequest, NextResponse } from 'next/server';
import { PDFProcessor } from '@/lib/pdf-processor';
import { randomUUID } from 'crypto';

// Simple in-memory storage for development
// In production, use AWS S3, Google Cloud Storage, etc.
const uploadedFiles = new Map<string, {
  id: string;
  filename: string;
  buffer: Buffer;
  mimetype: string;
  uploadedAt: Date;
  size: number;
}>();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string || file.name;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate PDF format
    if (!PDFProcessor.validatePDF(buffer)) {
      return NextResponse.json(
        { error: 'Invalid PDF file format' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const uploadId = randomUUID();

    // Store file data
    uploadedFiles.set(uploadId, {
      id: uploadId,
      filename,
      buffer,
      mimetype: file.type,
      uploadedAt: new Date(),
      size: file.size
    });

    // Clean up old files (older than 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    for (const [id, fileData] of uploadedFiles.entries()) {
      if (fileData.uploadedAt < oneHourAgo) {
        uploadedFiles.delete(id);
      }
    }

    return NextResponse.json({
      success: true,
      uploadId,
      filename,
      size: file.size,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uploadId = searchParams.get('id');

  if (!uploadId) {
    return NextResponse.json(
      { error: 'Upload ID required' },
      { status: 400 }
    );
  }

  const fileData = uploadedFiles.get(uploadId);
  if (!fileData) {
    return NextResponse.json(
      { error: 'File not found or expired' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    uploadId: fileData.id,
    filename: fileData.filename,
    size: fileData.size,
    uploadedAt: fileData.uploadedAt,
    mimetype: fileData.mimetype
  });
}

// Export the uploaded files map for use in other API routes
export { uploadedFiles };