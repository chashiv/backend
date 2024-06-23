import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OutlookService } from './outlook/outlook.service';
import { ProviderEnum } from './auth.enum';
import { LoggingService } from 'src/logger/logging.service';
import { AuthError } from './auth.error';
import { IAuthenticate } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private outlookService: OutlookService,
    private loggingService: LoggingService,
  ) {}

  async authenticate(payload: IAuthenticate) {
    switch (payload.provider) {
      case ProviderEnum.OUTLOOK:
        return await this.outlookService.authenticate();
      default:
        throw new HttpException(AuthError.UNINTEGRATED_PROVIDER, HttpStatus.BAD_REQUEST);
    }
  }
}
