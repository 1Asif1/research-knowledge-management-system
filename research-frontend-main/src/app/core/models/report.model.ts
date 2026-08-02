// Matches ReportService DTOs.

export interface PublicationReportRequest {
  title: string;
  authorId: number;
  status: string;
  payload?: string;
}

export interface ReportResponse {
  reportId: number;
  reportType: string;
  generatedDate: string;
  title: string;
  authorId: number;
  paperStatus: string;
  payload: string;
}

export interface AnnualReportSummaryResponse {
  year: number;
  totalReports: number;
  publicationReports: number;
}

export interface PublishedPaperSummaryResponse {
  paperId: number;
  publicationId: number;
  title: string;
  authorName: string;
  publishedDate: string;
}

export interface PaperVersionReportDto {
  versionNumber: number;
  fileName: string;
  changeSummary: string;
  uploadedBy: string;
  uploadedDate: string;
}

export interface StatusHistoryReportDto {
  historyId: number;
  action: string;
  performedBy: string;
  remarks: string;
  actionDate: string;
}

export interface PublishedPaperReportResponse {
  paperId: number;
  publicationId: number;
  title: string;
  description: string;
  authorName: string;
  coAuthors: string[];
  status: string;
  submittedDate: string;
  publishedDate: string;
  completionTimeDays: number;
  completionTimeFormatted: string;
  totalVersionsSubmitted: number;
  versions: PaperVersionReportDto[];
  statusHistory: StatusHistoryReportDto[];
}

export interface RecommendationSummaryResponse {
  accept: number;
  minorRevision: number;
  majorRevision: number;
  reject: number;
  pending: number;
}

export interface ReviewerWorkloadResponse {
  reviewerId: number;
  assigned: number;
  completed: number;
  pending: number;
}

export interface EditorReportSummaryResponse {
  editorId: number;
  totalPapers: number;
  pendingAssignment: number;
  underReview: number;
  awaitingDecision: number;
  accepted: number;
  rejected: number;
  published: number;
  recommendations: RecommendationSummaryResponse;
  reviewerWorkloads: ReviewerWorkloadResponse[];
}
