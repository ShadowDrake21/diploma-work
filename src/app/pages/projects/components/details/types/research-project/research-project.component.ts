import {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  TitleCasePipe,
} from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from '@core/services/notification.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { UserService } from '@core/services/users/user.service';
import { ResearchDTO } from '@models/research.model';
import { catchError, forkJoin, map, Observable, of, Subscription } from 'rxjs';

@Component({
  selector: 'details-research-project',
  imports: [CurrencyPipe, DatePipe, AsyncPipe, TitleCasePipe],
  templateUrl: './research-project.component.html',
  styleUrl: './research-project.component.scss',
})
export class ResearchProjectComponent implements OnInit, OnDestroy {
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);

  @Input({ required: true })
  id!: string;

  research$!: Observable<ResearchDTO | null>;
  participants$!: Observable<any>;
  researchError = false;
  participantsError = false;
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.research$ = this.projectService.getResearchByProjectId(this.id!).pipe(
      catchError((error) => {
        this.researchError = true;
        this.notificationService.showError('Failed to load research details');
        console.error('Research load error:', error);
        return of(null);
      })
    );

    const researchSub = this.research$.subscribe({
      next: (research) => {
        if (research) {
          this.participants$ = research.participantIds?.length
            ? forkJoin(
                research.participantIds.map((participantId: number) =>
                  this.userService.getUserById(participantId).pipe(
                    catchError((error) => {
                      this.participantsError = true;
                      this.notificationService.showError(
                        'Failed to load some participants'
                      );
                      console.error('Participant load error:', error);
                      return of(null);
                    })
                  )
                )
              )
            : of([]);
        }
      },
      error: (error) => {
        this.researchError = true;
        this.notificationService.showError('Failed to load research details');
        console.error('Research load error:', error);
      },
    });

    this.subscriptions.push(researchSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
