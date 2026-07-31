// Matches PaperService DTOs (PaperController / PaperVersionController / PublicationController)

export interface PaperRequest {
  title: string;
  description: string;
  authorId: number;
  status: string;
  coAuthors: string[];
}

export interface UpdatePaperRequest {
  title?: string;
  description?: string;
}

export interface PaperResponse {
  id: number;
  title: string;
  description: string;
  authorName: string;
  status: string;
  coAuthors: string[];
}

export interface PublishPaperRequest {
  paperId: number;
  journalName: string;
  publishedDate: string; // ISO date (yyyy-MM-dd)
}

export interface PublicationResponse {
  id: number;
  paperId: number;
  title: string;
  journal: string;
  publishedDate: string;
}

export interface FileUploadResponse {
  fileName: string;
  originalFileName: string;
  fileSize: number;
  description: string;
}
