import { Module } from '@nestjs/common';
import { OutlookService } from './outlook.service';
import { OutlookController } from './outlook.controller';
import { LoggingService } from 'src/logger/logging.service';
import { ElasticService } from 'src/elastic/elastic.service';
import { OutLookBundleApiService } from './outlook-bundle.api.service';
import { UserEntity } from 'src/user/user.entity';

@Module({
  providers: [OutlookService, LoggingService, ElasticService, OutLookBundleApiService, UserEntity],
  exports: [OutlookService],
  controllers: [OutlookController],
})
export class OutlookModule {}
