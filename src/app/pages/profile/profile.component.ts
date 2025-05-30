import { Component, computed, effect, inject, signal } from '@angular/core';
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
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CommentService } from '@core/services/comment.service';
import { currentUserSig } from '@core/shared/shared-signals';
import { PaginatedResponse } from '@models/api-response.model';
import { IComment } from '@models/comment.types';
import { MyCommentsComponent } from './components/my-comments/my-comments.component';
import { ProjectSearchFilters } from '@shared/types/search.types';
import { ProjectService } from '@core/services/project/models/project.service';

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
  private readonly projectService = inject(ProjectService);

  currentPage = signal(0);
  pageSize = signal(8);
  searchFilters = signal<ProjectSearchFilters>({});

  private searchParams = computed(() => ({
    filters: this.cleanFilters(this.searchFilters()),
    page: this.currentPage(),
    size: this.pageSize(),
  }));

  private searchParams$ = toObservable(this.searchParams);

  projectsResponse = toSignal(
    this.searchParams$.pipe(
      switchMap((params) => {
        console.log('Making API call with:', params);
        return this.projectService
          .getMyProjects(params.filters, params.page, params.size)
          .pipe(
            catchError((error) => {
              console.error('API Error:', error);
              return of({
                success: false,
                message: 'Failed to load projects',
                data: [],
                totalItems: 0,
                totalPages: 0,
              });
            })
          );
      })
    ),
    {
      initialValue: {
        success: false,
        message: 'Loading...',
        data: [],
        totalItems: 0,
        totalPages: 0,
      },
    }
  );

  myProjects = computed(() => this.projectsResponse()?.data || []);
  totalItems = computed(() => this.projectsResponse()?.totalItems || 0);
  totalPages = computed(() => this.projectsResponse()?.totalPages || 0);

  onFiltersChanged(filters: ProjectSearchFilters) {
    this.searchFilters.set(filters);
    this.currentPage.set(0);
  }

  onFiltersReset() {
    this.searchFilters.set({});
    this.currentPage.set(0);
  }

  onPageChanged(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  private cleanFilters(filters: ProjectSearchFilters): ProjectSearchFilters {
    const clean: any = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        clean[key] = value;
      }
    });
    return clean;
  }
}
