import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { AssignReviewerRequest, AvailableReviewerResponse, EditorDecisionRequest, ReviewProcessResponse } from '@core/models';

@Injectable({ providedIn: 'root' })
export class EditorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrls.review}/editor`;

  getPendingReviews(): Observable<ReviewProcessResponse[]> {
    return this.http.get<ReviewProcessResponse[]>(`${this.baseUrl}/reviews/pending`);
  }

  getAvailableReviewers(): Observable<AvailableReviewerResponse[]> {
    return this.http.get<AvailableReviewerResponse[]>(`${this.baseUrl}/reviewers`);
  }

  assignReviewer(request: AssignReviewerRequest): Observable<ReviewProcessResponse> {
    return this.http.post<ReviewProcessResponse>(`${this.baseUrl}/assign-reviewer`, request);
  }

  makeFinalDecision(reviewId: number, request: EditorDecisionRequest): Observable<ReviewProcessResponse> {
    return this.http.put<ReviewProcessResponse>(`${this.baseUrl}/reviews/${reviewId}/decision`, request);
  }

  getAssignedReviews(editorId: number): Observable<ReviewProcessResponse[]> {
    return this.http.get<ReviewProcessResponse[]>(`${this.baseUrl}/${editorId}/reviews`);
  }

  getReview(reviewId: number): Observable<ReviewProcessResponse> {
    return this.http.get<ReviewProcessResponse>(`${this.baseUrl}/reviews/${reviewId}`);
  }
}
