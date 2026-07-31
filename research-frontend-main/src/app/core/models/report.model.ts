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
