import { Module } from '@nestjs/common';
import { OutlookService } from './outlook.service';
import { OutlookController } from './outlook.controller';
import { LoggingService } from 'src/logger/logging.service';
import { ElasticService } from 'src/elastic/elastic.service';

@Module({
  providers: [OutlookService, LoggingService, ElasticService],
  exports: [OutlookService],
  controllers: [OutlookController],
})
export class OutlookModule {}
