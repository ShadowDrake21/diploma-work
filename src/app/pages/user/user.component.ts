import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MetricCardItemComponent } from '@shared/components/metric-card-item/metric-card-item.component';
import { DashboardMetricCardItem } from '@shared/types/dashboard.types';
import { IUser } from '@shared/models/user.model';
import { HeaderService } from '@core/services/header.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { TabsComponent } from './components/user-tabs/user-tabs.component';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { UserService } from '@core/services/users/user.service';
import { catchError, of, Subject, takeUntil } from 'rxjs';
import { ProjectDTO } from '@models/project.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RoleFormatPipe } from '@pipes/role-format.pipe';
import { NotificationService } from '@core/services/notification.service';
import { MatIcon } from '@angular/material/icon';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';

@Component({
  selector: 'app-user-profile',
  imports: [
    MetricCardItemComponent,
    MatTabsModule,
    TabsComponent,
    MatButtonModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinner,
    RoleFormatPipe,
    MatIcon,
    LoaderComponent,
    TruncateTextPipe,
  ],
  templateUrl: './user.component.html',

  providers: [provideNativeDateAdapter()],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly headerService = inject(HeaderService);
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  userId = signal<number | null>(null);
  user = signal<IUser | null>(null);
  userProjects = signal<ProjectDTO[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  pageSize = signal(5);
  currentPage = signal(0);
  pageSizeOptions = signal([5, 10, 20]);

  isUserLoaded = computed(() => this.user() !== null);
  hasError = computed(() => this.error() !== null);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId.set(+params['id']);
      this.loadUserData();
    });
  }

  userMetrics() {
    const user = this.user();
    if (!user) return [];

    const metrics: DashboardMetricCardItem[] = [
      {
        title: 'Публікації',
        value: user.publicationCount.toString(),
        link: '',
        icon: 'description',
      },
      {
        title: 'Патенти',
        value: user.patentCount.toString(),
        link: '',
        icon: 'gavel',
      },
      {
        title: 'Дослідницькі проекти',
        value: user.researchCount.toString(),
        link: '',
        icon: 'science',
      },
    ];
    return metrics;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  loadUserData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const userId = this.userId();
    if (!userId) {
      this.error.set('Недійсний ідентифікатор користувача');
      this.isLoading.set(false);
      return;
    }

    this.userService
      .getFullUserById(userId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.error.set('Не вдалося завантажити дані користувача');
          this.notificationService.showError(
            'Не вдалося завантажити профіль користувача'
          );
          this.isLoading.set(false);
          return of(null);
        })
      )
      .subscribe((user) => {
        if (user) {
          this.user.set(user);
          this.headerService.setTitle(`Користувач: ${user.username}`);
          this.loadUserProjects();
        } else {
          this.error.set('Користувача не знайдено');
          this.isLoading.set(false);
        }
      });
  }

  loadUserProjects(): void {
    const userId = this.userId();
    if (!userId) {
      this.error.set('Недійсний ідентифікатор користувача');
      this.isLoading.set(false);
      return;
    }

    this.userService
      .getUserProjects(userId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          this.error.set('Не вдалося завантажити проекти користувачів');
          this.notificationService.showError(
            'Не вдалося завантажити проекти користувачів'
          );
          return of([]);
        })
      )
      .subscribe((projects) => {
        this.userProjects.set(Array.isArray(projects) ? projects : []);
        this.isLoading.set(false);
      });
  }

  retryLoading(): void {
    this.error.set(null);
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
