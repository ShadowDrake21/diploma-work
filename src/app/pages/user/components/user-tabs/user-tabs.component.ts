import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ProfileProjectsComponent } from '../../../../shared/components/profile-projects/profile-projects.component';
import { PaginationService } from '@core/services/pagination.service';
import { recentProjectContent } from '@content/recentProjects.content';
import { usersContent } from '@content/users.content';
import { UsersListComponent } from '../../../../shared/components/users-list/users-list.component';
import { IUser } from '@shared/types/users.types';
import { UserService } from '@core/services/user.service';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  shareReplay,
  Subscription,
  tap,
} from 'rxjs';
import { Project } from '@shared/types/project.types';
import { AsyncPipe } from '@angular/common';
import { ProjectType } from '@shared/enums/categories.enum';
import { ProjectFilters } from '@shared/types/filters.types';
import { UserCollaboratorsComponent } from './components/user-collaborators/user-collaborators.component';

@Component({
  selector: 'user-tabs',
  imports: [
    MatTabGroup,
    MatTab,
    ProfileProjectsComponent,
    UsersListComponent,
    AsyncPipe,
    UserCollaboratorsComponent,
  ],
  templateUrl: './user-tabs.component.html',
  styleUrl: './user-tabs.component.scss',
  providers: [PaginationService],
})
export class TabsComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  paginationService = inject(PaginationService);
  userSig = input.required<IUser | undefined>({ alias: 'user' });

  userProjects = recentProjectContent;
  users = usersContent;
  pages: number[] = [];

  private projects$$ = new BehaviorSubject<Project[]>([]);
  publications$!: Observable<Project[]>;
  patents$!: Observable<Project[]>;
  researches$!: Observable<Project[]>;

  subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const projectsSub = this.userService
      .getProjectsWithDetails(this.userSig()?.id!)
      .subscribe({
        next: (projects) => {
          this.projects$$.next(projects);
          this.updateFilteredProjects();
        },
      });

    this.subscriptions.push(projectsSub);
  }

  tabChanged(index: number) {
    switch (index) {
      case 0:
        this.paginationUsage('projects');
        break;
      case 1:
        this.paginationUsage('projects');
        break;
      case 2:
        this.paginationUsage('projects');
        break;
      case 3:
        console.log('Collaborators tab selected');
        break;
      case 4:
        console.log('Contact information tab selected');
        break;
      default:
        console.log('Invalid tab index');
        break;
    }
  }

  paginationUsage(type: 'users' | 'projects' = 'projects') {
    this.paginationService.currentPage = 1;
    this.paginationService.elements =
      type === 'users' ? this.users : this.userProjects;
    this.paginationService.updateVisibleElements();
    this.pages = Array.from(
      { length: this.paginationService.numPages() },
      (_, i) => i + 1
    );
  }

  private updateFilteredProjects() {
    this.publications$ = this.createFilteredObservable(ProjectType.PUBLICATION);
    this.patents$ = this.createFilteredObservable(ProjectType.PATENT);
    this.researches$ = this.createFilteredObservable(ProjectType.RESEARCH);
  }

  private createFilteredObservable(type: ProjectType): Observable<Project[]> {
    return this.projects$$.pipe(
      map((projects) => projects.filter((p) => p.type === type)),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      shareReplay(1)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
