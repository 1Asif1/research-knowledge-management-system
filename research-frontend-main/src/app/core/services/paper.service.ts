import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import {
  PageResponse,
  PaperRequest,
  UpdatePaperRequest,
  PaperResponse,
  PublishPaperRequest,
  PublicationResponse
} from '@core/models';

@Injectable({ providedIn: 'root' })
export class PaperService {
  private readonly http = inject(HttpClient);
  private readonly paperBaseUrl = `${environment.apiUrls.paper}/papers`;
  private readonly publicationBaseUrl = `${environment.apiUrls.paper}/publications`;

  createPaper(request: PaperRequest): Observable<PaperResponse> {
    return this.http.post<PaperResponse>(this.paperBaseUrl, request);
  }

  updatePaper(paperId: number, request: UpdatePaperRequest): Observable<PaperResponse> {
    return this.http.put<PaperResponse>(`${this.paperBaseUrl}/${paperId}`, request);
  }

  getPaperById(paperId: number): Observable<PaperResponse> {
    return this.http.get<PaperResponse>(`${this.paperBaseUrl}/${paperId}`);
  }

  deletePaper(paperId: number): Observable<string> {
    return this.http.delete(`${this.paperBaseUrl}/${paperId}`, { responseType: 'text' });
  }

  searchPapers(keyword: string, page = 0, size = 10): Observable<PageResponse<PaperResponse>> {
    const params = new HttpParams().set('keyword', keyword).set('page', page).set('size', size);
    return this.http.get<PageResponse<PaperResponse>>(`${this.paperBaseUrl}/search`, { params });
  }

  updateStatus(paperId: number, status: string): Observable<string> {
    const params = new HttpParams().set('status', status);
    return this.http.patch(`${this.paperBaseUrl}/${paperId}/status`, null, { params, responseType: 'text' });
  }

  publishPaper(
    request: PublishPaperRequest
  ): Observable<PublicationResponse> {
    return this.http.post<PublicationResponse>(
      this.publicationBaseUrl,
      request
    );
  }

  getAllPublications(): Observable<PublicationResponse[]> {
    return this.http.get<PublicationResponse[]>(
      this.publicationBaseUrl
    );
  }

  getPublicationById(
    publicationId: number
  ): Observable<PublicationResponse> {
    return this.http.get<PublicationResponse>(
      `${this.publicationBaseUrl}/${publicationId}`
    );
  }

  uploadPaperVersion(paperId: number, file: File, changeNotes?: string): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    if (changeNotes) {
      formData.append('changeNotes', changeNotes);
    }
    return this.http.post(`${this.paperBaseUrl}/${paperId}/versions`, formData, { responseType: 'text' });
  }

  getPaperVersions(paperId: number): Observable<PaperResponse[]> {
    return this.http.get<PaperResponse[]>(`${this.paperBaseUrl}/${paperId}/versions`);
  }

  getPaperVersionContent(paperId: number, versionNumber: number, suppressGlobalError = false): Observable<string> {
    const headers = suppressGlobalError
      ? new HttpHeaders({ 'X-Skip-Global-Error': 'true' })
      : undefined;
    return this.http.get(`${this.paperBaseUrl}/${paperId}/versions/${versionNumber}`, {
      headers,
      responseType: 'text'
    });
  }

  downloadPaperPdfForReviewer(paperId: number, versionNumber: number, suppressGlobalError = false): Observable<Blob> {
    const headers = suppressGlobalError
      ? new HttpHeaders({ 'X-Skip-Global-Error': 'true' })
      : undefined;
    return this.http.get(`${this.paperBaseUrl}/${paperId}/versions/${versionNumber}/download`, {
      headers,
      responseType: 'blob'
    });
  }

  downloadCurrentPaperPdfForReviewer(paperId: number, suppressGlobalError = false): Observable<Blob> {
    const headers = suppressGlobalError
      ? new HttpHeaders({ 'X-Skip-Global-Error': 'true' })
      : undefined;
    return this.http.get(`${this.paperBaseUrl}/${paperId}/download`, {
      headers,
      responseType: 'blob'
    });
  }
}
