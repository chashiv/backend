import { Injectable } from '@nestjs/common';
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
    try {
      switch (payload.provider) {
        case ProviderEnum.OUTLOOK:
          return await this.outlookService.authenticate();
        default:
          throw new Error(AuthError.AUTH01);
      }
    } catch (error) {
      this.loggingService.logError(error.message, error);
      return { error: error.message };
    }
  }
}
