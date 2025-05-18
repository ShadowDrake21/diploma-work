import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import {
  IAuthResponse,
  ILoginRequest,
  IRegisterRequest,
  IRequestPasswordReset,
  IResetPasswordRequest,
  IVerifyRequest,
} from '@shared/types/auth.types';
import { ApiResponse } from '@models/api-response.model';
import { IJwtPayload } from '@shared/types/jwt.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8080/api/auth';

  private currentUserSub!: BehaviorSubject<IJwtPayload | null>;
  public currentUser!: Observable<IJwtPayload | null>;

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded && !this.isTokenExpired(decoded)) {
        this.currentUserSub.next(decoded);
      } else {
        this.clearAuthData();
      }
    }
  }

  public getToken(): string | null {
    return (
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    );
  }

  private getStorage(rememberMe: boolean): Storage {
    return rememberMe ? localStorage : sessionStorage;
  }

  private decodeToken(token: string): IJwtPayload | null {
    try {
      return jwtDecode<IJwtPayload>(token);
    } catch (error) {
      console.log('Error decoding token', error);
      return null;
    }
  }

  private isTokenExpired(decodedToken: IJwtPayload): boolean {
    return decodedToken.exp ? decodedToken.exp < Date.now() / 1000 : false;
  }

  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    this.currentUserSub.next(null);
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decodedToken = this.decodeToken(token);
    return decodedToken ? !this.isTokenExpired(decodedToken) : false;
  }

  public login(credentials: ILoginRequest): Observable<IAuthResponse> {
    return this.http
      .post<ApiResponse<IAuthResponse>>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.success && response.data?.authToken) {
            const storage = this.getStorage(credentials.rememberMe);
            storage.setItem('authToken', response.data.authToken);

            const decoded = this.decodeToken(response.data.authToken);
            if (decoded) {
              this.currentUserSub.next(decoded);
            }
          }
        }),
        map((response) => response.data)
      );
  }

  public register(userData: IRegisterRequest): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(`${this.apiUrl}/register`, userData)
      .pipe(map((response) => response.data));
  }

  public verifyUser(verifyData: IVerifyRequest): Observable<IAuthResponse> {
    return this.http
      .post<ApiResponse<IAuthResponse>>(`${this.apiUrl}/verify`, verifyData)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            localStorage.setItem('authToken', response.data.authToken);
            this.currentUserSub.next(this.decodeToken(response.data.authToken));
          }
        }),
        map((response) => response.data)
      );
  }

  public requestPasswordReset(
    request: IRequestPasswordReset
  ): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(
        `${this.apiUrl}/request-password-reset`,
        request
      )
      .pipe(map((response) => response.data));
  }

  public resetPassword(request: IResetPasswordRequest): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(`${this.apiUrl}/reset-password`, request)
      .pipe(map((response) => response.data));
  }

  public getCurrentUserId(): number | null {
    return this.currentUserSub.value?.userId || null;
  }

  public getCurrentUser(): IJwtPayload | null {
    return this.currentUserSub.value;
  }

  public logout() {
    this.http.post<ApiResponse<string>>(`${this.apiUrl}/logout`, {}).subscribe({
      next: (response) => {
        this.clearAuthData();
        this.router.navigate(['/authentication/sign-in']);
      },
      error: (error) => {
        console.error('Logout error', error);
        this.clearAuthData();
        this.router.navigate(['/authentication/sign-in']);
      },
    });
  }
}
