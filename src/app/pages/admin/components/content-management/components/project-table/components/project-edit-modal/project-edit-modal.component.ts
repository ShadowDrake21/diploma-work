import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  Inject,
  inject,
  OnInit,
  signal,
  WritableSignal,
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
import { FileHandlerService } from '@core/services/files/file-handler.service';
import { ProjectFormService } from '@core/services/project/project-form/project-form.service';
import { TagService } from '@core/services/project/models/tag.service';
import { FileMetadataDTO } from '@models/file.model';
import { ProjectDTO, UpdateProjectRequest } from '@models/project.model';
import { Tag } from '@models/tag.model';
import { FileSizePipe } from '@pipes/file-size.pipe';
import { finalize } from 'rxjs';
import { FileHandlerFacadeService } from '@core/services/files/file-handler-facade.service';
import { FileUploadListComponent } from '../../../../../../../projects/components/create/components/project-general-information/components/file-upload-list/file-upload-list.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    FileSizePipe,
    FileUploadListComponent,
  ],
  templateUrl: './project-edit-modal.component.html',
  styleUrl: './project-edit-modal.component.scss',
})
export class ProjectEditModalComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly tagService = inject(TagService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly fileHandler = inject(FileHandlerFacadeService);
  private readonly dialogRef = inject(MatDialogRef<ProjectEditModalComponent>);
  private readonly projectFormService = inject(ProjectFormService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { project: ProjectDTO }) {
    this.projectFormService.patchGeneralInformationForm(
      this.projectForm,
      this.data.project
    );
  }

  projectForm = this.projectFormService.createGeneralInfoForm();
  allTags = signal<Tag[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadTags();
    this.loadAttachments();
    this.setupFormListeners();
  }

  private setupFormListeners(): void {
    // Listen to tags changes
    this.projectForm.controls.tags.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tags) => {
        console.log('Tags changed:', tags);
        // You can add additional logic here when tags change
      });

    // Optionally listen to other form changes
    this.projectForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((values) => {
        console.log('Form values changed:', values);
      });
  }

  private loadTags() {
    this.tagService.getAllTags().subscribe((tags) => {
      this.allTags.set(tags);
    });
  }

  private loadAttachments(): void {
    this.attachmentsService
      .getFilesByEntity(this.data.project.type, this.data.project.id)
      .subscribe((attachments) => {
        this.fileHandler.initialize(attachments);
      });
  }

  onFilesSelected(files: File[]): void {
    this.fileHandler.onFilesSelected(files);
  }

  uploadFiles(): void {
    this.fileHandler
      .uploadFiles(this.data.project.type, this.data.project.id)
      .subscribe({
        next: (result) => this.fileHandler.handleUploadSuccess(result.files),

        error: (error) => console.error('Upload failed:', error),
      });
  }

  removeFile(index: number, isPending: boolean): void {
    this.fileHandler.removeFile(index, isPending).subscribe({
      error: (error) => console.error('Error deleting file:', error),
    });
  }

  compareTags(tag1: string, tag2: string): boolean {
    return tag1 === tag2;
  }

  onSubmit(): void {
    if (this.projectForm.invalid) return;

    this.isLoading.set(true);
    const formValue = this.projectForm.value;

    const updateData: UpdateProjectRequest = {
      title: formValue.title || '',
      description: formValue.description || '',
      tagIds: formValue.tags || [],
      progress: formValue.progress || 0,
    };

    if (this.pendingFiles.length > 0) {
      this.fileHandler
        .uploadFiles(this.data.project.type, this.data.project.id)
        .pipe(
          finalize(() => {
            this.isLoading.set(false);
            if (!this.fileHandler.isUploading()) {
              this.dialogRef.close(updateData);
            }
          })
        )
        .subscribe({
          next: (result) => this.fileHandler.handleUploadSuccess(result.files),
          error: (error) => {
            console.error('Upload failed:', error);
            this.dialogRef.close(updateData);
          },
        });
    } else {
      this.isLoading.set(false);
      this.dialogRef.close(updateData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
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
