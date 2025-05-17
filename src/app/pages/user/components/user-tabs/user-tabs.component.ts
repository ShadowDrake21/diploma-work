import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { ProfileProjectsComponent } from '../../../../shared/components/profile-projects/profile-projects.component';
import { UserService } from '@core/services/user.service';
import { catchError, of } from 'rxjs';
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
  projects = signal<ProjectDTO[]>([]);

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

  socialLinks = [
    { url: 'www.x.com', name: 'X (formerly Twitter)' },
    { url: 'www.instagram.com', name: 'Instagram' },
    { url: 'www.linkedin.com', name: 'LinkedIn' },
  ];

  constructor() {
    effect(() => {
      const user = this.user();
      if (user) {
        this.loadProjects(user.id);
      }
    });
  }

  private loadProjects(userId: number): void {
    this.userService
      .getProjectsWithDetails(userId)
      .pipe(catchError(() => of([] as ProjectDTO[])))
      .subscribe((projects) => {
        this.projects.set(projects);
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }
}
