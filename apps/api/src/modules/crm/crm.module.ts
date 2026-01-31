import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { TimelineService } from './timeline.service';

@Module({
  controllers: [CrmController],
  providers: [CrmService, TimelineService],
  exports: [CrmService, TimelineService],
})
export class CrmModule {}
