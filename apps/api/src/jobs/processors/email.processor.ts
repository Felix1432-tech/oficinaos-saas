import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing email job ${job.id}`);

    // TODO: Implement email sending with Nodemailer
    // const { to, subject, html, attachments } = job.data;

    return { success: true, message: 'Email sent (mock)' };
  }
}
