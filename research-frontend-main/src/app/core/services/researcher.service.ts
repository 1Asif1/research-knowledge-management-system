import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { SubmitPaperRequest, UploadVersionRequest, PaperSubmissionResponse } from '@core/models';

@Injectable({ providedIn: 'root' })
export class ResearcherService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrls.review}/researcher`;

  submitPaper(request: SubmitPaperRequest): Observable<PaperSubmissionResponse> {
    return this.http.post<PaperSubmissionResponse>(`${this.baseUrl}/papers`, request);
  }

  uploadNewVersion(paperId: number, request: UploadVersionRequest): Observable<PaperSubmissionResponse> {
    return this.http.put<PaperSubmissionResponse>(`${this.baseUrl}/papers/${paperId}/versions`, request);
  }

  getMySubmissions(researcherId: number): Observable<PaperSubmissionResponse[]> {
    return this.http.get<PaperSubmissionResponse[]>(`${this.baseUrl}/${researcherId}/papers`);
  }

  getSubmission(paperId: number): Observable<PaperSubmissionResponse> {
    return this.http.get<PaperSubmissionResponse>(`${this.baseUrl}/papers/${paperId}`);
  }
}
