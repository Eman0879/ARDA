// lib/pdf/pdfUtils.ts
import { PDFDocument, PDFPage, PDFImage, PDFFont, rgb } from 'pdf-lib';

export function wrapText(text: string, maxWidth: number, fontSize: number, font: PDFFont): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

export async function addHeaderFooter(
  page: PDFPage, 
  pageNumber: number, 
  totalPages: number, 
  title: string, 
  logo: PDFImage,
  timesRomanFont: PDFFont,
  timesRomanBold: PDFFont
): Promise<void> {
  const { width, height } = page.getSize();
  const margin = 50;
  
  // Header - Logo and Title
  const logoSize = 30;
  page.drawImage(logo, {
    x: margin,
    y: height - 35,
    width: logoSize,
    height: logoSize,
  });
  
  page.drawText(title, {
    x: margin + logoSize + 10,
    y: height - 25,
    size: 10,
    font: timesRomanBold,
    color: rgb(0, 0, 0.5),
  });
  
  // Header line
  page.drawLine({
    start: { x: margin, y: height - 45 },
    end: { x: width - margin, y: height - 45 },
    thickness: 1,
    color: rgb(0, 0, 0.8),
  });
  
  // Footer - Page number
  page.drawText(`Page ${pageNumber} of ${totalPages}`, {
    x: width - margin - 80,
    y: 30,
    size: 9,
    font: timesRomanFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  
  // Footer line
  page.drawLine({
    start: { x: margin, y: 45 },
    end: { x: width - margin, y: 45 },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  });
}

export interface PDFConfig {
  width: number;
  height: number;
  margin: number;
  contentWidth: number;
}

export function getPDFConfig(): PDFConfig {
  const width = 612;
  const height = 792;
  const margin = 50;
  return {
    width,
    height,
    margin,
    contentWidth: width - (margin * 2)
  };
}