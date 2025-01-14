import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'details-research-project',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './research-project.component.html',
  styleUrl: './research-project.component.scss',
})
export class ResearchProjectComponent {
  researchProjects = [
    {
      id: 'proj-001',
      participants: ['Dr. Ava Taylor', 'Dr. Ethan White'],
      budget: 50000,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      status: 'In Progress',
      fundingSource: 'National Science Foundation',
    },
    {
      id: 'proj-002',
      participants: ['Dr. Sophia King', 'Dr. Noah Scott'],
      budget: 75000,
      startDate: new Date('2023-06-01'),
      endDate: new Date('2024-05-31'),
      status: 'Completed',
      fundingSource: 'European Research Council',
    },
  ];
}
