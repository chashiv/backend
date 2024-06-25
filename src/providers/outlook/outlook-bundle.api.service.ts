import { generateId } from 'src/utils';
import {
  PERMISSIONS,
  GRANT_TYPE_ENUM,
  AUTHORISATION_BASE_URL,
  MICROSOFT_GRAPH_BASE_URL,
} from './outlook.enum';
import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/logger/logging.service';
import { OutlookMailFoldersResponse } from './outlook.interface';

@Injectable()
export class OutLookBundleApiService {
  constructor(private loggingService: LoggingService) {}

  listMails = async (token: string) => {
    try {
      const emails = await axios.get(`${MICROSOFT_GRAPH_BASE_URL}/v1.0/me/messages`, {
        params: {
          count: true,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return emails.data;
    } catch (error) {
      error = error?.response?.data || error;
      this.loggingService.logError(error.error_description || error.message, error);
    }
  };

  getSignedInUserDetails = async (token: string) => {
    try {
      const url = `${MICROSOFT_GRAPH_BASE_URL}/v1.0/me`;
      const userDetails = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return userDetails.data;
    } catch (error) {
      error = error?.response?.data || error;
      this.loggingService.logError(error.error_description || error.message, error);
    }
  };

  async getEmailFolders(token: string): Promise<OutlookMailFoldersResponse> {
    try {
      const emailFoldersResponse = await axios.get(`${MICROSOFT_GRAPH_BASE_URL}/v1.0/me/mailFolders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return emailFoldersResponse.data;
    } catch (error) {
      error = error?.response?.data || error;
      this.loggingService.logError(error.error_description || error.message, error);
    }
  }

  getAuthorisationUrl = (clientId: string, redirectUrl: string) => {
    return (
      `${AUTHORISATION_BASE_URL}/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}` +
      `&response_type=code` +
      `&redirect_uri=${redirectUrl}` +
      `&response_mode=query` +
      `&scope=${PERMISSIONS}` +
      `&state=${generateId('OUTLOOK')}`
    );
  };

  getTokenFromCode = async (
    code: string,
    clientId: string,
    redirectUrl: string,
    clientSecret: string,
  ) => {
    try {
      const tokenDetailsResponse = await axios.post(
        `${AUTHORISATION_BASE_URL}/common/oauth2/v2.0/token`,
        {
          code: code,
          scope: PERMISSIONS,
          client_id: clientId,
          redirect_uri: redirectUrl,
          client_secret: clientSecret,
          grant_type: GRANT_TYPE_ENUM.AUHTORISATION_CODE,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return tokenDetailsResponse.data;
    } catch (error) {
      error = error?.response?.data || error;
      this.loggingService.logError(error.error_description || error.message, error);
    }
  };
}
