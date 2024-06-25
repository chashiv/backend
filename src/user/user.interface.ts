import { Uuid } from '@elastic/elasticsearch/lib/api/types';

export interface IUser {
  id: Uuid;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  mobilePhone?: string;
  bussinessPhone?: string;
  displayName: string;
  scope: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  extExpiresIn: number;
  expiryTimestamp: Date;
  metadata?: Record<string, any>;
}

export enum UserFieldsEnum {
  id = 'id',
  userId = 'userId',
  name = 'name',
  email = 'email',
  firstName = 'firstName',
  lastName = 'lastName',
  mobilePhone = 'mobilePhone',
  bussinessPhone = 'bussinessPhone',
  displayName = 'displayName',
  scope = 'scope',
  accessToken = 'accessToken',
  expiresIn = 'expiresIn',
  extExpiresIn = 'extExpiresIn',
  expiryTimestamp = 'expiryTimestamp',
  metadata = 'metadata',
}
