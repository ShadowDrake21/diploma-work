import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { recentProjectModalContent } from '@content/recentProjects.content';
import { DashboardRecentProjectItemModal } from '@shared/types/dashboard.types';
import { PublicationComponent } from './types/publication/publication.component';
import { ResearchProjectComponent } from './types/research-project/research-project.component';
import { PatentComponent } from './types/patent/patent.component';

import { HeaderService } from '@core/services/header.service';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { ProjectCardComponent } from '@shared/components/project-card/project-card.component';
import { CommentComponent } from '@shared/components/comment/comment.component';
import { TitleCasePipe } from '@angular/common';
import { userComments } from '@content/userComments.content';
import { PublicationService } from '@core/services/publication.service';
import { PatentService } from '@core/services/patent.service';
import { ResearchService } from '@core/services/research.service';
import { ProjectService } from '@core/services/project.service';
import { Project } from '@shared/types/project.types';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'project-details',
  imports: [
    PublicationComponent,
    ResearchProjectComponent,
    PatentComponent,
    MatButton,
    MatProgressBarModule,
    MatIcon,
    MatChipSet,
    MatChip,
    ProjectCardComponent,
    CommentComponent,
    TitleCasePipe,
  ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss',
})
export class ProjectDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private headerService = inject(HeaderService);
  private projectService = inject(ProjectService);
  private publicationService = inject(PublicationService);
  private patentService = inject(PatentService);
  private researchService = inject(ResearchService);

  workId: string | null = null;
  work: DashboardRecentProjectItemModal | undefined = undefined;
  comment = userComments[0];

  projectSub!: Observable<Project | undefined>;
  publicationSub!: Observable<any>;
  patentSub!: Observable<any>;
  researchSub!: Observable<any>;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.workId = params['id'];
      console.log('params', params);
    });

    this.getWorkById();
  }

  getWorkById() {
    if (!this.workId) return;

    this.projectSub = this.projectService.getProjectById(this.workId);

    this.projectSub.subscribe((project) => {
      console.log('project', project);
      if (project?.type === 'PUBLICATION') {
        console.log('publication');
        this.publicationSub = this.projectService.getPublicationByProjectId(
          this.workId!
        );

        this.publicationSub.subscribe((publication) => {
          console.log('publication', publication);
        });
      } else if (project?.type === 'PATENT') {
        console.log('patent');
        this.patentSub = this.projectService
          .getPatentByProjectId(this.workId!)
          .pipe(
            tap((patent) => {
              console.log('patent', patent);
            })
          );
      } else {
        console.log('research');
        this.researchSub = this.projectService
          .getResearchByProjectId(this.workId!)
          .pipe(
            tap((research) => {
              console.log('research', research);
            })
          );
      }
    });

    if (this.work) {
      const capitalizedType =
        this.work.type.charAt(0).toUpperCase() + this.work.type.slice(1);
      this.headerService.setTitle(
        `${capitalizedType}: ${this.work.projectTitle}`
      );
    } else {
      this.headerService.setTitle('Project Details');
    }
  }
}
