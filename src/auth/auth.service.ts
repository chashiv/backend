import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OutlookService } from '../providers/outlook/outlook.service';
import { ProviderEnum } from './auth.enum';
import { IProvider } from 'src/providers/provider.interface';
import { ProviderError } from 'src/providers/provider.error';

@Injectable()
export class AuthService {
  constructor(private outlookService: OutlookService) {}

  async authenticate(payload: IProvider) {
    switch (payload.provider) {
      case ProviderEnum.OUTLOOK:
        return await this.outlookService.authenticate();
      default:
        throw new HttpException(ProviderError.UNINTEGRATED_PROVIDER, HttpStatus.BAD_REQUEST);
    }
  }
}
