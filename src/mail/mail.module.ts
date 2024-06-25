import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { OutlookModule } from 'src/providers/outlook/outlook.module';

@Module({
  imports: [OutlookModule],
  providers: [MailService],
  controllers: [MailController],
})
export class MailModule {}
