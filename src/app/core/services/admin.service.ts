import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ApiResponse, PaginatedResponse } from '@models/api-response.model';
import { IUser } from '@models/user.model';
import {
  AdminInviteRequest,
  AuthResponse,
  RegisterRequest,
} from '@shared/types/admin.types';
import { getAuthHeaders } from '@shared/utils/auth.utils';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = BASE_URL + 'admin';

  inviteAdmin(request: AdminInviteRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/invite`,
      request
    );
  }

  completeAdminRegistration(
    token: string,
    request: RegisterRequest
  ): Observable<ApiResponse<AuthResponse>> {
    const params = new HttpParams().set('token', token);
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/complete-registration`,
      request,
      { params }
    );
  }

  getAllUsers(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id'
  ): Observable<PaginatedResponse<IUser>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy);

    return this.http.get<PaginatedResponse<IUser>>(`${this.apiUrl}/users`, {
      params,
    });
  }

  promoteToAdmin(userId: number): Observable<ApiResponse<IUser>> {
    return this.http.post<ApiResponse<IUser>>(
      `${this.apiUrl}/users/${userId}/promote`,
      {}
    );
  }

  demoteFromAdmin(userId: number): Observable<ApiResponse<IUser>> {
    return this.http.post<ApiResponse<IUser>>(
      `${this.apiUrl}/users/${userId}/demote`,
      {}
    );
  }

  deactivateUser(userId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/users/${userId}/deactivate`,
      {}
    );
  }

  deleteUser(userId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/users/${userId}`
    );
  }

  reactivateUser(userId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/users/${userId}/reactivate`,
      {}
    );
  }
}
