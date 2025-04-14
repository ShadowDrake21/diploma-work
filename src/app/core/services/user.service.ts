import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { Project } from '@shared/types/project.types';
import {
  IAuthorizedUser,
  ICreateUser,
  IUpdateUserProfile,
  IUser,
} from '@shared/types/users.types';
import { getAuthHeaders } from '@shared/utils/auth.utils';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = BASE_URL + 'users';

  public getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, getAuthHeaders());
  }

  public createUser(user: ICreateUser): Observable<IAuthorizedUser> {
    return this.http.post<IAuthorizedUser>(this.apiUrl, user, getAuthHeaders());
  }

  public getUserById(id: number): Observable<IAuthorizedUser> {
    return this.http.get<IAuthorizedUser>(
      `${this.apiUrl}/${id}`,
      getAuthHeaders()
    );
  }

  public getUserByEmail(email: string): Observable<IAuthorizedUser> {
    return this.http.get<IAuthorizedUser>(
      `${this.apiUrl}/email/${email}`,
      getAuthHeaders()
    );
  }

  public getUsersByRole(role: string): Observable<IAuthorizedUser[]> {
    return this.http.get<IAuthorizedUser[]>(
      `${this.apiUrl}/role/${role}`,
      getAuthHeaders()
    );
  }

  public userExistsByEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/exists/${email}`,
      getAuthHeaders()
    );
  }

  public getCurrentUser(): Observable<IUser> {
    return this.http.get<IUser>(`${this.apiUrl}/me`, getAuthHeaders());
  }

  public updateUserProfile(profileData: IUpdateUserProfile): Observable<IUser> {
    return this.http.patch<IUser>(
      `${this.apiUrl}/me/profile`,
      profileData,
      getAuthHeaders()
    );
  }

  public updateUserAvatar(file: File): Observable<IUser> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<IUser>(
      `${this.apiUrl}/me/avatar`,
      formData,
      getAuthHeaders()
    );
  }

  public getUserProjects(userId: number): Observable<Project[]> {
    return this.http.get<Project[]>(
      `${this.apiUrl}/${userId}/projects`,
      getAuthHeaders()
    );
  }

  public getCurrentUserProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(
      `${this.apiUrl}/me/projects`,
      getAuthHeaders()
    );
  }

  // Delete User by ID
  public deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, getAuthHeaders());
  }
}
