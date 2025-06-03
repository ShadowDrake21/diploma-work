import { Component, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectDTO } from '@models/project.model';

@Component({
  selector: 'shared-project-card',
  imports: [MatProgressBarModule, CommonModule, RouterLink, TitleCasePipe],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss',
})
export class ProjectCardComponent {
  project = input.required<ProjectDTO>();
}
