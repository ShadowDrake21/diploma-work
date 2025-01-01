import { Component, inject, input, OnInit, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { ProfileDropdownComponent } from './components/profile-dropdown/profile-dropdown.component';
import { HeaderService } from '../../../core/services/header.service';

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
export class HeaderComponent implements OnInit {
  private headerService = inject(HeaderService);

  headerTitle = '';
  sidebarToggle = output<void>();
  isSidebarOpened = input.required<boolean>();

  ngOnInit(): void {
    this.headerService.headerTitle$.subscribe((title: string) => {
      console.log('title', title);
      this.headerTitle = title;
    });
  }

  onSidebarToggle() {
    this.sidebarToggle.emit();
  }
}
