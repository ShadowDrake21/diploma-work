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
import { NotificationsComponent } from '@pages/dashboard/components/notifications/notifications.component';
import { HeaderComponent } from '@shared/components/header/header.component';
import { filter } from 'rxjs';
import { RecentUsersComponent } from '@pages/dashboard/components/recent-users/recent-users.component';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    MatSidenavModule,
    MatListModule,
    RouterOutlet,
    CommonModule,
    MatIconModule,
    NotificationsComponent,
    RecentUsersComponent,
    FooterComponent,
    NgStyle,
    RouterLink,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private observer = inject(BreakpointObserver);
  private router = inject(Router);

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isMobile = true;
  isCollapsed = true;
  isOpened = true;

  isAuth = true;
  isSettings = false;

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
      });
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
