import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';

@Component({
  selector: 'app-forbidden',
  imports: [],
  template: `
    <div class="forbidden">
      <h1>403 Заборонено</h1>
      <h2>У вас немає дозволу на доступ до цього ресурсу.</h2>
      <button class="forbidden-btn" (click)="onGoBack()">Go Back</button>
    </div>
  `,
  styleUrl: './forbidden.component.scss',
})
export class ForbiddenComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  onGoBack() {
    if (this.authService.getCurrentUser()) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/authentication']);
    }
  }
}
