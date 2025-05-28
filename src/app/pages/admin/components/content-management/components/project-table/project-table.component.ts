import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminService } from '@core/services/admin.service';
import { AttachmentsService } from '@core/services/attachments.service';
import { PatentService } from '@core/services/project/models/patent.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { PublicationService } from '@core/services/project/models/publication.service';
import { ResearchService } from '@core/services/project/models/research.service';
import { TagService } from '@core/services/project/models/tag.service';
import { FileMetadataDTO } from '@models/file.model';
import {
  ProjectDTO,
  ProjectWithDetails,
  ProjectWithPatent,
  ProjectWithPublication,
  ProjectWithResearch,
} from '@models/project.model';
import { Tag } from '@models/tag.model';
import { FileSizePipe } from '@pipes/file-size.pipe';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { ProjectType } from '@shared/enums/categories.enum';
import { Pagination } from '@shared/types/util.types';
import { ProjectEditModalComponent } from './components/project-edit-modal/project-edit-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ProjectFormService } from '@core/services/project/project-form/project-form.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-project-table',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatChipsModule,
    MatListModule,
    FileSizePipe,
    DatePipe,
    TruncateTextPipe,
    TitleCasePipe,
  ],
  templateUrl: './project-table.component.html',
  styleUrl: './project-table.component.scss',
})
export class ProjectTableComponent implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly dialog = inject(MatDialog);
  private readonly submissionService = inject(ProjectFormService);

  projects = signal<
    (ProjectDTO & { tags?: Tag[]; attachments?: FileMetadataDTO[] })[]
  >([]);
  displayedColumns: string[] = [
    'title',
    'type',
    'description',
    'progress',
    'attachments',
    'creator',
    'createdAt',
    'actions',
  ];

  pagination = signal<Pagination>({
    page: 0,
    size: 10,
    total: 0,
  });

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService
      .getAllProjects(this.pagination().page, this.pagination().size)
      .subscribe((response) => {
        const projects = response.data;

        projects.forEach((project) => {
          this.loadAttachmentsForProject(project);
        });

        this.projects.set(projects);
        this.pagination.set({
          ...this.pagination(),
          total: response.totalItems,
        });
      });
  }

  private loadAttachmentsForProject(
    project: ProjectDTO & { attachments?: FileMetadataDTO[] }
  ) {
    this.attachmentsService
      .getFilesByEntity(project.type, project.id)
      .subscribe((attachments) => {
        project.attachments = attachments;
      });
  }

  onPageChange(event: PageEvent) {
    this.pagination.set({
      page: event.pageIndex,
      size: event.pageSize,
      total: this.pagination().total,
    });
    this.loadProjects();
  }

  getProjectTypeName(type: ProjectType): string {
    return ProjectType[type];
  }

  getProgressColor(progress: number): string {
    if (progress < 50) {
      return 'warn';
    } else if (progress < 80) {
      return 'accent';
    } else {
      return 'primary';
    }
  }

  editProject(project: ProjectDTO) {
    const dialogRef = this.dialog.open(ProjectEditModalComponent, {
      width: '600px',
      data: { project },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.submissionService
          .submitForm(
            new FormGroup({
              type: new FormControl(project.type),
            }),
            new FormGroup({
              title: new FormControl(result.title),
              description: new FormControl(result.description),
              progress: new FormControl(result.progress),
              tags: new FormControl(result.tagIds),
              attachments: new FormControl(result.attachments || []),
            }),
            null,
            project.id,
            project.createdBy,
            []
          )
          .subscribe({
            next: () => this.loadProjects(),
            error: (error) => console.error('Error updating project:', error),
          });
      }
    });
  }

  deleteProject(id: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        message:
          'Ви впевнені, що хочете видалити цей проєкт? Цю дію не можна скасувати.',
        // Are you sure you want to delete this project? This action cannot be undone.
      },
    });
    const sub = dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.projectService.deleteProject(id).subscribe({
          next: () => this.loadProjects(),
          error: (error) => console.error('Error deleting project:', error),
        });
      }
    });
  }
}
