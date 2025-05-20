import { CommonModule } from '@angular/common';
import {
  Component,
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
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AttachmentsService } from '@core/services/attachments.service';
import { FileHandlerService } from '@core/services/file-handler.service';
import { ProjectFormService } from '@core/services/project-form.service';
import { TagService } from '@core/services/tag.service';
import { FileMetadataDTO } from '@models/file.model';
import { ProjectDTO, UpdateProjectRequest } from '@models/project.model';
import { Tag } from '@models/tag.model';
import { FileSizePipe } from '@pipes/file-size.pipe';
import { finalize } from 'rxjs';

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
    FileSizePipe,
  ],
  templateUrl: './project-edit-modal.component.html',
  styleUrl: './project-edit-modal.component.scss',
})
export class ProjectEditModalComponent implements OnInit {
  private tagService = inject(TagService);
  private attachmentsService = inject(AttachmentsService);
  private fileHandlerService = inject(FileHandlerService);
  private dialogRef = inject(MatDialogRef<ProjectEditModalComponent>);
  private projectFormService = inject(ProjectFormService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { project: ProjectDTO }) {
    this.projectFormService.patchGeneralInformationForm(
      this.projectForm,
      this.data.project
    );
  }

  projectForm = this.projectFormService.createGeneralInfoForm();
  allTags: WritableSignal<Tag[]> = signal([]);
  attachments: WritableSignal<FileMetadataDTO[]> = signal([]);
  isLoading = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);

  ngOnInit(): void {
    this.loadTags();
    this.loadAttachments();
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
        this.attachments.set(attachments);
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.isUploading.set(true);
      this.uploadProgress.set(0);

      this.fileHandlerService
        .uploadFiles(
          this.data.project.type,
          this.data.project.id,
          Array.from(input.files)
        )
        .pipe(finalize(() => this.isUploading.set(false)))
        .subscribe({
          next: (result) => {
            this.uploadProgress.set(result.progress);
            if (result.files.length > 0) {
              this.attachments.update((current) => [
                ...current,
                ...result.files,
              ]);
            }
          },
          error: (error) => console.error('Upload failed:', error),
        });
    }
  }

  removeAttachment(index: number): void {
    const file = this.attachments()[index];
    this.fileHandlerService.deleteFile(file).subscribe({
      next: () => {
        this.attachments.update((current) =>
          current.filter((_, i) => i !== index)
        );
      },
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
      title: formValue.title,
      description: formValue.description,
      tagIds: formValue.tags,
      progress: formValue.progress,
    };

    this.dialogRef.close(updateData);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
