import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ProfileProjectsComponent } from '@shared/components/profile-projects/profile-projects.component';
import { UserService } from '@core/services/users/user.service';
import { catchError, of } from 'rxjs';
import { ProjectType } from '@shared/enums/categories.enum';
import { UserCollaboratorsComponent } from './components/user-collaborators/user-collaborators.component';
import { ProjectDTO } from '@models/project.model';
import { IUser } from '@models/user.model';
import { PageEvent } from '@angular/material/paginator';
import { ContactInformationComponent } from './components/contact-information/contact-information.component';
import { NotificationService } from '@core/services/notification.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

type TabType = 'publications' | 'patents' | 'researches';

@Component({
  selector: 'user-tabs',
  imports: [
    MatTabGroup,
    MatTab,
    ProfileProjectsComponent,
    UserCollaboratorsComponent,
    ContactInformationComponent,
    MatProgressBarModule,
  ],
  templateUrl: './user-tabs.component.html',
})
export class TabsComponent {
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);

  user = input.required<IUser>();
  pageSize = input.required<number>();
  currentPage = input.required<number>();

  pageChange = output<PageEvent>();
  allProjects = signal<ProjectDTO[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  tabPagination = signal({
    publications: { pageSize: 5, currentPage: 0 },
    patents: { pageSize: 5, currentPage: 0 },
    researches: { pageSize: 5, currentPage: 0 },
  });

  publications = computed(() => {
    const filtered = this.allProjects().filter(
      (p) => p.type === ProjectType.PUBLICATION
    );
    const { currentPage, pageSize } = this.tabPagination().publications;
    return this.paginate(filtered, currentPage, pageSize);
  });

  patents = computed(() => {
    const filtered = this.allProjects().filter(
      (p) => p.type === ProjectType.PATENT
    );
    const { currentPage, pageSize } = this.tabPagination().patents;
    return this.paginate(filtered, currentPage, pageSize);
  });

  researches = computed(() => {
    const filtered = this.allProjects().filter(
      (p) => p.type === ProjectType.RESEARCH
    );
    const { currentPage, pageSize } = this.tabPagination().researches;
    return this.paginate(filtered, currentPage, pageSize);
  });

  totalPublications = computed(
    () =>
      this.allProjects().filter((p) => p.type === ProjectType.PUBLICATION)
        .length
  );

  totalPatents = computed(
    () => this.allProjects().filter((p) => p.type === ProjectType.PATENT).length
  );

  totalResearches = computed(
    () =>
      this.allProjects().filter((p) => p.type === ProjectType.RESEARCH).length
  );

  constructor() {
    effect(() => {
      const user = this.user();
      if (user) {
        this.loadProjects(user.id);
      }
    });
  }

  private loadProjects(userId: number): void {
    this.loading.set(true);
    this.userService
      .getProjectsWithDetails(userId)
      .pipe(
        catchError((error) => {
          this.error.set('Failed to load projects');
          this.notificationService.showError('Failed to load user projects');
          console.error('Error loading projects:', error);
          return of([] as ProjectDTO[]);
        })
      )
      .subscribe({
        next: (projects) => {
          this.allProjects.set(projects);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  onPageChange(event: PageEvent, tab: TabType): void {
    this.tabPagination.update((prev) => ({
      ...prev,
      [tab]: {
        pageSize: event.pageSize,
        currentPage: event.pageIndex,
      },
    }));
  }

  private paginate(items: any[], page: number, pageSize: number): any[] {
    const startIndex = page * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }
}
