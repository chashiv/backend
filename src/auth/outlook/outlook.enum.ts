export const AUTHORISATION_BASE_URL = 'https://login.microsoftonline.com';
export const MICROSOFT_GRAPH_BASE_URL = 'https://graph.microsoft.com';

export enum GRANT_TYPE_ENUM {
  AUHTORISATION_CODE = 'authorization_code',
}

export const PERMISSIONS = 'User.Read User.ReadBasic.All Mail.ReadBasic';

export enum MESSAGES {
  PLEASE_LOGIN_AGAIN = 'Please login again',
}
