export interface IGenericMailFolderResponse {
  [key: string]: string;
}

interface IGenericEmailResponse {
  id: string;
  subject: string;
  folderId: string;
  folderName: string;
  sender: string;
  receiver: string;
  originalFolderId: string;
}

export interface IGenericEmailListResponse extends Array<IGenericEmailResponse> {}
