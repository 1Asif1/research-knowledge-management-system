import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AnnualReportSummaryResponse, PublicationReportRequest, ReportResponse } from '@core/models';

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
}
