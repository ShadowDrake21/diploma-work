import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
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
import { UserRole } from '@shared/enums/user.enum';
import { UserService } from '@core/services/users/user.service';
import { currentUserSig } from '@core/shared/shared-signals';
import { UserStore } from '@core/services/stores/user-store.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private apiUrl = 'http://localhost:8080/api/auth';

  private currentUserSubject = new BehaviorSubject<IJwtPayload | null>(null);
  private rememberSessionSubject = new BehaviorSubject<boolean>(false);
  private sessionWarningSubject = new Subject<number>();
  private tokenRefreshedSubject = new Subject<string | null>();

  // Public observables
  public currentUser$ = this.currentUserSubject.asObservable();
  public rememberSession$ = this.rememberSessionSubject.asObservable();
  public sessionWarning$ = this.sessionWarningSubject.asObservable();
  public tokenRefreshed$ = this.tokenRefreshedSubject.asObservable();

  // State flags
  public isRefreshingToken = false;

  constructor() {
    this.initializeAuthState();
  }

  /* ------------------------- Public API Methods ------------------------- */

  public getToken(): string | null {
    return (
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    );
  }

  public decodeToken(token: string): IJwtPayload | null {
    try {
      return jwtDecode<IJwtPayload>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = this.decodeToken(token);
    return decoded ? !this.isTokenExpired(decoded) : false;
  }

  public getCurrentUser(): IJwtPayload | null {
    return this.currentUserSubject.value;
  }

  public getCurrentUserId(): number | null {
    return this.currentUserSubject.value?.userId || null;
  }

  public getUserRole(): UserRole | null {
    return this.currentUserSubject.value?.role || null;
  }

  public isAdmin(): boolean {
    const role = this.getUserRole();
    return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  }

  public isSuperAdmin(): boolean {
    return this.getUserRole() === UserRole.SUPER_ADMIN;
  }

  public setRememberSession(remember: boolean): void {
    this.rememberSessionSubject.next(remember);
    const storage = this.getCurrentStorage();
    storage.setItem('rememberSession', remember.toString());
  }

  public getRememberSession(): boolean {
    const storage = this.getCurrentStorage();
    return storage.getItem('rememberSession') === 'true';
  }

  /* ------------------------- Authentication Methods ------------------------- */

  public login(credentials: ILoginRequest): Observable<IAuthResponse> {
    return this.http
      .post<ApiResponse<IAuthResponse>>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) =>
          this.handleLoginResponse(response, credentials.rememberMe)
        ),
        map((response) => response.data),
        catchError((error) => {
          this.clearAuthData();
          throw error;
        })
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
        tap((response) => this.handleLoginResponse(response, true)), // Default to remember after verification
        map((response) => response.data)
      );
  }

  public logout(): void {
    this.http.post<ApiResponse<string>>(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.handleLogoutSuccess(),
      error: (error) => this.handleLogoutError(error),
    });
  }

  /* ------------------------- Token Management ------------------------- */

  public refreshToken(): Observable<string | null> {
    this.isRefreshingToken = true;

    return this.http
      .post<ApiResponse<IAuthResponse>>(`${this.apiUrl}/refresh-token`, {
        rememberMe: this.getRememberSession(),
      })
      .pipe(
        tap((response) => this.handleRefreshResponse(response)),
        map((response) => response.data?.authToken || null),
        catchError((error) => {
          console.error('Token refresh failed:', error);
          this.tokenRefreshedSubject.next(null);
          return of(null);
        }),
        tap(() => (this.isRefreshingToken = false))
      );
  }

  public checkAndRefreshToken(): Observable<string | null> {
    const token = this.getToken();
    if (!token) return of(null);

    const decoded = this.decodeToken(token);
    if (!decoded || this.isTokenExpired(decoded)) return of(null);

    const timeLeft = this.getTokenTimeLeft(decoded);
    const refreshThreshold = 15 * 60 * 1000; // 15 minutes

    if (timeLeft > refreshThreshold) return of(token);

    return this.refreshToken().pipe(
      tap({
        next: (newToken) => this.handleRefreshResult(newToken, timeLeft),
        error: () => this.handleRefreshError(timeLeft),
      }),
      switchMap((newToken) => of(newToken || token)),
      catchError(() => of(token)) // Fallback to original token
    );
  }

  /* ------------------------- Password Reset ------------------------- */

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

  /* ------------------------- Private Helpers ------------------------- */

  private initializeAuthState(): void {
    const token = this.getToken();
    if (!token) return;

    const decoded = this.decodeToken(token);
    if (decoded && !this.isTokenExpired(decoded)) {
      this.currentUserSubject.next(decoded);
    } else {
      this.clearAuthData();
    }
  }

  private handleLoginResponse(
    response: ApiResponse<IAuthResponse>,
    rememberMe: boolean
  ): void {
    if (response.success && response.data?.authToken) {
      const storage = this.getStorage(rememberMe);
      storage.setItem('authToken', response.data.authToken);

      const decoded = this.decodeToken(response.data.authToken);
      if (!decoded) throw new Error('Invalid token');

      this.currentUserSubject.next(decoded);
      this.setRememberSession(rememberMe);
    }
  }

  private handleRefreshResponse(response: ApiResponse<IAuthResponse>): void {
    if (response.success && response.data?.authToken) {
      const storage = this.getCurrentStorage();
      storage.setItem('authToken', response.data.authToken);

      const decoded = this.decodeToken(response.data.authToken);
      if (decoded) {
        this.currentUserSubject.next(decoded);
      }

      this.tokenRefreshedSubject.next(response.data.authToken);
    } else {
      this.tokenRefreshedSubject.next(null);
    }
  }

  private handleRefreshResult(newToken: string | null, timeLeft: number): void {
    if (!newToken && timeLeft > 0) {
      this.sessionWarningSubject.next(timeLeft);
    }
  }

  private handleRefreshError(timeLeft: number): void {
    if (timeLeft > 0) {
      this.sessionWarningSubject.next(timeLeft);
    }
  }

  private handleLogoutSuccess(): void {
    this.clearAuthData();
    this.router.navigate(['/authentication/sign-in']);
  }

  private handleLogoutError(error: any): void {
    console.error('Logout error:', error);
    this.clearAuthData();
    this.router.navigate(['/authentication/sign-in']);
  }

  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }

  private getStorage(rememberMe: boolean): Storage {
    return rememberMe ? localStorage : sessionStorage;
  }

  private getCurrentStorage(): Storage {
    return localStorage.getItem('authToken') ? localStorage : sessionStorage;
  }

  private isTokenExpired(decodedToken: IJwtPayload): boolean {
    return decodedToken.exp ? decodedToken.exp < Date.now() / 1000 : false;
  }

  private getTokenTimeLeft(decodedToken: IJwtPayload): number {
    return decodedToken.exp * 1000 - Date.now();
  }
}
