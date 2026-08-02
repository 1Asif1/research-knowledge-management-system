import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AnnualReportSummaryResponse, EditorReportSummaryResponse, PublicationReportRequest, PublishedPaperReportResponse, PublishedPaperSummaryResponse, ReportResponse } from '@core/models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrls.report;

  createPublicationReport(request: PublicationReportRequest): Observable<ReportResponse> {
    return this.http.post<ReportResponse>(`${this.baseUrl}/publication`, request);
  }

  getReports(): Observable<ReportResponse[]> {
    return this.http.get<ReportResponse[]>(this.baseUrl);
  }

  getAnnualSummary(year: number): Observable<AnnualReportSummaryResponse> {
    return this.http.get<AnnualReportSummaryResponse>(`${this.baseUrl}/annual`, {
      params: { year }
    });
  }

  getEditorSummary(editorId: number): Observable<EditorReportSummaryResponse> {
    return this.http.get<EditorReportSummaryResponse>(`${this.baseUrl}/editor/${editorId}`);
  }

  getPublishedPapers(): Observable<PublishedPaperSummaryResponse[]> {
    return this.http.get<PublishedPaperSummaryResponse[]>(`${this.baseUrl}/published-papers`);
  }

  getPublishedPaperReport(paperId: number): Observable<PublishedPaperReportResponse> {
    return this.http.get<PublishedPaperReportResponse>(`${this.baseUrl}/published-paper/${paperId}`);
  }

  downloadPublishedPaperReportPdf(paperId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/published-paper/${paperId}/pdf`, {
      responseType: 'blob'
    });
  }
}
