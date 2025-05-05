import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ProjectService } from '@core/services/project.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'details-publication',
  imports: [DatePipe, AsyncPipe],
  templateUrl: './publication.component.html',
  styleUrl: './publication.component.scss',
})
export class PublicationComponent implements OnInit {
  private projectService = inject(ProjectService);

  @Input({ required: true })
  id!: string;

  publication$!: Observable<any>;

  ngOnInit(): void {
    this.publication$ = this.projectService.getPublicationByProjectId(this.id!);
  }
}
