import { Module } from '@nestjs/common';
import { OutlookService } from './outlook.service';
import { OutlookController } from './outlook.controller';
import { LoggingService } from 'src/logger/logging.service';

@Module({
  providers: [OutlookService, LoggingService],
  exports: [OutlookService],
  controllers: [OutlookController],
})
export class OutlookModule {}
