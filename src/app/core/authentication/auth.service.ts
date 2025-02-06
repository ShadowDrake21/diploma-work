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

  public login(email: string, password: string): Observable<string> {
    return this.http
      .post<string>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('authToken', response);
          this.currentUserSub.next(response);
        })
      );
  }

  public register(
    email: string,
    password: string,
    role: string
  ): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/register`, {
      email,
      password,
      role,
    });
  }

  public logout() {
    localStorage.removeItem('authToken');
    this.currentUserSub.next(null);
    this.router.navigate(['/login']);
  }
}
