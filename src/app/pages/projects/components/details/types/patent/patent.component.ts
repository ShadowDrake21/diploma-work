import { DatePipe } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { NotificationService } from '@core/services/notification.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { UserService } from '@core/services/users/user.service';
import { PatentDTO } from '@models/patent.model';
import { IUser } from '@models/user.model';
import { catchError, forkJoin, map, of, Subscription, tap } from 'rxjs';

@Component({
  selector: 'details-patent',
  imports: [DatePipe],
  templateUrl: './patent.component.html',
  styleUrl: './patent.component.scss',
})
export class PatentComponent implements OnInit, OnDestroy {
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  @Input({ required: true })
  id!: string;
  // Signals for state management
  loading = signal(true);
  error = signal<string | null>(null);
  patent = signal<PatentDTO | null>(null);
  coInventors = signal<IUser[]>([]);

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.loadPatentDetails();
  }

  private loadPatentDetails(): void {
    this.loading.set(true);
    this.error.set(null);

    const patentSub = this.projectService
      .getPatentByProjectId(this.id)
      .pipe(
        tap({
          next: (response) => {
            this.patent.set(response.data!);
            this.loadCoInventors(response.data?.coInventors);
            this.loading.set(false);
          },
          error: (error) => {
            console.error('Error fetching patent:', error);
            this.notificationService.showError('Failed to load patent details');
            this.error.set(
              'Failed to load patent details. Please try again later.'
            );
            this.loading.set(false);
          },
        }),
        catchError(() => {
          this.loading.set(false);
          return of(null);
        })
      )
      .subscribe();

    this.subscriptions.push(patentSub);
  }

  private loadCoInventors(coInventorIds: number[] | undefined): void {
    if (!coInventorIds?.length) {
      this.coInventors.set([]);
      return;
    }

    const ids = Array.isArray(coInventorIds) ? coInventorIds : [coInventorIds];

    const coInventorSub = forkJoin(
      ids.map((id) =>
        this.userService.getFullUserById(id).pipe(
          map((response) => response.data),
          catchError((error) => {
            console.error(`Error fetching co-inventor ${id}:`, error);
            this.notificationService.showError(
              `Failed to load co-inventor ${id}`
            );
            return of(null);
          })
        )
      )
    )
      .pipe(
        map((coInventors) =>
          coInventors.filter(
            (coInventor): coInventor is IUser =>
              coInventor !== null && coInventor !== undefined
          )
        ),
        tap({
          next: (coInventors) => this.coInventors.set(coInventors),
          error: () => {
            this.notificationService.showError('Failed to load co-inventors');
            this.coInventors.set([]);
          },
        })
      )
      .subscribe();

    this.subscriptions.push(coInventorSub);
  }

  retry(): void {
    this.loadPatentDetails();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
