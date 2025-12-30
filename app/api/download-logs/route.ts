// ===== app/api/download-logs/route.ts =====
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import OrgAnnouncement from '@/models/OrgAnnouncement';
import Announcement from '@/models/Announcement';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { getPDFConfig, addHeaderFooter } from '@/lib/pdf/pdfUtils';
import { generateCoverPage, generateAnnouncementPages, generateSummaryPage } from '@/lib/pdf/pdfContent';

async function generatePDFLog(data: any[], type: 'org' | 'dept', department?: string, startDate?: string, endDate?: string) {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  
  // Load logo
  const logoPath = path.join(process.cwd(), 'public', 'NewPepsi.png');
  const logoImageBytes = fs.readFileSync(logoPath);
  const logoImage = await pdfDoc.embedPng(logoImageBytes);
  
  const title = type === 'org' 
    ? 'Organization-Wide Announcements Log'
    : `${department} Department Announcements Log`;
  
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const config = getPDFConfig();
  
  // Generate cover page
  await generateCoverPage(
    pdfDoc,
    logoImage,
    title,
    date,
    data.length,
    startDate,
    endDate,
    timesRomanFont,
    timesRomanBold
  );
  
  // Sort data by creation date (ascending)
  const sortedData = [...data].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  // Generate announcement pages
  await generateAnnouncementPages(
    pdfDoc,
    sortedData,
    config,
    timesRomanFont,
    timesRomanBold
  );
  
  // Generate summary page
  await generateSummaryPage(
    pdfDoc,
    sortedData,
    date,
    startDate,
    endDate,
    timesRomanFont,
    timesRomanBold
  );
  
  // Add headers and footers to all pages except cover
  const pages = pdfDoc.getPages();
  const totalPagesCount = pages.length;
  
  for (let i = 1; i < pages.length; i++) {
    await addHeaderFooter(
      pages[i], 
      i + 1, 
      totalPagesCount, 
      title, 
      logoImage,
      timesRomanFont,
      timesRomanBold
    );
  }
  
  return await pdfDoc.save();
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { type, department, startDate, endDate } = body;

    if (!type || (type !== 'org' && type !== 'dept')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "org" or "dept"' },
        { status: 400 }
      );
    }

    if (type === 'dept' && !department) {
      return NextResponse.json(
        { error: 'Department is required for department logs' },
        { status: 400 }
      );
    }

    let query: any = {};

    // Add date range filter if provided
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    let announcements;
    
    if (type === 'org') {
      // Uses index: { isDeleted: 1, createdAt: -1 }
      // Only select fields needed for PDF generation to reduce memory usage
      announcements = await OrgAnnouncement.find(query)
        .select('title content author createdAt pinned urgent edited expirationDate borderColor comments')
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // Uses compound index: { isDeleted: 1, department: 1, createdAt: -1 }
      query.department = department;
      announcements = await Announcement.find(query)
        .select('title content author department createdAt pinned urgent edited expirationDate borderColor comments')
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!announcements || announcements.length === 0) {
      return NextResponse.json(
        { error: 'No announcements found' },
        { status: 404 }
      );
    }

    // Generate PDF (this happens after data is fetched)
    const pdfBytes = await generatePDFLog(announcements, type, department, startDate, endDate);
    
    // Generate filename
    const dateRangeStr = startDate && endDate 
      ? `_${startDate}_to_${endDate}`
      : '';
    const filename = type === 'org'
      ? `Org_Announcements_Log${dateRangeStr}_${new Date().toISOString().split('T')[0]}.pdf`
      : `${department}_Announcements_Log${dateRangeStr}_${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBytes.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating PDF logs:', error);
    return NextResponse.json(
      { error: 'Failed to generate logs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}