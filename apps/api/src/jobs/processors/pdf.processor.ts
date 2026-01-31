import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('pdf')
export class PdfProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing PDF job ${job.id}`);

    // TODO: Implement PDF generation with Playwright
    // const { proposalId, tenantId } = job.data;

    return { success: true, message: 'PDF generation not implemented yet' };
  }
}
