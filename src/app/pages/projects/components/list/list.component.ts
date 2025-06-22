import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FilterPanelComponent } from '@shared/components/filter-panel/filter-panel.component';
import { ProjectCardComponent } from '@shared/components/project-card/project-card.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ProjectService } from '@core/services/project/models/project.service';
import { ProjectDTO } from '@models/project.model';
import { ProjectSearchFilters } from '@shared/types/search.types';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectsQuickLinksComponent } from '@shared/components/projects-quick-links/projects-quick-links.component';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  map,
  Observable,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
} from 'rxjs';
import { NotificationService } from '@core/services/notification.service';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'projects-list',
  imports: [
    FilterPanelComponent,
    ProjectCardComponent,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    ProjectsQuickLinksComponent,
    LoaderComponent,
    MatButtonModule,
  ],
  templateUrl: './list.component.html',
  providers: [provideNativeDateAdapter()],
})
export class ListProjectsComponent implements OnInit, OnDestroy {
  private readonly projectService = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  projects = signal<ProjectDTO[]>([]);
  isLoading = signal(false);
  totalItems = signal(0);
  currentPage = signal(0);
  pageSize = signal(10);
  pageSizeOptions = signal([5, 10, 20, 50]);
  filters = signal<ProjectSearchFilters>({});

  showPagination = computed(() => this.totalItems() > 0);
  isEmptyState = computed(
    () => this.projects().length === 0 && !this.isLoading()
  );
  isMineMode = computed(
    () => this.route.snapshot.queryParamMap.get('mode') === 'mine'
  );

  readonly subscriptions: Subscription[] = [];
  private previousQueryParams: Record<string, string | null> = {};

  ngOnInit(): void {
    this.loadProjectsBasedOnRoute();
  }

  private getCurrentQueryParams(): Record<string, string | null> {
    const params: Record<string, string | null> = {};
    this.route.snapshot.queryParamMap.keys.forEach((keys) => {
      params[keys] = this.route.snapshot.queryParamMap.get(keys);
    });
    return params;
  }

  private haveQueryParamsChanged(): boolean {
    const currentParams = this.getCurrentQueryParams();
    const keys = new Set([
      ...Object.keys(currentParams),
      ...Object.keys(this.previousQueryParams),
    ]);
    for (const key of keys) {
      if (currentParams[key] !== this.previousQueryParams[key]) {
        return true;
      }
    }
    return false;
  }

  private loadProjects(mode: string | null): Observable<void> {
    this.isLoading.set(true);
    this.projects.set([]);

    const loader$ =
      mode === 'mine'
        ? this.projectService.getMyProjects(
            this.filters(),
            this.currentPage(),
            this.pageSize()
          )
        : this.projectService.searchProjects(
            this.filters(),
            this.currentPage(),
            this.pageSize()
          );

    return loader$.pipe(
      map((response) => {
        console.log('Projects loaded:', response);
        if (!response.data) {
          throw new Error('Дані про проект не отримано');
        }
        this.projects.set(response.data);
        this.totalItems.set(response.totalItems);
        this.isLoading.set(false);
      }),
      catchError((error) => {
        const errorMessage = this.isMineMode()
          ? 'Не вдалося завантажити ваші проекти'
          : 'Не вдалося завантажити проекти';
        this.isLoading.set(false);
        this.notificationService.showError(errorMessage);
        console.error('Project loading error:', error);
        return of();
      })
    );
  }

  onFiltering(filters: ProjectSearchFilters): void {
    this.currentPage.set(0);
    this.filters.set(filters);
    this.loadProjectsBasedOnRoute();
  }

  onFiltersReset(): void {
    this.currentPage.set(0);
    this.filters.set({});
    this.loadProjectsBasedOnRoute();
  }

  onPageChange(event: PageEvent): void {
    console.log('Page change event:', event);
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadProjectsBasedOnRoute();
  }

  private loadProjectsBasedOnRoute(): void {
    const paramsChanged = this.haveQueryParamsChanged();
    if (paramsChanged) {
      this.currentPage.set(0);
      this.previousQueryParams = this.getCurrentQueryParams();
    }
    const sub = this.route.queryParamMap
      .pipe(
        switchMap((params) => this.loadProjects(params.get('mode'))),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }
}
