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

@Component({
  selector: 'user-tabs',
  imports: [
    MatTabGroup,
    MatTab,
    ProfileProjectsComponent,
    UsersListComponent,
    AsyncPipe,
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
        this.paginationUsage('users');
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

  filterProjectsByType(type: ProjectType) {
    return this.projects$$.pipe(
      map((projects) => {
        return projects.filter((project) => project.type === type);
      })
    );
  }

  publicationFiltersApplied(filters: any) {
    this.publications$ = this.projects$$.pipe(
      map((projects) => {
        let filtered = projects.filter(
          (project) => project.type === ProjectType.PUBLICATION
        );

        if (filters.source) {
          filtered = filtered.filter((project) =>
            project.publication?.source
              ?.toLowerCase()
              .includes(filters.source.toLowerCase())
          );
        }

        if (filters.doiIsbn) {
          filtered = filtered.filter((project) =>
            project.publication?.doiIsbn
              ?.toLowerCase()
              .includes(filters.doiIsbn.toLowerCase())
          );
        }

        return filtered;
      })
    );
  }

  patentFiltersApplied(filters: any) {
    this.patents$ = this.projects$$.pipe(
      map((projects) => {
        let filtered = projects.filter(
          (project) => project.type === ProjectType.PATENT
        );

        if (filters.registrationNumber) {
          filtered = filtered.filter((project) =>
            project.patent?.registrationNumber
              ?.toLowerCase()
              .includes(filters.registrationNumber.toLowerCase())
          );
        }
        if (filters.issuingAuthority) {
          filtered = filtered.filter((project) =>
            project.patent?.issuingAuthority
              ?.toLowerCase()
              .includes(filters.issuingAuthority.toLowerCase())
          );
        }

        return filtered;
      })
    );
  }

  researchFiltersApplied(filters: any) {
    this.researches$ = this.projects$$.pipe(
      map((projects) => {
        let filtered = projects.filter(
          (project) => project.type === ProjectType.RESEARCH
        );

        if (filters.minBudget) {
          filtered = filtered.filter(
            (project) =>
              project.research?.budget &&
              project.research.budget >= filters.minBudget
          );
        }
        if (filters.maxBudget) {
          filtered = filtered.filter(
            (project) =>
              project.research?.budget &&
              project.research.budget <= filters.maxBudget
          );
        }
        if (filters.fundingSource) {
          filtered = filtered.filter((project) =>
            project.research?.fundingSource
              ?.toLowerCase()
              .includes(filters.fundingSource.toLowerCase())
          );
        }

        return filtered;
      })
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
