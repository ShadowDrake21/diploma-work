import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '@core/authentication/auth.service';
import { NotificationService } from '@core/services/notification.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  if (!authService.isAuthenticated()) {
    notificationService.showError('Будь ласка, увійдіть в систему');
    return false;
  }

  if (authService.isAdmin()) {
    return true;
  }

  notificationService.showError('У вас немає доступу до цієї сторінки');
  return false;
};
