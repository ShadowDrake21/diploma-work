import { Component, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule, LowerCasePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardRecentProjectItemModal } from '@shared/types/dashboard.types';
import { Project, ProjectItem } from '@shared/types/project.types';

@Component({
  selector: 'shared-project-card',
  imports: [MatProgressBarModule, CommonModule, RouterLink, TitleCasePipe],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss',
})
export class ProjectCardComponent {
  projectSig = input.required<Project>({
    alias: 'project',
  });
}
