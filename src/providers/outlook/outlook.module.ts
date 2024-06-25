import { Module } from '@nestjs/common';
import { OutlookService } from './outlook.service';
import { OutlookController } from './outlook.controller';
import { LoggingService } from 'src/logger/logging.service';
import { ElasticService } from 'src/elastic/elastic.service';
import { OutLookBundleApiService } from './outlook-bundle.api.service';
import { UserEntity } from 'src/user/user.entity';
import { UtilService } from 'src/common/util/util.service';

@Module({
  providers: [
    OutlookService,
    LoggingService,
    ElasticService,
    OutLookBundleApiService,
    UserEntity,
    UtilService,
  ],
  exports: [OutlookService],
  controllers: [OutlookController],
})
export class OutlookModule {}
