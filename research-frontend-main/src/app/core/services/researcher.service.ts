import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PaperSubmissionResponse } from '@core/models';

@Injectable({ providedIn: 'root' })
export class ResearcherService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrls.review}/researcher`;

  submitPaper(title: string, abstractText: string, researcherId: number, file: File): Observable<PaperSubmissionResponse> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('abstractText', abstractText);
    formData.append('researcherId', researcherId.toString());
    formData.append('file', file);
    return this.http.post<PaperSubmissionResponse>(`${this.baseUrl}/papers`, formData);
  }

  uploadNewVersion(paperId: number, file: File, changeSummary?: string): Observable<PaperSubmissionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (changeSummary) {
      formData.append('changeSummary', changeSummary);
    }
    return this.http.put<PaperSubmissionResponse>(`${this.baseUrl}/papers/${paperId}/versions`, formData);
  }

  getMySubmissions(researcherId: number): Observable<PaperSubmissionResponse[]> {
    return this.http.get<PaperSubmissionResponse[]>(`${this.baseUrl}/${researcherId}/papers`);
  }

  getSubmission(paperId: number): Observable<PaperSubmissionResponse> {
    return this.http.get<PaperSubmissionResponse>(`${this.baseUrl}/papers/${paperId}`);
  }

  downloadCurrentPaperPdf(paperId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/papers/${paperId}/download`, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
