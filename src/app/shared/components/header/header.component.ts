import { Component, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { ProfileDropdownComponent } from './components/profile-dropdown/profile-dropdown.component';
import { HeaderService } from '@core/services/header.service';
import { toSignal } from '@angular/core/rxjs-interop';

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
  host: {
    class: 'shared-header',
    style: 'position: absolute; z-index: 100; width: 100%;',
  },
})
export class HeaderComponent {
  private readonly headerService = inject(HeaderService);

  readonly isSidebarOpened = input.required<boolean>();
  readonly sidebarToggle = output<void>();

  readonly headerTitle = toSignal(this.headerService.headerTitle$, {
    initialValue: '',
  });

  onSidebarToggle() {
    this.sidebarToggle.emit();
  }
}
