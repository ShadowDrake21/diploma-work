import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8080/api/auth';

  private currentUserSub!: BehaviorSubject<any>;
  public currentUser!: Observable<any>;

  constructor() {
    const token = localStorage.getItem('authToken');
    const user = token ? this.decodeToken(token) : null;
    console.log('User', user);
    this.currentUserSub = new BehaviorSubject<any>(user);
    this.currentUser = this.currentUserSub.asObservable();
  }

  private decodeToken(token: string): any {
    try {
      return jwtDecode(token);
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
      const isExpired = decodedToken.exp
        ? decodedToken.exp < Date.now() / 1000
        : false;
      return !isExpired;
    } catch (error) {
      console.error('Error decoding token', error);
      return false;
    }
  }

  public login(
    email: string,
    password: string
  ): Observable<{ message: string; authToken: string }> {
    return this.http
      .post<{ message: string; authToken: string }>(`${this.apiUrl}/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('authToken', response.authToken);
          this.currentUserSub.next(this.decodeToken(response.authToken));
        })
      );
  }

  public register(
    username: string,
    email: string,
    password: string,
    role: string
  ): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/register`, {
      username,
      email,
      password,
      role,
    });
  }

  public verifyUser(
    email: string,
    code: string
  ): Observable<{ message: string; authToken: string }> {
    return this.http
      .post<{ message: string; authToken: string }>(`${this.apiUrl}/verify`, {
        email,
        code,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('authToken', response.authToken);
          this.currentUserSub.next(this.decodeToken(response.authToken));
        })
      );
  }

  public logout() {
    localStorage.removeItem('authToken');
    this.currentUserSub.next(null);
    this.router.navigate(['/login']);
  }
}
