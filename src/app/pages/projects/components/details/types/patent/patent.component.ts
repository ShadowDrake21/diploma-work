import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ProjectService } from '@core/services/project.service';
import { UserService } from '@core/services/user.service';
import { forkJoin, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'details-patent',
  imports: [DatePipe, AsyncPipe],
  templateUrl: './patent.component.html',
  styleUrl: './patent.component.scss',
})
export class PatentComponent implements OnInit, OnDestroy {
  private projectService = inject(ProjectService);
  private userService = inject(UserService);

  @Input({ required: true })
  id!: string;

  patent$!: Observable<any>;
  coInventors$!: Observable<any>;

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.patent$ = this.projectService.getPatentByProjectId(this.id!);

    const patentSub = this.patent$.subscribe((patent) => {
      this.coInventors$ = patent?.coInventors
        ? forkJoin(
            patent?.coInventors.map((coInventorId: number) =>
              this.userService.getUserById(coInventorId)
            )
          )
        : new Observable();
    });

    this.subscriptions.push(patentSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
