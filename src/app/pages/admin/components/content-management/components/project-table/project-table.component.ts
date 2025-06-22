import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AttachmentsService } from '@core/services/attachments.service';
import { ProjectService } from '@core/services/project/models/project.service';
import { FileMetadataDTO } from '@models/file.model';
import { ProjectDTO } from '@models/project.model';
import { Tag } from '@models/tag.model';
import { FileSizePipe } from '@pipes/file-size.pipe';
import { TruncateTextPipe } from '@pipes/truncate-text.pipe';
import { Pagination } from '@shared/types/util.types';
import { ProjectEditModalComponent } from './components/project-edit-modal/project-edit-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ProjectFormService } from '@core/services/project/project-form/project-form.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfirmationDialogComponent } from '@shared/components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from '@core/services/notification.service';
import { ProjectTypeNamePipe } from './pipes/project-type-name.pipe';
import { ProjectProgressColorPipe } from './pipes/project-progress-color.pipe';
import { Subject, takeUntil } from 'rxjs';

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
    ProjectTypeNamePipe,
    ProjectProgressColorPipe,
    TruncateTextPipe,
  ],
  templateUrl: './project-table.component.html',
})
export class ProjectTableComponent implements OnInit, OnDestroy {
  private readonly projectService = inject(ProjectService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly dialog = inject(MatDialog);
  private readonly submissionService = inject(ProjectFormService);
  private readonly notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  projects = signal<
    (ProjectDTO & { tags?: Tag[]; attachments?: FileMetadataDTO[] })[]
  >([]);
  isLoading = signal(false);
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
    this.isLoading.set(true);
    this.projectService
      .getAllProjects(this.pagination().page, this.pagination().size)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const projects = response.data || [];
          this.projects.set(projects);
          this.pagination.update((p) => ({
            ...p,
            total: response.totalItems,
          }));

          projects.forEach((project) => {
            this.loadAttachmentsForProject(project);
          });
        },
        error: (error) => {
          this.notificationService.showError('Не вдалося завантажити проекти');
          console.error('Error loading projects:', error);
          this.projects.set([]);
        },
        complete: () => this.isLoading.set(false),
      });
  }

  private loadAttachmentsForProject(
    project: ProjectDTO & { attachments?: FileMetadataDTO[] }
  ) {
    this.attachmentsService
      .getFilesByEntity(project.type, project.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (attachments) => {
          project.attachments = attachments;
        },
        error: (error) => {
          console.error(
            `Error loading attachments for project ${project.id}:`,
            error
          );
          project.attachments = [];
        },
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

  editProject(project: ProjectDTO) {
    const dialogRef = this.dialog.open(ProjectEditModalComponent, {
      width: '600px',
      data: { project },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading.set(true);
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
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.notificationService.showSuccess('Проєкт успішно оновлено');
              this.loadProjects();
            },
            error: (error) => {
              this.notificationService.showError('Не вдалося оновити проєкт');
              console.error('Error updating project:', error);
              this.isLoading.set(false);
            },
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
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.isLoading.set(true);
        this.projectService
          .deleteProject(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.notificationService.showSuccess('Проєкт успішно видалено');
              this.loadProjects();
            },
            error: (error) => {
              const errorMessage =
                error.status === 403
                  ? 'У вас немає дозволу на видалення цього проєкту'
                  : 'Не вдалося видалити проєкт';
              this.notificationService.showError(errorMessage);
              console.error('Error deleting project:', error);
              this.isLoading.set(false);
            },
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
