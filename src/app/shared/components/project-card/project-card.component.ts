import { Component, input } from '@angular/core';
import { ProjectItem } from '../../types/project.types';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'shared-project-card',
  imports: [MatProgressBarModule, CommonModule, RouterLink],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss',
})
export class ProjectCardComponent {
  projectSig = input.required<ProjectItem>({ alias: 'project' });
}
