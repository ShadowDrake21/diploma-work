import { Component, computed, inject, signal } from '@angular/core';
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
import { ProfileInfoComponent } from './components/profile-info/profile-info.component';
import { ProfileProjectsComponent } from '@shared/components/profile-projects/profile-projects.component';
import { catchError, of, switchMap, tap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MyCommentsComponent } from './components/my-comments/my-comments.component';
import { ProjectSearchFilters } from '@shared/types/search.types';
import { ProjectService } from '@core/services/project/models/project.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderComponent } from '@shared/components/loader/loader.component';

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
    ProfileInfoComponent,
    ProfileProjectsComponent,
    MyCommentsComponent,
    MatProgressSpinnerModule,
    LoaderComponent,
  ],
  templateUrl: './profile.component.html',
  providers: [provideNativeDateAdapter()],
})
export class ProfileComponent {
  private readonly projectService = inject(ProjectService);

  currentPage = signal(0);
  pageSize = signal(5);
  searchFilters = signal<ProjectSearchFilters>({});
  isLoading = signal(false);
  error = signal<string | null>(null);

  private searchParams = computed(() => ({
    filters: this.cleanFilters(this.searchFilters()),
    page: this.currentPage(),
    size: this.pageSize(),
  }));

  private searchParams$ = toObservable(this.searchParams);

  projectsResponse = toSignal(
    this.searchParams$.pipe(
      tap(() => {
        this.isLoading.set(true);
        this.error.set(null);
      }),
      switchMap((params) => {
        return this.projectService
          .getMyProjects(params.filters, params.page, params.size)
          .pipe(
            tap(() => this.isLoading.set(false)),
            catchError((error) => {
              this.isLoading.set(false);
              this.error.set(
                this.getErrorMessage(error, 'Не вдалося завантажити проекти')
              );
              console.error('Project loading error:', error);
              return of({
                success: false,
                message: 'Не вдалося завантажити проекти',
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
        message: '',
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
    console.log('Page changed:', event);
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  cleanFilters(filters: ProjectSearchFilters): ProjectSearchFilters {
    const clean: any = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        clean[key] = value;
      }
    });
    return clean;
  }

  getErrorMessage(error: any, defaultMessage: string): string {
    if (error.status === 404) {
      return 'Не знайдено проектів, що відповідають вашим критеріям';
    }
    if (error.status === 403) {
      return 'У вас немає дозволу на перегляд цих проектів';
    }
    if (error.status === 400) {
      return 'Недійсні параметри пошуку';
    }
    return defaultMessage;
  }
}
