import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'details-patent',
  imports: [DatePipe],
  templateUrl: './patent.component.html',
  styleUrl: './patent.component.scss',
})
export class PatentComponent {
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
