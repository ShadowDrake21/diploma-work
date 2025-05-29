import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FrequentLinksComponent } from '@shared/components/frequent-links/frequent-links.component';
import { ProfileInfoComponent } from './components/profile-info/profile-info.component';
import { ProfileProjectsComponent } from '@shared/components/profile-projects/profile-projects.component';
import { UserService } from '@core/services/users/user.service';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommentService } from '@core/services/comment.service';
import { currentUserSig } from '@core/shared/shared-signals';
import { PaginatedResponse } from '@models/api-response.model';
import { IComment } from '@models/comment.types';
import { MyCommentsComponent } from './components/my-comments/my-comments.component';

@Component({
  selector: 'app-profile',
  imports: [
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatPaginatorModule,
    FrequentLinksComponent,
    ProfileInfoComponent,
    ProfileProjectsComponent,
    MyCommentsComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ProfileComponent {
  private readonly userService = inject(UserService);

  myProjects = toSignal(
    this.userService
      .getCurrentUserProjects()
      .pipe(map((response) => response.data))
  );
}
