import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MultipleFileUploadComponent } from '@shared/components/multiple-file-upload/multiple-file-upload.component';
import { AVAILABLE_PROJECT_TAGS } from '@content/projects.content';
import { MatSliderModule } from '@angular/material/slider';
import { TagService } from '@core/services/tag.service';
import { Observable, Subscription } from 'rxjs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { FileMetadataDTO } from '@models/file.model';
import { FileSizePipe } from '@pipes/file-size.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AttachmentsService } from '@core/services/attachments.service';
import { ProjectType } from '@shared/enums/categories.enum';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ActivatedRoute } from '@angular/router';
import { format } from 'date-fns';

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
    MultipleFileUploadComponent,
    MatAutocompleteModule,
    MatSliderModule,
    MatDatepickerModule,
    MatListModule,
    MatIconModule,
    FileSizePipe,
    MatProgressBar,
  ],
  templateUrl: './project-general-information.component.html',
  styleUrl: './project-general-information.component.scss',
})
export class ProjectGeneralInformationComponent implements OnInit, OnChanges {
  private tagService = inject(TagService);
  private attachmentsService = inject(AttachmentsService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  generalInformationForm = input.required<
    FormGroup<{
      title: FormControl<string | null>;
      description: FormControl<string | null>;
      progress: FormControl<number | null>;
      tags: FormControl<string[] | null>;
      attachments: FormControl<(File | FileMetadataDTO)[] | null>;
    }>
  >();

  entityType = input.required<ProjectType | null | undefined>();
  existingFiles = input.required<FileMetadataDTO[] | null | undefined>();
  tags$!: Observable<any>;

  isFilesReseted: boolean = false;

  uploadedFiles: FileMetadataDTO[] = [];
  pendingFiles: File[] = [];
  uploadProgress = 0;
  isUploading = false;

  ngOnInit(): void {
    this.tags$ = this.tagService.getAllTags();
    this.updateFileList();

    this.generalInformationForm()
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateFileList();
      });
  }

  private updateFileList(): void {
    const currentAttachments =
      this.generalInformationForm().controls.attachments.value || [];

    const validAttachments = currentAttachments.filter((item) => !!item);

    this.uploadedFiles = (currentAttachments || []).filter(
      (file): file is FileMetadataDTO => !this.isFileType(file)
    );
    this.pendingFiles = (currentAttachments || []).filter(
      (file): file is File => this.isFileType(file)
    );

    console.log('Updated file lists:', {
      attachments: currentAttachments,
      uploaded: this.uploadedFiles,
      pending: this.pendingFiles,
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['generalInformationForm']) {
      const currentAttachments =
        this.generalInformationForm().controls.attachments.value;
      this.uploadedFiles = (currentAttachments || []).filter(
        (file): file is FileMetadataDTO => !(file instanceof File)
      );
      this.pendingFiles = (currentAttachments || []).filter(
        (file): file is File => file instanceof File
      );

      console.log('Current attachments:', currentAttachments);
      console.log('Uploaded files:', this.uploadedFiles);
      console.log('Pending files:', this.pendingFiles);
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const newFiles = Array.from(input.files);

    // Filter out duplicates by name
    const uniqueNewFiles = newFiles.filter(
      (newFile) =>
        !this.uploadedFiles.some((f) => f.fileName === newFile.name) &&
        !this.pendingFiles.some((f) => f.name === newFile.name)
    );

    this.pendingFiles = [...this.pendingFiles, ...uniqueNewFiles];
    this.updateFormControl();
    input.value = '';
  }

  private updateFormControl(): void {
    this.generalInformationForm().controls.attachments.setValue([
      ...this.uploadedFiles,
      ...this.pendingFiles,
    ]);
  }

  compareTags(tagId1: string, tagId2: string): boolean {
    return tagId1 === tagId2;
  }

  uploadFiles(): void {
    if (!this.pendingFiles.length || !this.entityType()) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    // Get the entity ID from the route or create a temporary one
    const entityId = this.getEntityId();

    if (!entityId) {
      console.warn('Cannot upload files - no project ID yet.');
      return;
    }

    this.attachmentsService
      .uploadFiles(this.entityType()!, entityId, this.pendingFiles)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          console.log('Upload response:', response);
          if (response.success && response.data) {
            const uploadedUrls = Array.isArray(response.data)
              ? response.data
              : [response.data];
            // Add to uploaded files
            this.uploadedFiles = [
              ...this.uploadedFiles,
              ...response.data
                .filter((url) => !!url)
                .map((url) => this.createFileMetadata(url, entityId)),
            ];
            this.pendingFiles = [];
            this.updateFormControl();
          }
          this.isUploading = false;
        },
        error: (error) => {
          console.error('Upload failed:', error);
          this.isUploading = false;
        },
      });
  }

  handleNewFiles(newFiles: File[]): void {
    const currentFiles =
      this.generalInformationForm().controls.attachments.value || [];

    // Create a Set of existing file keys for quick lookup
    const existingFileKeys = new Set<string>();
    currentFiles.forEach((file) => {
      if (file instanceof File) {
        existingFileKeys.add(this.getFileKey(file));
      } else {
        existingFileKeys.add(`${file.fileName}-${file.fileUrl}`);
      }
    });

    // Filter out duplicates
    const uniqueNewFiles = newFiles.filter(
      (file) => !existingFileKeys.has(this.getFileKey(file))
    );

    if (uniqueNewFiles.length === 0) return;

    // Update form control
    this.generalInformationForm().controls.attachments.setValue([
      ...currentFiles,
      ...uniqueNewFiles,
    ]);
  }

  private getFileKey(file: File | FileMetadataDTO): string {
    if (file instanceof File) {
      return `${file.name}-${file.size}-${file.lastModified}`;
    }
    return `${file.fileName}-${file.fileUrl}`;
  }

  removeFile(index: number, isPending: boolean): void {
    if (isPending) {
      this.pendingFiles.splice(index, 1);
      this.updateFormControl();
    } else {
      const file = this.uploadedFiles[index];

      this.attachmentsService
        .deleteFile(
          file.entityType.toString().toLowerCase(),
          file.entityId,
          file.fileName
        )
        .subscribe({
          next: () => {
            this.uploadedFiles.splice(index, 1);
            this.updateFormControl();
          },
          error: (err) => {
            console.error('Error deleting file:', err);
          },
        });
    }
    this.updateFormControl();
  }

  onResetFiles(): void {
    this.generalInformationForm().controls.attachments.setValue([]);
    this.isFilesReseted = true;
  }

  isFileType(file: any): file is File {
    return file instanceof File;
  }

  private getEntityId(): string {
    const routeId = this.route.snapshot.queryParamMap.get('id');
    if (routeId) return routeId;

    return '';
  }

  private loadExistingAttachments(): void {
    console.log(
      'Loading existing attachments for entity type:',
      this.generalInformationForm().value
    );
  }

  // TODO: Updating with existing files!!!!

  private createFileMetadata(url: string, entityId: string): FileMetadataDTO {
    const fileName = url.split('/').pop() || '';

    return {
      fileUrl: url,
      fileName,
      entityType: this.entityType()!,
      entityId: entityId,
      uploadedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS'),
      id: '',
      fileSize: 0,
      checksum: '',
    };
  }
}
