import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'details-publication',
  imports: [DatePipe],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.scss',
})
export class PublicationComponent {
  publications = [
    {
      id: 'pub-001',
      authors: ['Alice Smith', 'Bob Johnson'],
      publicationDate: new Date('2023-06-15'),
      publicationSource: 'International Journal of Science',
      doiIsbn: '10.1234/abcd.2023.56789',
      startPage: 10,
      endPage: 25,
      journalVolume: 12,
      issueNumbers: 3,
    },
    {
      id: 'pub-002',
      authors: ['John Doe', 'Jane Doe'],
      publicationDate: new Date('2022-10-20'),
      publicationSource: 'Annual Conference on AI',
      doiIsbn: '978-1-2345-6789-0',
      startPage: 100,
      endPage: 120,
      journalVolume: 8,
      issueNumbers: 2,
    },
  ];
}
