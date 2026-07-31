import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { UserRequest, UpdateUserRequest, UserResponse } from '@core/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrls.user;

  createUser(request: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.baseUrl, request);
  }

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.baseUrl);
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/${id}`);
  }

  getUserByEmail(email: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/email/${encodeURIComponent(email)}`);
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.baseUrl}/${id}`, request);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
