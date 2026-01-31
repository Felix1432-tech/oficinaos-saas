import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PdfProcessor } from './processors/pdf.processor';
import { EmailProcessor } from './processors/email.processor';
import { FollowupProcessor } from './processors/followup.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'pdf' }),
    BullModule.registerQueue({ name: 'email' }),
    BullModule.registerQueue({ name: 'followup' }),
    BullModule.registerQueue({ name: 'invoice' }),
    BullModule.registerQueue({ name: 'media-ai' }),
  ],
  providers: [PdfProcessor, EmailProcessor, FollowupProcessor],
  exports: [],
})
export class JobsModule {}
