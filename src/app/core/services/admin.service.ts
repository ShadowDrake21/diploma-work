import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { ApiResponse, PaginatedResponse } from '@models/api-response.model';
import { PatentDTO } from '@models/patent.model';
import { ProjectResponse, ProjectWithDetails } from '@models/project.model';
import { PublicationDTO } from '@models/publication.model';
import { ResearchDTO } from '@models/research.model';
import { IUser } from '@models/user.model';
import { AdminInvitation } from '@pages/admin/components/user-management/components/types/invitation-list.types';
import {
  AdminInviteRequest,
  AuthResponse,
  RegisterRequest,
} from '@shared/types/admin.types';
import { IComment } from '@shared/types/comment.types';
import { getAuthHeaders } from '@core/utils/auth.utils';
import { map, Observable, tap } from 'rxjs';
import { UserLogin } from '@models/user-login.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = BASE_URL + 'admin';

  projects = signal<ProjectResponse[]>([]);
  publications = signal<PublicationDTO[]>([]);
  patents = signal<PatentDTO[]>([]);
  researches = signal<ResearchDTO[]>([]);
  comments = signal<IComment[]>([]);

  projectsPagination = signal({ page: 0, size: 10, total: 0 });
  publicationsPagination = signal({ page: 0, size: 10, total: 0 });
  patentsPagination = signal({ page: 0, size: 10, total: 0 });
  researchesPagination = signal({ page: 0, size: 10, total: 0 });
  commentsPagination = signal({ page: 0, size: 10, total: 0 });

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

  validateAdminInviteToken(token: string, email: string): Observable<boolean> {
    const params = new HttpParams().set('token', token).set('email', email);

    return this.http
      .get<ApiResponse<{ isValid: boolean }>>(
        `${this.apiUrl}/validate-invite-token`,
        { params }
      )
      .pipe(map((response) => response.data?.isValid ?? false));
  }

  getAdminInvitations(
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<AdminInvitation>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginatedResponse<AdminInvitation>>(
      `${this.apiUrl}/invitations`,
      { params }
    );
  }

  resendInvitation(invitationId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/invitations/${invitationId}/resend`,
      {}
    );
  }

  revokeInvitation(invitationId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/invitations/${invitationId}`
    );
  }

  getProjectsWithDetails(
    page: number = 0,
    pageSize: number = 10
  ): Observable<PaginatedResponse<ProjectWithDetails>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PaginatedResponse<ProjectWithDetails>>(
      `${this.apiUrl}/with-details`,
      {
        ...getAuthHeaders(),
        params,
      }
    );
  }

  loadAllProjects(
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<ProjectResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<PaginatedResponse<ProjectResponse>>(`${this.apiUrl}/projects`, {
        params,
      })
      .pipe(
        tap((response) => {
          this.projects.set(response.data);
          this.projectsPagination.set({
            page,
            size,
            total: response.totalItems,
          });
          return response;
        })
      );
  }

  loadAllComments(
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<IComment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<PaginatedResponse<IComment>>(`${this.apiUrl}/comments`, {
        params,
      })
      .pipe(
        tap((response) => {
          this.comments.set(response.data);
          this.commentsPagination.set({
            page,
            size,
            total: response.totalItems,
          });
          return response;
        })
      );
  }

  deleteComment(commentId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/comments/${commentId}`
    );
  }

  getRecentLogins(count: number = 10): Observable<ApiResponse<UserLogin[]>> {
    return this.http.get<ApiResponse<UserLogin[]>>(
      `${this.apiUrl}/recent-logins?count=${count}`,
      getAuthHeaders()
    );
  }

  getLoginStats(hours: number = 24): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(
      `${this.apiUrl}/login-stats?hours=${hours}`,
      getAuthHeaders()
    );
  }
}
