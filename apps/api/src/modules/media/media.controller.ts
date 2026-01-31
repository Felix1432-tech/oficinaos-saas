import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { Tenant } from '../../common/decorators/tenant.decorator';

@ApiTags('media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  findAll(@Tenant() tenantId: string, @Query() query: any) {
    return this.mediaService.findAll(tenantId, query);
  }

  @Post('upload')
  upload(@Tenant() tenantId: string, @Body() data: any) {
    return this.mediaService.upload(tenantId, data);
  }

  @Delete(':id')
  delete(@Tenant() tenantId: string, @Param('id') id: string) {
    return this.mediaService.delete(tenantId, id);
  }

  @Post(':id/ai-generate-image')
  generateImage(@Tenant() tenantId: string, @Param('id') id: string, @Body() body: { prompt: string }) {
    return this.mediaService.generateImage(tenantId, id, body.prompt);
  }

  @Post(':id/ai-edit')
  editImage(@Tenant() tenantId: string, @Param('id') id: string, @Body() body: { prompt: string }) {
    return this.mediaService.editImage(tenantId, id, body.prompt);
  }

  @Post(':id/ai-generate-video')
  generateVideo(@Tenant() tenantId: string, @Param('id') id: string, @Body() body: { prompt: string }) {
    return this.mediaService.generateVideo(tenantId, id, body.prompt);
  }
}
