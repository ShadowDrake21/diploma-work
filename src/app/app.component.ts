import { Component, OnInit } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { FooterComponent } from './shared/components/footer/footer.component';
import { inject, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule, NgStyle } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '@shared/components/header/header.component';
import { filter } from 'rxjs';
import { RecentUsersComponent } from '@pages/dashboard/components/recent-users/recent-users.component';
import { AdminService } from '@core/services/admin.service';
import { AuthService } from '@core/authentication/auth.service';
import { currentUserSig } from '@core/shared/shared-signals';
import { UserStore } from '@core/services/stores/user-store.service';
import { SessionWarningComponent } from '@shared/components/dialogs/session-warning/session-warning.component';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    MatSidenavModule,
    MatListModule,
    RouterOutlet,
    CommonModule,
    MatIconModule,
    RecentUsersComponent,
    FooterComponent,
    SessionWarningComponent,
    NgStyle,
    RouterLink,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userStore = inject(UserStore);
  private observer = inject(BreakpointObserver);
  private router = inject(Router);

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isMobile = true;
  isCollapsed = true;
  isOpened = true;

  isAuth = true;
  isSettings = false;
  isErrorPages = false;

  isAdmin = false;
  isLoggedIn = this.authService.isAuthenticated();

  ngOnInit() {
    this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
      if (screenSize.matches) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isAuth = event.url.split('/').includes('authentication');
        this.isSettings = event.url.split('/').includes('settings');
        this.isErrorPages =
          event.url.split('/').includes('forbidden') ||
          event.url.split('/').includes('not-found');
      });

    if (this.authService.isAuthenticated()) {
      const rememberMe = !!localStorage.getItem('authToken');
      this.userStore.setRememberMe(rememberMe);

      this.userStore.loadCurrentUser().subscribe();
    }

    this.isAdmin = this.authService.isAdmin();
  }

  toggleMenu() {
    this.sidenav.toggle();
    this.isOpened = !this.isOpened;
    if (this.isMobile) {
      this.sidenav.toggle();
      this.isCollapsed = false;
    } else {
      this.sidenav.open();
      this.isCollapsed = !this.isCollapsed;
    }
  }
}
