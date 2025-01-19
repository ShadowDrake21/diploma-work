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
import { ProjectCardComponent } from '../../../../shared/components/project-card/project-card.component';
import { CommentComponent } from '../../../../shared/components/comment/comment.component';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { TitleCasePipe } from '@angular/common';
import { userComments } from '@content/userComments.content';

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

  workId: number | null = null;
  work: DashboardRecentProjectItemModal | undefined = undefined;
  comment = userComments[0];
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.workId = +params['id'];
    });

    this.getWorkById();
  }

  getWorkById() {
    if (!this.workId) return;

    this.work = recentProjectModalContent.find(
      (work) => work.id === this.workId
    );

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
