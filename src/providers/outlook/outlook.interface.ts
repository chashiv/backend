interface IOutlookMailFolder {
  id: string;
  displayName: string;
  parentFolderId: string;
  childFolderCount: number;
  unreadItemCount: number;
  totalItemCount: number;
  sizeInBytes: number;
  isHidden: boolean;
}

export interface IOutlookMailFoldersResponse {
  '@odata.context': string;
  value: IOutlookMailFolder[];
}

interface IEmailAddress {
  name: string;
  address: string;
}

interface IRecipient {
  emailAddress: IEmailAddress;
}

interface IFlag {
  flagStatus: string;
}

interface IMessage {
  '@odata.etag': string;
  id: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  changeKey: string;
  categories: string[];
  receivedDateTime: string;
  sentDateTime: string;
  hasAttachments: boolean;
  internetMessageId: string;
  subject: string;
  importance: string;
  parentFolderId: string;
  conversationId: string;
  conversationIndex: string;
  isDeliveryReceiptRequested: boolean | null;
  isReadReceiptRequested: boolean;
  isRead: boolean;
  isDraft: boolean;
  webLink: string;
  inferenceClassification: string;
  sender: {
    emailAddress: IEmailAddress;
  };
  from: {
    emailAddress: IEmailAddress;
  };
  toRecipients: IRecipient[];
  ccRecipients: IRecipient[];
  bccRecipients: IRecipient[];
  replyTo: IRecipient[];
  flag: IFlag;
}

export interface IOutlookEmailListResponse {
  '@odata.context': string;
  '@odata.count': number;
  '@odata.nextLink': string;
  value: IMessage[];
}
