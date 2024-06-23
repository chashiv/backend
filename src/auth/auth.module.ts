import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OutlookModule } from './outlook/outlook.module';
import { LoggingService } from 'src/logger/logging.service';

@Module({
  imports: [OutlookModule],
  controllers: [AuthController],
  providers: [AuthService, LoggingService],
})
export class AuthModule {}
