import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

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
    this.currentUserSub = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('authToken') || '{}')
    );
    this.currentUser = this.currentUserSub.asObservable();
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
          this.currentUserSub.next(response);
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
        tap((response) => localStorage.setItem('authToken', response.authToken))
      );
  }

  public logout() {
    localStorage.removeItem('authToken');
    this.currentUserSub.next(null);
    this.router.navigate(['/login']);
  }
}
