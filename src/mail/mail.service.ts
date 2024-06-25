import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OutlookService } from '../providers/outlook/outlook.service';
import { ProviderEnum } from 'src/auth/auth.enum';
import { IProviderWithEmail } from 'src/providers/provider.interface';
import { ProviderError } from 'src/providers/provider.error';

@Injectable()
export class MailService {
  constructor(private outlookService: OutlookService) {}

  async getEmailFolders(payload: IProviderWithEmail) {
    switch (payload.provider) {
      case ProviderEnum.OUTLOOK:
        return await this.outlookService.getEmailFolders(payload.email);
      default:
        throw new HttpException(ProviderError.UNINTEGRATED_PROVIDER, HttpStatus.BAD_REQUEST);
    }
  }

  async syncMails(payload: IProviderWithEmail) {
    switch (payload.provider) {
      case ProviderEnum.OUTLOOK:
        return await this.outlookService.listMails(payload.email);
      default:
        throw new HttpException(ProviderError.UNINTEGRATED_PROVIDER, HttpStatus.BAD_REQUEST);
    }
  }
}
