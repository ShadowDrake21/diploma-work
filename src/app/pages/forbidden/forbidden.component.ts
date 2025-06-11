import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';

@Component({
  selector: 'app-forbidden',
  imports: [],
  template: `
    <div
      class="h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      <h1 class="text-[13vmin] mb-0">403 Заборонено</h1>
      <h2 class="text-[5vmin] mt-0 mb-10">
        У вас немає дозволу на доступ до цього ресурсу.
      </h2>
      <button
        class="text-xl p-3 border border-solid border-black text-black bg-transparent no-underline transition-all duration-500 ease-in-out hover:text-white hover:bg-black active:text-white active:bg-black"
        (click)="onGoBack()"
      >
        Назад
      </button>
    </div>
  `,
})
export class ForbiddenComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onGoBack() {
    if (this.authService.getCurrentUser()) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/authentication']);
    }
  }
}
