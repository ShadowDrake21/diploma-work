import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '@core/constants/default-variables';
import { IAuthorizedUser, ICreateUser } from '@shared/types/users.types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = BASE_URL + 'users';

  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return token
      ? {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
          }),
        }
      : {};
  }

  public createUser(user: ICreateUser): Observable<IAuthorizedUser> {
    return this.http.post<IAuthorizedUser>(
      this.apiUrl,
      user,
      this.getAuthHeaders()
    );
  }

  public getUserById(id: number): Observable<IAuthorizedUser> {
    return this.http.get<IAuthorizedUser>(`${this.apiUrl}/${id}`);
  }

  public getUserByEmail(email: string): Observable<IAuthorizedUser> {
    return this.http.get<IAuthorizedUser>(
      `${this.apiUrl}/email/${email}`,
      this.getAuthHeaders()
    );
  }

  public getUsersByRole(role: string): Observable<IAuthorizedUser[]> {
    return this.http.get<IAuthorizedUser[]>(
      `${this.apiUrl}/role/${role}`,
      this.getAuthHeaders()
    );
  }

  public userExistsByEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/exists/${email}`,
      this.getAuthHeaders()
    );
  }

  // Delete User by ID
  public deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      this.getAuthHeaders()
    );
  }
}
