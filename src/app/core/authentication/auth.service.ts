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
    const token = localStorage.getItem('authToken');
    const user = token ? this.decodeToken(token) : null;
    console.log('User', user);
    this.currentUserSub = new BehaviorSubject<IJwtPayload | null>(user);
    this.currentUser = this.currentUserSub.asObservable();
  }

  private decodeToken(token: string): IJwtPayload | null {
    try {
      return jwtDecode<IJwtPayload>(token);
    } catch (error) {
      console.log('Error decoding token', error);
      return null;
    }
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    try {
      const decodedToken = this.decodeToken(token);
      if (!decodedToken) return false;
      const isExpired = decodedToken.exp
        ? decodedToken.exp < Date.now() / 1000
        : false;
      return !isExpired;
    } catch (error) {
      console.error('Error decoding token', error);
      return false;
    }
  }

  public login(credentials: ILoginRequest): Observable<IAuthResponse> {
    return this.http
      .post<ApiResponse<IAuthResponse>>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          if (response.success && response.data)
            localStorage.setItem('authToken', response.data.authToken);
          this.currentUserSub.next(this.decodeToken(response.data.authToken));
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
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
      const decodedToken = this.decodeToken(token);
      return decodedToken?.userId || null;
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }

  public getCurrentUser(): IJwtPayload | null {
    return this.currentUserSub.value;
  }

  public logout() {
    localStorage.removeItem('authToken');
    this.currentUserSub.next(null);
    this.router.navigate(['/authentication/sign-in']);
  }
}
