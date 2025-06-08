import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecentUsersService } from '@core/services/users/recent-users.service';
import { isUserArray } from '@core/services/users/utils/type-guards.utils';
import { SharedRecentUsersBase } from '@pages/dashboard/components/abstract/shared-recent-users-base/shared-recent-users-base.component';
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'sidebar-recent-users',
  imports: [
    CommonModule,
    MatIcon,
    TruncateTextPipe,
    MatProgressSpinnerModule,
    LoaderComponent,
  ],
  templateUrl: './recent-users.component.html',
})
export class RecentUsersComponent extends SharedRecentUsersBase {}
