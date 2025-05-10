import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSliderModule } from '@angular/material/slider';
import { TagService } from '@core/services/tag.service';
import { finalize, tap } from 'rxjs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { FileMetadataDTO } from '@models/file.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectType } from '@shared/enums/categories.enum';
import { ActivatedRoute } from '@angular/router';
import { FileHandlerService } from '@core/services/file-handler.service';
import { GeneralInformationForm } from '@shared/types/project-form.types';
import { FileUploadListComponent } from './components/file-upload-list/file-upload-list.component';

@Component({
  selector: 'create-project-general-information',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatSliderModule,
    MatDatepickerModule,
    MatListModule,
    MatIconModule,
    FileUploadListComponent,
  ],
  templateUrl: './project-general-information.component.html',
  styleUrl: './project-general-information.component.scss',
})
export class ProjectGeneralInformationComponent implements OnInit {
  private tagService = inject(TagService);
  private fileHandler = inject(FileHandlerService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  generalInformationForm = input.required<FormGroup<GeneralInformationForm>>();
  entityType = input.required<ProjectType | null | undefined>();
  existingFiles = input.required<FileMetadataDTO[] | null | undefined>();

  // State
  readonly tags$ = this.tagService.getAllTags();
  readonly uploadProgress = signal(0);
  readonly isUploading = signal(false);
  readonly uploadedFiles = signal<FileMetadataDTO[]>([]);
  readonly pendingFiles = signal<File[]>([]);

  ngOnInit(): void {
    this.updateAttachmentsList();

    this.generalInformationForm()
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateAttachmentsList());
  }

  private updateAttachmentsList(): void {
    const currentAttachments =
      this.generalInformationForm().controls.attachments.value || [];

    this.uploadedFiles.set(
      currentAttachments.filter(
        (file): file is FileMetadataDTO => !this.isFile(file)
      )
    );

    this.pendingFiles.set(
      currentAttachments.filter((file): file is File => this.isFile(file))
    );
  }

  onFilesSelected(files: File[]): void {
    const uniqueNewFiles = this.filterDuplicateFiles(files);

    if (uniqueNewFiles.length === 0) return;

    this.pendingFiles.update((files) => [...files, ...uniqueNewFiles]);
    this.updateFormControl();
  }

  private updateFormControl(): void {
    this.generalInformationForm().controls.attachments.setValue([
      ...this.uploadedFiles(),
      ...this.pendingFiles(),
    ]);
  }

  private filterDuplicateFiles(newFiles: File[]): File[] {
    const currentFiles = [...this.uploadedFiles(), ...this.pendingFiles()];

    const existingFileKeys = new Set(
      currentFiles.map((file) => this.getFileKey(file))
    );

    return newFiles.filter(
      (file) => !existingFileKeys.has(this.getFileKey(file))
    );
  }

  compareTags(tagId1: string, tagId2: string): boolean {
    return tagId1 === tagId2;
  }

  uploadFiles(): void {
    const filesToUpload = this.pendingFiles();
    const entityType = this.entityType();
    const entityId = this.getEntityId();

    if (!filesToUpload.length || !entityType || !entityId) {
      console.warn('Cannot upload files - no files or entity type.');
      return;
    }

    this.isUploading.set(true);
    this.uploadProgress.set(0);

    this.fileHandler
      .uploadFiles(entityType, entityId, filesToUpload)
      .pipe(
        tap(({ progress }) => {
          console.log('Upload progress:', progress);
          this.uploadProgress.set(progress);
        }),
        finalize(() => {
          console.log('Upload completed ');
          this.isUploading.set(false);
        })
      )
      .subscribe({
        next: ({ files }) => {
          console.log('Upload response received:', files);
          if (files && files.length > 0) {
            console.log('Processing successful upload...');
            const newUploadedFiles = [...this.uploadedFiles(), ...files];
            this.uploadedFiles.set(newUploadedFiles);
            this.pendingFiles.set([]);

            this.generalInformationForm().controls.attachments.setValue([
              ...newUploadedFiles,
              ...this.pendingFiles(),
            ]);
            console.log('Updated uploadedFiles:', this.uploadedFiles());
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Upload failed:', error);
        },
      });
  }

  removeFile(index: number, isPending: boolean): void {
    if (isPending) {
      this.pendingFiles.update((files) => files.filter((_, i) => i !== index));
    } else {
      const file = this.uploadedFiles()[index];

      this.fileHandler.deleteFile(file).subscribe({
        next: () => {
          this.uploadedFiles.update((files) =>
            files.filter((_, i) => i !== index)
          );
          this.updateFormControl();
        },
        error: (err) => console.error('Error deleting file:', err),
      });
    }
    this.updateFormControl();
  }

  isFile(file: any): file is File {
    return file instanceof File;
  }

  private getEntityId(): string {
    return this.route.snapshot.queryParamMap.get('id') || '';
  }

  private getFileKey(file: File | FileMetadataDTO): string {
    if (this.isFile(file)) {
      return `${file.name}-${file.size}-${file.lastModified}`;
    }
    return `${file.fileName}-${file.fileUrl}`;
  }
}
