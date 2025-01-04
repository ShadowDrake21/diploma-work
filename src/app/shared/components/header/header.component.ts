import {
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
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
  host: { style: 'position: absolute; z-index: 100; width: 100%;' },
})
export class HeaderComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private headerService = inject(HeaderService);

  headerTitle = '';
  sidebarToggle = output<void>();
  isSidebarOpened = input.required<boolean>();

  ngOnInit(): void {
    this.headerService.headerTitle$.subscribe((title: string) => {
      this.headerTitle = title;
      this.cdr.detectChanges();
    });
  }

  onSidebarToggle() {
    this.sidebarToggle.emit();
  }
}
