import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ProjectService } from '@core/services/project.service';
import { PublicationService } from '@core/services/publication.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'details-publication',
  imports: [DatePipe, AsyncPipe],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.scss',
})
export class PublicationComponent implements OnInit {
  private projectService = inject(ProjectService);
  private publicationService = inject(PublicationService);

  @Input({ required: true })
  id!: string;

  publication$!: Observable<any>;

  ngOnInit(): void {
    this.publication$ = this.projectService.getPublicationByProjectId(this.id!);

    this.publication$.subscribe((publication) => {
      console.log('publication', publication);
    });
  }

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
