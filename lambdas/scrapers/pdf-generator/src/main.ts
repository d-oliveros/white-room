import type { PdfGeneratorRequest, PdfGeneratorResponse } from '@namespace/lambda';
import { lambdaHandler } from '@namespace/lambda-handler';
import { PdfGeneratorRequestSchema } from '@namespace/lambda';
import { pdfGeneratorScraper } from './lib/pdf-generator.scraper';

export const handler = lambdaHandler<PdfGeneratorRequest, PdfGeneratorResponse>(
  async (event: PdfGeneratorRequest) => {
    const payload = PdfGeneratorRequestSchema.parse(event);

    const results = await pdfGeneratorScraper({
      url: payload.url,
      waitForSelector: payload.waitForSelector,
      requestId: payload.requestId,
      metadata: payload.metadata,
    });

    return {
      pdfUrl: results.pdfUrl,
      requestId: payload.requestId,
    };
  },
);
