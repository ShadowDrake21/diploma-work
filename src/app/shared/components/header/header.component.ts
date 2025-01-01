import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { ProfileDropdownComponent } from './components/profile-dropdown/profile-dropdown.component';

@Component({
  selector: 'shared-header',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    ProfileDropdownComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  sidebarToggle = output<void>();
  isSidebarOpened = input.required<boolean>();

  onSidebarToggle() {
    this.sidebarToggle.emit();
  }
}
