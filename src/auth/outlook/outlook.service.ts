import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MESSAGES,
  PERMISSIONS,
  GRANT_TYPE_ENUM,
  AUTHORISATION_BASE_URL,
  MICROSOFT_GRAPH_BASE_URL,
} from './outlook.enum';
import { generateId } from 'src/utils';
import { LoggingService } from 'src/logger/logging.service';
import { ElasticService } from 'src/elastic/elastic.service';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

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
    const tokenDetailsResponse = await axios.post(
      this.getTokenurl(),
      {
        code: code,
        scope: PERMISSIONS,
        client_id: this.client_id,
        redirect_uri: this.redirect_url,
        client_secret: this.client_secret,
        grant_type: GRANT_TYPE_ENUM.AUHTORISATION_CODE,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return tokenDetailsResponse.data;
  }

  async authenticate() {
    const url = this.getAuthroisationUrl();
    return { url };
  }

  private async saveUserDetails(userDetails) {
    await this.elasticsearchSerivce.insert('users', userDetails, uuidv4());
  }

  private async getUserDetailsAndSave(tokenDetails) {
    const token = tokenDetails?.access_token;
    const url = `${MICROSOFT_GRAPH_BASE_URL}/v1.0/me`;
    const userDetails = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await this.saveUserDetails({ ...userDetails.data, ...tokenDetails });
    return userDetails.data;
  }

  async handleCallback(req) {
    const { code } = req.query;
    const tokenDetails = await this.getTokenDetails(code);
    const userDetails = await this.getUserDetailsAndSave(tokenDetails);
    return userDetails;
  }

  async handleChangeNotification() {
    /*
        Unable to create subscription using localhost
        This method can be used to handle change event that microsoft graph api's send
        We can use this to update mails from unread to read for instance
     */
    return { msg: 'handleChangeNotification called', status: 200 };
  }

  async listMails(email: string) {
    let userDetails;
    try {
      userDetails = await this.elasticsearchSerivce.search('users', email);
      if (userDetails && userDetails.length) {
        const user = userDetails[0]?._source;
        const emails = await axios.get(`${MICROSOFT_GRAPH_BASE_URL}/v1.0/me/messages`, {
          params: {
            count: true,
          },
          headers: {
            Authorization: `Bearer ${user['access_token']}`,
          },
        });
        return emails.data;
      }
      return { status: HttpStatus.OK, message: MESSAGES.PLEASE_LOGIN_AGAIN };
    } catch (error) {
      if (userDetails?.length) {
        await this.elasticsearchSerivce.delete('users', userDetails[0]?.['_id']);
      }
      this.loggingService.logError(error.message, error);
      throw new HttpException('Please Login Again', HttpStatus.BAD_REQUEST);
    }
  }
}
