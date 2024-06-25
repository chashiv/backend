import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OutLookBundleApiService } from './outlook-bundle.api.service';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from 'src/user/user.entity';
import { IUser } from 'src/user/user.interface';
import { LoggingService } from 'src/logger/logging.service';
import * as moment from 'moment';
import { MESSAGES } from './outlook.enum';
import { ElasticService } from 'src/elastic/elastic.service';
import { UtilService } from 'src/common/util/util.service';
import { IGenericEmailListResponse, IGenericMailFolderResponse } from 'src/mail/mail.interface';
import { IOutlookEmailListResponse, IOutlookMailFoldersResponse } from './outlook.interface';
import { Document } from 'src/elastic/elastic.interface';

@Injectable()
export class OutlookService {
  private readonly clientId: string;
  private readonly redirectUrl: string;
  private readonly clientSecret: string;
  private readonly outlook: string = 'outlook';

  constructor(
    private userEntity: UserEntity,
    private utilService: UtilService,
    private configService: ConfigService,
    private loggingService: LoggingService,
    private elasticSearchService: ElasticService,
    private outlookBundleApis: OutLookBundleApiService,
  ) {
    this.clientId = this.configService.getOrThrow<string>('OUTLOOK_CLIENT_ID');
    this.redirectUrl = this.configService.getOrThrow<string>('OUTLOOK_CALLBACK_URL');
    this.clientSecret = this.configService.getOrThrow<string>('OUTLOOK_CLIENT_SECRET');
  }

  private getParsedUserResponse(userDetails): IUser {
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

  private getIndex = (userId: string, suffix: string) => {
    return `${this.outlook}-${userId}-${suffix}`;
  };

  private getParsedMailFoldersResponse = (
    mailFolderResponse: IOutlookMailFoldersResponse,
  ): IGenericMailFolderResponse => {
    const parsedMailFoldersResponse: IGenericMailFolderResponse = {};
    mailFolderResponse.value.forEach((response) => {
      parsedMailFoldersResponse[this.utilService.shortenString(response.id)] = response?.displayName;
    });
    return parsedMailFoldersResponse;
  };

  private getMailFoldersIdMap = async (userId: string) => {
    const userIndex = this.getIndex(userId, 'folders');
    const folderIdNameMap = await this.elasticSearchService.search(userIndex);
    return folderIdNameMap.length ? folderIdNameMap[0]._source : null;
  };

  private getParsedEmailListResponse = async (
    emailListResponse: IOutlookEmailListResponse,
    folderIdNameMap: IGenericMailFolderResponse,
  ): Promise<IGenericEmailListResponse> => {
    const parsedEmailListResponse: IGenericEmailListResponse = [];
    emailListResponse.value.forEach((response) => {
      const shortenedFolderId = this.utilService.shortenString(response.parentFolderId);
      parsedEmailListResponse.push({
        id: this.utilService.shortenString(response.id),
        subject: response?.subject,
        folderId: shortenedFolderId,
        folderName: folderIdNameMap[shortenedFolderId],
        sender: response?.sender?.emailAddress?.address,
        receiver: response?.toRecipients?.[0]?.emailAddress?.name,
        originalFolderId: response?.parentFolderId,
      });
    });
    return parsedEmailListResponse;
  };

  private async syncParsedResponse(
    parsedResponse: IGenericMailFolderResponse,
    userId: string,
    suffix: string,
  ) {
    const userIdIndex = this.getIndex(userId, suffix);
    await this.elasticSearchService.update(
      userIdIndex,
      userId,
      parsedResponse as unknown as Document,
      parsedResponse as unknown as Document,
    );
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
      await this.userEntity.saveUser(this.getParsedUserResponse({ ...userDetails, ...tokenDetails }));
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

        let count = true;
        let nextUrl: string = null;

        const mailFolderIdMap = await this.getMailFoldersIdMap(userDetails.id);

        while ((nextUrl || count) && mailFolderIdMap) {
          const emailListResponse: IOutlookEmailListResponse = await this.outlookBundleApis.listMails(
            token,
            count,
            nextUrl,
          );
          if (emailListResponse.value.length) {
            const parsedEmailListResponse: IGenericEmailListResponse =
              await this.getParsedEmailListResponse(
                emailListResponse,
                mailFolderIdMap as IGenericMailFolderResponse,
              );

            await this.elasticSearchService.bulkInsert(
              this.getIndex(userDetails.id, 'mails'),
              parsedEmailListResponse as unknown as Document[],
            );

            nextUrl = emailListResponse?.['@odata.nextLink'];
            if (nextUrl) {
              count = false;
            }
          } else {
            nextUrl = null;
          }
        }
      }
      return { message: MESSAGES.PLEASE_LOGIN_AGAIN, status: 200 };
    } catch (error) {
      error = error?.response?.data || error;
      this.loggingService.logError(error.message, error);
      if (userDetails) {
        const response = await this.userEntity.deleteUser(userDetails.id);
        return response;
      }
      return { message: MESSAGES.BAD_REQUEST, status: 400 };
    }
  }

  async getEmailFolders(email: string) {
    let userDetails: IUser;
    try {
      userDetails = (await this.userEntity.getUserByEmail(email)) as unknown as IUser;
      if (userDetails) {
        const token = userDetails.accessToken;
        const emailFoldersResponse: IOutlookMailFoldersResponse =
          await this.outlookBundleApis.getEmailFolders(token);
        const parsedEmailFolderResponse: IGenericMailFolderResponse =
          this.getParsedMailFoldersResponse(emailFoldersResponse);
        this.syncParsedResponse(parsedEmailFolderResponse, userDetails.id, 'folders');
        return emailFoldersResponse;
      }
      return { message: MESSAGES.PLEASE_LOGIN_AGAIN, status: 200 };
    } catch (error) {
      error = error?.response?.data || error;
      this.loggingService.logError(error.message, error);
      if (userDetails) {
        await this.userEntity.deleteUser(userDetails.id);
        return { message: MESSAGES.PLEASE_LOGIN_AGAIN, status: 400 };
      }
      return { message: MESSAGES.BAD_REQUEST, status: 400 };
    }
  }
}
