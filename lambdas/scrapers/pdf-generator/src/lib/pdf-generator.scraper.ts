import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { createLogger } from '@namespace/logger';
import { BrowserController } from '@namespace/scraper-helpers';
import { uploadToS3 } from '@namespace/s3-client';

const logger = createLogger('pdf-generator.scraper');

interface PdfGeneratorRequest {
  url: string;
  waitForSelector?: string;
  requestId: string;
  metadata?: {
    projectId?: string;
    assetType?: string;
    fileNumber?: string;
    assetTitle?: string;
  };
}

export async function pdfGeneratorScraper({
  url,
  waitForSelector,
  metadata,
}: PdfGeneratorRequest): Promise<{ pdfUrl: string }> {
  const browserController = await BrowserController.create({ proxy: false });

  try {
    logger.info({ url, waitForSelector, metadata }, 'Starting PDF generation...');

    const page = await browserController.createPage();

    // Navigate to the specified URL
    await page.goto(url, { waitUntil: 'networkidle' });
    logger.info('Navigated to the target page');

    await page.waitForFunction(() => document.fonts.ready);

    // Wait for specific selector if provided
    if (waitForSelector) {
      logger.info({ waitForSelector }, 'Waiting for selector to appear in DOM');
      await page.waitForSelector(waitForSelector);
      logger.info('Selector found in DOM');
    }

    // Wait for all images to be loaded
    await page.evaluate(async () => {
      const images = document.querySelectorAll('img');
      const imagePromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve());
          img.addEventListener('error', () => resolve()); // Also handle failed images
        });
      });
      await Promise.allSettled(imagePromises);
    });

    logger.info('All images loaded successfully');

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    logger.info('PDF generated successfully');

    // Generate a filename based on metadata if available, otherwise use UUID
    const uuid = uuidv4();
    let downloadFilename = uuid;

    // If we have metadata with fileNumber and assetType, use them for the download filename
    if (metadata?.fileNumber && metadata?.assetType) {
      // Create a sanitized version of the asset type to use as the title
      const sanitizedAssetType = metadata.assetType
        .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
        .trim()
        .replace(/[^a-zA-Z0-9 ]/g, '') // Remove special characters
        .replace(/\s+/g, ' '); // Replace multiple spaces with a single space

      // Create a filename with the format "{fileNumber} {assetTitle}.pdf"
      downloadFilename = `${metadata.fileNumber} ${sanitizedAssetType}`;

      logger.info({ downloadFilename }, 'Generated human-friendly download filename');
    }

    // Always use UUID for S3 key
    const s3Key = `scraper-pdfs/${uuid}.pdf`;
    const tempFilePath = path.join(os.tmpdir(), `${uuid}.pdf`);

    // Write PDF buffer to temporary file
    fs.writeFileSync(tempFilePath, pdfBuffer);

    // Upload to S3 using the uploadToS3 function with the human-friendly download filename
    const pdfUrl = await uploadToS3({
      sourceFilePath: tempFilePath,
      targetFilePath: s3Key,
      deleteSourceFile: true, // Clean up the temp file after upload
      isPrivate: false, // Make the PDF publicly accessible
      contentDisposition: `attachment; filename="${downloadFilename}.pdf"; filename*=UTF-8''${encodeURIComponent(
        downloadFilename,
      )}.pdf`,
    });

    logger.info({ pdfUrl, downloadFilename }, 'PDF uploaded to S3 successfully');

    return { pdfUrl };
  } catch (error) {
    logger.error(
      { error },
      'Error during PDF generation: ' + (error instanceof Error ? error.message : String(error)),
    );
    throw error;
  } finally {
    await browserController.close();
  }
}
