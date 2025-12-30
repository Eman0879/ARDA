// lib/pdf/pdfContent.ts
import { PDFDocument, PDFPage, PDFImage, PDFFont, rgb } from 'pdf-lib';
import { wrapText, PDFConfig } from './pdfUtils';
import fetch from 'node-fetch';

export async function generateCoverPage(
  pdfDoc: PDFDocument,
  logoImage: PDFImage,
  title: string,
  date: string,
  dataLength: number,
  startDate?: string,
  endDate?: string,
  timesRomanFont?: PDFFont,
  timesRomanBold?: PDFFont
): Promise<void> {
  const coverPage = pdfDoc.addPage([612, 792]);
  const { width, height } = coverPage.getSize();
  const margin = 50;
  const contentWidth = width - (margin * 2);
  
  // Logo - centered and reasonable size
  const logoSize = 80;
  const logoX = (width - logoSize) / 2;
  const logoY = height - 150;
  
  coverPage.drawImage(logoImage, {
    x: logoX,
    y: logoY,
    width: logoSize,
    height: logoSize,
  });
  
  // Title
  let yPos = logoY - 40;
  const titleLines = wrapText(title.toUpperCase(), contentWidth, 20, timesRomanBold!);
  for (const line of titleLines) {
    const textWidth = timesRomanBold!.widthOfTextAtSize(line, 20);
    coverPage.drawText(line, {
      x: (width - textWidth) / 2,
      y: yPos,
      size: 20,
      font: timesRomanBold!,
      color: rgb(0, 0, 0.8),
    });
    yPos -= 28;
  }
  
  // Date range if filtered
  if (startDate && endDate) {
    yPos -= 10;
    const startFormatted = new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const endFormatted = new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const dateRangeText = `${startFormatted} - ${endFormatted}`;
    const dateTextWidth = timesRomanBold!.widthOfTextAtSize(dateRangeText, 14);
    
    coverPage.drawText(dateRangeText, {
      x: (width - dateTextWidth) / 2,
      y: yPos,
      size: 14,
      font: timesRomanBold!,
      color: rgb(0, 0, 0.6),
    });
    yPos -= 35;
  } else {
    yPos -= 25;
  }
  
  // Document contents box
  yPos -= 15;
  const boxY = yPos;
  const boxHeight = 180;
  
  coverPage.drawRectangle({
    x: margin + 30,
    y: boxY - boxHeight,
    width: contentWidth - 60,
    height: boxHeight,
    color: rgb(0.95, 0.95, 0.98),
    borderColor: rgb(0, 0, 0.5),
    borderWidth: 2,
  });
  
  yPos -= 18;
  const contentsTitle = 'DOCUMENT CONTENTS';
  const contentsTitleWidth = timesRomanBold!.widthOfTextAtSize(contentsTitle, 13);
  coverPage.drawText(contentsTitle, {
    x: (width - contentsTitleWidth) / 2,
    y: yPos,
    size: 13,
    font: timesRomanBold!,
    color: rgb(0, 0, 0.6),
  });
  
  yPos -= 22;
  const contents = [
    '• Complete announcement history with metadata',
    '• All comments including deleted items',
    '• Embedded images and full attachment details',
    '• Author information and timestamps',
    '• Status indicators (pinned, urgent, deleted, edited)',
    '• Audit-ready professional format'
  ];
  
  for (const item of contents) {
    coverPage.drawText(item, {
      x: margin + 55,
      y: yPos,
      size: 10,
      font: timesRomanFont!,
      color: rgb(0.2, 0.2, 0.2),
    });
    yPos -= 18;
  }
  
  // Generation date at bottom
  yPos = 110;
  const genText = `Generated: ${date}`;
  const genTextWidth = timesRomanFont!.widthOfTextAtSize(genText, 10);
  coverPage.drawText(genText, {
    x: (width - genTextWidth) / 2,
    y: yPos,
    size: 10,
    font: timesRomanFont!,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  yPos -= 20;
  const countText = `Total Announcements: ${dataLength}`;
  const countTextWidth = timesRomanBold!.widthOfTextAtSize(countText, 12);
  coverPage.drawText(countText, {
    x: (width - countTextWidth) / 2,
    y: yPos,
    size: 12,
    font: timesRomanBold!,
    color: rgb(0, 0, 0.6),
  });
}

export async function generateAnnouncementPages(
  pdfDoc: PDFDocument,
  sortedData: any[],
  config: PDFConfig,
  timesRomanFont: PDFFont,
  timesRomanBold: PDFFont
): Promise<void> {
  const { width, height, margin, contentWidth } = config;
  
  let currentPage = pdfDoc.addPage([width, height]);
  let yPosition = height - 70;
  
  for (let idx = 0; idx < sortedData.length; idx++) {
    const ann = sortedData[idx];
    
    // Check if we need a new page for the announcement header
    if (yPosition < 150) {
      currentPage = pdfDoc.addPage([width, height]);
      yPosition = height - 70;
    }
    
    // Announcement Title - Large and prominent
    const titleLines = wrapText(ann.title, contentWidth - 10, 16, timesRomanBold);
    for (const titleLine of titleLines) {
      if (yPosition < 100) {
        currentPage = pdfDoc.addPage([width, height]);
        yPosition = height - 70;
      }
      currentPage.drawText(titleLine, {
        x: margin,
        y: yPosition,
        size: 16,
        font: timesRomanBold,
        color: rgb(0, 0, 0.9),
      });
      yPosition -= 22;
    }
    
    // Decorative line under title
    currentPage.drawLine({
      start: { x: margin, y: yPosition + 5 },
      end: { x: width - margin, y: yPosition + 5 },
      thickness: 2,
      color: rgb(0, 0, 0.7),
    });
    yPosition -= 15;
    
    // Metadata section
    const metadataText = `Posted by ${ann.author || 'Unknown'} on ${new Date(ann.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    
    currentPage.drawText(metadataText, {
      x: margin,
      y: yPosition,
      size: 9,
      font: timesRomanFont,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPosition -= 18;
    
    // Status badges (if any)
    const statuses = [];
    if (ann.pinned) statuses.push('PINNED');
    if (ann.urgent) statuses.push('URGENT');
    if (ann.isDeleted) statuses.push('DELETED');
    if (ann.edited) statuses.push('EDITED');
    
    if (statuses.length > 0) {
      const statusText = statuses.join(' • ');
      currentPage.drawRectangle({
        x: margin - 2,
        y: yPosition - 3,
        width: timesRomanBold.widthOfTextAtSize(statusText, 8) + 8,
        height: 14,
        color: rgb(1, 0.95, 0.9),
        borderColor: rgb(0.8, 0, 0),
        borderWidth: 1,
      });
      
      currentPage.drawText(statusText, {
        x: margin + 2,
        y: yPosition,
        size: 8,
        font: timesRomanBold,
        color: rgb(0.8, 0, 0),
      });
      yPosition -= 20;
    }
    
    yPosition -= 10;
    
    // Content section with "Announcement" heading
    if (yPosition < 120) {
      currentPage = pdfDoc.addPage([width, height]);
      yPosition = height - 70;
    }
    
    currentPage.drawText('Announcement:', {
      x: margin,
      y: yPosition,
      size: 11,
      font: timesRomanBold,
      color: rgb(0, 0, 0.7),
    });
    yPosition -= 18;
    
    const contentLines = wrapText(ann.content, contentWidth - 10, 10, timesRomanFont);
    for (const line of contentLines) {
      if (yPosition < 100) {
        currentPage = pdfDoc.addPage([width, height]);
        yPosition = height - 70;
      }
      currentPage.drawText(line, {
        x: margin,
        y: yPosition,
        size: 10,
        font: timesRomanFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      yPosition -= 14;
    }
    yPosition -= 15;
    
    // Attachments section with embedded images
    if (ann.attachments && ann.attachments.length > 0) {
      if (yPosition < 120) {
        currentPage = pdfDoc.addPage([width, height]);
        yPosition = height - 70;
      }
      
      currentPage.drawText('Attachments:', {
        x: margin,
        y: yPosition,
        size: 11,
        font: timesRomanBold,
        color: rgb(0, 0, 0.7),
      });
      yPosition -= 18;
      
      for (const attachment of ann.attachments) {
        if (yPosition < 120) {
          currentPage = pdfDoc.addPage([width, height]);
          yPosition = height - 70;
        }
        
        // Show file name
        const fileName = attachment.originalname || attachment.name || 'Unknown file';
        const fileType = attachment.mimetype || 'unknown type';
        
        currentPage.drawText(`• ${fileName}`, {
          x: margin,
          y: yPosition,
          size: 9,
          font: timesRomanBold,
          color: rgb(0, 0.3, 0),
        });
        yPosition -= 14;
        
        // Embed and display images
        if (attachment.mimetype && attachment.mimetype.startsWith('image/')) {
          try {
            const imageUrl = attachment.url || attachment.path;
            if (imageUrl) {
              // Check if we have enough space for image
              if (yPosition < 350) {
                currentPage = pdfDoc.addPage([width, height]);
                yPosition = height - 70;
              }
              
              let embeddedImage;
              const imageResponse = await fetch(imageUrl);
              
              if (!imageResponse.ok) {
                throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
              }
              
              const imageBytes = await imageResponse.arrayBuffer();
              
              if (attachment.mimetype === 'image/png') {
                embeddedImage = await pdfDoc.embedPng(Buffer.from(imageBytes));
              } else if (attachment.mimetype === 'image/jpeg' || attachment.mimetype === 'image/jpg') {
                embeddedImage = await pdfDoc.embedJpg(Buffer.from(imageBytes));
              }
              
              if (embeddedImage) {
                const imgDims = embeddedImage.scale(1);
                const imgWidth = imgDims.width;
                const imgHeight = imgDims.height;
                
                // Calculate scaled dimensions
                const maxImageWidth = contentWidth * 0.7;
                const maxImageHeight = 280;
                
                let scaleFactor = Math.min(
                  maxImageWidth / imgWidth,
                  maxImageHeight / imgHeight,
                  1
                );
                
                const finalWidth = imgWidth * scaleFactor;
                const finalHeight = imgHeight * scaleFactor;
                
                // Draw border and background for image
                currentPage.drawRectangle({
                  x: margin - 2,
                  y: yPosition - finalHeight - 6,
                  width: finalWidth + 4,
                  height: finalHeight + 4,
                  color: rgb(0.98, 0.98, 0.98),
                  borderColor: rgb(0.7, 0.7, 0.7),
                  borderWidth: 1,
                });
                
                // Draw the actual image
                currentPage.drawImage(embeddedImage, {
                  x: margin,
                  y: yPosition - finalHeight - 4,
                  width: finalWidth,
                  height: finalHeight,
                });
                
                yPosition -= finalHeight + 20;
              }
            }
          } catch (error) {
            console.error('Error embedding image:', error);
            currentPage.drawText('  [Image could not be loaded]', {
              x: margin + 5,
              y: yPosition,
              size: 8,
              font: timesRomanFont,
              color: rgb(0.6, 0, 0),
            });
            yPosition -= 14;
          }
        } else {
          // For non-image attachments, just show the type
          currentPage.drawText(`  Type: ${fileType}`, {
            x: margin + 5,
            y: yPosition,
            size: 8,
            font: timesRomanFont,
            color: rgb(0.4, 0.4, 0.4),
          });
          yPosition -= 16;
        }
      }
      yPosition -= 10;
    }
    
    // Comments section
    if (ann.comments && ann.comments.length > 0) {
      const activeComments = ann.comments.filter((c: any) => !c.isDeleted).length;
      const deletedComments = ann.comments.filter((c: any) => c.isDeleted).length;
      
      if (yPosition < 120) {
        currentPage = pdfDoc.addPage([width, height]);
        yPosition = height - 70;
      }
      
      let commentsHeader = 'Comments';
      if (deletedComments > 0) {
        commentsHeader += ` (${activeComments} active, ${deletedComments} deleted)`;
      }
      commentsHeader += ':';
      
      currentPage.drawText(commentsHeader, {
        x: margin,
        y: yPosition,
        size: 11,
        font: timesRomanBold,
        color: rgb(0, 0, 0.7),
      });
      yPosition -= 18;
      
      const sortedComments = [...ann.comments].sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      for (const comment of sortedComments) {
        if (yPosition < 100) {
          currentPage = pdfDoc.addPage([width, height]);
          yPosition = height - 70;
        }
        
        // Comment header with author and date
        let commentHeader = comment.author;
        if (comment.isDeleted) commentHeader += ' (DELETED)';
        if (comment.pinned) commentHeader += ' (PINNED)';
        
        const commentDate = new Date(comment.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        commentHeader += ` - ${commentDate}`;
        
        // Background for comment
        const commentLines = wrapText(comment.text, contentWidth - 30, 9, timesRomanFont);
        const commentBoxHeight = 18 + (commentLines.length * 13) + 8;
        
        currentPage.drawRectangle({
          x: margin - 2,
          y: yPosition - commentBoxHeight + 8,
          width: contentWidth + 4,
          height: commentBoxHeight,
          color: rgb(0.97, 0.97, 0.99),
          borderColor: rgb(0.85, 0.85, 0.9),
          borderWidth: 0.5,
        });
        
        currentPage.drawText(commentHeader, {
          x: margin + 3,
          y: yPosition,
          size: 9,
          font: timesRomanBold,
          color: rgb(0.2, 0.2, 0.5),
        });
        yPosition -= 15;
        
        // Comment text
        for (const line of commentLines) {
          if (yPosition < 100) {
            currentPage = pdfDoc.addPage([width, height]);
            yPosition = height - 70;
          }
          currentPage.drawText(line, {
            x: margin + 3,
            y: yPosition,
            size: 9,
            font: timesRomanFont,
            color: rgb(0.15, 0.15, 0.15),
          });
          yPosition -= 13;
        }
        yPosition -= 10;
      }
    }
    
    // Separator between announcements
    yPosition -= 15;
    if (yPosition > 100) {
      currentPage.drawLine({
        start: { x: margin, y: yPosition },
        end: { x: width - margin, y: yPosition },
        thickness: 0.5,
        color: rgb(0.6, 0.6, 0.6),
        dashArray: [4, 4],
      });
    }
    yPosition -= 25;
  }
}

export async function generateSummaryPage(
  pdfDoc: PDFDocument,
  sortedData: any[],
  date: string,
  startDate?: string,
  endDate?: string,
  timesRomanFont?: PDFFont,
  timesRomanBold?: PDFFont
): Promise<void> {
  const lastPage = pdfDoc.addPage([612, 792]);
  const { width, height } = lastPage.getSize();
  const margin = 50;
  let yPosition = height - 70;
  
  const totalComments = sortedData.reduce((sum, ann) => 
    sum + (ann.comments?.length || 0), 0
  );
  
  const totalAttachments = sortedData.reduce((sum, ann) => 
    sum + (ann.attachments?.length || 0), 0
  );
  
  const pinnedCount = sortedData.filter(ann => ann.pinned).length;
  const urgentCount = sortedData.filter(ann => ann.urgent).length;
  const deletedCount = sortedData.filter(ann => ann.isDeleted).length;
  
  // Summary box
  const boxHeight = 200;
  lastPage.drawRectangle({
    x: margin,
    y: yPosition - boxHeight,
    width: width - (margin * 2),
    height: boxHeight,
    color: rgb(0.95, 0.97, 0.99),
    borderColor: rgb(0, 0, 0.5),
    borderWidth: 2,
  });
  
  yPosition -= 20;
  
  lastPage.drawText('SUMMARY', {
    x: margin + 20,
    y: yPosition,
    size: 14,
    font: timesRomanBold!,
    color: rgb(0, 0, 0.7),
  });
  yPosition -= 30;
  
  lastPage.drawText(`Total Announcements: ${sortedData.length}`, {
    x: margin + 30,
    y: yPosition,
    size: 10,
    font: timesRomanFont!,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 18;
  
  lastPage.drawText(`Total Comments: ${totalComments}`, {
    x: margin + 30,
    y: yPosition,
    size: 10,
    font: timesRomanFont!,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 18;
  
  lastPage.drawText(`Total Attachments: ${totalAttachments}`, {
    x: margin + 30,
    y: yPosition,
    size: 10,
    font: timesRomanFont!,
    color: rgb(0.2, 0.2, 0.2),
  });
  yPosition -= 18;
  
  if (pinnedCount > 0) {
    lastPage.drawText(`Pinned Announcements: ${pinnedCount}`, {
      x: margin + 30,
      y: yPosition,
      size: 10,
      font: timesRomanFont!,
      color: rgb(0.2, 0.2, 0.2),
    });
    yPosition -= 18;
  }
  
  if (urgentCount > 0) {
    lastPage.drawText(`Urgent Announcements: ${urgentCount}`, {
      x: margin + 30,
      y: yPosition,
      size: 10,
      font: timesRomanFont!,
      color: rgb(0.2, 0.2, 0.2),
    });
    yPosition -= 18;
  }
  
  if (deletedCount > 0) {
    lastPage.drawText(`Deleted Announcements: ${deletedCount}`, {
      x: margin + 30,
      y: yPosition,
      size: 10,
      font: timesRomanFont!,
      color: rgb(0.2, 0.2, 0.2),
    });
    yPosition -= 18;
  }
  
  if (startDate && endDate) {
    yPosition -= 5;
    const startFormatted = new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const endFormatted = new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    lastPage.drawText(`Date Range: ${startFormatted} - ${endFormatted}`, {
      x: margin + 30,
      y: yPosition,
      size: 10,
      font: timesRomanBold!,
      color: rgb(0, 0, 0.6),
    });
    yPosition -= 18;
  }
  
  yPosition -= 5;
  lastPage.drawText(`Log Generated: ${date}`, {
    x: margin + 30,
    y: yPosition,
    size: 9,
    font: timesRomanFont!,
    color: rgb(0.5, 0.5, 0.5),
  });
}