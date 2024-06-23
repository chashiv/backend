import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AUTHORISATION_BASE_URL, GRANT_TYPE_ENUM, PERMISSIONS } from './outlook.enum';
import { generateId } from 'src/utils';
import { LoggingService } from 'src/logger/logging.service';
import axios from 'axios';
import { ElasticService } from 'src/elastic/elastic.service';
import { url } from 'inspector';

@Injectable()
export class OutlookService {
  private readonly client_id: string | undefined;
  private readonly client_secret: string | undefined;
  private readonly redirect_url: string | undefined;

  constructor(
    private configService: ConfigService,
    private loggingService: LoggingService,
    private elasticsearchSerivce: ElasticService,
  ) {
    this.client_id = this.configService.getOrThrow<string>('OUTLOOK_CLIENT_ID');
    this.client_secret = this.configService.getOrThrow<string>('OUTLOOK_CLIENT_SECRET');
    this.redirect_url = this.configService.getOrThrow<string>('OUTLOOK_CALLBACK_URL');
  }

  private getAuthroisationUrl(): string {
    return (
      `${AUTHORISATION_BASE_URL}/common/oauth2/v2.0/authorize?` +
      `client_id=${this.client_id}` +
      `&response_type=code` +
      `&redirect_uri=${this.redirect_url}` +
      `&response_mode=query` +
      `&scope=${PERMISSIONS}` +
      `&state=${generateId('OUTLOOK')}`
    );
  }

  private getTokenurl(): string {
    return `${AUTHORISATION_BASE_URL}/common/oauth2/v2.0/token`;
  }

  private async getTokenDetails(code: string) {
    try {
      const tokenDetailsResponse = await axios.post(
        this.getTokenurl(),
        {
          client_id: this.client_id,
          client_secret: this.client_secret,
          redirect_uri: this.redirect_url,
          grant_type: GRANT_TYPE_ENUM.AUHTORISATION_CODE,
          code: code,
          scope: PERMISSIONS,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return tokenDetailsResponse.data;
    } catch (error) {
      error = error.response.data || error;
      this.loggingService.logError(error.error_description, error);
    }
  }

  async authenticate() {
    const url = this.getAuthroisationUrl();
    await this.elasticsearchSerivce.insert('test', { url });
    return { url };
  }

  async handleCallback(req) {
    const { code } = req.query;
    const tokenDetails = await this.getTokenDetails(code);
    return tokenDetails;
  }

  async handleChangesNotification(req) {
    return { msg: 'handleChangesNotification called', status: 200 };
  }
}
