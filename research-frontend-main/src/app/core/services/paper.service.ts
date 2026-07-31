import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import {
  PageResponse,
  PaperRequest,
  UpdatePaperRequest,
  PaperResponse,
  PublishPaperRequest
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

  publishPaper(request: PublishPaperRequest): Observable<string> {
    return this.http.post(this.publicationBaseUrl, request, { responseType: 'text' });
  }

  getPublicationById(publicationId: number): Observable<string> {
    return this.http.get(`${this.publicationBaseUrl}/${publicationId}`, { responseType: 'text' });
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

  getPaperVersionContent(paperId: number, versionId: number): Observable<string> {
    return this.http.get(`${this.paperBaseUrl}/${paperId}/versions/${versionId}`, { responseType: 'text' });
  }
}
