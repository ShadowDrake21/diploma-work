import {
  Component,
  input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NotificationsComponent } from '../../../pages/dashboard/components/notifications/notifications.component';
import { RecentUsersComponent } from '../../../pages/dashboard/components/recent-users/recent-users.component';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'shared-sidebar',
  imports: [
    MatSidenavModule,
    MatListModule,
    CommonModule,
    MatIconModule,
    NotificationsComponent,
    RecentUsersComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnChanges {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isMobile = true;
  isCollapsed = true;

  isOpened = input.required<boolean>();

  constructor(private observer: BreakpointObserver) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('isToggle changed', this.isOpened());
    this.toggleMenu();
    // this.toggleMenu();
    // }
  }

  ngOnInit() {
    this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
      if (screenSize.matches) {
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });
  }

  toggleMenu() {
    this.sidenav.toggle();
    // this.isOpened = !this.isOpened;
    if (this.isMobile) {
      this.sidenav.toggle();
      this.isCollapsed = false; // On mobile, the menu can never be collapsed
    } else {
      this.sidenav.open(); // On desktop/tablet, the menu can never be fully closed
      this.isCollapsed = !this.isCollapsed;
    }
  }
}
