import {
  HttpClient,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
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
  throwError,
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
import { IJwtPayload } from '@shared/types/jwt.types';
import { UserRole } from '@shared/enums/user.enum';
import { UserService } from '@core/services/users/user.service';
import { currentUserSig } from '@core/shared/shared-signals';
import { NotificationService } from '@core/services/notification.service';
import { ApplicationError } from '@core/errors/application-error';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  private apiUrl = 'http://localhost:8080/api/auth';

  private currentUserSubject = new BehaviorSubject<IJwtPayload | null>(null);
  private rememberSessionSubject = new BehaviorSubject<boolean>(false);
  public sessionWarningSubject = new Subject<number>();
  private tokenRefreshedSubject = new Subject<string | null>();

  // Public observables
  public currentUser$ = this.currentUserSubject.asObservable();
  public rememberSession$ = this.rememberSessionSubject.asObservable();
  public sessionWarning$ = this.sessionWarningSubject.asObservable();
  public tokenRefreshed$ = this.tokenRefreshedSubject.asObservable();

  // State flags
  public isRefreshingToken = false;

  public isAdminSig = signal(false);

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
      .post<IAuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) =>
          this.handleLoginResponse(response, credentials.rememberMe)
        ),

        catchError((error) => this.handleAuthError(error))
      );
  }

  public register(userData: IRegisterRequest): Observable<string> {
    return this.http
      .post<string>(`${this.apiUrl}/register`, userData)
      .pipe(catchError((error) => this.handleAuthError(error)));
  }

  public verifyUser(verifyData: IVerifyRequest): Observable<IAuthResponse> {
    return this.http
      .post<IAuthResponse>(`${this.apiUrl}/verify`, verifyData)
      .pipe(
        tap((response) => {
          this.notificationService.showSuccess('User verified successfully');
          this.router.navigate(['/authentication/sign-in']);
        }),

        catchError((error) => this.handleAuthError(error))
      );
  }

  public logout(): void {
    this.http.post<string>(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.handleLogoutSuccess(),
      error: (error) => {
        console.error('Logout error:', error);
        this.handleLogoutSuccess();
      },
    });
  }

  /* ------------------------- Token Management ------------------------- */

  checkTokenStatus(): boolean {
    const token = this.getToken();
    if (!token) {
      this.router.navigate(['/authentication/sign-in']);
      return false;
    }
    const decoded = this.decodeToken(token);
    if (!decoded || this.isTokenExpired(decoded)) {
      this.clearAuthData();
      this.router.navigate(['/authentication/sign-in']);
      return false;
    }
    return true;
  }

  public refreshToken(): Observable<string | null> {
    this.isRefreshingToken = true;

    return this.http
      .post<IAuthResponse>(`${this.apiUrl}/refresh-token`, {
        rememberMe: this.getRememberSession(),
      })
      .pipe(
        tap((response) => this.handleRefreshResponse(response)),
        map((response) => response.authToken || null),
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
    if (!token) {
      this.clearAuthData();
      return of(null);
    }

    const decoded = this.decodeToken(token);
    if (!decoded || this.isTokenExpired(decoded)) {
      this.clearAuthData();
      return of(null);
    }

    const timeLeft = this.getTokenTimeLeft(decoded);
    const refreshThreshold = 15 * 60 * 1000;

    if (timeLeft < refreshThreshold && timeLeft > 0) {
      this.sessionWarningSubject.next(timeLeft);
    }

    if (timeLeft <= refreshThreshold) {
      return this.refreshToken().pipe(
        catchError(() => {
          if (timeLeft > 0) return of(token);
          this.clearAuthData();
          return of(null);
        })
      );
    }
    return of(token);
  }

  private updateAdminState(decoded: IJwtPayload | null): void {
    const isAdmin =
      decoded?.role === UserRole.ADMIN ||
      decoded?.role === UserRole.SUPER_ADMIN;
    this.isAdminSig.set(isAdmin);
  }

  showSessionWarning(timeLeft: number) {
    this.sessionWarningSubject.next(timeLeft);
  }

  /* ------------------------- Password Reset ------------------------- */

  public requestPasswordReset(
    request: IRequestPasswordReset
  ): Observable<string> {
    return this.http
      .post<string>(`${this.apiUrl}/request-password-reset`, request)
      .pipe(catchError((error) => this.handleAuthError(error)));
  }

  public resetPassword(request: IResetPasswordRequest): Observable<string> {
    return this.http
      .post<string>(`${this.apiUrl}/reset-password`, request)
      .pipe(catchError((error) => this.handleAuthError(error)));
  }

  /* ------------------------- Error Handling ------------------------- */

  private handleAuthError(error: any): Observable<never> {
    console.log('Handling authentication error:', error);
    if (error instanceof HttpErrorResponse) {
      if (error.status === HttpStatusCode.TooManyRequests) {
        const retryAfter = error.headers.get('Retry-After') || '60';
        const message = `Забагато запитів. Будь ласка, спробуйте ще раз через ${retryAfter} секунд.`;
        return throwError(() =>
          this.createApplicationError(message, 'RATE_LIMIT_EXCEEDED')
        );
      }
      if (error.error?.message) {
        return throwError(() =>
          this.createApplicationError(
            error.error.message,
            error.error.errorCode || 'SERVER_ERROR'
          )
        );
      }
    }

    if (error instanceof ApplicationError) {
      return throwError(() => error);
    }

    console.log('Unexpected error:', error);
    return throwError(() =>
      this.createApplicationError(
        error.message || 'Сталася неочікувана помилка',
        error.errorCode || 'SERVER_ERROR'
      )
    );
  }

  private createApplicationError(
    message: string,
    code?: string
  ): ApplicationError {
    return new ApplicationError(message, code);
  }

  /* ------------------------- Private Helpers ------------------------- */

  private initializeAuthState(): void {
    console.log('Initializing auth state...');
    const token = this.getToken();
    console.log('Token found in storage:', !!token);

    if (token) {
      try {
        const decoded = this.decodeToken(token);
        if (decoded) {
          if (this.isTokenExpired(decoded)) {
            this.clearAuthData();
          } else {
            this.currentUserSubject.next(decoded);
            return;
          }
        }
      } catch (e) {
        console.error('Token decode error', e);
      }
    }

    console.log('Clearing auth data');
    this.clearAuthData();
  }

  private handleLoginResponse(
    response: IAuthResponse,
    rememberMe: boolean
  ): void {
    if (response.authToken) {
      const storage = this.getStorage(rememberMe);
      storage.setItem('authToken', response.authToken);

      const decoded = this.decodeToken(response.authToken);
      if (!decoded) throw new Error('Недійсний токен');

      this.currentUserSubject.next(decoded);
      this.updateAdminState(decoded);
      this.setRememberSession(rememberMe);
    }
  }

  private handleRefreshResponse(response: IAuthResponse): void {
    if (response.authToken) {
      const storage = this.getCurrentStorage();
      storage.setItem('authToken', response.authToken);

      const decoded = this.decodeToken(response.authToken);
      if (decoded) {
        this.currentUserSubject.next(decoded);
        this.updateAdminState(decoded);
      }

      this.tokenRefreshedSubject.next(response.authToken);
    } else {
      this.tokenRefreshedSubject.next(null);
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

  private getStorage(rememberMe: boolean): Storage {
    return rememberMe ? localStorage : sessionStorage;
  }

  private getCurrentStorage(): Storage {
    return localStorage.getItem('authToken') ? localStorage : sessionStorage;
  }

  isTokenExpired(decodedToken: any): boolean {
    return this.getTokenTimeLeft(decodedToken) <= 0;
  }

  public getTokenTimeLeft(decodedToken: IJwtPayload): number {
    const expirationDate = new Date(decodedToken.exp * 1000);
    return expirationDate.getTime() - Date.now();
  }

  public clearAuthData(): void {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('rememberSession');
    sessionStorage.removeItem('rememberSession');
    this.currentUserSubject.next(null);
    this.updateAdminState(null);
  }
}
