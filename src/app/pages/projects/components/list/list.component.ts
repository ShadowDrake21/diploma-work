import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';
import { ProjectCardComponent } from '../../../../shared/components/project-card/project-card.component';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ProjectService } from '@core/services/project/models/project.service';
import { ProjectDTO } from '@models/project.model';
import { ProjectSearchFilters } from '@shared/types/search.types';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectsQuickLinksComponent } from '../../../../shared/components/projects-quick-links/projects-quick-links.component';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'projects-list',
  imports: [
    FilterPanelComponent,
    ProjectCardComponent,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    ProjectsQuickLinksComponent,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  providers: [provideNativeDateAdapter()],
})
export class ListProjectsComponent implements OnInit, OnDestroy {
  private readonly projectService = inject(ProjectService);
  private readonly route = inject(ActivatedRoute);

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

  private readonly subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.subscriptions.push(
      this.route.queryParamMap
        .pipe(
          tap(() => this.currentPage.set(0)),
          switchMap((params) => this.loadProjects(params.get('mode')))
        )
        .subscribe()
    );
  }

  private loadProjects(mode: string | null): Observable<void> {
    this.isLoading.set(true);

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
      map((projects) => {
        this.projects.set(projects.data);
        this.totalItems.set(projects.totalItems);
      }),
      catchError((err) => {
        console.error(
          `Error loading ${mode === 'mine' ? 'my' : 'all'} projects:`,
          err
        );
        this.projects.set([]);
        this.totalItems.set(0);
        return of();
      }),
      tap(() => this.isLoading.set(false))
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
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadProjectsBasedOnRoute();
  }

  private loadProjectsBasedOnRoute(): void {
    this.subscriptions.push(
      this.route.queryParamMap
        .pipe(switchMap((params) => this.loadProjects(params.get('mode'))))
        .subscribe()
    );
  }

  get isMineMode(): boolean {
    return this.route.snapshot.queryParamMap.get('mode') === 'mine';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
