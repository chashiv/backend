import { Body, Controller, Get, UsePipes } from '@nestjs/common';
import { MailService } from './mail.service';
import { JoiValidationPipe } from 'src/pipes/joi.validation.pipe';
import { getMailFoldersValidations } from './mail.validations';
import { IProviderWithEmail } from 'src/providers/provider.interface';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Get('mail-folders')
  @UsePipes(new JoiValidationPipe(getMailFoldersValidations))
  async getMailFolders(@Body() payload: IProviderWithEmail) {
    const response = await this.mailService.getEmailFolders(payload);
    return response;
  }

  @Get('sync-mails')
  @UsePipes(new JoiValidationPipe(getMailFoldersValidations))
  async syncMails(@Body() payload: IProviderWithEmail) {
    const response = await this.mailService.syncMails(payload);
    return response;
  }
}
