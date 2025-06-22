import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  Inject,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule, MatSliderThumb } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AttachmentsService } from '@core/services/attachments.service';
import { ProjectFormService } from '@core/services/project/project-form/project-form.service';
import { TagService } from '@core/services/project/models/tag.service';
import { FileMetadataDTO } from '@models/file.model';
import { ProjectDTO, UpdateProjectRequest } from '@models/project.model';
import { Tag } from '@models/tag.model';
import { finalize } from 'rxjs';
import { FileHandlerFacadeService } from '@core/services/files/file-handler-facade.service';
import { FileUploadListComponent } from '@pages/projects/components/create/components/project-general-information/components/file-upload-list/file-upload-list.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '@core/services/notification.service';
import { LoaderComponent } from '@shared/components/loader/loader.component';

@Component({
  selector: 'app-project-edit-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSliderModule,
    MatDatepickerModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSliderThumb,
    FileUploadListComponent,
    LoaderComponent,
  ],
  templateUrl: './project-edit-modal.component.html',
})
export class ProjectEditModalComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly tagService = inject(TagService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly fileHandler = inject(FileHandlerFacadeService);
  private readonly dialogRef = inject(MatDialogRef<ProjectEditModalComponent>);
  private readonly projectFormService = inject(ProjectFormService);
  private readonly notificationService = inject(NotificationService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { project: ProjectDTO }) {
    this.projectFormService.patchGeneralInformationForm(
      this.projectForm,
      this.data.project
    );
  }

  projectForm = this.projectFormService.createGeneralInfoForm();
  allTags = signal<Tag[]>([]);
  isLoading = signal(false);
  errorState = signal({
    tags: false,
    attachments: false,
    submit: false,
  });

  ngOnInit(): void {
    this.loadTags();
    this.loadAttachments();
    this.setupFormListeners();
  }

  private setupFormListeners(): void {
    this.projectForm.controls.tags.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tags) => console.log('Tags changed:', tags),
        error: (error) => {
          console.error('Error in tags value changes:', error);
          this.errorState.update((state) => ({ ...state, tags: true }));
        },
      });

    this.projectForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (values) => console.log('Form values changed:', values),
        error: (error) => {
          console.error('Error in form value changes:', error);
          this.errorState.update((state) => ({ ...state, submit: true }));
        },
      });
  }

  private loadTags() {
    this.tagService
      .getAllTags()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tags) => {
          this.allTags.set(tags);
        },
        error: (error) => {
          console.error('Error loading tags:', error);
          this.notificationService.showError('Не вдалося завантажити теги');
          this.errorState.update((state) => ({ ...state, tags: true }));
        },
      });
  }

  private loadAttachments(): void {
    this.attachmentsService
      .getFilesByEntity(this.data.project.type, this.data.project.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (attachments) => {
          this.fileHandler.initialize(attachments);
        },
        error: (error) => {
          console.error('Error loading attachments:', error);
          this.notificationService.showError(
            'Не вдалося завантажити вкладення'
          );
          this.errorState.update((state) => ({ ...state, attachments: true }));
        },
      });
  }

  onFilesSelected(files: File[]): void {
    try {
      this.fileHandler.onFilesSelected(files);
    } catch (error) {
      console.error('Error selecting files:', error);
      this.notificationService.showError('Не вдалося вибрати файли');
    }
  }

  uploadFiles(): void {
    this.fileHandler
      .uploadFiles(this.data.project.type, this.data.project.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.fileHandler.handleUploadSuccess(result.files);
          this.notificationService.showSuccess('Файли успішно завантажено');
        },

        error: (error) => {
          console.error('Upload failed:', error);
          this.notificationService.showError(
            error.status === 413
              ? 'Розмір файлу перевищує ліміт'
              : 'Не вдалося завантажити файли'
          );
        },
      });
  }

  removeFile(index: number, isPending: boolean): void {
    this.fileHandler
      .removeFile(index, isPending)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () =>
          this.notificationService.showSuccess('Файл успішно видалено'),
        error: (error) => {
          console.error('Error deleting file:', error);
          this.notificationService.showError('Не вдалося видалити файл');
        },
      });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.notificationService.showError(
        'Будь ласка, заповніть усі обовʼязкові поля'
      );
      return;
    }

    this.isLoading.set(true);
    this.errorState.update((state) => ({ ...state, submit: false }));
    const formValue = this.projectForm.value;

    const updateData: UpdateProjectRequest = {
      title: formValue.title || '',
      description: formValue.description || '',
      tagIds: formValue.tags || [],
      progress: formValue.progress || 0,
    };

    const handleFinalize = () => {
      this.isLoading.set(false);
      if (!this.fileHandler.isUploading()) {
        this.dialogRef.close(updateData);
      }
    };

    if (this.pendingFiles.length > 0) {
      this.fileHandler
        .uploadFiles(this.data.project.type, this.data.project.id)
        .pipe(takeUntilDestroyed(this.destroyRef), finalize(handleFinalize))
        .subscribe({
          next: (result) => {
            this.fileHandler.handleUploadSuccess(result.files);
            this.notificationService.showSuccess('Проєкт успішно завантажено');
          },
          error: (error) => {
            console.error('Upload failed:', error);
            this.notificationService.showError(
              error.status === 413
                ? 'Розмір файлу перевищує ліміт'
                : 'Не вдалося завантажити файли'
            );
            this.errorState.update((state) => ({ ...state, submit: true }));
          },
        });
    } else {
      this.notificationService.showSuccess('Проєкт успішно оновлено');
      handleFinalize();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  compareTags(tag1: string, tag2: string): boolean {
    return tag1 === tag2;
  }

  get uploadedFiles(): FileMetadataDTO[] {
    return this.fileHandler.uploadedFiles();
  }
  get pendingFiles(): File[] {
    return this.fileHandler.pendingFiles();
  }
  get isUploading(): boolean {
    return this.fileHandler.isUploading();
  }
  get uploadProgress(): number {
    return this.fileHandler.uploadProgress();
  }
}
