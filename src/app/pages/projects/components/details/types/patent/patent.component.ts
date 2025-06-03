import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ProjectService } from '@core/services/project/models/project.service';
import { UserService } from '@core/services/users/user.service';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  Subscription,
  tap,
} from 'rxjs';

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
  coInventors$: Observable<any> = of([]);

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.patent$ = this.projectService.getPatentByProjectId(this.id!).pipe(
      tap((patent) => {
        console.log('Patent:', patent.data);
      }),
      catchError((error) => {
        console.error('Error fetching patent:', error);
        return of(null);
      })
    );

    const patentSub = this.patent$.subscribe((patent) => {
      if (patent?.data?.coInventors) {
        console.log('Co-inventors:', patent.data.coInventors);

        const coInventorIds = Array.isArray(patent.data.coInventors)
          ? patent.data.coInventors
          : [patent.data.coInventors];

        this.coInventors$ = forkJoin(
          coInventorIds.map((coInventorId: number) =>
            this.userService.getUserById(coInventorId).pipe(
              map((response) => response.data),
              catchError((error) => {
                console.error('Error fetching co-inventor:', error);
                return of(null);
              })
            )
          )
        ).pipe(
          map((coInventors: any) =>
            coInventors.filter((coInventor: any) => coInventor !== null)
          )
        );
      } else {
        this.coInventors$ = of([]);
      }
    });

    this.subscriptions.push(patentSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
