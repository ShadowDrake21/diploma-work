import {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  TitleCasePipe,
} from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ProjectService } from '@core/services/project.service';
import { UserService } from '@core/services/user.service';
import { forkJoin, Observable, Subscription } from 'rxjs';

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

  research$!: Observable<any>;
  participants$!: Observable<any>;

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.research$ = this.projectService.getResearchByProjectId(this.id!);

    const researchSub = this.research$.subscribe((research) => {
      this.participants$ = research?.participantIds
        ? forkJoin(
            research?.participantIds.map((participantId: number) =>
              this.userService.getUserById(participantId)
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
