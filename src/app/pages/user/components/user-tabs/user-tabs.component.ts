import {
  Component,
  computed,
  EventEmitter,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
} from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ProfileProjectsComponent } from '../../../../shared/components/profile-projects/profile-projects.component';
import { recentProjectContent } from '@content/recentProjects.content';
// import { usersContent } from '@content/users.content';
import { UserService } from '@core/services/user.service';
import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  Subscription,
} from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ProjectType } from '@shared/enums/categories.enum';
import { UserCollaboratorsComponent } from './components/user-collaborators/user-collaborators.component';
import { ProjectDTO } from '@models/project.model';
import { IUser } from '@models/user.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'user-tabs',
  imports: [
    MatTabGroup,
    MatTab,
    ProfileProjectsComponent,
    AsyncPipe,
    UserCollaboratorsComponent,
  ],
  templateUrl: './user-tabs.component.html',
  styleUrl: './user-tabs.component.scss',
})
export class TabsComponent {
  private readonly userService = inject(UserService);

  user = input.required<IUser>();
  pageSize = input.required<number>();
  currentPage = input.required<number>();

  pageChange = output<PageEvent>();

  projects = toSignal(
    this.userService
      .getProjectsWithDetails(this.user().id)
      .pipe(catchError(() => of([] as ProjectDTO[])))
  );

  publications = computed(
    () =>
      (this.projects() as ProjectDTO[] | undefined)?.filter(
        (p: ProjectDTO) => p.type === ProjectType.PUBLICATION
      ) || []
  );

  patents = computed(
    () =>
      (this.projects() as ProjectDTO[] | undefined)?.filter(
        (p: ProjectDTO) => p.type === ProjectType.PATENT
      ) || []
  );

  researches = computed(
    () =>
      (this.projects() as ProjectDTO[] | undefined)?.filter(
        (p: ProjectDTO) => p.type === ProjectType.RESEARCH
      ) || []
  );

  // Social links data
  socialLinks = [
    { url: 'www.x.com', name: 'X (formerly Twitter)' },
    { url: 'www.instagram.com', name: 'Instagram' },
    { url: 'www.linkedin.com', name: 'LinkedIn' },
  ];

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }
}
