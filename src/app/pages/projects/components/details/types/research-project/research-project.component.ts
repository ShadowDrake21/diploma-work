import {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  TitleCasePipe,
} from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NotificationService } from '@core/services/notification.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { UserService } from '@core/services/users/user.service';
import { ResearchDTO } from '@models/research.model';
import { ParticipantDTO } from '@models/user.model';
import { catchError, forkJoin, map, Observable, of, Subscription } from 'rxjs';

@Component({
  selector: 'details-research-project',
  imports: [
    CurrencyPipe,
    DatePipe,
    AsyncPipe,
    TitleCasePipe,
    MatExpansionModule,
    MatProgressBarModule,
  ],
  templateUrl: './research-project.component.html',
})
export class ResearchProjectComponent implements OnInit, OnDestroy {
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);

  @Input({ required: true })
  id!: string;

  research$!: Observable<ResearchDTO | null>;
  participants$!: Observable<ParticipantDTO[] | null>;
  researchError = false;
  participantsError = false;
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.research$ = this.projectService.getResearchByProjectId(this.id!).pipe(
      catchError((error) => {
        this.researchError = true;
        this.notificationService.showError(
          'Не вдалося завантажити деталі дослідження'
        );
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
                        'Не вдалося завантажити деяких учасників'
                      );
                      console.error('Participant load error:', error);
                      return of(null);
                    })
                  )
                )
              ).pipe(
                map((participants) =>
                  participants.filter(
                    (participant): participant is ParticipantDTO =>
                      participant !== null
                  )
                )
              )
            : of([]);
        }
      },
      error: (error) => {
        this.researchError = true;
        this.notificationService.showError(
          'Не вдалося завантажити деталі дослідження'
        );
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
