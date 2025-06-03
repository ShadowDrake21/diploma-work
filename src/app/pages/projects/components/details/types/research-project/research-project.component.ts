import {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  TitleCasePipe,
} from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ProjectService } from '@core/services/project/models/project.service';
import { UserService } from '@core/services/users/user.service';
import { ResearchDTO } from '@models/research.model';
import { forkJoin, map, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'details-research-project',
  imports: [CurrencyPipe, DatePipe, AsyncPipe, TitleCasePipe],
  templateUrl: './research-project.component.html',
  styleUrl: './research-project.component.scss',
})
export class ResearchProjectComponent implements OnInit, OnDestroy {
  private projectService = inject(ProjectService);
  private userService = inject(UserService);

  @Input({ required: true })
  id!: string;

  research$!: Observable<ResearchDTO | null>;
  participants$!: Observable<any>;

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.research$ = this.projectService.getResearchByProjectId(this.id!).pipe(
      map((response) => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error('Failed to fetch research data');
        }
      })
    );

    const researchSub = this.research$.subscribe((research) => {
      this.participants$ = research?.participantIds
        ? forkJoin(
            research?.participantIds.map((participantId: number) =>
              this.userService
                .getUserById(participantId)
                .pipe(map((response) => response.data))
            )
          )
        : new Observable();
    });

    this.subscriptions.push(researchSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
