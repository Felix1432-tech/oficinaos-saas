import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('followup')
export class FollowupProcessor extends WorkerHost {
  private readonly logger = new Logger(FollowupProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing follow-up job ${job.id}`);

    // TODO: Implement follow-up logic
    // - Check scheduled jobs
    // - Send WhatsApp/Email based on rules

    return { success: true, message: 'Follow-up processed (mock)' };
  }
}
