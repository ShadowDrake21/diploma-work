import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ProjectService } from '@core/services/project.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'details-patent',
  imports: [DatePipe, AsyncPipe],
  templateUrl: './patent.component.html',
  styleUrl: './patent.component.scss',
})
export class PatentComponent {
  private projectService = inject(ProjectService);

  @Input({ required: true })
  id!: string;

  patent$!: Observable<any>;

  ngOnInit(): void {
    this.patent$ = this.projectService.getPatentByProjectId(this.id!);

    this.patent$.subscribe((patent) => {
      console.log('patent', patent);
    });
  }

  patents = [
    {
      id: 'pat-001',
      primaryAuthor: 'Dr. Emily Brown',
      coInventors: ['Prof. Liam Wilson', 'Dr. Mia Davis'],
      registrationNumber: 'US1234567B2',
      registrationDate: new Date('2021-05-10'),
      issuingAuthority: 'United States Patent and Trademark Office',
    },
    {
      id: 'pat-002',
      primaryAuthor: 'Dr. Oliver Green',
      coInventors: [],
      registrationNumber: 'EP9876543A1',
      registrationDate: new Date('2020-11-01'),
      issuingAuthority: 'European Patent Office',
    },
  ];
}
