import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutLookBundleApiService } from './outlook-bundle.api.service';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from 'src/user/user.entity';
import { IUser } from 'src/user/user.interface';
import { LoggingService } from 'src/logger/logging.service';
import * as moment from 'moment';
import { MESSAGES } from './outlook.enum';

@Injectable()
export class OutlookService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUrl: string;

  constructor(
    private userEntity: UserEntity,
    private configService: ConfigService,
    private loggingService: LoggingService,
    private outlookBundleApis: OutLookBundleApiService,
  ) {
    this.clientId = this.configService.getOrThrow<string>('OUTLOOK_CLIENT_ID');
    this.redirectUrl = this.configService.getOrThrow<string>('OUTLOOK_CALLBACK_URL');
    this.clientSecret = this.configService.getOrThrow<string>('OUTLOOK_CLIENT_SECRET');
  }

  private parseUserResponse(userDetails): IUser {
    return {
      userId: uuidv4(),
      id: userDetails.id,
      scope: userDetails?.scope,
      lastName: userDetails?.surname,
      firstName: userDetails?.givenName,
      expiresIn: userDetails?.expires_in,
      displayName: userDetails?.displayName,
      mobilePhone: userDetails?.mobilePhone,
      accessToken: userDetails?.access_token,
      refreshToken: userDetails?.refresh_token,
      extExpiresIn: userDetails?.ext_expires_in,
      bussinessPhone: userDetails?.businessPhones?.[0],
      expiryTimestamp: moment().add(3600, 'seconds').toDate(),
      email: userDetails?.mail || userDetails?.userPrincipalName,
    };
  }

  async authenticate() {
    return {
      url: this.outlookBundleApis.getAuthorisationUrl(this.clientId, this.redirectUrl),
    };
  }

  async handleCallback(code: string) {
    const tokenDetails = await this.outlookBundleApis.getTokenFromCode(
      code,
      this.clientId,
      this.redirectUrl,
      this.clientSecret,
    );
    const userDetails = await this.outlookBundleApis.getSignedInUserDetails(tokenDetails?.access_token);
    if (userDetails) {
      await this.userEntity.saveUser(this.parseUserResponse({ ...userDetails, ...tokenDetails }));
    }
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
    let userDetails: IUser;
    try {
      userDetails = (await this.userEntity.getUserByEmail(email)) as unknown as IUser;
      if (userDetails) {
        const token = userDetails.accessToken;
        const emailsList = await this.outlookBundleApis.listMails(token);
        return emailsList;
      }
      return { message: MESSAGES.PLEASE_LOGIN_AGAIN, status: 200 };
    } catch (error) {
      error = error?.response?.data || error;
      this.loggingService.logError(error.message, error);
      if (userDetails) {
        const response = await this.userEntity.deleteUser(userDetails.id);
        return response;
      }
    }
  }

  async getEmailFolders(email: string) {
    let userDetails: IUser;
    try {
      userDetails = (await this.userEntity.getUserByEmail(email)) as unknown as IUser;
      if (userDetails) {
        const token = userDetails.accessToken;
        const emailFolders = await this.outlookBundleApis.getEmailFolders(token);
        return emailFolders;
      }
      return { message: MESSAGES.PLEASE_LOGIN_AGAIN, status: 200 };
    } catch (error) {
      error = error?.response?.data || error;
      this.loggingService.logError(error.message, error);
      if (userDetails) {
        const response = await this.userEntity.deleteUser(userDetails.id);
        return response;
      }
    }
  }
}
