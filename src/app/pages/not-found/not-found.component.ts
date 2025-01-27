import { Component, inject } from '@angular/core';
import { AuthService } from '@core/authentication/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  onGoBack() {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/authentication']);
    }
  }
}
