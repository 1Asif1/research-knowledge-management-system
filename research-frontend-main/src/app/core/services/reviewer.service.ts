import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  ReviewProcessResponse,
  ReviewCommentRequest,
  ReviewCommentResponse,
  ReviewRecommendationRequest
} from '@core/models';

@Injectable({ providedIn: 'root' })
export class ReviewerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrls.review}/reviewer`;

  getAssignedReviews(reviewerId: number): Observable<ReviewProcessResponse[]> {
    return this.http.get<ReviewProcessResponse[]>(`${this.baseUrl}/${reviewerId}/reviews`);
  }

  addComment(request: ReviewCommentRequest): Observable<ReviewCommentResponse> {
    return this.http.post<ReviewCommentResponse>(`${this.baseUrl}/comments`, request);
  }

  submitRecommendation(reviewId: number, request: ReviewRecommendationRequest): Observable<ReviewProcessResponse> {
    return this.http.put<ReviewProcessResponse>(`${this.baseUrl}/reviews/${reviewId}/recommendation`, request);
  }

  getComments(reviewId: number): Observable<ReviewCommentResponse[]> {
    return this.http.get<ReviewCommentResponse[]>(`${this.baseUrl}/reviews/${reviewId}/comments`);
  }
}
