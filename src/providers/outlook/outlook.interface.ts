interface OutlookMailFolder {
  id: string;
  displayName: string;
  parentFolderId: string;
  childFolderCount: number;
  unreadItemCount: number;
  totalItemCount: number;
  sizeInBytes: number;
  isHidden: boolean;
}

export interface OutlookMailFoldersResponse {
  '@odata.context': string;
  value: OutlookMailFolder[];
}
