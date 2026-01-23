// app/api/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    
    if (!filePath) {
      return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
    }

    console.log('📥 Download request for:', filePath);

    // Security: ensure file is within uploads directory
    const UPLOAD_BASE = 'D:\\ARDA\\uploads';
    const normalizedPath = path.normalize(filePath);
    
    console.log('   Normalized path:', normalizedPath);
    console.log('   Base directory:', UPLOAD_BASE);
    
    if (!normalizedPath.startsWith(UPLOAD_BASE)) {
      console.error('❌ Security violation: Path outside uploads directory');
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
    }

    if (!fs.existsSync(normalizedPath)) {
      console.error('❌ File not found:', normalizedPath);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = fs.readFileSync(normalizedPath);
    
    // Extract filename, removing timestamp prefix if present
    const baseFilename = path.basename(normalizedPath);
    const filename = baseFilename.split('_').slice(1).join('_') || baseFilename;
    
    console.log('✅ Serving file:', filename, `(${file.length} bytes)`);
    
    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.7z': 'application/x-7z-compressed',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'application/xml',
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': file.length.toString(),
      },
    });
  } catch (error) {
    console.error('❌ Download error:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}