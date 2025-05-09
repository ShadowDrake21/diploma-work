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
export class ProjectGeneralInformationComponent implements OnInit {
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
    this.uploadedFiles = this.existingFiles() || [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entityTypeSig']) {
      console.log(
        'ngOnChanges in ProjectGeneralInformationComponent',
        this.entityType()?.toLowerCase()
      );
    }
    if (changes['existingFilesSig']) {
      console.log(
        'existingFilesSig in ProjectGeneralInformationComponent',
        this.existingFiles()
      );
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

    this.attachmentsService
      .uploadFiles(this.entityType()!, entityId, this.pendingFiles)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Add to uploaded files
            this.uploadedFiles = [
              ...this.uploadedFiles,
              ...response.data.map((url) =>
                this.createFileMetadata(url, entityId)
              ),
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
    } else {
      const file = this.uploadedFiles[index];
      this.attachmentsService.deleteFile(file.fileName).subscribe(() => {
        this.uploadedFiles.splice(index, 1);
        this.updateFormControl();
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
    const routeId = this.route.snapshot.paramMap.get('id');
    if (routeId) return routeId;

    return 'temp-' + Math.random().toString(36).substring(2);
  }

  private createFileMetadata(url: string, entityId: string): FileMetadataDTO {
    return {
      fileUrl: url,
      fileName: url.split('/').pop() || '',
      entityType: this.entityType()!,
      entityId: entityId,
      uploadedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS'),
      // Add other required properties from FileMetadataDTO
      id: '', // You might need to generate this or get from backend
      fileSize: 0, // You can get this from the File object if available
    };
  }
}
